import { useState, useEffect, useRef, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Pin, Star, Share2, Upload, Paperclip, X, Search, Link2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import TagPicker from './TagPicker';
import AttachmentUploader from './AttachmentUploader';

// Comprehensive CRM records pool for lookups
const CRM_RECORDS_POOL = [
  // Leads
  { id: 'lead-1', type: 'Lead', name: 'John Miller' },
  { id: 'lead-2', type: 'Lead', name: 'Alice Vance' },
  { id: 'lead-3', type: 'Lead', name: 'Robert Downey' },
  // Contacts
  { id: 'contact-1', type: 'Contact', name: 'Sarah Connor' },
  { id: 'contact-2', type: 'Contact', name: 'Bruce Wayne' },
  { id: 'contact-3', type: 'Contact', name: 'Clark Kent' },
  // Accounts
  { id: 'account-1', type: 'Account', name: 'Acme Corp' },
  { id: 'account-2', type: 'Account', name: 'Nike Operations' },
  { id: 'account-3', type: 'Account', name: 'General Distributors' },
  { id: 'account-4', type: 'Account', name: 'Nike Retail Group' },
  // Deals
  { id: 'deal-1', type: 'Deal', name: 'Acme CRM Software' },
  { id: 'deal-2', type: 'Deal', name: 'Nike Softwares Enterprise' },
  { id: 'deal-3', type: 'Deal', name: 'Wayne Tech Integration' },
  // Meetings
  { id: 'meeting-1', type: 'Meeting', name: 'Q3 Strategy Board Meeting' },
  { id: 'meeting-2', type: 'Meeting', name: 'Weekly Client Sync' },
  { id: 'meeting-3', type: 'Meeting', name: 'Nike Project Kickoff' },
  // Calls
  { id: 'call-1', type: 'Call', name: 'First Discovery Phone Call' },
  { id: 'call-2', type: 'Call', name: 'Nike Follow-up Sync Call' },
  { id: 'call-3', type: 'Call', name: 'Acme Contract Negotiation' },
  // Tasks
  { id: 'task-1', type: 'Task', name: 'Upload Nike Client Spreadsheets' },
  { id: 'task-2', type: 'Task', name: 'Draft Deal Proposal' },
  { id: 'task-3', type: 'Task', name: 'Schedule Kickoff Invites' },
  // Projects
  { id: 'project-1', type: 'Project', name: 'Roadmap Refinement' },
  { id: 'project-2', type: 'Project', name: 'Nike Portal Development' },
  { id: 'project-3', type: 'Project', name: 'Acme Onboarding Portal' },
  // Opportunities
  { id: 'opp-1', type: 'Opportunity', name: 'Nike Opportunity Expansion' },
  { id: 'opp-2', type: 'Opportunity', name: 'Acme Upgrade Licensing' },
  { id: 'opp-3', type: 'Opportunity', name: 'Wayne Partner Deal' }
];

const mockOwners = [
  { name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
  { name: 'Michael Chen', initials: 'MC', color: 'bg-blue-500' },
  { name: 'Aisha Patel', initials: 'AP', color: 'bg-purple-500' },
  { name: 'John Doe', initials: 'JD', color: 'bg-indigo-600' }
];

export default function NoteModal({ isOpen, onClose, note, onSave, tagLibrary = [], onOpenTagManager }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [pinned, setPinned] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [shared, setShared] = useState(false);
  const [owner, setOwner] = useState(mockOwners[0]);
  const [attachments, setAttachments] = useState([]);

  // Multiple linked records states
  const [linkedRecords, setLinkedRecords] = useState([]);
  const [linkSearchType, setLinkSearchType] = useState('Lead');
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const lookupRef = useRef(null);

  // Load data when editing
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      // Load tag ids — support both id-array and legacy string-array
      const tagIds = (note.tags || []).map(t => (typeof t === 'string' ? t : t));
      setSelectedTagIds(tagIds);
      setPinned(!!note.pinned);
      setFavorite(!!note.favorite);
      setShared(!!note.shared);

      const foundOwner = mockOwners.find(o => o.name === note.owner?.name) || mockOwners[0];
      setOwner(foundOwner);

      setLinkedRecords(note.linkedRecords || []);
      setAttachments(note.attachments || []);
    } else {
      // Clear data for new note
      setTitle('');
      setContent('');
      setSelectedTagIds([]);
      setPinned(false);
      setFavorite(false);
      setShared(false);
      setOwner(mockOwners[0]);
      setLinkedRecords([]);
      setAttachments([]);
    }
    setLinkSearchQuery('');
    setShowSuggestions(false);
  }, [note, isOpen]);

  // Click outside lookup suggestions dropdown
  useEffect(() => {
    function handleClickOutsideLookup(event) {
      if (lookupRef.current && !lookupRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideLookup);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideLookup);
    };
  }, []);

  // Filtered lookup suggestions
  const filteredSuggestions = useMemo(() => {
    if (!linkSearchQuery.trim()) return [];
    const query = linkSearchQuery.toLowerCase();
    return CRM_RECORDS_POOL.filter(item => 
      item.type === linkSearchType &&
      item.name.toLowerCase().includes(query) &&
      !linkedRecords.some(r => r.id === item.id)
    );
  }, [linkSearchType, linkSearchQuery, linkedRecords]);

  const handleAddLink = (item) => {
    setLinkedRecords(prev => [...prev, item]);
    setLinkSearchQuery('');
    setShowSuggestions(false);
  };

  const handleRemoveLink = (id) => {
    setLinkedRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Note Title is required');

    // Process attachments for storage (convert images to base64, drop File objects)
    const processedAttachments = await Promise.all(attachments.map(async (att) => {
      if (att.file && att.isImage && !att.previewData) {
        // Convert to base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: att.id,
              name: att.name,
              size: att.size,
              type: att.type,
              isImage: true,
              previewData: reader.result
            });
          };
          reader.readAsDataURL(att.file);
        });
      } else if (att.file) {
        // Not an image, just store metadata
        return {
          id: att.id,
          name: att.name,
          size: att.size,
          type: att.type,
          isImage: false
        };
      }
      // Already processed (from previous save)
      return att;
    }));

    const savedNote = {
      ...(note && { id: note.id }),
      title,
      content,
      tags: selectedTagIds,
      pinned,
      favorite,
      shared,
      owner,
      linkedRecords,
      attachments: processedAttachments,
      attachmentsCount: processedAttachments.length,
      updatedAt: new Date().toISOString(),
      createdAt: note ? note.createdAt : new Date().toISOString()
    };

    // Clear autosave draft on successful submit
    localStorage.removeItem(`scratchio_crm_notes_draft_${note ? note.id : 'new'}`);

    onSave(savedNote);
  };

  // Get color for linked record chips
  const getChipStyle = (type) => {
    switch (type) {
      case 'Lead': return 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-500/25';
      case 'Contact': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-500/25';
      case 'Deal': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'Project': return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-500/25';
      case 'Account': return 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border-pink-500/25';
      case 'Meeting': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/25';
      case 'Call': return 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-500/25';
      case 'Task': return 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-500/25';
      case 'Opportunity': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/25';
      default: return 'bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-500/25';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? 'Edit Note Details' : 'Create New Note'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Note Title
          </label>
          <input
            type="text"
            required
            placeholder="E.g., Q3 Review Meeting Notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Content Details
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            noteId={note ? note.id : 'new'}
          />
        </div>

        {/* Row for Link & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Linked Record Details (Multiple Lookups) */}
          <div className="space-y-2.5 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3.5 bg-slate-50/30 dark:bg-slate-950/20" ref={lookupRef}>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Link CRM Records (Multiple)
            </label>
            
            {/* Clickable Chips list */}
            {linkedRecords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {linkedRecords.map((rec) => (
                  <span
                    key={rec.id}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getChipStyle(rec.type)}`}
                  >
                    <span>{rec.name} ({rec.type})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(rec.id)}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 hover:dark:bg-white/20 text-current font-bold text-[9px] cursor-pointer shrink-0 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Selector and Search */}
            <div className="relative">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <select
                  value={linkSearchType}
                  onChange={(e) => {
                    setLinkSearchType(e.target.value);
                    setLinkSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Lead">Lead</option>
                  <option value="Contact">Contact</option>
                  <option value="Account">Account</option>
                  <option value="Deal">Deal</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Call">Call</option>
                  <option value="Task">Task</option>
                  <option value="Project">Project</option>
                  <option value="Opportunity">Opportunity</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${linkSearchType}s...`}
                    value={linkSearchQuery}
                    onChange={(e) => {
                      setLinkSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && linkSearchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl z-50">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddLink(item)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border-b border-slate-50 dark:border-slate-800/40 last:border-0 cursor-pointer flex items-center gap-1.5"
                      >
                        <Link2 className="w-3 h-3 text-slate-400" />
                        <span>{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({item.type})</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2.5 text-xs text-slate-400 italic text-center">No matching records found.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3.5 bg-slate-50/30 dark:bg-slate-950/20">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Tags
            </label>
            <TagPicker
              tagLibrary={tagLibrary}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              onOpenManager={onOpenTagManager}
            />
            <p className="text-[10px] text-slate-400">Click to assign color-coded tags. Use Tag Manager to create or edit tags.</p>
          </div>
        </div>

        {/* Row for Owner & Toggle Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner Assignment */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Assign Owner
            </label>
            <input
              type="text"
              required
              value={owner.name}
              onChange={(e) => {
                const name = e.target.value;
                const initials = name
                  .trim()
                  .split(/\s+/)
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || '?';
                
                const matched = mockOwners.find(o => o.name.toLowerCase() === name.trim().toLowerCase());
                setOwner({
                  name,
                  initials: matched ? matched.initials : initials,
                  color: matched ? matched.color : 'bg-indigo-600'
                });
              }}
              placeholder="E.g., Sarah Jenkins"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Quick flags toggles */}
          <div className="flex items-center gap-4 justify-start pt-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <Pin className={`w-3.5 h-3.5 ${pinned ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              Pinned
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <Star className={`w-3.5 h-3.5 ${favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              Favorite
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shared}
                onChange={(e) => setShared(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <Share2 className={`w-3.5 h-3.5 ${shared ? 'text-violet-500' : 'text-slate-400'}`} />
              Shared
            </label>
          </div>
        </div>

        {/* File Attachments Section */}
        <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/20 dark:bg-slate-950/10">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Attachments
          </label>
          <AttachmentUploader
            attachments={attachments}
            onChange={setAttachments}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
