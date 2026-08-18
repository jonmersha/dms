with open('src/components/DashboardKpiView.tsx', 'r') as f:
    content = f.read()

target = """  const businessUnitDistribution = {
    'Corporate Audit': 0,
    'Branch Audit': 0,
    'IT Audit': 0,
    'IFB Audit': 0
  };
  openFindings.forEach(f => {
    // Fake distribution for compilation
  });

  const riskDistribution = {
    'Critical': openFindings.filter(f => f.riskLevel === 'Critical').length,
    'High': openFindings.filter(f => f.riskLevel === 'High').length,
    'Medium': openFindings.filter(f => f.riskLevel === 'Medium').length,
    'Low': openFindings.filter(f => f.riskLevel === 'Low').length,
  };"""

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

  const riskDistribution: Record<string, number> = {
    'Critical': openFindings.filter(f => f.riskLevel === 'Critical').length,
    'High': openFindings.filter(f => f.riskLevel === 'High').length,
    'Medium': openFindings.filter(f => f.riskLevel === 'Medium').length,
    'Low': openFindings.filter(f => f.riskLevel === 'Low').length,
  };"""

content = content.replace(target, replacement)

with open('src/components/DashboardKpiView.tsx', 'w') as f:
    f.write(content)
