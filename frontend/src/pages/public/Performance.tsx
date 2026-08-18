import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, CheckCircle2, Loader2, Building2, Target, ListChecks, CalendarDays } from 'lucide-react';
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
                          <p className="text-gray-500 font-medium">
                            Performance Execution - {plan.year} 
                            {plan.plan_type === 'ENGAGEMENT' && ` (${plan.title})`}
                          </p>
                        </div>
                      </div>
                      <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                        {plan.performance_execution || <span className="text-gray-400 italic">No performance execution details provided for this plan.</span>}
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
                        {plan.plan_type === 'ANNUAL' ? (
                          <Building2 className="text-blue-600" size={24} />
                        ) : (
                          <Target className="text-purple-600" size={24} />
                        )}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{plan.department_name}</h3>
                          <p className="text-gray-500 font-medium flex items-center gap-2">
                            {plan.plan_type === 'ANNUAL' ? (
                              <>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Annual Plan</span>
                                <span>{plan.year}</span>
                              </>
                            ) : (
                              <>
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Engagement</span>
                                <span>{plan.title} ({plan.year})</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-8 space-y-8">
                        {/* Render Annual Targets if Annual */}
                        {plan.plan_type === 'ANNUAL' && (
                          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <h4 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                              <Target size={20} className="text-blue-600" />
                              Audit Targets
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                <div className="text-sm font-medium text-gray-500 mb-1">Total Target</div>
                                <div className="text-3xl font-bold text-blue-600">{plan.annual_target_audits || 0}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="text-sm font-medium text-gray-500 mb-1">Q1</div>
                                <div className="text-xl font-bold text-gray-900">{plan.q1_target || 0}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="text-sm font-medium text-gray-500 mb-1">Q2</div>
                                <div className="text-xl font-bold text-gray-900">{plan.q2_target || 0}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="text-sm font-medium text-gray-500 mb-1">Q3</div>
                                <div className="text-xl font-bold text-gray-900">{plan.q3_target || 0}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="text-sm font-medium text-gray-500 mb-1">Q4</div>
                                <div className="text-xl font-bold text-gray-900">{plan.q4_target || 0}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Render Engagement Activities if Engagement */}
                        {plan.plan_type === 'ENGAGEMENT' && plan.engagement_activities && plan.engagement_activities.length > 0 && (
                          <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
                            <h4 className="text-lg font-bold text-purple-900 mb-6 flex items-center gap-2">
                              <ListChecks size={20} className="text-purple-600" />
                              Project Timeline & Milestones
                            </h4>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-300 before:to-transparent">
                              {plan.engagement_activities.map((act: any, idx: number) => {
                                const isMilestone = act.milestone;
                                const statusColors: any = {
                                  'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
                                  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
                                  'Completed': 'bg-green-100 text-green-700 border-green-200',
                                  'Delayed': 'bg-red-100 text-red-700 border-red-200',
                                };
                                const statusColor = statusColors[act.status || 'Pending'];
                                const progress = act.progress || 0;

                                return (
                                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isMilestone ? 'bg-amber-500' : 'bg-purple-500'}`}>
                                      {isMilestone ? <Target size={16} /> : <CalendarDays size={16} />}
                                    </div>
                                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${isMilestone ? 'border-amber-200 shadow-amber-100/50' : 'border-purple-200'}`}>
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            {isMilestone && <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Milestone</span>}
                                            <h5 className="font-bold text-gray-900 text-base">{act.activity}</h5>
                                          </div>
                                          <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                            <CalendarIcon size={12} className="text-gray-400" />
                                            {act.start_date || '?'} <span className="text-gray-300 mx-1">→</span> {act.end_date || '?'}
                                          </div>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border whitespace-nowrap ${statusColor}`}>
                                          {act.status || 'Pending'}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm">
                                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                                            {act.assigned_to ? act.assigned_to.charAt(0).toUpperCase() : '?'}
                                          </div>
                                          <span className="text-gray-600 font-medium text-xs">{act.assigned_to || 'Unassigned'}</span>
                                        </div>

                                        <div className="flex items-center gap-2 w-32">
                                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${progress}%` }}></div>
                                          </div>
                                          <span className="text-xs font-bold text-gray-600 w-8 text-right">{progress}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Optional Legacy Fields */}
                        {(plan.long_term_plan || plan.short_term_plan) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                            {plan.long_term_plan && (
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <CalendarIcon size={18} className="text-emerald-600" />
                                  Strategic Plan
                                </h4>
                                <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap text-sm">
                                  {plan.long_term_plan}
                                </div>
                              </div>
                            )}
                            {plan.short_term_plan && (
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <CheckCircle2 size={18} className="text-blue-600" />
                                  Execution Objectives
                                </h4>
                                <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap text-sm">
                                  {plan.short_term_plan}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
