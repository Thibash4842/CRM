import React from 'react';
import { PhoneOutgoing, PhoneIncoming, PhoneMissed, MoreVertical, PlayCircle } from 'lucide-react';

const mockCalls = [
  { id: 1, contact: 'Sarah Connor', company: 'Cyberdyne', date: 'Today, 10:30 AM', duration: '15m 20s', outcome: 'Interested', type: 'outbound' },
  { id: 2, contact: 'John Smith', company: 'Acme Corp', date: 'Yesterday, 2:15 PM', duration: '5m 10s', outcome: 'Voicemail', type: 'outbound' },
  { id: 3, contact: 'Jane Doe', company: 'Initech', date: 'Yesterday, 11:00 AM', duration: '30m 00s', outcome: 'Follow Up Needed', type: 'inbound' },
  { id: 4, contact: 'Mike Johnson', company: 'Soylent', date: 'Oct 15, 9:00 AM', duration: '0m 00s', outcome: 'No Answer', type: 'missed' },
];

export default function CallList() {
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 font-medium">Contact</th>
            <th className="px-6 py-4 font-medium">Date & Time</th>
            <th className="px-6 py-4 font-medium">Duration</th>
            <th className="px-6 py-4 font-medium">Outcome</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockCalls.map((call) => (
            <tr key={call.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    call.type === 'outbound' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                    call.type === 'inbound' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                    'bg-red-100 text-red-600 dark:bg-red-900/30'
                  }`}>
                    {call.type === 'outbound' && <PhoneOutgoing className="w-4 h-4" />}
                    {call.type === 'inbound' && <PhoneIncoming className="w-4 h-4" />}
                    {call.type === 'missed' && <PhoneMissed className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{call.contact}</div>
                    <div className="text-xs text-gray-500">{call.company}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-500">{call.date}</td>
              <td className="px-6 py-4 text-gray-500">{call.duration}</td>
              <td className="px-6 py-4">
                 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  call.outcome === 'Interested' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  call.outcome === 'Voicemail' || call.outcome === 'No Answer' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {call.outcome}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {call.duration !== '0m 00s' && (
                    <button className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title="Play Recording">
                      <PlayCircle className="w-4 h-4" />
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
