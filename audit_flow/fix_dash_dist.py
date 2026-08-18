import re

with open('src/components/DashboardKpiView.tsx', 'r') as f:
    content = f.read()

replacement = """  const businessUnitDistribution: Record<string, any> = {};
  openFindings.forEach(f => {
    const unit = f.auditingUnit || 'Unassigned';
    if (!businessUnitDistribution[unit]) {
      businessUnitDistribution[unit] = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    }
    const level = f.riskLevel;
    if (level === 'Critical' || level === 'High' || level === 'Medium' || level === 'Low') {
      businessUnitDistribution[unit][level]++;
    }
  });

  const riskDistribution = {
    'Critical': openFindings.filter(f => f.riskLevel === 'Critical').length,
    'High': openFindings.filter(f => f.riskLevel === 'High').length,
    'Medium': openFindings.filter(f => f.riskLevel === 'Medium').length,
    'Low': openFindings.filter(f => f.riskLevel === 'Low').length,
  };
"""

content = re.sub(r"const businessUnitDistribution = \{.*?\}\s*\};\s*openFindings\.forEach\(f => \{\s*// Fake distribution for compilation\s*\}\);.*?const riskDistribution = \{.*?\};", replacement, content, flags=re.DOTALL)

with open('src/components/DashboardKpiView.tsx', 'w') as f:
    f.write(content)
