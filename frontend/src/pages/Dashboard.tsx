import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentList } from '../components/DocumentList';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, Shield } from 'lucide-react';
import { ChiefDashboard } from './dashboards/ChiefDashboard';
import { Link } from 'react-router-dom';
import { ArchiveRestore } from 'lucide-react';

function StandardDashboard({ user }: { user: any }) {

  const { data: stats } = useQuery({
    queryKey: ['documentStats'],
    queryFn: () => api.get('/api/documents/stats/').then(res => res.data),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/api/documents/').then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });


  const documentList = Array.isArray(documents) ? documents : (documents as any).results || [];

  return (
    <div>
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {(user?.role === 'TEAM_MANAGER') && (
            <>
              <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <div className="rounded-md bg-blue-100 p-3 text-blue-600">
                  <FileText size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Uploaded Documents</p>
                  <p className="text-2xl font-semibold text-gray-900">{documentList.filter((d: any) => d.uploaded_by_details?.username === user?.username || d.uploaded_by === user?.id).length}</p>
                </div>
              </div>
              
              <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <div className="rounded-md bg-yellow-100 p-3 text-yellow-600">
                  <Clock size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{documentList.filter((d: any) => (d.uploaded_by_details?.username === user?.username || d.uploaded_by === user?.id) && d.status === 'PENDING_APPROVAL').length}</p>
                </div>
              </div>

              <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <div className="rounded-md bg-red-100 p-3 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Action Needed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {documentList.filter((d: any) => (d.uploaded_by_details?.username === user?.username || d.uploaded_by === user?.id) && (d.status === 'RETURNED' || d.status === 'DRAFT' || d.deletion_requested)).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200 col-span-1 sm:col-span-2 lg:col-span-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-indigo-100 p-3 text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Learning & Courses</p>
                    <p className="text-sm text-gray-900">Create and manage learning courses and playlists for the team.</p>
                  </div>
                </div>
                <Link to="/system/learning" className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-md hover:bg-indigo-100 transition-colors">
                  Manage Courses
                </Link>
              </div>
            </>
          )}

          {(user?.role === 'DIRECTOR') && (
            <>
              <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <div className="rounded-md bg-blue-100 p-3 text-blue-600">
                  <FileText size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Department Documents</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>

              <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <div className="rounded-md bg-red-100 p-3 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending My Approval</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200 col-span-1 sm:col-span-2 lg:col-span-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-purple-100 p-3 text-purple-600">
                    <FileText size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Department Performance & Plans</p>
                    <p className="text-sm text-gray-900">Register strategic plans and performance metrics for the public site.</p>
                  </div>
                </div>
                <Link to="/dashboard/performance-plans" className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors">
                  Manage Plans
                </Link>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200 col-span-1 sm:col-span-2 lg:col-span-4">
                <div className="flex items-center">
                  <div className="rounded-md bg-indigo-100 p-3 text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Learning & Courses</p>
                    <p className="text-sm text-gray-900">Create and manage learning courses and playlists for the organization.</p>
                  </div>
                </div>
                <Link to="/system/learning" className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-md hover:bg-indigo-100 transition-colors">
                  Manage Courses
                </Link>
              </div>
            </>
          )}

          {(!user || user?.role === 'AUDITOR' || user?.role === 'AUDITEE' || user?.role === 'VISITOR') && (
            <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
              <div className="rounded-md bg-blue-100 p-3 text-blue-600">
                <FileText size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accessible Documents</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          )}

</div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Documents</h2>
          <div className="flex gap-4">
            {['TEAM_MANAGER', 'DIRECTOR', 'CHIEF'].includes(user?.role || '') && (
              <Link
                to="/system/backups"
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                <ArchiveRestore size={16} /> Backup & Restore
              </Link>
            )}
            {['TEAM_MANAGER', 'TEAM_MEMBER', 'DIRECTOR', 'CHIEF', 'ADMIN'].includes(user?.role || '') && (
              <Link
                to="/documents/new"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus size={16} /> Upload Document
              </Link>
            )}
          </div>
        </div>
        <DocumentList documents={documents} />
      </div>

    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user ? `Welcome back, ${user.full_name || user.username}` : 'Public Document Portal'}
        </h1>
        {user && (
          <p className="mt-2 text-sm text-gray-600">
            Role: <span className="font-semibold text-blue-600">{user.role_display}</span>
          </p>
        )}
      </div>

      {user?.role === 'CHIEF' ? (
        <>
          <div className="flex justify-end mb-4">
             <Link
                to="/system/backups"
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
              >
                <ArchiveRestore size={16} /> Backup & Restore
              </Link>
          </div>
          <ChiefDashboard />
        </>
      ) : (
        <StandardDashboard user={user} />
      )}
    </div>
  );
}
