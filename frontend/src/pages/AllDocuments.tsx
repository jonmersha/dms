import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { DocumentList } from '../components/DocumentList';
import { FileText, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AllDocuments() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const { data: documentsData = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/api/documents/').then(res => Array.isArray(res.data) ? res.data : (res.data as any).results || []),
  });

  const documents = React.useMemo(() => {
    let docs = Array.isArray(documentsData) ? documentsData : (documentsData as any).results || [];
    if (statusFilter) {
      docs = docs.filter((d: any) => d.status === statusFilter);
    }
    return docs;
  }, [documentsData, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="text-blue-600" /> Documents Directory
        </h1>
        {['TEAM_MANAGER', 'TEAM_MEMBER', 'DIRECTOR', 'CHIEF', 'ADMIN'].includes(user?.role || '') && (
          <Link
            to="/documents/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus size={16} /> Upload Document
          </Link>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : (
          <DocumentList documents={documents} />
        )}
      </div>
    </div>
  );
}
