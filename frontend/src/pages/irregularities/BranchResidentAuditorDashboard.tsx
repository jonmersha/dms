import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { ShieldAlert, ListChecks, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface FindingStats {
  total: number;
  open: number;
  closed: number;
  overdue: number;
}

export function BranchResidentAuditorDashboard() {
  const [stats, setStats] = useState<FindingStats>({ total: 0, open: 0, closed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/irregularities/resident-findings/');
      const findings = response.data;
      
      const total = findings.length;
      const closed = findings.filter((f: any) => f.status === 'CLOSED').length;
      const overdue = findings.filter((f: any) => f.status === 'OVERDUE').length;
      const open = total - closed;

      setStats({ total, open, closed, overdue });
    } catch (error) {
      console.error('Failed to fetch findings stats', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Branch Resident Auditor Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor branch operations, track irregularities, and manage continuous assurance workflows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border-l-4 border-blue-500">
          <dt className="truncate text-sm font-medium text-gray-500">Total Findings</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {loading ? <Loader2 className="animate-spin h-6 w-6 text-gray-400" /> : stats.total}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border-l-4 border-yellow-500">
          <dt className="truncate text-sm font-medium text-gray-500">Open Findings</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {loading ? <Loader2 className="animate-spin h-6 w-6 text-gray-400" /> : stats.open}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border-l-4 border-red-500">
          <dt className="truncate text-sm font-medium text-gray-500">Overdue Action</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {loading ? <Loader2 className="animate-spin h-6 w-6 text-gray-400" /> : stats.overdue}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border-l-4 border-green-500">
          <dt className="truncate text-sm font-medium text-gray-500">Verified & Closed</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {loading ? <Loader2 className="animate-spin h-6 w-6 text-gray-400" /> : stats.closed}
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <ListChecks size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Findings Registry</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            View, track, and manage all branch irregularities. Update finding statuses, upload evidence, and monitor remediation efforts.
          </p>
          <Link 
            to="/irregularities/resident-audit/findings" 
            className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors w-full"
          >
            Go to Findings Registry
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Reporting & Analytics (Coming Soon)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Generate executive reports, analyze recurring control failures, and identify trends across branch operations.
          </p>
          <button 
            disabled
            className="inline-flex items-center justify-center rounded-md bg-indigo-300 px-4 py-2 text-sm font-medium text-white w-full cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
