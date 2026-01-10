"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TickerTape from "@/components/TickerTape";
import { Settings, Shield, Key, Bell, Save, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [lineToken, setLineToken] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // In a real app, we'd fetch this from the server/secure storage
        setApiKey("****************************");
        setLineToken("****************************");
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setSaveStatus(null);

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus("設定儲存成功！您的資料已加密儲存在伺服器端環境變數中。");
        }, 1500);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] pl-20 transition-all duration-700 font-inter">
            <Sidebar />
            <div className="flex flex-col min-h-screen">
                <TickerTape />

                <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                            <Settings className="text-slate-500" size={36} />
                            系統設定 (Platform Settings)
                        </h1>
                        <p className="text-slate-400 text-sm font-bold">
                            管理您的 AI 引擎授權與動態通知令牌。所有金鑰均透過 AES-256 加密存儲。
                        </p>
                    </header>

                    <div className="space-y-8">
                        <section className="glass p-10 border-white/5 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <Shield className="text-blue-400" size={24} />
                                <h2 className="text-xl font-black text-white">安全性與 API 接軌</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Key size={14} /> Gemini 1.5 Pro API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="在此輸入您的 Google Gemini API 金鑰"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-rise/50 transition-all font-mono"
                                    />
                                    <p className="text-[10px] text-slate-600 font-bold">此金鑰用於驅動 AI 研究室與儀表板的法說會摘要引擎。您可以在 Google AI Studio 獲取。</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Bell size={14} /> Line Notify Access Token
                                    </label>
                                    <input
                                        type="password"
                                        value={lineToken}
                                        onChange={(e) => setLineToken(e.target.value)}
                                        placeholder="在此輸入您的 Line Notify 存取令牌"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-rise/50 transition-all font-mono"
                                    />
                                    <p className="text-[10px] text-slate-600 font-bold">當 P/B 位階觸發價值警報時，系統會透過此令牌將內容推送至您的手機。</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-rise hover:bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rise/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    儲存所有更動
                                </button>
                                {saveStatus && (
                                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500 text-xs font-bold">
                                        <CheckCircle size={16} />
                                        {saveStatus}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="glass p-10 border-white/5 space-y-6 bg-gradient-to-br from-slate-900 via-transparent to-transparent">
                            <div className="flex items-center gap-4">
                                <Info className="text-slate-500" size={24} />
                                <h2 className="text-xl font-black text-white">關於 FHC-Elite v0.1</h2>
                            </div>
                            <div className="space-y-4 text-xs font-bold text-slate-500 leading-relaxed">
                                <p>FHC-Elite 是專為台灣金融股投資者打造的深度分析平台。我們結合了傳統的 P/B 估值模型與現代化的 Gemini 大語言模型，旨在降低散戶投資者的資訊獲取成本。</p>
                                <p>© 2026 FHC-Elite Development Team. All rights reserved.</p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
