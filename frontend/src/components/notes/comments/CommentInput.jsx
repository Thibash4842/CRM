import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { MOCK_USERS } from '../../../services/notesService';

export default function CommentInput({ onSubmit, initialValue = '', autoFocus = false, placeholder = 'Add a comment...' }) {
  const [text, setText] = useState(initialValue);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredUsers[Math.max(0, mentionIndex)]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Simple mention detection (last word starts with @)
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.slice(1));
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const textAfterCursor = text.slice(cursorPosition);
    
    const words = textBeforeCursor.split(/\s/);
    words.pop(); // remove the @query part
    
    const newTextBefore = words.length > 0 ? words.join(' ') + ` @${user.name} ` : `@${user.name} `;
    setText(newTextBefore + textAfterCursor);
    setShowMentions(false);
    
    // Maintain focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = newTextBefore.length;
        inputRef.current.selectionEnd = newTextBefore.length;
      }
    }, 0);
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      if (!initialValue) {
        setText('');
      }
    }
  };

  return (
    <div className="relative flex items-end gap-2" ref={wrapperRef}>
      <div className="relative flex-1">
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[40px] max-h-[120px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all scrollbar-hide"
          rows={1}
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        {/* Mentions Dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-56 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-bottom-2">
            {filteredUsers.map((user, idx) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm ${
                  idx === mentionIndex 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${user.color}`}>
                  {user.initials}
                </div>
                <span className="font-medium truncate">{user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-all"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
