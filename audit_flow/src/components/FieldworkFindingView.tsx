import React, { useState, useRef } from "react";
import { useAuditContext } from "../context/AuditContext";
import { useAuditContext } from "../context/AuditContext";
import { useAuditContext } from "../context/AuditContext";
import { 
  FileText, 
  Upload, 
  AlertOctagon, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Download, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  Coins, 
  CheckSquare, 
  CornerDownRight, 
  ClipboardCheck,
  ChevronDown,
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  Finding, 
  Engagement, 
  UserRole,
  WorkingPaper
} from '../types';



// Preset standard checklists to streamline audit execution
const STANDARDIZED_CHECKLISTS = [
  {
    category: 'IT General Controls (ITGC)',
    checks: [
      { id: 'chk-1', title: 'DBA Admin Separation', description: 'Confirm that system DBAs do not possess system-wide operational ledger capabilities.', defaultCriteria: 'INSA Information Security Directive Art 14.2' },
      { id: 'chk-2', title: 'Cryptographic Volume Protection', description: 'Verify database backups are encrypted at-rest using AES-256 standards.', defaultCriteria: 'INSA Data Encryption Standard Section 9' },
      { id: 'chk-3', title: 'Password Expiry Limits', description: 'Ensure passwords require complexity of 14 characters and rotate quarterly.', defaultCriteria: 'INSA/CYBER/09/2022 Directive controls' }
    ]
  },
  {
    category: 'Branch Operations Vault Controls',
    checks: [
      { id: 'chk-4', title: 'Dual physical vault locks', description: 'Validate that branch vault keys are divided between Branch Manager and Operation Head.', defaultCriteria: 'NBE Branch Cash Management Directive Section 3' },
      { id: 'chk-5', title: 'Aged Ledger Balances Reconcile', description: 'Check that suspenses are cleared daily and unresolved balances flagged within 48 hours.', defaultCriteria: 'NBE Accounting Code of Conduct standard' }
    ]
  }
];

