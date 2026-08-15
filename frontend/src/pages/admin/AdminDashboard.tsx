import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, Building2, Calendar, Activity, Settings, ArchiveRestore } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/admin/users/').then((res: any) => Array.isArray(res.data) ? res.data : res.data.results || []),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => api.get('/api/admin/departments/').then((res: any) => Array.isArray(res.data) ? res.data : res.data.results || []),
  });

  const { data: periods = [] } = useQuery({
    queryKey: ['admin-periods'],
    queryFn: () => api.get('/api/admin/periods/').then((res: any) => Array.isArray(res.data) ? res.data : res.data.results || []),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => api.get('/api/admin/user-logs/').then((res: any) => res.data?.results || res.data),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-blue-600" size={32} /> Administration Dashboard
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-blue-100 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
          </div>
        </div>
        
        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-purple-100 p-3 text-purple-600">
            <Building2 size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-green-100 p-3 text-green-600">
            <Calendar size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Audit Periods</p>
            <p className="text-2xl font-semibold text-gray-900">{periods.length}</p>
          </div>
        </div>

        <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="rounded-md bg-yellow-100 p-3 text-yellow-600">
            <Activity size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Audit Logs</p>
            <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="text-gray-500" /> Administrative Sections
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/system/users" className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Users className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">Add, edit, or suspend users</p>
            </Link>
            <Link to="/system/departments" className="block p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors">
              <Building2 className="text-purple-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Manage Departments</h3>
              <p className="text-sm text-gray-500">Configure organizational structure</p>
            </Link>
            <Link to="/system/periods" className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
              <Calendar className="text-green-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Audit Periods</h3>
              <p className="text-sm text-gray-500">Define fiscal years and quarters</p>
            </Link>
            <Link to="/system/logs" className="block p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors">
              <Activity className="text-yellow-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">System Logs</h3>
              <p className="text-sm text-gray-500">View user activities and audits</p>
            </Link>
            <Link to="/system/backups" className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
              <ArchiveRestore className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Backup & Restore</h3>
              <p className="text-sm text-gray-500">Manage system data backups</p>
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" /> Recent User Activity
          </h2>
          {logs.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {logs.slice(0, 5).map((log: any, eventIdx: number) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {eventIdx !== Math.min(logs.length, 5) - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                            <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{log.target_user_details?.username || log.target_user}</span>{' '}
                              {log.action.replace(/_/g, ' ')}{' '}
                              {log.notes && <span className="text-gray-400">({log.notes})</span>}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={log.timestamp}>{new Date(log.timestamp).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity logs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
