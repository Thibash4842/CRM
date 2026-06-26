import { useEffect, useState } from 'react';
import { Users, Handshake, Building2, DollarSign, TrendingUp, Activity, CheckSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import { StatCard } from '../components/ui/Card';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/PageHeader';
import { formatCurrency, formatDateTime } from '../utils/constants';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-slate-500">Failed to load dashboard</div>;

  const pieData = Object.entries(data.dealsByStage || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={data.totalLeads} icon={Users} color="from-blue-500 to-cyan-500" />
        <StatCard title="Active Deals" value={data.activeDeals} icon={Handshake} color="from-purple-500 to-pink-500" />
        <StatCard title="Total Clients" value={data.totalClients} icon={Building2} color="from-emerald-500 to-teal-500" />
        <StatCard title="Revenue" value={formatCurrency(data.revenue)} icon={DollarSign} color="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlySales || []}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#colorSales)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Conversion Rate</h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="8"
                  strokeDasharray={`${data.conversionRate * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{data.conversionRate}%</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Recent Activities</h3>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {(data.recentActivities || []).map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(activity.createdAt)} · {activity.userName}</p>
                </div>
              </div>
            ))}
            {(!data.recentActivities || data.recentActivities.length === 0) && (
              <p className="text-center text-slate-500 py-8">No recent activities</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(data.upcomingTasks || []).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className={`w-1 h-10 rounded-full ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-slate-500">Due: {formatDateTime(task.dueDate)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{task.status}</span>
              </div>
            ))}
            {(!data.upcomingTasks || data.upcomingTasks.length === 0) && (
              <p className="text-center text-slate-500 py-8">No upcoming tasks</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
