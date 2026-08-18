/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  CheckSquare, 
  Clock, 
  FileCheck, 
  FileWarning, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Upload,
  UserCheck,
  CheckCircle2,
  Trash2,
  Coins
} from 'lucide-react';
import { 
  Finding, 
  UserRole,
  WorkingPaper
} from '../types';

export default function RemediationView() {
  const { findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();

  
  // Current Local Time simulation constraint: 2026-06-06T09:03:13Z
  const SYSTEM_DATE = new Date('2026-06-06');

  // Filter findings based on published visibility constraint
  const visibleFindings = findings.filter(
    f => activeRole === 'Auditee' ? f.isSentToAuditees : true
  );

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    visibleFindings.length > 0 ? visibleFindings[0].id : null
  );

  const fnd = visibleFindings.find(f => f.id === selectedFindingId);

  // Form states
  const [mgmtResponseText, setMgmtResponseText] = useState('');
  const [actionPlanText, setActionPlanText] = useState('');
  const [completeDate, setCompleteDate] = useState('');
  const [progressVal, setProgressVal] = useState(0);

  // Submit Management Response (Auditee action)
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnd || !mgmtResponseText.trim()) return;

    const updated = findings.map(f => {
      if (f.id === fnd.id) {
        return {
          ...f,
          auditeeResponse: mgmtResponseText
        };
      }
      return f;
    });

    onUpdateFindings(updated);
    setMgmtResponseText('');
    onLogAction('Management Response Submission', `Auditee logged formal response on finding #${fnd.id}`);
    alert("Management Response submitted and logged successfully.");
  };

  // Team Leader accepts & permanently locks description
  const handleLockResponse = () => {
    if (!fnd) return;
    
    const updated = findings.map(f => {
      if (f.id === fnd.id) {
        return {
          ...f,
          isAcceptedByAuditor: true
        };
      }
      return f;
    });

    onUpdateFindings(updated);
    onLogAction('Response Acceptance', `Marked management response on finding #${fnd.id} as Accepted. Finding description locked.`);
    alert("Management Response accepted! Finding description permanently locked to maintain compliance integrity.");
  };

  // Submit targeted corrective action plan
  const handleSubmitActionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnd || !actionPlanText.trim() || !completeDate) return;

    const updated = findings.map(f => {
      if (f.id === fnd.id) {
        return {
          ...f,
          targetedActionPlan: actionPlanText,
          expectedCompletionDate: completeDate
        };
      }
      return f;
    });

    onUpdateFindings(updated);
    setActionPlanText('');
    setCompleteDate('');
    onLogAction('Corrective Action Formulation', `Formulated action plan for finding #${fnd.id} targeting completion on ${completeDate}`);
    alert("Corrective Action Plan registered!");
  };

  // Update rectification stats & upload proof document
  const [proofFileName, setProofFileName] = useState('');
  const handleUploadRectificationProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnd) return;

    const nameToUpload = proofFileName.trim() || "Compliance_Rectification_Log.pdf";
    const proofDoc: WorkingPaper = {
      id: `doc-rect-${Date.now()}`,
      name: nameToUpload,
      size: "450 KB",
      uploadedBy: activeRole === 'Auditee' ? 'Mekonnen Tadesse' : 'Aster Bekele',
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    const updated = findings.map(f => {
      if (f.id === fnd.id) {
        return {
          ...f,
          rectificationProgress: progressVal,
          evidenceFiles: [...f.evidenceFiles, proofDoc]
        };
      }
      return f;
    });

    onUpdateFindings(updated);
    setProofFileName('');
    onLogAction('Remediation Updates', `Updated progress on finding #${fnd.id} to ${progressVal}%. Linked verification document: ${nameToUpload}`);
    alert("Rectification parameters updated. Verification evidence uploaded.");
  };

  // Follow-up Auditor validation approval - US-5.05
  const handleValidateRectification = (status: 'Fully Rectified' | 'Partially Rectified' | 'Unrectified') => {
    if (!fnd) return;
    
    const updated = findings.map(f => {
      if (f.id === fnd.id) {
        return {
          ...f,
          rectificationValidationStatus: status,
          rectificationProgress: status === 'Fully Rectified' ? 100 : f.rectificationProgress
        };
      }
      return f;
    });

    onUpdateFindings(updated);
    onLogAction('Remediation Audit Validation', `Updated status on finding #${fnd.id} to compliance rating: ${status}`);
    alert(`Success! Finding validated and updated to compliance status: "${status}"`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-800" id="remediation_view_main">
      
      {/* Left Column: List of findings to remediate */}
      <div className="lg:col-span-4 space-y-4" id="remediation_left_pane">
        
        <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Remediation Action Center</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Select publications to address management responses or verify rectifications.</p>
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1" id="remediation_items_list">
          {visibleFindings.map(f => (
            <div
              key={f.id}
              onClick={() => {
                setSelectedFindingId(f.id);
                setProgressVal(f.rectificationProgress);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedFindingId === f.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 hover:border-indigo-150 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 leading-none py-0.5 rounded ${
                  selectedFindingId === f.id 
                    ? 'bg-slate-800 text-slate-100' 
                    : 'bg-slate-50 border border-slate-150 text-slate-805'
                }`}>
                  {f.id}
                </span>

                {/* Integration validations status */}
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                  f.rectificationValidationStatus === 'Fully Rectified' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' :
                  f.rectificationValidationStatus === 'Partially Rectified' ? 'bg-amber-50 text-amber-800 border border-amber-250' :
                  'bg-red-50 text-red-800 border border-red-200 animate-pulse'
                }`}>
                  {f.rectificationValidationStatus}
                </span>
              </div>

              <h4 className="text-xs font-bold leading-tight line-clamp-2">{f.title}</h4>
              <p className={`text-[10px] mt-2 block ${selectedFindingId === f.id ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
                Unit: {f.entityName}
              </p>

              {/* Progress Slider bar mini */}
              <div className="space-y-1.5 mt-3" id={`mini_prog_${f.id}`}>
                <div className="flex justify-between text-[9px] font-mono leading-none">
                  <span className="font-bold">Rectification Progress:</span>
                  <span className="font-bold">{f.rectificationProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedFindingId === f.id ? 'bg-indigo-400' : 'bg-indigo-605 bg-indigo-600'
                  }`} style={{ width: `${f.rectificationProgress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SLA Escalation guidelines - US-5.06 */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3" id="sla_info_box">
          <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
            Remediation SLAs Guidelines
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            Enterprise policy configures automatic alarms based on days past SLA Deadline:
          </p>
          <div className="space-y-1.5 text-[10px] font-mono text-slate-600">
            <div className="flex justify-between border-b border-slate-200 pb-1 font-bold">
              <span>SLA Overdue Days</span>
              <span>Escalation Action</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>&gt; 0 Days Overdue</span>
              <span className="text-amber-805">L1: Unit Manager Warned</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>&gt; 30 Days Overdue</span>
              <span className="text-orange-600 font-bold">L2: Exec VP Notified</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>&gt; 60 Days Overdue</span>
              <span className="text-red-750 font-semibold">L3: Board Audit Dispatch</span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Interactive Audit collaborative workspace */}
      <div className="lg:col-span-8 flex flex-col space-y-5" id="remediation_right_pane">
        {fnd ? (
          <div className="bg-white rounded-xl border border-slate-205 shadow-sm p-6 space-y-6" id="remediation_details_dashboard">
            
            {/* Header outline */}
            <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-slate-50 border border-slate-150 text-slate-700 px-2.5 py-0.5 rounded font-bold">
                  Remediation Collaborative Workspace
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2 leading-tight">{fnd.title}</h2>
                <span className="text-xs text-slate-500 mt-1 block font-medium">Vulnerability Source: <strong className="text-slate-805 font-bold">{fnd.entityName}</strong> | SLA Deadline: <strong className="text-red-750 font-mono font-extrabold">{fnd.slaDeadline}</strong></span>
              </div>

              {/* Status Lock Indicator */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shrink-0 flex items-center gap-2">
                {fnd.isAcceptedByAuditor ? (
                  <>
                    <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-[10px] text-slate-650">
                      <span className="block font-bold text-slate-800">Vulnerability profile locked</span>
                      <span className="block text-slate-450 font-mono font-semibold">Response Accepted</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="text-[10px] text-slate-650">
                      <span className="block font-bold text-slate-800">Profile Under Discussion</span>
                      <span className="block text-slate-450 font-mono font-semibold">Comments editable</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Original Anomaly Specifications */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5" id="original_specifications">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Logged Exceptions</span>
              <p className="text-xs text-slate-655 font-sans leading-relaxed font-medium">{fnd.description}</p>
              
              <div className="flex gap-4 text-[10px] font-mono text-slate-500" id="financial_relevance">
                <span className="flex items-center gap-0.5 font-bold text-red-700">Expected Loss: <Coins className="w-3.5 h-3.5 text-red-500" /> {fnd.lossFigures.toLocaleString()} ETB</span>
                <span>•</span>
                <span className="font-semibold">Standard Checklist Criteria: <strong className="text-slate-700 font-sans font-bold">{fnd.criteria}</strong></span>
              </div>
            </div>

            {/* SECTION A: Management Response Formulation - US-5.01 & US-5.02 */}
            <div className="space-y-4" id="section_management_response">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <FileWarning className="w-4 h-4 text-indigo-650" />
                Management Justification & Audit Endorsement
              </h4>

              {fnd.auditeeResponse ? (
                <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Official Auditee Feedback:</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Lock: {fnd.isAcceptedByAuditor ? 'Cryptographic Signed' : 'Under Review'}</span>
                  </div>
                  <p className="text-xs italic text-slate-655 bg-white p-3 border border-slate-150 rounded-lg leading-relaxed whitespace-pre-wrap font-medium">{fnd.auditeeResponse}</p>

                  {!fnd.isAcceptedByAuditor && (activeRole === 'Team Leader' || activeRole === 'Admin') && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleLockResponse}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-indigo-100" />
                        Accept & Lock Response
                      </button>
                    </div>
                  )}
                </div>
              ) : activeRole === 'Auditee' ? (
                <form onSubmit={handleSubmitResponse} className="space-y-3" id="response_form">
                  <label className="block text-xs font-bold text-slate-650">Formulate formal management feedback and remediation justification:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide explanatory context and specify any internal limitations..."
                    value={mgmtResponseText}
                    onChange={e => setMgmtResponseText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-650 font-semibold placeholder:text-slate-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                    >
                      Submit Response
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-xs italic text-slate-400 border border-dashed border-slate-200 rounded-xl py-6 text-center bg-slate-50/20 font-medium">
                  Awaiting formal response and justifications from Auditee Operations.
                </div>
              )}
            </div>

            {/* SECTION B: Corrective Action Plan Formulation - US-5.03 */}
            {fnd.isAcceptedByAuditor && (
              <div className="space-y-4 border-t border-dashed border-slate-200 pt-4" id="section_corrective_action">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-650" />
                  Targeted Corrective Action Plan
                </h4>

                {fnd.targetedActionPlan ? (
                  <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-b border-slate-200 pb-2.5">
                      <div className="font-bold text-slate-700">
                        Target Completion: <span className="font-extrabold text-slate-950 font-sans">{fnd.expectedCompletionDate}</span>
                      </div>
                      <div className="text-slate-500 text-left md:text-right font-bold">
                        Status: <span className="font-extrabold uppercase text-indigo-600 font-sans ml-1">Milestone Set</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">Details of Correction Steps:</span>
                      <p className="text-xs text-slate-655 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-semibold">{fnd.targetedActionPlan}</p>
                    </div>
                  </div>
                ) : activeRole === 'Auditee' ? (
                  <form onSubmit={handleSubmitActionPlan} className="space-y-3" id="action_plan_form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650">Describe Specific Remediation Roadmap Measures:</label>
                        <textarea
                          required
                          rows={2}
                          value={actionPlanText}
                          onChange={e => setActionPlanText(e.target.value)}
                          placeholder="e.g. Recalibrate tolerances inside core parameters, isolate default profiles..."
                          className="mt-1 w-full bg-white border border-slate-200 p-3 rounded-lg text-xs focus:outline-none focus:border-indigo-650 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-650">Target Completion Date</label>
                        <input
                          type="date"
                          required
                          value={completeDate}
                          onChange={e => setCompleteDate(e.target.value)}
                          className="mt-1 w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-655 font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        Register Corrective Milestone
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-xs text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/20 font-medium">
                    Corrective Milestone scheduling pending from Auditee operational departments.
                  </div>
                )}
              </div>
            )}

            {/* SECTION C: Progress Updates & Evidence Upload - US-5.04 */}
            {fnd.targetedActionPlan && (
              <div className="space-y-4 border-t border-dashed border-slate-200 pt-4" id="section_progress_evidence">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-655" />
                  Rectification Audits Evidence & Uploads
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Progress Controller */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>Update Rectification Metric Progress</span>
                      <span className="font-mono text-indigo-700 font-extrabold text-sm bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">{progressVal}%</span>
                    </div>

                    {activeRole === 'Auditee' && fnd.rectificationValidationStatus !== 'Fully Rectified' ? (
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={progressVal}
                          onChange={e => setProgressVal(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                          <span>0% (Plan set)</span>
                          <span>50% (Testing)</span>
                          <span>100% (Verifiable)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200/60 border border-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${fnd.rectificationProgress}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-405 italic mt-1 block font-semibold">Locked to verified value: {fnd.rectificationProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Proof file uploader */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-slate-705 block">Link Core Verification Evidence</span>
                    
                    {activeRole === 'Auditee' && fnd.rectificationValidationStatus !== 'Fully Rectified' ? (
                      <form onSubmit={handleUploadRectificationProof} className="space-y-2" id="proof_upload_form">
                        <input
                          type="text"
                          placeholder="Evidence label e.g., DBA_Rules_AuditTrail.pdf"
                          required
                          value={proofFileName}
                          onChange={e => setProofFileName(e.target.value)}
                          className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 w-full rounded-md font-semibold"
                        />
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold py-2 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Link Evidence & Commit Update
                        </button>
                      </form>
                    ) : (
                      <div className="text-[10px] text-slate-450 italic font-semibold py-4 text-center">
                        Viewing proof registers. Field edits disabled for this stage.
                      </div>
                    )}
                  </div>
                </div>

                {/* Listing uploads proof documents */}
                <div className="space-y-1.5 pt-2" id="uploads_proof_list">
                  <span className="text-[11px] font-bold text-slate-650 block">Audit Proof Registrations:</span>
                  {fnd.evidenceFiles.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic font-semibold">No verification documents uploaded.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2" id="proof_doc_grid">
                      {fnd.evidenceFiles.map(doc => (
                        <div key={doc.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-indigo-200 transition-colors">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 block truncate max-w-44">{doc.name}</span>
                              <span className="text-[9px] text-slate-400 block font-mono font-bold">{doc.uploadedBy} | Size: {doc.size}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION D: Follow-up Auditor Validation Approval - US-5.05 */}
            {fnd.evidenceFiles.length > 0 && (activeRole === 'Auditor' || activeRole === 'Team Leader' || activeRole === 'Admin') && (
              <div className="space-y-4 border-t border-dashed border-slate-200 pt-4 bg-slate-50 p-4 border border-slate-200 rounded-xl" id="section_followup_auditor">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  Follow-up Auditor Validation Panel
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Analyze the uploaded verification evidence (regulatory certificates, technical rulesets prints) before validating.
                </p>

                <div className="grid grid-cols-3 gap-2" id="validation_status_triggers">
                  <button
                    onClick={() => handleValidateRectification('Fully Rectified')}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold py-2 rounded-lg text-[10px] md:text-xs cursor-pointer transition-colors"
                  >
                    Approve Fully Rectified
                  </button>
                  <button
                    onClick={() => handleValidateRectification('Partially Rectified')}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-extrabold py-2 rounded-lg text-[10px] md:text-xs cursor-pointer transition-colors"
                  >
                    Accept Partially Rectified
                  </button>
                  <button
                    onClick={() => handleValidateRectification('Unrectified')}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-extrabold py-2 rounded-lg text-[10px] md:text-xs cursor-pointer transition-colors"
                  >
                    Reject Evidence
                  </button>
                </div>
              </div>
            )}

            {/* SECTION E: SLA Reminders log - US-5.06 */}
            <div className="border-t border-dashed border-slate-200 pt-4 space-y-3" id="remediation_escalations_panel">
              <span className="text-[11px] font-bold text-slate-500 block">Triggered SLA Reminders Logs:</span>
              
              {/* Check if find has aged overdue logs */}
              {new Date(fnd.slaDeadline) < SYSTEM_DATE && fnd.rectificationValidationStatus !== 'Fully Rectified' ? (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl space-y-2 text-[11px] text-red-955 hover:border-red-300 transition-colors">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1 uppercase tracking-wider text-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Remediation SLA Breach Alert
                    </span>
                    <span className="text-[9px] bg-red-100 text-red-805 px-2 py-0.5 rounded font-mono font-semibold border border-red-200">CRITICAL</span>
                  </div>
                  <p className="leading-snug font-medium">
                    SLA limit <span className="font-bold underline">{fnd.slaDeadline}</span> exceeded under metadata baseline 2026-06-06. The following system-wide warnings were automatically logged in reference:
                  </p>
                  
                  <div className="space-y-1 bg-white/70 p-2 rounded border border-slate-200 text-[10px] font-mono text-slate-600">
                    <div>[2026-05-01]: Level 1 email alert submitted dispatcher to auditee Operations.</div>
                    {Math.round((SYSTEM_DATE.getTime() - new Date(fnd.slaDeadline).getTime()) / (1000 * 3600 * 24)) > 30 && (
                      <div className="text-orange-700 font-bold">[2026-05-31]: Level 2 warning log submitted to Chief Executive Officer.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] italic text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg py-5 text-center font-medium">
                  Compliance SLA intact. No active escalation alarms triggered.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-xl max-w-full text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-200 mb-2" />
            <h3 className="text-slate-600 font-bold text-sm">Remediation Completed</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 font-medium">Select an item from the sidebar to inspect active findings. All items match compliance guidelines.</p>
          </div>
        )}
      </div>

    </div>
  );
}
