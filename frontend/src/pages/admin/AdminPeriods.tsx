import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface Period {
  id: number;
  fiscal_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function AdminPeriods() {
  const queryClient = useQueryClient();
  const [fiscalYear, setFiscalYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: periods = [], isLoading } = useQuery<Period[]>({
    queryKey: ['admin-periods'],
    queryFn: () => api.get('/api/admin/periods/').then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });

  const createMutation = useMutation({
    mutationFn: (newPeriod: any) => api.post('/api/admin/periods/', newPeriod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] });
      setFiscalYear('');
      setStartDate('');
      setEndDate('');
      setIsActive(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/periods/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] });
      setDeleteConfirmId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      fiscal_year: fiscalYear,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="text-blue-600" /> Manage Audit Periods
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg bg-white shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.fiscal_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {period.is_active ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span> : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setDeleteConfirmId(period.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {periods.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No audit periods found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200 h-fit">
          <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus size={20} className="text-blue-600"/> Add Period
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fiscal Year (YYYY-YY)</label>
              <input
                type="text"
                required
                placeholder="2025-26"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active Period
              </label>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Period'}
            </button>
            {createMutation.isError && (
              <p className="text-sm text-red-600">Failed to create period. Check format (YYYY-YY).</p>
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
        title="Delete Period"
        message="Are you sure you want to delete this period? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
