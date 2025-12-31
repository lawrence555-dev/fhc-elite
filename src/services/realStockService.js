// Real-time stock service using Google Finance Scraping (via local proxy)
// Parsing REAL intraday data instead of simulation.

import { addPricePoint, getFullIntradayHistory, isMarketOpen, clearOldHistory } from './priceHistoryStore';

// Clear old history on module load
clearOldHistory();

const STOCKS = [
    { code: '2881', name: '富邦金' }, { code: '2882', name: '國泰金' },
    { code: '2891', name: '中信金' }, { code: '2886', name: '兆豐金' },
    { code: '2885', name: '元大金' }, { code: '2884', name: '玉山金' },
    { code: '2892', name: '第一金' }, { code: '5880', name: '合庫金' },
    { code: '2880', name: '華南金' }, { code: '2887', name: '台新新光金' },
    { code: '2890', name: '永豐金' }, { code: '2883', name: '開發金' }
];

// Cache to store history for each stock to prevent chart jumping if fetch fails
const lastDataCache = {};

/**
 * Generates a simulated intraday history when real data is unavailable.
 * Uses a smooth random walk from previous close to current price.
 * @param {number} currentPrice - The current stock price
 * @param {number} change - The price change from previous close
 * @returns {Array<{time: string, price: number}>}
 */
const generateSimulatedHistory = (currentPrice, change) => {
    const history = [];
    const prevClose = currentPrice - change;
    const now = new Date();
    const marketOpen = new Date(now);
    marketOpen.setHours(9, 0, 0, 0);

    // Generate points from 09:00 until now (or 13:30 if past closing)
    let currentTime = new Date(marketOpen);
    const marketClose = new Date(now);
    marketClose.setHours(13, 30, 0, 0);

    const endTime = now > marketClose ? marketClose : now;
    const totalMinutes = Math.max(1, Math.floor((endTime - marketOpen) / 60000));

    // Generate smooth path using interpolation with small noise
    for (let i = 0; i <= totalMinutes; i += 5) { // Every 5 minutes
        const progress = i / totalMinutes;
        // Smooth interpolation with sine wave for natural curve
        const basePrice = prevClose + (change * progress);
        const noise = Math.sin(i * 0.3) * Math.abs(change) * 0.2 * (1 - progress);
        const price = basePrice + noise;

        const minutes = i;
        const hours = Math.floor(minutes / 60) + 9;
        const mins = minutes % 60;

        if (hours < 13 || (hours === 13 && mins <= 30)) {
            history.push({
                time: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
                price: Math.round(price * 100) / 100
            });
        }
    }

    // Ensure last point is current price
    if (history.length > 0) {
        history[history.length - 1].price = currentPrice;
    }

    return history;
};

/**
 * Robustly parses the Google Finance HTML to find the intraday data series.
 * It looks for AF_initDataCallback calls and searches for the specific stock symbol
 * and the characteristic array structure of intraday data.
 */
const parseRealIntradayData = (html, symbol) => {
    try {
        // 1. Find all AF_initDataCallback({...})
        const regex = /AF_initDataCallback\s*\(\s*({.*?})\s*\)\s*;/gs;
        let match;

        while ((match = regex.exec(html)) !== null) {
            const jsonStr = match[1];

            // 2. Optimization: Fast check if this chunk contains our symbol
            if (!jsonStr.includes(symbol)) continue;

            // 3. Extract the 'data' property. 
            // The JSON might be slightly malformed for standard JSON.parse (e.g. single quotes keys), 
            // but usually the 'data' part is a valid array.
            // We use a regex to extract the `data:` content safely.
            const dataMatch = jsonStr.match(/data\s*:\s*(\[.*\])\s*,\s*sideChannel/s);
            if (!dataMatch) continue;

            try {
                const rawData = JSON.parse(dataMatch[1]);

                // 4. Traverse to find the structure: [Symbol, ..., [Points...]]
                // The structure usually looks like:
                // [ [ [ "2881", "TPE" ], ..., [ [ [SessionInfo], [DATA_POINTS], ... ] ] ] ]
                // Or similar deep nesting. We will search for the array that contains the symbol.

                const findTimeSeries = (node) => {
                    if (!Array.isArray(node)) return null;

                    // Check if this node is the one containing the time series
                    // It usually has a format where one element is session info (e.g. [1, [2024, ...], ...])
                    // And the next is the array of points.
                    for (let i = 0; i < node.length; i++) {
                        const candidate = node[i];
                        if (Array.isArray(candidate) && candidate.length > 0) {
                            // Heuristic: The first element of a point is usually a date array: [Year, Month, Day, Hour, Minute]
                            // e.g. [2025, 12, 15, 9, 1]
                            const firstPoint = candidate[0];
                            if (Array.isArray(firstPoint) && Array.isArray(firstPoint[0]) && firstPoint[0].length >= 5) {
                                // Double check it looks like a date: Year > 2000
                                if (firstPoint[0][0] > 2000) {
                                    return candidate;
                                }
                            }
                        }
                    }

                    // Recurse
                    for (let item of node) {
                        const result = findTimeSeries(item);
                        if (result) return result;
                    }
                    return null;
                };

                const pointsData = findTimeSeries(rawData);

                if (pointsData) {
                    // 5. Convert points to our format
                    // Point structure: [ [Y,M,D,H,m,...], [Price, Change, %Change, ...], Volume ]
                    return pointsData.map(p => {
                        const dateArr = p[0];
                        const priceArr = p[1];
                        // const volume = p[2];

                        if (!dateArr || !priceArr) return null;

                        const hour = dateArr[3];
                        const minute = dateArr[4];
                        const price = priceArr[0]; // Price is usually index 0

                        // Format time HH:mm
                        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                        return {
                            time: timeStr,
                            price: price
                        };
                    }).filter(x => x !== null);
                }

            } catch (e) {
                // JSON parse error for this chunk, ignore
                continue;
            }
        }
    } catch (e) {
        console.error("Parsing error", e);
    }
    return null;
};


