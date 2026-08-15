import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Shield, AlertTriangle, Newspaper, Clock, ChevronRight, CheckCircle, Search, Target, Briefcase, ArrowRight } from 'lucide-react';
import { usePublicContent } from '../hooks/usePublicContent';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  author_name: string;
  created_at: string;
}

export function LandingPage() {
  const { content } = usePublicContent('landing_page');
  const heroTitle = content.hero_title || "Internal Audit \n Excellence";
  const heroSubtitle = content.hero_subtitle || "Safeguarding assets, enhancing governance, and driving organizational value through independent and objective assurance.";
  const heroDescription = content.hero_description || "";

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: () => api.get('/api/announcements/').then(res => res.data),
  });

  const announcementList = Array.isArray(announcements) ? announcements : (announcements as any).results || [];
  const internalAuditNews = announcementList.filter((a: any) => a.category === 'INTERNAL_AUDIT').slice(0, 2);
  const riskInsights = announcementList.filter((a: any) => a.category === 'RISK').slice(0, 2);
  const emergingRisks = announcementList.filter((a: any) => a.category === 'EMERGING_RISK').slice(0, 2);

  const coreServices = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Independent Assurance",
      description: "Providing objective evaluation of the organization's governance, risk management, and control processes."
    },
    {
      icon: <Target className="h-8 w-8 text-emerald-600" />,
      title: "Risk Management",
      description: "Identifying and assessing potential threats to strategic objectives and operational efficiency."
    },
    {
      icon: <Search className="h-8 w-8 text-amber-600" />,
      title: "Compliance & Integrity",
      description: "Ensuring adherence to internal policies, regulatory requirements, and ethical business standards."
    },
    {
      icon: <Briefcase className="h-8 w-8 text-purple-600" />,
      title: "Advisory Services",
      description: "Offering strategic insights and recommendations to improve business processes and operational performance."
    }
  ];

  const processSteps = [
    { step: "01", title: "Risk Assessment", desc: "Annual planning based on comprehensive risk analysis across all departments." },
    { step: "02", title: "Audit Execution", desc: "Rigorous field work, data analysis, and control testing." },
    { step: "03", title: "Reporting", desc: "Clear, actionable insights delivered to management and the Board." },
    { step: "04", title: "Follow-up", desc: "Continuous monitoring to ensure timely resolution of audit findings." }
  ];

  const renderNewsCard = (item: Announcement, icon: React.ReactNode, typeColor: string) => (
    <div key={item.id} className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 cursor-pointer">
      <div className={`absolute top-0 right-0 -mt-3 mr-6 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${typeColor} text-white shadow-sm`}>
        {item.category.replace('_', ' ')}
      </div>
      <div className="mb-4 text-gray-400 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">{item.title}</h3>
      <p className="mb-6 text-sm text-gray-600 line-clamp-3">{item.content}</p>
      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
        <span>{item.author_name}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(item.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-blue-100 sm:text-xl whitespace-pre-line">
              {heroSubtitle}
            </p>
            <div className="flex gap-4">
              <a href="#insights" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-500 hover:scale-105">
                Explore Insights
              </a>
              <a href="#methodology" className="inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20">
                Our Approach
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Core Services Section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Core Functions</h2>
            <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">How We Add Value</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {coreServices.map((service, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-transform hover:-translate-y-2 hover:bg-white hover:shadow-xl">
                <div className="mb-6 inline-flex rounded-xl bg-white p-3 shadow-sm border border-gray-100">
                  {service.icon}
                </div>
                <h4 className="mb-3 text-lg font-bold text-gray-900">{service.title}</h4>
                <p className="text-sm leading-relaxed text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic News & Insights Section */}
      <div id="insights" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col justify-between md:flex-row md:items-end">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Intelligence</h2>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Latest Insights & Risks</h3>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {internalAuditNews.map((item: any) => renderNewsCard(item, <Newspaper size={28} />, "bg-blue-600"))}
              {riskInsights.map((item: any) => renderNewsCard(item, <Shield size={28} />, "bg-emerald-600"))}
              {emergingRisks.map((item: any) => renderNewsCard(item, <AlertTriangle size={28} />, "bg-amber-600"))}
              
              {announcementList.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No insights published at the moment. Please check back later.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Methodology Section */}
      <div id="methodology" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Methodology</h2>
            <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Audit Process</h3>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">A systematic, disciplined approach to evaluate and improve the effectiveness of risk management, control, and governance.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative bg-white pt-8 px-4 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-lg ring-8 ring-white">
                  {step.step}
                </div>
                <h4 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <img 
                    src="https://coopbankoromia.com.et/wp-content/uploads/2020/11/Coopbank-Logo-Ethiopia.svg" 
                    alt="Logo" 
                    className="h-12 w-auto bg-white rounded p-1"
                  />
              </div>
              <p className="text-sm leading-relaxed">
                Dedicated to providing independent, objective assurance and consulting services designed to add value and improve operations.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#insights" className="hover:text-white transition-colors">Latest Insights</a></li>
                <li><a href="#methodology" className="hover:text-white transition-colors">Audit Process</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Whistleblower Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ethics & Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>Internal Audit Department</li>
                <li>Head Office, 7th Floor</li>
                <li>Phone: +251 115 580 000</li>
                <li>Email: internal.audit@coopbankoromia.com.et</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Cooperative Bank of Oromia - Internal Audit Department. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
