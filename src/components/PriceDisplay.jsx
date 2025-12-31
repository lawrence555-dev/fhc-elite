import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

export const PriceDisplay = ({ price, className }) => {
    const [flash, setFlash] = useState(null); // 'up', 'down', or null
    const prevPrice = useRef(price);

    useEffect(() => {
        if (price > prevPrice.current) {
            setFlash('up');
        } else if (price < prevPrice.current) {
            setFlash('down');
        }

        prevPrice.current = price;

        const timer = setTimeout(() => setFlash(null), 1000);
        return () => clearTimeout(timer);
    }, [price]);

    return (
        <span className={clsx(
            "transition-colors duration-500 rounded px-1 -mx-1",
            flash === 'up' && "bg-red-500/20 text-red-500", // Red for Up
            flash === 'down' && "bg-green-500/20 text-green-500", // Green for Down
            className
        )}>
            NT${price.toFixed(2)}
        </span>
    );
};
