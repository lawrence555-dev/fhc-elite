import { Card } from '../components/Card';
import { PriceDisplay } from '../components/PriceDisplay';
import { Badge } from '../components/Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export const TickerList = ({ stocks, selectedSymbol, onSelect }) => {
    return (
        <Card className="h-full overflow-hidden flex flex-col p-4">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">自選股</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {stocks.map(stock => {
                    const isUp = stock.change >= 0;
                    return (
                        <div
                            key={stock.symbol}
                            onClick={() => onSelect(stock.symbol)}
                            className={clsx(
                                "p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                                selectedSymbol === stock.symbol
                                    ? "bg-white/10 border-white/10"
                                    : "hover:bg-white/5"
                            )}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-textPrimary">{stock.symbol}</span>
                                <PriceDisplay price={stock.price} className="font-mono text-textPrimary" />
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-textSecondary truncate max-w-[100px]">{stock.name}</span>
                                <span className={clsx("flex items-center gap-1", isUp ? "text-danger" : "text-secondary")}>
                                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {Math.abs(stock.changePercent).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
