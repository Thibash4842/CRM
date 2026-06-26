import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Input, Select, Textarea } from './Input';

export default function InlineEdit({ value, type = 'text', options = [], onSave, placeholder = 'Empty', isEditable = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value || '');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div 
        className={`group flex items-center gap-2 rounded-md transition-colors ${isEditable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 -ml-1' : ''} ${justSaved ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
        onClick={() => isEditable && setIsEditing(true)}
      >
        <span className={`flex-1 truncate ${!value ? 'text-slate-400 italic' : 'text-slate-900 dark:text-slate-100'}`}>
          {type === 'select' && value ? (options.find(o => (o.value || o) === value)?.label || value) : (value || placeholder)}
        </span>
        {isEditable && (
          <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );
  }

  return (
    <div className="relative -ml-1">
      {type === 'select' ? (
        <Select
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave}
          options={options}
          className="py-1 px-2 h-8 min-h-0 text-sm w-full"
          autoFocus
        />
      ) : type === 'textarea' ? (
        <Textarea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="py-1 px-2 text-sm w-full"
          autoFocus
        />
      ) : (
        <Input
          type={type}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="py-1 px-2 h-8 min-h-0 text-sm w-full"
          autoFocus
        />
      )}
    </div>
  );
}