export default function FieldworkFindingView() {
  const { engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();


  
  // Active selected engagement
  const [activeEngId, setActiveEngId] = useState<string>(engagements.length > 0 ? engagements[0].id : '');
  const activeEng = engagements.find(e => e.id === activeEngId);

  // Active Audit checklist category
  const [activeChecklistCategory, setActiveChecklistCategory] = useState(STANDARDIZED_CHECKLISTS[0].category);

  // Drag & drop dragover states
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Offline Simulation State
  const [isOffline, setIsOffline] = useState(false);
  const [offlinePendingFindings, setOfflinePendingFindings] = useState<Finding[]>([]);

  // Finding Registration Modal state
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [newFinding, setNewFinding] = useState({
    title: '',
    description: '',
    criteria: '',
    rootCause: '',
    impact: '',
    lossFigures: 0,
    recommendations: '',
    riskLevel: 'High' as 'Critical' | 'High' | 'Medium' | 'Low',
    isSentToAuditees: false,
    slaDeadline: '2026-07-15'
  });

  // Checklist responses state to map pass/fail
  const [chkResponses, setChkResponses] = useState<Record<string, 'PASS' | 'FAIL'>>({});

  const handleSetCheckResponse = (id: string, status: 'PASS' | 'FAIL', title: string, criteria: string) => {
    setChkResponses(prev => ({ ...prev, [id]: status }));
    
    if (status === 'FAIL') {
      // Auto pre-populate finding modal for failed controls to streamline audit
      setNewFinding({
        title: `Vulnerability: Unresolved ${title}`,
        description: `During physical/logical evaluations, audit teams confirmed a gap matching ${title}. Detailed evaluations under WBS indicate compliance deviation.`,
        criteria,
        rootCause: 'Weak process alignment, lacking routine diagnostic audits.',
        impact: 'Exposure to customer data leaks, transaction integrity compromises, or regulatory penalties.',
        lossFigures: 150000,
        recommendations: 'Establish automated monitors. Restructure permission parameters or physical keys distribution to enforce guidelines.',
        riskLevel: 'High',
        isSentToAuditees: false,
        slaDeadline: '2026-07-15'
      });
      setShowFindingModal(true);
      alert(`Vulnerability detected! Predetermined criteria from "${title}" pre-loaded to finding registry.`);
    }
  };

  // Drag & Drop File Upload handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!activeEng) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      uploadWorkingPaperFiles(files);
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      uploadWorkingPaperFiles(files);
    }
  };

  // Simulation upload file to the first active task of chosen engagement
  const uploadWorkingPaperFiles = (files: File[]) => {
    if (!activeEng) return;
    
    const paperName = files[0].name;
    const paperSize = `${(files[0].size / 1024).toFixed(0)} KB`;

    const newPaper: WorkingPaper = {
      id: `doc-${Date.now()}`,
      name: paperName,
      size: paperSize,
      uploadedBy: 'Selamawit Demeke',
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    // Upload to the first task
    const updatedEngagements = engagements.map(item => {
      if (item.id === activeEng.id) {
        const revisedWbs = [...item.wbs];
        if (revisedWbs.length > 0) {
          revisedWbs[0].workingPapers = [...revisedWbs[0].workingPapers, newPaper];
        }
        return { ...item, wbs: revisedWbs };
      }
      return item;
    });

    onUpdateEngagements(updatedEngagements);
    alert(`File "${paperName}" uploaded and linked into active testing WBS Procedures.`);
    onLogAction('Working Paper Upload', `Linked working paper "${paperName}" to engagement #${activeEng.id}`);
  };

  // Submit Finding Registry Form
  const handleSubmitFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEng) return;

    if (newFinding.riskLevel === 'Critical') {
      alert("CRITICAL RISK ESCALATION DETECTED: System logged a real-time priority escalation event report dispatching to Board Members!");
    }

    const created: Finding = {
      id: `fnd-${Date.now().toString().slice(-3)}`,
      engagementId: activeEng.id,
      engagementTitle: activeEng.title,
      entityName: activeEng.entityName,
      title: newFinding.title,
      description: newFinding.description,
      criteria: newFinding.criteria,
      rootCause: newFinding.rootCause,
      impact: newFinding.impact,
      lossFigures: newFinding.lossFigures,
      recommendations: newFinding.recommendations,
      riskLevel: newFinding.riskLevel,
      isSentToAuditees: newFinding.isSentToAuditees,
      creationDate: new Date().toISOString().split('T')[0],
      rectificationProgress: 0,
      rectificationValidationStatus: 'Unrectified',
      evidenceFiles: [],
      escalationLevel: 0,
      slaDeadline: newFinding.slaDeadline
    };

    if (isOffline) {
      setOfflinePendingFindings([...offlinePendingFindings, created]);
      alert("System running in OFFLINE mode. Finding registered securely inside browser cache storage. Push synchronization when reconnected!");
    } else {
      onUpdateFindings([...findings, created]);
      onLogAction('Finding Registration', `Recorded finding "${created.title}" with risk index ${created.riskLevel}. Published output: ${created.isSentToAuditees}`);
    }

    setShowFindingModal(false);
    // Reset form
    setNewFinding({
      title: '',
      description: '',
      criteria: '',
      rootCause: '',
      impact: '',
      lossFigures: 0,
      recommendations: '',
      riskLevel: 'High',
      isSentToAuditees: false,
      slaDeadline: '2026-07-15'
    });
  };

  // Publish switch toggle
  const handleTogglePublish = (id: string, currentVal: boolean) => {
    if (activeRole !== 'Team Leader' && activeRole !== 'Admin') {
      alert("Action Restricted. Toggle publishing is limited strictly to Auditor-in-Charge or Chief Internal Auditor.");
      return;
    }
    const updated = findings.map(f => {
      if (f.id === id) {
        const newVal = !currentVal;
        onLogAction('Finding Publication State', `Vulnerability #${id} isSentToAuditees toggle updated to: ${newVal}`);
        return { ...f, isSentToAuditees: newVal };
      }
      return f;
    });
    onUpdateFindings(updated);
  };

  // CSV download for remote fieldwork simulation
  const handleDownloadProgram = () => {
    if (!activeEng) return;
    const programData = activeEng.wbs.map(w => ({
      ID: w.id,
      Procedure: w.title,
      Assignee: w.assignee,
      Deadline: w.endDate,
      Status: w.status
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(programData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `AuditProgram_${activeEng.id}_OfflineView.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onLogAction('Program Download', `Downloaded offline program file for Engagement #${activeEng.id}`);
    alert("Audit program compiled. File saved locally in mobile device format. You may now operate offline.");
  };

  // Offline syncing
  const handleSynchronizeRecords = () => {
    if (offlinePendingFindings.length === 0) {
      alert("Core server database is already synchronized. No pending items discovered.");
      return;
    }

    const merged = [...findings, ...offlinePendingFindings];
    onUpdateFindings(merged);
    onLogAction('Database Sync', `Merged ${offlinePendingFindings.length} offline findings into core enterprise registers.`);
    alert(`Success! Cryptographic syncing complete. ${offlinePendingFindings.length} remote fieldwork findings merged.`);
    setOfflinePendingFindings([]);
  };

  const filteredFindings = findings.filter(f => f.engagementId === activeEngId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-700 font-sans" id="fieldwork_main_wrapper">
      
      {/* Selector and Left Sidebar for execution controls */}
      <div className="lg:col-span-4 space-y-5" id="fieldwork_left_pane">
        
        {/* Engagement Context dropdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-xs space-y-3">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Operational Engagement Scope</label>
          <select
            value={activeEngId}
            onChange={e => setActiveEngId(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
          >
            {engagements.map(e => (
              <option key={e.id} value={e.id}>
                {e.id}: {e.entityName}
              </option>
            ))}
          </select>
        </div>

        {/* Offline Mobile Sync simulator panel - US-4.06 */}
        <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-xs space-y-3" id="synchronizer_unit">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900">Remote Branch Sync (Offline)</span>
            {isOffline ? (
              <span className="flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-250 font-bold font-mono px-2 py-0.5 rounded-md uppercase">
                <WifiOff className="w-3.5 h-3.5" />
                Offline
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] bg-emerald-55 bg-emerald-50 text-emerald-800 border border-emerald-250 font-bold font-mono px-2 py-0.5 rounded-md uppercase">
                <Wifi className="w-3.5 h-3.5" />
                Online
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Download your active audit files prior to traveling to remote bank branches lacking standard telecom networks, then push syncing upon return.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 font-semibold" id="offline_btn_group">
            <button
              onClick={handleDownloadProgram}
              className="flex items-center justify-center gap-1 text-[11px] font-bold bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 py-1.5 rounded-lg cursor-pointer transition-colors"
              title="Download Assigned checklist items"
            >
              <Download className="w-3.5 h-3.5 text-indigo-650" />
              Download Audit
            </button>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 rounded-lg cursor-pointer transition-colors ${
                isOffline 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-500' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isOffline ? 'Go Online' : 'Go Offline'}
            </button>
          </div>

          {offlinePendingFindings.length > 0 && (
            <div className="bg-red-50/50 p-3 rounded-lg border border-red-200 space-y-2 text-xs" id="pendings_alerts">
              <div className="flex justify-between text-red-955 font-bold">
                <span>Cached Findings Pending:</span>
                <span>{offlinePendingFindings.length} issues</span>
              </div>
              <button
                onClick={handleSynchronizeRecords}
                className="w-full bg-indigo-650 text-white py-1.5 hover:bg-indigo-700 font-bold rounded-lg text-[10px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                Synchronize Registry
              </button>
            </div>
          )}
        </div>

        {/* PDF / Digital Working paper Uploader - Drag and drop */}
        <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-xs space-y-3" id="papers_uploader_unit">
          <span className="text-xs font-bold text-slate-900 block">Upload Supporting Digital Working Papers</span>
          <p className="text-[11px] text-slate-400 leading-snug font-medium">Drag and drop verified ledger screens, operational audit trails, or exceptions reports backing your findings.</p>
          
          <div
            onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
              isDraggingOver 
                ? 'border-indigo-600 bg-slate-50' 
                : 'border-slate-200 hover:border-indigo-550 hover:border-indigo-150-and-indigo-60 bg-white'
            }`}
            id="drag_drop_sensor"
          >
            <Upload className="w-7 h-7 text-indigo-500 mb-2" />
            <span className="text-xs font-bold text-slate-700">Drag files here or click to browse</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Supports Excel, PDF, Docx up to 10MB</span>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleManualFileSelect}
              className="hidden"
              accept=".pdf,.xlsx,.csv,.docx,.png,.jpg"
            />
          </div>
        </div>

      </div>

      {/* Main Execution Board (Checklists & Pre-Loaded Findings register) */}
      <div className="lg:col-span-8 flex flex-col space-y-5" id="fieldwork_right_pane">
        
        {/* Dynamic Checklist Execution Frame */}
        <div className="bg-white rounded-xl border border-slate-205 shadow-sm p-6 space-y-4" id="standardized_checklists_block">
          <div className="flex border-b border-slate-100 justify-between items-center pb-3 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-indigo-650" />
              Standardized Auditor Procedures Checklists
            </h3>
            
            <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs overflow-hidden" id="checklist_toggles text-[10px]">
              {STANDARDIZED_CHECKLISTS.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setActiveChecklistCategory(cat.category)}
                  className={`px-3 py-1 font-bold text-[10px] roundedtransition-all cursor-pointer ${
                    activeChecklistCategory === cat.category 
                      ? 'bg-indigo-600 text-white shadow-xs rounded-md' 
                      : 'text-slate-550'
                  }`}
                >
                  {cat.category === 'IT General Controls (ITGC)' ? 'ITGC Framework' : 'Branch Ops'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3" id="checklist_items_container">
            {STANDARDIZED_CHECKLISTS.find(cat => cat.category === activeChecklistCategory)?.checks.map(check => {
              const res = chkResponses[check.id];
              return (
                <div key={check.id} className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3" id={`chk_card_${check.id}`}>
                  <div className="space-y-1 md:w-3/4">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">{check.defaultCriteria}</span>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">{check.title}</h5>
                    <p className="text-[11px] text-slate-550 font-medium">{check.description}</p>
                  </div>

                  <div className="flex gap-1.5 shrink-0" id={`chk_btn_actions_${check.id}`}>
                    <button
                      onClick={() => handleSetCheckResponse(check.id, 'PASS', check.title, check.defaultCriteria)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-colors ${
                        res === 'PASS' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-250 font-extrabold' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Verify Pass
                    </button>
                    <button
                      onClick={() => handleSetCheckResponse(check.id, 'FAIL', check.title, check.defaultCriteria)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-colors ${
                        res === 'FAIL' 
                          ? 'bg-red-50 text-red-800 border-red-200 font-extrabold animate-pulse' 
                          : 'bg-white text-slate-650 hover:bg-slate-50 hover:border-red-250 border-slate-200'
                      }`}
                    >
                      Flag Fail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setShowFindingModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-4.5 h-4.5" />
              Log Manual Finding
            </button>
          </div>
        </div>

        {/* Active findings log for current engagement scope - US-4.04 */}
        <div className="bg-white rounded-xl border border-slate-205 shadow-sm p-6 space-y-4" id="engagement_findings_log">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-905">Verification findings Registry ({filteredFindings.length})</h3>
              <p className="text-[11px] text-slate-400 font-medium">Issues logged under active testing loop.</p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono tracking-wide font-bold">
              Engagement target: {activeEngId}
            </span>
          </div>

          <div className="space-y-3" id="scoped_findings_list">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 flex flex-col items-center justify-center bg-slate-50/50">
                <CheckCircle className="w-8 h-8 text-slate-300 mb-2" />
                No anomalies registered. Scope is currently marked compliant.
              </div>
            ) : (
              filteredFindings.map(f => (
                <div key={f.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs hover:border-slate-350 transition-all" id={`fnd_card_${f.id}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] bg-slate-50 border border-slate-150 font-mono text-slate-500 p-1 px-1.5 rounded leading-none font-bold">
                          {f.id}
                        </span>
                        
                        {f.riskLevel === 'Critical' ? (
                          <span className="text-[9px] bg-red-100 text-red-800 font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-200 animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-red-800" />
                            CRITICAL RISK
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-50 text-amber-850 font-bold px-1.5 py-0.5 rounded border border-amber-205">
                            {f.riskLevel} severity
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-mono italic font-semibold">
                          Registered: {f.creationDate}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">{f.title}</h4>
                    </div>

                    {/* Published Toggle - US-4.04 */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1 rounded-lg shrink-0" id={`publish_box_${f.id}`}>
                      {f.isSentToAuditees ? (
                        <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 font-mono pl-1.5 shrink-0">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 font-mono pl-1.5 shrink-0">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          Draft (Internal)
                        </span>
                      )}

                      {(activeRole === 'Team Leader' || activeRole === 'Admin') && (
                        <button
                          onClick={() => handleTogglePublish(f.id, f.isSentToAuditees)}
                          className="text-[10px] font-extrabold bg-indigo-600 text-white rounded px-2.5 py-1 hover:bg-indigo-700 cursor-pointer transition-colors scale-90"
                        >
                          Toggle
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-655 leading-relaxed font-sans font-medium">{f.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg font-mono text-slate-550 border border-slate-150" id={`findings_details_grid_${f.id}`}>
                    <div className="font-medium">
                      Criteria: <span className="text-slate-800 font-bold font-sans">{f.criteria}</span>
                    </div>
                    <div className="font-medium">
                      Root Cause: <span className="text-slate-805 font-sans font-bold">{f.rootCause}</span>
                    </div>
                    <div className="font-medium">
                      Financial loss: <span className="text-red-700 font-extrabold flex items-center gap-0.5"><Coins className="w-3.5 h-3.5 shrink-0" /> {f.lossFigures.toLocaleString()} ETB</span>
                    </div>
                    <div className="font-medium">
                      Remediation SLA: <span className="text-slate-850 font-bold">{f.slaDeadline}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Detailed Registration Modal Overlay */}
      {showFindingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="finding_entry_modal">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950">Vulnerability Finding Registration</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Define criteria compliance breaches and technical remediation recommendations.</p>
              </div>
              <button
                onClick={() => setShowFindingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold border border-slate-200 rounded px-2 py-1 leading-none cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitFinding} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold" id="register_finding_form">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Finding title</label>
                <input
                  type="text"
                  required
                  placeholder="Definite outline of vulnerability"
                  value={newFinding.title}
                  onChange={e => setNewFinding({...newFinding, title: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Vulnerability Risk Rating</label>
                <select
                  value={newFinding.riskLevel}
                  onChange={e => setNewFinding({...newFinding, riskLevel: e.target.value as any})}
                  className="mt-1 block w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600"
                >
                  <option value="Critical">Critical (Immediate manual Board escalation)</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Complexity Status</option>
                  <option value="Low">Low Technical Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">SLA Rectification Deadline</label>
                <input
                  type="date"
                  value={newFinding.slaDeadline}
                  onChange={e => setNewFinding({...newFinding, slaDeadline: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Exception / Anomaly Description (Condition)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed outline of observed operational exceptions..."
                  value={newFinding.description}
                  onChange={e => setNewFinding({...newFinding, description: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Regulatory / Security Criteria (Criteria)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NBE Foreign Exch. Directive Art 12"
                  value={newFinding.criteria}
                  onChange={e => setNewFinding({...newFinding, criteria: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Calculated Financial Loss (ETB)</label>
                <input
                  type="number"
                  placeholder="0 if non-financial"
                  value={newFinding.lossFigures}
                  onChange={e => setNewFinding({...newFinding, lossFigures: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-bold">Identified Root Cause (Cause)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What organizational or systemic gap permitted this anomaly to manifest?"
                  value={newFinding.rootCause}
                  onChange={e => setNewFinding({...newFinding, rootCause: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-bold">Consequence / Impact (Consequence)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What is the business impact, security risk, or financial consequence of this finding?"
                  value={newFinding.impact}
                  onChange={e => setNewFinding({...newFinding, impact: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Remediation Recommendations (Recommendation)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specific physical or systematic actions required by auditee..."
                  value={newFinding.recommendations}
                  onChange={e => setNewFinding({...newFinding, recommendations: e.target.value})}
                  className="mt-1 block w-full bg-white border border-slate-205 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg" id="publish_in_advance_wrapper">
                <input
                  type="checkbox"
                  id="pub_check"
                  checked={newFinding.isSentToAuditees}
                  onChange={e => setNewFinding({...newFinding, isSentToAuditees: e.target.checked})}
                  className="accent-indigo-600 w-4 h-4 shrink-0"
                />
                <label htmlFor="pub_check" className="text-slate-650 cursor-pointer font-medium text-[11px]">
                  Publish finding immediately to Auditee dashboard panel (Uncheck to save as internal draft).
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-dashed border-slate-250" id="entry_form_actions">
                <button
                  type="button"
                  onClick={() => setShowFindingModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  Confirm & Log Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
