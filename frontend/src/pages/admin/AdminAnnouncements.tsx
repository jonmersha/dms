import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'GENERAL', is_published: true });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin_announcements'],
    queryFn: () => api.get('/api/announcements/').then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editingId ? api.put(`/api/announcements/${editingId}/`, data) : api.post('/api/announcements/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setShowModal(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/announcements/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setDeleteId(null);
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', content: '', category: 'GENERAL', is_published: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {announcements.map((ann: any) => (
              <tr key={ann.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{ann.title}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{ann.category}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${ann.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {ann.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button onClick={() => { setEditingId(ann.id); setFormData(ann); setShowModal(true); }} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => setDeleteId(ann.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{editingId ? 'Edit' : 'New'} Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="INTERNAL_AUDIT">Internal Audit News</option>
                  <option value="RISK">Risk Insights</option>
                  <option value="EMERGING_RISK">Emerging Risks</option>
                  <option value="GENERAL">General News</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} />
                <label className="ml-2 block text-sm text-gray-900">Published</label>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button onClick={() => saveMutation.mutate(formData)} className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm">
                Save
              </button>
              <button onClick={() => setShowModal(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
