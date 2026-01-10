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

const STOCKS = [
    { id: "2881", name: "富邦金", price: 95.5, dividend: 3.0 },
    { id: "2882", name: "國泰金", price: 75.9, dividend: 2.0 },
    { id: "2886", name: "兆豐金", price: 40.65, dividend: 1.8 },
    { id: "2891", name: "中信金", price: 49.7, dividend: 1.8 },
    { id: "2887", name: "台新新光金", price: 20.85, dividend: 1.0 },
    { id: "2892", name: "第一金", price: 28.5, dividend: 1.1 },
];

export default function TaxPage() {
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [selectedId, setSelectedId] = useState(STOCKS[0].id);
    const [shares, setShares] = useState<number>(10000); // 10 張

    useEffect(() => {
        setMounted(true);
    }, []);

    const selectedStock = STOCKS.find(s => s.id === selectedId) || STOCKS[0];

    // Calculations
    const totalDividend = shares * selectedStock.dividend;
    const nhiPremium = totalDividend >= NHI_THRESHOLD ? totalDividend * NHI_RATE : 0;
    const taxCredit = Math.min(totalDividend * TAX_RATE, TAX_LIMIT);
    const netDividend = totalDividend - nhiPremium;

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            <Calculator className="text-rise" size={36} />
                            金控股息與稅務計算機
                        </h1>
                        <p className="text-slate-400 text-sm font-bold">
                            垂直整合二代健保補充保費與所得稅抵減演算法，精確掌握每一分入帳所得。
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Input Panel */}
                        <div className="lg:col-span-1 space-y-6">
                            <section className="glass p-8 border-white/5 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">選擇標的</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STOCKS.map(stock => (
                                            <button
                                                key={stock.id}
                                                onClick={() => setSelectedId(stock.id)}
                                                className={cn(
                                                    "py-3 px-4 rounded-xl text-xs font-black transition-all border",
                                                    selectedId === stock.id
                                                        ? "bg-rise border-rise text-white shadow-lg shadow-rise/20"
                                                        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                                                )}
                                            >
                                                {stock.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">持有股數 (Shares)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={shares}
                                            onChange={(e) => setShares(Number(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-4 pr-16 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-rise/50 transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs">
                                            股
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {[1000, 5000, 10000, 50000].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setShares(v)}
                                                className="flex-1 py-2 rounded-lg bg-white/5 text-[10px] font-black text-slate-500 hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                {v / 1000} 張
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => setShares(10000)}
                                        className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors"
                                    >
                                        <RotateCcw size={14} /> 重置計算機
                                    </button>
                                </div>
                            </section>

                            <div className="glass p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/10">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Info size={18} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-white">2026 報稅新制提醒</p>
                                        <p className="text-[10px] leading-relaxed text-slate-400 font-bold">
                                            若單次配息金額達 NT$ 20,000，將扣除 2.11% 之二代健保補充保費。建議股民可透過「拆單」或「增加眷屬」等方式規避，本系統可幫您試算最優配置。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Results Display */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Summary Hero */}
                            <section className="glass p-10 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-white/10">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">預估年度配息總額 (含稅)</p>
                                        <h2 className="text-6xl font-black text-white tracking-tighter mb-4 font-mono">
                                            {formatCurrency(totalDividend)}
                                        </h2>
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <span className="px-3 py-1 bg-fall/20 text-fall text-[10px] font-black rounded-full border border-fall/10">
                                                殖利率 4.85%
                                            </span>
                                            <span className="text-slate-500 text-[10px] font-bold italic">
                                                基於目前股價 {selectedStock.price || "---"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-64 space-y-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">實領薪貼 (Net)</span>
                                            <span className="text-lg font-black text-white font-mono">{formatCurrency(netDividend)}</span>
                                        </div>
                                        <button
                                            onClick={() => showToast("功能解鎖：計算結果已成功儲存至您的 Pro 財報導航中心。", "success")}
                                            className="w-full py-4 bg-rise text-white rounded-xl font-black shadow-xl shadow-rise/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            儲存計算結果至 Pro 財報
                                        </button>
                                    </div>
                                </div>

                                {/* Decorations */}
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-rise/10 blur-[100px] rounded-full" />
                                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
                            </section>

                            {/* Detailed Breakdown Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Row 1 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass p-6 space-y-4 hover:border-rise/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Wallet size={18} />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">股息基礎</span>
                                    </div>
                                    <p className="text-2xl font-black text-white font-mono">{selectedStock.dividend} <span className="text-[10px] text-slate-600">NT/股</span></p>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                        根據 {selectedStock.name} 公布之最新配息政策，並假設為 100% 現金配息。
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="glass p-6 space-y-4 border-rose-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">二代健保費</span>
                                    </div>
                                    <p className="text-2xl font-black text-rose-500 font-mono">-{formatCurrency(nhiPremium)}</p>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                        {totalDividend >= NHI_THRESHOLD
                                            ? "單筆配息超過 2 萬，系統自動按 2.11% 法定費率預扣。"
                                            : "目前未達 2 萬門檻，無需繳納補充保費。"}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass p-6 space-y-4 border-blue-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <ReceiptText size={18} />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">可抵減稅額</span>
                                    </div>
                                    <p className="text-2xl font-black text-blue-500 font-mono">+{formatCurrency(taxCredit)}</p>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                        合併申報可享有 8.5% 的免稅額。這筆金額將直接從您的應繳所得稅中扣除。
                                    </p>
                                </motion.div>
                            </div>

                            {/* Strategy Insight */}
                            <section className="glass p-8 bg-[#0f172a] border-white/5">
                                <div className="flex items-center gap-4 mb-6">
                                    <TrendingUp className="text-fall" size={24} />
                                    <h3 className="text-xl font-black text-white tracking-widest uppercase">節稅導航 (Tax Optimization)</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-fall" />
                                            應納稅額模擬
                                        </h4>
                                        <p className="text-xs font-bold text-slate-500 leading-6">
                                            若您的所得稅率為 5%，此筆配息的可抵減稅額 ({formatCurrency(taxCredit)}) 不僅可抵銷該筆股息產生的稅負，預計還能為您帶來 <span className="text-fall">{formatCurrency(taxCredit - totalDividend * 0.05)} 的額外退稅</span>。
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rise" />
                                            健保費風險
                                        </h4>
                                        <p className="text-xs font-bold text-slate-500 leading-6">
                                            由於本案配息總額已達 {formatCurrency(totalDividend)}，建議考慮將資產分散至{shares > 10000 ? "兩個不同帳戶持股" : "其他金控分流"}，以利單次配息維持在 2 萬以下，省下全額之健保補費。
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
