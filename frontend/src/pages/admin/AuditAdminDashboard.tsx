import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Building2, UserCog } from 'lucide-react';

export function AuditAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Audit Administration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage roles, access, periods, and structure for the Audit Subsystem.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* Roles & Access Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Roles & Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Configure system-wide roles for the Audit Subsystem. Define permissions for Chiefs, Directors, Managers, Auditors, and Report Consumers.
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
            <h2 className="text-xl font-bold text-gray-900">Audit Users Access</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Assign users to specific Audit Roles. Control who has access to the Audit Subsystem and at what level.
          </p>
          <Link 
            to="/admin/audit/users" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full"
          >
            Manage User Access
          </Link>
        </div>

        {/* Audit Periods Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <Calendar size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Audit Periods</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Define and manage financial and operational periods. Close or open periods for auditing activities.
          </p>
          <Link 
            to="/system/periods" 
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors w-full"
          >
            Manage Audit Periods
          </Link>
        </div>

        {/* Organizational Structure Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
              <Building2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Departments</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Manage the organizational hierarchy (Divisions, Departments, Branches) that form the Audit Universe.
          </p>
          <Link 
            to="/system/departments" 
            className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors w-full"
          >
            Manage Organizational Structure
          </Link>
        </div>

      </div>
    </div>
  );
}
