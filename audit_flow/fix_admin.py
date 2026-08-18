import re

with open('src/components/AdminConsoleView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
content = content.replace("import React from 'react';", "import React from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

replacement = """export default function AdminConsoleView() {
  const { 
    users, setUsers: onUpdateUsers, 
    universe, setUniverse: onUpdateUniverse, 
    annualPlan, setAnnualPlan: onUpdateAnnualPlan, 
    engagements, setEngagements: onUpdateEngagements, 
    findings, setFindings: onUpdateFindings, 
    complianceControls, setComplianceControls: onUpdateComplianceControls, 
    handleLogSystemAction: onLogAction, 
    activeRole, 
    setActiveTab
  } = useAuditContext();
  const onExitConsole = () => setActiveTab('Dashboard & KPIs');
"""

content = re.sub(r'interface AdminConsoleViewProps \{.*?\n}\n\nexport default function AdminConsoleView\(\{.*?\}\: AdminConsoleViewProps\) \{', replacement, content, flags=re.DOTALL)

with open('src/components/AdminConsoleView.tsx', 'w') as f:
    f.write(content)
