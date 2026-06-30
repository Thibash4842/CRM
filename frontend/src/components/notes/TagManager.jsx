import { useState, useEffect, useRef } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Check, Search, Palette, AlertCircle } from 'lucide-react';
import { TAG_COLOR_PALETTE, getTagInlineStyle } from '../../services/tagsService';

// Color swatch picker
function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {TAG_COLOR_PALETTE.map(color => (
        <button
          key={color.hex}
          type="button"
          onClick={() => onChange(color.hex)}
          title={color.name}
          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer hover:scale-110 ${
            value === color.hex ? 'border-slate-900 dark:border-white scale-110 shadow-md' : 'border-transparent'
          }`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}

// Inline tag chip preview
function TagChip({ label, colorHex, size = 'sm' }) {
  const style = getTagInlineStyle(colorHex);
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${
        size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
      style={style}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: colorHex }}
      />
      {label}
    </span>
  );
}

export { TagChip };

export default function TagManager({ isOpen, onClose, tagLibrary, onTagCreate, onTagUpdate, onTagDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState(TAG_COLOR_PALETTE[0].hex);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLOR_PALETTE[0].hex);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const newInputRef = useRef(null);

  useEffect(() => {
    if (showNewForm && newInputRef.current) {
      setTimeout(() => newInputRef.current?.focus(), 50);
    }
  }, [showNewForm]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setEditingId(null);
      setShowNewForm(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTags = tagLibrary.filter(t =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditLabel(tag.label);
    setEditColor(tag.colorHex);
    setError('');
    setShowNewForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editLabel.trim()) { setError('Label cannot be empty'); return; }
    setSaving(true);
    setError('');
    try {
      await onTagUpdate(editingId, { label: editLabel, colorHex: editColor });
      setEditingId(null);
    } catch (e) {
      setError(e.message || 'Failed to update tag');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) { setError('Label cannot be empty'); return; }
    setSaving(true);
    setError('');
    try {
      await onTagCreate({ label: newLabel, colorHex: newColor });
      setNewLabel('');
      setNewColor(TAG_COLOR_PALETTE[0].hex);
      setShowNewForm(false);
    } catch (e) {
      setError(e.message || 'Failed to create tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setError('');
    try {
      await onTagDelete(id);
    } catch (e) {
      setError(e.message || 'Failed to delete tag');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Tag Manager</h2>
              <p className="text-[11px] text-slate-400">{tagLibrary.length} tags in library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search + Add New */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/40 shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tags…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* New Tag form */}
          {showNewForm ? (
            <div className="space-y-2.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
              <div className="flex items-center gap-2">
                <input
                  ref={newInputRef}
                  type="text"
                  placeholder="Tag label (e.g. VIP, Meeting…)"
                  value={newLabel}
                  onChange={e => { setNewLabel(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <TagChip label={newLabel || 'Preview'} colorHex={newColor} />
              </div>
              <ColorPicker value={newColor} onChange={setNewColor} />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Tag
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setError(''); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setShowNewForm(true); setEditingId(null); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Tag
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-xs font-semibold text-red-600 dark:text-red-400 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Tag list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {filteredTags.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">
              {searchQuery ? `No tags matching "${searchQuery}"` : 'No tags yet. Create your first tag!'}
            </div>
          ) : (
            filteredTags.map(tag => (
              <div key={tag.id} className="group">
                {editingId === tag.id ? (
                  /* Edit row */
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/30 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editLabel}
                        onChange={e => { setEditLabel(e.target.value); setError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <TagChip label={editLabel || 'Preview'} colorHex={editColor} />
                    </div>
                    <ColorPicker value={editColor} onChange={setEditColor} />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal row */
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <TagChip label={tag.label} colorHex={tag.colorHex} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(tag)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
                        title="Edit tag"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tag.id)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-400 shrink-0">
          Click the pencil to edit · Click the trash to delete · Tags sync across all notes instantly.
        </div>
      </div>
    </div>
  );
}
