import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

export const ThemeSelector = () => {
    const [theme, setTheme] = useState('theme-obsidian');
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'theme-obsidian', name: 'Obsidian', color: '#0a0a0a' },
        { id: 'theme-midnight', name: 'Midnight', color: '#0f172a' },
        { id: 'theme-slate', name: 'Slate', color: '#202225' },
    ];

    useEffect(() => {
        // Apply theme to body
        document.body.className = '';
        document.body.classList.add(theme);
    }, [theme]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-white/5 rounded-full text-textSecondary hover:text-textPrimary transition-colors"
                title="Change Theme"
            >
                <Palette size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-surface border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="py-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-white/5 transition-colors ${theme === t.id ? 'text-primary font-medium' : 'text-textSecondary'}`}
                            >
                                <div
                                    className="w-4 h-4 rounded-full border border-white/10"
                                    style={{ backgroundColor: t.color }}
                                />
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
