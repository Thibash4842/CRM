import { FileText, Pin, Star, Archive, Share2, Calendar } from 'lucide-react';
import Card from '../ui/Card';

export default function NotesKPIs({ stats, activeFilter, onFilterChange }) {
  const kpis = [
    {
      id: 'all',
      title: 'Total Notes',
      value: stats.active,
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgGlow: 'bg-indigo-500/10'
    },
    {
      id: 'pinned',
      title: 'Pinned',
      value: stats.pinned,
      icon: Pin,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-500 dark:text-rose-400',
      bgGlow: 'bg-rose-500/10'
    },
    {
      id: 'favorites',
      title: 'Favorites',
      value: stats.favorites,
      icon: Star,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-500 dark:text-amber-400',
      bgGlow: 'bg-amber-500/10'
    },
    {
      id: 'shared',
      title: 'Shared',
      value: stats.shared,
      icon: Share2,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-500 dark:text-violet-400',
      bgGlow: 'bg-violet-500/10'
    },
    {
      id: 'today',
      title: "Today's Notes",
      value: stats.today,
      icon: Calendar,
      color: 'from-emerald-400 to-teal-600',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      id: 'archived',
      title: 'Archived',
      value: stats.archived,
      icon: Archive,
      color: 'from-slate-500 to-slate-700',
      textColor: 'text-slate-500 dark:text-slate-400',
      bgGlow: 'bg-slate-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isActive = activeFilter === kpi.id;

        return (
          <button
            key={kpi.id}
            onClick={() => onFilterChange(kpi.id)}
            className={`group text-left relative overflow-hidden transition-all duration-300 rounded-2xl border p-4 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/30 ${
              isActive
                ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-500/10 -translate-y-1'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 hover:bg-white hover:dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {/* Decorative BG Glow */}
            <div
              className={`absolute -right-6 -top-6 w-16 h-16 bg-gradient-to-br ${kpi.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-xl transition-opacity duration-300`}
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color} opacity-90 text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                {kpi.value}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
