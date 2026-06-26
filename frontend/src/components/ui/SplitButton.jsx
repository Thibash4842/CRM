import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SplitButton({ primaryLabel, primaryIcon: PrimaryIcon, onPrimaryClick, options }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex animate-fade-in">
      <div className="inline-flex rounded-xl shadow-lg shadow-indigo-500/25">
        <button
          onClick={onPrimaryClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium gradient-primary text-white hover:opacity-90 rounded-l-xl border-r border-white/20 transition-opacity focus:outline-none"
        >
          {PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
          {primaryLabel}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-2 gradient-primary text-white hover:opacity-90 rounded-r-xl transition-opacity focus:outline-none"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-slide-in">
            {options.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setIsOpen(false);
                    opt.onClick && opt.onClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
