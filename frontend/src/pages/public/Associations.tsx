import React from 'react';
import { Network, GraduationCap, Award } from 'lucide-react';

export function Associations() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans">
      <div className="bg-slate-900 py-16 text-white text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Professional Associations</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto">
          We maintain active relationships with leading global organizations to ensure our practices remain at the forefront of the internal auditing profession.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Network size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">The Institute of Internal Auditors (IIA)</h3>
            <p className="text-gray-600 mb-6">
              As the internal audit profession's most widely recognized advocate, educator, and provider of standards, guidance, and certifications, the IIA is our primary professional association. Our auditors maintain active memberships and conform to IIA standards.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> IIA Global Standards</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Certified Internal Auditor (CIA) track</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">ISACA</h3>
            <p className="text-gray-600 mb-6">
              For our IT audit specialists, ISACA provides practical guidance, benchmarks and other effective tools for all enterprises that use information systems. We leverage ISACA's frameworks like COBIT to govern and manage enterprise IT.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Certified Information Systems Auditor (CISA)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> COBIT Framework Integration</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Association of Certified Fraud Examiners (ACFE)</h3>
            <p className="text-gray-600 mb-6">
              We collaborate with the ACFE to ensure our team is equipped with the latest anti-fraud knowledge and training. Our forensic and fraud investigation teams adhere strictly to ACFE guidelines.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Certified Fraud Examiner (CFE)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Fraud Risk Assessment methodologies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
