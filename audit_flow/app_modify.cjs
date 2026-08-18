const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{ name: 'Risk Assessment & Plan', icon: Sliders \},/,
  "{ name: 'Risk Assessment', icon: Sliders },\n    { name: 'Annual Audit Plan', icon: CalendarDays },"
);

content = content.replace(
  /\{activeTab === 'Risk Assessment & Plan' && \(/g,
  "{activeTab === 'Risk Assessment' && ("
);

content = content.replace(
  /onLogAction=\{handleLogSystemAction\}\n\s*\/>\n\s*\)\}/g,
  "onLogAction={handleLogSystemAction}\n              targetModule=\"RiskAssessment\"\n            />\n          )}\n\n          {activeTab === 'Annual Audit Plan' && (\n            <RiskAssessmentView\n              universe={universe}\n              annualPlan={annualPlan}\n              activeRole={activeRole}\n              onUpdateUniverse={(updated) => setUniverse(updated)}\n              onUpdateAnnualPlan={(updated) => setAnnualPlan(updated)}\n              onLogAction={handleLogSystemAction}\n              targetModule=\"AnnualPlan\"\n            />\n          )}"
);

content = content.replace(
  /import \{ Activity, Building, Sliders, ClipboardCheck, FileCheck, ShieldCheck, BookOpen, Settings, Bell, Search, Menu, LogOut, Code, HelpCircle, Terminal, Moon, Sun, Monitor, Map, Sparkles, User \} from 'lucide-react';/g,
  "import { Activity, Building, Sliders, ClipboardCheck, FileCheck, ShieldCheck, BookOpen, Settings, Bell, Search, Menu, LogOut, Code, HelpCircle, Terminal, Moon, Sun, Monitor, Map, Sparkles, User, CalendarDays } from 'lucide-react';"
);


fs.writeFileSync(file, content, 'utf8');
