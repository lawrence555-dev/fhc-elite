import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: 'bg-surfaceHighlight text-textSecondary',
        success: 'bg-red-500/10 text-red-500',
        danger: 'bg-green-500/10 text-green-500',
        warning: 'bg-yellow-500/10 text-yellow-500',
    };

    return (
        <span className={twMerge(clsx(
            "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
            variants[variant],
            className
        ))}>
            {children}
        </span>
    );
};
