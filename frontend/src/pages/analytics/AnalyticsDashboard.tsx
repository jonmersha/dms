import React from 'react';
import { PieChart, TrendingUp, Users, Activity } from 'lucide-react';

export function AnalyticsDashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PieChart className="text-purple-600" /> Analytics Overview
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          High-level metrics and key performance indicators for the audit and learning functions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-blue-100 p-3 text-blue-600">
            <Activity size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Activities</p>
            <p className="text-2xl font-semibold text-gray-900">0</p>
          </div>
        </div>
        
        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-purple-100 p-3 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Performance</p>
            <p className="text-2xl font-semibold text-gray-900">0%</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-green-100 p-3 text-green-600">
            <Users size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-2xl font-semibold text-gray-900">0</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
        <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard Coming Soon</h3>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          Detailed reporting and charts are currently being built. Check back soon for comprehensive data insights.
        </p>
      </div>
    </div>
  );
}
