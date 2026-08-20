import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, Pencil, ArrowLeft, Plus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Link } from 'react-router-dom';

export function AnalyticsUsersAccess() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  const [hasAnalyticsAccess, setHasAnalyticsAccess] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<any[]>([]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['analyticsUsers'],
    queryFn: () => api.get('/api/admin/users/').then(res => Array.isArray(res.data) ? res.data : res.data.results || []),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/api/admin/roles/').then(res => Array.isArray(res.data) ? res.data : res.data.results || []),
  });

  useEffect(() => {
    if (rolesData) {
      const roles = (rolesData.results || rolesData).filter((r: any) => r.name.startsWith('Analytics_'));
      setRoleDefinitions(roles);
    }
  }, [rolesData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/admin/users/${editingUserId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsUsers'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const users = Array.isArray(usersData) ? usersData : [];
  const activeAnalyticsUsers = users.filter((u: any) => u.has_analytics_access);
  const nonAnalyticsUsers = users.filter((u: any) => !u.has_analytics_access);

  const handleEdit = (user: any) => {
    setEditingUserId(user.id);
    setHasAnalyticsAccess(user.has_analytics_access || false);
    setSelectedRoles(user.roles || []);
    setIsModalOpen(true);
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const resetForm = () => {
    setEditingUserId(null);
    setHasAnalyticsAccess(true);
    setSelectedRoles([]);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateMutation.mutate({
        has_analytics_access: hasAnalyticsAccess,
        roles: selectedRoles
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/system/analytics-admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={16} /> Back to Analytics Admin
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600" /> Analytics Users Access
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Grant Analytics Subsystem access and assign specific roles to users.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditingUserId(null);
              setHasAnalyticsAccess(true);
              setSelectedRoles([]);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Existing User
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analytics Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeAnalyticsUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users currently have Analytics access.
                  </td>
                </tr>
              )}
              {activeAnalyticsUsers.map((u: any) => {
                const userRoles = u.system_roles || [];
                return (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.full_name || u.username}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.has_analytics_access ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Granted</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">No Access</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userRoles.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {userRoles.map((role: string) => (
                            <span key={role} className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {role.replace('Analytics_', '')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 inline-flex items-center gap-1"
                        disabled={u.is_superuser}
                        title="Assign Analytics Roles"
                      >
                        <Pencil size={16} /> Assign Roles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingUserId ? "Edit Analytics Roles" : "Add Existing User to Analytics"}>
        <form onSubmit={handleSubmit} className="space-y-6">

          {!editingUserId ? (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Select User</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                onChange={(e) => setEditingUserId(Number(e.target.value))}
                value={editingUserId || ''}
              >
                <option value="" disabled>-- Select a user --</option>
                {nonAnalyticsUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.email})</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Selected User</label>
              <div className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300 border p-2 text-sm text-gray-700">
                {users.find((u: any) => u.id === editingUserId)?.full_name || users.find((u: any) => u.id === editingUserId)?.username} ({users.find((u: any) => u.id === editingUserId)?.email})
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="hasAnalyticsAccess"
                  type="checkbox"
                  checked={hasAnalyticsAccess}
                  onChange={(e) => setHasAnalyticsAccess(e.target.checked)}
                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="hasAnalyticsAccess" className="font-medium text-blue-900">
                  Allow Subsystem Access
                </label>
                <p className="text-blue-700 text-xs mt-1">
                  Grants the user baseline access to enter the Analytics Management System.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Roles</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {roleDefinitions.length === 0 && (
                <p className="text-sm text-gray-500 italic col-span-full">No roles found in the system.</p>
              )}
              {roleDefinitions.map((r: any) => {
                const isSelected = selectedRoles.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => handleRoleToggle(r.id)}
                    className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`block text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {r.name.replace('Analytics_', '')}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="text-blue-600">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Permissions'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
          {updateMutation.isError && (
            <p className="text-sm text-red-600 text-center mt-2">Failed to save permissions. Please try again.</p>
          )}
        </form>
      </Modal>
    </div>
  );
}
