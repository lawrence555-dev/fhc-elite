"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TickerTape from "@/components/TickerTape";
import { Calculator, Info, RotateCcw, TrendingUp, Wallet, ShieldCheck, ReceiptText } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/Toast";

const TAX_RATE = 0.085; // 所得稅可抵減稅額 8.5%
const TAX_LIMIT = 80000; // 每一申報戶抵減上限 8 萬
const NHI_RATE = 0.0211; // 二代健保補充保費 2.11%
const NHI_THRESHOLD = 20000; // 健保補費申報門檻 2 萬

const STOCKS_BASE = [
    { id: "2880", name: "華南金", dividend: 1.2 },
    { id: "2881", name: "富邦金", dividend: 3.0 },
    { id: "2882", name: "國泰金", dividend: 2.0 },
    { id: "2883", name: "凱基金", dividend: 1.0 },
    { id: "2884", name: "玉山金", dividend: 1.5 },
    { id: "2885", name: "元大金", dividend: 1.5 },
    { id: "2886", name: "兆豐金", dividend: 1.8 },
    { id: "2887", name: "台新金", dividend: 1.0 },
    { id: "2889", name: "國票金", dividend: 0.7 },
    { id: "2890", name: "永豐金", dividend: 1.2 },
    { id: "2891", name: "中信金", dividend: 1.8 },
    { id: "2892", name: "第一金", dividend: 1.1 },
    { id: "5880", name: "合庫金", dividend: 1.1 },
];

