/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Manager' | 'Team Leader' | 'Auditor' | 'Auditee' | 'Executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  active: boolean;
  category?: 'Corporate Audit' | 'Branch Audit' | 'IT Audit' | '';
  team?: string;
  title?: string;
  reportsToId?: string;
  reportsToName?: string;
  responsibilityTemplateId?: string;
  customDuties?: string[];
  customResponsibilities?: string[];
  customAuthority?: string[];
  customAccountability?: string[];
  // Auditor Registration additional fields
  employeeId?: string;
  subProcess?: string;
  employmentStatus?: 'Active' | 'Suspended' | 'On Leave' | 'Terminated';
  qualifications?: string[];
  expertise?: string[];
  contactPhone?: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  testProcedures: string;
  controlType: 'Key' | 'Standard' | 'Automated' | 'Manual';
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  complianceRef?: string;
}

export interface AuditableArea {
  id: string;
  name: string;
  description: string;
  checklist: ChecklistItem[];
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  auditableAreas: AuditableArea[];
}

export interface AuditUniverseEntity {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  auditingUnit?: string;
  riskScore: number; // calculated
  riskLevel: 'High' | 'Medium' | 'Low';
  templateId?: string; // linked checklist template
  isDeleted?: boolean;
}

export interface AnnualPlanItem {
  id: string;
  auditYear: string;
  entityId: string;
  entityName: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: number;
  targetQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  targetMonth: string;
  assignedResources: number; // count of auditors
  status: 'Draft' | 'Submitted' | 'Approved';
  approvedBy?: string;
  approvalDate?: string;
  approvedRates?: Record<string, number>;
}

export interface WorkingPaper {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  fileData?: string; // Base64 content or simulation string
}

export interface WbsTask {
  id: string;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  workingPapers: WorkingPaper[];
}

export interface EngagementLetter {
  body: string;
  sentDate: string;
  acceptedBy?: string;
  acceptedDate?: string;
  isAccepted: boolean;
  contactPerson?: string;
  // Lifecycle Phase Additions
  teamRoles?: Record<string, 'Engagement Manager' | 'Team Leader' | 'Field Auditor'>;
  introduction?: string;
  objectives?: string;
  scope?: string;
  methodology?: string;
  timeline?: {
    planningStart: string;
    planningEnd: string;
    fieldworkStart: string;
    fieldworkEnd: string;
    reportingStart: string;
    reportingEnd: string;
    closureStart: string;
    closureEnd: string;
  };
  programApproved?: boolean;
  programApprovedBy?: string;
  programApprovalDate?: string;
  entryConference?: {
    date: string;
    scheduled: boolean;
    completed: boolean;
    attendees: string[];
    minutes: string;
    checklists?: {
      teamIntroduced?: boolean;
      objectivesConfirmed?: boolean;
      methodologyDiscussed?: boolean;
      timelineConfirmed?: boolean;
      infoRequirementsExplained?: boolean;
      rolesClarified?: boolean;
      communicationAgreed?: boolean;
    };
    minutesFile?: {
      name: string;
      size: string;
      date: string;
    };
  };
}

export interface Engagement {
  id: string;
  planId: string;
  title: string;
  entityId: string;
  entityName: string;
  auditorInCharge: string;
  teamMembers: string[];
  status: 'Initiated' | 'Fieldwork' | 'Draft Report' | 'Completed';
  startDate: string;
  endDate: string;
  wbs: WbsTask[];
  engagementLetter: EngagementLetter;
  assignedSection?: string;
  assignedTeam?: string;
  assignedSubTeam?: string;
}

export interface Finding {
  id: string;
  engagementId: string;
  engagementTitle: string;
  entityName: string;
  title: string;
  description: string;
  criteria: string;
  rootCause: string;
  impact: string;
  lossFigures: number; // in ETB
  recommendations: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  isSentToAuditees: boolean; // toggle publication
  auditeeResponse?: string;
  isAcceptedByAuditor?: boolean; // Accepted status permanently locks description
  targetedActionPlan?: string;
  expectedCompletionDate?: string;
  rectificationProgress: number; // 0 - 100
  rectificationValidationStatus: 'Pending' | 'Fully Rectified' | 'Partially Rectified' | 'Unrectified';
  evidenceFiles: WorkingPaper[];
  creationDate: string;
  escalationLevel: 0 | 1 | 2 | 3; // SLA breaches escalations (1=Level 1 warning, 2=Level 2 written, 3=Board alert)
  slaDeadline: string;
}

