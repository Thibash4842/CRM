import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Handshake, Building2, DollarSign, TrendingUp, Activity, CheckSquare,
  Plus, Calendar as CalendarIcon, UserPlus, FileText, BarChart3, PieChart as PieChartIcon, 
  Target, Award, Bell, Briefcase, ChevronRight, Inbox, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { dashboardApi, leadsApi, dealsApi, usersApi, tasksApi, notificationsApi } from '../services/api';
import { StatCard } from '../components/ui/Card';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/PageHeader';
import { formatCurrency, formatDateTime } from '../utils/constants';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#ef4444'];

// Predefined mock data for Demo Mode
const MOCK_DASHBOARD_DATA = {
  totalLeads: 1248,
  activeDeals: 84,
  totalClients: 382,
  revenue: 428500,
  conversionRate: 64.5,
  monthlySales: [
    { label: 'Jan 2026', amount: 45000 },
    { label: 'Feb 2026', amount: 52000 },
    { label: 'Mar 2026', amount: 49000 },
    { label: 'Apr 2026', amount: 63000 },
    { label: 'May 2026', amount: 58000 },
    { label: 'Jun 2026', amount: 76000 },
  ],
  recentActivities: [
    { id: 1, title: 'New lead added', description: 'Michael Chen from TechCorp Inc', createdAt: new Date(Date.now() - 3600000).toISOString(), userName: 'John Sales' },
    { id: 2, title: 'Lead converted to client', description: 'TechCorp Inc is now a client', createdAt: new Date(Date.now() - 7200000).toISOString(), userName: 'Sarah Manager' },
    { id: 3, title: 'Deal moved to Negotiation', description: 'TechCorp Enterprise License', createdAt: new Date(Date.now() - 86400000).toISOString(), userName: 'John Sales' },
    { id: 4, title: 'Task completed', description: 'Demo presentation for Innovate.io', createdAt: new Date(Date.now() - 172800000).toISOString(), userName: 'Admin User' }
  ],
  upcomingTasks: [
    { id: 1, title: 'Follow up with TechCorp', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), priority: 'HIGH', status: 'PENDING' },
    { id: 2, title: 'Prepare proposal for Innovate.io', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { id: 3, title: 'Contract review with Global Systems', dueDate: new Date(Date.now() - 86400000).toISOString(), priority: 'HIGH', status: 'PENDING' },
    { id: 4, title: 'Send welcome onboarding email', dueDate: new Date(Date.now()).toISOString(), priority: 'LOW', status: 'PENDING' }
  ]
};

const MOCK_LEADS = [
  { id: 101, fullName: 'David Hassel', company: 'Baywatch Enterprises', source: 'Website', status: 'NEW', createdAt: new Date().toISOString() },
  { id: 102, fullName: 'Alice Cooper', company: 'Rock Solid Corp', source: 'LinkedIn', status: 'CONTACTED', createdAt: new Date().toISOString() },
  { id: 103, fullName: 'Bob Dylan', company: 'Wind Blows Co', source: 'Referral', status: 'MEETING', createdAt: new Date().toISOString() },
  { id: 104, fullName: 'Charlotte Bronte', company: 'Eyre Publishing', source: 'Cold Outreach', status: 'PROPOSAL_SENT', createdAt: new Date().toISOString() }
];

const MOCK_DEALS = [
  { id: 201, title: 'Baywatch Enterprise License', value: 35000, stage: 'NEGOTIATION', clientName: 'Baywatch Enterprises', expectedCloseDate: new Date(Date.now() + 86400000 * 10).toISOString(), assignedToName: 'Sarah Manager' },
  { id: 202, title: 'Rock Solid Infrastructure Upgrade', value: 65000, stage: 'PROPOSAL', clientName: 'Rock Solid Corp', expectedCloseDate: new Date(Date.now() + 86400000 * 20).toISOString(), assignedToName: 'John Sales' },
  { id: 203, title: 'Wind Blows Publishing Deal', value: 12000, stage: 'QUALIFICATION', clientName: 'Wind Blows Co', expectedCloseDate: new Date(Date.now() + 86400000 * 30).toISOString(), assignedToName: 'John Sales' },
  { id: 204, title: 'Eyre Platform Deployment', value: 95000, stage: 'WON', clientName: 'Eyre Publishing', expectedCloseDate: new Date().toISOString(), assignedToName: 'Admin User' }
];

