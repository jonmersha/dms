import fs from 'fs';
const dbFile = fs.readFileSync('audit_flow/server/db.js', 'utf8');

const getArray = (name) => {
  const match = dbFile.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  if (match) {
    try {
      // Very hacky but fast way to evaluate the array
      return eval(match[1]);
    } catch(e) {
      console.log("Error evaluating " + name, e.message);
    }
  }
  return [];
}

const data = {
  users: getArray('seedUsers'),
  universe: getArray('seedUniverse'),
  plans: getArray('seedPlans'),
  engagements: getArray('seedEngagements'),
  findings: getArray('seedFindings')
};

fs.writeFileSync('seed_data.json', JSON.stringify(data, null, 2));
console.log("Extracted seed data to seed_data.json");
