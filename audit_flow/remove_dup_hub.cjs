const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

let occurrences = 0;
content = content.replace(/\{\/\* Annual Assessment Control Hub \*\/\}[\s\S]*?\{\/\* Dynamic Unit register button \*\/\}[\s\S]*?<\/button>\n            <\/div>\n          <\/div>\n/g, (match) => {
  occurrences++;
  if (occurrences === 2) {
    return "";
  }
  return match;
});

fs.writeFileSync(file, content, 'utf8');
console.log("Removed duplicate hub, found " + occurrences + " total");
