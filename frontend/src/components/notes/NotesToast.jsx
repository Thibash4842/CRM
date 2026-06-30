import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, RotateCcw, X } from 'lucide-react';

export default function NotesToast({
  toast,
  onClose,
  onUndo
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast.show) return;

    // Reset progress
    setProgress(100);

    const duration = toast.duration || 5000;
    const intervalTime = 50; // Update progress every 50ms
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.show, toast.id]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
          text: 'text-emerald-800 dark:text-emerald-300',
          icon: CheckCircle,
          iconColor: 'text-emerald-500',
          barColor: 'bg-emerald-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          icon: XCircle,
          iconColor: 'text-red-500',
          barColor: 'bg-red-500'
        };
      case 'undo':
        return {
          bg: 'bg-slate-900 dark:bg-slate-900 border-slate-800 dark:border-slate-800',
          text: 'text-white dark:text-slate-100',
          icon: RotateCcw,
          iconColor: 'text-indigo-400',
          barColor: 'bg-indigo-500'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
          text: 'text-blue-800 dark:text-blue-300',
          icon: Info,
          iconColor: 'text-blue-500',
          barColor: 'bg-blue-500'
        };
    }
  };

  if (!toast.show) return null;

  const style = getStyle();
  const Icon = style.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-2xl border ${style.bg} shadow-2xl p-4 z-[9999] flex flex-col overflow-hidden backdrop-blur-md`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-1 rounded-lg ${toast.type === 'undo' ? 'bg-slate-800' : 'bg-white/40 dark:bg-slate-950/20'} shrink-0`}>
            <Icon className={`w-5 h-5 ${style.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0 pr-6">
            <p className={`text-sm font-semibold leading-relaxed ${style.text}`}>
              {toast.message}
            </p>
          </div>

          {toast.type === 'undo' && onUndo && (
            <button
              onClick={() => {
                onUndo();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </button>
          )}

          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-500 cursor-pointer ${toast.type === 'undo' ? 'hover:bg-slate-800' : ''}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar timer */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/10">
          <motion.div
            className={`h-full ${style.barColor}`}
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
