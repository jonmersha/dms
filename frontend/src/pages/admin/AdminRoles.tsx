import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';

interface Permission {
  id: number;
  name: string;
  codename: string;
}

interface Role {
  id: number;
  name: string;
  permissions: number[];
  permission_details: Permission[];
}

export function AdminRoles() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', permissions: [] as number[] });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['adminRoles'],
    queryFn: async () => {
      const res = await api.get('/api/admin/roles/');
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    }
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ['adminPermissions'],
    queryFn: async () => {
      const res = await api.get('/api/admin/permissions/');
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/roles/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.put(`/api/admin/roles/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/roles/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      setDeleteConfirmId(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePermissionToggle = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, permissions: role.permissions });
    } else {
      setEditingRole(null);
      setFormData({ name: '', permissions: [] });
    }
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading roles...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Role Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage system roles (Groups) and their associated permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Role
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {roles.map((role) => (
            <li key={role.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600 truncate">{role.name}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {role.permissions.length} Permissions
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {role.permission_details.slice(0, 3).map(p => p.name).join(', ')}
                      {role.permissions.length > 3 && ' ...'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <button onClick={() => openModal(role)} className="text-blue-600 hover:text-blue-900 mr-4">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {deleteConfirmId === role.id ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600 text-xs font-bold">Sure?</span>
                        <button onClick={() => deleteMutation.mutate(role.id)} className="text-red-600 hover:text-red-900">Yes</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-gray-600 hover:text-gray-900">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(role.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-md p-4 max-h-60 overflow-y-auto bg-gray-50">
                  {permissions.map(perm => (
                    <label key={perm.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 truncate" title={perm.name}>{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
