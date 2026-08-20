import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, UserCog, BriefcaseBusiness } from 'lucide-react';

export function IncidentAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Branch Audit Administration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage roles, access permissions, and central incident registers.
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
            <h2 className="text-xl font-bold text-gray-900">Branch Audit Roles & Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Configure system-wide roles for the Branch Audit Subsystem. Manage permissions for standard roles.
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
            <h2 className="text-xl font-bold text-gray-900">Branch Audit Users Access</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Assign users to specific Branch Audit roles. Control who has access to report and manage issues.
          </p>
          <Link 
            to="/admin/branch-audit/users" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full"
          >
            Manage User Access
          </Link>
        </div>

        {/* Incident Center */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Branch Audit Control Center</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Access the Branch Audit subsystem to oversee and review all branch irregularities and audit issues.
          </p>
          <Link 
            to="/branch-audit" 
            className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors w-full"
          >
            View Branch Audit Registry
          </Link>
        </div>
        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
              <BriefcaseBusiness size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Lookup Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Manage dynamic lookup values: audit categories, responsible organs, and involved systems.
          </p>
          <Link 
            to="/branch-audit/admin" 
            className="inline-flex items-center justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors w-full"
          >
            Manage Lookup Values
          </Link>
        </div>
      </div>
    </div>
  );
}
