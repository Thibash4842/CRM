import { useState, useEffect, useMemo, useCallback } from 'react';
import { StickyNote, Plus, FolderHeart, RotateCw, Loader2, Palette } from 'lucide-react';
import Button from '../components/ui/Button';
import PageHeader, { LoadingSpinner } from '../components/ui/PageHeader';
import NotesKPIs from '../components/notes/NotesKPIs';
import NotesToolbar from '../components/notes/NotesToolbar';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import NoteDetailsDrawer from '../components/notes/NoteDetailsDrawer';
import NotesToast from '../components/notes/NotesToast';
import TagManager from '../components/notes/TagManager';
import { notesService } from '../services/notesService';
import { tagsService } from '../services/tagsService';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');   // which field to search
  const [tagFilter, setTagFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');   // quick-filter pill

  // Sort + view
  const [sortBy, setSortBy] = useState('updated-desc');
  const [viewMode, setViewMode] = useState('grid');

  // Tag library state
  const [tagLibrary, setTagLibrary] = useState([]);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Modal / Drawer States
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', id: 0, duration: 5000 });
  const [undoState, setUndoState] = useState(null);
  const [deleteTimeoutId, setDeleteTimeoutId] = useState(null);

  // Load Notes on Mount
  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        const [data, tags] = await Promise.all([
          notesService.getAll(),
          tagsService.getAll()
        ]);
        setNotes(data);
        setTagLibrary(tags);
      } catch (err) {
        showToast(err.message || 'Failed to load notes', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  // ── Tag CRUD handlers ─────────────────────────────────────────
  const handleTagCreate = useCallback(async (data) => {
    const created = await tagsService.create(data);
    setTagLibrary(prev => [...prev, created]);
    return created;
  }, []);

  const handleTagUpdate = useCallback(async (id, data) => {
    const updated = await tagsService.update(id, data);
    setTagLibrary(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);

  const handleTagDelete = useCallback(async (id) => {
    await tagsService.delete(id);
    setTagLibrary(prev => prev.filter(t => t.id !== id));
    // Remove deleted tag from all notes in state
    setNotes(prev => prev.map(n => ({
      ...n,
      tags: (n.tags || []).filter(tagId => tagId !== id)
    })));
  }, []);

  // Helper to show toasts
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    setToast({
      show: true,
      message,
      type,
      id: Date.now(),
      duration
    });
  }, []);

  // Dismiss Toast
  const handleCloseToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // Dynamic tags list (tag IDs used in notes, resolved from library)
  const availableTags = useMemo(() => {
    // Build set of tag IDs that are actually used by at least one note
    const usedIds = new Set(notes.flatMap(n => n.tags || []));
    return tagLibrary.filter(t => usedIds.has(t.id));
  }, [notes, tagLibrary]);

  // Calculate dynamic KPIs from the notes list
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return {
      active: notes.filter(n => !n.archived).length,
      pinned: notes.filter(n => !n.archived && n.pinned).length,
      favorites: notes.filter(n => !n.archived && n.favorite).length,
      shared: notes.filter(n => !n.archived && n.shared).length,
      archived: notes.filter(n => n.archived).length,
      today: notes.filter(n => {
        if (n.archived) return false;
        const createdDay = n.createdAt?.split('T')[0];
        const updatedDay = n.updatedAt?.split('T')[0];
        return createdDay === todayStr || updatedDay === todayStr;
      }).length
    };
  }, [notes]);

  // OPTIMISTIC PIN TOGGLE
  const handlePin = useCallback(async (id) => {
    // 1. Optimistic Update in State
    let originalNotes = [];
    setNotes(prevNotes => {
      originalNotes = prevNotes;
      return prevNotes.map(n => 
        n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
      );
    });

    try {
      // 2. Perform API Call
      await notesService.togglePin(id);
      // Success silent or small alert (standard UX is quiet but we can toast)
    } catch (err) {
      // 3. Rollback state on error
      setNotes(originalNotes);
      showToast(err.message || 'Failed to pin note', 'error');
    }
  }, [showToast]);

  // OPTIMISTIC FAVORITE TOGGLE
  const handleFavorite = useCallback(async (id) => {
    // 1. Optimistic Update in State
    let originalNotes = [];
    setNotes(prevNotes => {
      originalNotes = prevNotes;
      return prevNotes.map(n => 
        n.id === id ? { ...n, favorite: !n.favorite, updatedAt: new Date().toISOString() } : n
      );
    });

    try {
      // 2. Perform API Call
      await notesService.toggleFavorite(id);
    } catch (err) {
      // 3. Rollback state on error
      setNotes(originalNotes);
      showToast(err.message || 'Failed to favorite note', 'error');
    }
  }, [showToast]);

  // ARCHIVE TOGGLE ACTION
  const handleArchive = useCallback(async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    setSaving(true);
    try {
      const updated = await notesService.toggleArchive(id);
      setNotes(prevNotes => prevNotes.map(n => n.id === id ? updated : n));
      showToast(
        updated.archived ? 'Note archived successfully.' : 'Note restored to active deck.',
        'success'
      );
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(updated);
      }
    } catch (err) {
      showToast(err.message || 'Failed to change archive status', 'error');
    } finally {
      setSaving(false);
    }
  }, [notes, selectedNote, showToast]);

  // SHARE TOGGLE ACTION
  const handleShare = useCallback(async (id) => {
    setSaving(true);
    try {
      const updated = await notesService.toggleShare(id);
      setNotes(prevNotes => prevNotes.map(n => n.id === id ? updated : n));
      showToast(
        updated.shared ? 'Note is now shared.' : 'Note is now private.',
        'success'
      );
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(updated);
      }
    } catch (err) {
      showToast(err.message || 'Failed to share note', 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedNote, showToast]);

  // OPTIMISTIC DELETE WITH UNDO CAPABILITY
  const handleDelete = useCallback(async (id) => {
    // If there is a pending delete timeout, execute it immediately first
    if (deleteTimeoutId) {
      clearTimeout(deleteTimeoutId);
      // We don't block the UI, just trigger delete in background
      if (undoState) {
        notesService.delete(undoState.note.id).catch(() => {});
      }
    }

    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return;

    const noteToDelete = notes[noteIndex];

    // 1. Save state for potential undo
    setUndoState({
      note: noteToDelete,
      index: noteIndex
    });

    // 2. Optimistic state delete (remove from list immediately)
    setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
    setIsDrawerOpen(false);

    // 3. Trigger Undo Toast Notification
    setToast({
      show: true,
      message: `Note "${noteToDelete.title}" deleted.`,
      type: 'undo',
      id: Date.now(),
      duration: 5000
    });

    // 4. Set delayed final deletion execution (5 seconds)
    const timeoutId = setTimeout(async () => {
      try {
        await notesService.delete(id);
        setUndoState(null);
        setDeleteTimeoutId(null);
      } catch (err) {
        showToast(err.message || 'Failed to delete note from database', 'error');
      }
    }, 5000);

    setDeleteTimeoutId(timeoutId);
  }, [notes, deleteTimeoutId, undoState, showToast]);

  // UNDO DELETE HANDLER
  const handleUndoDelete = useCallback(() => {
    if (!undoState) return;

    // 1. Cancel the deletion timeout
    if (deleteTimeoutId) {
      clearTimeout(deleteTimeoutId);
      setDeleteTimeoutId(null);
    }

    // 2. Restore note back to its index in state
    setNotes(prevNotes => {
      const restored = [...prevNotes];
      restored.splice(undoState.index, 0, undoState.note);
      return restored;
    });

    // 3. Clear undo references
    setUndoState(null);
    showToast('Note restored successfully.', 'success');
  }, [undoState, deleteTimeoutId, showToast]);

  // DUPLICATE ACTION
  const handleDuplicate = useCallback(async (id) => {
    setSaving(true);
    try {
      const duplicated = await notesService.duplicate(id);
      setNotes(prevNotes => [duplicated, ...prevNotes]);
      showToast('Note duplicated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to duplicate note', 'error');
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // Trigger Edit Modal
  const handleEditTrigger = useCallback((note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  }, []);

  // Trigger Select Note
  const handleSelectNote = useCallback(async (note) => {
    setSelectedNote(note);
    setIsDrawerOpen(true);
    
    // Mark as read when opening drawer
    if (note) {
      try {
        const updatedNote = await notesService.markAsRead(note.id);
        if (updatedNote) {
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleCommentsUpdated = useCallback((updatedNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  }, []);

  // Trigger Create Modal
  const handleCreateTrigger = useCallback(() => {
    setSelectedNote(null);
    setIsModalOpen(true);
  }, []);

  // Trigger Slide Drawer

  // SAVE OR CREATE HANDLER
  const handleSaveNote = useCallback(async (savedNote) => {
    setSaving(true);
    try {
      if (savedNote.id) {
        // Edit Operation
        const updated = await notesService.update(savedNote.id, savedNote);
        setNotes(prevNotes => prevNotes.map(n => n.id === savedNote.id ? updated : n));
        showToast('Note updated successfully.', 'success');
        if (selectedNote && selectedNote.id === savedNote.id) {
          setSelectedNote(updated);
        }
      } else {
        // Create Operation
        const created = await notesService.create(savedNote);
        setNotes(prevNotes => [created, ...prevNotes]);
        showToast('Note created successfully.', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save note details', 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedNote, showToast]);

  // Reset Filters / Restore DB mock data
  const handleRefresh = useCallback(async () => {
    setSearch('');
    setSearchField('all');
    setTagFilter('');
    setEntityFilter('');
    setQuickFilter('all');
    setSortBy('updated-desc');

    try {
      setLoading(true);
      const data = await notesService.resetAll();
      setNotes(data);
      showToast('Notes list refreshed and cached data reset.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to reset notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Sync drawer preview note with updated elements
  const activeNoteForDrawer = useMemo(() => {
    if (!selectedNote) return null;
    return notes.find(n => n.id === selectedNote.id) || null;
  }, [notes, selectedNote]);

  // ── Enterprise Filtering & Sorting Engine ──────────────────────────
  const filteredAndSortedNotes = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Yesterday string
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Start of this week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return notes
      .filter(note => {
        // ── 1. Quick-filter pills ──────────────────────────────────
        if (quickFilter === 'archived') {
          if (!note.archived) return false;
        } else {
          if (note.archived) return false; // hide archived unless explicitly requested

          if (quickFilter === 'favorites' && !note.favorite) return false;
          if (quickFilter === 'pinned' && !note.pinned) return false;
          if (quickFilter === 'shared' && !note.shared) return false;

          if (quickFilter === 'today') {
            const c = note.createdAt?.split('T')[0];
            const u = note.updatedAt?.split('T')[0];
            if (c !== todayStr && u !== todayStr) return false;
          }
          if (quickFilter === 'yesterday') {
            const c = note.createdAt?.split('T')[0];
            const u = note.updatedAt?.split('T')[0];
            if (c !== yesterdayStr && u !== yesterdayStr) return false;
          }
          if (quickFilter === 'this-week') {
            const updated = new Date(note.updatedAt);
            if (updated < startOfWeek) return false;
          }
          if (quickFilter === 'this-month') {
            const updated = new Date(note.updatedAt);
            if (updated < startOfMonth) return false;
          }
          if (quickFilter === 'recently-edited') {
            // Last 48 hours
            const updated = new Date(note.updatedAt);
            const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            if (updated < cutoff) return false;
          }
        }

        // ── 2. Tag filter ──────────────────────────────────────────
        if (tagFilter && !(note.tags || []).includes(tagFilter)) {
          return false;
        }

        // ── 3. Linked CRM entity filter ────────────────────────────
        if (entityFilter) {
          if (!note.linkedRecords || !note.linkedRecords.some(r => r.type === entityFilter)) {
            return false;
          }
        }

        // ── 4. Search (field-aware) ────────────────────────────────
        if (search.trim()) {
          const q = search.toLowerCase();

          // Attachment field: match notes that have > 0 attachments when query is a number,
          // or match any note if query is 'yes'/'true'/'has attachment'
          if (searchField === 'attachment') {
            const hasAny = (note.attachmentsCount || 0) > 0;
            const wantsAny = ['yes', 'true', 'has', 'attached', 'attachment'].includes(q);
            const wantsNone = ['no', 'false', 'none', '0'].includes(q);
            const wantsNum = !isNaN(Number(q));
            if (wantsAny && !hasAny) return false;
            if (wantsNone && hasAny) return false;
            if (wantsNum && (note.attachmentsCount || 0) < Number(q)) return false;
            // If none of the above, just ensure there's any attachment
            if (!wantsAny && !wantsNone && !wantsNum && !hasAny) return false;
          }
          // Date field: match against createdAt / updatedAt ISO strings
          else if (searchField === 'date') {
            const inDate = [
              note.createdAt || '', note.updatedAt || ''
            ].some(d => d.toLowerCase().includes(q));
            if (!inDate) return false;
          }
          else {
            let matched = false;
            if (searchField === 'all' || searchField === 'title') {
              matched = matched || note.title.toLowerCase().includes(q);
            }
            if (searchField === 'all' || searchField === 'content') {
              matched = matched || (note.content || '').toLowerCase().includes(q);
            }
            if (searchField === 'all' || searchField === 'tags') {
              // Match against resolved tag labels
              const noteTags = (note.tags || []).map(id => {
                const t = tagLibrary.find(tg => tg.id === id);
                return t ? t.label : id;
              });
              matched = matched || noteTags.some(label => label.toLowerCase().includes(q));
            }
            if (searchField === 'all' || searchField === 'owner') {
              matched = matched || (note.owner?.name || '').toLowerCase().includes(q);
            }
            // CRM record field-scoped searches
            const crmTypeMap = {
              lead: 'Lead', contact: 'Contact', deal: 'Deal',
              account: 'Account', company: 'Account', // company → Account alias
            };
            if (searchField === 'all') {
              matched = matched || (note.linkedRecords || []).some(r =>
                r.name.toLowerCase().includes(q)
              );
            } else if (crmTypeMap[searchField]) {
              const targetType = crmTypeMap[searchField];
              matched = matched || (note.linkedRecords || []).some(r =>
                r.type === targetType && r.name.toLowerCase().includes(q)
              );
            }
            if (!matched) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'updated-desc': return new Date(b.updatedAt) - new Date(a.updatedAt);
          case 'updated-asc':  return new Date(a.updatedAt) - new Date(b.updatedAt);
          case 'created-desc': return new Date(b.createdAt) - new Date(a.createdAt);
          case 'created-asc':  return new Date(a.createdAt) - new Date(b.createdAt);
          case 'title-asc':    return a.title.localeCompare(b.title);
          case 'title-desc':   return b.title.localeCompare(a.title);
          case 'priority': {
            // pinned > favorite > rest, then by updatedAt
            const scoreA = (a.pinned ? 2 : 0) + (a.favorite ? 1 : 0);
            const scoreB = (b.pinned ? 2 : 0) + (b.favorite ? 1 : 0);
            if (scoreB !== scoreA) return scoreB - scoreA;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          }
          case 'owner':
            return (a.owner?.name || '').localeCompare(b.owner?.name || '');
          default: return 0;
        }
      });
  }, [notes, search, searchField, tagFilter, entityFilter, quickFilter, sortBy, tagLibrary]);

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay spinner when performing operations like saving */}
      {saving && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="glass p-5 rounded-2xl flex items-center gap-3 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Saving details...</span>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <StickyNote className="w-5 h-5 animate-pulse-glow rounded" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM Notes</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Organize, pin, search, and link your custom strategy and meeting notes to active Leads, Clients, Deals, and Accounts.
          </p>
        </div>
        <Button onClick={handleCreateTrigger} className="shrink-0">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <NotesKPIs
        stats={stats}
        activeFilter={quickFilter}
        onFilterChange={setQuickFilter}
      />

      {/* Control Toolbar */}
      <NotesToolbar
        search={search}
        onSearchChange={setSearch}
        searchField={searchField}
        onSearchFieldChange={setSearchField}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        entityFilter={entityFilter}
        onEntityFilterChange={setEntityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={handleRefresh}
        availableTags={availableTags}
        totalResults={filteredAndSortedNotes.length}
        totalNotes={notes.filter(n => !n.archived || quickFilter === 'archived').length}
        onOpenTagManager={() => setIsTagManagerOpen(true)}
      />

      {/* Content Section: Cards, Loading, or Empty State */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredAndSortedNotes.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up'
              : 'space-y-4 animate-slide-up'
          }
        >
          {filteredAndSortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              tagLibrary={tagLibrary}
              onPin={handlePin}
              onFavorite={handleFavorite}
              onEdit={handleEditTrigger}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onShare={handleShare}
              onDuplicate={handleDuplicate}
              onSelect={handleSelectNote}
            />
          ))}
        </div>
      ) : (
        /* Premium Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm p-8 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl scale-[1.6]" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg flex items-center justify-center text-white scale-100 hover:scale-105 transition-transform duration-300">
              <FolderHeart className="w-10 h-10" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {search || tagFilter || entityFilter || quickFilter !== 'all'
              ? 'No notes match your filters'
              : 'Your note deck is empty'}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-sm leading-relaxed">
            {search || tagFilter || entityFilter || quickFilter !== 'all'
              ? 'Try widening your search query, choosing a different field, changing filters, or resetting all selections.'
              : 'Keep track of critical business meetings, roadmap ideas, and phone calls. Create your very first note to get started!'}
          </p>

          <div className="mt-6 flex items-center gap-3">
            {(search || tagFilter || entityFilter || quickFilter !== 'all') && (
              <Button variant="secondary" onClick={handleRefresh}>
                <RotateCw className="w-4 h-4" />
                Reset Filters
              </Button>
            )}
            <Button onClick={handleCreateTrigger}>
              <Plus className="w-4 h-4" />
              Create First Note
            </Button>
          </div>
        </div>
      )}

      {/* Modal Dialog for Create / Edit */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
        onSave={handleSaveNote}
        tagLibrary={tagLibrary}
        onOpenTagManager={() => { setIsModalOpen(false); setIsTagManagerOpen(true); }}
      />

      {/* Tag Manager */}
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tagLibrary={tagLibrary}
        onTagCreate={handleTagCreate}
        onTagUpdate={handleTagUpdate}
        onTagDelete={handleTagDelete}
      />

      {/* Side Slide Drawer for Details Preview */}
      <NoteDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        note={activeNoteForDrawer}
        onPin={handlePin}
        onFavorite={handleFavorite}
        onEdit={handleEditTrigger}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onShare={handleShare}
        onCommentsUpdated={handleCommentsUpdated}
      />

      {/* Toast Notification Container */}
      <NotesToast
        toast={toast}
        onClose={handleCloseToast}
        onUndo={handleUndoDelete}
      />
    </div>
  );
}
