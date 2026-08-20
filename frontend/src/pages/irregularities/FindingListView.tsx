import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { Search, Plus, Filter, ArrowLeft, Loader2, AlertTriangle, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

interface Finding {
  id: number;
  referenceNumber: string;
  auditArea: string;
  dateIdentified: string;
  riskImpact: string;
  status: string;
  branchName: string;
  targetDate: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  'DRAFT': 'bg-gray-100 text-gray-800',
  'REPORTED': 'bg-blue-100 text-blue-800',
  'RESPONSE_REQUIRED': 'bg-yellow-100 text-yellow-800',
  'ACTION_PLAN_SUBMITTED': 'bg-indigo-100 text-indigo-800',
  'UNDER_RECTIFICATION': 'bg-purple-100 text-purple-800',
  'EVIDENCE_SUBMITTED': 'bg-sky-100 text-sky-800',
  'PENDING_VERIFICATION': 'bg-orange-100 text-orange-800',
  'CLOSED': 'bg-green-100 text-green-800',
  'RETURNED': 'bg-red-100 text-red-800',
  'OVERDUE': 'bg-red-600 text-white',
  'ESCALATED': 'bg-slate-800 text-white',
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export function FindingListView() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/irregularities/resident-findings/');
      setFindings(response.data);
    } catch (error) {
      console.error('Failed to fetch findings', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFindings = findings.filter(finding => 
    finding.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finding.auditArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finding.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/irregularities/resident-audit" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            Findings Registry
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all Branch Resident Auditor findings.
          </p>
        </div>
        <Link
          to="/irregularities/resident-audit/findings/new"
          className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
        >
          <Plus size={20} />
          Record Finding
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ref, branch, or area..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audit Area</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Identified</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Impact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{finding.referenceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{finding.branchName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{finding.auditArea}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(finding.dateIdentified).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        finding.riskImpact === 'FINANCIAL' || finding.riskImpact === 'FRAUD' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {finding.riskImpact}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[finding.status] || 'bg-gray-100 text-gray-800'}`}>
                        {formatStatus(finding.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/irregularities/resident-audit/findings/${finding.id}`} className="text-purple-600 hover:text-purple-900 font-semibold">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {filteredFindings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No findings found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
