import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Scale, FileCheck, Library, FileText, Download, Eye, Calendar, Tag, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

// Document type returned by the public API
interface PublicDocument {
  id: number;
  title: string;
  description: string | null;
  category: string;
  category_display?: string;
  audit_period_name: string;
  quarter_display: string;
  department_name: string | null;
  created_at: string;
  pdf_file: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  AUDIT_REPORTS: 'Audit Reports',
  GUIDELINES: 'Guidelines',
  CHARTERS: 'Charters',
  FRAMEWORKS: 'Frameworks',
  POLICIES: 'Policies',
  PROCEDURES: 'Procedures',
  MANUALS: 'Manuals',
  TEMPLATES: 'Templates',
  OTHER: 'Other Documents',
};

function PublicDocumentCard({ doc }: { doc: PublicDocument }) {
  const viewUrl = doc.pdf_file.startsWith('http') ? doc.pdf_file : `${API_BASE_URL}${doc.pdf_file}`;

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 rounded-lg bg-blue-50 p-3">
        <FileText size={28} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{doc.title}</h4>
        {doc.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{doc.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
          {doc.department_name && (
            <span className="inline-flex items-center gap-1">
              <Tag size={12} /> {doc.department_name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} /> {doc.audit_period_name} &mdash; {doc.quarter_display}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 font-medium">
            {CATEGORY_LABELS[doc.category] ?? doc.category}
          </span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Eye size={14} /> View
        </a>
        <a
          href={viewUrl}
          download
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Download size={14} /> Download
        </a>
      </div>
    </div>
  );
}

function InternalStandardsTab() {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'All Documents' },
    { value: 'GUIDELINES', label: 'Guidelines' },
    { value: 'CHARTERS', label: 'Charters' },
    { value: 'FRAMEWORKS', label: 'Frameworks' },
    { value: 'POLICIES', label: 'Policies' },
    { value: 'PROCEDURES', label: 'Procedures' },
    { value: 'MANUALS', label: 'Manuals' },
    { value: 'TEMPLATES', label: 'Templates' },
    { value: 'AUDIT_REPORTS', label: 'Audit Reports' },
    { value: 'OTHER', label: 'Other Documents' },
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, string> = {};
        if (selectedCategory) params.category = selectedCategory;
        const res = await axios.get(`${API_BASE_URL}/api/public/documents/`, { params });
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
        setDocuments(data);
      } catch {
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [selectedCategory]);

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Internal Standards</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <p className="mb-6 text-gray-600">
        We conform strictly to the International Standards for the Professional Practice of Internal Auditing (Standards)
        promulgated by the Institute of Internal Auditors (IIA). The following documents are publicly available.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading documents...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700 text-sm">{error}</div>
      ) : documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-500">
          <FileText size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No public documents available{selectedCategory ? ` in this category` : ''} yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{documents.length} document{documents.length !== 1 ? 's' : ''} found</p>
          {documents.map(doc => (
            <PublicDocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Publications() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('charter');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['charter', 'guidelines', 'standards', 'guidance'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  const tabs = [
    { id: 'charter', label: 'Internal Audit Charter', icon: <Scale size={18} /> },
    { id: 'guidelines', label: 'Guidelines', icon: <BookOpen size={18} /> },
    { id: 'standards', label: 'Internal Standards', icon: <FileCheck size={18} /> },
    { id: 'guidance', label: 'ISACA / GTAG', icon: <Library size={18} /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white font-sans">
      <div className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold sm:text-5xl">Publications &amp; Standards</h1>
            <p className="mt-4 text-xl text-slate-300">
              Access the foundational documents that govern our internal audit practices, methodologies, and ethical requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.location.hash = tab.id;
                }}
                className={`
                  flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-12">
          {activeTab === 'charter' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Internal Audit Charter</h2>
              <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                <p>The Internal Audit Charter is a formal document that defines the internal audit activity's purpose, authority, and responsibility. The charter establishes the internal audit activity's position within the organization, including the nature of the Chief Audit Executive's functional reporting relationship with the Board.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-8">Authority</h3>
                <p>The internal audit activity, with strict accountability for confidentiality and safeguarding records and information, is authorized full, free, and unrestricted access to any and all of the organization's records, physical properties, and personnel pertinent to carrying out any engagement.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-8">Responsibility</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Submit, at least annually, to senior management and the Board a risk-based internal audit plan for review and approval.</li>
                  <li>Implement the approved annual audit plan, including any special tasks or projects requested by management.</li>
                  <li>Evaluate and assess significant merging/consolidating functions and new or changing services, processes, operations, and control processes coincident with their development.</li>
                  <li>Issue periodic reports to senior management and the Board summarizing results of audit activities.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Audit Guidelines</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <p>Our Audit Guidelines provide a step-by-step methodology for executing audit engagements from planning through reporting and follow-up.</p>
                <div className="mt-8 rounded-lg border border-gray-200 p-6 bg-slate-50">
                  <h4 className="font-semibold text-gray-900">Planning Phase Guidelines</h4>
                  <p className="text-sm mt-2">Criteria for risk assessment, defining audit scope, and resource allocation strategies prior to fieldwork.</p>
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 p-6 bg-slate-50">
                  <h4 className="font-semibold text-gray-900">Fieldwork &amp; Testing</h4>
                  <p className="text-sm mt-2">Standardized procedures for sample selection, evidence gathering, and documenting workpapers.</p>
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 p-6 bg-slate-50">
                  <h4 className="font-semibold text-gray-900">Reporting Guidelines</h4>
                  <p className="text-sm mt-2">Framework for drafting audit observations, categorizing risk ratings (High, Medium, Low), and structuring the final audit report.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'standards' && <InternalStandardsTab />}

          {activeTab === 'guidance' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">ISACA &amp; GTAG Guidance</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <p>For specialized IT and Information Security audits, we align our methodologies with ISACA's ITAF (Information Technology Assurance Framework) and IIA's GTAG (Global Technology Audit Guides).</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-600">
                    <h3 className="text-lg font-bold text-gray-900">ISACA ITAF Framework</h3>
                    <p className="mt-2 text-sm">A comprehensive and good-practice-setting reference model that establishes standards that address IT audit and assurance practitioners' roles and responsibilities.</p>
                  </div>
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 border-l-4 border-l-emerald-600">
                    <h3 className="text-lg font-bold text-gray-900">GTAG - IT Controls</h3>
                    <p className="mt-2 text-sm">Guidance on auditing IT General Controls (ITGC) including logical access, change management, and IT operations.</p>
                  </div>
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 border-l-4 border-l-amber-600">
                    <h3 className="text-lg font-bold text-gray-900">GTAG - Cybersecurity</h3>
                    <p className="mt-2 text-sm">Assessing cybersecurity risks, evaluating incident response readiness, and auditing data protection mechanisms.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
