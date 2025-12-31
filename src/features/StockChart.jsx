import { useRef, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
} from 'chart.js';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { PriceDisplay } from '../components/PriceDisplay';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
);

export const StockChart = ({ stock }) => {
    const chartRef = useRef(null);

    if (!stock) return <Card className="h-96 flex items-center justify-center text-textSecondary">請選擇一檔股票查看詳情</Card>;

    const isUp = stock.change >= 0;
    const metadata = isUp
        ? { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: TrendingUp, variant: 'success' }
        : { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: TrendingDown, variant: 'danger' };

    const Icon = metadata.icon;
    const prevClose = stock.price - stock.change;

    // Prepare chart data from stock history
    const chartData = useMemo(() => {
        const history = stock.history || [];

        return {
            labels: history.map(h => h.time),
            datasets: [
                {
                    data: history.map(h => h.price),
                    borderColor: metadata.color,
                    backgroundColor: metadata.bgColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // Smooth curves
                    pointRadius: 0, // No points on line
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: metadata.color,
                },
            ],
        };
    }, [stock.history, metadata.color, metadata.bgColor]);

    // Chart options
    const options = useMemo(() => {
        const prices = (stock.history || []).map(h => h.price);
        const minPrice = Math.min(...prices, prevClose);
        const maxPrice = Math.max(...prices, prevClose);
        const padding = (maxPrice - minPrice) * 0.1 || 1;

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: metadata.color,
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: (items) => items[0]?.label || '',
                        label: (item) => `NT$ ${item.parsed.y.toFixed(2)}`,
                    },
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    position: 'right',
                    min: minPrice - padding,
                    max: maxPrice + padding,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                    },
                    ticks: {
                        color: '#525252',
                        font: { size: 11 },
                        callback: (value) => `NT$${value.toFixed(0)}`,
                    },
                },
            },
            elements: {
                line: {
                    tension: 0.4,
                },
            },
        };
    }, [stock.history, prevClose, metadata.color]);

    // Draw reference line for previous close
    const plugins = useMemo(() => [{
        id: 'prevCloseLine',
        beforeDraw: (chart) => {
            const { ctx, chartArea, scales } = chart;
            if (!chartArea) return;

            const y = scales.y.getPixelForValue(prevClose);

            ctx.save();
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
            ctx.font = '10px sans-serif';
            ctx.fillText('前收', chartArea.right + 5, y + 3);
            ctx.restore();
        },
    }], [prevClose]);

    return (
        <Card className="h-96 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-textPrimary mb-1">{stock.name}</h2>
                    <div className="flex items-center gap-2 text-textSecondary text-sm">
                        <span>{stock.symbol}</span>
                        <span>•</span>
                        <span>台灣證券交易所</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-mono text-textPrimary font-bold">
                        <PriceDisplay price={stock.price} />
                    </div>
                    <Badge variant={metadata.variant} className="mt-1">
                        <Icon size={14} />
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </Badge>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <Line ref={chartRef} data={chartData} options={options} plugins={plugins} />
            </div>
        </Card>
    );
};
