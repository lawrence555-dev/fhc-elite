"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TickerTape from "@/components/TickerTape";
import { Check, Zap, Crown, ShieldCheck, Globe, Cpu, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PLANS = [
    {
        name: "FREE",
        price: "0",
        description: "適合新手投資者的基礎監控。",
        features: [
            "13 家金控實時報價網格",
            "基礎 P/B 估值提示",
            "每日配息稅務試算 (基礎)",
            "限制：無 AI 摘要功能",
        ],
        cta: "目前方案",
        highlight: false
    },
    {
        name: "PRO",
        price: "499",
        description: "專為追求極致獲利的操盤手量身打造。",
        features: [
            "Gemini 1.5 Pro 法說會深度摘要",
            "Line / Telegram 價值警報 (即時輪詢)",
            "完整 5 年歷史 P/B 分位曲線圖",
            "自選股籌碼異動異常偵測",
            "專屬 AI 投資建議 (每日更新)"
        ],
        cta: "立即升級 專業版",
        highlight: true
    }
];

export default function SubscriptionPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-5xl mx-auto w-full flex flex-col items-center">
                    <header className="text-center mb-16 space-y-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-rise/10 border border-rise/20 rounded-full text-rise text-[10px] font-black uppercase tracking-widest mb-4"
                        >
                            <Zap size={14} /> 掌握市場先機，從升級開始
                        </motion.div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">選擇適合您的 <span className="text-rise">FHC-Elite</span> 方案</h1>
                        <p className="text-slate-400 text-lg font-bold max-w-2xl mx-auto">
                            整合 AI 語義分析與自動化警報系統，讓繁瑣的金融數據變為您的競爭優勢。
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
                        {PLANS.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                    "glass p-10 flex flex-col relative overflow-hidden group transition-all duration-500",
                                    plan.highlight ? "border-rise/30 bg-slate-900/40 shadow-2xl shadow-rise/10 ring-1 ring-rise/20" : "border-white/5"
                                )}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <Crown className="text-rise" size={32} />
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-xs text-slate-500 font-bold">NT$</span>
                                        <span className="text-5xl font-black text-white">{plan.price}</span>
                                        <span className="text-slate-500 text-xs font-bold"> / 月</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">{plan.description}</p>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    {plan.features.map(feature => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-1 w-4 h-4 rounded-full flex items-center justify-center",
                                                plan.highlight ? "bg-rise/20 text-rise" : "bg-white/5 text-slate-600"
                                            )}>
                                                <Check size={10} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className={cn(
                                    "w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl",
                                    plan.highlight
                                        ? "bg-rise text-white shadow-rise/20 hover:bg-rose-600"
                                        : "bg-white/5 text-slate-500 cursor-default"
                                )}>
                                    {plan.highlight && <CreditCard size={18} />}
                                    {plan.cta}
                                </button>

                                {plan.highlight && (
                                    <div className="mt-6 text-center">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <ShieldCheck size={12} /> 安全支付 · 由 Stripe 提供技術支援
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        <div className="flex items-center gap-4 p-6 glass border-white/5">
                            <Globe className="text-blue-500" size={24} />
                            <div>
                                <p className="text-xs font-black text-white">全球金融網路</p>
                                <p className="text-[10px] text-slate-500 font-bold">即時同步各大交易所數據</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 glass border-white/5">
                            <Cpu className="text-emerald-500" size={24} />
                            <div>
                                <p className="text-xs font-black text-white">Gemini 核心驅動</p>
                                <p className="text-[10px] text-slate-500 font-bold">每日處理超過 1GB 金融資訊</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 glass border-white/5">
                            <Zap className="text-rise" size={24} />
                            <div>
                                <p className="text-xs font-black text-white">毫秒級通知</p>
                                <p className="text-[10px] text-slate-500 font-bold">重要訊息不漏接</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
