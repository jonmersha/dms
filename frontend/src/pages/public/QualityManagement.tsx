import React from 'react';
import { ShieldCheck, CheckSquare, Search } from 'lucide-react';
import { usePublicContent } from '../../hooks/usePublicContent';

export function QualityManagement() {
  const { content } = usePublicContent('quality');
  const heroTitle = content.hero_title || "Quality Management";
  const heroSubtitle = content.hero_subtitle || "Our Quality Assurance and Improvement Program (QAIP) is designed to enable an evaluation of the internal audit activity's conformance with the Standards.";
  const introTitle = content.intro_title || "Commitment to Excellence";
  const introText1 = content.intro_text_1 || "We believe that quality is not a destination, but a continuous journey. Our QAIP covers all aspects of the internal audit activity and continuously monitors its effectiveness.";
  const introText2 = content.intro_text_2 || "The program includes periodic internal and external quality assessments and ongoing internal monitoring. Each part of the program is designed to help the internal audit activity add value and improve organizational operations.";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white font-sans">
      <div className="bg-blue-800 py-16 text-white text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{heroTitle}</h1>
        <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto whitespace-pre-line">
          {heroSubtitle}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{introTitle}</h2>
            <p className="text-gray-600 mb-4 text-lg whitespace-pre-line">
              {introText1}
            </p>
            <p className="text-gray-600 mb-8 whitespace-pre-line">
              {introText2}
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1"><CheckSquare className="text-blue-600" size={24} /></div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Ongoing Monitoring</h4>
                  <p className="text-gray-600 text-sm mt-1">Routine supervision, standardized working practices, and regular performance metrics tracking.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1"><Search className="text-blue-600" size={24} /></div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Periodic Internal Assessments</h4>
                  <p className="text-gray-600 text-sm mt-1">Self-assessments conducted annually by individuals with sufficient knowledge of internal audit practices.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1"><ShieldCheck className="text-blue-600" size={24} /></div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">External Assessments</h4>
                  <p className="text-gray-600 text-sm mt-1">Conducted at least once every five years by a qualified, independent assessor from outside the organization.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-2xl transform translate-x-4 translate-y-4"></div>
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" 
              alt="Quality Assurance Audit" 
              className="relative rounded-2xl shadow-lg border border-gray-100 object-cover h-[500px] w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
