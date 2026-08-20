import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, UserCog, Trash2, ArchiveRestore } from 'lucide-react';

export function DMSAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Document Management Administration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage roles, document access permissions, and central repositories for the DMS Subsystem.
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
            <h2 className="text-xl font-bold text-gray-900">DMS Roles & Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Configure system-wide roles for the Document Subsystem. Manage permissions for standard roles.
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
            <h2 className="text-xl font-bold text-gray-900">DMS Users Access</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Assign users to specific Document Management roles. Control who has access to the DMS Subsystem.
          </p>
          <Link 
            to="/admin/dms/users" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full"
          >
            Manage User Access
          </Link>
        </div>



        {/* Recycle Bin */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg text-red-600">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recycle Bin</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Manage deleted documents across the organization. Permanently delete or restore mistakenly deleted items.
          </p>
          <Link 
            to="/recycle-bin" 
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors w-full"
          >
            Manage Recycle Bin
          </Link>
        </div>

        {/* System Backup */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-100 rounded-lg text-rose-600">
              <ArchiveRestore size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">System Backup</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Manage document backups and restore from zip archives securely.
          </p>
          <Link 
            to="/system/backups" 
            className="inline-flex items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors w-full"
          >
            Manage Backups
          </Link>
        </div>

      </div>
    </div>
  );
}
