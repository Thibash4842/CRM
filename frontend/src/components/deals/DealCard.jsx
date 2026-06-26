import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/constants';

function PriorityBadge({ value }) {
  if (!value) return null;
  const config = {
    HIGH: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    MEDIUM: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    LOW: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' }
  };
  const style = config[value] || config.MEDIUM;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${style.color}`}>
      {value}
    </span>
  );
}

export default function DealCard({ deal, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Mock probability and priority if not present
  const probability = deal.probability || (deal.stage === 'WON' ? 100 : deal.stage === 'LOST' ? 0 : 50);
  const priority = deal.priority || 'MEDIUM';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="group p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative"
    >
      <div className="flex items-start gap-2">
        <button {...listeners} className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={deal.title}>{deal.title}</h4>
            <PriorityBadge value={priority} />
          </div>
          
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">{formatCurrency(deal.value)}</p>
          
          {deal.clientName && (
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
              <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              <span className="truncate">{deal.clientName}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            {deal.expectedCloseDate ? (
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                <span>{formatDate(deal.expectedCloseDate)}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No close date</span>
            )}
            
            <div className="flex items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{probability}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
