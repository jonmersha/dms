const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{!targetModule && <div className="flex border border-slate-200 justify-between items-center bg-white p-3 rounded-xl shadow-xs" id="sub_tabs_bar">}/g,
  "{targetModule !== 'AnnualPlan' && <div className=\"flex border border-slate-200 justify-between items-center bg-white p-3 rounded-xl shadow-xs\" id=\"sub_tabs_bar\">}"
);

content = content.replace(
  /<button\n\s*onClick=\{\(\) => setActiveSubTab\('Plan'\)\}/g,
  "{targetModule !== 'RiskAssessment' && <button\n            onClick={() => setActiveSubTab('Plan')}"
);

content = content.replace(
  /Annual Work Plan calendar \(\{annualPlan.length\}\)\n          <\/button>/g,
  "Annual Work Plan calendar ({annualPlan.length})\n          </button>}"
);

fs.writeFileSync(file, content, 'utf8');
