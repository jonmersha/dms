import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { FileText, Clock, CheckCircle, AlertTriangle, Activity, Building2, Key, Trash2, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ChiefDashboard() {
  const [activeTab, setActiveTab] = useState<'departments' | 'approvals' | 'deletions' | 'access'>('departments');

  const { data: stats } = useQuery({
    queryKey: ['documentStats'],
    queryFn: () => api.get('/api/documents/stats/').then(res => res.data),
  });

  const { data: chiefStats } = useQuery({
    queryKey: ['chiefStats'],
    queryFn: () => api.get('/api/documents/chief_stats/').then(res => res.data),
  });

  const { data: actionItems } = useQuery({
    queryKey: ['chiefActionItems'],
    queryFn: () => api.get('/api/documents/chief_action_items/').then(res => res.data),
  });

  const { data: plans } = useQuery({
    queryKey: ['performance-plans'],
    queryFn: () => api.get('/api/admin/performance-plans/').then(res => res.data),
  });

  return (
    <div>
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="rounded-md bg-blue-100 p-3 text-blue-600">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Organization Docs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="rounded-md bg-yellow-100 p-3 text-yellow-600">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="rounded-md bg-green-100 p-3 text-green-600">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="rounded-md bg-red-100 p-3 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Deletion Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.deletion_requested}</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="rounded-md bg-purple-100 p-3 text-purple-600">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Engagements</p>
              <p className="text-2xl font-semibold text-gray-900">{plans?.filter((p: any) => p.plan_type === 'ENGAGEMENT').length || 0}</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="rounded-md bg-green-100 p-3 text-green-600">
              <Activity size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ongoing Activities</p>
              <p className="text-2xl font-semibold text-gray-900">{plans?.filter((p: any) => p.plan_type === 'ENGAGEMENT').reduce((acc: number, p: any) => acc + (p.engagement_activities?.length || 0), 0) || 0}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200 col-span-1 lg:col-span-6">
            <div className="flex items-center">
              <div className="rounded-md bg-purple-100 p-3 text-purple-600">
                <FileText size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Organization Performance & Plans</p>
                <p className="text-sm text-gray-900">Manage strategic plans and view performance execution across all departments.</p>
              </div>
            </div>
            <Link to="/dashboard/performance-plans" className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors">
              Manage Plans
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200 col-span-1 lg:col-span-5">
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
        </div>
      )}

      {chiefStats && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 h-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Documents by Department</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chiefStats.by_department} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 h-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Documents by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chiefStats.by_category}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chiefStats.by_category.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action Items Workspace */}
      {actionItems && (
        <div className="rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('departments')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex justify-center items-center gap-2 ${
                  activeTab === 'departments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 size={18} /> Department Overview
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex justify-center items-center gap-2 ${
                  activeTab === 'approvals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock size={18} /> Pending Approvals 
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">{actionItems.pending_documents.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('deletions')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex justify-center items-center gap-2 ${
                  activeTab === 'deletions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trash2 size={18} /> Deletion Requests
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">{actionItems.deletion_requests.length}</span>
              </button>

            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'departments' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Docs</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {actionItems.departments_overview.map((dept: any) => (
                      <tr key={dept.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.level}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-semibold">{dept.total_docs}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 text-right font-semibold">{dept.pending_docs}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-semibold">{dept.approved_docs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'approvals' && (
              <div className="overflow-x-auto">
                <ul className="divide-y divide-gray-200">
                  {actionItems.pending_documents.map((doc: any) => (
                    <li key={doc.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">Department: {doc.department_name} | Uploaded by: {doc.uploaded_by_details?.username}</p>
                      </div>
                      <Link to={`/documents/${doc.id}`} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Review Document
                      </Link>
                    </li>
                  ))}
                  {actionItems.pending_documents.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No pending approvals.</p>
                  )}
                </ul>
              </div>
            )}
            
            {activeTab === 'deletions' && (
              <div className="overflow-x-auto">
                <ul className="divide-y divide-gray-200">
                  {actionItems.deletion_requests.map((doc: any) => (
                    <li key={doc.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-red-500 font-medium">Reason: {doc.deletion_reason}</p>
                      </div>
                      <Link to={`/documents/${doc.id}`} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                        Review Deletion
                      </Link>
                    </li>
                  ))}
                  {actionItems.deletion_requests.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No deletion requests.</p>
                  )}
                </ul>
              </div>
            )}
            

          </div>
        </div>
      )}

      {chiefStats && (
        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" /> Recent Organization Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {chiefStats.recent_activity.map((activity: any, eventIdx: number) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {eventIdx !== chiefStats.recent_activity.length - 1 ? (
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
                            <span className="font-medium text-gray-900">{activity.user_details?.username || 'System'}</span>{' '}
                            {activity.action.replace(/_/g, ' ')}{' '}
                            <Link to={`/documents/${activity.document}`} className="font-medium text-blue-600 hover:text-blue-500">
                              {activity.document_title || `Document #${activity.document}`}
                            </Link>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={activity.timestamp}>{new Date(activity.timestamp).toLocaleDateString()}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {chiefStats.recent_activity.length === 0 && (
                <p className="text-sm text-gray-500 pb-8">No recent activity.</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
