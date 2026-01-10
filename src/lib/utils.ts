import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
    return new Intl.NumberFormat('zh-TW', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(num);
}

export function formatCurrency(num: number) {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        maximumFractionDigits: 0
    }).format(num);
}
