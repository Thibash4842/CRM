import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, size = 'md', title, children, hideHeader = false, noPadding = false }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl', xxl: 'w-[80vw] max-w-[90vw]' };
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className={`ml-auto relative w-full ${sizes[size]} bg-white dark:bg-slate-900 h-full shadow-2xl transform transition-transform animate-slide-in-right flex flex-col`}>
        {!hideHeader && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className={`${noPadding ? '' : 'p-6'} overflow-y-auto flex-1 flex flex-col`}>{children}</div>
      </aside>
    </div>
  );
}
