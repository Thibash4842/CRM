export default function Card({ children, className = '', hover = false }) {
  return (
    <div 
      className={`glass-card ${hover ? 'hover:-translate-y-1 hover:shadow-2xl transition-all duration-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, comparison = 'vs last month', color = 'from-indigo-500 to-purple-600' }) {
  return (
    <Card hover className="relative overflow-hidden group">
      {/* Decorative Background Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-white">
            {value}
          </p>
          
          <div className="flex items-center gap-2 mt-3">
            {trend && (
              <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-md ${trend.positive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                {trend.positive ? '▲' : '▼'} {trend.value}%
              </span>
            )}
            {!trend && (
               <span className="flex items-center text-xs font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                 ▲ +12%
               </span>
            )}
            <span className="text-xs text-slate-400 font-medium">{comparison}</span>
          </div>
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
}
