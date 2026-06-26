import { useState } from 'react';
import {
  Building2, Globe, Phone, Mail, MapPin, Calendar, User, Target, Edit, Plus, FileText,
  TrendingUp, TrendingDown, DollarSign, Activity, Users, Briefcase, ChevronRight
} from 'lucide-react';
import Button from '../ui/Button';

// Sub-components for tabs
import AccountOverview from './tabs/AccountOverview';
import AccountContacts from './tabs/AccountContacts';
import AccountDeals from './tabs/AccountDeals';
import AccountTimeline from './tabs/AccountTimeline';
import AccountAnalytics from './tabs/AccountAnalytics';

const TABS = ['Overview', 'Contacts', 'Deals', 'Timeline', 'Analytics', 'Documents'];

function KPICard({ label, value, icon: Icon, trend, isPositive }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-w-0 h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap shrink-0 ${isPositive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
            }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight break-words leading-tight">{value}</h4>
      </div>
    </div>
  );
}

export default function AccountProfile({ account, contacts, deals }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {/* HEADER SECTION */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md shrink-0">
                {account.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{account.name}</h1>
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md shrink-0 ${account.type === 'Customer' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    account.type === 'Prospect' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                    {account.type}
                  </span>
                  {account.status === 'At Risk' && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
                      Churn Risk
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {account.industry}</div>
                  <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> <a href={`https://${account.website}`} target="_blank" className="hover:text-indigo-500 transition-colors">{account.website}</a></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[200px]">{account.address}</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="!h-8 !px-3"><Edit className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
              <Button variant="primary" size="sm" className="!h-8 !px-3"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Contact</Button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 2xl:grid-cols-4 gap-4 mt-6">
            <KPICard label="Annual Revenue" value={formatCurrency(account.revenue)} icon={DollarSign} trend="12%" isPositive={true} />
            <KPICard label="Open Pipeline" value={formatCurrency(account.totalOpportunityValue)} icon={Target} trend="3 active" isPositive={true} />
            <KPICard label="Health Score" value={`${account.healthScore}/100`} icon={Activity} trend={account.healthScore > 80 ? 'Healthy' : 'Warning'} isPositive={account.healthScore > 80} />
            <KPICard label="Lifetime Value" value={formatCurrency(account.ltv)} icon={Briefcase} />
          </div>
        </div>

        {/* TABS */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 pt-2">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pt-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="p-6">
          {activeTab === 'Overview' && <AccountOverview account={account} />}
          {activeTab === 'Contacts' && <AccountContacts contacts={contacts} />}
          {activeTab === 'Deals' && <AccountDeals deals={deals} />}
          {activeTab === 'Timeline' && <AccountTimeline timeline={account.timeline} />}
          {activeTab === 'Analytics' && <AccountAnalytics account={account} />}
          {activeTab === 'Documents' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>Document center coming soon</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
