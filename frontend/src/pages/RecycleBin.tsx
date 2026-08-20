import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2, FileText, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export function RecycleBin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [restoreConfirmId, setRestoreConfirmId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['recycleBin'],
    queryFn: async () => {
      const response = await api.get('/api/documents/recycle_bin/');
      return response.data;
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => api.post(`/api/documents/${id}/restore/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycleBin'] });
      setRestoreConfirmId(null);
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/documents/${id}/permanent_delete/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycleBin'] });
      setDeleteConfirmId(null);
    }
  });

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading Recycle Bin...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="text-red-500" size={24} /> 
              Recycle Bin
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Documents moved here can be restored or permanently deleted.
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-gray-200">
            <Trash2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Recycle Bin is empty</h3>
            <p className="mt-1 text-gray-500">Any documents you delete will appear here.</p>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.audit_period_display} • {doc.quarter}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doc.display_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploaded_by_details?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setRestoreConfirmId(doc.id)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Restore"
                        >
                          <RefreshCw size={16} /> Restore
                        </button>
                        
                        {(user?.system_roles?.includes('DMS_ADMIN') || doc.uploaded_by_details?.id === user?.id) && (
                          <button
                            onClick={() => setDeleteConfirmId(doc.id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-3"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} /> Delete Forever
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={restoreConfirmId !== null}
        onClose={() => setRestoreConfirmId(null)}
        onConfirm={() => restoreConfirmId !== null && restoreMutation.mutate(restoreConfirmId)}
        title="Restore Document"
        message="Are you sure you want to restore this document?"
        confirmText="Restore"
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId !== null && permanentDeleteMutation.mutate(deleteConfirmId)}
        title="Permanently Delete"
        message="WARNING: This will permanently delete the file and all associated data. This action CANNOT be undone. Are you sure?"
        confirmText="Delete Forever"
        isDestructive={true}
      />
    </div>
  );
}
