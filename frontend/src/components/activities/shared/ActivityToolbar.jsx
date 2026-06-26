import React from 'react';
import { Search, Filter, Calendar, User, Download, Plus } from 'lucide-react';
import Button from '../../ui/Button';

export default function ActivityToolbar({ onSearch, onFilter }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex-1 w-full sm:w-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search activities..."
          className="w-full sm:max-w-md pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div className="hidden md:flex items-center gap-2 border-r border-gray-200 dark:border-gray-600 pr-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" /> Date
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="w-4 h-4" /> Owner
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Status
          </Button>
        </div>
        
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>
    </div>
  );
}
