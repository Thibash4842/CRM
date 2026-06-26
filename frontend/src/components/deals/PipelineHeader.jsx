import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Button from '../ui/Button';

export default function PipelineHeader({ onNewDeal, searchTerm, setSearchTerm, activeFilter, setActiveFilter }) {
  const filters = ['My Deals', 'High Value', 'Closing Soon', 'Won', 'Lost'];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deal Pipeline</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track opportunities and monitor revenue across stages.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900 dark:text-slate-100"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(activeFilter === filter ? '' : filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeFilter === filter
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Filter className="w-5 h-5" />
        </button>

        <Button onClick={onNewDeal} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all border-0">
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>
    </div>
  );
}
