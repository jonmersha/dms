import re

with open('src/components/UniversePlanView.tsx', 'r') as f:
    content = f.read()

# I want to insert `import { useAuditContext } from "../context/AuditContext";`
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

# Now I need to find the `interface UniversePlanViewProps` and replace it
replacement = """interface UniversePlanViewProps {
  defaultTab?: 'Registry' | 'Templates';
  hideTabsSelection?: boolean;
}

export default function UniversePlanView({
  defaultTab = 'Registry',
  hideTabsSelection = false
}: UniversePlanViewProps) {
  const { universe, setUniverse: onUpdateUniverse, annualPlan, setAnnualPlan: onUpdateAnnualPlan, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();
"""

# RegEx replacement
content = re.sub(r'interface UniversePlanViewProps \{.*?}: UniversePlanViewProps\) {', replacement, content, flags=re.DOTALL)

with open('src/components/UniversePlanView.tsx', 'w') as f:
    f.write(content)
