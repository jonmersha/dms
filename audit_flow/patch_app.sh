#!/bin/bash
cat << 'INNER_EOF' > /tmp/replace.tsx
import { useAuditContext } from './context/AuditContext';

export default function App() {
  const {
    currentUser, setCurrentUser,
    users, setUsers,
    universe, setUniverse,
    annualPlan, setAnnualPlan,
    engagements, setEngagements,
    findings, setFindings,
    complianceControls, setComplianceControls,
    systemLogs, setSystemLogs,
    activeRole, setActiveRole,
    activeTab, setActiveTab,
    selectedRemediationFindingId, setSelectedRemediationFindingId,
    handleLogSystemAction,
    getActiveSsoUser
  } = useAuditContext();

  const activeUser = getActiveSsoUser() || (currentUser || users[0] || {
      id: 'system',
      name: 'Abebe Kebede',
      email: 'akebede@bank.et',
      role: 'Admin',
      department: 'Internal Audit Department',
      active: true,
      title: 'Chief Internal Auditor'
  });
INNER_EOF

# Get line numbers
start_line=$(grep -n "import { apiService }" src/App.tsx | cut -d: -f1)
end_line=$(grep -n "const activeUser = getActiveSsoUser();" src/App.tsx | cut -d: -f1)

if [[ -n "$start_line" && -n "$end_line" ]]; then
  sed -i "${start_line},${end_line}c\\$(cat /tmp/replace.tsx | sed 's/$/\\/')" src/App.tsx
  sed -i 's/\\$//' src/App.tsx
fi
