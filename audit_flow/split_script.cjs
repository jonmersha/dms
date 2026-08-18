const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onLogAction: \(action: string, details: string\) => void;\n}/g,
  "onLogAction: (action: string, details: string) => void;\n  targetModule?: 'RiskAssessment' | 'AnnualPlan';\n}"
);

content = content.replace(
  /onLogAction\n}: RiskAssessmentViewProps\)/g,
  "onLogAction,\n  targetModule\n}: RiskAssessmentViewProps)"
);

content = content.replace(
  /const \[activeSubTab, setActiveSubTab\] = useState\<'Matrix' \| 'Setup' \| 'Plan'\>\('Matrix'\);/g,
  "const [activeSubTab, setActiveSubTab] = useState<'Matrix' | 'Setup' | 'Plan'>(targetModule === 'AnnualPlan' ? 'Plan' : 'Matrix');\n  \n  useEffect(() => {\n    setActiveSubTab(targetModule === 'AnnualPlan' ? 'Plan' : 'Matrix');\n  }, [targetModule]);"
);

fs.writeFileSync(file, content, 'utf8');
