import { Card } from '../components/Card';
import { Newspaper } from 'lucide-react';

export const NewsList = ({ news, title }) => {
    if (!news || news.length === 0) {
        return (
            <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-textPrimary">
                    <Newspaper size={18} />
                    {title || '相關新聞'}
                </h3>
                <p className="text-textSecondary text-sm">載入新聞中...</p>
            </Card>
        );
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 hour
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} 分鐘前`;
        }
        // Less than 24 hours
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} 小時前`;
        }
        // Otherwise show date
        return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    };

    return (
        <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-textPrimary">
                <Newspaper size={18} />
                {title || '相關新聞'}
            </h3>
            <div className="space-y-2">
                {news.map((item, index) => (
                    <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-2 px-2 border-b border-white/5 last:border-0 hover:bg-white/5 rounded transition-colors cursor-pointer"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-sm text-textPrimary leading-snug line-clamp-2">
                                {item.title}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-textSecondary">{item.source}</span>
                            <span className="text-xs text-textSecondary">{formatTime(item.time)}</span>
                        </div>
                    </a>
                ))}
            </div>
        </Card>
    );
};
