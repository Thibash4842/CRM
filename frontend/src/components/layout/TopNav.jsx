import { Menu, Bell, Sun, Moon, LogOut, Search, Target, Sparkles, Clock, AlertCircle, CheckCircle, Calendar, Phone, Handshake, AlertTriangle, ShieldAlert, MessageSquare, Check, Trash2, ArrowRight, CheckCheck, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { notificationsApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [hasHighPriority, setHasHighPriority] = useState(false);

  const [showPanel, setShowPanel] = useState(false);
  const [panelNotifications, setPanelNotifications] = useState([]);
  const panelRef = useRef(null);
  const showPanelRef = useRef(showPanel);

  useEffect(() => {
    showPanelRef.current = showPanel;
    if (showPanel) {
      notificationsApi.getAll().then(list => setPanelNotifications(list || []));
    }
  }, [showPanel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeConfig = (type) => {
    switch (type) {
      case 'NEW_LEAD_ASSIGNED': return { icon: Target, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      case 'LEAD_STATUS_CHANGED': return { icon: Sparkles, bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' };
      case 'FOLLOW_UP_REMINDER': return { icon: Clock, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
      case 'TASK_DUE': return { icon: AlertCircle, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
      case 'TASK_COMPLETED': return { icon: CheckCircle, bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' };
      case 'MEETING_REMINDER': return { icon: Calendar, bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' };
      case 'CALL_REMINDER': return { icon: Phone, bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' };
      case 'DEAL_WON': return { icon: Handshake, bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' };
      case 'DEAL_LOST': return { icon: AlertTriangle, bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' };
      case 'SYSTEM_ALERT': return { icon: ShieldAlert, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' };
      case 'USER_MENTION': return { icon: MessageSquare, bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' };
      default: return { icon: Bell, bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' };
    }
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markRead(id);
      const list = await notificationsApi.getAll();
      setPanelNotifications(list || []);
      const stats = await notificationsApi.getStats();
      setUnreadCount(stats?.unread || 0);
      setHasHighPriority((stats?.highPriority || 0) > 0);
    } catch (err) { }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      const list = await notificationsApi.getAll();
      setPanelNotifications(list || []);
      setUnreadCount(0);
      setHasHighPriority(false);
    } catch (err) { }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.delete(id);
      const list = await notificationsApi.getAll();
      setPanelNotifications(list || []);
      const stats = await notificationsApi.getStats();
      setUnreadCount(stats?.unread || 0);
      setHasHighPriority((stats?.highPriority || 0) > 0);
    } catch (err) { }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    let prevUnread = null;

    const fetchStats = async () => {
      try {
        const res = await notificationsApi.getStats();
        const count = res?.unread || 0;
        setUnreadCount(count);
        setHasHighPriority((res?.highPriority || 0) > 0);

        if (showPanelRef.current) {
          const list = await notificationsApi.getAll();
          setPanelNotifications(list || []);
        }

        if (prevUnread !== null && count > prevUnread) {
          setShouldShake(true);
          try {
            const list = await notificationsApi.getAll({ isRead: false });
            if (list && list.length > 0) {
              setActiveToast(list[0]);
              setTimeout(() => setActiveToast(null), 4000);
            }
          } catch (e) {
            console.error("Failed to fetch latest notification for toast", e);
          }
          setTimeout(() => setShouldShake(false), 2500);
        }
        prevUnread = count;
      } catch (err) {
        console.error("Failed to fetch notification stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/50 dark:border-slate-700/50">
      {/* Toast Popup */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
          >
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {activeToast.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {activeToast.description}
              </p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 text-lg cursor-pointer"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
            />
            <kbd className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <div className="relative" ref={panelRef}>
            <motion.button
              onClick={() => setShowPanel(!showPanel)}
              animate={shouldShake ? {
                rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
                scale: [1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1]
              } : {}}
              transition={{ duration: 2.5 }}
              className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 glass bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[85vh]"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {panelNotifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {panelNotifications.slice(0, 10).map((n) => {
                          const { icon: TypeIcon, bg: typeBg } = getTypeConfig(n.type);
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                handleMarkRead(n.id);
                                if (n.relatedEntityId) {
                                  setShowPanel(false);
                                }
                              }}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex items-start gap-3 relative ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                                }`}
                            >
                              {!n.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                              )}

                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${typeBg}`}>
                                <TypeIcon className="w-4.5 h-4.5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                  <p className={`text-sm truncate pr-4 ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                    {n.title}
                                  </p>
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
                                    {formatTime(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {n.description}
                                </p>
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 flex flex-col gap-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-md p-1 z-10">
                                {!n.isRead && (
                                  <button onClick={(e) => handleMarkRead(n.id, e)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Mark as read">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button onClick={(e) => handleDelete(n.id, e)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <button
                      onClick={() => {
                        setShowPanel(false);
                        navigate('/notifications');
                      }}
                      className="w-full py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      View All Notifications
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
