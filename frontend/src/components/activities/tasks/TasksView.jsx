import React, { useState } from 'react';
import KPICards from '../shared/KPICards';
import ActivityToolbar from '../shared/ActivityToolbar';
import { List, LayoutGrid, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import Button from '../../ui/Button';
import TaskList from './TaskList';
import TaskKanban from './TaskKanban';

export default function TasksView() {
  const [view, setView] = useState('list');

  const metrics = [
    { label: 'Total Tasks', value: '142', icon: CheckSquare, color: 'bg-blue-500', trend: 12 },
    { label: 'Pending', value: '38', icon: CheckSquare, color: 'bg-yellow-500', trend: 5 },
    { label: 'In Progress', value: '24', icon: CheckSquare, color: 'bg-purple-500' },
    { label: 'Completed', value: '80', icon: CheckSquare, color: 'bg-green-500', trend: 18 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your work.</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`p-2 rounded-md ${view === 'kanban' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md ${view === 'calendar' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <KPICards metrics={metrics} />
      <ActivityToolbar />

      <div className={`${view === 'calendar' ? 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[400px] flex items-center justify-center text-gray-500' : ''}`}>
        {view === 'list' && <TaskList />}
        {view === 'kanban' && <TaskKanban />}
        {view === 'calendar' && <div>Task Calendar Component Goes Here</div>}
      </div>
    </div>
  );
}
