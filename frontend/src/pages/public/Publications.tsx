import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Scale, FileCheck, Library } from 'lucide-react';

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
            <h1 className="text-4xl font-extrabold sm:text-5xl">Publications & Standards</h1>
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
                  <h4 className="font-semibold text-gray-900">Fieldwork & Testing</h4>
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
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Internal Standards</h2>
              <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
                <p>We conform strictly to the International Standards for the Professional Practice of Internal Auditing (Standards) promulgated by the Institute of Internal Auditors (IIA).</p>
                <h3 className="text-xl font-semibold text-gray-900 mt-6">Attribute Standards</h3>
                <p>Addresses the characteristics of organizations and parties performing internal audit activities:</p>
                <ul className="list-disc pl-5">
                  <li><strong>1000</strong> - Purpose, Authority, and Responsibility</li>
                  <li><strong>1100</strong> - Independence and Objectivity</li>
                  <li><strong>1200</strong> - Proficiency and Due Professional Care</li>
                  <li><strong>1300</strong> - Quality Assurance and Improvement Program</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-900 mt-6">Performance Standards</h3>
                <p>Describes the nature of internal audit activities and provides quality criteria:</p>
                <ul className="list-disc pl-5">
                  <li><strong>2000</strong> - Managing the Internal Audit Activity</li>
                  <li><strong>2100</strong> - Nature of Work (Governance, Risk Management, Control)</li>
                  <li><strong>2200</strong> - Engagement Planning</li>
                  <li><strong>2300</strong> - Performing the Engagement</li>
                  <li><strong>2400</strong> - Communicating Results</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'guidance' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">ISACA & GTAG Guidance</h2>
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
