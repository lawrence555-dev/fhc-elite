import { useState, useEffect } from 'react';
import { getStocks } from './services/realStockService';
import { generateInitialData, simulateTick } from './services/mockStockService';
import { getStockNews, getFinanceNews } from './services/newsService';
import { StockChart } from './features/StockChart';
import { TickerList } from './features/TickerList';
import { NewsList } from './features/NewsList';
import { Card } from './components/Card';
import { ThemeSelector } from './components/ThemeSelector';
import { Activity, Bell, Search, Menu, TrendingUp, TrendingDown, X } from 'lucide-react';

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [newsTitle, setNewsTitle] = useState('金融股 相關新聞');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockData = await getStocks();

        if (stockData && stockData.length > 0) {
          const sortedStocks = [...stockData].sort((a, b) => a.symbol.localeCompare(b.symbol));
          setStocks(sortedStocks);
        } else {
          console.warn("Stock API unavailable, switching to simulation");
          setStocks(prev => {
            if (prev.length === 0) return generateInitialData();
            return simulateTick(prev);
          });
        }

      } catch (e) {
        console.error("Failed to fetch data:", e);
        setStocks(prev => {
          if (prev.length === 0) return generateInitialData();
          return simulateTick(prev);
        });
      }

      if (loading) {
        setLoading(false);
        setStocks(current => {
          if (current.length > 0 && !selectedSymbol) {
            const sortedByCode = [...current].sort((a, b) => a.symbol.localeCompare(b.symbol));
            setSelectedSymbol(sortedByCode[0].symbol);
          }
          return current;
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // 3 seconds refresh

    return () => clearInterval(interval);
  }, [loading, selectedSymbol]);

  useEffect(() => {
    const fetchNews = async () => {
      if (selectedSymbol) {
        const stockName = stocks.find(s => s.symbol === selectedSymbol)?.name || selectedSymbol;
        setNewsTitle(`${stockName} 相關新聞`);
        const newsData = await getStockNews(selectedSymbol);
        setNews(newsData);
      } else {
        setNewsTitle('金融股 相關新聞');
        const newsData = await getFinanceNews();
        setNews(newsData);
      }
    };
    fetchNews();
  }, [selectedSymbol, stocks]);

  const selectedStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">載入市場數據中...</div>;

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden font-sans relative">
      {/* Sidebar - Tickers */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 border-r border-white/5 bg-surface/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:bg-surface/30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { setSelectedSymbol(null); setIsSidebarOpen(false); }}>
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">金融戰情室</h1>
          </div>
          <button className="lg:hidden p-2 text-textSecondary" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <TickerList
          stocks={[...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol))}
          selectedSymbol={selectedSymbol}
          onSelect={(symbol) => {
            setSelectedSymbol(symbol);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-surface/30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4 text-textSecondary">
            <Menu
              className="lg:hidden cursor-pointer hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            />
            <Menu className="hidden lg:block cursor-pointer hover:text-white" />
            <div className="relative group hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="搜尋市場..."
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 w-40 lg:w-64 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeSelector />
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell size={20} className="text-textSecondary" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-danger rounded-full ring-2 ring-background"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-xs ring-2 ring-white/10">
              L
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-1">市場總覽</h2>
                <p className="text-textSecondary text-xs lg:text-sm">即時市場洞察與分析</p>
              </div>
              <div className="text-[10px] lg:text-sm text-textSecondary font-mono opacity-60">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()} 更新
              </div>
            </div>

            {/* Stock Chart */}
            <div className="w-full overflow-hidden">
              <StockChart stock={selectedStock} />
            </div>

            {/* Top Movers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strong Stocks (Gainers) */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-danger flex items-center gap-2">
                  <TrendingUp size={18} />
                  強勢股 (Top 3)
                </h3>
                <div className="space-y-1">
                  {stocks
                    .sort((a, b) => b.changePercent - a.changePercent)
                    .slice(0, 3)
                    .map(s => (
                      <div key={s.symbol} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded cursor-pointer transition-colors" onClick={() => setSelectedSymbol(s.symbol)}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-textPrimary">{s.name}</span>
                          <span className="text-xs text-textSecondary">{s.symbol}</span>
                        </div>
                        <div className="text-danger font-mono font-bold text-sm">
                          +{Math.abs(s.changePercent).toFixed(2)}%
                        </div>
                      </div>
                    ))
                  }
                </div>
              </Card>

              {/* Weak Stocks (Losers) */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-success flex items-center gap-2">
                  <TrendingDown size={18} />
                  弱勢股 (Bottom 3)
                </h3>
                <div className="space-y-1">
                  {stocks
                    .sort((a, b) => a.changePercent - b.changePercent)
                    .slice(0, 3)
                    .map(s => (
                      <div key={s.symbol} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded cursor-pointer transition-colors" onClick={() => setSelectedSymbol(s.symbol)}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-textPrimary">{s.name}</span>
                          <span className="text-xs text-textSecondary">{s.symbol}</span>
                        </div>
                        <div className="text-success font-mono font-bold text-sm">
                          -{Math.abs(s.changePercent).toFixed(2)}%
                        </div>
                      </div>
                    ))
                  }
                </div>
              </Card>
            </div>

            {/* News Section */}
            <div className="w-full overflow-hidden">
              <NewsList news={news} title={newsTitle} />
            </div>

          </div>
        </main >
      </div >
    </div>
  );
}

export default App;