export interface CaatTransaction {
  id: string;
  date: string;
  amount: number; // ETB
  vendor: string;
  category: string;
  initiator: string;
  approver: string;
  status: 'Approved' | 'Pending';
  invoiceNumber: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface ComplianceControl {
  id: string;
  regulationType: 'NBE' | 'INSA';
  directiveNumber: string;
  controlName: string;
  assessmentCriteria: string;
  status: 'Compliant' | 'Partial' | 'Non-Compliant';
  lastAssessedDate: string;
  mappedEntity: string;
}

export interface OrganizationalUnit {
  id: string;
  name: string;
  code: string;
  type: 'Board of Directors' | 'Board Committee' | 'CEO' | 'Executive Management' | 'Directorate/Department' | 'Division' | 'Section/Unit' | 'Team';
  parentId?: string;
  headId?: string;
  headName?: string;
  employees?: string[]; // user IDs assigned
  positions?: string[]; // categories/job titles
  roles?: string;
  responsibilities?: string;
}

export interface EscalationRecord {
  id: string;
  issueType: 'Resource Request' | 'Audit Approval' | 'Unresolved Finding' | 'Overdue Corrective Action';
  title: string;
  description: string;
  sourceUnitId: string;
  sourceUnitName: string;
  targetUnitId: string;
  targetUnitName: string;
  status: 'Pending Review' | 'Approved' | 'Resolved' | 'Escalated Higher';
  escalatedById: string;
  escalatedByName: string;
  escalatedToId: string;
  escalatedToName: string;
  creationDate: string;
  decisionDate?: string;
  decisionNotes?: string;
  decisionBy?: string;
}

export const initialOrgUnits: OrganizationalUnit[] = [
  {
    id: 'unit-bd',
    name: 'Board of Directors',
    code: 'BD-01',
    type: 'Board of Directors',
    parentId: '',
    headId: 'usr-11',
    headName: 'Board Audit Chairman',
    employees: [],
    positions: ['Chairman', 'Non-Executive Director', 'Executive Director'],
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
    employees: [],
    positions: ['Committee Head', 'Audit Committee Member'],
    roles: 'Oversight of financial reports, internal controls, risk management, and audit processes.',
    responsibilities: 'Review reports from Internal Audit, verify compliance with NBE regulations, and recommend audit improvements.'
  },
  {
    id: 'unit-ceo',
    name: 'Office of the Chief Executive Officer',
    code: 'CEO-01',
    type: 'CEO',
    parentId: 'unit-bd',
    headId: 'usr-12', // Let's link to Amare Girma or standard exec
    headName: 'Amare Girma',
    employees: [],
    positions: ['CEO', 'Executive Assistant'],
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
    employees: ['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-9', 'usr-10'],
    positions: ['Chief Internal Auditor', 'Director', 'Team Manager', 'Auditor'],
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
    employees: ['usr-2', 'usr-5', 'usr-8'],
    positions: ['Director', 'Team Manager', 'Senior Auditor'],
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
    employees: ['usr-3', 'usr-7', 'usr-9'],
    positions: ['Director', 'Team Manager', 'Security Specialist'],
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
    employees: ['usr-4', 'usr-10'],
    positions: ['Team Manager', 'Field Auditor', 'Junior Auditor'],
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
    employees: ['usr-12'],
    positions: ['Director of Treasury', 'Treasury Officer'],
    roles: 'Manage bank liquidity, foreign currency trading, and local cash flows.',
    responsibilities: 'Observe foreign exchange allocations, trade foreign currencies within statutory limits, and buffer liquidity reserves.'
  }
];

export const initialEscalations: EscalationRecord[] = [
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
    creationDate: '2026-07-01'
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
    creationDate: '2026-07-15'
  }
];

