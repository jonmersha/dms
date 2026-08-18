import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Shield, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Trash2, 
  Edit3, 
  Award, 
  Briefcase, 
  RefreshCw, 
  X, 
  Check, 
  Search, 
  HelpCircle, 
  UserCheck,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  ClipboardCheck,
  Terminal,
  Activity,
  UserPlus
} from 'lucide-react';
import { User, UserRole } from '../types';

interface ResponsibilityTemplate {
  id: string;
  name: string;
  position: string;
  role: UserRole;
  category: 'Corporate Audit' | 'Branch Audit' | 'IT Audit' | '';
  duties: string[];
  responsibilities: string[];
  authority: string[];
  accountability: string[];
}

const DEFAULT_TEMPLATES: ResponsibilityTemplate[] = [
  {
    id: 'tpl-chief',
    name: 'Chief Internal Auditor Standard',
    position: 'Chief Internal Auditor',
    role: 'Admin',
    category: '',
    duties: [
      "Establish and refine risk-based annual audit plans that align with the bank's strategic vision.",
      "Present formal audit findings, operational exceptions, and progress reports directly to the Board Audit Committee.",
      "Coordinate with National Bank of Ethiopia (NBE), INSA, and external auditors to ensure comprehensive regulatory coverage.",
      "Supervise and develop audit division directors, team managers, and field personnel."
    ],
    responsibilities: [
      "Guarantee independence and absolute objectivity of all internal audit processes.",
      "Enforce rigorous quality controls aligned with IIA standards and banking laws.",
      "Safeguard confidential whistleblower channels and supervise sensitive financial investigations."
    ],
    authority: [
      "Unrestricted and immediate access to all banking systems, personnel, physical assets, and transaction vaults.",
      "Sole administrative authority to finalize audit scopes, draft ratings, and approve department expenditures.",
      "Direct, unmediated reporting access to the Board of Directors and executive leaders."
    ],
    accountability: [
      "Accountable directly to the Board Audit Committee for audit function integrity and delivery of annual plans.",
      "Validating correctness of critical remediation validations before closure approval.",
      "NBE regulatory compliance certification of the bank's internal control structures."
    ]
  },
  {
    id: 'tpl-dir-corp',
    name: 'Director of Corporate & Financial Audit',
    position: 'Director, Corporate & Financial Audit',
    role: 'Manager',
    category: 'Corporate Audit',
    duties: [
      "Review audit schedules, risk scoring registers, and draft audit programs.",
      "Direct major corporate reviews, credit risk assessments, and capital adequacy audits.",
      "Authorize final drafts of finding exceptions before escalation to the Chief Auditor.",
      "Manage resource allocations and travel budgets for the Corporate Audit division."
    ],
    responsibilities: [
      "Ensure financial audits comply with NBE guidelines, IFRS standards, and internal credit policies.",
      "Develop professional capabilities of corporate team leaders and senior field auditors."
    ],
    authority: [
      "First-line sign-off on corporate workpapers, analytical procedures, and draft reports.",
      "Authority to mandate corrective actions and credit file inspections in any HQ division."
    ],
    accountability: [
      "Reports directly to the Chief Internal Auditor.",
      "Accountable for Corporate Audit Division deliverables and SLA compliance for findings."
    ]
  },
  {
    id: 'tpl-dir-it',
    name: 'Director of IT & Cyber Security Audit',
    position: 'Director, IT & Cyber Security Audit',
    role: 'Manager',
    category: 'IT Audit',
    duties: [
      "Direct audits of critical banking applications, core databases, and server infrastructure.",
      "Ensure technology audits align with INSA cybersecurity frameworks and NBE directives.",
      "Oversee IT forensic investigations and analyze data breaches or unauthorized configurations.",
      "Guide technical development of CAAT analytics and automated duplication testing scripts."
    ],
    responsibilities: [
      "Verify security and integrity of core database environments (e.g., Delta System).",
      "Assess and mitigate technological risk profiles across fintech and mobile integrations."
    ],
    authority: [
      "Request system logs, source code reviews, security architecture diagrams, and DBA access records.",
      "Select specialized cyber-auditing tools and approve external IT audit consultants."
    ],
    accountability: [
      "Reports directly to the Chief Internal Auditor.",
      "Accountable for IT audit quality and finding accuracy on critical infrastructure."
    ]
  },
  {
    id: 'tpl-mgr-branch',
    name: 'Team Manager (Branch Operations)',
    position: 'Team Manager, Branch Network Operations',
    role: 'Team Leader',
    category: 'Branch Audit',
    duties: [
      "Oversee daily fieldwork of Field Auditors assigned to branch network inspections.",
      "Establish cash vault count procedures and supervise surprise physical currency verifications.",
      "Coordinate exit conferences with branch managers to discuss preliminary exceptions.",
      "Draft comprehensive branch audit programs based on individual branch risk rankings."
    ],
    responsibilities: [
      "Timely execution of branch audits in alignment with annual audit timelines.",
      "Ensure high standards of precision and documented evidence for branch network findings."
    ],
    authority: [
      "Command immediate access and sealing power over branch cash vaults during surprise inspections.",
      "First-line verification and approval of field team findings and working papers."
    ],
    accountability: [
      "Reports directly to the Director, Corporate & Financial Audit.",
      "Accountable for audit team safety, performance, and branch audit schedules."
    ]
  },
  {
    id: 'tpl-aud-cyber',
    name: 'Cybersecurity Audit Specialist',
    position: 'Cybersecurity Audit Specialist',
    role: 'Auditor',
    category: 'IT Audit',
    duties: [
      "Execute technical tests on critical database connections, port security, and API endpoints.",
      "Perform quarterly reviews of database administrator (DBA) credentials and access logs.",
      "Draft factual finding records including Criteria, Condition, Root Cause, and Impact."
    ],
    responsibilities: [
      "Document high-quality, comprehensive working papers verifying specific security controls.",
      "Verify compliance with INSA cybersecurity standards and database encryption directives."
    ],
    authority: [
      "Read-only access to IT configuration settings, network layouts, and active directory logs.",
      "Right to interview IT infrastructure engineers and system operators during reviews."
    ],
    accountability: [
      "Reports directly to Team Manager, Digital Banking & FinTech.",
      "Accountable for data confidentiality and precise detailing of technical vulnerabilities."
    ]
  },
  {
    id: 'tpl-aud-corp',
    name: 'Senior Financial Auditor',
    position: 'Senior Financial Auditor',
    role: 'Auditor',
    category: 'Corporate Audit',
    duties: [
      "Conduct sampling tests on general ledger reconciliations, credit files, and FX allocation ledgers.",
      "Test compliance controls against single borrower limits and treasury operations regulations.",
      "Document detailed audit exception write-ups backed by concrete documentary evidence."
    ],
    responsibilities: [
      "Ensure precision, professional skepticism, and completeness of financial working papers.",
      "Train junior auditors on sampling methodologies and financial transaction verification."
    ],
    authority: [
      "Access to customer folders, loan portfolios, general ledgers, and transaction documents.",
      "Right to raise findings for any treasury or credit file that breaches regulatory guidelines."
    ],
    accountability: [
      "Reports directly to Team Manager, Financial & Treasury Audit.",
      "Accountable for compliance with professional ethics, confidentiality, and finding clarity."
    ]
  }
];

