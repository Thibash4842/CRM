import { Search, Plus, Filter, MoreHorizontal, Star, Briefcase, DollarSign, Activity } from 'lucide-react';
import { Input } from '../ui/Input';
import Button from '../ui/Button';

const FILTERS = ['All', 'Customers', 'Prospects', 'At Risk', 'High Value'];

export default function AccountDirectory({
  accounts,
  selectedAccountId,
  onSelectAccount,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}) {

  const filteredAccounts = accounts.filter(acc => {
    // Search filter
    if (searchQuery && !acc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Type/Segment filters
    if (activeFilter === 'Customers' && acc.type !== 'Customer') return false;
    if (activeFilter === 'Prospects' && acc.type !== 'Prospect') return false;
    if (activeFilter === 'At Risk' && acc.status !== 'At Risk' && acc.status !== 'Needs Attention') return false;
    if (activeFilter === 'High Value' && acc.revenue < 10000000) return false;
    
    return true;
  });

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Accounts
          </h2>
          <Button size="sm" variant="primary" className="!px-2.5 !py-1.5 rounded-lg shadow-sm shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === f 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No accounts found.
          </div>
        ) : (
          filteredAccounts.map(acc => {
            return (
              <button
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all border mb-3 ${
                selectedAccountId === acc.id 
                  ? 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Logo Avatar */}
                  <div 
                    className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
                    style={{
                      backgroundColor: acc.healthScore > 80 ? '#10b981' : acc.healthScore > 50 ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    {acc.logo}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                      {acc.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {acc.industry} · {acc.employeeCount}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-3 h-3" />
                        {acc.revenue >= 1000000 ? `$${(acc.revenue/1000000).toFixed(1)}M` : `$${(acc.revenue/1000).toFixed(0)}K`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {acc.healthScore}/100
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="text-slate-300 hover:text-amber-400 transition-colors shrink-0 mt-1">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </button>);
          })
        )}
      </div>
    </div>
  );
}
