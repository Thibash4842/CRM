import React, { useState } from 'react';
import KPICards from '../shared/KPICards';
import ActivityToolbar from '../shared/ActivityToolbar';
import { Phone, BarChart2, List } from 'lucide-react';
import CallList from './CallList';

export default function CallsView() {
  const [view, setView] = useState('logs');

  const metrics = [
    { label: 'Total Calls', value: '450', icon: Phone, color: 'bg-blue-500', trend: 8 },
    { label: 'Today\'s Calls', value: '24', icon: Phone, color: 'bg-purple-500', trend: 15 },
    { label: 'Completed', value: '380', icon: Phone, color: 'bg-green-500' },
    { label: 'Missed', value: '46', icon: Phone, color: 'bg-red-500', trend: -5 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calls</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track all customer conversations.</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('logs')}
            className={`p-2 rounded-md ${view === 'logs' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`p-2 rounded-md ${view === 'analytics' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <KPICards metrics={metrics} />
      <ActivityToolbar />

      <div className={`${view === 'analytics' ? 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[400px] flex items-center justify-center text-gray-500' : ''}`}>
        {view === 'logs' && <CallList />}
        {view === 'analytics' && <div>Call Analytics Component Goes Here</div>}
      </div>
    </div>
  );
}
