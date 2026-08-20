import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Check, X } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';

export function DocumentAccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tempAccess, setTempAccess] = useState({ userId: '', expiryDate: '', canDownload: false, authorizerId: '' });
  
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success' | 'info'}>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  // Fetch document details for metadata and existing accesses
  const { data: document, isLoading: isLoadingDoc } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get(`/api/documents/${id}/`);
      return response.data;
    }
  });

  // Fetch users directory
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['usersDirectory'],
    queryFn: async () => {
      const response = await api.get(`/api/directory/users/`);
      return response.data;
    }
  });

  const grantAccessMutation = useMutation({
    mutationFn: () => api.post(`/api/documents/${id}/grant_access/`, { 
      user: tempAccess.userId, 
      expires_at: tempAccess.expiryDate, 
      can_download: tempAccess.canDownload,
      authorizer: tempAccess.authorizerId || undefined
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      setTempAccess({ userId: '', expiryDate: '', canDownload: false, authorizerId: '' });
      setTempAccess({ userId: '', expiryDate: '', canDownload: false, authorizerId: '' });
      setAlertConfig({ isOpen: true, message: 'Temporary access granted successfully', type: 'success' });
    },
    onError: (err: any) => {
      setAlertConfig({ isOpen: true, message: err.response?.data?.error || 'Failed to process request', type: 'error' });
    }
  });

  if (isLoadingDoc || isLoadingUsers) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Loading Access Permissions...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-red-600">Document not found or access denied.</div>
      </div>
    );
  }
  
  if (!document.can_request_access) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-red-600">You do not have permission to manage access for this document.</div>
      </div>
    );
  }

  let availableUsers = usersData?.results || usersData || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} /> Back to Document
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Access Permissions</h1>
          <p className="mt-1 text-sm text-gray-500">Document: {document.title} (v{document.current_version})</p>
        </div>

        <div className="grid gap-8">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-purple-200">
            <h3 className="mb-4 text-lg font-bold text-purple-900">
              Grant Temporary Access
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select User</label>
                <select 
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  value={tempAccess.userId}
                  onChange={e => setTempAccess({...tempAccess, userId: e.target.value})}
                >
                  <option value="">-- Select a User --</option>
                  {availableUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username} ({u.role_display || u.role})
                    </option>
                  ))}
                </select>
              </div>


              
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <input 
                  type="datetime-local" 
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2" 
                  value={tempAccess.expiryDate} 
                  onChange={e => setTempAccess({...tempAccess, expiryDate: e.target.value})}
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="canDownload"
                  className="mr-2 rounded border-gray-300"
                  checked={tempAccess.canDownload} 
                  onChange={e => setTempAccess({...tempAccess, canDownload: e.target.checked})}
                />
                <label htmlFor="canDownload" className="text-sm font-medium text-gray-700">Allow Download</label>
              </div>
              
              <button 
                onClick={() => grantAccessMutation.mutate()} 
                disabled={!tempAccess.userId || !tempAccess.expiryDate || grantAccessMutation.isPending}
                className="mt-2 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.type === 'error' ? 'Error' : 'Success'}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
