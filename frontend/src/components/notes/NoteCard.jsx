import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, Star, MoreVertical, Paperclip, Calendar, User, Link2, Edit, Trash2, Archive, Share2, Copy, MessageSquare } from 'lucide-react';
import Badge from '../ui/Badge';
import { getTagInlineStyle } from '../../services/tagsService';

const stripHtml = (htmlStr) => {
  if (!htmlStr) return '';
  const clean = htmlStr.replace(/<[^>]*>/g, ' ');
  return clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function NoteCard({
  note,
  viewMode = 'grid',
  tagLibrary = [],
  onPin,
  onFavorite,
  onEdit,
  onDelete,
  onArchive,
  onShare,
  onDuplicate,
  onSelect
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleCardClick = () => {
    if (onSelect) onSelect(note);
  };

  const formattedDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Get dynamic colors for avatars
  const ownerBgColor = note.owner?.color || 'bg-slate-500';

  // Check if there are unread comments
  const unreadComments = note.comments && note.comments.length > 0 &&
    (!note.lastReadAt || new Date(note.comments[note.comments.length - 1].createdAt) > new Date(note.lastReadAt));


  // Navigate to standard routes
  const handleChipClick = (e, type) => {
    e.stopPropagation();
    switch (type) {
      case 'Lead':
        navigate('/leads');
        break;
      case 'Contact':
      case 'Client':
        navigate('/contacts');
        break;
      case 'Account':
        navigate('/accounts');
        break;
      case 'Deal':
      case 'Opportunity':
        navigate('/deals');
        break;
      case 'Project':
        navigate('/projects');
        break;
      case 'Meeting':
      case 'Call':
      case 'Task':
        navigate('/calendar');
        break;
      default:
        break;
    }
  };

  // Get color for linked entities
  const getLinkedColor = (type) => {
    switch (type) {
      case 'Lead': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'Contact': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'Client': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Deal': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Opportunity': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'Project': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Account': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'Meeting': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Call': return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      case 'Task': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer animate-fade-in"
      >
        {/* Left section: Title, linked details, preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 truncate max-w-[300px] relative">
              {note.title}
              {unreadComments && (
                <span className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900 shadow-sm animate-pulse" title="New comments" />
              )}
            </h4>

            {note.pinned && (
              <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            )}
            {note.favorite && (
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}

            {note.linkedRecords && note.linkedRecords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.linkedRecords.map((rec) => (
                  <span
                    key={rec.id}
                    onClick={(e) => handleChipClick(e, rec.type)}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border hover:opacity-80 transition-opacity ${getLinkedColor(rec.type)}`}
                    title={`Go to ${rec.type}s`}
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    {rec.name} ({rec.type})
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 pr-6">
            {stripHtml(note.content)}
          </p>

          {/* Tags — color-coded chips */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {note.tags.map((tagId) => {
                const tagObj = tagLibrary.find(t => t.id === tagId);
                if (!tagObj) {
                  // Legacy string fallback
                  return (
                    <span key={tagId} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/30">
                      #{typeof tagId === 'string' ? tagId : tagId}
                    </span>
                  );
                }
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={getTagInlineStyle(tagObj.colorHex)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tagObj.colorHex }} />
                    {tagObj.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Right section: Owner, dates, attachments, and actions */}
        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-slate-100 dark:border-slate-800/40 pt-3 sm:pt-0 sm:border-0">
          {/* Owner details */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${ownerBgColor}`}
              title={`Owner: ${note.owner?.name || 'Unknown'}`}
            >
              {note.owner?.initials || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{note.owner?.name}</p>
              <p className="text-[10px] text-slate-400">Owner</p>
            </div>
          </div>

          {/* Attachment count */}
          {note.attachmentsCount > 0 && (
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500" title={`${note.attachmentsCount} attachments`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{note.attachmentsCount}</span>
            </div>
          )}

          {/* Comment count */}
          {note.comments && note.comments.length > 0 && (
            <div className={`flex items-center gap-1 ${unreadComments ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} title={`${note.comments.length} comments`}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{note.comments.length}</span>
            </div>
          )}

          {/* Dates */}
          <div className="text-left sm:text-right text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <div className="flex items-center gap-1 sm:justify-end">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Updated: {formattedDate(note.updatedAt)}</span>
            </div>
          </div>

          {/* Interactive controls & drop-menu */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onPin(note.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${note.pinned
                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-200 dark:border-rose-900/30'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/15 border-transparent'
                }`}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onFavorite(note.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${note.favorite
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-200 dark:border-amber-900/30'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/15 border-transparent'
                }`}
              title={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className="w-3.5 h-3.5" />
            </button>

            {/* Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 z-30 animate-fade-in">
                  <button
                    onClick={() => { onEdit(note); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-500" />
                    Edit Details
                  </button>
                  <button
                    onClick={() => { onArchive(note.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-slate-500" />
                    {note.archived ? 'Activate Note' : 'Archive Note'}
                  </button>
                  <button
                    onClick={() => { onShare(note.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-violet-500" />
                    {note.shared ? 'Make Private' : 'Share Note'}
                  </button>
                  <button
                    onClick={() => { onDuplicate(note.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-500" />
                    Duplicate Note
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => { onDelete(note.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (Default)
  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between h-[250px] p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in overflow-hidden"
    >
      {/* Background Decorative Glow */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-[0.03] rounded-full blur-2xl transition-opacity duration-300`} />

      {/* Top row: Pinned, Favorite, Action Dropdown */}
      <div className="flex items-start justify-between gap-2 shrink-0 mb-3" onClick={(e) => e.stopPropagation()}>
        {note.linkedRecords && note.linkedRecords.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {note.linkedRecords.map((rec) => (
              <span
                key={rec.id}
                onClick={(e) => handleChipClick(e, rec.type)}
                className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase hover:opacity-80 transition-opacity ${getLinkedColor(rec.type)}`}
                title={`Go to ${rec.type}s`}
              >
                <Link2 className="w-2.5 h-2.5" />
                {rec.name}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPin(note.id)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${note.pinned
                ? 'bg-rose-50 dark:bg-rose-950/25 text-rose-500 border-rose-100 dark:border-rose-900/20'
                : 'text-slate-400 opacity-40 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/15 border-transparent'
              }`}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFavorite(note.id)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${note.favorite
                ? 'bg-amber-50 dark:bg-amber-950/25 text-amber-500 border-amber-100 dark:border-amber-900/20'
                : 'text-slate-400 opacity-40 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/15 border-transparent'
              }`}
            title={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star className="w-3.5 h-3.5" />
          </button>

          {/* Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 z-30 animate-fade-in">
                <button
                  onClick={() => { onEdit(note); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-500" />
                  Edit Details
                </button>
                <button
                  onClick={() => { onArchive(note.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                  {note.archived ? 'Activate Note' : 'Archive Note'}
                </button>
                <button
                  onClick={() => { onShare(note.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-violet-500" />
                  {note.shared ? 'Make Private' : 'Share Note'}
                </button>
                <button
                  onClick={() => { onDuplicate(note.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-500" />
                  Duplicate Note
                </button>
                <hr className="my-1 border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => { onDelete(note.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle section: Content preview */}
      <div className="flex-1 min-h-0 flex flex-col justify-start">
        <h4 className="relative inline-block text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 mb-1.5 truncate">
          {note.title}
          {unreadComments && (
            <span className="absolute -top-0.5 -right-3 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900 shadow-sm animate-pulse" title="New comments" />
          )}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {stripHtml(note.content)}
        </p>
      </div>

      {/* Tags — color-coded chips */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 mb-3 shrink-0">
          {note.tags.map((tagId) => {
            const tagObj = tagLibrary.find(t => t.id === tagId);
            if (!tagObj) {
              return (
                <span key={tagId} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/10">
                  #{typeof tagId === 'string' ? tagId : tagId}
                </span>
              );
            }
            return (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                style={getTagInlineStyle(tagObj.colorHex)}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tagObj.colorHex }} />
                {tagObj.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Bottom section: Owner avatar, Date, Attachments */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm ${ownerBgColor}`}
            title={`Owner: ${note.owner?.name}`}
          >
            {note.owner?.initials || 'U'}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-none">{note.owner?.name}</p>
            <p className="text-[9px] text-slate-400 leading-none mt-1">Updated {formattedDate(note.updatedAt)}</p>
          </div>
        </div>

        {note.attachmentsCount > 0 && (
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500" title={`${note.attachmentsCount} attachments`}>
            <Paperclip className="w-3 h-3" />
            <span className="text-[11px] font-semibold">{note.attachmentsCount}</span>
          </div>
        )}

        {note.comments && note.comments.length > 0 && (
          <div className={`flex items-center gap-1 ${unreadComments ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} title={`${note.comments.length} comments`}>
            <MessageSquare className="w-3 h-3" />
            <span className="text-[11px] font-semibold">{note.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
