import React from 'react';
import { MoreVertical, Clock } from 'lucide-react';

const mockColumns = [
  {
    id: 'pending',
    title: 'Pending',
    tasks: [
      { id: 1, name: 'Prepare Q3 Report', related: 'Acme Corp', priority: 'High', dueDate: 'Oct 25' },
      { id: 4, name: 'Update lead scoring model', related: 'Internal', priority: 'Low', dueDate: 'Oct 30' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: 2, name: 'Call with Sarah regarding proposal', related: 'Sarah Connor', priority: 'Medium', dueDate: 'Oct 26' },
    ],
  },
  {
    id: 'completed',
    title: 'Completed',
    tasks: [
      { id: 3, name: 'Follow up on contract signature', related: 'Initech', priority: 'High', dueDate: 'Oct 24' },
    ],
  },
];

export default function TaskKanban() {
  return (
    <div className="flex gap-6 w-full overflow-x-auto pb-4">
      {mockColumns.map((col) => (
        <div key={col.id} className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {col.title}
              <span className="bg-white dark:bg-gray-700 text-gray-500 text-xs px-2 py-0.5 rounded-full shadow-sm">
                {col.tasks.length}
              </span>
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {col.tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-grab">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{task.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{task.related}</p>
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {task.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
