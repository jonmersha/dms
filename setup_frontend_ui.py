import os

ui_code = """import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { irregularityApiService } from '../../../services/irregularityApiService';
import { auditApiService } from '../../../services/auditApiService';
import type { IrregularityReport } from '../../../types/irregularity';
import type { AuditUniverseEntity } from '../../../types/audit_flow';
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Activity,
  X,
  Save,
  Building,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function IrregularityRegistryView() {
  const { user } = useAuth();
  
  // Data
  const [reports, setReports] = useState<IrregularityReport[]>([]);
  const [branches, setBranches] = useState<AuditUniverseEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState<Partial<IrregularityReport>>({
    caseDescription: '',
    category: 'CASH_SHORTAGE',
    discoveryTime: new Date().toISOString().slice(0, 16),
    responsibleOrgan: '',
    involvedSystem: '',
    amountInvolved: 0,
    recommendedAction: '',
    escalationProcedure: '',
    status: 'PENDING'
  });

  const isAuditor = ['ADMIN', 'CHIEF', 'DIRECTOR', 'TEAM_MANAGER'].includes(user?.role || '');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedReports, universe] = await Promise.all([
        irregularityApiService.getReports(),
        auditApiService.getUniverse()
      ]);
      setReports(fetchedReports || []);
      
      if (universe) {
        setBranches(universe.filter(e => e.entityType === 'BRANCH' || e.entity_type === 'BRANCH' || (e.name && e.name.toLowerCase().includes('branch'))));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.branchId || !formData.caseDescription || !formData.discoveryTime) {
      alert("Please fill all required fields (Branch, Description, Date).");
      return;
    }
    
    try {
      const created = await irregularityApiService.createReport(formData);
      setReports([created, ...reports]);
      setShowAddForm(false);
      
      // Reset form
      setFormData({
        caseDescription: '',
        category: 'CASH_SHORTAGE',
        discoveryTime: new Date().toISOString().slice(0, 16),
        responsibleOrgan: '',
        involvedSystem: '',
        amountInvolved: 0,
        recommendedAction: '',
        escalationProcedure: '',
        status: 'PENDING'
      });
    } catch (e) {
      console.error(e);
      alert("Failed to submit irregularity report.");
    }
  };

  const updateStatus = async (id: number, newStatus: IrregularityReport['status']) => {
    try {
      const updated = await irregularityApiService.updateReport(id, { status: newStatus });
      setReports(reports.map(r => r.id === id ? updated : r));
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const filteredReports = reports.filter(r => {
    const matchSearch = (r.branchName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                       (r.caseDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' ? true : r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalExposure = filteredReports.reduce((sum, r) => sum + (Number(r.amountInvolved) || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-rose-600" />
            Branch Irregularity Registry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAuditor 
              ? "Monitor and gauge high-irregularity branches for audit targeting."
              : "Log and report operational incidents and irregularities at the branch level."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            {showAddForm ? "Cancel" : "Report Irregularity"}
          </button>
        </div>
      </div>

      {/* Analytics KPI Row (Auditor View) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reports</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
            <span className="text-2xl font-bold text-gray-900">{filteredReports.length}</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Exposure</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><DollarSign size={24} /></div>
            <span className="text-2xl font-bold text-gray-900">
              {totalExposure.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Investigations</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
            <span className="text-2xl font-bold text-gray-900">
              {filteredReports.filter(r => r.status === 'PENDING' || r.status === 'INVESTIGATING').length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={24} /></div>
            <span className="text-2xl font-bold text-gray-900">
              {filteredReports.filter(r => r.status === 'RESOLVED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Creation Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-5">Register New Incident / Irregularity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Branch / Location <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.branchId || ''}
                  onChange={e => setFormData({...formData, branchId: Number(e.target.value)})}
                >
                  <option value="">Select Branch...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                >
                  <option value="CASH_SHORTAGE">Cash Shortage</option>
                  <option value="FORGERY">Forgery</option>
                  <option value="THEFT">Theft / Fraud</option>
                  <option value="SYSTEM_GLITCH">System Glitch / IT Failure</option>
                  <option value="PROCESS_VIOLATION">Process Violation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Discovery <span className="text-red-500">*</span></label>
                <input 
                  type="datetime-local" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.discoveryTime}
                  onChange={e => setFormData({...formData, discoveryTime: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Responsible Organ / Person</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Teller, Branch Manager, External"
                  value={formData.responsibleOrgan}
                  onChange={e => setFormData({...formData, responsibleOrgan: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">System Involved</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Core Banking"
                    value={formData.involvedSystem}
                    onChange={e => setFormData({...formData, involvedSystem: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Amount Involved (ETB)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                    value={formData.amountInvolved || ''}
                    onChange={e => setFormData({...formData, amountInvolved: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Case Description <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="Describe what happened..."
                  value={formData.caseDescription}
                  onChange={e => setFormData({...formData, caseDescription: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Recommended Action</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                placeholder="Immediate actions taken or recommended..."
                value={formData.recommendedAction}
                onChange={e => setFormData({...formData, recommendedAction: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Escalation Procedure (If Unresolved)</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                placeholder="Next steps for escalation..."
                value={formData.escalationProcedure}
                onChange={e => setFormData({...formData, escalationProcedure: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save size={18} />
              Submit Report
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search branch or case description..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600">Branch / Location</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Incident Details</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Reported By</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Financial Impact</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                {isAuditor && <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Loading reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No irregularities found matching your criteria.</td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building size={16} /></div>
                        <div>
                          <p className="font-bold text-gray-900">{report.branchName}</p>
                          <p className="text-xs text-gray-500">Resp: {report.responsibleOrgan || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{report.category}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]" title={report.caseDescription}>
                        {report.caseDescription}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(report.discoveryTime).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{report.reportedByName}</p>
                      <p className="text-xs text-gray-500">{new Date(report.createdAt!).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {report.amountInvolved ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md text-xs">
                          ETB {Number(report.amountInvolved).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">No direct impact</span>
                      )}
                      {report.involvedSystem && (
                        <p className="text-[11px] text-gray-500 mt-1 font-medium">{report.involvedSystem}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        report.status === 'ESCALATED' ? 'bg-rose-100 text-rose-800' :
                        report.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    {isAuditor && (
                      <td className="px-6 py-4 text-right">
                        <select
                          className="text-xs font-semibold border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          value={report.status}
                          onChange={(e) => updateStatus(report.id, e.target.value as any)}
                        >
                          <option value="PENDING">Mark Pending</option>
                          <option value="INVESTIGATING">Investigate</option>
                          <option value="ESCALATED">Escalate</option>
                          <option value="RESOLVED">Resolve</option>
                        </select>
                      </td>
                    )}
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
"""

with open('frontend/src/pages/irregularities/IrregularityRegistryView.tsx', 'w') as f:
    f.write(ui_code)
