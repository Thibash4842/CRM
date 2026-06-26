import { TrendingUp, Target, CheckCircle2, AlertCircle, FileText, Calendar, Briefcase, Mail, Phone, Sparkles } from 'lucide-react';
import MiniAnalytics from './MiniAnalytics';

export default function ContactInsights({ contact }) {
  if (!contact) {
    return (
      <div className="h-full bg-white dark:bg-slate-950 border-l border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-500 mb-1">Quick Insights</h3>
        <p className="text-xs text-slate-400 max-w-[180px]">Select a contact to view AI insights and analytics</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-950 border-l border-slate-200/80 dark:border-slate-800/80 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Insights</h3>
        <p className="text-xs text-slate-500 mt-0.5">AI-powered recommendations</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Engagement Score */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Engagement</h4>
            <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" /> High
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">84</span>
            <span className="text-sm text-slate-400">/100</span>
          </div>
          <MiniAnalytics />
        </div>

        {/* AI Next Best Action */}
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wide">AI Next Best Action</h4>
          </div>
          <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed mb-3">
            Contact has viewed the Enterprise pricing tier 3 times today. High probability of upsell.
          </p>
          <button className="w-full h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow-sm transition-colors">
            Draft Upsell Email
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatMini icon={Phone} label="Calls" value="12" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
          <StatMini icon={Mail} label="Emails" value="28" color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
          <StatMini icon={Calendar} label="Meetings" value="5" color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
          <StatMini icon={Briefcase} label="Deals" value="2" color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" />
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-0.5">Upcoming Tasks</h4>
          <div className="space-y-2">
            {[
              { title: 'Send updated proposal', due: 'Tomorrow', priority: 'high' },
              { title: 'Schedule demo with tech team', due: 'Thu, 22 Jun', priority: 'medium' },
              { title: 'Follow up on pricing', due: 'Fri, 23 Jun', priority: 'low' },
            ].map((task, i) => (
              <div key={i} className="group flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 mt-0.5 flex-shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{task.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <AlertCircle className={`w-3 h-3 ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="text-[11px] text-slate-400">{task.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Deals */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-0.5">Open Deals</h4>
          <div className="space-y-2">
            {[
              { name: 'Enterprise License', value: '$48,000', stage: 'Proposal', prob: 75 },
              { name: 'Analytics Add-on', value: '$12,000', stage: 'Negotiation', prob: 60 },
            ].map((deal, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{deal.name}</p>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{deal.value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${deal.prob}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{deal.prob}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-0.5">Files</h4>
          <div className="space-y-1.5">
            {[
              { name: 'Enterprise_Proposal_v2.pdf', size: '2.4 MB' },
              { name: 'Requirements_Q3.docx', size: '1.1 MB' },
              { name: 'Meeting_Notes_Jun14.pdf', size: '0.8 MB' },
            ].map((file, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-center">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
