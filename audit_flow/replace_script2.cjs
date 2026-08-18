const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/UniversePlanView.tsx');

let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /Checklist template Name \& Overview/g, replace: 'Checklist Template Name & Overview' },
  { search: /Provide a Checklist template name/gi, replace: 'Please provide a Checklist Template name' },
  { search: /Attached Checklist Template \(Checklist\)/g, replace: 'Attached Checklist Template' },
  { search: /Created Category Template/g, replace: 'Created Checklist Template' },
  { search: /Modified Category Checklist template/g, replace: 'Modified Checklist Template' },
  { search: /Deleted Category Template/g, replace: 'Deleted Checklist Template' },
  { search: /Category Checklist Template/g, replace: 'Checklist Template' },
  { search: /Checklist template being/g, replace: 'Checklist Template being' },
  { search: /Checklist Templates tab container/g, replace: 'Checklist Template tab container' },
  { search: /1\. General Checklist Templates/g, replace: '1. General Checklist Template' },
  { search: /New Custom Category Checklist Template/g, replace: 'New Custom Checklist Template' },
  { search: /Category Templates/g, replace: 'Checklist Templates' },
  { search: /Category Template/g, replace: 'Checklist Template' },
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Final replacements complete');
