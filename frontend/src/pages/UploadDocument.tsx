import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ArrowLeft, Upload, FileText, Lock, Globe } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';

const REPORT_CATEGORIES = ['AUDIT_REPORTS'];

const ALL_CATEGORIES = [
  { value: 'AUDIT_REPORTS', label: 'Audit Reports', isReport: true },
  { value: 'GUIDELINES', label: 'Guidelines', isReport: false },
  { value: 'CHARTERS', label: 'Charters', isReport: false },
  { value: 'FRAMEWORKS', label: 'Frameworks', isReport: false },
  { value: 'POLICIES', label: 'Policies', isReport: false },
  { value: 'PROCEDURES', label: 'Procedures', isReport: false },
  { value: 'MANUALS', label: 'Manuals', isReport: false },
  { value: 'TEMPLATES', label: 'Templates', isReport: false },
  { value: 'OTHER', label: 'Other Documents', isReport: false },
];

export function UploadDocument() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'AUDIT_REPORTS',
    audit_type: '',
    restricted: true,
    download_restricted: true,
    quarter: 'Q1',
    audit_period: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; message: string; type: 'error' | 'success' }>({
    isOpen: false, message: '', type: 'error',
  });

  const { data: auditPeriods = [] } = useQuery({
    queryKey: ['auditPeriods'],
    queryFn: () => api.get('/api/admin/periods/').then(res => res.data),
  });

  const isReport = REPORT_CATEGORIES.includes(formData.category);

  const handleCategoryChange = (category: string) => {
    const cat = ALL_CATEGORIES.find(c => c.value === category);
    setFormData(prev => ({
      ...prev,
      category,
      audit_type: '',
      // Reports default to restricted; generic docs default to public
      restricted: cat?.isReport ?? true,
      download_restricted: cat?.isReport ?? true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append('title', formData.title);
    if (formData.description) data.append('description', formData.description);
    data.append('category', formData.category);

    if (isReport) {
      if (formData.audit_type) data.append('audit_type', formData.audit_type);
      data.append('quarter', formData.quarter);
      if (formData.audit_period) {
        data.append('audit_period', formData.audit_period);
      } else if (auditPeriods.length > 0) {
        data.append('audit_period', auditPeriods[0].id.toString());
      }
      data.append('restricted', String(formData.restricted));
      data.append('download_restricted', String(formData.download_restricted));
    } else {
      // Non-reports are always public — no period/quarter needed
      data.append('restricted', 'false');
      data.append('download_restricted', 'false');
    }

    data.append('pdf_file', file);

    try {
      await api.post('/api/documents/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAlertConfig({ isOpen: true, message: 'Document uploaded successfully!', type: 'success' });
      setTimeout(() => navigate(-1), 1200);
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        message: 'Error uploading document: ' + JSON.stringify(err.response?.data || {}),
        type: 'error',
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
          <div className="mb-6 flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Upload New Document</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description <span className="text-gray-400 text-xs">(optional)</span></label>
              <textarea
                rows={2}
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <select
                className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <optgroup label="Audit Reports (time-based)">
                  <option value="AUDIT_REPORTS">Audit Reports</option>
                </optgroup>
                <optgroup label="Generic Documents (public)">
                  <option value="GUIDELINES">Guidelines</option>
                  <option value="CHARTERS">Charters</option>
                  <option value="FRAMEWORKS">Frameworks</option>
                  <option value="POLICIES">Policies</option>
                  <option value="PROCEDURES">Procedures</option>
                  <option value="MANUALS">Manuals</option>
                  <option value="TEMPLATES">Templates</option>
                  <option value="OTHER">Other Documents</option>
                </optgroup>
              </select>

              {/* Info banner */}
              {isReport ? (
                <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <Lock size={14} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Audit Reports</strong> require a period, quarter, and audit type. They are internal by default.</span>
                </div>
              ) : (
                <div className="mt-2 flex items-start gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-xs text-green-800">
                  <Globe size={14} className="flex-shrink-0 mt-0.5" />
                  <span><strong>Generic documents</strong> are publicly accessible on the Publications page — no time categorization needed.</span>
                </div>
              )}
            </div>

            {/* ===== REPORT-ONLY FIELDS ===== */}
            {isReport && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Audit Period <span className="text-red-500">*</span></label>
                    <select
                      required
                      className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formData.audit_period || (auditPeriods.length > 0 ? auditPeriods[0].id : '')}
                      onChange={(e) => setFormData({ ...formData, audit_period: e.target.value })}
                    >
                      {auditPeriods.map((period: any) => (
                        <option key={period.id} value={period.id}>
                          {period.fiscal_year} ({period.is_active ? 'Active' : 'Inactive'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Quarter <span className="text-red-500">*</span></label>
                    <select
                      required
                      className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formData.quarter}
                      onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    >
                      <option value="Q1">Quarter 1 (Jul–Sep)</option>
                      <option value="Q2">Quarter 2 (Oct–Dec)</option>
                      <option value="Q3">Quarter 3 (Jan–Mar)</option>
                      <option value="Q4">Quarter 4 (Apr–Jun)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Audit Type <span className="text-red-500">*</span></label>
                  <select
                    required
                    className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={formData.audit_type}
                    onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                  >
                    <option value="">-- Select Audit Type --</option>
                    <option value="BRANCH">Branch Audit</option>
                    <option value="IT">IT Audit</option>
                    <option value="INVESTIGATION">Investigation Audit</option>
                    <option value="HEAD_OFFICE">Head Office Organ Audit</option>
                    <option value="IFB">IFB Audit</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">View Visibility</label>
                    <select
                      className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formData.restricted ? 'RESTRICTED' : 'PUBLIC'}
                      onChange={(e) => setFormData({ ...formData, restricted: e.target.value === 'RESTRICTED' })}
                    >
                      <option value="RESTRICTED">Restricted (Internal / Specific Roles)</option>
                      <option value="PUBLIC">Public (All Internal Staff)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Download Permissions</label>
                    <select
                      className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formData.download_restricted ? 'RESTRICTED' : 'PUBLIC'}
                      onChange={(e) => setFormData({ ...formData, download_restricted: e.target.value === 'RESTRICTED' })}
                    >
                      <option value="RESTRICTED">Restricted Download</option>
                      <option value="PUBLIC">Public Download</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* File upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">File (PDF only) <span className="text-red-500">*</span></label>
              <input
                type="file"
                accept=".pdf"
                required
                className="w-full rounded border border-gray-300 p-2"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 transition-colors"
            >
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
