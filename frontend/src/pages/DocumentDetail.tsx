import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Download, FileText, ArrowLeft, Check, X, Clock, Trash, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { Document as PdfDocument, Page as PdfPage, pdfjs } from 'react-pdf';
import { ConfirmModal } from '../components/ui/ConfirmModal';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const [approvalComment, setApprovalComment] = useState('');
  const [deletionReason, setDeletionReason] = useState('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [numPages, setNumPages] = useState<number>();
  const [zoom, setZoom] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!window.document.fullscreenElement);
    };
    window.document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!window.document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      window.document.exitFullscreen();
    }
  };
  const showPreview = user?.role !== 'AUDITEE' && user?.role !== 'VISITOR';
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef.current]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  
  const { data: document, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get(`/api/documents/${id}/`);
      return response.data;
    }
  });

  React.useEffect(() => {
    if (document) {
      let url = '';
      const fetchPreview = async () => {
        try {
          const response = await api.get(`/api/documents/${id}/preview/`, { responseType: 'blob' });
          url = URL.createObjectURL(response.data);
          setPreviewUrl(url);
        } catch (e) {
          console.error("Preview failed", e);
        }
      };
      fetchPreview();
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [document?.id]);

  const approveMutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'REJECT' | 'RETURN') => {
      return api.post(`/api/documents/${id}/approve/`, { action, comments: approvalComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      setApprovalComment('');
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/api/documents/${id}/submit/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['document', id] })
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: () => api.delete(`/api/documents/${id}/`),
    onSuccess: () => {
      navigate('/');
    }
  });

  const requestDeletionMutation = useMutation({
    mutationFn: () => api.post(`/api/documents/${id}/request_deletion/`, { reason: deletionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      setDeletionReason('');
    }
  });

  const reviewDeletionMutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'REJECT') => api.post(`/api/documents/${id}/review_deletion/`, { action }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      if (action === 'APPROVE') navigate('/');
    }
  });

  if (isLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!document) return <div className="p-12 text-center text-red-500">Document not found or access denied.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:px-8 lg:pt-2 lg:pb-8">
      <div className="mx-auto w-full">
        <button onClick={() => navigate(-1)} className="mb-2 lg:mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1 space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                  <p className="mt-2 text-gray-600">{document.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    document.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    document.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {document.status.replace('_', ' ')}
                  </span>
                  
                  {(document.can_edit || document.can_manage) && (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      <Trash size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <span className="block text-gray-500">Uploaded By</span>
                  <span className="font-medium">{document.uploaded_by_details?.full_name}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Department</span>
                  <span className="font-medium">{document.department_name}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Category</span>
                  <span className="font-medium">{document.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Approval Workflow Actions */}
            {document.status === 'PENDING_APPROVAL' && document.can_manage && (
              <div className="rounded-lg bg-white p-6 shadow-sm border border-yellow-200">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Pending Approval</h3>
                <textarea 
                  className="mb-4 w-full rounded border border-gray-300 p-2" 
                  placeholder="Optional comments for approval/rejection..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={() => approveMutation.mutate('APPROVE')} className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    <Check size={18} /> Approve
                  </button>
                  <button onClick={() => approveMutation.mutate('RETURN')} className="flex items-center gap-2 rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
                    <Clock size={18} /> Return for Correction
                  </button>
                  <button onClick={() => approveMutation.mutate('REJECT')} className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>
            )}

            {/* Submission Actions */}
            {(document.status === 'DRAFT' || document.status === 'RETURNED') && document.can_edit && (
              <div className="rounded-lg bg-white p-6 shadow-sm border border-blue-200">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Manage Document</h3>
                <div className="flex gap-4">
                  <button onClick={() => navigate(`/documents/${id}/edit`)} className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300">
                    Edit Metadata
                  </button>
                  <button onClick={() => submitMutation.mutate()} className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                    Submit for Approval
                  </button>
                </div>
                
                <div className="mt-6 border-t pt-4">
                  <h4 className="mb-2 text-sm font-semibold text-red-600">Request Deletion</h4>
                  <textarea 
                    className="mb-2 w-full rounded border border-red-300 p-2 text-sm" 
                    placeholder="Reason for deletion..."
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                  />
                  <button 
                    onClick={() => requestDeletionMutation.mutate()} 
                    disabled={!deletionReason.trim()}
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Request Deletion
                  </button>
                </div>
              </div>
            )}

            {/* Deletion Review Actions */}
            {document.status === 'DELETION_REQUESTED' && document.can_manage && (
              <div className="rounded-lg bg-white p-6 shadow-sm border border-red-200">
                <h3 className="mb-4 text-lg font-bold text-red-900">Deletion Requested</h3>
                <p className="mb-4 text-sm text-gray-700"><strong>Reason:</strong> {document.deletion_reason}</p>
                <div className="flex gap-4">
                  <button onClick={() => reviewDeletionMutation.mutate('APPROVE')} className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                    <Check size={18} /> Approve Deletion
                  </button>
                  <button onClick={() => reviewDeletionMutation.mutate('REJECT')} className="flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                    <X size={18} /> Reject Deletion
                  </button>
                </div>
              </div>
            )}

          {user && user.role !== 'AUDITEE' && user.role !== 'VISITOR' && (
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Audit Trail</h3>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {document.audit_logs?.map((log: any) => (
                  <div key={log.id} className="border-l-2 border-blue-500 pl-4">
                    <div className="text-sm font-semibold text-gray-900">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="text-sm text-gray-700">{log.user_details?.full_name || 'System'}</div>
                    {log.comments && <div className="mt-1 text-sm italic text-gray-600">"{log.comments}"</div>}
                  </div>
                ))}
                {!document.audit_logs?.length && (
                  <div className="text-sm text-gray-500">No audit logs available.</div>
                )}
              </div>
            </div>
          )}
          
          </div>
          
          
          <div className="col-span-1 lg:col-span-3 space-y-6">
              {/* Document Viewer Preview */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 h-[800px] xl:h-[calc(100vh-5rem)] flex flex-col">
                <h3 className="mb-4 text-xl font-bold text-gray-900">{document.title}</h3>
                <div ref={containerRef} className="flex-1 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {previewUrl ? (
                    document.can_download ? (
                      <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                    ) : (
                      <div 
                        className="w-full h-full flex flex-col items-center justify-start bg-gray-100 overflow-y-auto overflow-x-hidden relative select-none" 
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <PdfDocument 
                          file={previewUrl} 
                          onLoadSuccess={onDocumentLoadSuccess}
                          className="my-4 shadow-lg mx-auto flex flex-col items-center justify-center"
                          loading={<p className="text-gray-500 animate-pulse mt-10">Loading secure preview...</p>}
                        >
                          {Array.from(new Array(numPages), (el, index) => (
                            <PdfPage 
                              key={`page_${index + 1}`}
                              pageNumber={index + 1} 
                              renderTextLayer={false} 
                              renderAnnotationLayer={false} 
                              width={(containerWidth ? containerWidth - 40 : 800) * zoom}
                              className="flex justify-center w-full mb-4"
                            />
                          ))}
                        </PdfDocument>
                        
                        {numPages && (
                          <div className="sticky bottom-4 flex items-center gap-4 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-xl">
                            <button 
                              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                              className="p-1 hover:bg-gray-700 rounded"
                              title="Zoom Out"
                            >
                              <ZoomOut size={20} />
                            </button>
                            <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                            <button 
                              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                              className="p-1 hover:bg-gray-700 rounded"
                              title="Zoom In"
                            >
                              <ZoomIn size={20} />
                            </button>
                            
                            <div className="w-px h-4 bg-gray-600 mx-1"></div>
                            
                            <button 
                              onClick={toggleFullScreen}
                              className="p-1 hover:bg-gray-700 rounded"
                              title="Toggle Full Screen"
                            >
                              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 animate-pulse">Loading preview...</p>
                  )}
                </div>
              </div>
            </div>

        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteDocumentMutation.mutate()}
        title="Move to Recycle Bin"
        message="Are you sure you want to move this document to the Recycle Bin? It can be restored later."
        confirmText="Move to Recycle Bin"
      />
    </div>
  );
}
