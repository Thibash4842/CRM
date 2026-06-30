import { useState, useRef, useEffect } from 'react';
import {
  Search, List, LayoutGrid, RotateCw, ChevronDown,
  X, Star, Pin, Archive, Share2,
  Clock, Calendar, User, Tag, Link2, FileText, Paperclip,
  ArrowUpDown, CheckCircle2, Filter, Palette
} from 'lucide-react';
import { getTagInlineStyle } from '../../services/tagsService';

// All available quick-filter pills
const QUICK_FILTERS = [
  { key: 'all',            label: 'All',            icon: null },
  { key: 'today',          label: "Today's",        icon: Calendar },
  { key: 'yesterday',      label: 'Yesterday',      icon: Calendar },
  { key: 'this-week',      label: 'This Week',      icon: Calendar },
  { key: 'this-month',     label: 'This Month',     icon: Calendar },
  { key: 'favorites',      label: 'Favorites',      icon: Star },
  { key: 'pinned',         label: 'Pinned',         icon: Pin },
  { key: 'archived',       label: 'Archived',       icon: Archive },
  { key: 'shared',         label: 'Shared',         icon: Share2 },
  { key: 'recently-edited',label: 'Recently Edited',icon: Clock },
];

const SEARCH_FIELDS = [
  { key: 'all',        label: 'All Fields',  icon: Search },
  { key: 'title',      label: 'Title',       icon: FileText },
  { key: 'content',    label: 'Content',     icon: FileText },
  { key: 'owner',      label: 'Owner',       icon: User },
  { key: 'tags',       label: 'Tags',        icon: Tag },
  { key: 'lead',       label: 'Lead',        icon: Link2 },
  { key: 'contact',    label: 'Contact',     icon: Link2 },
  { key: 'deal',       label: 'Deal',        icon: Link2 },
  { key: 'account',    label: 'Account',     icon: Link2 },
  { key: 'company',    label: 'Company',     icon: Link2 },
  { key: 'date',       label: 'Date',        icon: Calendar },
  { key: 'attachment', label: 'Attachment',  icon: Paperclip },
];

const SORT_OPTIONS = [
  { key: 'updated-desc', label: 'Newest (Updated)' },
  { key: 'updated-asc',  label: 'Oldest (Updated)' },
  { key: 'created-desc', label: 'Newest (Created)' },
  { key: 'created-asc',  label: 'Oldest (Created)' },
  { key: 'title-asc',    label: 'Alphabetical A→Z' },
  { key: 'title-desc',   label: 'Alphabetical Z→A' },
  { key: 'priority',     label: 'Priority (Pinned First)' },
  { key: 'owner',        label: 'Owner Name' },
];

