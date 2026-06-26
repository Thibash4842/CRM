import { Sparkles, Activity, AlertTriangle, ChevronRight, Network } from 'lucide-react';
import Button from '../ui/Button';

export default function AccountInsights({ account }) {
  return (
    <div className="flex flex-col min-h-full p-6 space-y-6">

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative">
        <div className="absolute -right-6 -top-6 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-indigo-500" />
        </div>

        <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Executive Summary
        </h3>

        <p className="text-sm text-indigo-800/80 dark:text-indigo-200/80 leading-relaxed relative z-10 mb-4">
          {account.aiSummary}
        </p>

        <div className="space-y-2 relative z-10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900/60 dark:text-indigo-300/60 mb-2">Recommended Actions</h4>
          {account.aiRecommendations.map((rec, i) => (
            <button key={i} className="w-full flex items-center justify-between p-2.5 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 rounded-xl text-left transition-colors border border-indigo-100/50 dark:border-indigo-800/30 group">
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{rec}</span>
              <ChevronRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Account Health Center */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-500" />
          Health Center
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{account.healthScore}</span>
            <span className="text-sm text-slate-500 ml-1">/100</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${account.healthScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            account.healthScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {account.status}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Churn Risk</span>
              <span className="text-slate-900 dark:text-white font-bold">{account.churnRisk}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${account.churnRisk > 50 ? 'bg-red-500' : account.churnRisk > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${account.churnRisk}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Upsell Probability</span>
              <span className="text-slate-900 dark:text-white font-bold">{account.upsellProbability}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${account.upsellProbability}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Renewal Probability</span>
              <span className="text-slate-900 dark:text-white font-bold">{account.renewalProbability}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${account.renewalProbability < 50 ? 'bg-red-500' : account.renewalProbability < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${account.renewalProbability}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Hierarchy */}
      {account.hierarchy && account.hierarchy.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Network className="w-5 h-5 text-blue-500" />
            Key Stakeholders
          </h3>
          <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {account.hierarchy.map((node, i) => (
              <div key={i} className="relative pl-12 group">
                <div className="absolute left-[15px] top-6 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900 z-10" />
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                      {node.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5 truncate">{node.role}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{node.name}</p>
                      {node.parent && <p className="text-[10px] text-slate-500 mt-0.5 truncate">Reports to: <span className="font-medium text-slate-700 dark:text-slate-300">{node.parent}</span></p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