// Initial Mock Data to bootstrap LocalStorage if empty
export const initialUsers: User[] = [
  { 
    id: 'usr-1', 
    name: 'Abebe Kebede', 
    email: 'akebede@bank.et', 
    role: 'Admin', 
    department: 'Internal Audit Department', 
    active: true, 
    category: '', 
    team: '',
    title: 'Chief Internal Auditor',
    reportsToId: '',
    reportsToName: 'Board Audit Committee',
    employeeId: 'EMP-2021-001',
    subProcess: 'All Audit Domains',
    employmentStatus: 'Active',
    qualifications: ['CIA', 'CISA', 'ACCA', 'MBA'],
    expertise: ['Strategic Auditing', 'Risk Management', 'Corporate Governance', 'Financial Controls'],
    contactPhone: '+251-11-667-8901'
  },
  { 
    id: 'usr-2', 
    name: 'Tigist Assefa', 
    email: 'tassefa@bank.et', 
    role: 'Manager', 
    department: 'Corporate & Financial Audit Division', 
    active: true, 
    category: 'Corporate Audit', 
    team: '',
    title: 'Director, Corporate & Financial Audit',
    reportsToId: 'usr-1',
    reportsToName: 'Abebe Kebede (Chief Internal Auditor)',
    employeeId: 'EMP-2022-045',
    subProcess: 'Corporate & Financial Operations',
    employmentStatus: 'Active',
    qualifications: ['CIA', 'ACCA', 'CPA'],
    expertise: ['Operational Audits', 'Financial Verification', 'Credit Portfolio Review'],
    contactPhone: '+251-11-667-8902'
  },
  { 
    id: 'usr-3', 
    name: 'Yohannes Hailu', 
    email: 'yhailu@bank.et', 
    role: 'Manager', 
    department: 'IT & Cyber Security Audit Division', 
    active: true, 
    category: 'IT Audit', 
    team: '',
    title: 'Director, IT & Cyber Security Audit',
    reportsToId: 'usr-1',
    reportsToName: 'Abebe Kebede (Chief Internal Auditor)',
    employeeId: 'EMP-2022-092',
    subProcess: 'Cyber Security & IT Infrastructure',
    employmentStatus: 'Active',
    qualifications: ['CISA', 'CISM', 'CISSP', 'CEH'],
    expertise: ['Cybersecurity', 'Database Auditing', 'Network Security', 'IT Governance'],
    contactPhone: '+251-11-667-8903'
  },
  { 
    id: 'usr-4', 
    name: 'Selamawit Demeke', 
    email: 'sdemeke@bank.et', 
    role: 'Team Leader', 
    department: 'Branch Audit Division', 
    active: true, 
    category: 'Branch Audit', 
    team: 'Branch Operations Audit Team',
    title: 'Team Manager, Branch Network Operations',
    reportsToId: 'usr-2',
    reportsToName: 'Tigist Assefa (Director, Corporate & Financial Audit)',
    employeeId: 'EMP-2023-118',
    subProcess: 'Branch Network Operations',
    employmentStatus: 'Active',
    qualifications: ['CIA', 'CRMA'],
    expertise: ['Branch Operations Audit', 'Cash Management', 'Retail Banking Risk'],
    contactPhone: '+251-11-667-8904'
  },
  { 
    id: 'usr-5', 
    name: 'Mekonnen Tadesse', 
    email: 'mtadesse@bank.et', 
    role: 'Team Leader', 
    department: 'Financial & Credit Audit Section', 
    active: true, 
    category: 'Corporate Audit', 
    team: 'Financial & Credit Section',
    title: 'Team Manager, Financial & Treasury Audit',
    reportsToId: 'usr-2',
    reportsToName: 'Tigist Assefa (Director, Corporate & Financial Audit)',
    employeeId: 'EMP-2023-140',
    subProcess: 'Treasury, FX & Investment Review',
    employmentStatus: 'Active',
    qualifications: ['ACCA', 'FRM'],
    expertise: ['Treasury Audit', 'Foreign Currency Allocation', 'Market Risk', 'Liquidity Management'],
    contactPhone: '+251-11-667-8905'
  },
  { 
    id: 'usr-6', 
    name: 'Worku Lemma', 
    email: 'wlemma@bank.et', 
    role: 'Team Leader', 
    department: 'Risk & Compliance Audit Division', 
    active: true, 
    category: 'Corporate Audit', 
    team: 'HQ Strategy & Risk Team',
    title: 'Team Manager, Regulatory & NBE Compliance',
    reportsToId: 'usr-3',
    reportsToName: 'Yohannes Hailu (Director, IT & Cyber Security Audit)',
    employeeId: 'EMP-2023-177',
    subProcess: 'Regulatory Compliance & Risk Controls',
    employmentStatus: 'Active',
    qualifications: ['CIA', 'CAMS'],
    expertise: ['NBE Directives Compliance', 'Anti-Money Laundering (AML)', 'KYC Audit'],
    contactPhone: '+251-11-667-8906'
  },
  { 
    id: 'usr-7', 
    name: 'Aster Bekele', 
    email: 'abekele@bank.et', 
    role: 'Team Leader', 
    department: 'Digital Banking Security Section', 
    active: true, 
    category: 'IT Audit', 
    team: 'IT Applications Team',
    title: 'Team Manager, Digital Banking & FinTech',
    reportsToId: 'usr-3',
    reportsToName: 'Yohannes Hailu (Director, IT & Cyber Security Audit)',
    employeeId: 'EMP-2023-205',
    subProcess: 'Digital Channels & Mobile Systems',
    employmentStatus: 'Active',
    qualifications: ['CISA', 'CRISC', 'ITIL'],
    expertise: ['Mobile Banking Audit', 'API Security', 'FinTech Applications', 'Payment Systems'],
    contactPhone: '+251-11-667-8907'
  },
  { 
    id: 'usr-8', 
    name: 'Solomon Worku', 
    email: 'sworku@bank.et', 
    role: 'Auditor', 
    department: 'Financial & Credit Audit Section', 
    active: true, 
    category: 'Corporate Audit', 
    team: 'Financial & Credit Section',
    title: 'Senior Financial Auditor',
    reportsToId: 'usr-5',
    reportsToName: 'Mekonnen Tadesse (Team Manager, Financial & Treasury Audit)',
    employeeId: 'EMP-2024-312',
    subProcess: 'Treasury, FX & Investment Review',
    employmentStatus: 'Active',
    qualifications: ['CIA', 'ACCA'],
    expertise: ['Financial Verification', 'Spreadsheet Audits', 'Ledger Reconciliations'],
    contactPhone: '+251-11-667-8908'
  },
  { 
    id: 'usr-9', 
    name: 'Lidya Tekle', 
    email: 'ltekle@bank.et', 
    role: 'Auditor', 
    department: 'IT Audit Division', 
    active: true, 
    category: 'IT Audit', 
    team: 'IT Infrastructure & Database Team',
    title: 'Cybersecurity Audit Specialist',
    reportsToId: 'usr-7',
    reportsToName: 'Aster Bekele (Team Manager, Digital Banking & FinTech)',
    employeeId: 'EMP-2024-401',
    subProcess: 'Cyber Security & IT Infrastructure',
    employmentStatus: 'Active',
    qualifications: ['CISA', 'CEH', 'Security+'],
    expertise: ['Penetration Testing', 'SQL Injection', 'Vulnerability Assessment', 'Active Directory Review'],
    contactPhone: '+251-11-667-8909'
  },
  { 
    id: 'usr-10', 
    name: 'Fasil Lemma', 
    email: 'flemma@bank.et', 
    role: 'Auditor', 
    department: 'Branch Audit Division', 
    active: true, 
    category: 'Branch Audit', 
    team: 'Branch Operations Audit Team',
    title: 'Junior Branch Auditor',
    reportsToId: 'usr-4',
    reportsToName: 'Selamawit Demeke (Team Manager, Branch Network Operations)',
    employeeId: 'EMP-2025-055',
    subProcess: 'Branch Network Operations',
    employmentStatus: 'Active',
    qualifications: ['CIA (Candidate)'],
    expertise: ['Cash Vault Audit', 'Customer Accounts Verification', 'Branch Operations'],
    contactPhone: '+251-11-667-8910'
  },
  { 
    id: 'usr-11', 
    name: 'Board Audit Chairman', 
    email: 'board@bank.et', 
    role: 'Executive', 
    department: 'Board Audit Committee', 
    active: true, 
    category: '', 
    team: '',
    title: 'Board Audit Committee Chairman',
    reportsToId: '',
    reportsToName: '',
    employeeId: 'EMP-EXT-001',
    subProcess: 'Executive Oversight',
    employmentStatus: 'Active',
    qualifications: ['PhD in Finance', 'FCCA'],
    expertise: ['Corporate Governance', 'Strategic Risk Oversight', 'Public Policy'],
    contactPhone: '+251-11-667-8911'
  },
  { 
    id: 'usr-12', 
    name: 'Amare Girma', 
    email: 'agirma@bank.et', 
    role: 'Auditee', 
    department: 'Head Office Treasury & Finance', 
    active: true, 
    category: '', 
    team: '',
    title: 'Director of Treasury Operations (Auditee)',
    reportsToId: '',
    reportsToName: '',
    employeeId: 'EMP-OPS-044',
    subProcess: 'Treasury Operations',
    employmentStatus: 'Active',
    qualifications: ['MSc in Finance'],
    expertise: ['Liquidity Management', 'Foreign Exchange Trading'],
    contactPhone: '+251-11-667-8912'
  }
];

