import React, { useState } from 'react';
import KPICards from '../shared/KPICards';
import ActivityToolbar from '../shared/ActivityToolbar';
import { Users, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import MeetingList from './MeetingList';

export default function MeetingsView() {
  const [view, setView] = useState('upcoming');

  const metrics = [
    { label: 'Upcoming', value: '12', icon: Clock, color: 'bg-blue-500', trend: 2 },
    { label: 'Today', value: '4', icon: Users, color: 'bg-purple-500' },
    { label: 'Completed', value: '86', icon: CheckCircle, color: 'bg-green-500', trend: 15 },
    { label: 'Cancelled', value: '3', icon: Users, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meetings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer meetings.</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('upcoming')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'upcoming' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView('past')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'past' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Past
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 ${view === 'calendar' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      <KPICards metrics={metrics} />
      <ActivityToolbar />

      <div className={`${view === 'calendar' ? 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[400px] flex items-center justify-center text-gray-500' : ''}`}>
        {view === 'upcoming' && <MeetingList filter="Upcoming" />}
        {view === 'past' && <MeetingList filter="Past" />}
        {view === 'calendar' && <div>Meetings Calendar Component Goes Here</div>}
      </div>
    </div>
  );
}
