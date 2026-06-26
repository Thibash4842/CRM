import { Building2, MapPin, Calendar, Users, Phone, Mail, FileDigit, ShieldCheck } from 'lucide-react';

export default function AccountOverview({ account }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Company Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" />
          Company Information
        </h3>

        <div className="space-y-0">
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Industry</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 truncate">{account.industry}</span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Employees</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 flex items-center gap-2 truncate">
              <Users className="w-4 h-4 text-slate-400 shrink-0" /> {account.employeeCount}
            </span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Founded</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 truncate">{account.foundedYear}</span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Tax ID / GST</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 flex items-center gap-2 truncate">
              <FileDigit className="w-4 h-4 text-slate-400 shrink-0" /> {account.taxId}
            </span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Address</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 flex items-center gap-2 truncate" title={account.address}>
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{account.address}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Relationship Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Relationship Information
        </h3>

        <div className="space-y-0">
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Owner</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 flex items-center gap-2 truncate">
              <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs">
                {account.owner.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="truncate">{account.owner}</span>
            </span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Customer Since</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 flex items-center gap-2 truncate">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{new Date(account.customerSince).toLocaleDateString()}</span>
            </span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Territory</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 truncate">{account.territory}</span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Last Contact</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 truncate">{account.lastActivity}</span>
          </div>
          <div className="flex items-center py-3 border-b border-slate-100 last:border-0 dark:border-slate-800/50">
            <span className="text-sm font-medium text-slate-500 w-32 xl:w-40 shrink-0">Renewal Date</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1 truncate">
              {account.renewalDate ? new Date(account.renewalDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Description / About */}
      <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">About {account.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {account.description}
        </p>
      </div>
    </div>
  );
}
