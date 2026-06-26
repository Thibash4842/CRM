export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={`glass-card ${hover ? 'hover:scale-[1.01]' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, color = 'from-indigo-500 to-purple-600' }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent dark:text-white" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
            <span className={`bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</span>
          </p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
}
