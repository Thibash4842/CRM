import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckSquare, Phone, Users, Clock, Plus } from 'lucide-react';
import QuickActions from '../components/activities/shared/QuickActions';

import TasksView from '../components/activities/tasks/TasksView';
import CallsView from '../components/activities/calls/CallsView';
import MeetingsView from '../components/activities/meetings/MeetingsView';
import FollowUpsView from '../components/activities/followups/FollowUpsView';

const tabs = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'meetings', label: 'Meetings', icon: Users },
  { id: 'follow-ups', label: 'Follow-ups', icon: Clock },
];

export default function Activities() {
  const { type = 'tasks' } = useParams();
  const navigate = useNavigate();

  const renderContent = () => {
    switch (type) {
      case 'tasks':
        return <TasksView />;
      case 'calls':
        return <CallsView />;
      case 'meetings':
        return <MeetingsView />;
      case 'follow-ups':
        return <FollowUpsView />;
      default:
        return <TasksView />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your daily tasks, calls, meetings, and follow-ups.
          </p>
        </div>
        <QuickActions />
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = type === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/activities/${tab.id}`)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}
