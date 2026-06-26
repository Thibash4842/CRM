import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';

function KPICard({ title, value, icon: Icon, percentage, colorClass }) {
  const isPositive = percentage >= 0;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {percentage !== undefined && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{percentage}%
            </span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

export default function PipelineSummary({ deals }) {
  const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'WON');
  const wonValue = wonDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  
  // Basic forecast: sum of non-won/lost deals at 50% probability (mock) + won deals
  const activeDeals = deals.filter(d => d.stage !== 'WON' && d.stage !== 'LOST');
  const forecastValue = activeDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0) * 0.5, 0) + wonValue;

  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard 
        title="Total Pipeline" 
        value={formatCurrency(totalValue)} 
        icon={DollarSign} 
        percentage={12}
        colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
      />
      <KPICard 
        title="Forecast Revenue" 
        value={formatCurrency(forecastValue)} 
        icon={TrendingUp} 
        percentage={8}
        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
      />
      <KPICard 
        title="Won Revenue" 
        value={formatCurrency(wonValue)} 
        icon={Target} 
        percentage={24}
        colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
      />
      <KPICard 
        title="Win Rate" 
        value={`${winRate}%`} 
        icon={BarChart3} 
        percentage={-2}
        colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
      />
    </div>
  );
}
