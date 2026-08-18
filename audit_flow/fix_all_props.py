import re
import os

files = [
    'src/components/FieldworkFindingView.tsx',
    'src/components/CaatAnalyticsView.tsx',
    'src/components/AdminConsoleView.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Remove interface definitions
    content = re.sub(r'interface\s+[A-Za-z]+Props\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # Remove props from export default function ComponentName({ ... }: ComponentNameProps) {
    # It might be in the format: export default function FieldworkFindingView({ ... }: FieldworkFindingViewProps) {
    content = re.sub(r'export default function ([A-Za-z]+)\(\{[^}]*\}\:\s*[A-Za-z]+Props\)\s*\{', r'export default function \1() {', content, flags=re.DOTALL)
    
    with open(file, 'w') as f:
        f.write(content)

# Fix missing useAuditContext in OrgStructureView.tsx
with open('src/components/OrgStructureView.tsx', 'r') as f:
    org_content = f.read()

if 'useAuditContext' not in org_content:
    org_content = org_content.replace("import React from 'react';", "import React from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")
    with open('src/components/OrgStructureView.tsx', 'w') as f:
        f.write(org_content)

