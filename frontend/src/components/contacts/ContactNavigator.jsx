import { useState } from 'react';
import { Search, SlidersHorizontal, Plus, Star, Users, UserCheck, Crown, Flame, Clock, UserX, ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
  'from-sky-500 to-indigo-600',
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getStatusColor(score) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-slate-400';
}

const SIDEBAR_VIEWS = [
  { id: 'all', label: 'All Contacts', icon: Users, count: null },
  { id: 'my', label: 'My Contacts', icon: UserCheck, count: null },
  { id: 'customers', label: 'Customers', icon: Users, count: null },
  { id: 'vip', label: 'VIP Contacts', icon: Crown, count: null },
  { id: 'hot', label: 'Hot Contacts', icon: Flame, count: null },
  { id: 'recent', label: 'Recently Added', icon: Clock, count: null },
  { id: 'inactive', label: 'Inactive', icon: UserX, count: null },
];

export default function ContactNavigator({ contacts, selectedContact, onSelectContact, search, onSearch, onAddNew, activeFilter, onFilterChange }) {
  const [favorited, setFavorited] = useState({});
  const [viewsExpanded, setViewsExpanded] = useState(true);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorited(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Contacts</h2>
            <p className="text-xs text-slate-500 mt-0.5">{contacts.length} total</p>
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md hover:shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full h-9 pl-9 pr-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Saved Views */}
      <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setViewsExpanded(!viewsExpanded)}
          className="flex items-center gap-2 px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          {viewsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Views
        </button>
        {viewsExpanded && (
          <div className="mt-1 space-y-0.5">
            {SIDEBAR_VIEWS.map(view => {
              const Icon = view.icon;
              const isActive = activeFilter === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => onFilterChange(view.id)}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className="truncate">{view.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3">
              <LayoutGrid className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">No contacts found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-1">
            {contacts.map(contact => {
              const isSelected = selectedContact?.id === contact.id;
              const isFav = favorited[contact.id];
              const color = getAvatarColor(contact.contactName || contact.companyName);
              const score = contact.leadScore || 75;

              return (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={`group w-full text-left p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/15 ring-1 ring-indigo-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
                        {contact.contactName?.[0]?.toUpperCase() || contact.companyName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getStatusColor(score)} border-2 border-white dark:border-slate-950 rounded-full`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {contact.contactName || 'Unknown'}
                        </h3>
                        <button
                          onClick={(e) => toggleFavorite(e, contact.id)}
                          className={`flex-shrink-0 p-0.5 rounded transition-all ${
                            isFav ? 'text-amber-400' : 'text-transparent group-hover:text-slate-300 dark:group-hover:text-slate-600'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {contact.jobTitle || 'Executive'} · {contact.companyName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-semibold ${
                          score >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : score >= 60 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {score >= 80 ? '🔥' : score >= 60 ? '⚡' : '○'} {score}
                        </span>
                        <span className="text-[10px] text-slate-400">Active today</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