export const initialUniverse: AuditUniverseEntity[] = [
  { id: 'ent-1', name: 'Core Banking Database System (Delta)', category: 'IT Audit', subcategory: 'System Administration', auditingUnit: 'IT Audit Division', riskScore: 5.0, riskLevel: 'High' },
  { id: 'ent-2', name: 'Bole Premium Branch', category: 'Branch Audit', subcategory: 'Operations Audit', auditingUnit: 'Branch Audit Division', riskScore: 3.4, riskLevel: 'Medium' },
  { id: 'ent-3', name: 'SWIFT Settlement Gateway', category: 'IT Audit', subcategory: 'Infrastructure', auditingUnit: 'IT Audit Division', riskScore: 4.7, riskLevel: 'High' },
  { id: 'ent-4', name: 'Financing & Treasury Department', category: 'Head Office Audit', subcategory: 'Treasury & FX', auditingUnit: 'Financial & Ops Section', riskScore: 4.1, riskLevel: 'High' },
  { id: 'ent-5', name: 'Human Resource Division', category: 'Head Office Audit', subcategory: 'HR Audit', auditingUnit: 'Financial & Ops Section', riskScore: 2.3, riskLevel: 'Low' },
  { id: 'ent-6', name: 'Mobile Banking App API Gateway', category: 'IT Audit', subcategory: 'Applications', auditingUnit: 'IT Audit Division', riskScore: 4.0, riskLevel: 'High' },
  { id: 'ent-7', name: 'Adama Main Branch', category: 'Branch Audit', subcategory: 'Credit & Loan', auditingUnit: 'Branch Audit Division', riskScore: 3.0, riskLevel: 'Medium' },
  { id: 'ent-8', name: 'Anti-Money Laundering Compliance Unit', category: 'Head Office Audit', subcategory: 'Compliance Audit', auditingUnit: 'Financial & Ops Section', riskScore: 3.6, riskLevel: 'High' },
  { id: 'ent-9', name: 'IFB Murabaha Financing Portfolio', category: 'IFB Audit', subcategory: 'Financing Murabaha', auditingUnit: 'Financial & Ops Section', riskScore: 3.3, riskLevel: 'Medium' }
];

