import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

def repl(m):
    tag = m.group(1)
    if tag in ['DashboardKpiView', 'UniversePlanView', 'RiskAssessmentView', 'EngagementView', 'OrgStructureView', 'FieldworkFindingView', 'RemediationView', 'CaatAnalyticsView', 'ImmutableLogView', 'AdminConsoleView']:
        props = ""
        tm_match = re.search(r'targetModule="([^"]+)"', m.group(0))
        if tm_match:
            props += f' targetModule="{tm_match.group(1)}"'
        
        dt_match = re.search(r'defaultTab="([^"]+)"', m.group(0))
        if dt_match:
            props += f' defaultTab="{dt_match.group(1)}"'
            
        hts_match = re.search(r'hideTabsSelection=\{([^}]+)\}', m.group(0))
        if hts_match:
            props += f' hideTabsSelection={{{hts_match.group(1)}}}'

        return f"<{tag}{props} />"
    return m.group(0)

content = re.sub(r'<([A-Z][a-zA-Z0-9]+View)[\s\S]*?/>', repl, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

