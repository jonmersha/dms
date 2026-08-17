import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Loader2, Save, X, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function PerformancePlansManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['performance-plans'],
    queryFn: () => api.get('/api/admin/performance-plans/').then(res => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return api.put(`/api/admin/performance-plans/${data.id}/`, data);
      }
      return api.post('/api/admin/performance-plans/', { ...data, department: (user as any)?.department?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-plans'] });
      setIsFormOpen(false);
      setEditingPlan(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/performance-plans/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-plans'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      id: editingPlan?.id,
      year: parseInt(formData.get('year') as string, 10),
      long_term_plan: formData.get('long_term_plan'),
      short_term_plan: formData.get('short_term_plan'),
      performance_execution: formData.get('performance_execution'),
    };
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Department Plans</h1>
          <p className="text-gray-500 mt-1">Register long term and short term plans, and performance executions.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => { setEditingPlan(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add New Plan
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                defaultValue={editingPlan?.year || new Date().getFullYear()}
                required
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long Term Plan</label>
              <textarea
                name="long_term_plan"
                defaultValue={editingPlan?.long_term_plan}
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Strategic vision, multi-year goals..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Term Plan</label>
              <textarea
                name="short_term_plan"
                defaultValue={editingPlan?.short_term_plan}
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Yearly objectives, immediate execution steps..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performance Execution</label>
              <textarea
                name="performance_execution"
                defaultValue={editingPlan?.performance_execution}
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Achievements, metrics, execution status..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">Year</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Short Term Plan Preview</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No plans registered yet.
                  </td>
                </tr>
              ) : (
                plans.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" /> {plan.year}
                    </td>
                    <td className="p-4">{plan.department_name}</td>
                    <td className="p-4 max-w-xs truncate">{plan.short_term_plan || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setEditingPlan(plan); setIsFormOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Plan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this plan?')) {
                            deleteMutation.mutate(plan.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded ml-1"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
