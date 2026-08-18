import re

for file in ['src/components/OrgStructureView.tsx', 'src/components/FieldworkFindingView.tsx']:
    with open(file, 'r') as f:
        content = f.read()

    # ensure import exists exactly once
    content = re.sub(r'import \{ useAuditContext \} from "\.\./context/AuditContext";\n?', '', content)
    content = content.replace("import React,", "import React,\nimport { useAuditContext } from \"../context/AuditContext\";")
    content = content.replace("import React from", "import React from\nimport { useAuditContext } from \"../context/AuditContext\";")
    content = re.sub(r"import React,\nimport", r"import React,\nimport", content) # wait, I can just do:
    
    # Let's just insert it after the first import statement
    content = re.sub(r'^(import [^;]+;)', r'\1\nimport { useAuditContext } from "../context/AuditContext";', content, count=1)

    # remove all instances of the destructured hook
    # then insert exactly one after export default function
    
    destruct = r'  const \{[^\}]+\} = useAuditContext\(\);\n'
    content = re.sub(destruct, '', content)
    
    # The hooks needed for each
    if 'OrgStructureView' in file:
        hook = '  const { users, setUsers: onUpdateUsers, engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();'
    else:
        hook = '  const { engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();'
        
    content = re.sub(r'(export default function [A-Za-z]+\(\)\s*\{)', r'\1\n' + hook + '\n', content)

    with open(file, 'w') as f:
        f.write(content)
