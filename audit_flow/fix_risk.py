import re

with open('src/components/RiskAssessmentView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useAuditContext } from \"../context/AuditContext\";")

replacement = """interface RiskAssessmentViewProps {
  targetModule?: 'RiskAssessment' | 'AnnualPlan';
}

export interface RiskFactor {
  id: string;
  name: string;
  category: 'Impact' | 'Likelihood';
  weight: number; // percentage (typically 0-100)
  description: string;
  applicableCategories?: string[]; // Empty or contains specific universe categories. If empty, applies to ALL.
}

export interface RiskLevelConfig {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  bgColor: string;
  textColor: string;
}

export default function RiskAssessmentView({
  targetModule
}: RiskAssessmentViewProps) {
  const { universe, setUniverse: onUpdateUniverse, annualPlan, setAnnualPlan: onUpdateAnnualPlan, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();
"""

content = re.sub(r'interface RiskAssessmentViewProps \{.*?}: RiskAssessmentViewProps\) {', replacement, content, flags=re.DOTALL)

with open('src/components/RiskAssessmentView.tsx', 'w') as f:
    f.write(content)
