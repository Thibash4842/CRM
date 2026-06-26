import React from 'react';
import { Clock, CheckSquare, MoreVertical, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';

const mockFollowUps = [
  { id: 1, contact: 'Sarah Connor', company: 'Cyberdyne', related: 'Q4 Product Demo', date: 'Today', priority: 'High', status: 'Pending', owner: 'John Doe' },
  { id: 2, contact: 'John Smith', company: 'Acme Corp', related: 'Pricing Proposal', date: 'Tomorrow', priority: 'Medium', status: 'Pending', owner: 'Jane Smith' },
  { id: 3, contact: 'Jane Doe', company: 'Initech', related: 'Discovery Call', date: 'Oct 24, 2023', priority: 'Low', status: 'Completed', owner: 'Mike Johnson' },
  { id: 4, contact: 'Mike Johnson', company: 'Soylent', related: 'Contract Review', date: 'Yesterday', priority: 'High', status: 'Overdue', owner: 'John Doe' },
];

export default function FollowUpList({ filter = 'due_today' }) {
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 font-medium">Contact</th>
            <th className="px-6 py-4 font-medium">Related Deal/Action</th>
            <th className="px-6 py-4 font-medium">Due Date</th>
            <th className="px-6 py-4 font-medium">Priority</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockFollowUps.map((followup) => (
            <tr key={followup.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900 dark:text-white">{followup.contact}</div>
                <div className="text-xs text-gray-500">{followup.company}</div>
              </td>
              <td className="px-6 py-4 text-gray-500">{followup.related}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  {followup.status === 'Overdue' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <span className={followup.status === 'Overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}>
                    {followup.date}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  followup.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  followup.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {followup.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  followup.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  followup.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {followup.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {followup.status !== 'Completed' && (
                    <button className="p-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors" title="Mark as Completed">
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
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
