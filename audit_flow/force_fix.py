import re

files_and_hooks = {
    'src/components/FieldworkFindingView.tsx': '  const { engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();\n',
    'src/components/CaatAnalyticsView.tsx': '  const { activeRole, handleLogSystemAction: onLogAction } = useAuditContext();\n',
    'src/components/AdminConsoleView.tsx': """  const { 
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
  const onExitConsole = () => setActiveTab('Dashboard & KPIs');\n""",
    'src/components/OrgStructureView.tsx': '  const { users, setUsers: onUpdateUsers, engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();\n'
}

for file, hook in files_and_hooks.items():
    with open(file, 'r') as f:
        content = f.read()

    # 1. Clean up interface
    content = re.sub(r'interface\s+[A-Za-z]+ViewProps\s*\{[^}]*\}', '', content)
    content = re.sub(r'interface\s+AdminConsoleProps\s*\{[^}]*\}', '', content)

    # 2. Extract function name and replace signature
    match = re.search(r'export default function ([A-Za-z]+)\(', content)
    if match:
        func_name = match.group(1)
        # Find the end of the signature `) {`
        # Using a regex that replaces everything from `export default function Name(` to `) {`
        pattern = r'export default function ' + func_name + r'\([^)]*\)\s*\{'
        replacement = f'export default function {func_name}() {{\n{hook}'
        content = re.sub(pattern, replacement, content, count=1)
    
    # Check for useAuditContext import
    if 'useAuditContext' not in content:
        content = content.replace("import React", "import { useAuditContext } from \"../context/AuditContext\";\nimport React")

    with open(file, 'w') as f:
        f.write(content)

