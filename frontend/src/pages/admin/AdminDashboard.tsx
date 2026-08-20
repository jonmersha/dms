import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, Building2, Calendar, Activity, Settings, ArchiveRestore, Award, X, UserPlus, Newspaper, Megaphone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { AlertModal } from '../../components/ui/AlertModal';

export function AdminDashboard() {
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'|'info'}>({ isOpen: false, title: '', message: '', type: 'info' });
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/admin/users/').then((res: any) => Array.isArray(res.data) ? res.data : res.data.results || []),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => api.get('/api/admin/departments/').then((res: any) => Array.isArray(res.data) ? res.data : res.data.results || []),
  });



  const { data: logs = [] } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => api.get('/api/admin/user-logs/').then((res: any) => res.data?.results || res.data),
  });


  const roleDistribution = React.useMemo(() => {
    const roles: Record<string, number> = {};
    users.forEach((u: any) => {
      const role = u.role_display || u.role || 'Unknown';
      roles[role] = (roles[role] || 0) + 1;
    });
    return Object.entries(roles).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [users]);

  const deptDistribution = React.useMemo(() => {
    const depts: Record<string, number> = {};
    users.forEach((u: any) => {
      const dept = u.department_details?.name || 'Unassigned';
      depts[dept] = (depts[dept] || 0) + 1;
    });
    return Object.entries(depts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5); // top 5
  }, [users]);

  const activityTimeline = React.useMemo(() => {
    const dates: Record<string, number> = {};
    logs.forEach((log: any) => {
      const d = new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dates[d] = (dates[d] || 0) + 1;
    });
    return Object.entries(dates).map(([date, count]) => ({ date, count })).reverse();
  }, [logs]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#64748b'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-blue-600" size={32} /> Administration Dashboard
        </h1>
      </div>


      {/* Quick Action Cards */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Link to="/system/users" className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <UserPlus size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Manage Users</span>
        </Link>
        <Link to="/system/roles" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Shield size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Roles & Access</span>
        </Link>


        <Link to="/system/content" className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Newspaper size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Public Content</span>
        </Link>
        <Link to="/system/announcements" className="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <Megaphone size={28} className="mb-2 opacity-90" />
          <span className="font-semibold text-sm">Announcements</span>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/system/users" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-blue-100 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
          </div>
        </Link>
        
        <Link to="/system/departments" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-purple-100 p-3 text-purple-600">
            <Building2 size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
          </div>
        </Link>

        <Link to="/system/logs" className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="rounded-md bg-yellow-100 p-3 text-yellow-600">
            <Activity size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Audit Logs</p>
            <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-indigo-600" /> User Role Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="text-emerald-600" /> Top Departments by Size
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" /> Recent User Activity
          </h2>
          
          <div className="h-48 mb-6 border-b border-gray-100 pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93c5fd" name="Activities" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
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



      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