const DEFAULT_STANDARDS = [
  {
    id: 'std-1',
    code: 'NBE/FX/87/2024',
    title: 'Foreign FX Allocation Accountability Directive',
    agency: 'National Bank of Ethiopia (NBE)',
    scope: 'HQ Treasury & Foreign Exchange Operations',
    description: 'Establishes strict licensing checks, prioritization logs, and validation workflows for transaction transfers exceeding $10,000 USD to prevent capital flight and ensure currency reserves transparency.',
    status: 'Active Compliance Monitoring'
  },
  {
    id: 'std-2',
    code: 'INSA/CYBER/09/2022',
    title: 'Critical Banking Systems Password and Access Controls',
    agency: 'INSA (Information Network Security Administration)',
    scope: 'Core IT Applications, Active Directory, & Database Admins',
    description: 'Mandates minimum 14-character alphanumeric passwords, multi-factor authentication for administrative users, quarterly rotation schedules, and immutable write-once read-many (WORM) storage for audit logging.',
    status: 'Mandatory Technical Standard'
  },
  {
    id: 'std-3',
    code: 'NBE/CR/12/2023',
    title: 'Single Borrower Limit Constraints Framework',
    agency: 'National Bank of Ethiopia (NBE)',
    scope: 'Corporate Lending, Underwriting, and Credit Approval',
    description: 'Defines risk exposure thresholds limiting consolidated bank credit extended to any individual borrower or single group of interrelated business entities to 25% of total paid-up bank capital.',
    status: 'Active Compliance Monitoring'
  },
  {
    id: 'std-4',
    code: 'IIA/IPPF-2024',
    title: 'International Professional Practices Framework (IIA Standards)',
    agency: 'Institute of Internal Auditors (IIA)',
    scope: 'Entire Internal Audit Department (All Personnel)',
    description: 'Global standard specifying baseline principles for independence, organizational objectivity, individual competency, formal quality assurance improvement programs (QAIP), and audit report disclosures.',
    status: 'Professional Standard'
  }
];

const DEFAULT_POLICIES = [
  {
    id: 'pol-1',
    title: 'Dual Authority Transaction Approvals Policy',
    category: 'Operational Risk Control',
    lastReviewDate: '2026-02-15',
    description: 'Enforces dual-signature key authorization requirements for all bank expenditures or asset transfers exceeding 1,000,000 ETB, preventing single-point transaction control failures.'
  },
  {
    id: 'pol-2',
    title: 'Surprise Cash & Vault Audit Policy',
    category: 'Branch Operations Quality Assurance',
    lastReviewDate: '2026-03-01',
    description: 'Mandates surprise, independent unannounced physical cash counts of major vault reserves at all branch network nodes. To be conducted by designated team leaders at least once per fiscal quarter.'
  },
  {
    id: 'pol-3',
    title: 'Digital Audit Working Papers Security & Retention Policy',
    category: 'Governance & Documentation',
    lastReviewDate: '2026-01-10',
    description: 'Specifies encryption standards for storing completed audit files and requires secure, off-site backup storage of all digital checklists, interview transcripts, and logged evidence for a minimum of seven (7) years.'
  },
  {
    id: 'pol-4',
    title: 'Whistleblower Independence Protection Directive',
    category: 'Corporate Governance Ethics',
    lastReviewDate: '2025-11-20',
    description: 'Guarantees absolute anonymity, employment protection, and non-retaliation for employees raising ethical or financial fraud concerns directly to the Chief Internal Auditor or Board Audit Committee.'
  }
];

interface StandardsPolicyViewProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  onLogAction: (action: string, details: string) => void;
  activeRole: UserRole;
  initialSegment?: 'Responsibilities' | 'Standards' | 'Policies';
  hideHeaderAndSelector?: boolean;
}

