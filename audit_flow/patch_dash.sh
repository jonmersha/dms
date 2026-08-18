#!/bin/bash
sed -i 's/import {/import { useAuditContext } from "..\/context\/AuditContext";\nimport {/' src/components/DashboardKpiView.tsx

# Replace props interface and functional component definition
sed -i '/interface DashboardKpiViewProps {/,/} /d' src/components/DashboardKpiView.tsx
sed -i 's/export default function DashboardKpiView({.*$/export default function DashboardKpiView() {/' src/components/DashboardKpiView.tsx
sed -i 's/}: DashboardKpiViewProps) {//' src/components/DashboardKpiView.tsx
# In case it is broken into multiple lines like:
sed -i '/universe,/d' src/components/DashboardKpiView.tsx
sed -i '/annualPlan,/d' src/components/DashboardKpiView.tsx
sed -i '/engagements,/d' src/components/DashboardKpiView.tsx
sed -i '/findings,/d' src/components/DashboardKpiView.tsx
sed -i '/complianceControls,/d' src/components/DashboardKpiView.tsx
sed -i '/activeRole,/d' src/components/DashboardKpiView.tsx
sed -i '/onNavigateTab,/d' src/components/DashboardKpiView.tsx
sed -i '/onSelectFinding/d' src/components/DashboardKpiView.tsx
sed -i 's/}: DashboardKpiViewProps) {//' src/components/DashboardKpiView.tsx

# Add the context hook
sed -i '/export default function DashboardKpiView() {/a\
  const { universe, annualPlan, engagements, findings, complianceControls, activeRole, setActiveTab, setSelectedRemediationFindingId } = useAuditContext();\
  const onNavigateTab = setActiveTab;\
  const onSelectFinding = (id: string) => { setSelectedRemediationFindingId(id); setActiveTab("Remediation (Follow-up)"); };\
' src/components/DashboardKpiView.tsx

