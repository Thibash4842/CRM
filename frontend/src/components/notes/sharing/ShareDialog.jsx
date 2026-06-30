import React, { useState } from 'react';
import Drawer from '../../ui/Drawer';
import Button from '../../ui/Button';
import { Share2, X } from 'lucide-react';
import { MOCK_USERS, notesService } from '../../../services/notesService';

export default function ShareDialog({ isOpen, onClose, note, onShareSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Viewer');

  const handleShare = async () => {
    if (!selectedUserId) return;
    const target = {
      id: selectedUserId,
      name: selectedUserId,
      role: selectedRole,
      type: 'User'
    };
    try {
      await notesService.shareNote(note.id, target);
      if (onShareSuccess) onShareSuccess();
      onClose();
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="sm" title="Share Note">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select User</label>
          <select
            className="w-full rounded border p-2"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {MOCK_USERS.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Permission Level</label>
          <select
            className="w-full rounded border p-2"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="Owner">Owner</option>
            <option value="Editor">Editor</option>
            <option value="Commenter">Commenter</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button onClick={handleShare} disabled={!selectedUserId}>
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
