import React from 'react';
import { Target, Compass, Award, Users, LayoutDashboard, FileText } from 'lucide-react';
import { usePublicContent } from '../../hooks/usePublicContent';
import { PublicOrgChart, type OrgNode } from './components/PublicOrgChart';

const defaultOrgChart: OrgNode = {
  id: 'root',
  title: 'Chief Audit Executive (CAE)',
  subtitle: 'Reports to Board of Directors & CEO',
  children: [
    {
      id: 'd1',
      title: 'Director, Corporate Audit',
      children: [
        { id: 'd1c1', title: 'Head Office Audit Team', children: [] },
        { id: 'd1c2', title: 'IFB Audit Team', children: [] }
      ]
    },
    {
      id: 'd2',
      title: 'Director, Investigations & Branch Audit',
      children: [
        { id: 'd2c1', title: 'Branch Audit', children: [] },
        { id: 'd2c2', title: 'Investigation', children: [] },
        { id: 'd2c3', title: 'Transaction', children: [] }
      ]
    },
    {
      id: 'd3',
      title: 'Director, IT Audit',
      children: [
        { id: 'd3c1', title: 'Infrastructure & Apps', children: [] },
        { id: 'd3c2', title: 'Digital Audit Team', children: [] }
      ]
    }
  ]
};

export function AboutUs() {
  const { content, isLoading } = usePublicContent('about_us');

  // Fallback default content if database is empty
  const heroTitle = content.hero_title || "About Internal Audit";
  const heroSubtitle = content.hero_subtitle || "We provide independent, objective assurance and consulting services designed to add value, improve operations, and help the organization accomplish its strategic objectives.";
  const missionText = content.mission || "To enhance and protect organizational value by providing risk-based and objective assurance, advice, and insight. We help the organization accomplish its objectives by bringing a systematic, disciplined approach to evaluate and improve effectiveness.";
  const visionText = content.vision || "To be a trusted advisor and strategic partner to the Board and Management, recognized for driving positive change, fostering a culture of compliance, and supporting sustainable growth across all business units.";
  const valuesText = content.values || "Integrity, Objectivity, Confidentiality, and Competency. We adhere strictly to the Institute of Internal Auditors (IIA) Code of Ethics and International Standards for the Professional Practice of Internal Auditing.";

  let orgChartData: OrgNode;
  try {
    orgChartData = content.org_chart_json 
      ? JSON.parse(content.org_chart_json) 
      : defaultOrgChart;
  } catch (e) {
    orgChartData = defaultOrgChart;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white font-sans">
      {/* Hero Section */}
      <div className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight mb-6">{heroTitle}</h1>
            <p className="text-xl text-slate-300 leading-relaxed whitespace-pre-line">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-slate-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-blue-100 p-4 text-blue-600">
              <Compass size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {missionText}
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-emerald-100 p-4 text-emerald-600">
              <Target size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {visionText}
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-purple-100 p-4 text-purple-600">
              <Award size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Values</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {valuesText}
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Goals & Initiatives */}
      <div className="bg-blue-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Strategic Goals & Key Initiatives</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our roadmap for advancing the internal audit function and delivering greater value.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <LayoutDashboard className="text-blue-600" /> Strategic Goals
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Agile Auditing</h4>
                    <p className="text-gray-600 text-sm mt-1">Implement agile methodologies to increase audit speed, flexibility, and relevance in a rapidly changing risk landscape.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Data-Driven Insights</h4>
                    <p className="text-gray-600 text-sm mt-1">Leverage advanced data analytics and continuous auditing tools to provide deeper, proactive insights.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Talent Development</h4>
                    <p className="text-gray-600 text-sm mt-1">Cultivate a high-performing team with diverse skill sets including cybersecurity, data science, and business acumen.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <FileText className="text-emerald-600" /> Current Initiatives
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 border-l-4 border-emerald-500 pl-4 py-2">
                  <div>
                    <h4 className="font-bold text-gray-900">Implementation of Automated Workpapers</h4>
                    <p className="text-gray-600 text-sm mt-1">Transitioning to a fully digital, automated audit management system to streamline documentation and review cycles.</p>
                  </div>
                </li>
                <li className="flex gap-4 border-l-4 border-emerald-500 pl-4 py-2">
                  <div>
                    <h4 className="font-bold text-gray-900">Integrated Risk Assurance Framework</h4>
                    <p className="text-gray-600 text-sm mt-1">Collaborating with Risk Management and Compliance departments to unify risk taxonomies and reduce assurance fatigue on business units.</p>
                  </div>
                </li>
                <li className="flex gap-4 border-l-4 border-emerald-500 pl-4 py-2">
                  <div>
                    <h4 className="font-bold text-gray-900">Cybersecurity Readiness Audits</h4>
                    <p className="text-gray-600 text-sm mt-1">A targeted initiative focusing on ransomware defenses, cloud security posture, and zero-trust architecture.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Organizational Structure */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Organizational Structure</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our reporting structure is designed to guarantee absolute independence and objectivity.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 sm:p-8 overflow-hidden">
          <PublicOrgChart data={orgChartData} />
        </div>
      </div>
    </div>
  );
}