export default function TaxPage() {
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [selectedId, setSelectedId] = useState("2881"); // 預設富邦金
    const [shares, setShares] = useState<number>(10000); // 預設 10 張
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchPrices();
        fetchScenarios();
    }, []);

    const fetchPrices = async () => {
        try {
            const res = await fetch("/api/stock-prices/realtime");
            const data = await res.json();
            const prices: Record<string, number> = {};
            data.forEach((s: any) => {
                prices[s.id] = s.price;
            });
            setLivePrices(prices);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch prices:", error);
            setIsLoading(false);
        }
    };

    const fetchScenarios = async () => {
        try {
            const res = await fetch("/api/tax/scenarios");
            const data = await res.json();
            setScenarios(data);
        } catch (error) {
            console.error("Failed to fetch scenarios:", error);
        }
    };

    const handleSave = async () => {
        try {
            const body = {
                stockId: selectedId,
                stockName: selectedStock.name,
                shares,
                price: selectedStock.price,
                dividend: selectedStock.dividend,
                totalDividend,
                netDividend,
                nhiPremium,
                taxCredit
            };

            const res = await fetch("/api/tax/scenarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                showToast("試算情境已成功儲存至雲端分析中心", "success");
                fetchScenarios();
            }
        } catch (error) {
            showToast("儲存失敗，請稍後再試", "error");
        }
    };

    const handleDeleteScenario = async (id: string) => {
        try {
            const res = await fetch(`/api/tax/scenarios?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("情境已刪除", "info");
                fetchScenarios();
            }
        } catch (error) {
            showToast("刪除失敗", "error");
        }
    };

    const STOCKS = STOCKS_BASE.map(s => ({
        ...s,
        price: livePrices[s.id] || 0
    }));

    const selectedStock = STOCKS.find(s => s.id === selectedId) || STOCKS[1];

    // 計算邏輯
    const totalDividend = shares * selectedStock.dividend;
    const nhiPremium = totalDividend >= NHI_THRESHOLD ? totalDividend * NHI_RATE : 0;
    const taxCredit = Math.min(totalDividend * TAX_RATE, TAX_LIMIT);
    const netDividend = totalDividend - nhiPremium;
    const dividendYield = selectedStock.price > 0 ? (selectedStock.dividend / selectedStock.price) * 100 : 0;

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-7xl mx-auto w-full pb-32">
                    <header className="mb-12">
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                            <Calculator className="text-rise w-12 h-12" />
                            金控股息與稅務計算機
                        </h1>
                        <p className="text-slate-400 text-lg font-bold max-w-2xl">
                            專業級演算法整合二代健保補充保費與所得稅抵減。精確掌握您的每一分入帳所得，實現節稅最大化。
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
                        {/* 左側：輸入面板 */}
                        <div className="lg:col-span-4 space-y-8">
                            <section className="glass p-10 border-white/10 space-y-8 bg-slate-900/40">
                                <div>
                                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">1. 選擇投資標的 (13 檔全開)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {STOCKS.map(stock => (
                                            <button
                                                key={stock.id}
                                                onClick={() => setSelectedId(stock.id)}
                                                className={cn(
                                                    "py-4 px-4 rounded-2xl text-[13px] font-black transition-all border flex flex-col items-center gap-1",
                                                    selectedId === stock.id
                                                        ? "bg-rise border-rise text-white shadow-xl shadow-rise/20 scale-[1.02]"
                                                        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                                                )}
                                            >
                                                <span>{stock.name}</span>
                                                <span className="text-[10px] opacity-60 font-mono">{stock.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">2. 輸入持有股數</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={shares}
                                            onChange={(e) => setShares(Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-white/10 rounded-2xl py-6 pl-6 pr-20 text-3xl font-black text-white focus:outline-none focus:ring-4 focus:ring-rise/30 transition-all font-mono"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg">
                                            股
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-5">
                                        {[1000, 10000, 50000, 100000].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setShares(v)}
                                                className="flex-1 py-3 rounded-xl bg-white/5 text-[11px] font-black text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20 transition-all"
                                            >
                                                {v >= 10000 ? `${v / 10000} 張` : `${v} 股`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => { setShares(10000); showToast("計算機已重置", "info"); }}
                                        className="w-full py-4 flex items-center justify-center gap-3 text-sm font-black text-slate-500 hover:text-white transition-colors"
                                    >
                                        <RotateCcw size={18} /> 重置所有參數
                                    </button>
                                </div>
                            </section>

                            {/* 稅務提醒區 */}
                            <div className="glass p-8 bg-gradient-to-br from-blue-600/20 to-transparent border-blue-500/30 ring-1 ring-blue-500/20">
                                <div className="flex items-start gap-5">
                                    <div className="p-3 bg-blue-500/30 rounded-2xl text-blue-400">
                                        <ReceiptText size={24} />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-lg font-black text-white tracking-tight">2026 報稅新制重要提醒</p>
                                        <p className="text-[15px] leading-relaxed text-slate-300 font-bold">
                                            若單次配息金額達 <span className="text-blue-400">NT$ 20,000</span>，將扣除 <span className="text-blue-400">2.11%</span> 之二代健保補充保費。
                                        </p>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-[13px] text-slate-400 font-medium">
                                            💡 建議策略：可透過「拆單」或「增加眷屬」等方式規避門檻。
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右側：結果顯示 */}
                        <div className="lg:col-span-8 space-y-10">
                            <section className="glass p-12 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 shadow-2xl">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                                    <div className="text-center md:text-left">
                                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">預估年度配息總額 (含稅)</p>
                                        <h2 className="text-8xl font-black text-white tracking-tighter mb-6 font-mono">
                                            {formatCurrency(totalDividend)}
                                        </h2>
                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                            <span className="px-5 py-2 bg-emerald-500/20 text-emerald-400 text-sm font-black rounded-full border border-emerald-500/20">
                                                預算殖利率 {dividendYield.toFixed(2)}%
                                            </span>
                                            <span className="text-slate-500 text-sm font-bold opacity-60">
                                                目前參考價 {selectedStock.price || "載入中"} TWD
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-80 space-y-5">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center ring-1 ring-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">稅後實領 (Net)</span>
                                                <span className="text-3xl font-black text-white font-mono">{formatCurrency(netDividend)}</span>
                                            </div>
                                            <Wallet className="text-slate-600" size={32} />
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading || selectedStock.price === 0}
                                            className="w-full py-5 bg-rise text-white rounded-2xl font-black text-lg shadow-2xl shadow-rise/30 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="relative z-10">儲存試算結果至分析中心</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -right-20 -top-20 w-80 h-80 bg-rise/10 blur-[120px] rounded-full" />
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="glass p-8 space-y-6 bg-slate-900/40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                            <ReceiptText size={24} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">股息基礎</span>
                                    </div>
                                    <p className="text-3xl font-black text-white font-mono">{selectedStock.dividend} <span className="text-sm text-slate-600">NT/股</span></p>
                                </div>

                                <div className={cn("glass p-8 space-y-6 bg-slate-900/40", nhiPremium > 0 ? "border-rose-500/30" : "border-white/5")}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", nhiPremium > 0 ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-500")}>
                                            <ShieldCheck size={24} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">二代健保</span>
                                    </div>
                                    <p className={cn("text-3xl font-black font-mono", nhiPremium > 0 ? "text-rose-500" : "text-slate-600")}>-{formatCurrency(nhiPremium)}</p>
                                </div>

                                <div className="glass p-8 space-y-6 border-blue-500/30 bg-slate-900/40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                                            <ReceiptText size={24} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">可抵減稅額</span>
                                    </div>
                                    <p className="text-3xl font-black text-blue-400 font-mono">+{formatCurrency(taxCredit)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 雲端分析中心：比較畫面 */}
                    <section className="mt-20">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-widest uppercase italic flex items-center gap-4">
                                    <TrendingUp className="text-fall" />
                                    雲端分析中心 - 方案比對 (Comparison Analysis)
                                </h3>
                                <p className="text-slate-500 font-bold mt-2">儲存多個投資情境，一鍵比對稅務效率與避稅空間。</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-500 uppercase">已儲存情境</span>
                                <p className="text-2xl font-black text-white font-mono">{scenarios.length} / 5</p>
                            </div>
                        </div>

                        {scenarios.length === 0 ? (
                            <div className="glass p-20 flex flex-col items-center justify-center border-dashed border-white/10 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-6">
                                    <Calculator size={40} />
                                </div>
                                <p className="text-slate-400 font-bold text-xl">目前尚無存檔。在上方設定參數後，點擊「儲存」即可開始比對。</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {scenarios.map((s, idx) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass p-8 bg-slate-900/60 border-white/10 relative group hover:border-rise/50 transition-all"
                                    >
                                        <button
                                            onClick={() => handleDeleteScenario(s.id)}
                                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 transition-all"
                                        >
                                            <RotateCcw size={16} className="rotate-45" />
                                        </button>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-2xl font-black text-white">{s.stockName}</h4>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.stockId} • {s.shares.toLocaleString()} 股</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-400 block uppercase">稅後實領</span>
                                                <span className="text-xl font-black text-rise font-mono">{formatCurrency(s.netDividend)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-white/10">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-bold">配息總額</span>
                                                <span className="text-white font-mono">{formatCurrency(s.totalDividend)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-bold">二代健保</span>
                                                <span className={cn("font-mono", s.nhiPremium > 0 ? "text-rose-500" : "text-slate-300")}>
                                                    -{formatCurrency(s.nhiPremium)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-bold">稅額抵減</span>
                                                <span className="text-blue-400 font-mono">+{formatCurrency(s.taxCredit)}</span>
                                            </div>

                                            {/* 避稅效率指標 */}
                                            <div className="mt-8">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">避稅效率 (效率愈高代表免交補充保費)</span>
                                                    <span className={cn("text-xs font-black", s.nhiPremium > 0 ? "text-rose-400" : "text-emerald-400")}>
                                                        {s.nhiPremium > 0 ? "需優化" : "效率極佳"}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: s.nhiPremium > 0 ? "30%" : "100%" }}
                                                        className={cn("h-full", s.nhiPremium > 0 ? "bg-rose-500" : "bg-emerald-500")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
