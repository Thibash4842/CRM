import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertTriangle, Clock, ChevronRight, X } from 'lucide-react';
import Card from './Card';
import { useFinance } from '../../context/FinanceContext';

export default function AIInsightsPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { invoices, expenses } = useFinance();

  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const pendingExpenses = expenses.filter(e => e.status === 'Pending Approval');
  const overdueTotal = overdueInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 sm:right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center justify-center"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">AI Insights</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {overdueInvoices.length > 0 && (
          <div className="flex gap-3 items-start bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/50">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">Overdue Invoices</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                You have {overdueInvoices.length} overdue invoices totaling ${overdueTotal.toLocaleString()}. Consider sending reminders.
              </p>
            </div>
          </div>
        )}

        {pendingExpenses.length > 0 && (
          <div className="flex gap-3 items-start bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Pending Approvals</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                There are {pendingExpenses.length} expenses waiting for manager approval.
              </p>
            </div>
          </div>
        )}

        {overdueInvoices.length === 0 && pendingExpenses.length === 0 && (
          <div className="flex gap-3 items-start bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">All Clear</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                Your finances are looking great. No immediate actions required!
              </p>
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate('/reports')}
          className="w-full text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          View Detailed Reports <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
