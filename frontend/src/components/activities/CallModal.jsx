import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function CallModal({ isOpen, onClose, onSave }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return alert('Description is required');
    onSave({ type: 'CALL', description });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Call" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Call Notes / Description
          </label>
          <textarea
            required
            rows={4}
            placeholder="What was discussed?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Log Call
          </Button>
        </div>
      </form>
    </Modal>
  );
}
