import prisma from "@/lib/prisma";

/**
 * 獲取台灣目前的日期 (YYYY-MM-DD 格式)
 */
function getTaiwanDate() {
    return new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date()).replace(/\//g, '-');
}

/**
 * 判斷當前是否為台灣交易時間 (09:00 - 13:35)
 */
function isTaiwanMarketOpen() {
    const now = new Date();
    const twTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Taipei',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(now);

    const [hour, minute] = twTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;

    // 09:00 (540 mins) to 13:35 (815 mins)
    return totalMinutes >= 540 && totalMinutes <= 815;
}

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
        console.log(`[Cleanup] 刪除 ${result.count} 條舊的分時價格記錄。`);
    } catch (e) {
        console.error("[Cleanup] 清理失敗:", e);
    }
}

export async function syncIntradayData(stockId: string) {
    try {
        const symbol = `${stockId}.TW`;
        console.log(`[Sync] 正在從 Yahoo Finance 獲取 ${symbol} 的數據...`);

        // Yahoo Finance Intraday API (5m interval for 5 days)
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=5d`);
        if (!res.ok) {
            console.error(`[Sync] Yahoo API 回傳錯誤狀態 ${res.status} (${symbol})`);
            return;
        }
        const data = await res.json();

        if (!data || !data.chart || !data.chart.result) {
            console.warn(`[Sync] 找不到 ${symbol} 的數據結構`);
            return;
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0].close;
        const volumes = result.indicators.quote[0].volume;

        if (timestamps && quotes) {
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
                    category: ["2880", "2886", "2892", "5880"].includes(stockId) ? "官股" : "民營"
                }
            });

            // 取得台灣今天的日期字符串
            const twDateStr = getTaiwanDate();

            const dataToInsert = timestamps.map((ts: number, i: number) => {
                const date = new Date(ts * 1000);
                const itemTwDate = new Intl.DateTimeFormat('zh-TW', {
                    timeZone: 'Asia/Taipei',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }).format(date).replace(/\//g, '-');

                return {
                    stockId,
                    timestamp: date,
                    price: quotes[i] || 0,
                    volume: BigInt(volumes[i] || 0),
                    isTwToday: itemTwDate === twDateStr
                };
            }).filter((item: any) => item.price > 0 && item.isTwToday);

            console.log(`[Sync] 準備為 ${stockId} 插入 ${dataToInsert.length} 個數據點 (台灣日期: ${twDateStr})`);

            if (dataToInsert.length === 0) {
                console.warn(`[Sync] ${stockId} 今日尚無數據可同步。`);
                return [];
            }

            await Promise.all(
                dataToInsert.map((item: any) =>
                    prisma.dailyPrice.upsert({
                        where: {
                            stockId_timestamp: {
                                stockId: item.stockId,
                                timestamp: item.timestamp
                            }
                        },
                        create: {
                            stockId: item.stockId,
                            timestamp: item.timestamp,
                            price: item.price,
                            volume: item.volume
                        },
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
        console.error(`[Sync] 同步 ${stockId} 失敗:`, e);
    }
}

export async function getIntradayPrices(stockId: string) {
    const twToday = getTaiwanDate();

    // 1. 查找資料庫中該股最新的記錄
    const latestRecord = await prisma.dailyPrice.findFirst({
        where: { stockId },
        orderBy: { timestamp: 'desc' }
    });

    let needsSync = false;
    if (!latestRecord) {
        needsSync = true;
    } else {
        const lastRecordTwDate = new Intl.DateTimeFormat('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(latestRecord.timestamp).replace(/\//g, '-');

        // 如果最新記錄不是今天的，或者現在正在交易中（需要即時更新）
        if (lastRecordTwDate !== twToday || isTaiwanMarketOpen()) {
            needsSync = true;
        }
    }

    if (needsSync) {
        console.log(`[Fetch] 觸發同步 ${stockId} (原因: ${!latestRecord ? '無記錄' : '數據過期或交易中'})`);
        await syncIntradayData(stockId);
    }

    // 2. 抓取台灣今天的數據
    // 注意：Prisma 查詢使用的是 UTC，所以我們需要根據台灣時區的當日啟始時間來查詢
    const startOfTwToday = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    startOfTwToday.setHours(0, 0, 0, 0);
    // 轉回 UTC 以供資料庫查詢
    const utcStart = new Date(startOfTwToday.getTime() - (startOfTwToday.getTimezoneOffset() * 60000));

    const prices = await prisma.dailyPrice.findMany({
        where: {
            stockId,
            timestamp: {
                gte: new Date(new Date(twToday).getTime()) // 簡化：直接使用日期字符串起始
            }
        },
        orderBy: { timestamp: "asc" }
    });

    // 3. 過濾並格式化為前端所需的 09:00 - 13:30 時間軸
    const timeline: any[] = [];
    const baseDate = new Date(twToday);

    for (let hour = 9; hour <= 13; hour++) {
        const startMin = (hour === 9) ? 0 : 0;
        const endMin = (hour === 13) ? 30 : 55;

        for (let min = startMin; min <= endMin; min += 5) {
            const currentTwTime = new Date(baseDate);
            currentTwTime.setHours(hour, min, 0, 0);

            const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

            // 尋找資料庫中是否有對應點 (容許 3 分鐘內的誤差)
            const match = prices.find(p => {
                const diff = Math.abs(p.timestamp.getTime() - currentTwTime.getTime());
                return diff < 3 * 60 * 1000;
            });

            timeline.push({
                time: timeStr,
                value: match ? (typeof match.price === 'number' ? match.price : parseFloat(String(match.price))) : null,
                timestamp: new Date(currentTwTime)
            });
        }
    }

    return timeline;
}
