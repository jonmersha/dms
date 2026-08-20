import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Scale, FileCheck, Library, FileText, Download, Loader2, Maximize2, X, Network, GraduationCap, Award } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Document as PdfDocument, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { usePublicContent } from '../../hooks/usePublicContent';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Document type returned by the public API
interface PublicDocument {
  id: number;
  title: string;
  description: string | null;
  category: string;
  category_display?: string;
  audit_period_name: string | null;
  quarter_display: string | null;
  department_name: string | null;
  created_at: string;
  pdf_file: string;
}

// ─── Thumbnail Component ───────────────────────────────────────────────────────
function PdfThumbnail({ url, title }: { url: string, title: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:border-blue-300">
      {!error ? (
        <PdfDocument
          file={url}
          onLoadError={(err) => {
            console.error('Failed to load PDF thumbnail:', err);
            setError(true);
          }}
          loading={
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={16} className="animate-spin mb-1" />
            </div>
          }
        >
          <PdfPage
            pageNumber={1}
            width={120}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={null}
          />
        </PdfDocument>
      ) : (
        <FileText size={24} className="text-gray-300" />
      )}
    </div>
  );
}

// ─── In-App PDF Viewer Modal ───────────────────────────────────────────────────
function PdfViewerModal({
  doc,
  onClose,
}: {
  doc: PublicDocument;
  onClose: () => void;
}) {
  const viewUrl = doc.pdf_file.startsWith('http') ? doc.pdf_file : `${API_BASE_URL}${doc.pdf_file}`;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={20} className="text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{doc.title}</p>
            {doc.category_display && (
              <p className="text-slate-400 text-xs">{doc.category_display}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            title="Open in new tab"
          >
            <Maximize2 size={13} /> <span className="hidden sm:inline">Fullscreen</span>
          </a>
          <a
            href={viewUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Download size={13} /> <span className="hidden sm:inline">Download</span>
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors ml-2"
          >
            <X size={14} /> Close
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-gray-700">
        <iframe
          src={`${viewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={doc.title}
          className="w-full h-full border-0"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}

// ─── Document Side List Component ──────────────────────────────────────────────
function DocumentSideList({
  documents,
  loading,
  error,
  onView,
}: {
  documents: PublicDocument[];
  loading: boolean;
  error: string;
  onView: (doc: PublicDocument) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
        <Loader2 size={24} className="animate-spin mb-3 text-blue-600" />
        <span className="text-sm">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center px-4">
        <FileText size={32} className="mb-2 text-gray-300" />
        <span className="text-sm font-medium">No documents published yet</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
      {documents.map((doc) => {
        const viewUrl = doc.pdf_file.startsWith('http') ? doc.pdf_file : `${API_BASE_URL}${doc.pdf_file}`;
        return (
          <button
            key={doc.id}
            onClick={() => onView(doc)}
            className="group flex flex-col text-left focus:outline-none"
          >
            <PdfThumbnail url={viewUrl} title={doc.title} />
            <span className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {doc.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Publications Page ────────────────────────────────────────────────────
export function Publications() {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingDoc, setViewingDoc] = useState<PublicDocument | null>(null);

  const { content } = usePublicContent('publications');
  const heroTitle = content.hero_title || "Publications & Standards";
  const heroSubtitle = content.hero_subtitle || "Access the foundational documents that govern our internal audit practices, methodologies, and ethical requirements.";

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['charter', 'guidelines', 'standards', 'guidance', 'associations'].includes(hash) ? hash : 'charter';
  });

  const tabs = [
    { id: 'charter', label: 'Internal Audit Charter', icon: <Scale size={18} />, category: 'CHARTERS' },
    { id: 'guidelines', label: 'Guidelines', icon: <BookOpen size={18} />, category: 'GUIDELINES' },
    { id: 'standards', label: 'Internal Standards', icon: <FileCheck size={18} />, category: 'POLICIES' },
    { id: 'guidance', label: 'ISACA / GTAG', icon: <Library size={18} />, category: 'FRAMEWORKS' },
    { id: 'associations', label: 'Associations', icon: <Network size={18} />, category: '' },
  ];

  useEffect(() => {
    let isActive = true;
    const fetchDocs = async () => {
      // Don't fetch if it's associations
      if (activeTab === 'associations') {
        if (isActive) setDocuments([]);
        return;
      }
      
      setLoading(true);
      setError('');
      
      const tabConfig = tabs.find(t => t.id === activeTab);
      const category = tabConfig ? tabConfig.category : '';

      try {
        const params: Record<string, string> = {};
        if (category) params.category = category;
        const res = await axios.get(`${API_BASE_URL}/api/public/documents/`, { params });
        if (isActive) {
          const data = Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
          setDocuments(data);
        }
      } catch {
        if (isActive) setError('Failed to load documents. Please try again later.');
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchDocs();
    return () => { isActive = false; };
  }, [activeTab]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans">
      {viewingDoc && (
        <PdfViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      <div className="bg-slate-900 py-16 text-white text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-extrabold sm:text-5xl">{heroTitle}</h1>
            <p className="mt-4 text-xl text-slate-300 whitespace-pre-line">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
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

        <div className="mt-12 flex flex-col lg:flex-row gap-12">
          
          {/* Main Body (Description) */}
          <div className="lg:w-2/3">
            {activeTab === 'charter' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            {activeTab === 'standards' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Internal Standards</h2>
                <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                  <p>We conform strictly to the International Standards for the Professional Practice of Internal Auditing (Standards) promulgated by the Institute of Internal Auditors (IIA). These internal standards document how our department implements and enforces these global principles.</p>
                  <h3 className="text-xl font-semibold text-gray-900 mt-8">Core Principles</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Demonstrates integrity.</li>
                    <li>Demonstrates competence and due professional care.</li>
                    <li>Is objective and free from undue influence (independent).</li>
                    <li>Aligns with the strategies, objectives, and risks of the organization.</li>
                    <li>Is appropriately positioned and adequately resourced.</li>
                    <li>Demonstrates quality and continuous improvement.</li>
                    <li>Communicates effectively.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'guidance' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 border-l-4 border-l-amber-600 md:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900">GTAG - Cybersecurity</h3>
                      <p className="mt-2 text-sm">Assessing cybersecurity risks, evaluating incident response readiness, and auditing data protection mechanisms.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'associations' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional Associations</h2>
                <div className="prose prose-blue max-w-none text-gray-600 mb-8">
                  <p>We maintain active relationships with leading global organizations to ensure our practices remain at the forefront of the internal auditing profession.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Network size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">The Institute of Internal Auditors (IIA)</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      As the internal audit profession's most widely recognized advocate, educator, and provider of standards, guidance, and certifications, the IIA is our primary professional association. Our auditors maintain active memberships and conform to IIA standards.
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-600 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> IIA Global Standards</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Certified Internal Auditor (CIA) track</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">ISACA</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      For our IT audit specialists, ISACA provides practical guidance, benchmarks and other effective tools for all enterprises that use information systems. We leverage ISACA's frameworks like COBIT to govern and manage enterprise IT.
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-600 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Certified Information Systems Auditor (CISA)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> COBIT Framework Integration</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <Award size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Association of Certified Fraud Examiners (ACFE)</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      We collaborate with the ACFE to ensure our team is equipped with the latest anti-fraud knowledge and training. Our forensic and fraud investigation teams adhere strictly to ACFE guidelines.
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-600 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Certified Fraud Examiner (CFE)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Fraud Risk Assessment methodologies</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Pane (Thumbnails) */}
          {activeTab !== 'associations' && (
            <div className="lg:w-1/3 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Library size={20} className="text-blue-600" />
                  Related Documents
                </h3>
                <p className="text-sm text-gray-500 mt-1">Click a document cover to open it</p>
              </div>
              
              <DocumentSideList 
                documents={documents} 
                loading={loading} 
                error={error} 
                onView={setViewingDoc} 
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
