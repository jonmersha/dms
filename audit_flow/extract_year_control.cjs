const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

const yearControlMatch = content.match(/\{\/\* Annual Assessment Control Hub \*\/\}([\s\S]*?)<\/div>\n\n\s*\{\/\* Control & Configuration Parameters \*\/\}/);
if (!yearControlMatch) {
  console.log("Could not find Annual Assessment Control Hub");
  process.exit(1);
}

const yearControlCode = yearControlMatch[1] + "</div>\n";

// Remove it from the Matrix sub-tab
content = content.replace(yearControlCode, "");
content = content.replace(/\{\/\* Annual Assessment Control Hub \*\/\}/, "");

// Place it right after the header, before the sub-tabs
content = content.replace(
  /\{\/\* Main Tab bar \*\/\}/,
  "{/* Annual Assessment Control Hub */}\n      " + yearControlCode + "\n\n      {/* Main Tab bar */}"
);

fs.writeFileSync(file, content, 'utf8');
console.log("Extracted Year Control Hub");
