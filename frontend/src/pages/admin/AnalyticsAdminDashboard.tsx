import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PieChart, UserCog } from 'lucide-react';

export function AnalyticsAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Administration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage roles, report visibility, and engine configuration for Analytics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* Roles Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Roles & Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Configure system-wide roles for the Analytics Subsystem. Manage permissions for Data Scientists and Analysts.
          </p>
          <Link 
            to="/system/roles" 
            className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors w-full"
          >
            Manage Roles Definitions
          </Link>
        </div>

        {/* User Management Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <UserCog size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Users Access</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Assign users to specific Analytics roles. Control who has access to view enterprise reports.
          </p>
          <Link 
            to="/admin/analytics/users" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full"
          >
            Manage User Access
          </Link>
        </div>

        {/* Analytics Engine */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
              <PieChart size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Engine</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Access the Analytics Overview to review dashboards and data integrations.
          </p>
          <Link 
            to="/analytics/overview" 
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors w-full"
          >
            View Analytics Overview
          </Link>
        </div>

      </div>
    </div>
  );
}