export default function NotesToolbar({
  search,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  quickFilter,
  onQuickFilterChange,
  tagFilter,
  onTagFilterChange,
  entityFilter,
  onEntityFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  availableTags = [],   // array of tag objects { id, label, colorHex }
  totalResults = 0,
  totalNotes = 0,
  onOpenTagManager,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const sortRef = useRef(null);
  const fieldRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (fieldRef.current && !fieldRef.current.contains(e.target)) setFieldOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeField = SEARCH_FIELDS.find(f => f.key === searchField) || SEARCH_FIELDS[0];
  const activeSortLabel = SORT_OPTIONS.find(s => s.key === sortBy)?.label || 'Sort';

  // Count active filters for badge
  const activeFilterCount = [
    search.trim(),
    tagFilter,
    entityFilter,
    quickFilter !== 'all' ? quickFilter : '',
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onSearchChange('');
    onSearchFieldChange('all');
    onQuickFilterChange('all');
    onTagFilterChange('');
    onEntityFilterChange('');
    onSortByChange('updated-desc');
  };

  return (
    <div className="relative z-20 space-y-3 mb-6">
      {/* ── Row 1: Search bar + Sort + View toggle ─────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm">

        {/* Field Selector Dropdown */}
        <div className="relative shrink-0" ref={fieldRef}>
          <button
            onClick={() => setFieldOpen(v => !v)}
            className="h-9 flex items-center gap-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            <activeField.icon className="w-3.5 h-3.5 text-indigo-500" />
            {activeField.label}
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${fieldOpen ? 'rotate-180' : ''}`} />
          </button>
          {fieldOpen && (
            <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl z-50 overflow-hidden animate-fade-in">
              {SEARCH_FIELDS.map(f => (
                <button
                  key={f.key}
                  onClick={() => { onSearchFieldChange(f.key); setFieldOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                    searchField === f.key
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5 shrink-0" />
                  {f.label}
                  {searchField === f.key && <CheckCircle2 className="w-3 h-3 ml-auto text-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search by ${activeField.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-10 pr-8 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Tag Filter — uses tag objects */}
        {availableTags.length > 0 && (
          <div className="relative shrink-0">
            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={tagFilter}
              onChange={(e) => onTagFilterChange(e.target.value)}
              className="h-9 pl-8 pr-7 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
            >
              <option value="">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        )}

        {/* Manage Tags button */}
        {onOpenTagManager && (
          <button
            onClick={onOpenTagManager}
            className="h-9 flex items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Open Tag Manager"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tags</span>
          </button>
        )}

        {/* CRM Entity Filter */}
        <div className="relative shrink-0">
          <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={entityFilter}
            onChange={(e) => onEntityFilterChange(e.target.value)}
            className="h-9 pl-8 pr-7 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
          >
            <option value="">All Record Types</option>
            <option value="Lead">Lead</option>
            <option value="Contact">Contact</option>
            <option value="Client">Client</option>
            <option value="Account">Account</option>
            <option value="Deal">Deal</option>
            <option value="Meeting">Meeting</option>
            <option value="Call">Call</option>
            <option value="Task">Task</option>
            <option value="Project">Project</option>
            <option value="Opportunity">Opportunity</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Sort Dropdown */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            onClick={() => setSortOpen(v => !v)}
            className="h-9 flex items-center gap-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">{activeSortLabel}</span>
            <span className="inline md:hidden">Sort</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl z-50 overflow-hidden animate-fade-in">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => { onSortByChange(s.key); setSortOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                    sortBy === s.key
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {s.label}
                  {sortBy === s.key && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="p-1 bg-slate-100/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/50 dark:border-slate-800/40 flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/50 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
          title="Reset all filters"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Row 2: Quick Filter Pills ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {QUICK_FILTERS.map(filter => {
          const isActive = quickFilter === filter.key;
          const Icon = filter.icon;
          return (
            <button
              key={filter.key}
              onClick={() => onQuickFilterChange(filter.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {filter.label}
            </button>
          );
        })}

        {/* Results count + Clear-all */}
        <div className="ml-auto flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear all ({activeFilterCount})
            </button>
          )}
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {totalResults === totalNotes
              ? `${totalNotes} notes`
              : `${totalResults} of ${totalNotes} notes`}
          </span>
        </div>
      </div>

      {/* ── Row 3: Active Filter Chips (only shown when filters are active) ── */}
      {(search.trim() || tagFilter || entityFilter) && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Filter className="w-3 h-3 inline mr-1" />Filters:
          </span>
          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              <Search className="w-3 h-3" />
              "{search}" in {activeField.label}
              <button onClick={() => onSearchChange('')} className="ml-1 hover:text-indigo-800 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {tagFilter && (() => {
            const tagObj = availableTags.find(t => t.id === tagFilter);
            if (!tagObj) return null;
            return (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={getTagInlineStyle(tagObj.colorHex)}
              >
                <Tag className="w-3 h-3" />
                {tagObj.label}
                <button onClick={() => onTagFilterChange('')} className="ml-1 hover:opacity-70 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            );
          })()}
          {entityFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
              <Link2 className="w-3 h-3" />
              {entityFilter}
              <button onClick={() => onEntityFilterChange('')} className="ml-1 hover:text-purple-800 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
