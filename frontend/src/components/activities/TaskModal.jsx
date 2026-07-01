import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function TaskModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Task title is required');
    onSave({ title, priority, status: 'TODO' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Follow-up Task" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Task Title
          </label>
          <input
            type="text"
            required
            placeholder="E.g., Send updated proposal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
