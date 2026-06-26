import React from 'react';
import { MoreVertical, Edit2, Trash2, CheckCircle } from 'lucide-react';
import Button from '../../ui/Button';

const mockTasks = [
  { id: 1, name: 'Prepare Q3 Report', related: 'Acme Corp', priority: 'High', dueDate: '2023-10-25', status: 'Pending', owner: 'John Doe' },
  { id: 2, name: 'Call with Sarah regarding proposal', related: 'Sarah Connor', priority: 'Medium', dueDate: '2023-10-26', status: 'In Progress', owner: 'Jane Smith' },
  { id: 3, name: 'Follow up on contract signature', related: 'Initech', priority: 'High', dueDate: '2023-10-24', status: 'Completed', owner: 'John Doe' },
  { id: 4, name: 'Update lead scoring model', related: 'Internal', priority: 'Low', dueDate: '2023-10-30', status: 'Pending', owner: 'Mike Johnson' },
];

export default function TaskList() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3 font-medium">Task Name</th>
            <th className="px-6 py-3 font-medium">Related To</th>
            <th className="px-6 py-3 font-medium">Priority</th>
            <th className="px-6 py-3 font-medium">Due Date</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Owner</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockTasks.map((task) => (
            <tr key={task.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${task.status === 'Completed' ? 'text-green-500' : 'text-gray-300'}`} />
                {task.name}
              </td>
              <td className="px-6 py-4 text-gray-500">{task.related}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">{task.dueDate}</td>
              <td className="px-6 py-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">{task.owner}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
