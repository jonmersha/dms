import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Loader2, Save, X, Calendar, Target, ListChecks } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function PerformancePlansManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [planType, setPlanType] = useState<'ANNUAL' | 'ENGAGEMENT'>('ANNUAL');
  
  // State for dynamic engagement activities
  const [activities, setActivities] = useState<{ 
    activity: string; 
    start_date: string; 
    end_date: string;
    assigned_to?: string;
    status?: string;
    progress?: number;
    milestone?: boolean;
  }[]>([]);

  // Reset or load state when editing starts
  useEffect(() => {
    if (editingPlan) {
      setPlanType(editingPlan.plan_type || 'ANNUAL');
      setActivities(editingPlan.engagement_activities || []);
    } else {
      setPlanType('ANNUAL');
      setActivities([]);
    }
  }, [editingPlan]);

  // Fetch plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['performance-plans'],
    queryFn: () => api.get('/api/admin/performance-plans/').then(res => res.data),
  });

  // Fetch users for assignments
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/admin/users/').then(res => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return api.put(`/api/admin/performance-plans/${data.id}/`, data);
      }
      return api.post('/api/admin/performance-plans/', { ...data, department: (user as any)?.department?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-plans'] });
      setIsFormOpen(false);
      setEditingPlan(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/performance-plans/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-plans'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data: any = {
      id: editingPlan?.id,
      year: parseInt(formData.get('year') as string, 10),
      plan_type: planType,
      long_term_plan: formData.get('long_term_plan'),
      short_term_plan: formData.get('short_term_plan'),
      performance_execution: formData.get('performance_execution'),
    };

    if (planType === 'ANNUAL') {
      data.annual_target_audits = formData.get('annual_target_audits') ? parseInt(formData.get('annual_target_audits') as string, 10) : null;
      data.q1_target = formData.get('q1_target') ? parseInt(formData.get('q1_target') as string, 10) : null;
      data.q2_target = formData.get('q2_target') ? parseInt(formData.get('q2_target') as string, 10) : null;
      data.q3_target = formData.get('q3_target') ? parseInt(formData.get('q3_target') as string, 10) : null;
      data.q4_target = formData.get('q4_target') ? parseInt(formData.get('q4_target') as string, 10) : null;
    } else {
      data.title = formData.get('title') || '';
      data.engagement_activities = activities.filter(a => a.activity.trim() !== '');
    }

    saveMutation.mutate(data);
  };

  const handleAddActivity = () => {
    setActivities([...activities, { 
      activity: '', 
      start_date: '', 
      end_date: '',
      status: 'Pending',
      progress: 0,
      milestone: false,
      assigned_to: ''
    }]);
  };

  const handleUpdateActivity = (index: number, field: string, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setActivities(newActivities);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Department Plans</h1>
          <p className="text-gray-500 mt-1">Register Annual Targets and Specific Engagement Plans.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => { setEditingPlan(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add New Plan
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          {/* Plan Type Selector (Only on create, disable on edit to prevent complex state issues) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                disabled={!!editingPlan}
                onClick={() => setPlanType('ANNUAL')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md font-medium text-sm transition-colors ${planType === 'ANNUAL' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} ${editingPlan ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Calendar size={16} /> Annual Plan
              </button>
              <button
                type="button"
                disabled={!!editingPlan}
                onClick={() => setPlanType('ENGAGEMENT')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md font-medium text-sm transition-colors ${planType === 'ENGAGEMENT' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} ${editingPlan ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Target size={16} /> Specific Engagement
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  name="year"
                  defaultValue={editingPlan?.year || new Date().getFullYear()}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {planType === 'ENGAGEMENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingPlan?.title}
                    required
                    placeholder="e.g. Project Operations Audit"
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {planType === 'ANNUAL' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Target size={16} className="text-blue-600"/> Audit Targets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Target</label>
                    <input type="number" name="annual_target_audits" defaultValue={editingPlan?.annual_target_audits} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Q1 Target</label>
                    <input type="number" name="q1_target" defaultValue={editingPlan?.q1_target} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Q2 Target</label>
                    <input type="number" name="q2_target" defaultValue={editingPlan?.q2_target} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Q3 Target</label>
                    <input type="number" name="q3_target" defaultValue={editingPlan?.q3_target} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Q4 Target</label>
                    <input type="number" name="q4_target" defaultValue={editingPlan?.q4_target} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {planType === 'ENGAGEMENT' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><ListChecks size={16} className="text-blue-600"/> Engagement Activities</h3>
                  <button type="button" onClick={handleAddActivity} className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-gray-700 hover:bg-gray-50">
                    + Add Activity
                  </button>
                </div>
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No activities added. Click "Add Activity" to create your timeline.</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((act, index) => (
                      <div key={index} className="bg-white p-4 rounded border border-gray-200 shadow-sm relative">
                        <button type="button" onClick={() => handleRemoveActivity(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 pr-8">
                          <div className="md:col-span-12">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Activity / Milestone Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Fieldwork, Reporting"
                              value={act.activity}
                              onChange={(e) => handleUpdateActivity(index, 'activity', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm"
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={act.start_date}
                              onChange={(e) => handleUpdateActivity(index, 'start_date', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-600"
                            />
                          </div>
                          
                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                            <input
                              type="date"
                              value={act.end_date}
                              onChange={(e) => handleUpdateActivity(index, 'end_date', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-600"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Assigned To</label>
                            <select
                              value={act.assigned_to || ''}
                              onChange={(e) => handleUpdateActivity(index, 'assigned_to', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 bg-white"
                            >
                              <option value="">Unassigned</option>
                              {users.map((u: any) => (
                                <option key={u.id} value={u.get_full_name || u.username}>
                                  {u.get_full_name || u.username}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select
                              value={act.status || 'Pending'}
                              onChange={(e) => handleUpdateActivity(index, 'status', e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 bg-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Delayed">Delayed</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 bg-gray-50 p-3 rounded-md border border-gray-100">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!act.milestone}
                              onChange={(e) => handleUpdateActivity(index, 'milestone', e.target.checked as any)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Mark as Milestone</span>
                          </label>
                          
                          <div className="flex-1 flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Progress:</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={act.progress || 0}
                              onChange={(e) => handleUpdateActivity(index, 'progress', parseInt(e.target.value, 10) as any)}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-sm font-bold text-gray-700 w-12">{act.progress || 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Optional Generic Text Fields */}
            <div className="border-t border-gray-200 pt-6">
              <details className="group">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 mb-2 outline-none">
                  Additional Details & Execution Notes (Optional)
                </summary>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Long Term Strategic Plan</label>
                    <textarea name="long_term_plan" defaultValue={editingPlan?.long_term_plan} rows={2} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Short Term Objectives</label>
                    <textarea name="short_term_plan" defaultValue={editingPlan?.short_term_plan} rows={2} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Performance Execution</label>
                    <textarea name="performance_execution" defaultValue={editingPlan?.performance_execution} rows={2} className="w-full rounded-md border border-gray-300 p-2 text-sm" />
                  </div>
                </div>
              </details>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">Plan Type & Year</th>
                <th className="p-4 font-semibold">Title / Target</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No plans registered yet.
                  </td>
                </tr>
              ) : (
                plans.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {plan.plan_type === 'ANNUAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Calendar size={12}/> Annual
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Target size={12}/> Engagement
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{plan.year}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900 font-medium">
                      {plan.plan_type === 'ANNUAL' ? (
                        <span>{plan.annual_target_audits ? `${plan.annual_target_audits} Total Audits` : 'No target set'}</span>
                      ) : (
                        <span>{plan.title || 'Untitled Engagement'}</span>
                      )}
                    </td>
                    <td className="p-4">{plan.department_name}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setEditingPlan(plan); setIsFormOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Plan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this plan?')) {
                            deleteMutation.mutate(plan.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded ml-1"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
