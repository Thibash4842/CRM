import { motion } from 'framer-motion';

export default function CalendarSidebarLeft({ filters, setFilters }) {
  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const types = [
    { key: 'MEETING', label: 'Meetings', color: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
    { key: 'CALL', label: 'Calls', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
    { key: 'TASK', label: 'Tasks', color: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
    { key: 'FOLLOW_UP', label: 'Follow-ups', color: 'bg-violet-500', shadow: 'shadow-violet-500/50' },
    { key: 'INTERNAL', label: 'Internal', color: 'bg-slate-500', shadow: 'shadow-slate-500/50' }
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 border-r border-slate-200/60 dark:border-slate-700/60 bg-slate-50/30 dark:bg-slate-800/30 p-5 flex flex-col shrink-0"
    >
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
          My Calendars
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
            Personal
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
            Work
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
          Event Filters
        </h3>
        <div className="space-y-1">
          {types.map(t => (
            <label 
              key={t.key} 
              className={`flex items-center gap-3 text-sm font-medium cursor-pointer p-2 -mx-2 rounded-lg transition-all duration-200 ${
                filters[t.key] ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'
              }`}
            >
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input
                  type="checkbox"
                  checked={filters[t.key]}
                  onChange={() => toggleFilter(t.key)}
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                />
                <div className={['w-3.5 h-3.5 rounded-full transition-all duration-300', t.color, filters[t.key] ? 'shadow-sm scale-110 ' + t.shadow : 'opacity-40 scale-90'].join(' ')} />
              </div>
              {t.label}
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
