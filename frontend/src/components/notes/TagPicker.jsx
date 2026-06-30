import { useState, useRef, useEffect } from 'react';
import { Search, X, Tag, Plus, ChevronDown } from 'lucide-react';
import { getTagInlineStyle } from '../../services/tagsService';
import { TagChip } from './TagManager';

export default function TagPicker({ tagLibrary = [], selectedTagIds = [], onChange, onOpenManager }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const selectedTags = tagLibrary.filter(t => selectedTagIds.includes(t.id));
  const filteredTags = tagLibrary.filter(t =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const remove = (e, tagId) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger box — shows selected chips + open button */}
      <div
        onClick={() => setOpen(v => !v)}
        className={`min-h-[40px] w-full flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-200 ${
          open
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {selectedTags.length === 0 ? (
          <span className="text-sm text-slate-400 dark:text-slate-500 select-none flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Assign tags…
          </span>
        ) : (
          selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border"
              style={getTagInlineStyle(tag.colorHex)}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tag.colorHex }} />
              {tag.label}
              <button
                type="button"
                onClick={(e) => remove(e, tag.id)}
                className="ml-0.5 cursor-pointer hover:opacity-70 font-black"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-auto shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl z-[100] overflow-hidden animate-fade-in">
          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search tags…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          {/* Tag options list */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filteredTags.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                {query ? `No tags matching "${query}"` : 'No tags in library'}
              </div>
            ) : (
              filteredTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggle(tag.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-slate-900'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    {/* Color dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ring-2 transition-all ${isSelected ? 'ring-offset-1 ring-current scale-110' : 'ring-transparent'}`}
                      style={{ backgroundColor: tag.colorHex, ringColor: tag.colorHex }}
                    />
                    <TagChip label={tag.label} colorHex={tag.colorHex} size="xs" />
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold text-indigo-600 dark:text-indigo-400">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: manage tags link */}
          {onOpenManager && (
            <div className="border-t border-slate-100 dark:border-slate-800/60 p-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onOpenManager(); }}
                className="w-full flex items-center gap-1.5 justify-center py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Create / Manage Tags
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
