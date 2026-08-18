const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{targetModule !== 'AnnualPlan' && <div className="flex border border-slate-200 justify-between items-center bg-white p-3 rounded-xl shadow-xs" id="sub_tabs_bar">}\n/g,
  "{targetModule !== 'AnnualPlan' && (\n  <div className=\"flex border border-slate-200 justify-between items-center bg-white p-3 rounded-xl shadow-xs\" id=\"sub_tabs_bar\">\n"
);

content = content.replace(
  /            Annual Work Plan calendar \(\{annualPlan.length\}\)\n          <\/button>}\n        <\/div>\n      <\/div>}/g,
  "            Annual Work Plan calendar ({annualPlan.length})\n          </button>}\n        </div>\n      </div>\n)}"
);

fs.writeFileSync(file, content, 'utf8');
