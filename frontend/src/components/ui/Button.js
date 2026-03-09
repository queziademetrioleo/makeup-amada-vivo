import { jsx as _jsx } from "react/jsx-runtime";
const variantClasses = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    icon: 'w-10 h-10 flex items-center justify-center rounded-full border border-border hover:border-blush/50 transition-colors',
};
const sizeClasses = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base',
    lg: 'text-base px-8 py-4',
};
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
    return (_jsx("button", { className: `${variantClasses[variant]} ${variant !== 'icon' ? sizeClasses[size] : ''} ${className}`, ...props, children: children }));
}