export const getStocks = async () => {
    try {
        const promises = STOCKS.map(async (stock) => {
            try {
                // Fetch the page
                const response = await fetch(`/api/google/finance/quote/${stock.code}:TPE?hl=zh-TW`);
                const text = await response.text();

                // 1. Scrape Current Info (Price, Change, %) separately for robustness
                // (Existing logic was okay for single values, let's keep it simple)
                const priceMatch = text.match(/class="YMlKec fxKbKc"[^>]*>([^<]*)<\/div>/);
                const changeMatch = text.match(/class="[a-zA-Z0-9\s]*"(?:[^>]*)>([+0-9.,\-]+)%?<\/div>/g); // Generalized

                let price = 0;
                let change = 0;
                let changePercent = 0;

                if (priceMatch && priceMatch[1]) {
                    price = parseFloat(priceMatch[1].replace(/[^0-9.]/g, ''));
                }

                // Try a more direct Regex for the big meta extraction for price/change
                // matching "TWD",[70,-0.1,-0.14...]
                // This is safer than class names which change
                const metaRegex = new RegExp(`"${stock.code}","TPE".*?"TWD",\\[([0-9.,\\-]+)`);
                // Note: The previous regex was: /"TWD",\[([0-9.,\-]+)/ - this handles the first match
                // But looking for specific symbol is better.

                // Let's rely on the parsing logic for HISTORY first, and maybe extracting current from there?
                // Actually, let's keep using the parsing logic from before for Current Price as a fallback
                // or just re-implement the specific regex for the current price block which is usually in `ds:14` or `ds:10` too.

                // Simplified Current Price Extraction:
                // Find `[PRICE, CHANGE, CHANGE_PCT]` usually following "TWD"
                const simpleMeta = text.match(/"TWD",\[([0-9.,\-]+)\]/);
                if (simpleMeta && simpleMeta[1]) {
                    const parts = simpleMeta[1].split(',');
                    if (parts.length >= 3) {
                        price = parseFloat(parts[0]);
                        change = parseFloat(parts[1]);
                        changePercent = parseFloat(parts[2]);
                    }
                }

                // 2. Accumulate price point if market is open
                const prevClose = price - change;
                if (isMarketOpen() && price > 0) {
                    addPricePoint(stock.code, price, prevClose);
                }

                // 3. Get full intraday history (accumulated from store)
                const { history: accumulatedHistory, prevClose: storedPrevClose } =
                    getFullIntradayHistory(stock.code, price, prevClose);

                const result = {
                    symbol: stock.code,
                    name: stock.name,
                    price: price,
                    change: change,
                    changePercent: changePercent,
                    volume: 0,
                    history: accumulatedHistory,
                    prevClose: storedPrevClose || prevClose
                };

                // Update cache
                lastDataCache[stock.code] = result;
                return result;

            } catch (err) {
                console.warn(`Failed to scrape ${stock.code}`, err);
                return lastDataCache[stock.code] || null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter(r => r !== null);

    } catch (error) {
        console.error("Failed to fetch stocks:", error);
        return [];
    }
};

export const getMarketIndices = async () => {
    // Re-using the same simplistic logic for now mostly for speed, 
    // but in reality we should use the same robust parser if we want charts for indices too.
    // For now, let's just keep the simple fetch.
    const indices = [
        { code: 'IX0001', name: '加權指數' }, // TAIEX (Weighted Index)
        { code: 'IX0043', name: '櫃買指數' }, // TPEX (OTC)
        { code: 'IX0010', name: '金融類股' }, // Finance Sector
        { code: 'IX0028', name: '電子類股' }  // Electronic Sector
    ];

    const promises = indices.map(async (index) => {
        try {
            const response = await fetch(`/api/google/finance/quote/${index.code}:TPE?hl=zh-TW`);
            const text = await response.text();

            const jsonMatch = text.match(/"TWD",\[([0-9.,\-]+)/);
            if (jsonMatch && jsonMatch[1]) {
                const parts = jsonMatch[1].split(',');
                if (parts.length >= 3) {
                    const price = parseFloat(parts[0]);
                    const changePercent = parseFloat(parts[2]);

                    return {
                        name: index.name,
                        val: price,
                        change: (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%'
                    };
                }
            }
            return { name: index.name, val: 0, change: '0.00%' };
        } catch (error) {
            console.error(`Failed to fetch index ${index.code}`, error);
            return { name: index.name, val: 0, change: '0.00%' };
        }
    });

    return Promise.all(promises);
};
