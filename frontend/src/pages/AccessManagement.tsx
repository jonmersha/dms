import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Shield, Clock } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';

export function AccessManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success' | 'info'}>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const { data: accesses = [], isLoading } = useQuery({
    queryKey: ['accessRequests'],
    queryFn: async () => {
      const response = await api.get('/api/access/');
      return response.data;
    }
  });

  const reviewAccessMutation = useMutation({
    mutationFn: ({ documentId, accessId, action }: { documentId: number, accessId: number, action: 'APPROVE' | 'REJECT' | 'REVOKE' }) => {
      return api.post(`/api/documents/${documentId}/review_access/`, { access_id: accessId, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
      setAlertConfig({ isOpen: true, message: 'Access request updated successfully.', type: 'success' });
    },
    onError: (err: any) => {
      setAlertConfig({ isOpen: true, message: err.response?.data?.error || 'Failed to process request', type: 'error' });
    }
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading Access Requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-purple-600" size={24} /> 
            Access Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all document access permissions and requests.
          </p>
        </div>

        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          {accesses.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Access Requests</h3>
              <p className="mt-1 text-gray-500">There are currently no access permissions or pending requests to show.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Expiry</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accesses.map((access: any) => (
                  <tr key={access.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{access.document_title || `Doc #${access.document}`}</div>
                      <div className="text-xs text-gray-500">Granted by: {access.granted_by_details?.full_name}</div>
                      {access.authorizer_details && (
                        <div className="text-xs text-purple-600 mt-1">
                          Awaiting authorization from: {access.authorizer_details.full_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {access.user_details?.full_name || access.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mb-1 ${
                        access.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        access.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {access.status}
                      </span>
                      <div className="text-xs text-gray-500">
                        Expires: {new Date(access.expires_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {access.status === 'PENDING' && (user?.system_roles?.includes('DMS_ADMIN')) && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => reviewAccessMutation.mutate({ documentId: access.document, accessId: access.id, action: 'APPROVE' })} 
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => reviewAccessMutation.mutate({ documentId: access.document, accessId: access.id, action: 'REJECT' })} 
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                      {access.status === 'ACTIVE' && (user?.system_roles?.includes('DMS_ADMIN') || user?.id === access.granted_by_details?.id) && (
                        <button 
                          onClick={() => reviewAccessMutation.mutate({ documentId: access.document, accessId: access.id, action: 'REVOKE' })} 
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
