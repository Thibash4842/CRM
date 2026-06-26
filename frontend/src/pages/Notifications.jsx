import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, Eye, EyeOff, Archive, Trash2, Search, Filter,
  ArrowUpDown, Calendar, Sparkles, AlertCircle, AlertTriangle,
  Clock, ShieldAlert, Target, CheckCircle, Phone, Handshake,
  MessageSquare, ChevronRight, Zap, RefreshCw, PlusCircle, Settings,
  MoreHorizontal
} from 'lucide-react';
import { notificationsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/Card';

export default function Notifications() {
  const navigate = useNavigate();

  // Loading & Data States
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, today: 0, highPriority: 0 });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, unread, leads, tasks, meetings, calls, deals, system
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, this_week, older
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest

  // Fetch data
  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const statsData = await notificationsApi.getStats();
      setStats(statsData || { total: 0, unread: 0, today: 0, highPriority: 0 });

      const suggestionsData = await notificationsApi.getAiSuggestions();
      setAiSuggestions(suggestionsData || []);

      const listData = await notificationsApi.getAll({
        search: searchQuery,
        type: activeTab,
        dateRange: dateFilter,
        sort: sortOrder
      });
      setNotifications(listData || []);
    } catch (err) {
      console.error('Error fetching notification center data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, activeTab, dateFilter, sortOrder]);

  // Poll for updates (real-time experience)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [searchQuery, activeTab, dateFilter, sortOrder]);

  // Action Handlers
  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      fetchData();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkUnread = async (id) => {
    try {
      await notificationsApi.markUnread(id);
      fetchData();
    } catch (err) {
      console.error('Failed to mark unread:', err);
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationsApi.archive(id);
      fetchData();
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.delete(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Bulk Actions
  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      fetchData(true);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleArchiveAll = async () => {
    try {
      await notificationsApi.archiveAll();
      fetchData(true);
    } catch (err) {
      console.error('Failed to archive all:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to permanently delete all notifications?')) {
      try {
        await notificationsApi.deleteAll();
        fetchData(true);
      } catch (err) {
        console.error('Failed to delete all:', err);
      }
    }
  };

  const handleCreateMock = async (customType = '') => {
    try {
      await notificationsApi.createMockNotification(customType);
      fetchData(true);
    } catch (err) {
      console.error('Failed to create mock:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'NEW_LEAD_ASSIGNED':
        return { icon: Target, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      case 'LEAD_STATUS_CHANGED':
        return { icon: Sparkles, bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' };
      case 'FOLLOW_UP_REMINDER':
        return { icon: Clock, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
      case 'TASK_DUE':
        return { icon: AlertCircle, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
      case 'TASK_COMPLETED':
        return { icon: CheckCircle, bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' };
      case 'MEETING_REMINDER':
        return { icon: Calendar, bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' };
      case 'CALL_REMINDER':
        return { icon: Phone, bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' };
      case 'DEAL_WON':
        return { icon: Handshake, bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' };
      case 'DEAL_LOST':
        return { icon: AlertTriangle, bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' };
      case 'SYSTEM_ALERT':
        return { icon: ShieldAlert, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' };
      case 'USER_MENTION':
        return { icon: MessageSquare, bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' };
      default:
        return { icon: Bell, bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' };
    }
  };

  const getSmartSections = () => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    notifications.forEach(n => {
      const created = new Date(n.createdAt);
      if (created >= todayStart) {
        today.push(n);
      } else if (created >= yesterdayStart) {
        yesterday.push(n);
      } else if (created >= weekStart) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return [
      { id: 'today', title: 'Today', items: today },
      { id: 'yesterday', title: 'Yesterday', items: yesterday },
      { id: 'thisWeek', title: 'This Week', items: thisWeek },
      { id: 'older', title: 'Older', items: older }
    ].filter(section => section.items.length > 0);
  };

  const sections = getSmartSections();

  // Category statistics helpers to render on filter tabs
  const getCategoryCount = (catId) => {
    if (catId === 'all') return stats.total;
    if (catId === 'unread') return stats.unread;
    return notifications.filter(n => {
      const nt = n.type;
      switch (catId) {
        case 'leads':
          return nt === 'NEW_LEAD_ASSIGNED' || nt === 'LEAD_STATUS_CHANGED' || nt === 'FOLLOW_UP_REMINDER';
        case 'tasks':
          return nt === 'TASK_DUE' || nt === 'TASK_COMPLETED';
        case 'meetings':
          return nt === 'MEETING_REMINDER';
        case 'calls':
          return nt === 'CALL_REMINDER';
        case 'deals':
          return nt === 'DEAL_WON' || nt === 'DEAL_LOST';
        case 'system':
          return nt === 'SYSTEM_ALERT';
        default:
          return false;
      }
    }).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 font-sans antialiased">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Header Widget */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-md text-slate-500 dark:text-slate-400 mt-1">Review alerts, pending activities, and automated CRM updates.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSimulate(!showSimulate)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Simulate Alerts</span>
            </button>
            <button
              onClick={() => handleCreateMock()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/15 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Quick Mock Alert</span>
            </button>
          </div>
        </div>

        {/* Premium Compact Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { title: "Total Alerts", value: stats.total, icon: Bell, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/30" },
            { title: "Unread Alerts", value: stats.unread, icon: AlertCircle, gradient: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/30" },
            { title: "Today's Alerts", value: stats.today, icon: Calendar, gradient: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/30" },
            { title: "High Priority", value: stats.highPriority, icon: AlertTriangle, gradient: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/30" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 group"
            >
              <div className={`absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-[0.08] dark:opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`} />

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                    {stat.value}
                  </p>
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>

              <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${stat.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </motion.div>
          ))}
        </div>

        {/* Mock Alert Simulation Expandable Panel */}
        <AnimatePresence>
          {showSimulate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Simulate Alert Pipelines</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click any type to trigger a real-time event. This updates badges and pushes active notifications.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'NEW_LEAD_ASSIGNED', label: 'Lead Assigned' },
                    { type: 'DEAL_WON', label: 'Deal Won' },
                    { type: 'USER_MENTION', label: 'Mention' },
                    { type: 'TASK_DUE', label: 'Task Due' },
                    { type: 'SYSTEM_ALERT', label: 'System Alert' }
                  ].map(sim => (
                    <button
                      key={sim.type}
                      onClick={() => handleCreateMock(sim.type)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all cursor-pointer"
                    >
                      {sim.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Filter & Feed Section */}
        <div className="space-y-4">

          {/* Unified Control Bar: Search, Date Filter, Sort, Bulk actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm space-y-4">

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200/50 dark:border-slate-800/50 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Combobox Selectors */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-sm text-slate-600 dark:text-slate-300">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent border-none outline-none font-medium cursor-pointer"
                  >
                    <option value="all">Any Date</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this_week">This Week</option>
                    <option value="older">Older</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-sm text-slate-600 dark:text-slate-300">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent border-none outline-none font-medium cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Slick Pill tabs with numbers */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-3 flex-wrap">
              <div className="flex items-center gap-1 pb-1 scrollbar-none flex-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'leads', label: 'Leads' },
                  { id: 'tasks', label: 'Tasks' },
                  { id: 'meetings', label: 'Meetings' },
                  { id: 'calls', label: 'Calls' },
                  { id: 'deals', label: 'Deals' },
                  { id: 'system', label: 'System' }
                ].map(tab => {
                  const count = getCategoryCount(tab.id);
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 border-r border-gray-200 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                      <span>{tab.label}</span>
                      {count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                          ? 'bg-indigo-700/50 text-indigo-100'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tiny Inline Bulk Actions */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                <button
                  onClick={handleMarkAllRead}
                  disabled={stats.unread === 0}
                  className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-40 cursor-pointer animate-none"
                >
                  Mark read
                </button>
                <span className="text-slate-200 dark:text-slate-800">|</span>
                <button
                  onClick={handleArchiveAll}
                  disabled={stats.total === 0}
                  className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-40 cursor-pointer animate-none"
                >
                  Archive all
                </button>
                <span className="text-slate-200 dark:text-slate-800">|</span>
                <button
                  onClick={handleDeleteAll}
                  disabled={stats.total === 0}
                  className="px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500/80 hover:text-red-600 transition-colors disabled:opacity-40 cursor-pointer animate-none"
                >
                  Clear all
                </button>
              </div>
            </div>

          </div>

          {/* List Row Feed */}
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="p-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 border-dashed rounded-2xl p-8 text-center shadow-sm flex flex-col items-center justify-center"
            >
              <div className="rounded-full bg-slate-50 dark:bg-slate-950/80 p-4 text-slate-400 dark:text-slate-600 mb-4 border border-slate-100 dark:border-slate-900">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">All caught up!</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                No active alerts matching your criteria. Simulate events to test the flow.
              </p>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800/50 overflow-hidden">
              {sections.map(section => (
                <div key={section.id} className="divide-y divide-slate-100 dark:divide-slate-800/50">

                  {/* Smart Section Header */}
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{section.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/65 dark:bg-slate-800 text-sm text-slate-500">{section.items.length}</span>
                  </div>

                  {/* Section items */}
                  {section.items.map(n => {
                    const { icon: TypeIcon, bg: typeBg, text: typeText } = getTypeConfig(n.type);
                    return (
                      <div
                        key={n.id}
                        className={`p-4 relative group flex items-start gap-4 border-b border-slate-100 transition-all duration-150 ${!n.isRead
                          ? 'bg-indigo-500/[0.02] dark:bg-indigo-400/[0.01]'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-950/10'
                          }`}
                      >
                        {/* Unread tiny side dot */}
                        {!n.isRead && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                        )}

                        {/* Circular Small Source Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeBg} ${typeText}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>

                        {/* Card Text details */}
                        <div className="flex-1 min-w-0 pr-24 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className={`text-base font-semibold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              {n.title}
                            </h5>

                            {/* Small priority tag */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border shrink-0 ${n.priority === 'HIGH'
                              ? 'bg-rose-50/50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
                              : n.priority === 'MEDIUM'
                                ? 'bg-amber-50/50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                                : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-950/20 dark:border-slate-800/30 dark:text-slate-400'
                              }`}>
                              {n.priority}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>

                          {/* Secondary Row Metadata */}
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1 select-none flex-wrap">
                            <span>{formatDateLabel(n.createdAt)} • {formatTime(n.createdAt)}</span>
                            {n.relatedRecordName && (
                              <>
                                <span className="text-slate-200 dark:text-slate-800">•</span>
                                <div className="flex items-center gap-1 font-semibold">
                                  <span className="text-slate-400">Ref:</span>
                                  {n.relatedRecordLink ? (
                                    <button
                                      onClick={() => navigate(n.relatedRecordLink)}
                                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                                    >
                                      <span>{n.relatedRecordName}</span>
                                      <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                                    </button>
                                  ) : (
                                    <span className="text-slate-600 dark:text-slate-300">{n.relatedRecordName}</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Embedded Action Panel (Appears on Hover, Absolute Right) */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 pl-4 py-1.5 rounded-l-xl">
                          {n.isRead ? (
                            <button
                              onClick={() => handleMarkUnread(n.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Mark as unread"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="p-1.5 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Mark as read"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleArchive(n.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(n.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
