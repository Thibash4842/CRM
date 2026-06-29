import { useState, useEffect, useRef, useCallback } from 'react';
import ReminderToast from '../ui/ReminderToast';
import NotificationSettingsModal from './NotificationSettingsModal';
import { playNotificationSound } from '../../utils/soundPlayer';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Check, Trash2, ArrowRight, Loader2, AlertCircle, X, CheckCircle } from 'lucide-react';
import { notificationsApi } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import {
  Target, Sparkles, Clock, Calendar, Phone, Handshake, TrendingUp,
  AlertTriangle, ShieldAlert, MessageSquare
} from 'lucide-react';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);

  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Reminder toast state
  const [showReminder, setShowReminder] = useState(false);
  const reminderTimerRef = useRef(null);
  // User preferences (fallback to defaults)
  const [prefs, setPrefs] = useState({
    enableBellAnimation: true,
    enableToastReminder: true,
    reminderInterval: 5,
    enableNotificationSound: true,
    enableDesktopNotifications: true,
    doNotDisturbEnabled: false,
    doNotDisturbStart: null,
    doNotDisturbEnd: null
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const panelRef = useRef(null);

  const { lastNotification, clearLastNotification } = useWebSocket();
  const [toastNotification, setToastNotification] = useState(null);

  // Fetch initial unread count on mount
  useEffect(() => {
    // Load user preferences from localStorage (if any)
    const stored = localStorage.getItem('notificationPrefs');
    if (stored) {
      try {
        const obj = JSON.parse(stored);
        setPrefs(prev => ({ ...prev, ...obj }));
      } catch (e) {
        console.warn('Failed to parse notificationPrefs');
      }
    }

    const loadSettings = () => {
      const stored = localStorage.getItem('notificationPrefs');
      if (stored) {
        setPrefs(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    };
    
    window.addEventListener('notificationSettingsUpdated', loadSettings);
    
    return () => {
      window.removeEventListener('notificationSettingsUpdated', loadSettings);
    };

    // Request desktop notification permission if enabled
    if (Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const fetchCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };
    fetchCount();
  }, []);

  // Handle incoming real-time notifications
  useEffect(() => {
    const checkDND = () => {
      if (!prefs.doNotDisturbEnabled || !prefs.doNotDisturbStart || !prefs.doNotDisturbEnd) return false;
      
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };
      
      const startMins = parseTime(prefs.doNotDisturbStart);
      const endMins = parseTime(prefs.doNotDisturbEnd);
      
      if (startMins <= endMins) {
        return currentMinutes >= startMins && currentMinutes < endMins;
      } else {
        // Crosses midnight (e.g. 22:00 to 07:00)
        return currentMinutes >= startMins || currentMinutes < endMins;
      }
    };

    if (lastNotification) {
      setUnreadCount(prev => prev + 1);
      
      const isDndActive = checkDND();

      // Show real-time toast if enabled and DND is off
      if (prefs.enableToastReminder && !isDndActive) {
        setToastNotification(lastNotification);
        setTimeout(() => setToastNotification(null), 5000);

        // Play sound if enabled
        if (prefs.enableNotificationSound) {
          playNotificationSound('notification');
        }
      } // Desktop notification if enabled and permission granted
      if (prefs.enableDesktopNotifications && Notification && Notification.permission === 'granted' && !isDndActive) {
        const title = lastNotification.title || 'New Notification';
        const options = {
          body: lastNotification.message,
          icon: '/favicon.ico',
          data: { url: lastNotification.actionUrl }
        };
        const n = new Notification(title, options);
        n.onclick = () => {
          if (lastNotification.actionUrl) {
            navigate(lastNotification.actionUrl);
          }
          window.focus();
          n.close();
        };
      }

      // Shake on new notification if enabled
      if (prefs.enableBellAnimation && !isDndActive) {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 2500);
      }

      // Update list if panel open
      setNotifications(prev => [lastNotification, ...prev].slice(0, 5));

      // Reset reminder timer because we now have unread items
      if (prefs.enableToastReminder && !isDndActive) restartReminderTimer();

      clearLastNotification();
    }
  }, [lastNotification, clearLastNotification, prefs]);

  // Fetch detailed notifications when panel is opened
  useEffect(() => {
    if (showPanel) {
      loadNotifications();
    }
  }, [showPanel]);

  // Periodic bell shake when unread notifications exist
  useEffect(() => {
    if (!prefs.enableBellAnimation || unreadCount === 0) return;
    const min = 45 * 1000;
    const max = 60 * 1000;
    const scheduleShake = () => {
      const timeout = Math.random() * (max - min) + min;
      const id = setTimeout(() => {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 2500);
        scheduleShake();
      }, timeout);
      return () => clearTimeout(id);
    };
    const cancel = scheduleShake();
    return cancel;
  }, [unreadCount, prefs.enableBellAnimation]);

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reminder timer logic – restarts itself each time so it fires every N minutes
  const restartReminderTimer = useCallback(() => {
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    if (!prefs.enableToastReminder || unreadCount === 0) return;
    const intervalMs = (prefs.reminderInterval || 5) * 60 * 1000;
    reminderTimerRef.current = setTimeout(() => {
      setShowReminder(true);
      // Re-schedule for the next interval (timer resumes after toast dismissal)
    }, intervalMs);
  }, [prefs.enableToastReminder, prefs.reminderInterval, unreadCount]);

  // Start or restart reminder when unread count changes
  useEffect(() => {
    if (unreadCount > 0) {
      restartReminderTimer();
    } else {
      setShowReminder(false);
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    }
  }, [unreadCount, prefs.enableToastReminder, prefs.reminderInterval, restartReminderTimer]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await notificationsApi.getAll();
      setNotifications(list?.content || list || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(id);
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(id);
      await notificationsApi.delete(id);
      const deletedItem = notifications.find(n => n.id === id);
      if (deletedItem && !deletedItem.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading('all');
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeConfig = (type, title = '') => {
    const configs = {
      NEW_LEAD_ASSIGNED: { icon: Target, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
      LEAD_STATUS_CHANGED: { icon: TrendingUp, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' },
      FOLLOW_UP_REMINDER: { icon: Clock, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
      TASK_DUE: { icon: AlertCircle, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
      TASK_OVERDUE: { icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
      TASK_COMPLETED: { icon: CheckCircle, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
      TASK_ASSIGNED: { icon: CheckCircle, bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', color: 'text-fuchsia-600 dark:text-fuchsia-400' },
      MEETING_SCHEDULED: { icon: Calendar, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
      MEETING_REMINDER: { icon: Calendar, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
      MEETING_CANCELLED: { icon: Calendar, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-500 dark:text-red-400' },
      MEETING_COMPLETED: { icon: Calendar, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
      CALL_REMINDER: { icon: Phone, bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400' },
      DEAL_WON: { icon: Handshake, bg: 'bg-pink-100 dark:bg-pink-900/30', color: 'text-pink-600 dark:text-pink-400' },
      DEAL_LOST: { icon: AlertTriangle, bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-500 dark:text-slate-400' },
      SYSTEM_ALERT: { icon: ShieldAlert, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' },
      USER_MENTION: { icon: MessageSquare, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' },
    };

    if (configs[type]) return configs[type];

    // Infer from title when notificationType is null
    const t = (title || '').toLowerCase();
    if (t.includes('lead status') || t.includes('lead')) return configs.LEAD_STATUS_CHANGED;
    if (t.includes('new lead') || t.includes('lead assigned')) return configs.NEW_LEAD_ASSIGNED;
    if (t.includes('deal won')) return configs.DEAL_WON;
    if (t.includes('deal lost') || t.includes('deal closed')) return configs.DEAL_LOST;
    if (t.includes('deal')) return { icon: Handshake, bg: 'bg-pink-100 dark:bg-pink-900/30', color: 'text-pink-600 dark:text-pink-400' };
    if (t.includes('meeting')) return configs.MEETING_SCHEDULED;
    if (t.includes('call')) return configs.CALL_REMINDER;
    if (t.includes('overdue')) return configs.TASK_OVERDUE;
    if (t.includes('completed')) return configs.TASK_COMPLETED;
    if (t.includes('task') || t.includes('due')) return configs.TASK_DUE;
    if (t.includes('follow') || t.includes('reminder')) return configs.FOLLOW_UP_REMINDER;
    if (t.includes('system') || t.includes('alert') || t.includes('maintenance')) return configs.SYSTEM_ALERT;
    if (t.includes('mention')) return configs.USER_MENTION;

    return { icon: Bell, bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-500 dark:text-slate-400' };
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <ReminderToast
        visible={showReminder}
        count={unreadCount}
        onClose={() => {
          setShowReminder(false);
          // Restart the timer so it fires again after N minutes
          restartReminderTimer();
        }}
        onClick={() => {
          setShowReminder(false);
          setShowPanel(true);
        }}
      />
      <div className="relative" ref={panelRef}>
        <motion.button
        onClick={() => setShowPanel(!showPanel)}
        animate={shouldShake ? {
          rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
          scale: [1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1]
        } : {}}
        transition={{ duration: 2.5 }}
        className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer ${showPanel ? 'bg-slate-100 dark:bg-slate-800' : ''
          }`}
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Real-Time Toast */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 sm:right-8 w-80 glass bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 flex items-start gap-3 cursor-pointer"
            onClick={() => {
              setToastNotification(null);
              if (toastNotification.actionUrl) navigate(toastNotification.actionUrl);
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />

            {(() => {
              const cfg = getTypeConfig(toastNotification.notificationType, toastNotification.title);
              const TypeIcon = cfg.icon;
              return (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
                </div>
              );
            })()}

            <div className="flex-1 min-w-0 pr-6">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {toastNotification.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                {toastNotification.message}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setToastNotification(null);
              }}
              className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={actionLoading === 'all'}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 min-h-[150px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8 h-full text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                  <p className="text-sm">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 h-full text-red-500">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">{error}</p>
                  <button onClick={loadNotifications} className="mt-2 text-xs text-blue-500 hover:underline">Try again</button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 h-full text-slate-500 dark:text-slate-400">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 opacity-40 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-xs mt-1 text-center">You have no new notifications.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.slice(0, 5).map((n) => {
                    const cfg = getTypeConfig(n.notificationType, n.title);
                    const TypeIcon = cfg.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.isRead) handleMarkRead(n.id);
                          if (n.actionUrl) {
                            setShowPanel(false);
                            navigate(n.actionUrl);
                          }
                        }}
                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                          !n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {!n.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                        )}

                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                          <TypeIcon className={`w-4 h-4 ${cfg.color}`} />
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
                            {n.message}
                          </p>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 flex flex-col gap-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-md p-1 z-10">
                          {!n.isRead && (
                            <button 
                              disabled={actionLoading === n.id}
                              onClick={(e) => handleMarkRead(n.id, e)} 
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50" 
                              title="Mark as read"
                            >
                              {actionLoading === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button 
                            disabled={actionLoading === n.id}
                            onClick={(e) => handleDelete(n.id, e)} 
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50" 
                            title="Delete"
                          >
                            {actionLoading === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
                className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                View All Notifications
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
