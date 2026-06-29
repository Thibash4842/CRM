import React, { useState, useEffect } from "react";
import { X, Moon, BellRing, Monitor, Volume2 } from "lucide-react";
import { notificationSettingsApi } from "../../services/api";


export default function NotificationSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    enableBellAnimation: true,
    enableToastReminder: true,
    reminderInterval: 5,
    enableDesktopNotifications: true,
    enableNotificationSound: true,
    doNotDisturbEnabled: false,
    doNotDisturbStart: "",
    doNotDisturbEnd: "",
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationSettingsApi.get();
      if (data) {
        setSettings({
          enableBellAnimation: data.enableBellAnimation ?? true,
          enableToastReminder: data.enableToastReminder ?? true,
          reminderInterval: data.reminderInterval ?? 5,
          enableDesktopNotifications: data.enableDesktopNotifications ?? true,
          enableNotificationSound: data.enableNotificationSound ?? true,
          doNotDisturbEnabled: data.doNotDisturbEnabled ?? false,
          doNotDisturbStart: data.doNotDisturbStart || "",
          doNotDisturbEnd: data.doNotDisturbEnd || "",
        });
      }
    } catch (e) {
      console.error(e);
      // Fallback to local
      const stored = localStorage.getItem("notificationPrefs");
      if (stored) setSettings(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await notificationSettingsApi.update(settings);
      localStorage.setItem("notificationPrefs", JSON.stringify(settings));
      // Dispatch an event so other components (like NotificationBell) can update without reloading
      window.dispatchEvent(new Event("notificationSettingsUpdated"));
      onClose();
    } catch (e) {
      console.error("Failed to save settings", e);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-[450px] p-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Notification Settings</h3>
        
        {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center">Loading...</div>}

        <div className="space-y-6">
          {/* General Preferences */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Alerts</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Play Sound</p>
                  <p className="text-xs text-slate-500">Play a sound for new notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableNotificationSound}
                  onChange={(e) => handleChange('enableNotificationSound', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Desktop Notifications</p>
                  <p className="text-xs text-slate-500">Show native OS notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableDesktopNotifications}
                  onChange={(e) => handleChange('enableDesktopNotifications', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Bell Animation</p>
                  <p className="text-xs text-slate-500">Shake the bell when unread items exist</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableBellAnimation}
                  onChange={(e) => handleChange('enableBellAnimation', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Do Not Disturb */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Do Not Disturb</h4>
            <label className="flex items-center gap-3 cursor-pointer group mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Enable Do Not Disturb</p>
                <p className="text-xs text-slate-500">Pause alerts during specific times</p>
              </div>
              <input
                type="checkbox"
                checked={settings.doNotDisturbEnabled}
                onChange={(e) => handleChange('doNotDisturbEnabled', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            {settings.doNotDisturbEnabled && (
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                  <input
                    type="time"
                    value={settings.doNotDisturbStart}
                    onChange={(e) => handleChange('doNotDisturbStart', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                  <input
                    type="time"
                    value={settings.doNotDisturbEnd}
                    onChange={(e) => handleChange('doNotDisturbEnd', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
          
          <hr className="border-slate-100 dark:border-slate-800" />
          
          {/* Reminders */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Reminders</h4>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableToastReminder}
                  onChange={(e) => handleChange('enableToastReminder', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Show Toasts</span>
              </label>
              
              <select
                value={settings.reminderInterval}
                onChange={(e) => handleChange('reminderInterval', Number(e.target.value))}
                disabled={!settings.enableToastReminder}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              >
                <option value={5}>Every 5 min</option>
                <option value={10}>Every 10 min</option>
                <option value={15}>Every 15 min</option>
                <option value={30}>Every 30 min</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
