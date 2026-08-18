import re

with open('src/components/DashboardKpiView.tsx', 'r') as f:
    content = f.read()

# I need to restore the lost logic up to the first metric card.
# I'll create a new start of the file.

new_start = """/**
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
"""

content = re.sub(r'^.*?</p>\s*</div>\s*<div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">\s*<Building className="w-5 h-5" id="icon_cov" />', new_start + '</p>\n          </div>\n          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">\n            <Building className="w-5 h-5" id="icon_cov" />', content, flags=re.DOTALL)

with open('src/components/DashboardKpiView.tsx', 'w') as f:
    f.write(content)
