import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Building, Plus, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface Department {
  id: number;
  name: string;
  level: string;
  parent: number | null;
}

export function AdminDepartments() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('TEAM');
  const [parent, setParent] = useState<number | ''>('');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['admin-departments'],
    queryFn: () => api.get('/api/admin/departments/').then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });

  const createMutation = useMutation({
    mutationFn: (newDept: any) => api.post('/api/admin/departments/', newDept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] }); setDeleteConfirmId(null);
      setName('');
      setLevel('TEAM');
      setParent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/departments/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] }); setDeleteConfirmId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      level,
      parent: parent === '' ? null : parent,
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building className="text-blue-600" /> Manage Departments
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg bg-white shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent ID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.parent || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setDeleteConfirmId(dept.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No departments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 h-fit">
          <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus size={20} className="text-blue-600"/> Add Department
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="CHIEF">Chief Internal Audit</option>
                <option value="DIRECTORATE">Directorate</option>
                <option value="TEAM">Team</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Department</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={parent}
                onChange={(e) => setParent(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">None (Top Level)</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.level})</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Department'}
            </button>
            {createMutation.isError && (
              <p className="text-sm text-red-600">Failed to create department.</p>
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
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
