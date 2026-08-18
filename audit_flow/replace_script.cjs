const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/UniversePlanView.tsx');

let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /Category Templates Spec/gi, replace: 'Checklist Templates' },
  { search: /Template Specifications/gi, replace: 'Checklist Templates' },
  { search: /Template specification/gi, replace: 'Checklist template' },
  { search: /Template Spec/gi, replace: 'Checklist Template' },
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete');
