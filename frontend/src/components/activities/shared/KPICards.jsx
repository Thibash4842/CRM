import React from 'react';
import { motion } from 'framer-motion';

export default function KPICards({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${metric.iconColor || metric.color.replace('bg-', 'text-')}`} />
              </div>
              {metric.trend && (
                <span className={`text-sm font-medium ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend > 0 ? '+' : ''}{metric.trend}%
                </span>
              )}
            </div>
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{metric.label}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
