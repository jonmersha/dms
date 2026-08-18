import Database from "better-sqlite3";
import path from "path";

const dbFile = path.join(process.cwd(), "audit.db");
export const db = new Database(dbFile);

// Disable SQLite Foreign Keys check to prevent transient referential check errors during concurrent React state syncing
db.pragma("foreign_keys = OFF");

// Create schema tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    password TEXT NOT NULL DEFAULT 'Password123',
    title TEXT,
    category TEXT,
    team TEXT,
    reportsToId TEXT,
    reportsToName TEXT,
    employeeId TEXT,
    subProcess TEXT,
    employmentStatus TEXT,
    qualifications TEXT,
    expertise TEXT,
    contactPhone TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_universe (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    riskScore REAL NOT NULL,
    riskLevel TEXT NOT NULL,
    templateId TEXT
  );

  CREATE TABLE IF NOT EXISTS annual_plan (
    id TEXT PRIMARY KEY,
    auditYear TEXT NOT NULL DEFAULT '2026',
    entityId TEXT NOT NULL,
    entityName TEXT NOT NULL,
    riskLevel TEXT NOT NULL,
    riskScore REAL NOT NULL,
    targetQuarter TEXT NOT NULL,
    targetMonth TEXT NOT NULL,
    assignedResources INTEGER NOT NULL,
    status TEXT NOT NULL,
    approvedBy TEXT,
    approvalDate TEXT,
    FOREIGN KEY(entityId) REFERENCES audit_universe(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS engagements (
    id TEXT PRIMARY KEY,
    planId TEXT NOT NULL,
    title TEXT NOT NULL,
    entityId TEXT NOT NULL,
    entityName TEXT NOT NULL,
    auditorInCharge TEXT NOT NULL,
    teamMembers TEXT NOT NULL, -- JSON stringified array of strings
    status TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    wbs TEXT NOT NULL, -- JSON stringified array of tasks
    engagementLetter TEXT NOT NULL, -- JSON stringified letter object
    assignedSection TEXT,
    assignedTeam TEXT,
    assignedSubTeam TEXT,
    FOREIGN KEY(planId) REFERENCES annual_plan(id) ON DELETE CASCADE,
    FOREIGN KEY(entityId) REFERENCES audit_universe(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    engagementId TEXT NOT NULL,
    engagementTitle TEXT NOT NULL,
    entityName TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria TEXT NOT NULL,
    rootCause TEXT NOT NULL,
    impact TEXT NOT NULL,
    lossFigures REAL NOT NULL,
    recommendations TEXT NOT NULL,
    riskLevel TEXT NOT NULL,
    isSentToAuditees INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    auditeeResponse TEXT,
    isAcceptedByAuditor INTEGER DEFAULT 0, -- 0 or 1
    targetedActionPlan TEXT,
    expectedCompletionDate TEXT,
    rectificationProgress REAL NOT NULL DEFAULT 0,
    rectificationValidationStatus TEXT NOT NULL,
    evidenceFiles TEXT NOT NULL, -- JSON stringified array of files
    creationDate TEXT NOT NULL,
    escalationLevel INTEGER NOT NULL DEFAULT 0,
    slaDeadline TEXT NOT NULL,
    FOREIGN KEY(engagementId) REFERENCES engagements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS compliance_controls (
    id TEXT PRIMARY KEY,
    regulationType TEXT NOT NULL,
    directiveNumber TEXT NOT NULL,
    controlName TEXT NOT NULL,
    assessmentCriteria TEXT NOT NULL,
    status TEXT NOT NULL,
    lastAssessedDate TEXT NOT NULL,
    mappedEntity TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ipAddress TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS org_units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    parentId TEXT,
    headId TEXT,
    headName TEXT,
    employees TEXT,
    positions TEXT,
    roles TEXT,
    responsibilities TEXT
  );

  CREATE TABLE IF NOT EXISTS escalations (
    id TEXT PRIMARY KEY,
    issueType TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sourceUnitId TEXT NOT NULL,
    sourceUnitName TEXT NOT NULL,
    targetUnitId TEXT NOT NULL,
    targetUnitName TEXT NOT NULL,
    status TEXT NOT NULL,
    escalatedById TEXT NOT NULL,
    escalatedByName TEXT NOT NULL,
    escalatedToId TEXT NOT NULL,
    escalatedToName TEXT NOT NULL,
    creationDate TEXT NOT NULL,
    decisionDate TEXT,
    decisionNotes TEXT,
    decisionBy TEXT
  );
`);

// Safe scheme alteration to add password on existing databases
try {
  db.exec("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'Password123'");
  console.log("[VERIFY-AUTO-MIGRATE] Added 'password' column to existing users table.");
} catch (e) {
  // Column already exists, safe to ignore
}

const columnsToAdd = [
  { name: 'title', type: 'TEXT' },
  { name: 'category', type: 'TEXT' },
  { name: 'team', type: 'TEXT' },
  { name: 'reportsToId', type: 'TEXT' },
  { name: 'reportsToName', type: 'TEXT' },
  { name: 'employeeId', type: 'TEXT' },
  { name: 'subProcess', type: 'TEXT' },
  { name: 'employmentStatus', type: 'TEXT' },
  { name: 'qualifications', type: 'TEXT' },
  { name: 'expertise', type: 'TEXT' },
  { name: 'contactPhone', type: 'TEXT' }
];

for (const col of columnsToAdd) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
    console.log(`[VERIFY-AUTO-MIGRATE] Added '${col.name}' column to existing users table.`);
  } catch (e) {
    // Column already exists, safe to ignore
  }
}

try {
  db.exec("ALTER TABLE audit_universe ADD COLUMN templateId TEXT");
  console.log("[VERIFY-AUTO-MIGRATE] Added 'templateId' column to audit_universe table.");
} catch (e) {
  // Column already exists, safe to ignore
}

try {
  db.exec("ALTER TABLE audit_universe ADD COLUMN subcategory TEXT");
  console.log("[VERIFY-AUTO-MIGRATE] Added 'subcategory' column to audit_universe table.");
} catch (e) {}

try {
  db.exec("ALTER TABLE audit_universe ADD COLUMN auditingUnit TEXT");
  console.log("[VERIFY-AUTO-MIGRATE] Added 'auditingUnit' column to audit_universe table.");
} catch (e) {}

try {
  db.exec("ALTER TABLE audit_universe ADD COLUMN description TEXT");
  console.log("[VERIFY-AUTO-MIGRATE] Added 'description' column to audit_universe table.");
} catch (e) {}

try {
  db.exec("ALTER TABLE audit_universe ADD COLUMN isDeleted INTEGER");
  console.log("[VERIFY-AUTO-MIGRATE] Added 'isDeleted' column to audit_universe table.");
} catch (e) {}

// Initial Data Seed Lists
const seedUsers = [
  { 
    id: 'usr-1', 
    name: 'Abebe Kebede', 
    email: 'akebede@bank.et', 
    role: 'Admin', 
    department: 'Internal Audit Department', 
    active: 1,
    title: 'Chief Internal Auditor',
    category: '',
    team: '',
    reportsToId: '',
    reportsToName: 'Board Audit Committee',
    employeeId: 'EMP-2021-001',
    subProcess: 'All Audit Domains',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CIA', 'CISA', 'ACCA', 'MBA']),
    expertise: JSON.stringify(['Strategic Auditing', 'Risk Management', 'Corporate Governance', 'Financial Controls']),
    contactPhone: '+251-11-667-8901'
  },
  { 
    id: 'usr-2', 
    name: 'Tigist Assefa', 
    email: 'tassefa@bank.et', 
    role: 'Manager', 
    department: 'Corporate & Financial Audit Division', 
    active: 1,
    title: 'Director, Corporate & Financial Audit',
    category: 'Corporate Audit',
    team: '',
    reportsToId: 'usr-1',
    reportsToName: 'Abebe Kebede (Chief Internal Auditor)',
    employeeId: 'EMP-2022-045',
    subProcess: 'Corporate & Financial Operations',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CIA', 'ACCA', 'CPA']),
    expertise: JSON.stringify(['Operational Audits', 'Financial Verification', 'Credit Portfolio Review']),
    contactPhone: '+251-11-667-8902'
  },
  { 
    id: 'usr-3', 
    name: 'Yohannes Hailu', 
    email: 'yhailu@bank.et', 
    role: 'Manager', 
    department: 'IT & Cyber Security Audit Division', 
    active: 1,
    title: 'Director, IT & Cyber Security Audit',
    reportsToId: 'usr-1',
    reportsToName: 'Abebe Kebede (Chief Internal Auditor)',
    employeeId: 'EMP-2022-092',
    subProcess: 'Cyber Security & IT Infrastructure',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CISA', 'CISM', 'CISSP', 'CEH']),
    expertise: JSON.stringify(['Cybersecurity', 'Database Auditing', 'Network Security', 'IT Governance']),
    contactPhone: '+251-11-667-8903'
  },
  { 
    id: 'usr-4', 
    name: 'Selamawit Demeke', 
    email: 'sdemeke@bank.et', 
    role: 'Team Leader', 
    department: 'Branch Audit Division', 
    active: 1,
    title: 'Team Manager, Branch Network Operations',
    category: 'Branch Audit',
    team: 'Branch Operations Audit Team',
    reportsToId: 'usr-2',
    reportsToName: 'Tigist Assefa (Director, Corporate & Financial Audit)',
    employeeId: 'EMP-2023-118',
    subProcess: 'Branch Network Operations',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CIA', 'CRMA']),
    expertise: JSON.stringify(['Branch Operations Audit', 'Cash Management', 'Retail Banking Risk']),
    contactPhone: '+251-11-667-8904'
  },
  { 
    id: 'usr-5', 
    name: 'Mekonnen Tadesse', 
    email: 'mtadesse@bank.et', 
    role: 'Team Leader', 
    department: 'Financial & Credit Audit Section', 
    active: 1,
    title: 'Team Manager, Financial & Treasury Audit',
    category: 'Corporate Audit',
    team: 'Financial & Credit Section',
    reportsToId: 'usr-2',
    reportsToName: 'Tigist Assefa (Director, Corporate & Financial Audit)',
    employeeId: 'EMP-2023-140',
    subProcess: 'Treasury, FX & Investment Review',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['ACCA', 'FRM']),
    expertise: JSON.stringify(['Treasury Audit', 'Foreign Currency Allocation', 'Market Risk', 'Liquidity Management']),
    contactPhone: '+251-11-667-8905'
  },
  { 
    id: 'usr-6', 
    name: 'Worku Lemma', 
    email: 'wlemma@bank.et', 
    role: 'Team Leader', 
    department: 'Risk & Compliance Audit Division', 
    active: 1,
    title: 'Team Manager, Regulatory & NBE Compliance',
    category: 'Corporate Audit',
    team: 'HQ Strategy & Risk Team',
    reportsToId: 'usr-3',
    reportsToName: 'Yohannes Hailu (Director, IT & Cyber Security Audit)',
    employeeId: 'EMP-2023-177',
    subProcess: 'Regulatory Compliance & Risk Controls',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CIA', 'CAMS']),
    expertise: JSON.stringify(['NBE Directives Compliance', 'Anti-Money Laundering (AML)', 'KYC Audit']),
    contactPhone: '+251-11-667-8906'
  },
  { 
    id: 'usr-7', 
    name: 'Aster Bekele', 
    email: 'abekele@bank.et', 
    role: 'Team Leader', 
    department: 'Digital Banking Security Section', 
    active: 1,
    title: 'Team Manager, Digital Banking & FinTech',
    category: 'IT Audit',
    team: 'IT Applications Team',
    reportsToId: 'usr-3',
    reportsToName: 'Yohannes Hailu (Director, IT & Cyber Security Audit)',
    employeeId: 'EMP-2023-205',
    subProcess: 'Digital Channels & Mobile Systems',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CISA', 'CRISC', 'ITIL']),
    expertise: JSON.stringify(['Mobile Banking Audit', 'API Security', 'FinTech Applications', 'Payment Systems']),
    contactPhone: '+251-11-667-8907'
  },
  { 
    id: 'usr-8', 
    name: 'Solomon Worku', 
    email: 'sworku@bank.et', 
    role: 'Auditor', 
    department: 'Financial & Credit Audit Section', 
    active: 1,
    title: 'Senior Financial Auditor',
    category: 'Corporate Audit',
    team: 'Financial & Credit Section',
    reportsToId: 'usr-5',
    reportsToName: 'Mekonnen Tadesse (Team Manager, Financial & Treasury Audit)',
    employeeId: 'EMP-2024-312',
    subProcess: 'Treasury, FX & Investment Review',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CIA', 'ACCA']),
    expertise: JSON.stringify(['Financial Verification', 'Spreadsheet Audits', 'Ledger Reconciliations']),
    contactPhone: '+251-11-667-8908'
  },
  { 
    id: 'usr-9', 
    name: 'Lidya Tekle', 
    email: 'ltekle@bank.et', 
    role: 'Auditor', 
    department: 'IT Audit Division', 
    active: 1,
    title: 'Cybersecurity Audit Specialist',
    category: 'IT Audit',
    team: 'IT Infrastructure & Database Team',
    reportsToId: 'usr-7',
    reportsToName: 'Aster Bekele (Team Manager, Digital Banking & FinTech)',
    employeeId: 'EMP-2024-401',
    subProcess: 'Cyber Security & IT Infrastructure',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CISA', 'CEH', 'Security+']),
    expertise: JSON.stringify(['Penetration Testing', 'SQL Injection', 'Vulnerability Assessment', 'Active Directory Review']),
    contactPhone: '+251-11-667-8909'
  },
  { 
    id: 'usr-10', 
    name: 'Fasil Lemma', 
    email: 'flemma@bank.et', 
    role: 'Auditor', 
    department: 'Branch Audit Division', 
    active: 1,
    title: 'Junior Branch Auditor',
    category: 'Branch Audit',
    team: 'Branch Operations Audit Team',
    reportsToId: 'usr-4',
    reportsToName: 'Selamawit Demeke (Team Manager, Branch Network Operations)',
    employeeId: 'EMP-2025-055',
    subProcess: 'Branch Network Operations',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['CIA (Candidate)']),
    expertise: JSON.stringify(['Cash Vault Audit', 'Customer Accounts Verification', 'Branch Operations']),
    contactPhone: '+251-11-667-8910'
  },
  { 
    id: 'usr-11', 
    name: 'Board Audit Chairman', 
    email: 'board@bank.et', 
    role: 'Executive', 
    department: 'Board Audit Committee', 
    active: 1,
    title: 'Board Audit Committee Chairman',
    category: '',
    team: '',
    reportsToId: '',
    reportsToName: '',
    employeeId: 'EMP-EXT-001',
    subProcess: 'Executive Oversight',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['PhD in Finance', 'FCCA']),
    expertise: JSON.stringify(['Corporate Governance', 'Strategic Risk Oversight', 'Public Policy']),
    contactPhone: '+251-11-667-8911'
  },
  { 
    id: 'usr-12', 
    name: 'Amare Girma', 
    email: 'agirma@bank.et', 
    role: 'Auditee', 
    department: 'Head Office Treasury & Finance', 
    active: 1,
    title: 'Director of Treasury Operations (Auditee)',
    category: '',
    team: '',
    reportsToId: '',
    reportsToName: '',
    employeeId: 'EMP-OPS-044',
    subProcess: 'Treasury Operations',
    employmentStatus: 'Active',
    qualifications: JSON.stringify(['MSc in Finance']),
    expertise: JSON.stringify(['Liquidity Management', 'Foreign Exchange Trading']),
    contactPhone: '+251-11-667-8912'
  }
];

const seedUniverse = [
  { id: 'ent-1', name: 'Core Banking Database System (Delta)', category: 'IT System', riskScore: 5.0, riskLevel: 'High' },
  { id: 'ent-2', name: 'Bole Premium Branch', category: 'Branch', riskScore: 3.4, riskLevel: 'Medium' },
  { id: 'ent-3', name: 'SWIFT Settlement Gateway', category: 'IT System', riskScore: 4.7, riskLevel: 'High' },
  { id: 'ent-4', name: 'Financing & Treasury Department', category: 'Head Office Department', riskScore: 4.1, riskLevel: 'High' },
  { id: 'ent-5', name: 'Human Resource Division', category: 'Head Office Department', riskScore: 2.3, riskLevel: 'Low' },
  { id: 'ent-6', name: 'Mobile Banking App API Gateway', category: 'IT System', riskScore: 4.0, riskLevel: 'High' },
  { id: 'ent-7', name: 'Adama Main Branch', category: 'Branch', riskScore: 3.0, riskLevel: 'Medium' },
  { id: 'ent-8', name: 'Anti-Money Laundering Compliance Unit', category: 'Head Office Department', riskScore: 3.6, riskLevel: 'High' }
];

const seedAnnualPlan = [
  { id: 'p-1', auditYear: '2026', entityId: 'ent-1', entityName: 'Core Banking Database System (Delta)', riskLevel: 'High', riskScore: 5.0, targetQuarter: 'Q1', targetMonth: 'January', assignedResources: 3, status: 'Approved', approvedBy: 'Abebe Kebede', approvalDate: '2026-01-05' },
  { id: 'p-2', auditYear: '2026', entityId: 'ent-3', entityName: 'SWIFT Settlement Gateway', riskLevel: 'High', riskScore: 4.7, targetQuarter: 'Q2', targetMonth: 'April', assignedResources: 2, status: 'Submitted', approvedBy: null, approvalDate: null },
  { id: 'p-3', auditYear: '2026', entityId: 'ent-4', entityName: 'Financing & Treasury Department', riskLevel: 'High', riskScore: 4.1, targetQuarter: 'Q1', targetMonth: 'February', assignedResources: 2, status: 'Approved', approvedBy: 'Abebe Kebede', approvalDate: '2026-01-05' },
  { id: 'p-4', auditYear: '2026', entityId: 'ent-2', entityName: 'Bole Premium Branch', riskLevel: 'Medium', riskScore: 3.4, targetQuarter: 'Q3', targetMonth: 'July', assignedResources: 2, status: 'Draft', approvedBy: null, approvalDate: null },
  { id: 'p-5', auditYear: '2026', entityId: 'ent-6', entityName: 'Mobile Banking App API Gateway', riskLevel: 'High', riskScore: 4.0, targetQuarter: 'Q4', targetMonth: 'October', assignedResources: 2, status: 'Draft', approvedBy: null, approvalDate: null }
];

const seedEngagements = [];
const seedFindings = [];

const seedComplianceControls = [
  { id: 'cc-1', regulationType: 'NBE', directiveNumber: 'NBE/FX/87/2024', controlName: 'Foreign FX Allocation Accountability', assessmentCriteria: 'Transactions above $10,000 USD must preserve strict import/export licensing checks mapped inside core systems.', status: 'Partial', lastAssessedDate: '2026-03-10', mappedEntity: 'Financing & Treasury Department' },
  { id: 'cc-2', regulationType: 'NBE', directiveNumber: 'NBE/CR/12/2023', controlName: 'Single Borrower Limit Constraints', assessmentCriteria: 'Consolidated aggregate exposure to any single client must not exceed 25% of total bank capital.', status: 'Compliant', lastAssessedDate: '2026-04-05', mappedEntity: 'Corporate Lending Division' },
  { id: 'cc-3', regulationType: 'INSA', directiveNumber: 'INSA/CYBER/09/2022', controlName: 'Critical Database Password Strength Rules', assessmentCriteria: 'System passwords must feature minimum 14 characters, non-monotonic patterns, and rotate quarterly.', status: 'Non-Compliant', lastAssessedDate: '2026-03-02', mappedEntity: 'Core Banking Database System (Delta)' },
  { id: 'cc-4', regulationType: 'INSA', directiveNumber: 'INSA/AUDIT/05/2021', controlName: 'Immutable Log Records Storage', assessmentCriteria: 'Administrative and system modification logs must be written to read-only media and retained for 5+ years.', status: 'Compliant', lastAssessedDate: '2026-03-01', mappedEntity: 'Core Banking Database System (Delta)' },
  { id: 'cc-5', regulationType: 'NBE', directiveNumber: 'NBE/GOV/04/2020', controlName: 'Board Audit Committee Reporting', assessmentCriteria: 'Chief Internal Auditor must submit formal executive performance reports to Board directly every fiscal quarter.', status: 'Compliant', lastAssessedDate: '2026-05-18', mappedEntity: 'Internal Audit Department' }
];

const seedLogs = [
  { id: 'log-1', timestamp: '2026-06-06T08:15:00Z', user: 'akebede@bank.et', role: 'Admin', action: 'User Creation', details: 'Added new auditor profile: (sdemeke@bank.et)', ipAddress: '192.168.12.45' },
  { id: 'log-2', timestamp: '2026-06-06T08:24:12Z', user: 'akebede@bank.et', role: 'Admin', action: 'Annual Plan Status Update', details: 'Approved Q1 Audit Universe Planning Items', ipAddress: '192.168.12.45' },
  { id: 'log-3', timestamp: '2026-06-06T08:45:30Z', user: 'tassefa@bank.et', role: 'Manager', action: 'Engagement Initiated', details: 'Transferred planned item p-1 to active engagement: eng-101', ipAddress: '192.168.12.18' },
  { id: 'log-4', timestamp: '2026-06-06T08:48:15Z', user: 'yhailu@bank.et', role: 'Team Leader', action: 'SLA Escalation Notification Service', details: 'Triggered Level 1 Email Alert: Auditee response for finding fnd-202 is overdue by 37 days.', ipAddress: '192.168.14.110' }
];

const seedOrgUnits = [
  {
    id: 'unit-bd',
    name: 'Board of Directors',
    code: 'BD-01',
    type: 'Board of Directors',
    parentId: '',
    headId: 'usr-11',
    headName: 'Board Audit Chairman',
    employees: JSON.stringify([]),
    positions: JSON.stringify(['Chairman', 'Non-Executive Director', 'Executive Director']),
    roles: 'Ultimate strategic and fiduciary oversight of the banking institution.',
    responsibilities: 'Approve audit charter, oversee executive management performance, and receive reports from Board Committees.'
  },
  {
    id: 'unit-bac',
    name: 'Board Audit Committee',
    code: 'BAC-01',
    type: 'Board Committee',
    parentId: 'unit-bd',
    headId: 'usr-11',
    headName: 'Board Audit Chairman',
    employees: JSON.stringify([]),
    positions: JSON.stringify(['Committee Head', 'Audit Committee Member']),
    roles: 'Oversight of financial reports, internal controls, risk management, and audit processes.',
    responsibilities: 'Review reports from Internal Audit, verify compliance with NBE regulations, and recommend audit improvements.'
  },
  {
    id: 'unit-ceo',
    name: 'Office of the Chief Executive Officer',
    code: 'CEO-01',
    type: 'CEO',
    parentId: 'unit-bd',
    headId: 'usr-12',
    headName: 'Amare Girma',
    employees: JSON.stringify([]),
    positions: JSON.stringify(['CEO', 'Executive Assistant']),
    roles: 'General executive leadership and operational control of the bank.',
    responsibilities: 'Execute board-approved strategies, maintain efficient operation, and report operational outcomes.'
  },
  {
    id: 'unit-iad',
    name: 'Internal Audit Department',
    code: 'IAD-01',
    type: 'Directorate/Department',
    parentId: 'unit-bac',
    headId: 'usr-1',
    headName: 'Abebe Kebede',
    employees: JSON.stringify(['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-9', 'usr-10']),
    positions: JSON.stringify(['Chief Internal Auditor', 'Director', 'Team Manager', 'Auditor']),
    roles: 'Provide independent and objective risk-based assurance and consulting to the Board and Management.',
    responsibilities: 'Plan yearly audit universe, perform special investigations, detect operational anomalies, and report findings.'
  },
  {
    id: 'unit-cfad',
    name: 'Corporate & Financial Audit Division',
    code: 'CFAD-01',
    type: 'Division',
    parentId: 'unit-iad',
    headId: 'usr-2',
    headName: 'Tigist Assefa',
    employees: JSON.stringify(['usr-2', 'usr-5', 'usr-8']),
    positions: JSON.stringify(['Director', 'Team Manager', 'Senior Auditor']),
    roles: 'Audit of head-office credit, treasury operations, currency allocations, and financial reporting.',
    responsibilities: 'Verify financial books, assess loan portfolios, and audit treasury operations against NBE guidelines.'
  },
  {
    id: 'unit-itsd',
    name: 'IT & Cyber Security Audit Division',
    code: 'ITSD-01',
    type: 'Division',
    parentId: 'unit-iad',
    headId: 'usr-3',
    headName: 'Yohannes Hailu',
    employees: JSON.stringify(['usr-3', 'usr-7', 'usr-9']),
    positions: JSON.stringify(['Director', 'Team Manager', 'Security Specialist']),
    roles: 'Assess vulnerability, IT general controls, cybersecurity infrastructure, and database configurations.',
    responsibilities: 'Evaluate core banking system defenses, audit digital channel security, and check INSA compliance.'
  },
  {
    id: 'unit-bad',
    name: 'Branch Audit Division',
    code: 'BAD-01',
    type: 'Division',
    parentId: 'unit-iad',
    headId: 'usr-4',
    headName: 'Selamawit Demeke',
    employees: JSON.stringify(['usr-4', 'usr-10']),
    positions: JSON.stringify(['Team Manager', 'Field Auditor', 'Junior Auditor']),
    roles: 'Operational and financial audit of the branch network and cash retail hubs.',
    responsibilities: 'Assess vault controls, verify customer account signatures, and evaluate branch loan disbursements.'
  },
  {
    id: 'unit-hot',
    name: 'Head Office Treasury Section',
    code: 'HOT-01',
    type: 'Section/Unit',
    parentId: 'unit-ceo',
    headId: 'usr-12',
    headName: 'Amare Girma',
    employees: JSON.stringify(['usr-12']),
    positions: JSON.stringify(['Director of Treasury', 'Treasury Officer']),
    roles: 'Manage bank liquidity, foreign currency trading, and local cash flows.',
    responsibilities: 'Observe foreign exchange allocations, trade foreign currencies within statutory limits, and buffer liquidity reserves.'
  }
];

const seedEscalations = [
  {
    id: 'esc-101',
    issueType: 'Unresolved Finding',
    title: 'Critical Database Password Strength Deficiency (INSA Compliance)',
    description: 'The IT Infrastructure team has failed to implement password complexity and quarterly rotation rules on the Delta Core Banking database for over 90 days.',
    sourceUnitId: 'unit-itsd',
    sourceUnitName: 'IT & Cyber Security Audit Division',
    targetUnitId: 'unit-iad',
    targetUnitName: 'Internal Audit Department',
    status: 'Pending Review',
    escalatedById: 'usr-3',
    escalatedByName: 'Yohannes Hailu',
    escalatedToId: 'usr-1',
    escalatedToName: 'Abebe Kebede',
    creationDate: '2026-07-01',
    decisionDate: null,
    decisionNotes: null,
    decisionBy: null
  },
  {
    id: 'esc-102',
    issueType: 'Overdue Corrective Action',
    title: 'Treasury FX Allocation Accountability Review Delay',
    description: 'Remediation plan for the foreign currency distribution gap (NBE/FX/87/2024) is overdue by 37 days with zero rectification progress.',
    sourceUnitId: 'unit-cfad',
    sourceUnitName: 'Corporate & Financial Audit Division',
    targetUnitId: 'unit-bac',
    targetUnitName: 'Board Audit Committee',
    status: 'Escalated Higher',
    escalatedById: 'usr-2',
    escalatedByName: 'Tigist Assefa',
    escalatedToId: 'usr-11',
    escalatedToName: 'Board Audit Chairman',
    creationDate: '2026-07-15',
    decisionDate: null,
    decisionNotes: null,
    decisionBy: null
  }
];

// Seed logic run
const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (usersCount.count === 0) {
  console.log("[VERIFY-BOOTSTRAP] Seeding Default Database Tables...");

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, role, department, active, password,
      title, category, team, reportsToId, reportsToName,
      employeeId, subProcess, employmentStatus, qualifications, expertise, contactPhone
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((usersList) => {
    for (const u of usersList) {
      insertUser.run(
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.active,
        u.password || 'Password123',
        u.title || '',
        u.category || '',
        u.team || '',
        u.reportsToId || '',
        u.reportsToName || '',
        u.employeeId || '',
        u.subProcess || '',
        u.employmentStatus || 'Active',
        u.qualifications || '[]',
        u.expertise || '[]',
        u.contactPhone || ''
      );
    }
  })(seedUsers);

  const insertUniverse = db.prepare(`
    INSERT INTO audit_universe (id, name, description, category, subcategory, auditingUnit, riskScore, riskLevel, templateId, isDeleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((universe) => {
    for (const ent of universe) {
      insertUniverse.run(
        ent.id, 
        ent.name, 
        ent.description || null,
        ent.category, 
        ent.subcategory || null,
        ent.auditingUnit || null,
        ent.riskScore, 
        ent.riskLevel,
        ent.templateId || null,
        ent.isDeleted ? 1 : 0
      );
    }
  })(seedUniverse);

  const insertPlan = db.prepare(`
    INSERT INTO annual_plan (id, auditYear, entityId, entityName, riskLevel, riskScore, targetQuarter, targetMonth, assignedResources, status, approvedBy, approvalDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((plans) => {
    for (const p of plans) {
      insertPlan.run(p.id, p.auditYear, p.entityId, p.entityName, p.riskLevel, p.riskScore, p.targetQuarter, p.targetMonth, p.assignedResources, p.status, p.approvedBy, p.approvalDate);
    }
  })(seedAnnualPlan);

  const insertEngagement = db.prepare(`
    INSERT INTO engagements (id, planId, title, entityId, entityName, auditorInCharge, teamMembers, status, startDate, endDate, wbs, engagementLetter, assignedSection, assignedTeam, assignedSubTeam)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((engs) => {
    for (const e of engs) {
      insertEngagement.run(e.id, e.planId, e.title, e.entityId, e.entityName, e.auditorInCharge, e.teamMembers, e.status, e.startDate, e.endDate, e.wbs, e.engagementLetter, e.assignedSection, e.assignedTeam, e.assignedSubTeam);
    }
  })(seedEngagements);

  const insertFinding = db.prepare(`
    INSERT INTO findings (id, engagementId, engagementTitle, entityName, title, description, criteria, rootCause, impact, lossFigures, recommendations, riskLevel, isSentToAuditees, auditeeResponse, isAcceptedByAuditor, targetedActionPlan, expectedCompletionDate, rectificationProgress, rectificationValidationStatus, evidenceFiles, creationDate, escalationLevel, slaDeadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((fnds) => {
    for (const f of fnds) {
      insertFinding.run(f.id, f.engagementId, f.engagementTitle, f.entityName, f.title, f.description, f.criteria, f.rootCause, f.impact, f.lossFigures, f.recommendations, f.riskLevel, f.isSentToAuditees, f.auditeeResponse, f.isAcceptedByAuditor, f.targetedActionPlan, f.expectedCompletionDate, f.rectificationProgress, f.rectificationValidationStatus, f.evidenceFiles, f.creationDate, f.escalationLevel, f.slaDeadline);
    }
  })(seedFindings);

  const insertCompliance = db.prepare(`
    INSERT INTO compliance_controls (id, regulationType, directiveNumber, controlName, assessmentCriteria, status, lastAssessedDate, mappedEntity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((compliance) => {
    for (const c of compliance) {
      insertCompliance.run(c.id, c.regulationType, c.directiveNumber, c.controlName, c.assessmentCriteria, c.status, c.lastAssessedDate, c.mappedEntity);
    }
  })(seedComplianceControls);

  const insertLog = db.prepare(`
    INSERT INTO system_logs (id, timestamp, user, role, action, details, ipAddress)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((logs) => {
    for (const l of logs) {
      insertLog.run(l.id, l.timestamp, l.user, l.role, l.action, l.details, l.ipAddress);
    }
  })(seedLogs);

  console.log("[VERIFY-BOOTSTRAP] Tables seeded successfully.");
}

// Seed org_units if empty
const orgUnitsCount = db.prepare("SELECT COUNT(*) as count FROM org_units").get();
if (orgUnitsCount.count === 0) {
  console.log("[VERIFY-BOOTSTRAP] Seeding org_units table...");
  const insertOrgUnit = db.prepare(`
    INSERT INTO org_units (id, name, code, type, parentId, headId, headName, employees, positions, roles, responsibilities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((list) => {
    for (const u of list) {
      insertOrgUnit.run(
        u.id, u.name, u.code, u.type, u.parentId || null, u.headId || null, u.headName || null,
        u.employees || '[]', u.positions || '[]', u.roles || null, u.responsibilities || null
      );
    }
  })(seedOrgUnits);
}

// Seed escalations if empty
const escalationsCount = db.prepare("SELECT COUNT(*) as count FROM escalations").get();
if (escalationsCount.count === 0) {
  console.log("[VERIFY-BOOTSTRAP] Seeding escalations table...");
  const insertEscalation = db.prepare(`
    INSERT INTO escalations (id, issueType, title, description, sourceUnitId, sourceUnitName, targetUnitId, targetUnitName, status, escalatedById, escalatedByName, escalatedToId, escalatedToName, creationDate, decisionDate, decisionNotes, decisionBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  db.transaction((list) => {
    for (const e of list) {
      insertEscalation.run(
        e.id, e.issueType, e.title, e.description, e.sourceUnitId, e.sourceUnitName, e.targetUnitId, e.targetUnitName, e.status, e.escalatedById, e.escalatedByName, e.escalatedToId, e.escalatedToName, e.creationDate, e.decisionDate || null, e.decisionNotes || null, e.decisionBy || null
      );
    }
  })(seedEscalations);
}
