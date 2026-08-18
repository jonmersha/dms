import re

with open('src/components/OrgStructureView.tsx', 'r') as f:
    org_content = f.read()

# Fix duplicates in OrgStructureView
org_content = re.sub(r'(  const \{ users, setUsers: onUpdateUsers, engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction \} = useAuditContext\(\);\n)+', r'  const { users, setUsers: onUpdateUsers, engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();\n', org_content)

if 'useAuditContext' not in org_content:
    org_content = org_content.replace("import React,", "import { useAuditContext } from \"../context/AuditContext\";\nimport React,")

with open('src/components/OrgStructureView.tsx', 'w') as f:
    f.write(org_content)

with open('src/components/FieldworkFindingView.tsx', 'r') as f:
    field_content = f.read()

if 'useAuditContext' not in field_content:
    field_content = field_content.replace("import React,", "import { useAuditContext } from \"../context/AuditContext\";\nimport React,")

with open('src/components/FieldworkFindingView.tsx', 'w') as f:
    f.write(field_content)

