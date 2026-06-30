import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Edit2, Trash2, MessageSquare, Smile } from 'lucide-react';
import CommentInput from './CommentInput';
import { ACTIVE_USER, MOCK_USERS } from '../../../services/notesService';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🎉', '👀'];

// Helper to highlight mentions
const renderTextWithMentions = (text) => {
  if (!text) return null;
  const parts = text.split(/(@\w+\s\w+|@\w+)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function CommentItem({
  comment,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onReact
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const isAuthor = comment.author?.name === ACTIVE_USER.name;

  const handleEditSubmit = (newText) => {
    onEdit(comment.id, newText);
    setIsEditing(false);
  };

  const handleReplySubmit = (text) => {
    onReply(comment.id, text);
    setIsReplying(false);
  };

  return (
    <div className={`group flex gap-3 ${isReply ? 'mt-3' : 'mt-5'} animate-in fade-in slide-in-from-bottom-2`}>
      {/* Avatar */}
      <div className={`shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
        isReply ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-xs'
      } ${comment.author?.color || 'bg-slate-500'}`}>
        {comment.author?.initials || 'U'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {comment.author?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-[10px] text-slate-400 italic">(edited)</span>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-10">
                {isAuthor && (
                  <>
                    <button
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        {isEditing ? (
          <div className="mt-2 mb-2">
            <CommentInput 
              initialValue={comment.text} 
              onSubmit={handleEditSubmit} 
              autoFocus 
            />
            <button 
              onClick={() => setIsEditing(false)} 
              className="text-xs text-slate-500 hover:text-slate-700 mt-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
            {renderTextWithMentions(comment.text)}
          </div>
        )}

        {/* Action Bar (Reactions & Reply) */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-2">
            {/* Reactions Display */}
            {comment.reactions && Object.entries(comment.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReact(comment.id, emoji)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  users.includes(ACTIVE_USER.name)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700/50 dark:text-indigo-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'
                } hover:opacity-80 transition-opacity cursor-pointer`}
                title={users.join(', ')}
              >
                <span>{emoji}</span>
                <span className="text-[10px]">{users.length}</span>
              </button>
            ))}

            {/* Add Reaction Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                title="Add Reaction"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {showEmojis && (
                <div className="absolute left-0 top-full mt-1 flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20 animate-in zoom-in-95">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { onReact(comment.id, emoji); setShowEmojis(false); }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Button */}
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Reply
              </button>
            )}
          </div>
        )}

        {/* Reply Input */}
        {isReplying && !isReply && (
          <div className="mt-3">
            <CommentInput 
              onSubmit={handleReplySubmit} 
              placeholder="Write a reply..." 
              autoFocus 
            />
            <button 
              onClick={() => setIsReplying(false)} 
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600 mt-1 uppercase tracking-wide"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Render Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1 border-l-2 border-slate-100 dark:border-slate-800/60 pl-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                onEdit={(id, text) => onEdit(id, text, comment.id)}
                onDelete={(id) => onDelete(id, comment.id)}
                onReact={(id, emoji) => onReact(id, emoji, comment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
