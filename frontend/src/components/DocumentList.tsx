import React from 'react';
import { FileText, Download, Eye, Shield, LayoutGrid, List } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertModal } from './ui/AlertModal';
import { DocumentThumbnail } from './DocumentThumbnail';

interface DocumentListProps {
  documents: any[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const { user } = useAuth();
  const showExtraCols = user?.role !== 'AUDITEE' && user?.role !== 'VISITOR';

  const [alertConfig, setAlertConfig] = React.useState<{isOpen: boolean, message: string, type: 'error' | 'success'}>({
    isOpen: false,
    message: '',
    type: 'error'
  });
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>(!showExtraCols ? 'grid' : 'table');
  
  const handleDownload = async (docId: number, filename: string) => {
    try {
      const response = await api.get(`/api/documents/${docId}/download/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        message: "Download failed or unauthorized.",
        type: 'error'
      });
    }
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm border border-dashed border-gray-300">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
        <p className="mt-1">Try adjusting your filters or upload a new document.</p>
      </div>
    );
  }



  return (
    <div className="w-full flex flex-col gap-4">
      {documents.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex shadow-sm">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#00AEEF]/10 text-[#00AEEF]' : 'text-gray-400 hover:text-gray-600'}`}
              title="Cards View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('table')} 
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-[#00AEEF]/10 text-[#00AEEF]' : 'text-gray-400 hover:text-gray-600'}`}
              title="Tabular View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      )}
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {documents.map((doc) => (
                    <div key={doc.id} className="group flex flex-col gap-3">
                      <div className="relative overflow-hidden rounded-xl shadow-sm border-2 border-[#00AEEF] hover:shadow-[0_4px_20px_rgba(0,174,239,0.25)] transition-all hover:-translate-y-1 bg-white aspect-[2/3]">
                        <div className="absolute inset-0 z-0">
                          <DocumentThumbnail documentId={doc.id} />
                        </div>
                        
                        <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-[#00AEEF]/60 via-[#00AEEF]/30 to-transparent p-3 pt-12 flex items-center justify-end gap-2 transition-opacity">
                          <Link 
                            to={`/documents/${doc.id}`} 
                            className="flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-[#00AEEF] rounded-md transition-colors shadow-sm" 
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          {doc.can_request_access && (
                            <Link 
                              to={`/documents/${doc.id}/access`} 
                              className="flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-[#00AEEF] rounded-md transition-colors shadow-sm" 
                              title="Manage Access"
                            >
                              <Shield size={18} />
                            </Link>
                          )}
                          {doc.can_download && (
                            <button 
                              onClick={() => handleDownload(doc.id, `${doc.title}.pdf`)}
                              className="flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-[#00AEEF] rounded-md transition-colors shadow-sm" 
                              title="Download PDF"
                            >
                              <Download size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col px-1">
                        <h4 className="text-base font-extrabold text-gray-900 mb-1 line-clamp-2 leading-tight" title={doc.title}>
                          {doc.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {doc.description}
                        </p>
                        {doc.category === 'AUDIT_REPORTS' && (
                          <div className="mb-1 space-y-1">
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-700 shadow-sm">
                                {doc.audit_period_name} - {doc.quarter_display || doc.quarter}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 font-semibold text-purple-700 shadow-sm">
                                {doc.audit_type_display || (doc.audit_type ? doc.audit_type.replace('_', ' ') : 'General')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center">
                          <FileText className="mr-3 h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          doc.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                          doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                        {doc.department_name}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                        {doc.uploaded_by_details?.full_name}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:text-blue-900" title="View Details">
                            <Eye size={18} />
                          </Link>
                          {doc.can_request_access && (
                            <Link to={`/documents/${doc.id}/access`} className="text-purple-600 hover:text-purple-900" title="Manage Access">
                              <Shield size={18} />
                            </Link>
                          )}
                          {doc.can_download && (
                            <button 
                              onClick={() => handleDownload(doc.id, `${doc.title}.pdf`)}
                              className="text-gray-500 hover:text-gray-900" 
                              title="Download PDF"
                            >
                              <Download size={18} />
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
      
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title="Download Error"
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
