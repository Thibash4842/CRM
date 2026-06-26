import { Mail, Phone, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function AccountTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        No activities logged for this account yet.
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'Email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'Call': return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'Meeting': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'Note': return <FileText className="w-4 h-4 text-amber-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-4 space-y-8 animate-fade-in">
      {timeline.map((item) => (
        <div key={item.id} className="relative pl-8">
          <div className="absolute -left-[17px] top-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-1.5 rounded-full z-10">
            {getIcon(item.type)}
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.user}</span>
                  <span>·</span>
                  <span>{new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                {item.type}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              {item.details}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
