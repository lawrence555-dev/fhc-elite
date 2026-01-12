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
    { id: "2880", name: "華南金", price: 31.85, dividend: 1.2 },
    { id: "2881", name: "富邦金", price: 95.5, dividend: 3.0 },
    { id: "2882", name: "國泰金", price: 75.9, dividend: 2.0 },
    { id: "2883", name: "凱基金", price: 17.45, dividend: 1.0 },
    { id: "2884", name: "玉山金", price: 32.85, dividend: 1.5 },
    { id: "2885", name: "元大金", price: 40.8, dividend: 1.5 },
    { id: "2886", name: "兆豐金", price: 40.65, dividend: 1.8 },
    { id: "2887", name: "台新金", price: 20.85, dividend: 1.0 },
    { id: "2889", name: "國票金", price: 16.75, dividend: 0.7 },
    { id: "2890", name: "永豐金", price: 29.2, dividend: 1.2 },
    { id: "2891", name: "中信金", price: 49.7, dividend: 1.8 },
    { id: "2892", name: "第一金", price: 29.7, dividend: 1.1 },
    { id: "5880", name: "合庫金", price: 24.1, dividend: 1.1 },
];

export default function TaxPage() {
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [selectedId, setSelectedId] = useState(STOCKS[1].id); // 預設富邦金
    const [shares, setShares] = useState<number>(10000); // 預設 10 張

    useEffect(() => {
        setMounted(true);
    }, []);

    const selectedStock = STOCKS.find(s => s.id === selectedId) || STOCKS[1];

    // 計算邏輯
    const totalDividend = shares * selectedStock.dividend;
    const nhiPremium = totalDividend >= NHI_THRESHOLD ? totalDividend * NHI_RATE : 0;
    const taxCredit = Math.min(totalDividend * TAX_RATE, TAX_LIMIT);
    const netDividend = totalDividend - nhiPremium;
    const dividendYield = (selectedStock.dividend / selectedStock.price) * 100;

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                    <header className="mb-12">
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                            <Calculator className="text-rise w-12 h-12" />
                            金控股息與稅務計算機
                        </h1>
                        <p className="text-slate-400 text-lg font-bold max-w-2xl">
                            專業級演算法整合二代健保補充保費與所得稅抵減。精確掌握您的每一分入帳所得，實現節稅最大化。
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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

                            {/* 稅務提醒區 - 明確加熱與加大字體 */}
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
                                            💡 建議策略：可透過「拆單」或「增加眷屬」等方式規避門檻。本系統下方「節稅導航」將為您試算最優配置。
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右側：結果顯示 */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* 主要金額視覺 */}
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
                                                目前參考價 {selectedStock.price} TWD
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
                                            onClick={() => showToast("已儲存當前計算情境至您的雲端分析中心", "success")}
                                            className="w-full py-5 bg-rise text-white rounded-2xl font-black text-lg shadow-2xl shadow-rise/30 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                                        >
                                            <span className="relative z-10">儲存試算結果</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        </button>
                                    </div>
                                </div>

                                {/* 背景飾點 */}
                                <div className="absolute -right-20 -top-20 w-80 h-80 bg-rise/10 blur-[120px] rounded-full" />
                                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />
                            </section>

                            {/* 分項細節網格 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass p-8 space-y-6 hover:border-emerald-500/40 transition-all bg-slate-900/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                            <ReceiptText size={24} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">股息基礎</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black text-white font-mono">{selectedStock.dividend}</p>
                                        <p className="text-xs text-slate-500 font-bold">NT / 股</p>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                        根據各金控官方公告之配息政策，系統自動帶入最新參數。
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={cn(
                                        "glass p-8 space-y-6 transition-all bg-slate-900/40",
                                        nhiPremium > 0 ? "border-rose-500/30" : "border-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                            nhiPremium > 0 ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-500"
                                        )}>
                                            <ShieldCheck size={24} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">二代健保</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={cn("text-3xl font-black font-mono", nhiPremium > 0 ? "text-rose-500" : "text-slate-600")}>
                                            -{formatCurrency(nhiPremium)}
                                        </p>
                                        <p className="text-xs text-slate-500 font-bold">費率 2.11%</p>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                        {totalDividend >= NHI_THRESHOLD
                                            ? "已達 NT$ 20,000 門檻，將自動從給付中扣繳。"
                                            : "目前低於申報門檻，本筆配息免扣補充保費。"}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass p-8 space-y-6 border-blue-500/30 bg-slate-900/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                                            <ReceiptText size={24} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">可抵減稅額</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black text-blue-400 font-mono">+{formatCurrency(taxCredit)}</p>
                                        <p className="text-xs text-slate-500 font-bold">費率 8.5%</p>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                        合併申報可享有免稅抵減。每戶上限 8 萬元，可用於扣抵綜合所得稅。
                                    </p>
                                </motion.div>
                            </div>

                            {/* 會計師節稅策略面板 */}
                            <section className="glass p-10 bg-[#0f172a] border-white/10 ring-1 ring-white/5 relative group">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-10 h-10 bg-fall/20 rounded-xl flex items-center justify-center text-fall">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">節稅導航 (Professional Insights)</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                                    <div className="space-y-5">
                                        <h4 className="text-sm font-black text-slate-300 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-fall shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
                                            綜合所得稅模擬 (5% 級距)
                                        </h4>
                                        <p className="text-[15px] font-bold text-slate-400 leading-8">
                                            若您的綜合所得稅率為 5%，此筆配息的抵減額 ({formatCurrency(taxCredit)}) 不僅可全額抵銷稅負，
                                            預計還能為您帶來 <span className="text-fall underline decoration-2 underline-offset-4">{formatCurrency(taxCredit - totalDividend * 0.05)} 的退稅金額</span>。
                                        </p>
                                    </div>
                                    <div className="space-y-5">
                                        <h4 className="text-sm font-black text-slate-300 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rise shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            二代健保省錢策略
                                        </h4>
                                        <p className="text-[15px] font-bold text-slate-400 leading-8">
                                            {totalDividend >= NHI_THRESHOLD
                                                ? `由於配息已過門檻，建議將資產改由 ${Math.ceil(totalDividend / 19999)} 個家屬帳戶持有，或分批買進不同發放日的標的，以完全避開補充保費。`
                                                : "目前的持有量非常安全，單次配息維持在 2 萬以下，效率極高。"}
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
