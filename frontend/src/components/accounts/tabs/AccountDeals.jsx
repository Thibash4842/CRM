import { Target, Calendar, User, MoreVertical } from 'lucide-react';

export default function AccountDeals({ deals }) {
  if (!deals || deals.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        No active opportunities for this account.
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-4 animate-fade-in">
      {deals.map(deal => (
        <div key={deal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all group">
          <div className="flex flex-col gap-4">
            {/* Deal Name & Icon */}
            <div className="col-span-12 lg:col-span-4 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deal.name}
                </h4>
              </div>
            </div>

            {/* Amount */}
            <div className="col-span-6 lg:col-span-2">
              <p className="text-xs text-slate-500 mb-0.5">Amount</p>
              <p className="font-bold text-slate-900 dark:text-white">${deal.amount.toLocaleString()}</p>
            </div>

            {/* Close Date */}
            <div className="col-span-6 lg:col-span-2">
              <p className="text-xs text-slate-500 mb-0.5">Close Date</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(deal.closeDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>

            {/* Probability */}
            <div className="col-span-6 lg:col-span-2">
              <p className="text-xs text-slate-500 mb-1 flex justify-between">
                <span>Probability</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{deal.probability}%</span>
              </p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${deal.probability >= 80 ? 'bg-emerald-500' :
                    deal.probability >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
            </div>

            {/* Stage Badge */}
            <div className="col-span-6 lg:col-span-2 flex justify-end">
              <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${deal.stage === 'Closed Won' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                deal.stage === 'Closed Lost' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                {deal.stage}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
