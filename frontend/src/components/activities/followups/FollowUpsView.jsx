import React, { useState } from 'react';
import KPICards from '../shared/KPICards';
import ActivityToolbar from '../shared/ActivityToolbar';
import { Clock, AlertCircle, Calendar, CheckSquare } from 'lucide-react';
import FollowUpList from './FollowUpList';

export default function FollowUpsView() {
  const [view, setView] = useState('due_today');

  const metrics = [
    { label: 'Due Today', value: '18', icon: AlertCircle, color: 'bg-yellow-500', trend: 5 },
    { label: 'Upcoming', value: '42', icon: Calendar, color: 'bg-blue-500', trend: 12 },
    { label: 'Overdue', value: '6', icon: Clock, color: 'bg-red-500', trend: -2 },
    { label: 'Completed', value: '156', icon: CheckSquare, color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Follow-Ups</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Never miss a customer follow-up.</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('due_today')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'due_today' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Due Today
          </button>
          <button
            onClick={() => setView('upcoming')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'upcoming' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView('overdue')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'overdue' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Overdue
          </button>
          <button
            onClick={() => setView('completed')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'completed' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <KPICards metrics={metrics} />
      <ActivityToolbar />

      <div className="mt-6">
        {view === 'due_today' && <FollowUpList filter="due_today" />}
        {view === 'upcoming' && <FollowUpList filter="upcoming" />}
        {view === 'overdue' && <FollowUpList filter="overdue" />}
        {view === 'completed' && <FollowUpList filter="completed" />}
      </div>
    </div>
  );
}
