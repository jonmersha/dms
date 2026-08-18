const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide Main Tab bar entirely if we are using targetModule since it separates them.
// Or just hide specific buttons.
content = content.replace(
  /<div className="flex border border-slate-200 justify-between items-center bg-white p-3 rounded-xl shadow-xs" id="sub_tabs_bar">/g,
  "{!targetModule && <div className=\"flex border border-slate-200 justify-between items-center bg-white p-3 rounded-xl shadow-xs\" id=\"sub_tabs_bar\">}"
);

content = content.replace(
  /            Annual Work Plan calendar \(\{annualPlan.length\}\)\n          <\/button>\n        <\/div>\n      <\/div>/g,
  "            Annual Work Plan calendar ({annualPlan.length})\n          </button>\n        </div>\n      </div>}"
);

content = content.replace(
  /Audit Risk Assessment & Annual Work Plan/,
  "{targetModule === 'AnnualPlan' ? 'Annual Work Plan' : (targetModule === 'RiskAssessment' ? 'Audit Risk Assessment' : 'Audit Risk Assessment & Annual Work Plan')}"
);

fs.writeFileSync(file, content, 'utf8');
