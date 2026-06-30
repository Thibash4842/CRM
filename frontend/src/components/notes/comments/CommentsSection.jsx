import { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import { notesService, ACTIVE_USER } from '../../../services/notesService';
import { Loader2 } from 'lucide-react';

export default function CommentsSection({ note, onCommentsUpdated }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync internal state when note prop changes
  useEffect(() => {
    if (note) {
      setComments(note.comments || []);
      setLoading(false);
    }
  }, [note]);

  const handleAddComment = async (text) => {
    try {
      const updatedNote = await notesService.addComment(note.id, text);
      setComments(updatedNote.comments || []);
      if (onCommentsUpdated) onCommentsUpdated(updatedNote);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId, text, parentId = null) => {
    try {
      const updatedNote = await notesService.updateComment(note.id, commentId, text, parentId);
      setComments(updatedNote.comments || []);
      if (onCommentsUpdated) onCommentsUpdated(updatedNote);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId, parentId = null) => {
    try {
      const updatedNote = await notesService.deleteComment(note.id, commentId, parentId);
      setComments(updatedNote.comments || []);
      if (onCommentsUpdated) onCommentsUpdated(updatedNote);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (parentId, text) => {
    try {
      const updatedNote = await notesService.addComment(note.id, text, parentId);
      setComments(updatedNote.comments || []);
      if (onCommentsUpdated) onCommentsUpdated(updatedNote);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReaction = async (commentId, emoji, parentId = null) => {
    try {
      // Optimistic update for snappier UI
      const optimisticComments = [...comments];
      let target = null;
      if (parentId) {
        const p = optimisticComments.find(c => c.id === parentId);
        if (p) target = p.replies.find(r => r.id === commentId);
      } else {
        target = optimisticComments.find(c => c.id === commentId);
      }
      
      // Update logic locally first if target found
      if (target) {
        target.reactions = target.reactions || {};
        const users = target.reactions[emoji] || [];
        if (users.includes(ACTIVE_USER.name)) {
          target.reactions[emoji] = users.filter(u => u !== ACTIVE_USER.name);
        } else {
          target.reactions[emoji] = [...users, ACTIVE_USER.name];
        }
        if (target.reactions[emoji].length === 0) delete target.reactions[emoji];
        setComments(optimisticComments);
      }

      // Sync with service
      const updatedNote = await notesService.addReaction(note.id, commentId, emoji, parentId);
      setComments(updatedNote.comments || []);
      if (onCommentsUpdated) onCommentsUpdated(updatedNote);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">👋</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No comments yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
              Start the conversation! Mention teammates using '@' to notify them.
            </p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleAddReply}
              onReact={handleAddReaction}
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <CommentInput onSubmit={handleAddComment} />
      </div>
    </div>
  );
}
