import { Phone, Mail, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import Button from '../../ui/Button';

export default function AccountContacts({ contacts }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        No contacts linked to this account.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {contacts.map(contact => (
        <div key={contact.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{contact.name}</h4>
                <p className="text-xs text-slate-500">{contact.title}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`mailto:${contact.email}`} className="truncate hover:text-indigo-500">{contact.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{contact.phone}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${contact.role === 'Decision Maker' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
              contact.role === 'Champion' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
              {contact.role === 'Decision Maker' && <CheckCircle2 className="w-3 h-3" />}
              {contact.role}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="!text-xs !py-1 !px-2">Email</Button>
              <Button size="sm" className="!text-xs !py-1 !px-2">Call</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
