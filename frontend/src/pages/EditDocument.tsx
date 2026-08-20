import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, X, Upload } from 'lucide-react';
import api from '../api/axios';

export function EditDocument() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: 'AUDIT_REPORTS',
    audit_type: '',
    restricted: true,
    download_restricted: true,
    quarter: 'Q1',
    audit_period: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: auditPeriods = [] } = useQuery({
    queryKey: ['auditPeriods'],
    queryFn: () => api.get('/api/audits/periods/').then(res => res.data),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/api/admin/departments/').then(res => res.data),
  });

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => api.get(`/api/documents/${id}/`).then(res => res.data),
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description || '',
        department: document.department || '',
        category: document.category,
        audit_type: document.audit_type || '',
        restricted: document.restricted,
        download_restricted: document.download_restricted,
        quarter: document.quarter || 'Q1',
        audit_period: document.audit_period || '',
      });
    }
  }, [document]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.patch(`/api/documents/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      navigate(`/documents/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.department) data.append('department', formData.department);
    data.append('category', formData.category);
    if (formData.audit_type && formData.category === 'AUDIT_REPORTS') {
      data.append('audit_type', formData.audit_type);
    }
    data.append('restricted', formData.restricted.toString());
    data.append('download_restricted', formData.download_restricted.toString());
    data.append('quarter', formData.quarter);
    if (formData.audit_period) data.append('audit_period', formData.audit_period);
    
    if (file) {
      data.append('pdf_file', file);
    }

    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!document) return <div className="p-12 text-center text-red-500">Document not found</div>;
  if (!document.can_edit) return <div className="p-12 text-center text-red-500">You do not have permission to edit this document.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Document Metadata</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Document Title</label>
              <input 
                type="text" required 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                rows={3}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Optional document description..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})}
              >
                <option value="">-- Keep Current Department --</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Audit Period</label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.audit_period || (auditPeriods.length > 0 ? auditPeriods[0].id : '')}
                onChange={(e) => setFormData({...formData, audit_period: e.target.value})}
              >
                {auditPeriods.map((period: any) => (
                  <option key={period.id} value={period.id}>
                    {period.fiscal_year} ({period.is_active ? 'Active' : 'Inactive'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quarter</label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.quarter}
                onChange={(e) => setFormData({...formData, quarter: e.target.value})}
              >
                <option value="Q1">Quarter 1 (Jul-Sep)</option>
                <option value="Q2">Quarter 2 (Oct-Dec)</option>
                <option value="Q3">Quarter 3 (Jan-Mar)</option>
                <option value="Q4">Quarter 4 (Apr-Jun)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="AUDIT_REPORTS">Audit Reports</option>
                <option value="GUIDELINES">Guidelines</option>
                <option value="CHARTERS">Charters</option>
                <option value="FRAMEWORKS">Frameworks</option>
                <option value="POLICIES">Policies</option>
                <option value="PROCEDURES">Procedures</option>
                <option value="MANUALS">Manuals</option>
                <option value="TEMPLATES">Templates</option>
                <option value="OTHER">Other Documents</option>
              </select>
            </div>

            {formData.category === 'AUDIT_REPORTS' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Audit Type</label>
                <select 
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                  value={formData.audit_type}
                  onChange={(e) => setFormData({...formData, audit_type: e.target.value})}
                >
                  <option value="">-- Select Audit Type --</option>
                  <option value="BRANCH">Branch Audit</option>
                  <option value="IT">IT Audit</option>
                  <option value="INVESTIGATION">Investigation Audit</option>
                  <option value="HEAD_OFFICE">Head Office Organ Audit</option>
                  <option value="IFB">IFB Audit</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">View Visibility</label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.restricted ? 'RESTRICTED' : 'PUBLIC'}
                onChange={e => setFormData({...formData, restricted: e.target.value === 'RESTRICTED'})}
              >
                <option value="RESTRICTED">Restricted (Internal/Specific Roles)</option>
                <option value="PUBLIC">Public (Visible to All Staff)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Download Permissions</label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
                value={formData.download_restricted ? 'RESTRICTED' : 'PUBLIC'}
                onChange={(e) => setFormData({...formData, download_restricted: e.target.value === 'RESTRICTED'})}
              >
                <option value="RESTRICTED">Restricted Download</option>
                <option value="PUBLIC">Public Download</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Replace Document (PDF)</label>
            <p className="text-xs text-gray-500 mb-2">Leave blank to keep the existing document file.</p>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#00AEEF] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative rounded-md font-medium text-[#00AEEF] hover:text-[#008fcc] focus-within:outline-none">
                    <span>{file ? file.name : "Upload a new PDF"}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">PDF up to 50MB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
            <button 
              type="button" 
              onClick={() => navigate(`/documents/${id}`)}
              className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 transition-colors"
            >
              <X size={18} /> Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 rounded bg-[#00AEEF] px-4 py-2 font-medium text-white hover:bg-[#008fcc] transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
