import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ArrowLeft, Upload } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';

export function UploadDocument() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'AUDIT_REPORTS',
    audit_type: '',
    restricted: true,
    download_restricted: true,
    quarter: 'Q1',
    audit_period: '',
  });
  const [file, setFile] = useState<File | null>(null);
  
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success'}>({
    isOpen: false,
    message: '',
    type: 'error'
  });

  const { data: auditPeriods = [] } = useQuery({
    queryKey: ['auditPeriods'],
    queryFn: () => api.get('/api/admin/periods/').then(res => res.data),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    if (formData.audit_type && formData.category === 'AUDIT_REPORTS') {
      data.append('audit_type', formData.audit_type);
    }
    data.append('restricted', String(formData.restricted));
    data.append('download_restricted', String(formData.download_restricted));
    data.append('quarter', formData.quarter);
    if (formData.audit_period) {
      data.append('audit_period', formData.audit_period);
    } else if (auditPeriods.length > 0) {
      data.append('audit_period', auditPeriods[0].id.toString());
    }
    data.append('pdf_file', file);

    try {
      await api.post('/api/documents/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        message: "Error uploading document: " + JSON.stringify(err.response?.data || {}),
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Back
        </button>
        
        <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Upload New Document</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input 
                type="text" 
                required
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Audit Period</label>
                <select 
                  className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                    className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.restricted ? 'RESTRICTED' : 'PUBLIC'}
                  onChange={(e) => setFormData({...formData, restricted: e.target.value === 'RESTRICTED'})}
                >
                  <option value="RESTRICTED">Restricted (Internal/Specific Roles)</option>
                  <option value="PUBLIC">Public (Visible to All Staff)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Download Permissions</label>
                <select 
                  className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.download_restricted ? 'RESTRICTED' : 'PUBLIC'}
                  onChange={(e) => setFormData({...formData, download_restricted: e.target.value === 'RESTRICTED'})}
                >
                  <option value="RESTRICTED">Restricted Download</option>
                  <option value="PUBLIC">Public Download</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">File (PDF only)</label>
              <input 
                type="file" 
                accept=".pdf"
                required
                className="w-full rounded border border-gray-300 p-2"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 p-3 font-medium text-white hover:bg-blue-700">
              <Upload size={20} /> Upload Document
            </button>
          </form>
        </div>
      </div>
      
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.type === 'error' ? 'Upload Failed' : 'Success'}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
