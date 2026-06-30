import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Target, Users, Handshake, CheckSquare, FolderKanban, 
  Settings, LayoutDashboard, X, Sparkles, ArrowRight 
} from 'lucide-react';
import { leadsApi, clientsApi, dealsApi, tasksApi, projectsApi } from '../../services/api';

const quickLinks = [
  { id: 'ql-dash', type: 'link', label: 'Go to Dashboard', route: '/', icon: LayoutDashboard, bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400', category: 'Quick Links' },
  { id: 'ql-leads', type: 'link', label: 'Go to Active Leads', route: '/leads', icon: Target, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', category: 'Quick Links' },
  { id: 'ql-deals', type: 'link', label: 'Go to Deals Pipeline', route: '/deals', icon: Handshake, bg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', category: 'Quick Links' },
  { id: 'ql-contacts', type: 'link', label: 'Go to Contacts', route: '/contacts', icon: Users, bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', category: 'Quick Links' },
  { id: 'ql-tasks', type: 'link', label: 'Go to Tasks', route: '/activities/tasks', icon: CheckSquare, bg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', category: 'Quick Links' },
  { id: 'ql-settings', type: 'link', label: 'Go to Settings', route: '/settings', icon: Settings, bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400', category: 'Quick Links' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const itemsToRender = query.trim() ? results : quickLinks;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const queryLower = query.toLowerCase();
        const [leadsRes, clientsRes, dealsRes, tasksRes, projectsRes] = await Promise.all([
          leadsApi.getAll({ search: query }).catch(() => []),
          clientsApi.getAll(query).catch(() => []),
          dealsApi.getAll().catch(() => []),
          tasksApi.getAll().catch(() => []),
          projectsApi.getAll().catch(() => [])
        ]);

        const filteredDeals = (dealsRes || []).filter(d => 
          (d.title || '').toLowerCase().includes(queryLower) ||
          (d.clientName || '').toLowerCase().includes(queryLower)
        );

        const filteredTasks = (tasksRes || []).filter(t => 
          (t.title || '').toLowerCase().includes(queryLower) ||
          (t.description || '').toLowerCase().includes(queryLower)
        );

        const filteredProjects = (projectsRes || []).filter(p => 
          (p.name || '').toLowerCase().includes(queryLower) ||
          (p.description || '').toLowerCase().includes(queryLower)
        );

        const formattedResults = [];

        if (leadsRes && leadsRes.length > 0) {
          leadsRes.slice(0, 5).forEach(l => {
            formattedResults.push({
              id: `lead-${l.id}`,
              type: 'lead',
              label: l.fullName || `${l.firstName} ${l.lastName}`,
              subtitle: `${l.company || 'No Company'} · ${l.status}`,
              route: `/leads`, // Navigates to Leads. Wait, since Leads has details panel but is inside leads page, navigating to `/leads` is best
              category: 'Leads'
            });
          });
        }

        if (clientsRes && clientsRes.length > 0) {
          clientsRes.slice(0, 5).forEach(c => {
            formattedResults.push({
              id: `contact-${c.id}`,
              type: 'contact',
              label: c.fullName || `${c.firstName} ${c.lastName}`,
              subtitle: `${c.company || 'No Company'} · ${c.email || 'No email'}`,
              route: `/contacts`,
              category: 'Contacts'
            });
          });
        }

        if (filteredDeals.length > 0) {
          filteredDeals.slice(0, 5).forEach(d => {
            formattedResults.push({
              id: `deal-${d.id}`,
              type: 'deal',
              label: d.title,
              subtitle: `${d.clientName || 'No Client'} · $${d.value?.toLocaleString() || 0} (${d.stage})`,
              route: `/deals`,
              category: 'Deals'
            });
          });
        }

        if (filteredTasks.length > 0) {
          filteredTasks.slice(0, 5).forEach(t => {
            formattedResults.push({
              id: `task-${t.id}`,
              type: 'task',
              label: t.title,
              subtitle: `Due: ${new Date(t.dueDate).toLocaleDateString()} · ${t.priority}`,
              route: `/activities/tasks`,
              category: 'Tasks'
            });
          });
        }

        if (filteredProjects.length > 0) {
          filteredProjects.slice(0, 5).forEach(p => {
            formattedResults.push({
              id: `project-${p.id}`,
              type: 'project',
              label: p.name,
              subtitle: `Status: ${p.status} · Budget: $${p.budget?.toLocaleString() || 0}`,
              route: `/projects`,
              category: 'Projects'
            });
          });
        }

        setResults(formattedResults);
      } catch (err) {
        console.error('Failed to search:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = useCallback((item) => {
    navigate(item.route);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % itemsToRender.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + itemsToRender.length) % itemsToRender.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (itemsToRender[selectedIndex]) {
        handleSelect(itemsToRender[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getIconConfig = (type, item) => {
    if (type === 'link') {
      return { Icon: item.icon, bgClass: item.bg };
    }
    switch (type) {
      case 'lead':
        return { Icon: Target, bgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'contact':
        return { Icon: Users, bgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'deal':
        return { Icon: Handshake, bgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' };
      case 'task':
        return { Icon: CheckSquare, bgClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' };
      case 'project':
        return { Icon: FolderKanban, bgClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' };
      default:
        return { Icon: Sparkles, bgClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400' };
    }
  };

  let currentCategory = '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm dark:bg-slate-950/80"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-150 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search leads, deals, contacts, tasks..."
                className="bg-transparent text-slate-800 dark:text-white text-base outline-none flex-1 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="flex items-center gap-2 shrink-0">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-350 border-t-indigo-500 rounded-full animate-spin dark:border-slate-700"></div>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">ESC</span>
                )}
                <button 
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-350 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results List */}
            <div 
              ref={listRef} 
              className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] custom-scrollbar"
            >
              {itemsToRender.length > 0 ? (
                itemsToRender.map((item, index) => {
                  const showHeader = item.category !== currentCategory;
                  if (showHeader) {
                    currentCategory = item.category;
                  }
                  const { Icon, bgClass } = getIconConfig(item.type, item);
                  const isSelected = index === selectedIndex;

                  return (
                    <div key={item.id}>
                      {showHeader && (
                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800">
                          {item.category}
                        </div>
                      )}
                      <div
                        data-active={isSelected}
                        onClick={() => handleSelect(item)}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/20 text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-3' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{item.label}</p>
                            {item.subtitle && (
                              <p className="text-xs text-slate-450 dark:text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-indigo-650 dark:text-indigo-400 flex items-center gap-1 text-xs font-semibold"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                !loading && (
                  <div className="py-12 px-4 text-center">
                    <Search className="w-10 h-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No results found</p>
                    <p className="text-xs text-slate-500 mt-1">We couldn't find anything matching "{query}"</p>
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono shadow-sm">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono shadow-sm">Enter</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                Press <kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono shadow-sm">⌘K</kbd> to search anywhere
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
