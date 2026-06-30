import { useState } from 'react';
import Drawer from '../ui/Drawer';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Pin, Star, Paperclip, Calendar, User, Link2, Edit, Trash2, Archive, Share2, Download, FileText, MessageSquare, Activity } from 'lucide-react';
import ShareDialog from './sharing/ShareDialog';
import CommentsSection from './comments/CommentsSection';
import VersionHistory from './VersionHistory';

export default function NoteDetailsDrawer({
  isOpen,
  onClose,
  note,
  onPin,
  onFavorite,
  onEdit,
  onDelete,
  onArchive,
  onShare,
  onCommentsUpdated
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const navigate = useNavigate();

  if (!note) return null;

  const formattedDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleChipClick = (type) => {
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

  // Preloaded mock attachments list based on attachmentsCount
  const mockAttachmentsList = Array.from({ length: note.attachmentsCount || 0 }).map((_, i) => {
    const fileTypes = [
      { name: 'contract_draft.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'requirements_doc.docx', size: '1.2 MB', type: 'DOC' },
      { name: 'mockups_v1.png', size: '4.8 MB', type: 'IMG' },
      { name: 'financials_export.xlsx', size: '890 KB', type: 'XLS' }
    ];
    const index = (note.id + i) % fileTypes.length;
    return {
      id: `${note.id}-file-${i}`,
      ...fileTypes[index]
    };
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Note Details"
    >
      <div className="flex flex-col h-full justify-between">
        {/* Main Content Area */}
        <div className="space-y-6 flex-1 pr-1">
          {/* Quick Info & Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40">
            {/* Owner Assignee */}
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${note.owner?.color || 'bg-indigo-600'}`}>
                {note.owner?.initials || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{note.owner?.name}</p>
                <p className="text-xs text-slate-400">Created by Owner</p>
              </div>
            </div>

            {/* Quick Status Toggles & Edit/Delete Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPin(note.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  note.pinned
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-200 dark:border-rose-900/30'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/15 border-slate-200 dark:border-slate-800'
                }`}
                title={note.pinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => onFavorite(note.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  note.favorite
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-200 dark:border-amber-900/30'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/15 border-slate-200 dark:border-slate-800'
                }`}
                title={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
              >
                <Star className="w-4 h-4" />
              </button>

              <button
              onClick={() => setShareDialogOpen(true)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                note.shared
                  ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/30'
                  : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/15 border-slate-200 dark:border-slate-800'
              }`} 
              title={note.shared ? 'Make Private' : 'Share Note'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            {/* Share Dialog */}
            <ShareDialog
              isOpen={shareDialogOpen}
              onClose={() => setShareDialogOpen(false)}
              note={note}
              onShareSuccess={() => {
                // refresh note data if needed; placeholder
                onShare && onShare(note.id);
              }}
            />

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

              <button
                onClick={() => { onEdit(note); }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/15 transition-all cursor-pointer"
                title="Edit details"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => { onDelete(note.id); onClose(); }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 px-6 mt-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-1 mr-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-1 mr-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'comments'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Comments
              {note.comments?.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                  {note.comments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`pb-3 px-1 mr-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'versions'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Versions
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Activity
              {note.activity?.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                  {note.activity.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            {activeTab === 'details' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Title & Linked Entity Row */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {note.linkedRecords && note.linkedRecords.length > 0 && (
                      <div className="flex flex-wrap gap-2.5">
                        {note.linkedRecords.map((rec) => (
                          <span
                            key={rec.id}
                            onClick={() => handleChipClick(rec.type)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border tracking-wide uppercase cursor-pointer hover:opacity-85 transition-opacity ${getLinkedColor(rec.type)}`}
                            title={`Go to ${rec.type}s`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Linked to {rec.type}: {rec.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {note.archived && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 tracking-wide uppercase">
                        Archived
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                    {note.title}
                  </h1>
                </div>

                {/* Details Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-150 dark:border-slate-800/60 text-xs">
                  <div>
                    <p className="font-semibold text-slate-400 uppercase tracking-wide">Created</p>
                    <p className="mt-1 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formattedDate(note.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400 uppercase tracking-wide">Last Updated</p>
                    <p className="mt-1 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formattedDate(note.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Content Description */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Note Content</p>
                  <div className="rounded-xl p-4 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/30 max-h-[350px] overflow-y-auto">
                    {note.content ? (
                      <div
                        className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    ) : (
                      <span className="italic text-slate-400">No content details provided.</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10"
                        >
                          #{typeof tag === 'string' ? tag : tag.label || tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {note.attachmentsCount > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Attachments ({note.attachmentsCount})</p>
                    <div className="space-y-1.5">
                      {mockAttachmentsList.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-sm text-slate-600 dark:text-slate-300 shadow-sm group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-200">{file.name}</p>
                              <p className="text-xs text-slate-400">{file.size} • {file.type}</p>
                            </div>
                          </div>
                          <button className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-all cursor-pointer">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'comments' ? (
              <div className="h-[500px] animate-in fade-in slide-in-from-bottom-2">
                <CommentsSection note={note} onCommentsUpdated={onCommentsUpdated} />
              </div>
            ) : (
              /* Activity Tab */
              <div className="animate-in fade-in slide-in-from-bottom-2 pb-4">
                <ActivityTimeline note={note} />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 sticky bottom-0 shrink-0">
          <Button variant="outline" onClick={() => onArchive(note.id)}>
            {note.archived ? 'Re-activate Note' : 'Archive Note'}
          </Button>

          <Button onClick={() => onEdit(note)}>
            <Edit className="w-4 h-4" />
            Edit Details
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
