// Price History Store
// Accumulates price data throughout the trading day
// Stores in memory and can persist to localStorage

const STORAGE_KEY = 'stock_price_history';
const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MINUTE = 0;
const MARKET_CLOSE_HOUR = 13;
const MARKET_CLOSE_MINUTE = 30;

// In-memory store for price history
// Format: { [symbol]: { date: 'YYYY-MM-DD', prevClose: number, points: [{time: 'HH:mm', price: number}] } }
let priceHistory = {};

// Load from localStorage on initialization
try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        priceHistory = JSON.parse(stored);
    }
} catch (e) {
    console.warn('Failed to load price history from localStorage');
}

/**
 * Gets today's date string in YYYY-MM-DD format
 */
const getTodayStr = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

/**
 * Gets the current time in HH:mm format
 */
const getCurrentTimeStr = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Checks if market is currently open
 */
const isMarketOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Before market open
    if (hours < MARKET_OPEN_HOUR) return false;
    if (hours === MARKET_OPEN_HOUR && minutes < MARKET_OPEN_MINUTE) return false;

    // After market close
    if (hours > MARKET_CLOSE_HOUR) return false;
    if (hours === MARKET_CLOSE_HOUR && minutes > MARKET_CLOSE_MINUTE) return false;

    return true;
};

/**
 * Adds a price point for a stock
 * @param {string} symbol - Stock symbol
 * @param {number} price - Current price
 * @param {number} prevClose - Previous close price
 */
export const addPricePoint = (symbol, price, prevClose) => {
    const today = getTodayStr();
    const time = getCurrentTimeStr();

    // Initialize history for this symbol if needed
    if (!priceHistory[symbol] || priceHistory[symbol].date !== today) {
        priceHistory[symbol] = {
            date: today,
            prevClose: prevClose,
            points: []
        };
    }

    // Update prev close if we have it
    if (prevClose && prevClose !== 0) {
        priceHistory[symbol].prevClose = prevClose;
    }

    // Check if we already have a point for this minute
    const existingIndex = priceHistory[symbol].points.findIndex(p => p.time === time);
    if (existingIndex >= 0) {
        // Update existing point
        priceHistory[symbol].points[existingIndex].price = price;
    } else {
        // Add new point
        priceHistory[symbol].points.push({ time, price });
        // Sort by time
        priceHistory[symbol].points.sort((a, b) => a.time.localeCompare(b.time));
    }

    // Save to localStorage (debounced would be better for performance)
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(priceHistory));
    } catch (e) {
        console.warn('Failed to save price history to localStorage');
    }
};

/**
 * Gets the full intraday history for a stock
 * Returns points with gaps filled for the chart
 * @param {string} symbol - Stock symbol
 * @param {number} currentPrice - Current price (to fill to current time)
 * @param {number} prevClose - Previous close price
 * @returns {{prevClose: number, history: Array<{time: string, price: number|null}>}}
 */
export const getFullIntradayHistory = (symbol, currentPrice, prevClose) => {
    const today = getTodayStr();
    const stored = priceHistory[symbol];

    // Generate all time slots from 09:00 to 13:30
    const allTimeSlots = [];
    for (let h = MARKET_OPEN_HOUR; h <= MARKET_CLOSE_HOUR; h++) {
        const maxMinute = (h === MARKET_CLOSE_HOUR) ? MARKET_CLOSE_MINUTE : 59;
        for (let m = 0; m <= maxMinute; m += 1) { // Every minute
            allTimeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }

    // Get stored points for today
    const storedPoints = (stored && stored.date === today) ? stored.points : [];
    const storedPrevClose = (stored && stored.date === today) ? stored.prevClose : prevClose;

    // Create a map for quick lookup
    const pointMap = new Map(storedPoints.map(p => [p.time, p.price]));

    // Get current time for determining what to show
    const now = new Date();
    const currentTimeStr = getCurrentTimeStr();

    // Fill in the history
    let lastKnownPrice = storedPrevClose || currentPrice;
    const history = allTimeSlots.map(time => {
        // Don't include future times
        if (time > currentTimeStr && isMarketOpen()) {
            return { time, price: null };
        }

        // If we have data for this time, use it
        if (pointMap.has(time)) {
            lastKnownPrice = pointMap.get(time);
            return { time, price: lastKnownPrice };
        }

        // If market is closed and we have no data, return null for future visualization
        if (!isMarketOpen() && storedPoints.length === 0) {
            return { time, price: null };
        }

        // Fill gaps with last known price (or null if no data)
        return { time, price: storedPoints.length > 0 ? lastKnownPrice : null };
    });

    // Ensure current price is at current time if market is open
    if (isMarketOpen() && currentPrice) {
        const currentIdx = history.findIndex(h => h.time === currentTimeStr);
        if (currentIdx >= 0) {
            history[currentIdx].price = currentPrice;
        }
    }

    return {
        prevClose: storedPrevClose || prevClose,
        history: history.filter(h => h.price !== null) // Only return points with actual prices
    };
};

/**
 * Clears old history (for previous days)
 */
export const clearOldHistory = () => {
    const today = getTodayStr();
    Object.keys(priceHistory).forEach(symbol => {
        if (priceHistory[symbol].date !== today) {
            delete priceHistory[symbol];
        }
    });
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(priceHistory));
    } catch (e) { }
};

/**
 * Checks if market is open
 */
export { isMarketOpen };
