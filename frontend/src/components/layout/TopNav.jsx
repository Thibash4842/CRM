import { Menu, Sun, Moon, LogOut, Search, Check, Trash2, ArrowRight, CheckCheck, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from './CommandPalette';

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/50 dark:border-slate-700/50">

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div 
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 w-80 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400 flex-1">Search anything...</span>
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
          <NotificationBell />
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
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
