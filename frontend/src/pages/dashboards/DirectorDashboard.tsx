import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, AlertTriangle, 
  Activity, Target, UploadCloud, BookOpen, 
  ChevronRight, ArrowRight, Users, Award
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { DocumentList } from '../../components/DocumentList';

const STATUS_COLORS: any = {
  'APPROVED': '#10b981', // green-500
  'PENDING_APPROVAL': '#f59e0b', // amber-500
  'DRAFT': '#6b7280', // gray-500
  'RETURNED': '#ef4444', // red-500
};

export function DirectorDashboard({ user }: { user: any }) {
  const navigate = useNavigate();

  // Fetch Documents
  const { data: documentsData = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/api/documents/').then(res => res.data),
  });
  const allDocuments = Array.isArray(documentsData) ? documentsData : (documentsData as any).results || [];

  // Fetch Plans
  const { data: plans = [] } = useQuery({
    queryKey: ['my-performance-plans'],
    queryFn: () => api.get('/api/admin/performance-plans/').then(res => res.data),
  });

  // Fetch Learning Metrics
  const { data: learningMetrics } = useQuery({
    queryKey: ['learning-metrics'],
    queryFn: () => api.get('/api/admin/learning-metrics/').then(res => res.data),
  });
  
  const totalCourses = learningMetrics?.total_courses || 0;
  const employeesTrained = learningMetrics?.employees_trained || 0;
  const avgCompletion = learningMetrics?.avg_completion || 0;
  const learningHours = learningMetrics?.learning_hours || 0;

  // Calculate Plan Stats
  const myPlans = plans.filter((p: any) => p.department === user?.department?.id || (p.department && p.department.id === user?.department?.id));
  const activeEngagements = myPlans.filter((p: any) => p.plan_type === 'ENGAGEMENT').length;
  const activeActivities = myPlans
    .filter((p: any) => p.plan_type === 'ENGAGEMENT')
    .reduce((acc: number, p: any) => acc + (p.engagement_activities?.length || 0), 0);

  // Calculate Document Stats for PieChart
  const pendingApprovalsCount = allDocuments.filter((d: any) => d.status === 'PENDING_APPROVAL').length;
  const auditReportsCount = allDocuments.filter((d: any) => d.category === 'AUDIT_REPORTS').length;
  const docsByStatus = allDocuments.reduce((acc: any, doc: any) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(docsByStatus).map(status => ({
    name: status,
    value: docsByStatus[status]
  }));

  // Handle Chart Click
  const onPieEnter = (_: any, index: number) => {
    navigate(`/documents?status=${chartData[index].name}`);
  };

  // Calculate Planned vs Performed
  const annualPlans = myPlans.filter((p: any) => p.plan_type === 'ANNUAL');
  const q1Planned = annualPlans.reduce((sum: number, p: any) => sum + (p.q1_target || 0), 0);
  const q2Planned = annualPlans.reduce((sum: number, p: any) => sum + (p.q2_target || 0), 0);
  const q3Planned = annualPlans.reduce((sum: number, p: any) => sum + (p.q3_target || 0), 0);
  const q4Planned = annualPlans.reduce((sum: number, p: any) => sum + (p.q4_target || 0), 0);

  const auditReports = allDocuments.filter((d: any) => d.category === 'AUDIT_REPORTS');
  const q1Performed = auditReports.filter((d: any) => d.quarter === 'Q1' || d.quarter_display === 'Q1').length;
  const q2Performed = auditReports.filter((d: any) => d.quarter === 'Q2' || d.quarter_display === 'Q2').length;
  const q3Performed = auditReports.filter((d: any) => d.quarter === 'Q3' || d.quarter_display === 'Q3').length;
  const q4Performed = auditReports.filter((d: any) => d.quarter === 'Q4' || d.quarter_display === 'Q4').length;

  const performanceData = [
    { name: 'Q1', Planned: q1Planned, Performed: q1Performed },
    { name: 'Q2', Planned: q2Planned, Performed: q2Performed },
    { name: 'Q3', Planned: q3Planned, Performed: q3Performed },
    { name: 'Q4', Planned: q4Planned, Performed: q4Performed },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. QUICK ACTIONS (Card Menus) */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/documents/new" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 text-blue-400 opacity-30 transform group-hover:scale-110 transition-transform duration-500">
              <UploadCloud size={100} />
            </div>
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <UploadCloud size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">Upload Document</h3>
              <p className="text-blue-100 text-sm mb-4">Add new documents to the library</p>
              <div className="flex items-center text-sm font-semibold text-white">
                Get Started <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link to="/dashboard/performance-plans" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 text-purple-400 opacity-30 transform group-hover:scale-110 transition-transform duration-500">
              <Target size={100} />
            </div>
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">Create Plan</h3>
              <p className="text-purple-100 text-sm mb-4">Manage strategic & engagement plans</p>
              <div className="flex items-center text-sm font-semibold text-white">
                Get Started <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link to="/system/learning" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 text-indigo-400 opacity-30 transform group-hover:scale-110 transition-transform duration-500">
              <BookOpen size={100} />
            </div>
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <BookOpen size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">Create Course</h3>
              <p className="text-indigo-100 text-sm mb-4">Build learning materials for your team</p>
              <div className="flex items-center text-sm font-semibold text-white">
                Get Started <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link to="/documents" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 text-emerald-400 opacity-30 transform group-hover:scale-110 transition-transform duration-500">
              <FileText size={100} />
            </div>
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <FileText size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1 flex items-center">
                Audit Reports 
                <span className="ml-2 bg-emerald-700/50 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-sm font-medium">{auditReportsCount}</span>
              </h3>
              <p className="text-emerald-100 text-sm mb-4">View and manage audit reports</p>
              <div className="flex items-center text-sm font-semibold text-white">
                View Reports <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 2. CLICKABLE METRICS */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Department Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button onClick={() => navigate('/documents')} className="flex items-center text-left rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group w-full">
            <div className="rounded-md bg-blue-100 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Total Documents</p>
              <p className="text-2xl font-semibold text-gray-900">{allDocuments.length}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" size={20} />
          </button>

          <button onClick={() => navigate('/documents?status=PENDING_APPROVAL')} className="flex items-center text-left rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group w-full">
            <div className="rounded-md bg-amber-100 p-3 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <AlertTriangle size={24} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingApprovalsCount}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" size={20} />
          </button>

          <button onClick={() => navigate('/dashboard/performance-plans')} className="flex items-center text-left rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group w-full">
            <div className="rounded-md bg-purple-100 p-3 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Active Engagements</p>
              <p className="text-2xl font-semibold text-gray-900">{activeEngagements}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-purple-500 transition-transform group-hover:translate-x-1" size={20} />
          </button>

          <button onClick={() => navigate('/dashboard/performance-plans')} className="flex items-center text-left rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group w-full">
            <div className="rounded-md bg-green-100 p-3 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Ongoing Activities</p>
              <p className="text-2xl font-semibold text-gray-900">{activeActivities}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-green-500 transition-transform group-hover:translate-x-1" size={20} />
          </button>

        </div>
      </section>

      {/* 3. LEARNING & CHARTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Learning & Development Metrics */}
        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200 flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Learning & Development</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <button onClick={() => navigate('/learning')} className="flex items-center text-left rounded-lg bg-gray-50 p-4 border border-gray-100 hover:border-indigo-300 hover:shadow-sm transition-all group">
              <div className="rounded-md bg-indigo-100 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BookOpen size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-900">Total Courses</p>
                <p className="text-xl font-bold text-gray-900">{totalCourses}</p>
              </div>
            </button>

            <div className="flex items-center text-left rounded-lg bg-gray-50 p-4 border border-gray-100">
              <div className="rounded-md bg-teal-100 p-2.5 text-teal-600">
                <Users size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-500">Employees Trained</p>
                <p className="text-xl font-bold text-gray-900">{employeesTrained}</p>
              </div>
            </div>

            <div className="flex items-center text-left rounded-lg bg-gray-50 p-4 border border-gray-100">
              <div className="rounded-md bg-rose-100 p-2.5 text-rose-600">
                <Award size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-500">Avg. Completion</p>
                <p className="text-xl font-bold text-gray-900">{avgCompletion}%</p>
              </div>
            </div>
            
            <div className="flex items-center text-left rounded-lg bg-gray-50 p-4 border border-gray-100">
              <div className="rounded-md bg-sky-100 p-2.5 text-sky-600">
                <Clock size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-500">Learning Hours</p>
                <p className="text-xl font-bold text-gray-900">{learningHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance vs Planned */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 flex flex-col h-full">
          <h3 className="text-md font-bold text-gray-900 mb-6">Audit Reports: Planned vs Performed</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Planned" fill="#c084fc" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Performed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. DOCUMENT INSIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Interactive Chart */}
        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Documents by Status</h3>
          <p className="text-sm text-gray-500 mb-6">Click on a slice to view those documents.</p>
          
          <div className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={onPieEnter}
                    className="cursor-pointer outline-none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name] || '#9ca3af'}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [value, name.replace('_', ' ')]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No documents found.
              </div>
            )}
          </div>

          {/* Custom Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {chartData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] || '#9ca3af' }}></span>
                {entry.name.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
