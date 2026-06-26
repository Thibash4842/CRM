import { Phone, Mail, Calendar, CheckCircle2, Globe, MessageCircle, FileText, Eye } from 'lucide-react';

const TIMELINE_GROUPS = [
  {
    label: 'Today',
    items: [
      { id: 1, type: 'call', icon: Phone, title: 'Discovery Call', description: 'Discussed new requirements for Q3. They are looking for enterprise features and showed high interest in the analytics module.', time: '10:30 AM', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { id: 2, type: 'email', icon: Mail, title: 'Email Opened: Proposal v2', description: 'Contact opened the proposal email and clicked on the pricing link.', time: '9:15 AM', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ]
  },
  {
    label: 'Yesterday',
    items: [
      { id: 3, type: 'email', icon: Mail, title: 'Sent Updated Proposal', description: 'Sent the updated pricing proposal with Enterprise tier options and volume discounts.', time: '2:15 PM', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      { id: 4, type: 'website', icon: Eye, title: 'Visited Pricing Page', description: 'Contact viewed the pricing page for 4 minutes and compared Enterprise vs. Business tiers.', time: '11:42 AM', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ]
  },
  {
    label: 'This Week',
    items: [
      { id: 5, type: 'meeting', icon: Calendar, title: 'Product Demo', description: 'Showcased the new analytics dashboard and reporting module. Positive feedback received from the tech team.', time: 'Mon, 3:00 PM', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
      { id: 6, type: 'note', icon: FileText, title: 'Note Added', description: 'Decision maker confirmed. Budget approved for Q3. Key stakeholders identified.', time: 'Mon, 11:00 AM', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
      { id: 7, type: 'task', icon: CheckCircle2, title: 'Task Completed: Send Intro Material', description: 'Completed sending introductory materials and product documentation.', time: 'Mon, 9:30 AM', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ]
  },
  {
    label: 'This Month',
    items: [
      { id: 8, type: 'call', icon: Phone, title: 'Initial Contact', description: 'First outreach call. Contact expressed interest and requested a demo.', time: 'Jun 5, 2:00 PM', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { id: 9, type: 'email', icon: Globe, title: 'Inbound Lead Captured', description: 'Contact filled out the "Request a Demo" form on the website.', time: 'Jun 3, 10:20 AM', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ]
  }
];

export default function ContactTimeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Activity Timeline</h3>
        <div className="flex items-center gap-2">
          {['All', 'Calls', 'Emails', 'Meetings'].map(filter => (
            <button key={filter} className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'All'
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      {TIMELINE_GROUPS.map(group => (
        <div key={group.label}>
          {/* Group Label */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{group.label}</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Items */}
          <div className="relative ml-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-5 pb-2">
            {group.items.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative pl-7 group">
                  {/* Dot */}
                  <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-lg flex items-center justify-center ${item.bg} ${item.color} border-2 border-white dark:border-slate-950 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Content */}
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-3.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">{item.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
