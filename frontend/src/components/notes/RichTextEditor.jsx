import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Table, Link2, Code,
  Smile, Undo2, Redo2, Upload, FileText, CheckCircle2, FileUp
} from 'lucide-react';

const POPULAR_EMOJIS = ['👍', '😊', '❤️', '🔥', '🎉', '🚀', '👀', '📝', '💡', '👏', '🌟', '🏁'];

export default function RichTextEditor({ value, onChange, noteId }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [autosaveTime, setAutosaveTime] = useState(null);

  // Initialize content on first load or when switching notes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
      updateCounters();
    }
  }, [noteId]);

  // Load Autosave draft if exists
  useEffect(() => {
    const draftKey = `scratchio_crm_notes_draft_${noteId || 'new'}`;
    const draft = localStorage.getItem(draftKey);
    if (draft && editorRef.current) {
      const confirmRestore = window.confirm("A draft was autosaved for this note. Would you like to restore it?");
      if (confirmRestore) {
        editorRef.current.innerHTML = draft;
        updateCounters();
        if (onChange) onChange(draft);
        showAutosaveTime();
      } else {
        localStorage.removeItem(draftKey);
      }
    }
  }, [noteId]);

  // Autosave setup (Debounced 2 seconds)
  useEffect(() => {
    const draftKey = `scratchio_crm_notes_draft_${noteId || 'new'}`;
    const handleAutosave = () => {
      if (editorRef.current) {
        const currentContent = editorRef.current.innerHTML;
        localStorage.setItem(draftKey, currentContent);
        showAutosaveTime();
      }
    };

    const delayDebounceFn = setTimeout(() => {
      // Save draft if user actually typed
      if (editorRef.current && editorRef.current.innerHTML !== value) {
        handleAutosave();
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [value, noteId]);

  const showAutosaveTime = () => {
    const now = new Date();
    setAutosaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Clear drafts manually upon final save (to be called by parent if needed, or cleared automatically on unmount / success)
  useEffect(() => {
    return () => {
      // Keep drafts in local storage unless cleared by saving
    };
  }, []);

  const updateCounters = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  const handleInput = () => {
    updateCounters();
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  // Formatting toggles
  const handleFormat = (e, style) => {
    e.preventDefault();
    executeCommand(style);
  };

  const handleBlockFormat = (e, tag) => {
    e.preventDefault();
    executeCommand('formatBlock', tag);
  };

  // Custom Insert Checkbox List
  const handleInsertChecklist = (e) => {
    e.preventDefault();
    const checkboxId = `chk-${Date.now()}`;
    const checklistHtml = `
      <div class="flex items-start gap-2.5 my-1.5" contenteditable="false">
        <input 
          type="checkbox" 
          id="${checkboxId}"
          class="w-4 h-4 mt-1 rounded text-indigo-600 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0 focus:ring-indigo-500" 
          onclick="this.toggleAttribute('checked')"
        />
        <div contenteditable="true" class="flex-1 outline-none text-slate-700 dark:text-slate-200 text-sm font-medium empty:before:content-['Task_item...'] empty:before:text-slate-400">Task item...</div>
      </div>
    `;
    executeCommand('insertHTML', checklistHtml);
  };

  // Custom Insert Table
  const handleInsertTable = (e) => {
    e.preventDefault();
    const tableHtml = `
      <table class="w-full border-collapse my-4 border border-slate-200 dark:border-slate-800 text-sm select-all">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-900/50">
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-700 dark:text-slate-300">Header 1</th>
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-700 dark:text-slate-300">Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2.5 text-slate-600 dark:text-slate-300">Edit cell...</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2.5 text-slate-600 dark:text-slate-300">Edit cell...</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2.5 text-slate-600 dark:text-slate-300">Edit cell...</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2.5 text-slate-600 dark:text-slate-300">Edit cell...</td>
          </tr>
        </tbody>
      </table>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  // Custom Insert Code Block
  const handleInsertCodeBlock = (e) => {
    e.preventDefault();
    const codeHtml = `
      <pre class="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs my-4 overflow-x-auto border border-slate-800/80 select-all" contenteditable="true"><code>// Type your code script here...</code></pre>
    `;
    executeCommand('insertHTML', codeHtml);
  };

  // Custom Insert Link
  const handleInsertLink = (e) => {
    e.preventDefault();
    const url = window.prompt('Enter link URL (e.g. https://google.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Emoji Insert Command
  const handleInsertEmoji = (emoji) => {
    executeCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  // File drop & select rendering simulator
  const handleFileInsert = (file) => {
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = (e) => {
        const imageHtml = `
          <div class="my-4 relative group max-w-md border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/20 p-2 flex flex-col items-center gap-1.5 select-none" contenteditable="false">
            <img src="${e.target.result}" alt="${file.name}" class="max-h-60 rounded-lg object-cover w-full" />
            <span class="text-[10px] text-slate-400 font-mono self-start">${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
          </div>
        `;
        executeCommand('insertHTML', imageHtml);
      };
      reader.readAsDataURL(file);
    } else {
      // General File Card
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const fileCardHtml = `
        <div class="my-4 flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 text-sm max-w-sm select-none" contenteditable="false">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 shrink-0">📎</div>
            <div class="min-w-0">
              <p class="font-bold text-slate-700 dark:text-slate-300 truncate" title="${file.name}">${file.name}</p>
              <p class="text-xs text-slate-400">${sizeStr}</p>
            </div>
          </div>
          <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md">✓ Dropped</span>
        </div>
      `;
      executeCommand('insertHTML', fileCardHtml);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileInsert(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileInsert(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-950/20 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all duration-200">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-250/50 dark:border-slate-800/80 select-none">
        
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'undo')}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'redo')}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mr-2"
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Font styling */}
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'bold')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5 font-bold" />
        </button>
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'italic')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'underline')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors mr-2"
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Block Headings */}
        <button
          type="button"
          onClick={(e) => handleBlockFormat(e, '<h1>')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => handleBlockFormat(e, '<h2>')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => handleBlockFormat(e, '<h3>')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors mr-2"
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Lists & Checkbox */}
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'insertUnorderedList')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => handleFormat(e, 'insertOrderedList')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleInsertChecklist}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors mr-2"
          title="Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Complex Components: Tables, Code Blocks, Links */}
        <button
          type="button"
          onClick={handleInsertTable}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Insert Table"
        >
          <Table className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleInsertCodeBlock}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Insert Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleInsertLink}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors mr-2"
          title="Insert Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Image Attachment & Emoji pickers */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Insert Image/File Attachment"
        >
          <FileUp className="w-3.5 h-3.5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${showEmojiPicker ? 'bg-slate-250 dark:bg-slate-850 text-indigo-500' : 'text-slate-600 dark:text-slate-400'}`}
            title="Insert Emoji"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute left-0 mt-2 p-2 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl grid grid-cols-4 gap-1 z-30 animate-fade-in select-none">
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-lg transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editing Canvas Area */}
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder="Start writing or drop files here..."
        className="flex-1 min-h-[220px] max-h-[400px] overflow-y-auto p-4 focus:outline-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none focus:prose-indigo border-0"
      />

      {/* Footer statistics and autosave time indicator */}
      <div className="flex items-center justify-between p-2 border-t border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 select-none text-[10px] text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          {autosaveTime ? (
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Autosaved at {autosaveTime}
            </span>
          ) : (
            <span>Ready</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <span>Words: <strong className="text-slate-500 dark:text-slate-300">{wordCount}</strong></span>
          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <span>Characters: <strong className="text-slate-500 dark:text-slate-300">{charCount}</strong></span>
        </div>
      </div>
    </div>
  );
}
