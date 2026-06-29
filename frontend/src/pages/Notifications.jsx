import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, Trash2, Search, Filter, ArrowUpDown, Clock, Target, Sparkles, AlertCircle,
  CheckCircle, Calendar, Phone, Handshake, AlertTriangle, ShieldAlert, MessageSquare,
  ChevronRight, CheckCheck, X, BarChart3, Zap, BellOff, RefreshCw, SlidersHorizontal,
  TrendingUp, Users, Tag
} from 'lucide-react';
import { notificationsApi } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import NotificationSettingsModal from '../components/layout/NotificationSettingsModal';

export default function Notifications() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  // Data & Pagination States
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, today: 0, highPriority: 0 });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { lastNotification } = useWebSocket();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const observer = useRef();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastNotification && page === 0) {
      const matchesSearch = !debouncedSearch ||
        lastNotification.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lastNotification.message?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'unread' && !lastNotification.isRead);
      if (matchesSearch && matchesStatus) {
        setNotifications(prev => [lastNotification, ...prev]);
        setStats(prev => ({ ...prev, total: prev.total + 1, unread: prev.unread + 1, today: prev.today + 1 }));
      }
    }
  }, [lastNotification]);

  // Fetch on filter change
  useEffect(() => {
    setPage(0);
    setNotifications([]);
    setHasMore(true);
    fetchStats();
    fetchData(0, true);
  }, [debouncedSearch, activeTab, dateFilter, sortOrder, priorityFilter, statusFilter]);

  const fetchStats = async () => {
    try {
      const d = await notificationsApi.getStats();
      setStats(d || { total: 0, unread: 0, today: 0, highPriority: 0 });
    } catch (err) { console.error(err); }
  };

  const fetchData = async (pageNum, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = {
        page: pageNum, size: 20,
        search: debouncedSearch,
        type: activeTab !== 'all' ? activeTab : null,
        isRead: statusFilter === 'unread' ? false : (statusFilter === 'read' ? true : null),
        dateRange: dateFilter,
        sort: sortOrder,
        priority: priorityFilter !== 'all' ? priorityFilter.toUpperCase() : null,
      };
      const response = await notificationsApi.getAll(params);
      console.log('Notifications API response:', response);
      const newItems = response?.content || [];
      setNotifications(prev => isInitial ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === 20 && !response.last);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchData(page + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, page, debouncedSearch, activeTab, dateFilter, sortOrder, priorityFilter, statusFilter]);

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(id);
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(id);
      await notificationsApi.delete(id);
      const item = notifications.find(n => n.id === id);
      if (item && !item.isRead) setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading('markAll');
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleClearAllRead = async () => {
    try {
      setActionLoading('clearRead');
      await notificationsApi.clearAllRead();
      setNotifications(prev => prev.filter(n => !n.isRead));
      fetchStats();
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setDateFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortOrder('newest');
  };

  const hasActiveFilters = activeTab !== 'all' || dateFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '';

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Today • ${time}`;
  if (diffDays === 1) return `Yesterday • ${time}`;
  // If within the same week (7 days), show weekday
  if (diffDays < 7) {
    const weekday = d.toLocaleString('default', { weekday: 'short' });
    return `${weekday} • ${time}`;
  }
  // If within the same month, show day and month
  if (now.getMonth() === d.getMonth() && now.getFullYear() === d.getFullYear()) {
    return `${day} ${month} • ${time}`;
  }
  // Fallback to month day
  return `${day} ${month} • ${time}`;
};

  const getTypeConfig = (type, title = '') => {
    const configs = {
      NEW_LEAD_ASSIGNED: { icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30', label: 'New Lead' },
      LEAD_STATUS_CHANGED: { icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-100 dark:border-teal-800/30', label: 'Lead Update' },
      FOLLOW_UP_REMINDER: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/30', label: 'Follow-up' },
      TASK_DUE: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/30', label: 'Task Due' },
      TASK_OVERDUE: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/30', label: 'Overdue' },
      TASK_COMPLETED: { icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/30', label: 'Completed' },
      TASK_ASSIGNED: { icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/30', label: 'Task' },
      MEETING_SCHEDULED: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800/30', label: 'Meeting' },
      MEETING_REMINDER: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800/30', label: 'Meeting' },
      MEETING_CANCELLED: { icon: Calendar, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/30', label: 'Cancelled' },
      MEETING_COMPLETED: { icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30', label: 'Done' },
      CALL_REMINDER: { icon: Phone, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-100 dark:border-cyan-800/30', label: 'Call' },
      DEAL_WON: { icon: Handshake, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-100 dark:border-pink-800/30', label: 'Deal Won' },
      DEAL_LOST: { icon: AlertTriangle, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/30', border: 'border-slate-200 dark:border-slate-700', label: 'Deal Lost' },
      SYSTEM_ALERT: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-800/30', label: 'System' },
      USER_MENTION: { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-100 dark:border-violet-800/30', label: 'Mention' },
    };

    if (configs[type]) return configs[type];

    // Fallback: infer from title keywords when notificationType is null
    const t = (title || '').toLowerCase();
    if (t.includes('lead')) return configs.LEAD_STATUS_CHANGED;
    if (t.includes('deal won')) return configs.DEAL_WON;
    if (t.includes('deal lost') || t.includes('deal closed lost')) return configs.DEAL_LOST;
    if (t.includes('deal')) return { icon: Handshake, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-100 dark:border-pink-800/30', label: 'Deal' };
    if (t.includes('meeting')) return configs.MEETING_SCHEDULED;
    if (t.includes('call')) return configs.CALL_REMINDER;
    if (t.includes('overdue')) return configs.TASK_OVERDUE;
    if (t.includes('completed') || t.includes('done')) return configs.TASK_COMPLETED;
    if (t.includes('task') || t.includes('due')) return configs.TASK_DUE;
    if (t.includes('follow') || t.includes('reminder')) return configs.FOLLOW_UP_REMINDER;
    if (t.includes('system') || t.includes('alert') || t.includes('maintenance')) return configs.SYSTEM_ALERT;
    if (t.includes('mention')) return configs.USER_MENTION;
    if (t.includes('assign')) return configs.NEW_LEAD_ASSIGNED;

    return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/30', border: 'border-slate-200 dark:border-slate-700', label: 'Alert' };
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'HIGH') return { text: 'High', cls: 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/30' };
    if (priority === 'MEDIUM') return { text: 'Medium', cls: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30' };
    if (priority === 'LOW') return { text: 'Low', cls: 'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700' };
    return null;
  };

  const categoryTabs = [
    { id: 'all', label: 'All', icon: Bell, count: stats.total },
    { id: 'leads', label: 'Leads', icon: Target, count: null },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle, count: null },
    { id: 'meetings', label: 'Meetings', icon: Calendar, count: null },
    { id: 'deals', label: 'Deals', icon: Handshake, count: null },
    { id: 'system', label: 'System', icon: ShieldAlert, count: null },
    { id: 'mentions', label: 'Mentions', icon: MessageSquare, count: null },
    { id: 'reminders', label: 'Reminders', icon: Clock, count: null },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#0d1117] text-slate-800 dark:text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage all your CRM alerts and updates</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800/50"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </motion.button>
              )}
              <button
                onClick={() => { fetchStats(); fetchData(0, true); }}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <NotificationSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: BarChart3, from: 'from-blue-500', to: 'to-blue-600', shadow: 'shadow-blue-500/20' },
            { label: 'Unread', value: stats.unread, icon: Bell, from: 'from-amber-500', to: 'to-orange-500', shadow: 'shadow-amber-500/20' },
            { label: "Today", value: stats.today, icon: Zap, from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20' },
            { label: 'High Priority', value: stats.highPriority, icon: AlertCircle, from: 'from-red-500', to: 'to-rose-600', shadow: 'shadow-red-500/20' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-[#161b22] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.from} ${card.to} flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Layout ── */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* ── Left Sidebar ── */}
          <div className="w-full xl:w-72 shrink-0 space-y-4 xl:sticky xl:top-6">

            {/* Category Filter */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categories</h3>
              </div>
              <div className="p-3 space-y-0.5">
                {categoryTabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== null && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quick Filters</h3>
              </div>
              <div className="p-4 space-y-5">

                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">Read Status</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setStatusFilter(val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${statusFilter === val
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">Priority</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[['all', 'All'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setPriorityFilter(val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${priorityFilter === val
                            ? val === 'high' ? 'bg-red-500 text-white shadow-sm'
                              : val === 'medium' ? 'bg-amber-500 text-white shadow-sm'
                                : val === 'low' ? 'bg-slate-500 text-white shadow-sm'
                                  : 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">Date Range</p>
                  <div className="space-y-1">
                    {[['all', 'Any Time'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['this_week', 'This Week'], ['this_month', 'This Month']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setDateFilter(val)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${dateFilter === val
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quick Actions</h3>
              </div>
              <div className="p-3 space-y-1">
                <button
                  onClick={handleMarkAllRead}
                  disabled={stats.unread === 0 || actionLoading === 'markAll'}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-blue-500" />
                  Mark all as read
                  {stats.unread > 0 && <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-bold">{stats.unread}</span>}
                </button>
                <button
                  onClick={handleClearAllRead}
                  disabled={stats.total - stats.unread === 0 || actionLoading === 'clearRead'}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Clear all read
                </button>
              </div>
            </div>
          </div>

          {/* ── Main Feed ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Search & Sort Bar */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by title, message, type..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 pl-10 pr-10 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-sm">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="bg-transparent border-none outline-none font-medium cursor-pointer text-slate-700 dark:text-slate-300 text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active filter pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {activeTab !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                      Type: {activeTab}
                      <button onClick={() => setActiveTab('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {priorityFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                      Priority: {priorityFilter}
                      <button onClick={() => setPriorityFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      Date: {dateFilter.replace('_', ' ')}
                      <button onClick={() => setDateFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Notification List */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              {loading ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-5 flex items-start gap-4 animate-pulse">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-3 pt-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                        </div>
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <BellOff className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">No notifications found</h3>
                  <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                    {hasActiveFilters ? 'No alerts match your current filters.' : "You're all caught up! No new notifications."}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  <AnimatePresence initial={false}>
                    {notifications.map((n, idx) => {
                      const cfg = getTypeConfig(n.notificationType, n.title);
                      const TypeIcon = cfg.icon;
                      const priorityBadge = getPriorityBadge(n.priority);
                      const isLast = idx === notifications.length - 1;

                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          ref={isLast ? lastElementRef : null}
                          onClick={() => {
                            if (!n.isRead) handleMarkRead(n.id);
                            if (n.actionUrl) navigate(n.actionUrl);
                          }}
                          className={`relative group flex items-start gap-4 p-5 cursor-pointer transition-all duration-200 ${!n.isRead
                              ? 'bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                              : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                            }`}
                        >
                          {/* Unread accent bar */}
                          {!n.isRead && (
                            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-blue-500 rounded-r-full" />
                          )}

                          {/* Icon */}
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
                            <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-12">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-0.5" />
                                )}
                                <h5 className={`text-sm leading-snug truncate ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                  {n.title}
                                </h5>
                              </div>
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
                                {formatTime(n.createdAt)}
                              </span>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                              {n.message}
                            </p>

                            {/* Badges row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              {priorityBadge && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${priorityBadge.cls}`}>
                                  {priorityBadge.text}
                                </span>
                              )}
                              {n.relatedEntityType && n.relatedEntityId && (
                                <a href={`/${n.relatedEntityType.toLowerCase()}/${n.relatedEntityId}`}
                                   className="text-blue-500 hover:underline text-xs"
                                   onClick={(e) => e.stopPropagation()}
                                >
                                  Ref: {n.relatedEntityId} &gt;
                                </a>
                              )}
                              {n.actionUrl && (
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  View <ChevronRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                            {!n.isRead && (
                              <button
                                disabled={actionLoading === n.id}
                                onClick={e => handleMarkRead(n.id, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              disabled={actionLoading === n.id}
                              onClick={e => handleDelete(n.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {loadingMore && (
                    <div className="py-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                      Loading more...
                    </div>
                  )}
                  {!hasMore && notifications.length > 0 && (
                    <div className="py-5 text-center text-xs font-medium text-slate-400">
                      All notifications loaded · {notifications.length} total
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
