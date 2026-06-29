import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reminder toast shown periodically when there are unread notifications.
 * Props:
 *   - count: number of unread notifications
 *   - visible: boolean – whether the toast is shown
 *   - onClose: () => void – called when the close button is clicked
 *   - onClick: () => void – called when the toast body is clicked (navigate to panel)
 */
export default function ReminderToast({ count, visible, onClose, onClick }) {
  const navigate = useNavigate();

  const handleBodyClick = () => {
    if (onClick) onClick();
    // also navigate to the notifications page as a fallback
    navigate('/notifications');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-4 right-4 sm:right-8 w-80 glass bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex items-start gap-3 cursor-pointer"
          onClick={handleBodyClick}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              You have {count} unread notification{count > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review them to stay updated.
            </p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClose?.(); }}
            className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
