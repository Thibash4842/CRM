import { Search, Plus, Filter } from 'lucide-react';
import Button from './Button';

export default function PageHeader({ title, subtitle, onAdd, addLabel = 'Add New', search, onSearch, filters, actionContent }) {
  return (
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm w-48 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}
        {filters}
        {actionContent ? actionContent : onAdd && (
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function FilterSelect({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
      >
        <option value="">{label || 'All'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />}
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
