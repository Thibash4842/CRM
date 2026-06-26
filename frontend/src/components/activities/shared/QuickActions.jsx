import React from 'react';
import { Plus, CheckSquare, Phone, Users, Clock } from 'lucide-react';
import Button from '../../ui/Button';

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary" className="gap-2">
        <Plus className="w-4 h-4" /> New Task
      </Button>
      <Button variant="outline" className="gap-2">
        <Phone className="w-4 h-4" /> Log Call
      </Button>
      <Button variant="outline" className="gap-2">
        <Users className="w-4 h-4" /> Schedule Meeting
      </Button>
      <Button variant="outline" className="gap-2">
        <Clock className="w-4 h-4" /> Create Follow-Up
      </Button>
    </div>
  );
}
