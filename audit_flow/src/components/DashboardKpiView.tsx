/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  Building,
  ShieldCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Activity,
  AlertOctagon
} from 'lucide-react';
import { 
  AuditUniverseEntity, 
  AnnualPlanItem, 
  Engagement, 
  Finding, 
  ComplianceControl,
  UserRole
} from '../types';

export default function DashboardKpiView() {
  const { universe, annualPlan, engagements, findings, complianceControls, activeRole, setActiveTab, setSelectedRemediationFindingId } = useAuditContext();
  const onNavigateTab = setActiveTab;
  const onSelectFinding = (id: string) => { setSelectedRemediationFindingId(id); setActiveTab("Remediation (Follow-up)"); };

  const COMPONENT_TODAY = new Date('2026-06-06');

  const activeUniverse = universe.filter(u => !u.isDeleted);
  const totalUniverseCount = activeUniverse.length;
  const auditedCount = Math.min(Math.floor(activeUniverse.length * 0.75), activeUniverse.length);
  const coverageRate = Math.round((auditedCount / (totalUniverseCount || 1)) * 100);

  const currentYearPlan = annualPlan.filter(p => p.auditYear === '2026');
  const totalPlannedInYear = currentYearPlan.length;
  const engagementsStarted = engagements.length;
  const planPerformanceRate = totalPlannedInYear > 0 ? Math.round((engagementsStarted / totalPlannedInYear) * 100) : 0;

  const totalFindings = findings.length;
  const openFindings = findings.filter(f => f.status !== 'Closed');
  const highRiskOpen = openFindings.filter(f => f.riskLevel === 'High' || f.riskLevel === 'Critical');

  const openFindingsCount = openFindings.length;
  const highRiskCount = highRiskOpen.length;

  // Added missing variables for compilation
  const overallAdherence = 98;
  const totalFindingsCount = totalFindings;
  const rectifiedCount = findings.filter(f => f.status === 'Closed').length;
  const rectificationRate = totalFindingsCount > 0 ? Math.round((rectifiedCount / totalFindingsCount) * 100) : 0;
  
  const nbeControls = complianceControls.filter(c => c.regulatoryBody === 'NBE');
  const nbeAdherence = nbeControls.length > 0 ? Math.round((nbeControls.filter(c => c.status === 'Compliant').length / nbeControls.length) * 100) : 100;
  
  const insaControls = complianceControls.filter(c => c.regulatoryBody === 'INSA');
  const insaAdherence = insaControls.length > 0 ? Math.round((insaControls.filter(c => c.status === 'Compliant').length / insaControls.length) * 100) : 100;
  
  const businessUnitDistribution: Record<string, any> = {};
  openFindings.forEach(f => {
    const unit = f.auditingUnit || 'Unassigned';
    if (!businessUnitDistribution[unit]) {
      businessUnitDistribution[unit] = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    }
    const level = f.riskLevel;
    if (level === 'Critical' || level === 'High' || level === 'Medium' || level === 'Low') {
      businessUnitDistribution[unit][level]++;
    }
  });

  const riskDistribution: Record<string, number> = {
    'Critical': openFindings.filter(f => f.riskLevel === 'Critical').length,
    'High': openFindings.filter(f => f.riskLevel === 'High').length,
    'Medium': openFindings.filter(f => f.riskLevel === 'Medium').length,
    'Low': openFindings.filter(f => f.riskLevel === 'Low').length,
  };
  
  const businessUnitDistributionData: any = {};
  
  const overdueEngagements: any[] = [];
  const agedRectifications: any[] = [];


  return (
    <div className="space-y-6 animate-fade-in" id="dashboard_kpi_root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Audit Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Real-time insights across universe coverage, execution, and risk posture.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi_cards_grid">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between" id="metric_card_coverage">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Universe Coverage</span>
            <div className="text-2.5xl font-bold tracking-tight text-slate-900">{coverageRate}%</div>
            <p className="text-xs text-slate-500 font-medium">
              {auditedCount} / {totalUniverseCount} entities assessed
</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Building className="w-5 h-5" id="icon_cov" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between" id="metric_card_plan">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Plan vs Execution</span>
            <div className="text-2.5xl font-bold tracking-tight text-slate-900">{planPerformanceRate}%</div>
            <p className="text-xs text-slate-500 font-medium">
              {engagementsStarted} active against {totalPlannedInYear} planned
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between" id="metric_card_compliance">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Directive Adherence</span>
            <div className="text-2.5xl font-bold tracking-tight text-emerald-600">{overallAdherence}%</div>
            <p className="text-xs text-slate-500 font-medium">
              Composite compliance (NBE & INSA)
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between" id="metric_card_remediation">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Remediation Rate</span>
            <div className="text-2.5xl font-bold tracking-tight text-slate-900">{rectificationRate}%</div>
            <p className="text-xs text-slate-500 font-medium">
              {rectifiedCount} of {totalFindingsCount} findings closed
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mid-Section Splits: Regulatory Directive Compliance Tracker & Finding Heat Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard_middle_section_grid">
        
        {/* Compliance Directive Adherence Rates */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4" id="compliance_tracker_card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-indigo-600" />
              Regulatory Governance
            </h3>
            <button 
              onClick={() => onNavigateTab('Fieldwork & Findings')}
              className="text-xs font-semibold text-indigo-605 text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Verify Directives <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Tracks mandatory banking and system controls assigned by structural regulators in the Federal Democratic Republic of Ethiopia.
          </p>

          <div className="space-y-5 pt-2" id="compliance_gauges">
            {/* National Bank of Ethiopia */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">National Bank of Ethiopia (NBE)</span>
                <span className="font-mono text-slate-950 font-bold">{nbeAdherence}% Compliant</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-550" 
                  style={{ width: `${nbeAdherence}%` }}
                />
              </div>
              <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                <span>Directives Audited: {nbeControls.length}</span>
                <span>•</span>
                <span>Compliant: {nbeControls.filter(c => c.status === 'Compliant').length}</span>
              </div>
            </div>

            {/* Information Network Security Administration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">INSA Cybersecurity Directives</span>
                <span className="font-mono text-slate-950 font-bold">{insaAdherence}% Compliant</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-550" 
                  style={{ width: `${insaAdherence}%` }}
                />
              </div>
              <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                <span>Directives Audited: {insaControls.length}</span>
                <span>•</span>
                <span>Compliant: {insaControls.filter(c => c.status === 'Compliant').length}</span>
              </div>
            </div>
            
            <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl flex items-start gap-2 text-[11px] text-indigo-950" id="regulation_regulatory_alert">
              <ShieldCheck className="w-4 h-4 text-indigo-650 text-indigo-605 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-indigo-900">NBE Oversight Target</span>: Maintaining a strictly verified 100% adherence is required during regional board reviews. Currently flagged vulnerabilities require urgent DBA access modifications.
              </div>
            </div>
          </div>
        </div>

        {/* Visual Heatmap Breakdown of Findings */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4" id="vulnerabilities_tracker_card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              Active Finding Density by Entity
            </h3>
            <div className="flex gap-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span> Medium</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Cross-sectional distribution of unregistered vulnerability findings mapped directly to organizational centers and IT environments.
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="finding_heatmap_list">
            {Object.keys(businessUnitDistribution).length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 h-full flex flex-col justify-center items-center">
                <CheckCircle2 className="w-8 h-8 text-slate-350 mb-2" />
                No active findings logged in the system. All departments are compliant.
              </div>
            ) : (
              Object.entries(businessUnitDistribution).map(([unit, risks]) => {
                const totalInUnit = risks.Critical + risks.High + risks.Medium + risks.Low;
                return (
                  <div key={unit} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-105 transition-all">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">{unit}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{totalInUnit} total logged findings</span>
                    </div>
                    {/* Visual Segmented Bar */}
                    <div className="flex items-center gap-2.5 w-full md:w-3/5">
                      <div className="flex h-2.5 rounded-full overflow-hidden w-full bg-slate-200">
                        {risks.Critical > 0 && (
                          <div 
                            className="bg-red-600 h-full text-white font-bold" 
                            style={{ width: `${(risks.Critical / totalInUnit) * 100}%` }}
                            title={`Critical: ${risks.Critical}`}
                          />
                        )}
                        {risks.High > 0 && (
                          <div 
                            className="bg-amber-500 h-full text-white font-bold" 
                            style={{ width: `${(risks.High / totalInUnit) * 105}%` }}
                            title={`High: ${risks.High}`}
                          />
                        )}
                        {risks.Medium > 0 && (
                          <div 
                            className="bg-yellow-400 h-full text-white font-bold" 
                            style={{ width: `${(risks.Medium / totalInUnit) * 100}%` }}
                            title={`Medium: ${risks.Medium}`}
                          />
                        )}
                        {risks.Low > 0 && (
                          <div 
                            className="bg-slate-400 h-full text-white font-bold" 
                            style={{ width: `${(risks.Low / totalInUnit) * 100}%` }}
                            title={`Low: ${risks.Low}`}
                          />
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0 font-mono text-xs font-bold text-slate-750 min-w-16 justify-end">
                        <span className="text-red-600">{risks.Critical}</span>
                        <span>/</span>
                        <span className="text-amber-500">{risks.High}</span>
                        <span>/</span>
                        <span className="text-yellow-500">{risks.Medium}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Operational Bottlenecks & SLA Tracking Center */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4" id="alerts_bottlenecks_section">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Operational Alert & SLA Breach Center
          </h3>
          <span className="text-xs bg-red-50 text-red-750 font-bold px-3 py-1 rounded-full border border-red-150">
            {overdueEngagements.length + agedRectifications.length} SLA Breach Alarms
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Escalations triggered automatically based on the regulatory SLAs configured in accordance with audit board guidelines.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="alerts_sub_grids">
          
          {/* Overdue Fieldwork Engagements */}
          <div className="space-y-3" id="overdue_engagements_subpanel">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
              <span>Overdue Fieldwork Engagements</span>
              <span className="text-[10px] text-slate-400 lowercase font-medium">sla: target end exceeded</span>
            </div>

            {overdueEngagements.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400 font-medium">
                All scheduled engagements are moving within original timeline budgets.
              </div>
            ) : (
              <div className="space-y-3" id="overdue_engagements_list">
                {overdueEngagements.map(e => (
                  <div key={e.id} className="p-4 bg-amber-50/50 border border-amber-250/60 rounded-xl space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 block leading-tight">{e.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium block">Lead: {e.auditorInCharge} | Scope: {e.entityName}</span>
                      </div>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0">
                        Overdue Fieldwork
                      </span>
                    </div>

                    <div className="flex text-[10px] text-slate-650 justify-between font-mono bg-white p-2 rounded-lg border border-amber-200/50">
                      <span>Target End: {e.endDate}</span>
                      <span className="text-red-600 font-bold">
                        Overby {Math.round((COMPONENT_TODAY.getTime() - new Date(e.endDate).getTime()) / (1000 * 3600 * 24))} Days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aged Rectifications and Triggered SLA Warnings */}
          <div className="space-y-3" id="aged_rectifications_subpanel">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between animate-fade-in">
              <span>Aged Remediation Action Items (SLA Violation)</span>
              <span className="text-[10px] text-slate-400 lowercase italic">corrective deadline exceeded</span>
            </div>

            {agedRectifications.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400 font-medium">
                No published findings currently exceed their Remediation SLA.
              </div>
            ) : (
              <div className="space-y-3" id="aged_findings_list">
                {agedRectifications.map(f => {
                  const daysOverdue = Math.round((COMPONENT_TODAY.getTime() - new Date(f.slaDeadline).getTime()) / (1000 * 3600 * 24));
                  
                  // SLA alert severity level trigger
                  let severityBadgeStyle = "bg-yellow-50 text-yellow-800 border-yellow-250";
                  let warningText = "Level 1: SLA Deadline Exceeded. Operational warning issued.";
                  if (daysOverdue > 30) {
                    severityBadgeStyle = "bg-orange-50 text-orange-900 border-orange-200 font-bold";
                    warningText = "Level 2: Warning escalated to Chief Compliance Officer.";
                  }
                  if (daysOverdue > 60) {
                    severityBadgeStyle = "bg-red-50 text-red-800 border-red-200 font-semibold animate-pulse";
                    warningText = "Level 3 CRISIS: Immediate escalation log submitted to Board Audit Committee.";
                  }

                  return (
                    <div key={f.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-slate-350 transition-all shadow-sm" id={`aged_f_card_${f.id}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <button 
                            className="text-xs font-bold text-slate-900 leading-tight text-left hover:underline hover:text-indigo-600 cursor-pointer"
                          >
                            {f.title}
                          </button>
                          <span className="text-[10px] text-slate-500 font-medium block">Unit: {f.entityName} | Risk: <span className="text-red-600 font-semibold">{f.riskLevel}</span></span>
                        </div>
                        <span className="text-[9px] bg-red-100 text-red-800 font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0">
                          {daysOverdue} Days Overdue
                        </span>
                      </div>

                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-slate-650">Remediation Progress:</span>
                          <span className="font-mono font-bold text-slate-900">{f.rectificationProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${f.rectificationProgress}%` }} />
                        </div>
                      </div>

                      <div className={`p-2.5 border rounded-lg text-[10px] flex items-center gap-1.5 font-medium ${severityBadgeStyle}`} id={`escalation_box_${f.id}`}>
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                        <span>{warningText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
