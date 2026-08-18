const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src/components/UniversePlanView.tsx'),
  path.join(__dirname, 'src/components/AdminConsoleView.tsx'),
  path.join(__dirname, 'src/types.ts')
];

const replacements = [
  { search: /category template/gi, replace: 'checklist template' },
  { search: /Category Templates/gi, replace: 'Checklist Templates' },
  { search: /Linked category template/gi, replace: 'Linked checklist template' }
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Final category template replacements complete');