export default function StandardsPolicyView({ 
  users, 
  onUpdateUsers, 
  onLogAction, 
  activeRole,
  initialSegment,
  hideHeaderAndSelector = false
}: StandardsPolicyViewProps) {
  const [activeSegment, setActiveSegment] = useState<'Responsibilities' | 'Standards' | 'Policies'>(
    initialSegment || 'Responsibilities'
  );

  useEffect(() => {
    if (initialSegment) {
      setActiveSegment(initialSegment);
    }
  }, [initialSegment]);
  const [responsibilitiesSubView, setResponsibilitiesSubView] = useState<'staff' | 'templates'>('staff');

  // Search and Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userCategoryFilter, setUserCategoryFilter] = useState<string>('All');
  const [templateSearch, setTemplateSearch] = useState('');

  // Selected state for profiling
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Custom template state
  const [templates, setTemplates] = useState<ResponsibilityTemplate[]>(() => {
    const cached = localStorage.getItem('audit_responsibility_templates');
    return cached ? JSON.parse(cached) : DEFAULT_TEMPLATES;
  });

  // Keep templates state synced
  useEffect(() => {
    localStorage.setItem('audit_responsibility_templates', JSON.stringify(templates));
  }, [templates]);

  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this standardized responsibility template? Any employees mapped to this template will lose their standard baseline.')) {
      const templateName = templates.find(t => t.id === id)?.name || id;
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      
      // Update users who had this template mapped
      const updatedUsers = users.map(u => {
        if (u.responsibilityTemplateId === id) {
          return {
            ...u,
            responsibilityTemplateId: undefined,
            customDuties: undefined,
            customResponsibilities: undefined,
            customAuthority: undefined,
            customAccountability: undefined
          };
        }
        return u;
      });
      onUpdateUsers(updatedUsers);

      onLogAction(
        'Responsibility Template Deleted',
        `Permanently removed standardized responsibility template (${templateName}) and wiped mapped connections.`
      );
    }
  };

  // State for template creator/editor modal or panel
  const [editingTemplate, setEditingTemplate] = useState<ResponsibilityTemplate | null>(null);
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false);
  
  // Template Form fields
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Auditor');
  const [formCategory, setFormCategory] = useState<'Corporate Audit' | 'Branch Audit' | 'IT Audit' | ''>('');
  
  const [formDuties, setFormDuties] = useState<string[]>([]);
  const [formResponsibilities, setFormResponsibilities] = useState<string[]>([]);
  const [formAuthority, setFormAuthority] = useState<string[]>([]);
  const [formAccountability, setFormAccountability] = useState<string[]>([]);

  const [newInputDuty, setNewInputDuty] = useState('');
  const [newInputResp, setNewInputResp] = useState('');
  const [newInputAuth, setNewInputAuth] = useState('');
  const [newInputAcc, setNewInputAcc] = useState('');

  // Handle open template editor
  const handleOpenTemplateEdit = (tpl: ResponsibilityTemplate) => {
    setEditingTemplate(tpl);
    setIsCreatingNewTemplate(false);
    setFormName(tpl.name);
    setFormPosition(tpl.position);
    setFormRole(tpl.role);
    setFormCategory(tpl.category);
    setFormDuties([...tpl.duties]);
    setFormResponsibilities([...tpl.responsibilities]);
    setFormAuthority([...tpl.authority]);
    setFormAccountability([...tpl.accountability]);
  };

  const handleOpenNewTemplateForm = () => {
    setEditingTemplate(null);
    setIsCreatingNewTemplate(true);
    setFormName('');
    setFormPosition('');
    setFormRole('Auditor');
    setFormCategory('');
    setFormDuties([]);
    setFormResponsibilities([]);
    setFormAuthority([]);
    setFormAccountability([]);
  };

  const handleSaveTemplateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPosition.trim()) {
      alert('Template Name and Target Job Position are required.');
      return;
    }

    if (isCreatingNewTemplate) {
      const newTpl: ResponsibilityTemplate = {
        id: `tpl-${Date.now()}`,
        name: formName,
        position: formPosition,
        role: formRole,
        category: formCategory,
        duties: formDuties.length > 0 ? formDuties : ['Perform assigned audits.'],
        responsibilities: formResponsibilities.length > 0 ? formResponsibilities : ['Compliance with department standards.'],
        authority: formAuthority.length > 0 ? formAuthority : ['Access to assigned systems.'],
        accountability: formAccountability.length > 0 ? formAccountability : ['Reporting to supervisor.']
      };
      setTemplates(prev => [...prev, newTpl]);
      setIsCreatingNewTemplate(false);
      onLogAction('Responsibility Template Registered', `Created a new standard template: "${newTpl.name}" for position: "${newTpl.position}"`);
    } else if (editingTemplate) {
      const updated = templates.map(t => {
        if (t.id === editingTemplate.id) {
          return {
            ...t,
            name: formName,
            position: formPosition,
            role: formRole,
            category: formCategory,
            duties: formDuties,
            responsibilities: formResponsibilities,
            authority: formAuthority,
            accountability: formAccountability
          };
        }
        return t;
      });
      setTemplates(updated);
      setEditingTemplate(null);
      onLogAction('Responsibility Template Updated', `Updated standardized template: "${formName}"`);
    }
  };

  // Alignment check utility
  const checkAlignment = (user: User, template: ResponsibilityTemplate | undefined) => {
    if (!template) {
      return { 
        status: 'unassigned', 
        text: 'Unassigned Framework', 
        color: 'text-slate-500 bg-slate-50 border-slate-200' 
      };
    }
    
    const roleMatch = user.role === template.role;
    const categoryMatch = !template.category || user.category === template.category;
    
    if (roleMatch && categoryMatch) {
      return { 
        status: 'aligned', 
        text: 'Fully Aligned', 
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200' 
      };
    } else {
      const issues = [];
      if (!roleMatch) issues.push(`Role mismatch: User is ${user.role}, Template is ${template.role}`);
      if (!categoryMatch) issues.push(`Category mismatch: User is ${user.category || 'None'}, Template is ${template.category}`);
      return { 
        status: 'mismatched', 
        text: 'Discrepancy Detected', 
        color: 'text-amber-700 bg-amber-50 border-amber-250',
        details: issues.join(' | ')
      };
    }
  };

  // Staff realignment engine
  const handleAutoAlignAllUsers = () => {
    const updatedUsers = users.map(u => {
      let matchedTemplateId = u.responsibilityTemplateId;
      
      if (u.role === 'Admin') {
        matchedTemplateId = 'tpl-chief';
      } else if (u.role === 'Manager') {
        if (u.category === 'IT Audit' || u.department.toLowerCase().includes('it')) {
          matchedTemplateId = 'tpl-dir-it';
        } else {
          matchedTemplateId = 'tpl-dir-corp';
        }
      } else if (u.role === 'Team Leader') {
        matchedTemplateId = 'tpl-mgr-branch';
      } else if (u.role === 'Auditor') {
        if (u.category === 'IT Audit' || u.department.toLowerCase().includes('it')) {
          matchedTemplateId = 'tpl-aud-cyber';
        } else {
          matchedTemplateId = 'tpl-aud-corp';
        }
      }
      
      if (matchedTemplateId) {
        return {
          ...u,
          responsibilityTemplateId: matchedTemplateId,
          customDuties: undefined,
          customResponsibilities: undefined,
          customAuthority: undefined,
          customAccountability: undefined
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    
    if (selectedUser) {
      const refreshed = updatedUsers.find(u => u.id === selectedUser.id);
      if (refreshed) setSelectedUser(refreshed);
    }

    onLogAction(
      'Automated Responsibility Realignment',
      `Triggered automated reconciliation. Mapped standardized responsibility matrices for ${updatedUsers.length} personnel profiles.`
    );

    alert('Department structural reconciliation complete! Standardized profiles auto-aligned based on SSO categories, positions, and reporting departments.');
  };

  // Custom Override helpers
  const handleAssignTemplateToUser = (userId: string, templateId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          responsibilityTemplateId: templateId || undefined,
          customDuties: undefined,
          customResponsibilities: undefined,
          customAuthority: undefined,
          customAccountability: undefined
        };
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (updatedUser) setSelectedUser(updatedUser);
    
    const tplName = templates.find(t => t.id === templateId)?.name || 'None';
    onLogAction(
      'Responsibility Template Mapped',
      `Assigned template "${tplName}" to employee (${selectedUser?.name || userId}). Clear overrides initiated.`
    );
  };

  const handleAddCustomItem = (userId: string, type: 'duties' | 'responsibilities' | 'authority' | 'accountability', value: string) => {
    if (!value.trim()) return;
    const template = templates.find(t => t.id === selectedUser?.responsibilityTemplateId);
    
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (type === 'duties') {
          const current = u.customDuties || (template ? template.duties : []);
          return { ...u, customDuties: [...current, value] };
        } else if (type === 'responsibilities') {
          const current = u.customResponsibilities || (template ? template.responsibilities : []);
          return { ...u, customResponsibilities: [...current, value] };
        } else if (type === 'authority') {
          const current = u.customAuthority || (template ? template.authority : []);
          return { ...u, customAuthority: [...current, value] };
        } else {
          const current = u.customAccountability || (template ? template.accountability : []);
          return { ...u, customAccountability: [...current, value] };
        }
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (updatedUser) setSelectedUser(updatedUser);
    
    onLogAction(
      'Responsibility Override Appended',
      `Added custom ${type.slice(0, -1)} for staff (${selectedUser?.name}): "${value}"`
    );
  };

  const handleDeleteCustomItem = (userId: string, type: 'duties' | 'responsibilities' | 'authority' | 'accountability', index: number) => {
    const template = templates.find(t => t.id === selectedUser?.responsibilityTemplateId);
    
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (type === 'duties') {
          const current = u.customDuties || (template ? [...template.duties] : []);
          const updated = current.filter((_, i) => i !== index);
          return { ...u, customDuties: updated };
        } else if (type === 'responsibilities') {
          const current = u.customResponsibilities || (template ? [...template.responsibilities] : []);
          const updated = current.filter((_, i) => i !== index);
          return { ...u, customResponsibilities: updated };
        } else if (type === 'authority') {
          const current = u.customAuthority || (template ? [...template.authority] : []);
          const updated = current.filter((_, i) => i !== index);
          return { ...u, customAuthority: updated };
        } else {
          const current = u.customAccountability || (template ? [...template.accountability] : []);
          const updated = current.filter((_, i) => i !== index);
          return { ...u, customAccountability: updated };
        }
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (updatedUser) setSelectedUser(updatedUser);
    
    onLogAction(
      'Responsibility Override Removed',
      `Removed custom ${type.slice(0, -1)} index ${index} from employee (${selectedUser?.name})`
    );
  };

  const handleResetToTemplate = (userId: string) => {
    if (confirm('Are you sure you want to revert this employee to default template specs? This will clear all custom duties, authorities, and accountability logs.')) {
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            customDuties: undefined,
            customResponsibilities: undefined,
            customAuthority: undefined,
            customAccountability: undefined
          };
        }
        return u;
      });
      onUpdateUsers(updatedUsers);
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) setSelectedUser(updatedUser);
      
      onLogAction(
        'Responsibility Profile Reset',
        `Restored default template-level alignment specs for employee (${selectedUser?.name}).`
      );
    }
  };

  // Reset all templates to original system standards
  const handleRestoreSystemTemplates = () => {
    if (confirm('Are you sure you want to restore the default standardized system templates? Any modifications you made to the core template specifications will be overwritten.')) {
      setTemplates(DEFAULT_TEMPLATES);
      onLogAction('System Templates Restored', 'Reverted all responsibility templates to default corporate registry specifications.');
      alert('Default standardized responsibility templates have been restored!');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
                          (u.title && u.title.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesCategory = userCategoryFilter === 'All' || u.category === userCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredTemplates = templates.filter(t => {
    return t.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
           t.position.toLowerCase().includes(templateSearch.toLowerCase()) || 
           t.role.toLowerCase().includes(templateSearch.toLowerCase());
  });

  // Direct active lists for rendering overrides
  const getActiveDuties = (u: User, t: ResponsibilityTemplate | undefined) => {
    if (u.customDuties) return u.customDuties;
    return t ? t.duties : [];
  };

  const getActiveResponsibilities = (u: User, t: ResponsibilityTemplate | undefined) => {
    if (u.customResponsibilities) return u.customResponsibilities;
    return t ? t.responsibilities : [];
  };

  const getActiveAuthority = (u: User, t: ResponsibilityTemplate | undefined) => {
    if (u.customAuthority) return u.customAuthority;
    return t ? t.authority : [];
  };

  const getActiveAccountability = (u: User, t: ResponsibilityTemplate | undefined) => {
    if (u.customAccountability) return u.customAccountability;
    return t ? t.accountability : [];
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden" id="governance_portal_view">
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Main Title Banner */}
          {!hideHeaderAndSelector && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  Governance Standards & Job Responsibilities Portal
                </h1>
                <p className="text-xs text-slate-500 font-medium pb-1.5">
                  Centralized registry for regulatory frameworks, corporate policies, and mapped employee duties, authorities, and accountabilities.
                </p>
              </div>
              
              {activeSegment === 'Responsibilities' && (
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={handleAutoAlignAllUsers}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    title="Auto-align templates based on employee titles and categories"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-650 animate-none" /> Automated Realignment
                  </button>
                  <button 
                    onClick={handleOpenNewTemplateForm}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Register New Template
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Segment Selector Tabs */}
          {!hideHeaderAndSelector && (
            <div className="flex gap-2 border-b border-slate-200">
              {[
                { id: 'Responsibilities', label: 'Responsibilities & Job Roles Framework', count: templates.length, icon: Users },
                { id: 'Standards', label: 'Regulatory Standards', count: DEFAULT_STANDARDS.length, icon: FileText },
                { id: 'Policies', label: 'Policies & Directives', count: DEFAULT_POLICIES.length, icon: Shield }
              ].map(seg => {
                const Icon = seg.icon;
                return (
                  <button
                    key={seg.id}
                    onClick={() => {
                      setActiveSegment(seg.id as any);
                      setSelectedUser(null);
                      setEditingTemplate(null);
                      setIsCreatingNewTemplate(false);
                    }}
                    className={`py-2 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      activeSegment === seg.id
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{seg.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeSegment === seg.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-150 text-slate-500'}`}>
                      {seg.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* SEGMENT 1: RESPONSIBILITIES & JOB ROLES */}
          {activeSegment === 'Responsibilities' && (
            <div className="space-y-6" id="responsibilities_sub_system">
              
              {/* Sub-view Toggle & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-3 bg-slate-100 p-1.5 rounded-xl w-fit">
                  <button
                    onClick={() => {
                      setResponsibilitiesSubView('staff');
                      setSelectedUser(null);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      responsibilitiesSubView === 'staff'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-650 hover:text-slate-900'
                    }`}
                  >
                    📋 Personnel Mappings & Alignment Verification
                  </button>
                  <button
                    onClick={() => {
                      setResponsibilitiesSubView('templates');
                      setEditingTemplate(null);
                      setIsCreatingNewTemplate(false);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      responsibilitiesSubView === 'templates'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-650 hover:text-slate-900'
                    }`}
                  >
                    🛠️ Standardized Template Frameworks Builder
                  </button>
                </div>

                {hideHeaderAndSelector && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAutoAlignAllUsers}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                      title="Auto-align templates based on employee titles and categories"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-650 animate-none" /> Automated Realignment
                    </button>
                    <button 
                      onClick={handleOpenNewTemplateForm}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Register New Template
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW 1A: PERSONNEL MAPPINGS */}
              {responsibilitiesSubView === 'staff' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="personnel_mapping_grid">
                  
                  {/* Left Table Panel: 2 Columns on desktop */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Action Bar & Filters */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search staff members by name, email, or position..."
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 font-mono">Division:</span>
                        <select
                          value={userCategoryFilter}
                          onChange={e => setUserCategoryFilter(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                        >
                          <option value="All">All Divisions</option>
                          <option value="Corporate Audit">Corporate Audit</option>
                          <option value="Branch Audit">Branch Audit</option>
                          <option value="IT Audit">IT Audit</option>
                        </select>
                      </div>
                    </div>

                    {/* Employee Directory List */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Employee Details</th>
                            <th className="p-4"> SSO Title & Dept</th>
                            <th className="p-4">Mapped Standard Matrix</th>
                            <th className="p-4 text-center">Structural Alignment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-450 italic text-xs">
                                No staff records matching search criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map(u => {
                              const tpl = templates.find(t => t.id === u.responsibilityTemplateId);
                              const align = checkAlignment(u, tpl);
                              const isSelected = selectedUser?.id === u.id;

                              return (
                                <tr 
                                  key={u.id}
                                  onClick={() => setSelectedUser(u)}
                                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                    isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''
                                  }`}
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-[10px] border border-indigo-150">
                                        {u.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div>
                                        <span className="font-extrabold text-slate-800 text-xs block">{u.name}</span>
                                        <span className="text-[10px] font-mono text-slate-450 block leading-none">{u.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  <td className="p-4">
                                    <span className="font-bold text-slate-800 text-xs block truncate max-w-[170px]" title={u.title}>
                                      {u.title || 'Audit Officer'}
                                    </span>
                                    <span className="text-[9px] font-bold text-indigo-650 block leading-none uppercase mt-0.5">
                                      {u.department}
                                    </span>
                                  </td>

                                  <td className="p-4">
                                    {tpl ? (
                                      <div className="flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]" title={tpl.name}>
                                          {tpl.name}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-amber-600 font-bold italic">Unassigned Matrix</span>
                                    )}
                                  </td>

                                  <td className="p-4 text-center">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${align.color}`}>
                                        {align.status === 'aligned' ? (
                                          <CheckCircle2 className="w-3 h-3 text-emerald-650" />
                                        ) : align.status === 'mismatched' ? (
                                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        ) : (
                                          <HelpCircle className="w-3 h-3 text-slate-450" />
                                        )}
                                        <span>{align.text}</span>
                                      </span>
                                      {align.status === 'mismatched' && (
                                        <span className="text-[9px] text-amber-700 font-medium font-mono text-center max-w-[140px] truncate block" title={align.details}>
                                          {align.details}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>

                  {/* Right Detail / Override Panel: 1 Column on desktop */}
                  <div className="space-y-4">
                    {selectedUser ? (
                      (() => {
                        const tpl = templates.find(t => t.id === selectedUser.responsibilityTemplateId);
                        const align = checkAlignment(selectedUser, tpl);
                        const activeDuties = getActiveDuties(selectedUser, tpl);
                        const activeResps = getActiveResponsibilities(selectedUser, tpl);
                        const activeAuth = getActiveAuthority(selectedUser, tpl);
                        const activeAcc = getActiveAccountability(selectedUser, tpl);
                        
                        const hasOverrides = !!(selectedUser.customDuties || selectedUser.customResponsibilities || selectedUser.customAuthority || selectedUser.customAccountability);

                        return (
                          <div className="bg-white border border-slate-250 rounded-xl p-5 shadow-xs space-y-5 animate-fade-in" id="profile_details_panel">
                            
                            {/* Panel Header */}
                            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h2 className="text-sm font-extrabold text-slate-900">Mapped Responsibility Matrix</h2>
                                  {hasOverrides && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                                      Custom Overrides
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                  SSO Identity: <strong className="text-slate-800">{selectedUser.name}</strong>
                                </p>
                              </div>
                              <button 
                                onClick={() => setSelectedUser(null)}
                                className="text-slate-400 hover:text-slate-650 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Staff Meta Info Card */}
                            <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-100 text-xs">
                              <div>
                                <span className="text-slate-450 font-bold text-[9px] block uppercase tracking-wider">Corporate Title</span>
                                <span className="font-extrabold text-slate-800">{selectedUser.title || 'Officer'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                <div>
                                  <span className="text-slate-450 font-bold text-[9px] block uppercase tracking-wider">SSO Authority Role</span>
                                  <span className="font-bold text-slate-700">{selectedUser.role}</span>
                                </div>
                                <div>
                                  <span className="text-slate-450 font-bold text-[9px] block uppercase tracking-wider">Direct Supervisor</span>
                                  <span className="font-semibold text-slate-700 truncate block max-w-[120px]" title={selectedUser.reportsToName}>
                                    {selectedUser.reportsToName || 'Board Audit Committee'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Alignment Status Diagnostic */}
                            <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${align.color}`}>
                              {align.status === 'aligned' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                              ) : align.status === 'mismatched' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              ) : (
                                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="font-extrabold block">Structure Verification: {align.text}</span>
                                {align.status === 'mismatched' ? (
                                  <p className="text-[10px] text-amber-800 font-medium mt-0.5 leading-snug">
                                    {align.details}. Mapped responsibility details should be reconciled to align with organizational rules.
                                  </p>
                                ) : align.status === 'unassigned' ? (
                                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                    No governance framework mapped to this user account. Use the dropdown below to bind standard requirements.
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                                    Personnel qualifications, job position, and administrative SSO clearances align perfectly with this template.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Template Binding Selector */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                Assign Standardized Template Baseline
                              </label>
                              <select
                                value={selectedUser.responsibilityTemplateId || ''}
                                onChange={e => handleAssignTemplateToUser(selectedUser.id, e.target.value)}
                                className="w-full px-2.5 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer focus:bg-white focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">-- No Standard Template Assigned --</option>
                                {templates.map(t => (
                                  <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
                                ))}
                              </select>
                            </div>

                            {/* Interactive lists of Active Duties, Authorities, Accountabilities with Overrides */}
                            {tpl ? (
                              <div className="space-y-4 pt-1 max-h-[500px] overflow-y-auto pr-1">
                                
                                {/* 1. DUTIES */}
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                      📋 Duties ({activeDuties.length})
                                    </span>
                                    {selectedUser.customDuties && (
                                      <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded uppercase">Modified</span>
                                    )}
                                  </div>
                                  <ul className="space-y-1.5">
                                    {activeDuties.map((item, idx) => (
                                      <li key={idx} className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-normal text-slate-700 relative group">
                                        <span>{item}</span>
                                        <button
                                          onClick={() => handleDeleteCustomItem(selectedUser.id, 'duties', idx)}
                                          className="absolute right-1.5 top-1.5 text-slate-450 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                          title="Delete duty override"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                  {/* Inline Form to add override */}
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Add custom duty override..."
                                      id="add_duty_input"
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const el = e.currentTarget;
                                          handleAddCustomItem(selectedUser.id, 'duties', el.value);
                                          el.value = '';
                                        }
                                      }}
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById('add_duty_input') as HTMLInputElement;
                                        if (input && input.value) {
                                          handleAddCustomItem(selectedUser.id, 'duties', input.value);
                                          input.value = '';
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>

                                {/* 2. RESPONSIBILITIES */}
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                      🎯 Responsibilities ({activeResps.length})
                                    </span>
                                    {selectedUser.customResponsibilities && (
                                      <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded uppercase">Modified</span>
                                    )}
                                  </div>
                                  <ul className="space-y-1.5">
                                    {activeResps.map((item, idx) => (
                                      <li key={idx} className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-normal text-slate-700 relative group">
                                        <span>{item}</span>
                                        <button
                                          onClick={() => handleDeleteCustomItem(selectedUser.id, 'responsibilities', idx)}
                                          className="absolute right-1.5 top-1.5 text-slate-450 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Add custom responsibility..."
                                      id="add_resp_input"
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const el = e.currentTarget;
                                          handleAddCustomItem(selectedUser.id, 'responsibilities', el.value);
                                          el.value = '';
                                        }
                                      }}
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById('add_resp_input') as HTMLInputElement;
                                        if (input && input.value) {
                                          handleAddCustomItem(selectedUser.id, 'responsibilities', input.value);
                                          input.value = '';
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>

                                {/* 3. AUTHORITY */}
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                      ⚡ Authority & Threshold Clearances ({activeAuth.length})
                                    </span>
                                    {selectedUser.customAuthority && (
                                      <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded uppercase">Modified</span>
                                    )}
                                  </div>
                                  <ul className="space-y-1.5">
                                    {activeAuth.map((item, idx) => (
                                      <li key={idx} className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-normal text-slate-700 relative group">
                                        <span>{item}</span>
                                        <button
                                          onClick={() => handleDeleteCustomItem(selectedUser.id, 'authority', idx)}
                                          className="absolute right-1.5 top-1.5 text-slate-450 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Add custom signing limit or system access..."
                                      id="add_auth_input"
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const el = e.currentTarget;
                                          handleAddCustomItem(selectedUser.id, 'authority', el.value);
                                          el.value = '';
                                        }
                                      }}
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById('add_auth_input') as HTMLInputElement;
                                        if (input && input.value) {
                                          handleAddCustomItem(selectedUser.id, 'authority', input.value);
                                          input.value = '';
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>

                                {/* 4. ACCOUNTABILITY */}
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                      🛡️ Accountability & Deliverables ({activeAcc.length})
                                    </span>
                                    {selectedUser.customAccountability && (
                                      <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded uppercase">Modified</span>
                                    )}
                                  </div>
                                  <ul className="space-y-1.5">
                                    {activeAcc.map((item, idx) => (
                                      <li key={idx} className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-normal text-slate-700 relative group">
                                        <span>{item}</span>
                                        <button
                                          onClick={() => handleDeleteCustomItem(selectedUser.id, 'accountability', idx)}
                                          className="absolute right-1.5 top-1.5 text-slate-450 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Add custom reporting accountability..."
                                      id="add_acc_input"
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const el = e.currentTarget;
                                          handleAddCustomItem(selectedUser.id, 'accountability', el.value);
                                          el.value = '';
                                        }
                                      }}
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById('add_acc_input') as HTMLInputElement;
                                        if (input && input.value) {
                                          handleAddCustomItem(selectedUser.id, 'accountability', input.value);
                                          input.value = '';
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>

                                {/* Revert to Standard Button */}
                                {hasOverrides && (
                                  <button
                                    onClick={() => handleResetToTemplate(selectedUser.id)}
                                    className="w-full mt-4 bg-slate-100 hover:bg-slate-150 text-slate-700 border border-slate-200 font-extrabold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                                    Revert to Template Defaults
                                  </button>
                                )}

                              </div>
                            ) : (
                              <div className="text-center py-6 text-slate-450 italic text-xs border-t border-slate-100">
                                Assign a baseline template to specify duties, authority thresholds, and performance metrics for this team member.
                              </div>
                            )}

                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs h-full flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                          <Info className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800">No Employee Selected</h4>
                        <p className="text-xs text-slate-450 leading-relaxed max-w-xs mt-1.5">
                          Select any employee from the personnel list to review and modify their custom duties, sign-off limits, and check structural alignment diagnostics.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* VIEW 1B: STANDARD TEMPLATE BUILDER */}
              {responsibilitiesSubView === 'templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="template_builder_grid">
                  
                  {/* Left Column: Template List */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">Core System Templates</span>
                        <button 
                          onClick={handleRestoreSystemTemplates}
                          className="text-[10px] text-indigo-650 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
                          title="Restore default templates"
                        >
                          <RefreshCw className="w-3 h-3" /> Restore Defaults
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search templates..."
                          value={templateSearch}
                          onChange={e => setTemplateSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
                        {filteredTemplates.map(t => {
                          const isEditingThis = editingTemplate?.id === t.id;
                          return (
                            <div 
                              key={t.id}
                              className={`p-3 rounded-lg border text-left transition-all relative group cursor-pointer ${
                                isEditingThis 
                                  ? 'border-indigo-400 bg-indigo-50/30' 
                                  : 'border-slate-150 bg-slate-50/50 hover:border-slate-300'
                              }`}
                              onClick={() => handleOpenTemplateEdit(t)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-extrabold text-slate-800 text-xs block">{t.name}</span>
                                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Position: {t.position}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTemplate(t.id);
                                  }}
                                  className="text-slate-400 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                                  title="Delete standardized template"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase border border-indigo-100">
                                  Role: {t.role}
                                </span>
                                {t.category && (
                                  <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase border border-slate-200">
                                    {t.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Template Creator / Editor Form */}
                  <div className="lg:col-span-2">
                    {isCreatingNewTemplate || editingTemplate ? (
                      <form onSubmit={handleSaveTemplateForm} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-fade-in">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-800">
                              {isCreatingNewTemplate ? '🔗 Register Standardized Matrix Template' : `🛠️ Edit Standard: ${editingTemplate?.name}`}
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              Define standardized duties, authorizations, and deliverables for job positions to maintain departmental alignment.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewTemplate(false);
                              setEditingTemplate(null);
                            }}
                            className="text-slate-400 hover:text-slate-650 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Basic Meta fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Template Identity Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. IT Audit Associate Standard Matrix"
                              value={formName}
                              onChange={e => setFormName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Target Job Position Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Senior Cybersecurity Auditor"
                              value={formPosition}
                              onChange={e => setFormPosition(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">SSO Clearance Role Mapping</label>
                            <select
                              value={formRole}
                              onChange={e => setFormRole(e.target.value as UserRole)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer focus:bg-white"
                            >
                              <option value="Admin">Chief Auditor (Admin)</option>
                              <option value="Manager">Sub-Process Director (Manager)</option>
                              <option value="Team Leader">Team Manager (Team Leader)</option>
                              <option value="Auditor">Field Auditor</option>
                              <option value="Auditee">Business Auditee</option>
                              <option value="Executive">Executive Board (Audit Committee)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Audit Specialization Category</label>
                            <select
                              value={formCategory}
                              onChange={e => setFormCategory(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer focus:bg-white"
                            >
                              <option value="">General (Management / Board)</option>
                              <option value="Corporate Audit">Corporate Audit</option>
                              <option value="Branch Audit">Branch Audit</option>
                              <option value="IT Audit">IT Audit</option>
                            </select>
                          </div>
                        </div>

                        {/* Interactive list builders for duties, resps, authority, acc */}
                        <div className="space-y-4 pt-2">
                          
                          {/* 1. DUTIES */}
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block tracking-wider">Duties List ({formDuties.length})</label>
                            <div className="space-y-1.5">
                              {formDuties.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-relaxed text-slate-700">
                                  <span>{item}</span>
                                  <button
                                    type="button"
                                    onClick={() => setFormDuties(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-slate-400 hover:text-red-650 cursor-pointer p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add standard responsibility duty..."
                                value={newInputDuty}
                                onChange={e => setNewInputDuty(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newInputDuty.trim()) {
                                      setFormDuties(prev => [...prev, newInputDuty.trim()]);
                                      setNewInputDuty('');
                                    }
                                  }
                                }}
                                className="flex-1 px-3 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newInputDuty.trim()) {
                                    setFormDuties(prev => [...prev, newInputDuty.trim()]);
                                    setNewInputDuty('');
                                  }
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 font-bold px-3 py-1.8 rounded-lg text-xs cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* 2. RESPONSIBILITIES */}
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block tracking-wider">Responsibilities List ({formResponsibilities.length})</label>
                            <div className="space-y-1.5">
                              {formResponsibilities.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-relaxed text-slate-700">
                                  <span>{item}</span>
                                  <button
                                    type="button"
                                    onClick={() => setFormResponsibilities(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-slate-400 hover:text-red-650 cursor-pointer p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add core compliance responsibility..."
                                value={newInputResp}
                                onChange={e => setNewInputResp(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newInputResp.trim()) {
                                      setFormResponsibilities(prev => [...prev, newInputResp.trim()]);
                                      setNewInputResp('');
                                    }
                                  }
                                }}
                                className="flex-1 px-3 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newInputResp.trim()) {
                                    setFormResponsibilities(prev => [...prev, newInputResp.trim()]);
                                    setNewInputResp('');
                                  }
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 font-bold px-3 py-1.8 rounded-lg text-xs cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* 3. AUTHORITY */}
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block tracking-wider">Authority & Signing limits ({formAuthority.length})</label>
                            <div className="space-y-1.5">
                              {formAuthority.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-relaxed text-slate-700">
                                  <span>{item}</span>
                                  <button
                                    type="button"
                                    onClick={() => setFormAuthority(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-slate-400 hover:text-red-650 cursor-pointer p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add access rights, budget approval limits, or audit ratings clearance..."
                                value={newInputAuth}
                                onChange={e => setNewInputAuth(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newInputAuth.trim()) {
                                      setFormAuthority(prev => [...prev, newInputAuth.trim()]);
                                      setNewInputAuth('');
                                    }
                                  }
                                }}
                                className="flex-1 px-3 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newInputAuth.trim()) {
                                    setFormAuthority(prev => [...prev, newInputAuth.trim()]);
                                    setNewInputAuth('');
                                  }
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 font-bold px-3 py-1.8 rounded-lg text-xs cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* 4. ACCOUNTABILITY */}
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block tracking-wider">Accountability & Reporting expectations ({formAccountability.length})</label>
                            <div className="space-y-1.5">
                              {formAccountability.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] font-medium leading-relaxed text-slate-700">
                                  <span>{item}</span>
                                  <button
                                    type="button"
                                    onClick={() => setFormAccountability(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-slate-400 hover:text-red-650 cursor-pointer p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add critical deliverables or Board oversight expectations..."
                                value={newInputAcc}
                                onChange={e => setNewInputAcc(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newInputAcc.trim()) {
                                      setFormAccountability(prev => [...prev, newInputAcc.trim()]);
                                      setNewInputAcc('');
                                    }
                                  }
                                }}
                                className="flex-1 px-3 py-1.8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newInputAcc.trim()) {
                                    setFormAccountability(prev => [...prev, newInputAcc.trim()]);
                                    setNewInputAcc('');
                                  }
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 font-bold px-3 py-1.8 rounded-lg text-xs cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Save Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewTemplate(false);
                              setEditingTemplate(null);
                            }}
                            className="bg-slate-100 hover:bg-slate-150 text-slate-700 border border-slate-200 font-extrabold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Save Standardized Template
                          </button>
                        </div>

                      </form>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs h-full flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 border border-indigo-100">
                          <Sliders className="w-5 h-5 text-indigo-600 animate-none" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800">Template Canvas</h4>
                        <p className="text-xs text-slate-450 leading-relaxed max-w-sm mt-1.5">
                          Select a standardized responsibility template from the left-hand column to modify, or register a new template to extend the governance framework baseline.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* SEGMENT 2: STANDARDS VIEW */}
          {activeSegment === 'Standards' && (
            <div className="space-y-4 animate-fade-in" id="regulatory_standards_tab">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase">National & International Audit Standards</h3>
                  <p className="text-xs text-slate-450 mt-0.5">
                    Official directives and industry protocols mapped within our system to evaluate operational compliance scores.
                  </p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Register Standards Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_STANDARDS.map(std => (
                  <div key={std.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-350 transition-colors space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-extrabold text-xs text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                          {std.code}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-2">{std.title}</h4>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[9px] uppercase border border-emerald-150 rounded px-2 py-0.5 shrink-0">
                        {std.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">{std.description}</p>
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-450 font-bold flex items-center gap-2">
                      <span>Agency: <strong className="text-slate-600 font-extrabold">{std.agency}</strong></span>
                      <span>•</span>
                      <span>Target Scope: <strong className="text-slate-600 font-extrabold">{std.scope}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEGMENT 3: POLICIES VIEW */}
          {activeSegment === 'Policies' && (
            <div className="space-y-4 animate-fade-in" id="policies_directives_tab">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase">Internal Corporate Audit Policies</h3>
                  <p className="text-xs text-slate-450 mt-0.5">
                    Formal operational rules and ethics statements declared by the Board of Directors to safeguard financial stability.
                  </p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Register Core Policy
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_POLICIES.map(pol => (
                  <div key={pol.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-350 transition-colors space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-slate-100 text-slate-650 font-bold text-[9px] uppercase border border-slate-200 rounded px-2 py-0.5">
                          {pol.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-2">{pol.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-450 font-semibold">
                        Reviewed: {pol.lastReviewDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">{pol.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
