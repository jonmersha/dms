import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, Plus, Trash2, Pencil } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  groups: number[];
  role_display: string;
  department: number | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  has_irregularity_access: boolean;
  has_dms_access: boolean;
  has_audit_access: boolean;
  has_analytics_access: boolean;
  can_create_lms_course: boolean;
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
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [department, setDepartment] = useState<number | ''>('');
  
  const [hasIrregularityAccess, setHasIrregularityAccess] = useState(false);
  const [hasDmsAccess, setHasDmsAccess] = useState(false);
  const [hasAuditAccess, setHasAuditAccess] = useState(false);
  const [hasAnalyticsAccess, setHasAnalyticsAccess] = useState(false);
  const [canCreateLmsCourse, setCanCreateLmsCourse] = useState(false);
  
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const resetForm = () => {
    setEditingUserId(null);
    setIsModalOpen(false);
    setUsername('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setSelectedRoles([]);
    setDepartment('');
    setHasIrregularityAccess(false);
    setHasDmsAccess(false);
    setHasAuditAccess(false);
    setHasAnalyticsAccess(false);
    setCanCreateLmsCourse(false);
  };

  const createMutation = useMutation({
    mutationFn: (newUser: any) => api.post('/api/admin/users/', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }); 
      setDeleteConfirmId(null);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/admin/users/${editingUserId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      resetForm();
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

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setSelectedRoles(user.groups || []);
    setDepartment(user.department || '');
    setHasIrregularityAccess(user.has_irregularity_access || false);
    setHasDmsAccess(user.has_dms_access || false);
    setHasAuditAccess(user.has_audit_access || false);
    setHasAnalyticsAccess(user.has_analytics_access || false);
    setCanCreateLmsCourse(user.can_create_lms_course || false);
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      groups: selectedRoles,
      department: department === '' ? null : department,
      has_irregularity_access: hasIrregularityAccess,
      has_dms_access: hasDmsAccess,
      has_audit_access: hasAuditAccess,
      has_analytics_access: hasAnalyticsAccess,
      can_create_lms_course: canCreateLmsCourse,
    };
    if (password) {
      payload.password = password;
    }

    if (editingUserId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  const roleGroups = {
    'Audit Subsystem': roles.filter((r: any) => ['Chief', 'Director', 'Team Manager', 'Team Member', 'Auditor', 'Auditee', 'Report Consumer', 'Collaborator'].includes(r.name)),
    'System Administration': roles.filter((r: any) => ['System Administrator', 'Admin'].includes(r.name)),
    'Other': roles.filter((r: any) => !['Chief', 'Director', 'Team Manager', 'Team Member', 'Auditor', 'Auditee', 'Report Consumer', 'Collaborator', 'System Administrator', 'Admin'].includes(r.name))
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="text-blue-600" /> Manage Users
        </h1>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          />
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>
      </div>

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
                        onClick={() => handleEdit(u)}
                        className="mr-3 text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        disabled={u.is_superuser}
                        title="Edit User"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStatusMutation.mutate(u)}
                        className={`mr-3 disabled:opacity-50 ${u.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                        disabled={u.is_superuser || toggleStatusMutation.isPending}
                        title={u.is_active ? "Deactivate Account" : "Activate Account"}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={u.is_superuser}
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingUserId ? 'Edit User' : 'Add User'}>
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
            {!editingUserId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required={!editingUserId}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

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
            


            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {editingUserId 
                  ? (updateMutation.isPending ? 'Updating...' : 'Update User')
                  : (createMutation.isPending ? 'Creating...' : 'Create User')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-sm text-red-600">Failed to save user. Please check the inputs.</p>
          )}
        </form>
      </Modal>
      
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
