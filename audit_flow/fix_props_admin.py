import re

with open('src/components/AdminConsoleView.tsx', 'r') as f:
    content = f.read()

# Replace <UniversePlanView ... /> with <UniversePlanView defaultTab="..." hideTabsSelection={true} /> if they exist
content = re.sub(
    r'<UniversePlanView\s+universe=\{universe\}[\s\S]*?defaultTab="([^"]+)"\s+hideTabsSelection=\{true\}\s*/>',
    r'<UniversePlanView defaultTab="\1" hideTabsSelection={true} />',
    content
)

# Same for RiskAssessmentView
content = re.sub(
    r'<RiskAssessmentView\s+universe=\{universe\}[\s\S]*?targetModule="([^"]+)"\s*/>',
    r'<RiskAssessmentView targetModule="\1" />',
    content
)

with open('src/components/AdminConsoleView.tsx', 'w') as f:
    f.write(content)
