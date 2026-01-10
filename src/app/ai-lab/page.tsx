"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TickerTape from "@/components/TickerTape";
import { BrainCircuit, Sparkles, MessageSquare, Terminal, Zap, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function AiLabPage() {
    const [mounted, setMounted] = useState(false);
    const [isTestingLine, setIsTestingLine] = useState(false);
    const [testStatus, setTestStatus] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleTestNotification = async () => {
        setIsTestingLine(true);
        setTestStatus(null);
        try {
            const resp = await fetch("/api/alerts/test", { method: "POST" });
            if (resp.ok) {
                setTestStatus("✅ 測試訊息已成功送達 Line！");
            } else {
                setTestStatus("❌ 發送失敗，請確認 .env 中已加入 LINE_NOTIFY_TOKEN。");
            }
        } catch (e) {
            setTestStatus("❌ 連線異常，請檢查伺服器狀態。");
        } finally {
            setIsTestingLine(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                    <header className="mb-12">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-rise rounded-2xl shadow-2xl shadow-rise/40">
                                <BrainCircuit className="text-white" size={32} />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter">AI 智能研究室 (FHC Intelligence)</h1>
                        </div>
                        <p className="text-slate-400 text-sm font-bold max-w-3xl">
                            由 Gemini 1.5 Pro 驅動的金融語義分析引擎。我們自動摘要每日法說會新聞、政策公告與籌碼異動，將數萬字的資訊濃縮為三秒鐘的決策智慧。
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {/* Feature Cards */}
                        <div className="glass p-8 border-white/5 space-y-6 group hover:border-rise/50 transition-all cursor-pointer">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white">法說會摘要引擎</h3>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                自動分析金控公司法說會簡報，提取 NIM (淨利差)、手續費收入成長、資本適足率等核心指標。
                            </p>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                <Zap size={14} /> 每日 18:00 自動更新
                            </div>
                        </div>

                        <div className="glass p-8 border-white/5 space-y-6 group hover:border-fall/50 transition-all cursor-pointer" onClick={handleTestNotification}>
                            <div className="relative">
                                <div className="w-12 h-12 bg-fall/10 rounded-xl flex items-center justify-center text-fall group-hover:scale-110 transition-transform">
                                    <MessageSquare size={24} />
                                </div>
                                {isTestingLine && <span className="absolute -top-1 -right-1 w-4 h-4 bg-fall rounded-full animate-ping" />}
                            </div>
                            <h3 className="text-xl font-black text-white">發送測試警報至 Line</h3>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                點擊此卡片可立即發送一則測試警報至您的手機，驗證 Line Notify 通知系統是否已正確連結。
                            </p>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-fall uppercase tracking-widest">
                                {testStatus || "💡 點擊立即測試通知系統"}
                            </div>
                        </div>

                        <div className="glass p-8 border-white/5 space-y-6 group hover:border-rise/50 transition-all cursor-pointer">
                            <div className="w-12 h-12 bg-rise/10 rounded-xl flex items-center justify-center text-rise group-hover:scale-110 transition-transform">
                                <Terminal size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white">自定義警報實驗室</h3>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                利用自然語言設定警報，例如：「當合庫金 P/B 位階低於 10% 且外資連續買超三日時，推播通知。」
                            </p>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-rise uppercase tracking-widest">
                                <Zap size={14} /> PRO 會員專屬功能
                            </div>
                        </div>
                    </div>

                    {/* Locked View for MVP */}
                    <section className="glass p-16 flex flex-col items-center justify-center text-center border-rise/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                        <div className="w-20 h-20 bg-rise/20 rounded-full flex items-center justify-center text-rise mb-8 animate-pulse">
                            <ShieldAlert size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">AI 引擎正在 Phase 3 訓練中...</h2>
                        <p className="text-slate-400 font-bold max-w-md leading-relaxed mb-8">
                            我們正在整合 Gemini 1.5 Pro 的原生 API，預計在 Phase 3 (Day 31) 正式對 Pro 訂閱用戶開放 Beta 測試權限。
                        </p>
                        <Link
                            href="/subscription"
                            className="px-12 py-5 bg-rise text-white font-black rounded-2xl shadow-2xl shadow-rise/40 hover:scale-105 active:scale-95 transition-all inline-block"
                        >
                            獲取優先測試權名額
                        </Link>
                    </section>
                </main>
            </div>
        </div>
    );
}
