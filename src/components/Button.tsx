import React from 'react';
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    children,
    ...props
}) => {
    // Now using standard CSS classes defined in global.css
    const combinedClass = clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        className
    );

    return (
        <button
            className={combinedClass}
            {...props}
        >
            {icon && <span className="flex-center" style={{ display: 'inline-flex' }}>{icon}</span>}
            {children}
        </button>
    );
};