export const initialAnnualPlan: AnnualPlanItem[] = [
  { id: 'p-1', auditYear: '2026', entityId: 'ent-1', entityName: 'Core Banking Database System (Delta)', riskLevel: 'High', riskScore: 5.0, targetQuarter: 'Q1', targetMonth: 'January', assignedResources: 3, status: 'Approved', approvedBy: 'Abebe Kebede', approvalDate: '2026-01-05' },
  { id: 'p-2', auditYear: '2026', entityId: 'ent-3', entityName: 'SWIFT Settlement Gateway', riskLevel: 'High', riskScore: 4.7, targetQuarter: 'Q2', targetMonth: 'April', assignedResources: 2, status: 'Submitted' },
  { id: 'p-3', auditYear: '2026', entityId: 'ent-4', entityName: 'Financing & Treasury Department', riskLevel: 'High', riskScore: 4.1, targetQuarter: 'Q1', targetMonth: 'February', assignedResources: 2, status: 'Approved', approvedBy: 'Abebe Kebede', approvalDate: '2026-01-05' },
  { id: 'p-4', auditYear: '2026', entityId: 'ent-2', entityName: 'Bole Premium Branch', riskLevel: 'Medium', riskScore: 3.4, targetQuarter: 'Q3', targetMonth: 'July', assignedResources: 2, status: 'Draft' },
  { id: 'p-5', auditYear: '2026', entityId: 'ent-6', entityName: 'Mobile Banking App API Gateway', riskLevel: 'High', riskScore: 4.0, targetQuarter: 'Q4', targetMonth: 'October', assignedResources: 2, status: 'Draft' }
];

