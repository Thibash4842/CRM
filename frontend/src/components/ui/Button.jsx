import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'gradient-primary text-white hover:opacity-90 shadow-lg shadow-indigo-500/25',
  secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
  outline: 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl cursor-pointer font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