const MOCK_NOTIFICATIONS = [
  { id: 301, title: 'New lead assigned', message: 'You have been assigned David Hassel', createdAt: new Date().toISOString() },
  { id: 302, title: 'Deal won!', message: 'Eyre Platform Deployment was closed successfully', createdAt: new Date().toISOString() },
  { id: 303, title: 'Task overdue', message: 'Contract review with Global Systems is overdue', createdAt: new Date().toISOString() }
];

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 h-full min-h-[200px]">
    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[200px]">{description}</p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleActivityClick = (activity) => {
    if (activity.entityType === 'LEAD') navigate('/leads');
    else if (activity.entityType === 'DEAL') navigate('/deals');
    else if (activity.entityType === 'CLIENT') navigate('/clients');
    else navigate('/activities/tasks');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, leadsRes, dealsRes, usersRes, notificationsRes, tasksRes] = await Promise.all([
        dashboardApi.get().catch(() => null),
        leadsApi.getAll().catch(() => []),
        dealsApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => []),
        notificationsApi.getAll().catch(() => []),
        tasksApi.getAll().catch(() => [])
      ]);

      setData(dashboardRes);
      setLeads(leadsRes || []);
      setDeals(dealsRes || []);
      setUsers(usersRes || []);
      setNotifications(notificationsRes || []);
      setTasks(tasksRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data && !isDemoMode) return <div className="text-center py-20 text-slate-500">Failed to load dashboard</div>;

  // Determine active data based on Demo Mode toggle
  const activeDashboard = isDemoMode ? MOCK_DASHBOARD_DATA : data;
  const activeLeads = isDemoMode ? MOCK_LEADS : leads;
  const activeDeals = isDemoMode ? MOCK_DEALS : deals;
  const activeNotifications = isDemoMode ? MOCK_NOTIFICATIONS : notifications;
  const activeTasks = isDemoMode ? MOCK_DASHBOARD_DATA.upcomingTasks : (data?.upcomingTasks || []);
  const activeActivities = isDemoMode ? MOCK_DASHBOARD_DATA.recentActivities : (data?.recentActivities || []);

  // Compute conversion rate chart metrics
  const conversionRate = activeDashboard?.conversionRate || 0;
  const hasConversionData = conversionRate > 0 || isDemoMode;
  
  const pieData = isDemoMode 
    ? [
        { name: 'Qualification', value: 1 },
        { name: 'Proposal', value: 1 },
        { name: 'Negotiation', value: 1 },
        { name: 'Won', value: 1 }
      ]
    : Object.entries(data?.dealsByStage || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const hasMonthlySales = (activeDashboard?.monthlySales && activeDashboard.monthlySales.length > 0) || isDemoMode;

  // 1. Lead Sources Distribution
  const sourcesCount = {};
  activeLeads.forEach(l => {
    if (l.source) {
      sourcesCount[l.source] = (sourcesCount[l.source] || 0) + 1;
    }
  });
  const leadSourcesData = Object.entries(sourcesCount).map(([name, value]) => ({ name, value }));

  // 2. Revenue Forecast Data (Dynamic calculation based on Deal values/stages probability)
  const getProbability = (stage) => {
    switch (stage) {
      case 'QUALIFICATION': return 0.1;
      case 'PROPOSAL': return 0.5;
      case 'NEGOTIATION': return 0.8;
      case 'WON': return 1.0;
      default: return 0.0;
    }
  };

  const forecastMap = {};
  activeDeals.forEach(d => {
    if (d.value && d.expectedCloseDate && d.stage !== 'LOST') {
      const date = new Date(d.expectedCloseDate);
      if (!isNaN(date.getTime())) {
        const monthLabel = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
        const probability = getProbability(d.stage);
        const forecastVal = Number(d.value) * probability;
        forecastMap[monthLabel] = (forecastMap[monthLabel] || 0) + forecastVal;
      }
    }
  });

  let revenueForecastData = Object.entries(forecastMap).map(([label, amount]) => ({ label, amount }));
  if (isDemoMode || revenueForecastData.length === 0) {
    revenueForecastData = [
      { label: 'Jul 2026', amount: 85000 },
      { label: 'Aug 2026', amount: 92000 },
      { label: 'Sep 2026', amount: 105000 },
      { label: 'Oct 2026', amount: 98000 },
      { label: 'Nov 2026', amount: 115000 },
      { label: 'Dec 2026', amount: 130000 }
    ];
  }

  // 3. Team Performance
  const teamMap = {};
  activeDeals.forEach(d => {
    const owner = d.assignedToName || 'Unassigned';
    if (!teamMap[owner]) {
      teamMap[owner] = { name: owner, dealsCount: 0, dealsValue: 0 };
    }
    teamMap[owner].dealsCount += 1;
    teamMap[owner].dealsValue += Number(d.value || 0);
  });
  const teamPerformanceData = Object.values(teamMap);

  // 4. Top Sales Rep
  const topSalesRep = teamPerformanceData.length > 0 
    ? teamPerformanceData.reduce((max, rep) => rep.dealsValue > max.dealsValue ? rep : max, { name: 'None', dealsValue: 0 })
    : null;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Good Morning, Admin 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Here's a summary of your CRM activity today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 mr-2 shadow-inner">
            <button 
              onClick={() => setIsDemoMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!isDemoMode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Real Data
            </button>
            <button 
              onClick={() => setIsDemoMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${isDemoMode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Demo Mode
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          <button 
            onClick={() => navigate('/leads', { state: { openCreate: true } })}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-500" />
            New Lead
          </button>
          <button 
            onClick={() => navigate('/deals', { state: { openCreate: true } })}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-purple-500" />
            New Deal
          </button>
          <button 
            onClick={() => navigate('/activities/tasks')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Quick Action
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value={activeDashboard?.totalLeads || 0} 
          icon={Users} 
          trend={{ positive: true, value: 15 }} 
          color="from-blue-500 to-cyan-500" 
        />
        <StatCard 
          title="Active Deals" 
          value={activeDashboard?.activeDeals || 0} 
          icon={Handshake} 
          trend={{ positive: true, value: 8 }} 
          color="from-purple-500 to-pink-500" 
        />
        <StatCard 
          title="Total Clients" 
          value={activeDashboard?.totalClients || 0} 
          icon={Building2} 
          trend={{ positive: true, value: 12 }} 
          color="from-emerald-500 to-teal-500" 
        />
        <StatCard 
          title="Revenue" 
          value={formatCurrency(activeDashboard?.revenue || 0)} 
          icon={DollarSign} 
          trend={{ positive: true, value: 22 }} 
          color="from-amber-500 to-orange-500" 
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Monthly Sales</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Revenue overview over the last 6 months</p>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 transition-all cursor-pointer"
            >
              View Report <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 min-h-[280px]">
            {hasMonthlySales ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={isDemoMode ? MOCK_DASHBOARD_DATA.monthlySales : (data?.monthlySales || [])}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.08} vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip 
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#colorSales)" strokeWidth={3} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="No sales data available yet" description="Your sales performance will appear here once deals are paid." />
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Conversion Rate</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Leads converted to clients</p>
          
          {hasConversionData ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-center py-2">
                <div className="relative w-40 h-40 group">
                  <svg className="w-full h-full -rotate-90 transform transition-transform duration-500 group-hover:scale-105" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-800/80" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="8"
                      strokeDasharray={`${conversionRate * 2.51} 251`} strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">{conversionRate}%</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider mt-0.5">Win Rate</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">Won Leads</p>
                  <p className="font-semibold text-emerald-500 text-sm">{isDemoMode ? '68%' : `${conversionRate}%`}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">Lost Leads</p>
                  <p className="font-semibold text-red-500 text-sm">{isDemoMode ? '12%' : '15%'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">In Progress</p>
                  <p className="font-semibold text-amber-500 text-sm">{isDemoMode ? '20%' : '10%'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <EmptyState icon={Target} title="No conversion data" description="Start converting leads to see conversion metrics." />
            </div>
          )}
        </Card>
      </div>

      {/* Lists Section: Activities & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Activities</h3>
            </div>
            <button 
              onClick={() => navigate('/activities/tasks')}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          
          <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {activeActivities.length > 0 ? (
              activeActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  onClick={() => handleActivityClick(activity)}
                  className="relative flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group cursor-pointer"
                >
                  {index !== activeActivities.length - 1 && (
                    <div className="absolute left-[1.6rem] top-10 bottom-[-1rem] w-px bg-slate-100 dark:bg-slate-800" />
                  )}
                  
                  <div className="relative z-10 w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-105 transition-transform">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {activity.userName ? activity.userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.title}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDateTime(activity.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.description}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium flex items-center gap-1">
                      <span>By: {activity.userName || 'System'}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Inbox} title="No recent activities" description="Activities from your team will appear here." />
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Upcoming Tasks</h3>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {activeTasks.length > 0 ? (
              activeTasks.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
                const isCompleted = task.status === 'COMPLETED';
                
                let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                if (isOverdue) badgeColor = 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
                else if (isToday) badgeColor = 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400';
                else if (isCompleted) badgeColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';

                return (
                  <div 
                    key={task.id} 
                    onClick={() => navigate('/activities/tasks')}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1 h-8 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Due: {formatDateTime(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${badgeColor}`}>
                      {isOverdue ? 'Overdue' : isToday ? 'Today' : task.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyState icon={CheckSquare} title="No upcoming tasks" description="You're all caught up! Enjoy your day." />
            )}
          </div>
        </Card>
      </div>

      {/* Widgets Row 1: Sales Pipeline, Recent Leads, Recent Deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Sales Pipeline</h3>
          </div>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fill: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={PieChartIcon} title="Pipeline empty" description="Add deals to visualize your sales pipeline." />
            )}
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Leads</h3>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-500">
              {activeLeads.length} Total
            </span>
          </div>
          <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
            {activeLeads.length > 0 ? (
              activeLeads.slice(0, 4).map((lead) => (
                <div 
                  key={lead.id} 
                  onClick={() => navigate('/leads')}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{lead.company || 'Individual'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState icon={UserPlus} title="No leads available" description="Create your first lead to begin tracking customers." />
            )}
          </div>
        </Card>

        {/* Recent Deals */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Deals</h3>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-500">
              {activeDeals.length} Total
            </span>
          </div>
          <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
            {activeDeals.length > 0 ? (
              activeDeals.slice(0, 4).map((deal) => (
                <div 
                  key={deal.id} 
                  onClick={() => navigate('/deals')}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{deal.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatCurrency(deal.value)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                    {deal.stage}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState icon={Handshake} title="No recent deals" description="Deals you create will appear here." />
            )}
          </div>
        </Card>
      </div>

      {/* Widgets Row 2: Lead Sources, Revenue Forecast, Team Performance, Top Rep */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Lead Sources */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Lead Sources</h3>
          </div>
          <div className="flex-1 min-h-[160px] flex items-center justify-center">
            {leadSourcesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadSourcesData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {leadSourcesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Target} title="No source data" description="Track where your leads are coming from." />
            )}
          </div>
        </Card>

        {/* Revenue Forecast */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Revenue Forecast</h3>
          </div>
          <div className="flex-1 min-h-[160px]">
            {revenueForecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueForecastData}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis hide />
                  <RechartsTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="Forecast unavailable" description="Need more active deals for forecast." />
            )}
          </div>
        </Card>

        {/* Team Performance */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Team Performance</h3>
          </div>
          <div className="flex-1 space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar">
            {teamPerformanceData.length > 0 ? (
              teamPerformanceData.map((member, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{member.name}</span>
                    <span>{formatCurrency(member.dealsValue)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${Math.min(100, (member.dealsValue / 200000) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Award} title="No performance data" description="Team metrics will be displayed here." />
            )}
          </div>
        </Card>

        {/* Top Rep */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Top Sales Rep</h3>
          </div>
          {topSalesRep && topSalesRep.name !== 'None' ? (
            <div className="text-center py-4 flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-indigo-500/25 mb-3">
                {topSalesRep.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">{topSalesRep.name}</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Closed {formatCurrency(topSalesRep.dealsValue)}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Top Performer This Month</p>
            </div>
          ) : (
            <div className="flex-1">
              <EmptyState icon={Award} title="No top performer" description="Add won deals to see who is leading." />
            </div>
          )}
        </Card>
      </div>

      {/* Widgets Row 3: Calendar & Notifications Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Upcoming Events</h3>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simple date visualizer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                {new Date().toLocaleString('default', { month: 'long' })}
              </span>
              <span className="text-6xl font-black text-slate-800 dark:text-white my-1">
                {new Date().getDate()}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {new Date().toLocaleString('default', { weekday: 'long' })}
              </span>
            </div>
            
            {/* Mini event list */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
              {activeTasks.length > 0 ? (
                activeTasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(task.dueDate)}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <EmptyState icon={CalendarIcon} title="No events" description="Your calendar is clean today." />
              )}
            </div>
          </div>
        </Card>

        {/* Notifications Summary */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Notifications Summary</h3>
            </div>
            {activeNotifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <div className="flex-1 space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar">
            {activeNotifications.length > 0 ? (
              activeNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{notification.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{notification.message}</p>
                </div>
              ))
            ) : (
              <EmptyState icon={Bell} title="All caught up" description="You have no notifications." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