export const initialEngagements: Engagement[] = [];

export const initialFindings: Finding[] = [];

export const initialComplianceControls: ComplianceControl[] = [
  { id: 'cc-1', regulationType: 'NBE', directiveNumber: 'NBE/FX/87/2024', controlName: 'Foreign FX Allocation Accountability', assessmentCriteria: 'Transactions above $10,000 USD must preserve strict import/export licensing checks mapped inside core systems.', status: 'Partial', lastAssessedDate: '2026-03-10', mappedEntity: 'Financing & Treasury Department' },
  { id: 'cc-2', regulationType: 'NBE', directiveNumber: 'NBE/CR/12/2023', controlName: 'Single Borrower Limit Constraints', assessmentCriteria: 'Consolidated aggregate exposure to any single client must not exceed 25% of total bank capital.', status: 'Compliant', lastAssessedDate: '2026-04-05', mappedEntity: 'Corporate Lending Division' },
  { id: 'cc-3', regulationType: 'INSA', directiveNumber: 'INSA/CYBER/09/2022', controlName: 'Critical Database Password Strength Rules', assessmentCriteria: 'System passwords must feature minimum 14 characters, non-monotonic patterns, and rotate quarterly.', status: 'Non-Compliant', lastAssessedDate: '2026-03-02', mappedEntity: 'Core Banking Database System (Delta)' },
  { id: 'cc-4', regulationType: 'INSA', directiveNumber: 'INSA/AUDIT/05/2021', controlName: 'Immutable Log Records Storage', assessmentCriteria: 'Administrative and system modification logs must be written to read-only media and retained for 5+ years.', status: 'Compliant', lastAssessedDate: '2026-03-01', mappedEntity: 'Core Banking Database System (Delta)' },
  { id: 'cc-5', regulationType: 'NBE', directiveNumber: 'NBE/GOV/04/2020', controlName: 'Board Audit Committee Reporting', assessmentCriteria: 'Chief Internal Auditor must submit formal executive performance reports to Board directly every fiscal quarter.', status: 'Compliant', lastAssessedDate: '2026-05-18', mappedEntity: 'Internal Audit Department' }
];

