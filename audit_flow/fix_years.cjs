const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src/components/RiskAssessmentView.tsx'),
  path.join(__dirname, 'src/types.ts'),
  path.join(__dirname, 'server/db.js'),
  path.join(__dirname, 'server/controllers/auditController.js')
];

const replacements = [
  { search: /2026-27/g, replace: '2026' },
  { search: /2025-26/g, replace: '2025' },
  { search: /2027-28/g, replace: '2027' },
  { search: /2028-29/g, replace: '2028' }
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed year storage strings');
