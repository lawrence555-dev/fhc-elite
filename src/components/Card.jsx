import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className }) => {
    return (
        <div className={twMerge(clsx("glass-panel rounded-xl p-6", className))}>
            {children}
        </div>
    );
};
