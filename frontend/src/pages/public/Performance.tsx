import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export function Performance() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['performance', 'year-plans'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans">
      <div className="bg-slate-900 py-16 text-white text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Performance & Plans</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto">
          Transparency in our operations through published performance metrics and our strategic yearly audit plans.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => { setActiveTab('performance'); window.location.hash = 'performance'; }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'performance' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <BarChart3 size={18} /> Performance Metrics
            </button>
            <button
              onClick={() => { setActiveTab('year-plans'); window.location.hash = 'year-plans'; }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'year-plans' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <CalendarIcon size={18} /> Yearly Audit Plans
            </button>
          </div>
        </div>

        {activeTab === 'performance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">98%</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Audit Plan Completion</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-4xl font-extrabold text-emerald-600 mb-2">92%</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Management Action Implementation</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-4xl font-extrabold text-purple-600 mb-2">4.8/5</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Auditee Satisfaction Score</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="text-blue-600" /> Key Performance Indicators (KPIs)
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Timeliness of Audit Reports</h4>
                    <p className="text-gray-600 mt-1">Goal: Issue draft reports within 15 days of fieldwork completion. Issue final reports within 10 days of management response.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Audit Efficiency</h4>
                    <p className="text-gray-600 mt-1">Goal: Maintain 75% or higher direct audit hours (billable time) relative to total available working hours.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Continuous Professional Education</h4>
                    <p className="text-gray-600 mt-1">Goal: 100% of audit staff fulfill the required 40 hours of CPE credits annually to maintain certifications.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'year-plans' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Strategic Audit Planning</h2>
            <div className="prose prose-blue max-w-none text-gray-600 mb-8">
              <p>Our annual audit plan is developed using a comprehensive risk assessment methodology. The plan aims to allocate our resources to the areas of highest risk and strategic importance to the organization.</p>
              <p>The plan is reviewed and approved by the Audit Committee of the Board of Directors annually, and is subject to dynamic updates as emerging risks are identified.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-900">
                Current Year Focus Areas
              </div>
              <ul className="divide-y divide-gray-200">
                <li className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 block">Information Security & Cyber Resilience</span>
                    <span className="text-sm text-gray-500">Comprehensive review of network defenses, incident response, and data privacy.</span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">High Priority</span>
                </li>
                <li className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 block">Regulatory Compliance</span>
                    <span className="text-sm text-gray-500">Assessment of adherence to new financial regulations and anti-money laundering (AML) controls.</span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">High Priority</span>
                </li>
                <li className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 block">Operational Efficiency</span>
                    <span className="text-sm text-gray-500">End-to-end review of procurement and supply chain management processes.</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Medium Priority</span>
                </li>
                <li className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 block">Digital Transformation Initiatives</span>
                    <span className="text-sm text-gray-500">Pre-implementation reviews of core system upgrades.</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Medium Priority</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
