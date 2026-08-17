import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export function Performance() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['performance', 'year-plans'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['public-performance-plans'],
    queryFn: () => api.get('/api/admin/performance-plans/').then(res => res.data),
  });

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
              <BarChart3 size={18} /> Performance Executions
            </button>
            <button
              onClick={() => { setActiveTab('year-plans'); window.location.hash = 'year-plans'; }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'year-plans' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <CalendarIcon size={18} /> Strategic Plans
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {activeTab === 'performance' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8">
                {plans.length === 0 ? (
                  <p className="text-center text-gray-500 bg-white p-8 rounded-xl border border-gray-200">No performance executions published yet.</p>
                ) : (
                  plans.map((plan: any) => (
                    <div key={`perf-${plan.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{plan.department_name}</h3>
                          <p className="text-gray-500 font-medium">Performance Execution - {plan.year}</p>
                        </div>
                      </div>
                      <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                        {plan.performance_execution || <span className="text-gray-400 italic">No performance execution details provided for this year.</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'year-plans' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8">
                {plans.length === 0 ? (
                  <p className="text-center text-gray-500 bg-white p-8 rounded-xl border border-gray-200">No strategic plans published yet.</p>
                ) : (
                  plans.map((plan: any) => (
                    <div key={`plan-${plan.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                        <Building2 className="text-blue-600" size={24} />
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{plan.department_name}</h3>
                          <p className="text-gray-500 font-medium">Strategic Audit Plan - {plan.year}</p>
                        </div>
                      </div>
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CalendarIcon size={18} className="text-emerald-600" />
                            Long Term Plan
                          </h4>
                          <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap text-sm">
                            {plan.long_term_plan || <span className="text-gray-400 italic">No long term plan provided.</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-purple-600" />
                            Short Term Plan
                          </h4>
                          <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap text-sm">
                            {plan.short_term_plan || <span className="text-gray-400 italic">No short term plan provided.</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
