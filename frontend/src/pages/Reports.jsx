import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, FolderKanban, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { reportsApi } from '../services/api';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/PageHeader';
import { formatCurrency } from '../utils/constants';

const reportTabs = [
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'audit', label: 'Audit Logs', icon: Activity },
];

export default function Reports() {
  const { getRevenueStats, auditLogs } = useFinance();
  const [activeTab, setActiveTab] = useState('revenue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'revenue') {
      setData(getRevenueStats());
      setLoading(false);
      return;
    }
    if (activeTab === 'audit') {
      setData(auditLogs);
      setLoading(false);
      return;
    }
    
    const fetchers = {
      revenue: reportsApi.revenue,
      sales: reportsApi.sales,
      leads: reportsApi.leads,
      projects: reportsApi.projects,
    };
    fetchers[activeTab]().then(setData).finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-slate-500 mt-1">Analytics and business insights</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {reportTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id ? 'gradient-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-6">
          {activeTab === 'revenue' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card><p className="text-sm text-slate-500">Net Revenue</p><p className="text-3xl font-bold mt-2">{formatCurrency(data?.totalRevenue - data?.totalExpenses)}</p></Card>
                <Card><p className="text-sm text-slate-500">Collected</p><p className="text-3xl font-bold mt-2 text-emerald-500">{formatCurrency(data?.totalRevenue)}</p></Card>
                <Card><p className="text-sm text-slate-500">Outstanding</p><p className="text-3xl font-bold mt-2 text-amber-500">{formatCurrency(data?.outstanding)}</p></Card>
                <Card><p className="text-sm text-slate-500">Total Expenses</p><p className="text-3xl font-bold mt-2 text-red-500">{formatCurrency(data?.totalExpenses)}</p></Card>
              </div>
            </>
          )}

          {activeTab === 'sales' && (
            <Card>
              <h3 className="font-semibold mb-4">Deals by Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(data?.dealsByStage || []).map((row) => ({
                  stage: row[0], count: row[1], value: row[2],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center mt-4 text-lg">Total Won Value: <strong>{formatCurrency(data?.totalWonValue)}</strong></p>
            </Card>
          )}

          {activeTab === 'leads' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card><p className="text-sm text-slate-500">Total Leads</p><p className="text-3xl font-bold mt-2">{data?.totalLeads}</p></Card>
              <Card><p className="text-sm text-slate-500">Conversion Rate</p><p className="text-3xl font-bold mt-2 text-indigo-600">{data?.conversionRate}%</p></Card>
              <Card>
                <p className="text-sm text-slate-500 mb-3">By Source</p>
                {data?.bySource && Object.entries(data.bySource).map(([source, count]) => (
                  <div key={source} className="flex justify-between text-sm py-1">
                    <span>{source || 'Unknown'}</span><span className="font-medium">{count}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card><p className="text-sm text-slate-500">Total Projects</p><p className="text-3xl font-bold mt-2">{data?.totalProjects}</p></Card>
              <Card>
                <p className="text-sm text-slate-500 mb-3">By Status</p>
                {data?.byStatus && Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm py-1">
                    <span>{status.replace('_', ' ')}</span><span className="font-medium">{count}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {activeTab === 'audit' && (
            <Card>
              <h2 className="text-lg font-bold mb-4">Global Audit Trail</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No audit logs available yet. Perform actions to see them here.</p>
                ) : (
                  data?.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{log.action}</span>
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{log.module}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{log.details}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
