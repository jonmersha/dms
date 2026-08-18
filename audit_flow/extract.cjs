const fs = require('fs');
const file = 'src/components/RiskAssessmentView.tsx';
let content = fs.readFileSync(file, 'utf8');

const match = content.match(/(\{\/\* Annual Assessment Control Hub \*\/\}[\s\S]*?)(\{\/\* Dynamic Unit register button \*\/\}|<!-- Dynamic Unit)/);
if (match) {
  let toExtract = match[1];
  
  // Clean up the `w-full lg:w-auto` div that was left unclosed if we just rip out this part
  toExtract = toExtract + "</div></div>"; // closing the two divs opened before "Dynamic Unit register button"

  // Remove the extracted part from original (except we need to keep the opening divs for the Dynamic unit register button!
  
  // Actually, wait. Let's do it cleaner.
}
