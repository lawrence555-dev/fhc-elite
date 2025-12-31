
// Simulated stock data service for Taiwan Financial Stocks
const STOCKS = [
    { symbol: '2881', name: '富邦金', basePrice: 91.5, volatility: 0.8 },
    { symbol: '2882', name: '國泰金', basePrice: 65.2, volatility: 0.7 },
    { symbol: '2891', name: '中信金', basePrice: 38.6, volatility: 0.5 },
    { symbol: '2886', name: '兆豐金', basePrice: 42.1, volatility: 0.3 },
    { symbol: '2885', name: '元大金', basePrice: 33.4, volatility: 0.4 },
    { symbol: '2884', name: '玉山金', basePrice: 29.8, volatility: 0.3 },
    { symbol: '2892', name: '第一金', basePrice: 28.5, volatility: 0.2 },
    { symbol: '5880', name: '合庫金', basePrice: 27.2, volatility: 0.2 },
    { symbol: '2880', name: '華南金', basePrice: 26.1, volatility: 0.2 },
    { symbol: '2887', name: '台新金', basePrice: 19.4, volatility: 0.2 },
    { symbol: '2890', name: '永豐金', basePrice: 25.3, volatility: 0.3 },
    { symbol: '2883', name: '開發金', basePrice: 16.8, volatility: 0.2 },
    { symbol: '2888', name: '新光金', basePrice: 11.2, volatility: 0.2 },
];

export const generateInitialData = () => {
    return STOCKS.map(stock => ({
        ...stock,
        price: stock.basePrice,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 50000) + 10000,
        history: Array.from({ length: 20 }, (_, i) => ({
            time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
            price: stock.basePrice * (1 + (Math.random() - 0.5) * 0.005)
        }))
    }));
};

export const simulateTick = (stocks) => {
    return stocks.map(stock => {
        // Smaller volatility for realistic tick movements on lower priced stocks
        const change = (Math.random() - 0.5) * (stock.volatility * 0.5);
        const newPrice = Math.max(0.01, stock.price + change);
        const priceChange = newPrice - stock.basePrice;
        const changePercent = (priceChange / stock.basePrice) * 100;

        // Update history
        const newHistory = [...stock.history.slice(1), {
            time: new Date().toLocaleTimeString(),
            price: newPrice
        }];

        return {
            ...stock,
            price: newPrice,
            change: priceChange,
            changePercent: changePercent,
            volume: stock.volume + Math.floor(Math.random() * 50),
            history: newHistory
        };
    });
};
