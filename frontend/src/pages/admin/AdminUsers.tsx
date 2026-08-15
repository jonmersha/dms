import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, Plus, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  groups: number[];
  role_display: string;
  department: number | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
}

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('TEAM_MEMBER');
  const [department, setDepartment] = useState<number | ''>('');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: roles = [] } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: async () => {
      const res = await api.get('/api/admin/roles/');
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    }
  });


  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users', searchQuery],
    queryFn: () => api.get(`/api/admin/users/${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`).then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['admin-departments'],
    queryFn: () => api.get('/api/admin/departments/').then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });

  const createMutation = useMutation({
    mutationFn: (newUser: any) => api.post('/api/admin/users/', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDeleteConfirmId(null);
      setUsername('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('TEAM_MEMBER');
      setDepartment('');
    },
  });

  
  const toggleStatusMutation = useMutation({
    mutationFn: (user: User) => api.patch(`/api/admin/users/${user.id}/`, { is_active: !user.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/users/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDeleteConfirmId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role,
      department: department === '' ? null : department,
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="text-blue-600" /> Manage Users
        </h1>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg bg-white shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.full_name || u.username}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.role_display}
                      {(u.is_staff || u.is_superuser) && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Admin</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {departments.find(d => d.id === u.department)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => toggleStatusMutation.mutate(u)}
                        className={`mr-3 disabled:opacity-50 ${u.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                        disabled={u.is_superuser || toggleStatusMutation.isPending}
                        title={u.is_active ? "Deactivate Account" : "Activate Account"}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={u.is_superuser}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 h-fit">
          <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus size={20} className="text-blue-600"/> Add User
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ADMIN">System Administrator</option>
                <option value="CHIEF">Chief Internal Audit</option>
                <option value="DIRECTOR">Director / Department Head</option>
                <option value="TEAM_MANAGER">Team Manager</option>
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="AUDITOR">Auditor</option>
                <option value="AUDITEE">Auditee</option>
                <option value="VISITOR">Visitor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={department}
                onChange={(e) => setDepartment(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">None</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
            {createMutation.isError && (
              <p className="text-sm text-red-600">Failed to create user.</p>
            )}
          </form>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            deleteMutation.mutate(deleteConfirmId);
          }
        }}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