export const initialTransactions: CaatTransaction[] = [
  { id: 'TR-1001', date: '2026-05-01', amount: 154300, vendor: 'Commercial Printing Enterprise', category: 'Printing Services', initiator: 'Aster Bekele', approver: 'Aster Bekele', status: 'Approved', invoiceNumber: 'INV-2026-001' },
  { id: 'TR-1002', date: '2026-05-01', amount: 154300, vendor: 'Commercial Printing Enterprise', category: 'Printing Services', initiator: 'Aster Bekele', approver: 'Abebe Kebede', status: 'Approved', invoiceNumber: 'INV-2026-001' }, // Duplicate transaction amount & vendor & invoice!
  { id: 'TR-1003', date: '2026-05-03', amount: 2450000, vendor: 'Finot IT Solutions', category: 'Software Licenses', initiator: 'Yohannes Hailu', approver: 'Tigist Assefa', status: 'Approved', invoiceNumber: 'INV-2026-003' },
  { id: 'TR-1004', date: '2026-05-04', amount: 49999, vendor: 'Tsehay Office Supplies', category: 'Stationery Supplies', initiator: 'Mekonnen Tadesse', approver: 'Mekonnen Tadesse', status: 'Approved', invoiceNumber: 'INV-2026-004' }, // Split Limit check! Approval limit is 50,000 for standard managers. Wait, amount of 49,999 is highly suspicious.
  { id: 'TR-1005', date: '2026-05-04', amount: 49950, vendor: 'Tsehay Office Supplies', category: 'Stationery Supplies', initiator: 'Mekonnen Tadesse', approver: 'Mekonnen Tadesse', status: 'Approved', invoiceNumber: 'INV-2026-005' }, // Split Limit transaction! Consecutive transactions to same vendor under 50,000 threshold.
  { id: 'TR-1006', date: '2026-05-08', amount: 378000, vendor: 'Zemen Technology PLC', category: 'Hardware Spares', initiator: 'Aster Bekele', approver: 'Abebe Kebede', status: 'Approved', invoiceNumber: 'INV-2026-006' },
  { id: 'TR-1007', date: '2026-05-10', amount: 25000, vendor: 'Bole Auto Garage', category: 'Vehicle Repair', initiator: 'Lidya Tekle', approver: 'Amare Girma', status: 'Approved', invoiceNumber: 'INV-2026-007' },
  { id: 'TR-1008', date: '2026-05-11', amount: 924500, vendor: 'Aster Catering Service', category: 'Catering Hostings', initiator: 'Fasil Lemma', approver: 'Aster Bekele', status: 'Approved', invoiceNumber: 'INV-2026-009' }, // Sequence Gap check! Missing INV-2026-008
  { id: 'TR-1009', date: '2026-05-15', amount: 84000, vendor: 'Dil Construction Partner', category: 'Maintenance Services', initiator: 'Solomon Worku', approver: 'Amare Girma', status: 'Approved', invoiceNumber: 'INV-2026-010' },
  { id: 'TR-1010', date: '2026-05-18', amount: 4895000, vendor: 'Abyssinia Core Systems', category: 'Enterprise Software', initiator: 'Aster Bekele', approver: 'Abebe Kebede', status: 'Approved', invoiceNumber: 'INV-2026-011' },
  { id: 'TR-1011', date: '2026-05-20', amount: 12000, vendor: 'Tsehay Office Supplies', category: 'Stationery Supplies', initiator: 'Amare Girma', approver: 'Amare Girma', status: 'Approved', invoiceNumber: 'INV-2026-012' },
  { id: 'TR-1012', date: '2026-05-22', amount: 32000, vendor: 'Ethiopian Airlines Group', category: 'Travel & Flights', initiator: 'Tigist Assefa', approver: 'Abebe Kebede', status: 'Approved', invoiceNumber: 'INV-2026-013' }
];

export const initialSystemLogs: SystemLog[] = [
  { id: 'log-1', timestamp: '2026-06-06T08:15:00Z', user: 'akebede@bank.et', role: 'Admin', action: 'User Creation', details: 'Added new auditor profile: (sdemeke@bank.et)', ipAddress: '192.168.12.45' },
  { id: 'log-2', timestamp: '2026-06-06T08:24:12Z', user: 'akebede@bank.et', role: 'Admin', action: 'Annual Plan Status Update', details: 'Approved Q1 Audit Universe Planning Items', ipAddress: '192.168.12.45' },
  { id: 'log-3', timestamp: '2026-06-06T08:45:30Z', user: 'tassefa@bank.et', role: 'Manager', action: 'Engagement Initiated', details: 'Transferred planned item p-1 to active engagement: eng-101', ipAddress: '192.168.12.18' },
  { id: 'log-4', timestamp: '2026-06-06T08:48:15Z', user: 'yhailu@bank.et', role: 'Team Leader', action: 'SLA Escalation Notification Service', details: 'Triggered Level 1 Email Alert: Auditee response for finding fnd-202 is overdue by 37 days.', ipAddress: '192.168.14.110' }
];
