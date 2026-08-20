import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CheckCircle, Clock, FileText, Upload, Download, AlertTriangle, MessageSquare } from 'lucide-react';

export function FindingDetailView() {
  const { id } = useParams<{ id: string }>();
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    fetchFinding();
  }, [id]);

  const fetchFinding = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/irregularities/resident-findings/${id}/`);
      setFinding(res.data);
      if (res.data.managementResponse) {
        setResponse(res.data.managementResponse);
      }
    } catch (error) {
      console.error('Failed to fetch finding details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.post(`/irregularities/resident-findings/${id}/change_status/`, {
        status: newStatus,
        management_response: response
      });
      fetchFinding();
    } catch (error) {
      console.error('Failed to change status', error);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  if (!finding) return <div className="p-12 text-center text-red-500">Finding not found</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/irregularities/resident-audit/findings" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Registry
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{finding.referenceNumber}</h1>
            <p className="text-sm text-gray-500">Branch: {finding.branchName} • Identified: {new Date(finding.dateIdentified).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-200 text-gray-800`}>
              {finding.status}
            </span>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800`}>
              {finding.riskImpact} Risk
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description of Irregularity</h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                {finding.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Audit Area</h4>
                <p className="mt-1 text-sm text-gray-900">{finding.auditArea}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Target Date</h4>
                <p className="mt-1 text-sm text-gray-900">{finding.targetDate ? new Date(finding.targetDate).toLocaleDateString() : 'Not Set'}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Root Cause</h4>
                <p className="mt-1 text-sm text-gray-900">{finding.rootCause || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Required Corrective Action</h4>
                <p className="mt-1 text-sm text-gray-900">{finding.requiredCorrectiveAction}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Management Response
              </h3>
              <textarea
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter management response and action plan..."
                disabled={finding.status === 'CLOSED'}
              />
              {finding.status !== 'CLOSED' && (
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => handleStatusChange('RESPONSE_REQUIRED')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Request Response
                  </button>
                  <button 
                    onClick={() => handleStatusChange('ACTION_PLAN_SUBMITTED')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Submit Response
                  </button>
                  <button 
                    onClick={() => handleStatusChange('EVIDENCE_SUBMITTED')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700"
                  >
                    Submit Evidence
                  </button>
                  <button 
                    onClick={() => handleStatusChange('CLOSED')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Verify & Close
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} />
                Annexures (Evidence)
              </h3>
              {finding.evidences && finding.evidences.length > 0 ? (
                <ul className="space-y-3">
                  {finding.evidences.map((evidence: any) => (
                    <li key={evidence.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm text-sm">
                      <div className="truncate flex-1">
                        <p className="font-medium text-gray-900 truncate" title={evidence.description}>{evidence.description}</p>
                        <p className="text-xs text-gray-500">{evidence.isManagementEvidence ? 'Management Evidence' : 'Audit Evidence'} • {new Date(evidence.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No evidence uploaded yet.</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} />
                Audit Trail
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {finding.audit_trail && finding.audit_trail.map((event: any, idx: number) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {idx !== finding.audit_trail.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-gray-50">
                              <CheckCircle className="h-4 w-4 text-gray-500" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">{event.action}</p>
                              <p className="text-xs text-gray-400 mt-1">by {event.userName}</p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500">
                              <time dateTime={event.timestampStr}>{new Date(event.timestampStr).toLocaleString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
