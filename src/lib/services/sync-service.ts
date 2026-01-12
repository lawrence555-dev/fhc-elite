import prisma from "@/lib/prisma";

/**
 * 刪除超過 24 小時的分時數據，確保資料庫僅保留當日/最新數據。
 */
export async function cleanupOldIntradayData() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
        const result = await prisma.dailyPrice.deleteMany({
            where: {
                timestamp: {
                    lt: twentyFourHoursAgo
                }
            }
        });
        console.log(`Cleaned up ${result.count} old daily price records.`);
    } catch (e) {
        console.error("Cleanup failed:", e);
    }
}

export async function syncIntradayData(stockId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // Yahoo Finance Intraday API (5m interval for 5 days to handle weekends)
        const symbol = `${stockId}.TW`;
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=5d`);
        if (!res.ok) {
            console.error(`Yahoo API returned ${res.status} for ${symbol}`);
            return;
        }
        const data = await res.json();

        if (!data || !data.chart || !data.chart.result) {
            console.warn(`No data structure found for ${symbol}`);
            return;
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0].close;
        const volumes = result.indicators.quote[0].volume;

        if (timestamps && quotes) {
            // 首先確保 Stock 資料表中已有該股代號，否則會發生外鍵約束錯誤
            const stockName = (({
                "2880": "華南金", "2881": "富邦金", "2882": "國泰金", "2883": "開發金",
                "2884": "玉山金", "2885": "元大金", "2886": "兆豐金", "2887": "台新金",
                "2889": "國票金", "2890": "永豐金", "2891": "中信金", "2892": "第一金", "5880": "合庫金"
            }) as any)[stockId] || "金融股";

            await prisma.stock.upsert({
                where: { stockId },
                update: {},
                create: {
                    stockId,
                    name: stockName,
                    category: "民營"
                }
            });

            const dataToInsert = timestamps.map((ts: number, i: number) => ({
                stockId,
                timestamp: new Date(ts * 1000),
                price: quotes[i] || 0,
                volume: BigInt(volumes[i] || 0)
            })).filter((item: any) => {
                const isToday = item.timestamp.toDateString() === new Date().toDateString();
                return item.price > 0 && isToday;
            });

            console.log(`Syncing ${dataToInsert.length} points for ${stockId}...`);

            // 使用 Transaction 進行批次處理或逐條 Upsert
            // 由於 DailyPrice 加上了 @@unique([stockId, timestamp])，這裏可以使用 upsert
            await Promise.all(
                dataToInsert.map((item: any) =>
                    prisma.dailyPrice.upsert({
                        where: {
                            stockId_timestamp: {
                                stockId: item.stockId,
                                timestamp: item.timestamp
                            }
                        },
                        create: item,
                        update: {
                            price: item.price,
                            volume: item.volume
                        }
                    })
                )
            );

            return dataToInsert;
        }
    } catch (e) {
        console.error(`Failed to sync ${stockId}:`, e);
    }
}

export async function getIntradayPrices(stockId: string) {
    // 1. 先確認資料庫中最新的數據日期
    const latestRecord = await prisma.dailyPrice.findFirst({
        where: { stockId },
        orderBy: { timestamp: 'desc' }
    });

    // 2. 如果資料庫為空，或者最新數據不是今天的（且今天是交易日），則同步
    if (!latestRecord) {
        await syncIntradayData(stockId);
    }

    // 3. 再次查詢最新的數據日期
    const refreshedLatest = await prisma.dailyPrice.findFirst({
        where: { stockId },
        orderBy: { timestamp: 'desc' }
    });

    if (!refreshedLatest) return [];

    // 4. 僅抓取「今日」的分時數據
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prices = await prisma.dailyPrice.findMany({
        where: {
            stockId,
            timestamp: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        },
        orderBy: { timestamp: "asc" }
    });

    // 4. 固定交易時段：09:00 - 13:30 (每 5 分鐘一點，共 55 點)
    const timeline: any[] = [];
    const startHour = 9;
    const startMin = 0;
    const endHour = 13;
    const endMin = 30;

    let current = new Date(today);
    current.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(today);
    endTime.setHours(endHour, endMin, 0, 0);

    while (current <= endTime) {
        const timeStr = current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        // 尋找資料庫中是否有對應點 (容許 2 分鐘內的誤差)
        const match = prices.find(p => {
            const diff = Math.abs(p.timestamp.getTime() - current.getTime());
            return diff < 3 * 60 * 1000; // 3 分鐘內視為同一點
        });

        timeline.push({
            time: timeStr,
            value: match ? (typeof match.price === 'number' ? match.price : parseFloat(String(match.price))) : null,
            timestamp: new Date(current)
        });

        current.setMinutes(current.getMinutes() + 5);
    }

    return timeline;
}
