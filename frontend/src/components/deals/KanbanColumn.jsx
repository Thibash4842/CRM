import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Inbox } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';
import DealCard from './DealCard';

export default function KanbanColumn({ stage, deals }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });
  const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  // Extract the color class from constants (e.g. bg-blue-500)
  const dotColor = stage.color;

  return (
    <div className="flex-shrink-0 w-[320px] flex flex-col h-full">
      {/* Column Header (Sticky) */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 pb-3 mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${dotColor}`} />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">{stage.label}</h3>
          </div>
          <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-4.5">
          {formatCurrency(totalValue)}
        </p>
        {/* Subtle separator line colored by stage */}
        <div className={`h-0.5 w-full mt-3 rounded-full opacity-20 ${dotColor}`}></div>
      </div>

      {/* Sortable Context & Drop Area */}
      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div 
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto space-y-3 p-2 -mx-2 min-h-[150px] rounded-xl transition-all duration-200
            ${isOver ? 'bg-indigo-50/80 dark:bg-indigo-900/20 ring-2 ring-indigo-400/50 ring-inset shadow-inner' : ''}
          `}
        >
          {deals.length > 0 ? (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          ) : (
            <div className={`flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 border-2 border-dashed rounded-xl transition-colors
              ${isOver ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800'}
            `}>
              <Inbox className={`w-8 h-8 mb-2 opacity-50 ${isOver ? 'text-indigo-500' : ''}`} />
              <p className="text-sm font-medium">No deals in this stage</p>
              <p className="text-xs mt-1 opacity-70">Drag deals here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
