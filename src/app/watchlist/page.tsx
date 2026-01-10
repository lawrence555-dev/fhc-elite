"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TickerTape from "@/components/TickerTape";
import { Star, TrendingUp, TrendingDown, ArrowRight, Wallet, PieChart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/Toast";

const WATCHLIST_DATA = [
    { id: "2881", name: "富邦金", price: 95.5, diff: -1.5, change: -1.55, isUp: false, avgCost: 75.2, shares: 5000 },
    { id: "2886", name: "兆豐金", price: 40.65, diff: 0.2, change: 0.49, isUp: true, avgCost: 32.5, shares: 12000 },
    { id: "2884", name: "玉山金", price: 32.85, diff: 0.05, change: 0.15, isUp: true, avgCost: 26.8, shares: 8000 },
    { id: "2887", name: "台新新光金", price: 20.85, diff: 0.1, change: 0.48, isUp: true, avgCost: 17.5, shares: 10000 },
];

export default function WatchlistPage() {
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalMarketValue = WATCHLIST_DATA.reduce((acc, stock) => acc + stock.price * stock.shares, 0);
    const totalCost = WATCHLIST_DATA.reduce((acc, stock) => acc + stock.avgCost * stock.shares, 0);
    const totalProfit = totalMarketValue - totalCost;
    const profitPercentage = (totalProfit / totalCost) * 100;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
                    <header className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                                <Star className="text-fall fill-fall" size={36} />
                                自選追蹤與投資組合
                            </h1>
                            <p className="text-slate-400 text-sm font-bold">
                                監控您的核心持股，實時計算損益與資產成分比例。
                            </p>
                        </div>
                        <button
                            onClick={() => showToast("目前為 MVP 展示模式。在正式版中，您可以手動增加或移除追蹤標的。", "info")}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white transition-all flex items-center gap-2"
                        >
                            管理清單 <ArrowRight size={14} />
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Portfolio Summary Card */}
                        <div className="lg:col-span-12 glass p-10 bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 overflow-hidden relative">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">總資產市值 (TWD)</p>
                                    <h2 className="text-6xl font-black text-white tracking-tighter mb-4 font-mono">
                                        {formatCurrency(totalMarketValue)}
                                    </h2>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <div className={cn(
                                            "flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-black",
                                            totalProfit >= 0 ? "bg-rise/20 border-rise/10 text-rise" : "bg-fall/20 border-fall/10 text-fall"
                                        )}>
                                            {totalProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)} ({profitPercentage.toFixed(2)}%)
                                        </div>
                                        <span className="text-slate-500 text-[10px] font-bold">
                                            計算基準：今日收盤價
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="p-6 glass bg-white/5 border-white/5 flex flex-col items-center justify-center text-center w-32">
                                        <Wallet className="text-slate-500 mb-2" size={24} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">總庫存</span>
                                        <span className="text-lg font-black text-white">{WATCHLIST_DATA.length} 檔</span>
                                    </div>
                                    <div className="p-6 glass bg-white/5 border-white/5 flex flex-col items-center justify-center text-center w-32">
                                        <PieChart className="text-slate-500 mb-2" size={24} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">集中度</span>
                                        <span className="text-lg font-black text-white">高</span>
                                    </div>
                                </div>
                            </div>
                            {/* Decoration */}
                            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-rise/5 to-transparent skew-x-12 translate-x-1/2" />
                        </div>

                        {/* Watchlist Table */}
                        <div className="lg:col-span-12">
                            <div className="glass overflow-hidden border-white/5">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">代號/名稱</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">目前價格</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">今日漲跌</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">平均成本</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">累計損益</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">動作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-xs font-bold">
                                        {WATCHLIST_DATA.map((stock) => {
                                            const profit = (stock.price - stock.avgCost) * stock.shares;
                                            const isProfitable = profit >= 0;
                                            return (
                                                <motion.tr
                                                    key={stock.id}
                                                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                                    className="transition-colors group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-white text-sm font-black tracking-tight">{stock.name}</span>
                                                            <span className="text-slate-500 font-mono">{stock.id} (金控股)</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-mono text-white text-sm">{stock.price.toFixed(2)}</td>
                                                    <td className={cn(
                                                        "px-8 py-6 text-right font-mono",
                                                        stock.isUp ? "text-rise" : "text-fall"
                                                    )}>
                                                        {stock.isUp ? "+" : ""}{stock.diff.toFixed(2)} ({stock.isUp ? "+" : ""}{stock.change.toFixed(2)}%)
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-mono text-slate-400">{stock.avgCost.toFixed(1)}</td>
                                                    <td className={cn(
                                                        "px-8 py-6 text-right font-mono text-sm",
                                                        isProfitable ? "text-rise" : "text-fall"
                                                    )}>
                                                        {isProfitable ? "+" : ""}{formatCurrency(profit)}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                                            <Star size={16} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Empty Slot CTA */}
                        <div className="lg:col-span-12 glass p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center hover:border-white/20 transition-all cursor-pointer">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-4">
                                <Star size={24} />
                            </div>
                            <p className="text-slate-500 font-bold mb-1">想要追蹤更多的金控股嗎？</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">前往熱力圖發現被低估的機會</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
