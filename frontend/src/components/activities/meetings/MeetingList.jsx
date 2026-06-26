import React from 'react';
import { Calendar, Clock, MapPin, Users, Video, MoreVertical } from 'lucide-react';

const mockMeetings = [
  { id: 1, title: 'Q4 Product Demo', company: 'Acme Corp', date: 'Oct 25, 2023', time: '10:00 AM - 11:00 AM', type: 'Demo', attendees: 4, location: 'Zoom', isVirtual: true, status: 'Upcoming' },
  { id: 2, title: 'Discovery Call', company: 'Cyberdyne', date: 'Oct 26, 2023', time: '2:30 PM - 3:15 PM', type: 'Discovery', attendees: 2, location: 'Google Meet', isVirtual: true, status: 'Upcoming' },
  { id: 3, title: 'Contract Negotiation', company: 'Initech', date: 'Oct 27, 2023', time: '11:00 AM - 12:30 PM', type: 'Proposal', attendees: 3, location: 'HQ Office', isVirtual: false, status: 'Upcoming' },
];

export default function MeetingList({ filter = 'Upcoming' }) {
  // In a real app, we'd filter the data based on the 'filter' prop.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockMeetings.map((meeting) => (
        <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              meeting.type === 'Demo' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
              meeting.type === 'Discovery' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              {meeting.type}
            </span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{meeting.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{meeting.company}</p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {meeting.date}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              {meeting.time}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
              {meeting.isVirtual ? <Video className="w-4 h-4 text-gray-400" /> : <MapPin className="w-4 h-4 text-gray-400" />}
              {meeting.location}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-500 gap-1.5">
              <Users className="w-4 h-4" />
              {meeting.attendees} Attendees
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
