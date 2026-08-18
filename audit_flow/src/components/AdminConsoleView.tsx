import React, { useState, useEffect } from 'react';
import { useAuditContext } from "../context/AuditContext";
import {
  Users,
  Grid,
  ShieldCheck,
  Power,
  Edit2,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Plus,
  Trash2,
  Database,
  Building,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  GitFork,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Shield,
  FileText,
  Key,
  Lock,
  ShieldAlert,
  Info,
  Sliders
} from 'lucide-react';
import { User, UserRole, AuditUniverseEntity, AnnualPlanItem, Engagement, Finding, ComplianceControl, SystemLog } from '../types';
import UniversePlanView from './UniversePlanView';
import StandardsPolicyView from './StandardsPolicyView';

const TEAMS_BY_CATEGORY: Record<'Corporate Audit' | 'Branch Audit' | 'IT Audit', string[]> = {
  'Corporate Audit': [
    'Corporate Operations Team',
    'Financial & Credit Section',
    'HQ Strategy & Risk Team'
  ],
  'Branch Audit': [
    'Branch Operations Audit Team',
    'Credit & Loan Audit Team',
    'Cash Management Team'
  ],
  'IT Audit': [
    'IT Infrastructure & Database Team',
    'IT Applications Team',
    'Cybersecurity & Network Audit Team'
  ]
};



export default function AdminConsoleView() {
  const { 
    users, setUsers: onUpdateUsers, 
    universe, setUniverse: onUpdateUniverse, 
    annualPlan, setAnnualPlan: onUpdateAnnualPlan, 
    engagements, setEngagements: onUpdateEngagements, 
    findings, setFindings: onUpdateFindings, 
    complianceControls, setComplianceControls: onUpdateComplianceControls, 
    handleLogSystemAction: onLogAction, 
    activeRole, 
    setActiveTab
  } = useAuditContext();
  const onExitConsole = () => setActiveTab('Dashboard & KPIs');

  // Current tab inside the Administration Console
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'universe' | 'templates' | 'taxonomy' | 'units' | 'system' | 'responsibilities' | 'standards' | 'policies'>('users');

  // Custom Modal States (to bypass iframe blocks on window.confirm/alert)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({
    isOpen: false,
    message: '',
    onConfirm: null
  });
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const showAlert = (message: string) => {
    setAlertDialog({ isOpen: true, message });
  };

  // --- 1. USER MANAGEMENT STATE ---
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('Auditor');
  const [editUserDept, setEditUserDept] = useState('');
  const [editUserCategory, setEditUserCategory] = useState<'Corporate Audit' | 'Branch Audit' | 'IT Audit' | ''>('');
  const [editUserTeam, setEditUserTeam] = useState('');
  const [editUserTitle, setEditUserTitle] = useState('');
  const [editUserReportsToId, setEditUserReportsToId] = useState('');
  
  // New Auditor Registration Editing State
  const [editUserEmployeeId, setEditUserEmployeeId] = useState('');
  const [editUserSubProcess, setEditUserSubProcess] = useState('');
  const [editUserEmploymentStatus, setEditUserEmploymentStatus] = useState<'Active' | 'Suspended' | 'On Leave' | 'Terminated'>('Active');
  const [editUserQualifications, setEditUserQualifications] = useState('');
  const [editUserExpertise, setEditUserExpertise] = useState('');
  const [editUserContactPhone, setEditUserContactPhone] = useState('');

  // Register user form state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Auditor');
  const [newUserDept, setNewUserDept] = useState('Internal Audit');
  const [newUserCategory, setNewUserCategory] = useState<'Corporate Audit' | 'Branch Audit' | 'IT Audit' | ''>('');
  const [newUserTeam, setNewUserTeam] = useState('');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserReportsToId, setNewUserReportsToId] = useState('');

  // New Auditor Registration Creating State
  const [newUserEmployeeId, setNewUserEmployeeId] = useState('');
  const [newUserSubProcess, setNewUserSubProcess] = useState('');
  const [newUserEmploymentStatus, setNewUserEmploymentStatus] = useState<'Active' | 'Suspended' | 'On Leave' | 'Terminated'>('Active');
  const [newUserQualifications, setNewUserQualifications] = useState('');
  const [newUserExpertise, setNewUserExpertise] = useState('');
  const [newUserContactPhone, setNewUserContactPhone] = useState('');

  // View toggle for ADFS User Directories: 'table' vs 'org-chart'
  const [userViewMode, setUserViewMode] = useState<'table' | 'org-chart'>('org-chart');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const getDefaultTitleForRole = (role: UserRole): string => {
    switch (role) {
      case 'Admin': return 'Chief Internal Auditor';
      case 'Manager': return 'Audit Director / Sub-Process Owner';
      case 'Team Leader': return 'Audit Team Leader / Manager';
      case 'Auditor': return 'Senior Field Auditor';
      case 'Auditee': return 'Process Owner / Auditee';
      case 'Executive': return 'Audit Committee Executive';
      default: return 'Internal Auditor';
    }
  };

  // --- 2. DYNAMIC TAXONOMY STATE (Synchronized from localStorage) ---
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const cached = localStorage.getItem('audit_custom_categories');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return ['Head Office Audit', 'IFB Audit', 'Branch Audit', 'IT Audit'];
  });

  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(() => {
    const cached = localStorage.getItem('audit_custom_subcategories_map');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      'IT Audit': ['Infrastructure', 'Applications', 'Security/Cybersecurity', 'System Administration', 'Networking'],
      'IFB Audit': ['Financing Murabaha', 'Mudaraba Operations', 'Sharia Compliance', 'IFB Savings & Deposits'],
      'Branch Audit': ['Operations Audit', 'Credit & Loan', 'Cash Management', 'Customer Service'],
      'Head Office Audit': ['Treasury & FX', 'HR Audit', 'Compliance Audit', 'Governance & Admin']
    };
  });

  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const [editingSubcategoryIndex, setEditingSubcategoryIndex] = useState<{ category: string, index: number } | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState('');

  // Local storage effects for Taxonomy
  useEffect(() => {
    localStorage.setItem('audit_custom_categories', JSON.stringify(categoriesList));
  }, [categoriesList]);

  useEffect(() => {
    localStorage.setItem('audit_custom_subcategories_map', JSON.stringify(subcategoriesMap));
  }, [subcategoriesMap]);

  // Form field state for adding custom taxonomy
  const [newCatInput, setNewCatInput] = useState('');
  const [newSubInputs, setNewSubInputs] = useState<Record<string, string>>({});

  // --- ROLE & PERMISSION MANAGEMENT STATE ---
  const FUNCTIONAL_AREAS = [
    'Audit Universe Management',
    'Risk Assessment',
    'Engagement Management',
    'Annual Audit Plan',
    'Checklist Template Management',
    'Audit Program Management',
    'Workpaper Management',
    'Fieldwork Management',
    'Finding Management',
    'Recommendation and Corrective Action Management',
    'Audit Reporting',
    'Follow-Up Management',
    'Dashboard and Reporting',
    'System Administration'
  ];

  const PERMISSION_TYPES = [
    'Read/View',
    'Create',
    'Write/Edit',
    'Delete',
    'Approve',
    'Submit',
    'Execute',
    'No Access'
  ];

  interface SystemRole {
    id: string;
    name: string;
    description: string;
    active: boolean;
    permissions: Record<string, string[]>;
  }

  const [systemRoles, setSystemRoles] = useState<SystemRole[]>(() => {
    const cached = localStorage.getItem('audit_system_roles');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    
    // Seed initial roles based on requirements and core roles
    return [
      {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Authorized IT and Security administrators with full system override capability.',
        active: true,
        permissions: {
          'Audit Universe Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Risk Assessment': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Engagement Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Annual Audit Plan': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Checklist Template Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Audit Program Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Workpaper Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Fieldwork Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Finding Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Recommendation and Corrective Action Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Audit Reporting': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Follow-Up Management': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'Dashboard and Reporting': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute'],
          'System Administration': ['Read/View', 'Create', 'Write/Edit', 'Delete', 'Approve', 'Submit', 'Execute']
        }
      },
      {
        id: 'role-director',
        name: 'Audit Director',
        description: 'Chief decision maker. Defines strategy, approves annual audit plans, risk levels, and audit report releases.',
        active: true,
        permissions: {
          'Audit Universe Management': ['Read/View', 'Create', 'Write/Edit', 'Approve'],
          'Risk Assessment': ['Read/View', 'Approve'],
          'Engagement Management': ['Read/View', 'Approve', 'Execute'],
          'Annual Audit Plan': ['Read/View', 'Approve'],
          'Checklist Template Management': ['Read/View', 'Approve'],
          'Audit Program Management': ['Read/View', 'Approve'],
          'Workpaper Management': ['Read/View', 'Approve'],
          'Fieldwork Management': ['Read/View', 'Approve'],
          'Finding Management': ['Read/View', 'Approve'],
          'Recommendation and Corrective Action Management': ['Read/View', 'Approve'],
          'Audit Reporting': ['Read/View', 'Approve'],
          'Follow-Up Management': ['Read/View', 'Approve'],
          'Dashboard and Reporting': ['Read/View', 'Execute'],
          'System Administration': ['Read/View']
        }
      },
      {
        id: 'role-manager',
        name: 'Audit Manager',
        description: 'Oversees specific audit categories, manages team assignments, and reviews fieldwork and finding entries.',
        active: true,
        permissions: {
          'Audit Universe Management': ['Read/View', 'Create', 'Write/Edit'],
          'Risk Assessment': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Engagement Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Annual Audit Plan': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Checklist Template Management': ['Read/View', 'Create', 'Write/Edit'],
          'Audit Program Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Workpaper Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Fieldwork Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Finding Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Recommendation and Corrective Action Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Audit Reporting': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Follow-Up Management': ['Read/View', 'Create', 'Write/Edit', 'Submit'],
          'Dashboard and Reporting': ['Read/View', 'Execute'],
          'System Administration': ['No Access']
        }
      },
      {
        id: 'role-leader',
        name: 'Lead Auditor',
        description: 'Supervises audit fieldwork directly. Reviews draft working papers and authorizes findings to be escalated.',
        active: true,
        permissions: {
          'Audit Universe Management': ['Read/View'],
          'Risk Assessment': ['Read/View', 'Create', 'Write/Edit'],
          'Engagement Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Annual Audit Plan': ['Read/View'],
          'Checklist Template Management': ['Read/View', 'Create', 'Write/Edit'],
          'Audit Program Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Workpaper Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Fieldwork Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Finding Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Recommendation and Corrective Action Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Audit Reporting': ['Read/View', 'Create', 'Write/Edit'],
          'Follow-Up Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Dashboard and Reporting': ['Read/View'],
          'System Administration': ['No Access']
        }
      },
      {
        id: 'role-auditor',
        name: 'Staff Auditor',
        description: 'Prepares and uploads working papers, conducts procedures, and drafts finding reports.',
        active: true,
        permissions: {
          'Audit Universe Management': ['Read/View'],
          'Risk Assessment': ['Read/View'],
          'Engagement Management': ['Read/View', 'Execute'],
          'Annual Audit Plan': ['Read/View'],
          'Checklist Template Management': ['Read/View'],
          'Audit Program Management': ['Read/View', 'Execute'],
          'Workpaper Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Fieldwork Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Finding Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Recommendation and Corrective Action Management': ['Read/View', 'Create', 'Write/Edit', 'Execute'],
          'Audit Reporting': ['Read/View'],
          'Follow-Up Management': ['Read/View', 'Execute'],
          'Dashboard and Reporting': ['Read/View'],
          'System Administration': ['No Access']
        }
      },
      {
        id: 'role-auditee',
        name: 'Process Owner (Auditee)',
        description: 'Process owners, branch managers, or system engineers who respond to and implement corrective actions.',
        active: true,
        permissions: {
          'Audit Universe Management': ['No Access'],
          'Risk Assessment': ['No Access'],
          'Engagement Management': ['Read/View'],
          'Annual Audit Plan': ['No Access'],
          'Checklist Template Management': ['No Access'],
          'Audit Program Management': ['No Access'],
          'Workpaper Management': ['No Access'],
          'Fieldwork Management': ['Read/View'],
          'Finding Management': ['Read/View'],
          'Recommendation and Corrective Action Management': ['Read/View', 'Write/Edit', 'Submit', 'Execute'],
          'Audit Reporting': ['Read/View'],
          'Follow-Up Management': ['Read/View', 'Write/Edit', 'Submit'],
          'Dashboard and Reporting': ['Read/View'],
          'System Administration': ['No Access']
        }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('audit_system_roles', JSON.stringify(systemRoles));
  }, [systemRoles]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-admin');
  const [roleViewMode, setRoleViewMode] = useState<'directory' | 'matrix' | 'assignments'>('directory');

  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleActive, setNewRoleActive] = useState(true);
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    FUNCTIONAL_AREAS.forEach(area => {
      initial[area] = ['No Access'];
    });
    return initial;
  });

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');
  const [editRoleActive, setEditRoleActive] = useState(true);
  const [editRolePermissions, setEditRolePermissions] = useState<Record<string, string[]>>({});

  // --- 3. AUDITING UNITS SECTION ---
  const [auditingUnitsList, setAuditingUnitsList] = useState<string[]>(() => {
    const cached = localStorage.getItem('audit_custom_auditing_units');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      'IT Audit Division',
      'Branch Audit Division',
      'Financial & Credit Audit Section',
      'Corporate Operations Audit Team',
      'Compliance & Fraud Investigation Division'
    ];
  });

  useEffect(() => {
    localStorage.setItem('audit_custom_auditing_units', JSON.stringify(auditingUnitsList));
  }, [auditingUnitsList]);

  const [newUnitInput, setNewUnitInput] = useState('');
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const [editUnitName, setEditUnitName] = useState('');

  // Sub-team management within auditing units
  const [unitSubTeamsMap, setUnitSubTeamsMap] = useState<Record<string, string[]>>(() => {
    const cached = localStorage.getItem('audit_custom_auditing_unit_subteams');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      'IT Audit Division': ['Infrastructure Audit Team', 'Cybersecurity Review Team', 'Core Banking Systems Team'],
      'Branch Audit Division': ['North Region Audit Team', 'South Region Audit Team', 'East Region Audit Team', 'West Region Audit Team'],
      'Financial & Credit Audit Section': ['Treasury & Investment Audit Team', 'IFB Financing Audit Team', 'Retail Lending Audit Team'],
      'Corporate Operations Audit Team': ['HQ Procurement Audit Team', 'HR & Administration Audit Team'],
      'Compliance & Fraud Investigation Division': ['Anti-Money Laundering Team', 'Special Investigations Team', 'Whistleblower Unit']
    };
  });

  useEffect(() => {
    localStorage.setItem('audit_custom_auditing_unit_subteams', JSON.stringify(unitSubTeamsMap));
  }, [unitSubTeamsMap]);

  // Track sub-team inputs per unit
  const [newSubTeamInputs, setNewSubTeamInputs] = useState<Record<string, string>>({});

  // Get eligible supervisors for a given role to construct a correct reporting hierarchy
  const getSupervisorsForRole = (role: UserRole): User[] => {
    if (role === 'Admin') return [];
    if (role === 'Manager') {
      // Directors report to Chief (role: Admin)
      return users.filter(u => u.role === 'Admin' || u.title?.toLowerCase().includes('chief'));
    }
    if (role === 'Team Leader') {
      // Team Managers report to Directors (role: Manager)
      return users.filter(u => u.role === 'Manager' || u.title?.toLowerCase().includes('director'));
    }
    if (role === 'Auditor') {
      // Field Auditors report to Team Managers (role: Team Leader)
      return users.filter(u => u.role === 'Team Leader' || u.title?.toLowerCase().includes('manager') || u.title?.toLowerCase().includes('leader'));
    }
    // Others report to any higher level or Manager
    return users.filter(u => u.role === 'Admin' || u.role === 'Manager' || u.role === 'Team Leader');
  };

  // Synchronize dynamic auditing units and subteams from Admin Console to EngagementView accordion tree
  const syncToAuditDepartmentStructure = (units: string[], subteamsMap: Record<string, string[]>, currentUsers: User[]) => {
    const structure = units.map(unit => {
      const director = currentUsers.find(u => u.department === unit && u.role === 'Manager');
      const leadName = director ? `${director.name} (Director)` : 'Director Unassigned';
      
      const subTeams = subteamsMap[unit] || [];
      
      return {
        name: unit,
        lead: leadName,
        teams: [
          {
            name: `${unit} Teams`,
            lead: leadName,
            subTeams: subTeams.map(subTeam => {
              const manager = currentUsers.find(u => u.department === unit && u.team === subTeam && u.role === 'Team Leader');
              const subLead = manager ? manager.name : 'Team Manager Unassigned';
              
              const members = currentUsers.filter(u => u.department === unit && u.team === subTeam && u.role === 'Auditor').map(u => u.name);
              
              return {
                name: subTeam,
                focus: `Custom fieldwork review and operations verification focused on ${subTeam} processes.`,
                lead: subLead,
                members: members.length > 0 ? members : ['Auditors Unassigned']
              };
            })
          }
        ]
      };
    });
    localStorage.setItem('AUDIT_DEPARTMENT_STRUCTURE', JSON.stringify(structure));
  };

  useEffect(() => {
    syncToAuditDepartmentStructure(auditingUnitsList, unitSubTeamsMap, users);
  }, [auditingUnitsList, unitSubTeamsMap, users]);

  // Checks if active profile has administrative clearance
  const isAdmin = activeRole === 'Admin';

  // --- ACTIONS FOR ROLE & PERMISSION MANAGEMENT ---
  const handlePermissionToggle = (roleId: string, area: string, perm: string) => {
    setSystemRoles(prev => prev.map(role => {
      if (role.id !== roleId) return role;
      
      const current = role.permissions[area] || [];
      let updated: string[] = [];
      
      if (perm === 'No Access') {
        if (current.includes('No Access')) {
          updated = ['Read/View'];
        } else {
          updated = ['No Access'];
        }
      } else {
        const withoutNoAccess = current.filter(p => p !== 'No Access');
        if (withoutNoAccess.includes(perm)) {
          updated = withoutNoAccess.filter(p => p !== perm);
          if (updated.length === 0) {
            updated = ['No Access'];
          }
        } else {
          updated = [...withoutNoAccess, perm];
        }
      }
      
      return {
        ...role,
        permissions: {
          ...role.permissions,
          [area]: updated
        }
      };
    }));
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showAlert('Please enter a unique name for the custom role.');
      return;
    }
    
    if (systemRoles.some(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      showAlert(`A role named "${newRoleName}" already exists.`);
      return;
    }
    
    const newRoleId = `role-custom-${Date.now()}`;
    const newRole: SystemRole = {
      id: newRoleId,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom administrative system role.',
      active: newRoleActive,
      permissions: { ...newRolePermissions }
    };
    
    setSystemRoles(prev => [...prev, newRole]);
    onLogAction('Role Created', `Created custom system role "${newRoleName}" with custom RBAC matrices.`);
    
    // Reset form
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRoleActive(true);
    const resetPerms: Record<string, string[]> = {};
    FUNCTIONAL_AREAS.forEach(area => {
      resetPerms[area] = ['No Access'];
    });
    setNewRolePermissions(resetPerms);
    setShowAddRoleForm(false);
    setRoleViewMode('directory');
    showAlert(`Custom role "${newRole.name}" created successfully.`);
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (roleId === 'role-admin' || roleId === 'role-director' || roleId === 'role-manager' || roleId === 'role-leader' || roleId === 'role-auditor' || roleId === 'role-auditee') {
      showAlert('Predefined system roles cannot be deleted to maintain system compliance.');
      return;
    }
    
    showConfirm(`Are you sure you want to completely delete the custom role "${roleName}"? Any users assigned to this role will default to 'Staff Auditor'.`, () => {
      const updatedUsers = users.map(u => {
        if (u.title === roleName) {
          return { ...u, role: 'Auditor' as UserRole, title: 'Staff Auditor' };
        }
        return u;
      });
      onUpdateUsers(updatedUsers);
      
      setSystemRoles(prev => prev.filter(r => r.id !== roleId));
      onLogAction('Role Deleted', `Completely deleted custom role "${roleName}" from system registries.`);
      showAlert(`Role "${roleName}" has been deleted.`);
    });
  };

  const handleToggleRoleStatus = (roleId: string, currentStatus: boolean, roleName: string) => {
    setSystemRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return { ...r, active: !currentStatus };
      }
      return r;
    }));
    const newStatus = !currentStatus ? 'Activated' : 'Deactivated';
    onLogAction('Role Status Changed', `${newStatus} system role "${roleName}".`);
  };

  const handleAssignUserRole = (userId: string, newRoleNameValue: string, userName: string) => {
    const standardRoles: Record<string, UserRole> = {
      'Administrator': 'Admin',
      'Audit Director': 'Manager',
      'Audit Manager': 'Manager',
      'Lead Auditor': 'Team Leader',
      'Staff Auditor': 'Auditor',
      'Process Owner (Auditee)': 'Auditee'
    };
    
    const baseRole: UserRole = standardRoles[newRoleNameValue] || 'Auditor';
    
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: baseRole,
          title: newRoleNameValue
        };
      }
      return u;
    });
    
    onUpdateUsers(updated);
    onLogAction('Role Assigned', `Reassigned user "${userName}" from their previous role to "${newRoleNameValue}".`);
    showAlert(`Successfully reassigned "${userName}" to "${newRoleNameValue}" role.`);
  };

  // --- ACTIONS FOR USERS ---
  const handleToggleUserActive = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextState = !u.active;
        onLogAction('User Status Mutation', `Switched active status of account ${u.email} to: ${nextState ? 'ENABLED' : 'DISABLED'}`);
        return { ...u, active: nextState };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleStartEditingUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserDept(user.department);
    setEditUserCategory(user.category || '');
    setEditUserTeam(user.team || '');
    setEditUserTitle(user.title || user.title || getDefaultTitleForRole(user.role));
    setEditUserReportsToId(user.reportsToId || '');
    
    // New Auditor fields initialization
    setEditUserEmployeeId(user.employeeId || '');
    setEditUserSubProcess(user.subProcess || '');
    setEditUserEmploymentStatus(user.employmentStatus || (user.active ? 'Active' : 'Suspended'));
    setEditUserQualifications(user.qualifications ? user.qualifications.join(', ') : '');
    setEditUserExpertise(user.expertise ? user.expertise.join(', ') : '');
    setEditUserContactPhone(user.contactPhone || '');
  };

  const handleSaveUserEdit = () => {
    if (!editUserName.trim() || !editUserEmail.trim()) {
      showAlert("Please fill in all blanks.");
      return;
    }
    const reportsToUser = users.find(u => u.id === editUserReportsToId);
    const reportsToName = reportsToUser ? `${reportsToUser.name} (${reportsToUser.title || reportsToUser.role})` : '';

    const qualsParsed = editUserQualifications.split(',').map(s => s.trim()).filter(Boolean);
    const expsParsed = editUserExpertise.split(',').map(s => s.trim()).filter(Boolean);

    const updated = users.map(u => {
      if (u.id === editingUserId) {
        let finalCategory = editUserCategory;
        let finalTeam = editUserTeam;
        if (editUserRole === 'Admin') {
          finalCategory = '';
          finalTeam = '';
        } else if (editUserRole === 'Manager' || editUserRole === 'Executive') {
          finalTeam = '';
        }
        onLogAction('User Account Modification', `Updated account info for ${u.email} (${editUserName}, Role: ${editUserRole}, Dept: ${editUserDept}, Category: ${finalCategory || 'N/A'}, Team: ${finalTeam || 'N/A'})`);
        return {
          ...u,
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          department: editUserDept,
          category: finalCategory,
          team: finalTeam,
          title: editUserTitle.trim() || getDefaultTitleForRole(editUserRole),
          reportsToId: editUserReportsToId,
          reportsToName: reportsToName,
          employeeId: editUserEmployeeId.trim(),
          subProcess: editUserSubProcess.trim(),
          employmentStatus: editUserEmploymentStatus,
          qualifications: qualsParsed,
          expertise: expsParsed,
          contactPhone: editUserContactPhone.trim(),
          active: editUserEmploymentStatus === 'Active'
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    setEditingUserId(null);
  };

  const handleRoleSelectionChange = (role: UserRole) => {
    setNewUserRole(role);
    setNewUserTitle(getDefaultTitleForRole(role));
    
    // Set appropriate department defaults
    if (role === 'Admin') {
      setNewUserDept('Internal Audit Department');
      setNewUserCategory('');
      setNewUserTeam('');
    } else {
      const defaultDept = auditingUnitsList[0] || 'IT Audit Division';
      setNewUserDept(defaultDept);
      
      if (defaultDept.toLowerCase().includes('it') || defaultDept.toLowerCase().includes('cyber')) {
        setNewUserCategory('IT Audit');
      } else if (defaultDept.toLowerCase().includes('branch')) {
        setNewUserCategory('Branch Audit');
      } else {
        setNewUserCategory('Corporate Audit');
      }
      
      const subTeams = unitSubTeamsMap[defaultDept] || [];
      setNewUserTeam(subTeams[0] || '');
    }

    const possibleSupervisors = getSupervisorsForRole(role);
    if (possibleSupervisors.length > 0) {
      setNewUserReportsToId(possibleSupervisors[0].id);
    } else {
      setNewUserReportsToId('');
    }
  };

  const handleClearDirectoryAndTeams = () => {
    showConfirm(
      'Are you sure you want to permanently clear the entire Audit Department Directory and all custom teams? This will remove all directors, team managers, and field auditors. Only the core administrators (Chief Internal Auditor and Board Chairman) will be retained to maintain login authority.',
      () => {
        // Retain usr-1 (Chief) and usr-11 (Board Chairman) so the administrative login remains active
        const coreUsers = users.filter(u => u.id === 'usr-1' || u.id === 'usr-11');
        onUpdateUsers(coreUsers);

        // Reset dynamic auditing divisions to a clean set
        const cleanUnits = [
          'IT Audit Division',
          'Branch Audit Division',
          'Financial & Credit Audit Section',
          'Corporate Operations Audit Team'
        ];
        setAuditingUnitsList(cleanUnits);

        // Reset subteams to empty
        const cleanSubTeams: Record<string, string[]> = {
          'IT Audit Division': [],
          'Branch Audit Division': [],
          'Financial & Credit Audit Section': [],
          'Corporate Operations Audit Team': []
        };
        setUnitSubTeamsMap(cleanSubTeams);

        // Log action
        onLogAction(
          'Wiped Directory & Teams',
          'Triggered a complete wipe of all non-core personnel and custom sub-teams inside the Active Directory SSO.'
        );

        showAlert('Audit Department Directory and Sub-teams have been successfully cleared to a fresh slate!');
      }
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showAlert("Name and Email are required properties.");
      return;
    }
    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase().trim())) {
      showAlert("Email already exists in ADFS Directory.");
      return;
    }
    
    let finalCategory = newUserCategory;
    let finalTeam = newUserTeam;
    if (newUserRole === 'Admin') {
      finalCategory = '';
      finalTeam = '';
    } else if (newUserRole === 'Manager' || newUserRole === 'Executive') {
      finalTeam = '';
    }

    const reportsToUser = users.find(u => u.id === newUserReportsToId);
    const reportsToName = reportsToUser ? `${reportsToUser.name} (${reportsToUser.title || reportsToUser.role})` : '';

    const qualsParsed = newUserQualifications.split(',').map(s => s.trim()).filter(Boolean);
    const expsParsed = newUserExpertise.split(',').map(s => s.trim()).filter(Boolean);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDept.trim(),
      active: newUserEmploymentStatus === 'Active',
      category: finalCategory,
      team: finalTeam,
      title: newUserTitle.trim() || getDefaultTitleForRole(newUserRole),
      reportsToId: newUserReportsToId,
      reportsToName: reportsToName,
      employeeId: newUserEmployeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
      subProcess: newUserSubProcess.trim(),
      employmentStatus: newUserEmploymentStatus,
      qualifications: qualsParsed,
      expertise: expsParsed,
      contactPhone: newUserContactPhone.trim()
    };
    onUpdateUsers([...users, newUser]);
    onLogAction('User Registration Created', `Registered new SSO Auditing account: ${newUser.email} (Employee ID: ${newUser.employeeId}) under category: ${newUser.category || 'N/A'}, team: ${newUser.team || 'N/A'}`);
    
    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserDept(auditingUnitsList[0] || 'IT Audit Division');
    setNewUserCategory('IT Audit');
    setNewUserTeam('');
    setNewUserTitle('');
    setNewUserReportsToId('');
    
    // Reset new registration states
    setNewUserEmployeeId('');
    setNewUserSubProcess('');
    setNewUserEmploymentStatus('Active');
    setNewUserQualifications('');
    setNewUserExpertise('');
    setNewUserContactPhone('');
    
    setShowAddUserForm(false);
  };

  // --- ACTIONS FOR TAXONOMY ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categoriesList.includes(trimmed)) {
      showAlert("Category already exists.");
      return;
    }
    setCategoriesList([...categoriesList, trimmed]);
    setSubcategoriesMap(prev => ({
      ...prev,
      [trimmed]: []
    }));
    setNewCatInput('');
    onLogAction('Taxonomy Category Created', `Added dynamic evaluation category: ${trimmed}`);
  };

  const handleUpdateCategory = (index: number) => {
    const oldName = categoriesList[index];
    const nextName = editCategoryName.trim();
    if (!nextName || oldName === nextName) {
      setEditingCategoryIndex(null);
      return;
    }

    // Replace in categories list
    const updatedCats = [...categoriesList];
    updatedCats[index] = nextName;
    setCategoriesList(updatedCats);

    // Replace in subcategories map
    setSubcategoriesMap(prev => {
      const copy = { ...prev };
      const content = copy[oldName] || [];
      delete copy[oldName];
      copy[nextName] = content;
      return copy;
    });

    // Cascade update to Universe Entities!
    const updatedUniverse = universe.map(ent => {
      if (ent.category === oldName) {
        return { ...ent, category: nextName };
      }
      return ent;
    });
    onUpdateUniverse(updatedUniverse);

    onLogAction('Taxonomy Category Renamed', `Renamed evaluation category "${oldName}" to "${nextName}" inside active taxonomy structure.`);
    setEditingCategoryIndex(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    showConfirm(`Are you sure you want to permanently delete category "${cat}"? This will clear its subcategories constraints and cascade to appropriate data.`, () => {
      setCategoriesList(categoriesList.filter(c => c !== cat));
      setSubcategoriesMap(prev => {
        const copy = { ...prev };
        delete copy[cat];
        return copy;
      });

      // Cascade universe entities to clear deleted categories
      const updatedUniverse = universe.map(ent => {
        if (ent.category === cat) {
          return { ...ent, category: 'Unassigned Category' };
        }
        return ent;
      });
      onUpdateUniverse(updatedUniverse);

      onLogAction('Taxonomy Category Removed', `Removed category "${cat}" and cascaded Unassigned state to matching elements.`);
    });
  };

  const handleAddSubcategory = (cat: string) => {
    const text = newSubInputs[cat]?.trim();
    if (!text) return;
    const currentSubs = subcategoriesMap[cat] || [];
    if (currentSubs.includes(text)) {
      showAlert("Subcategory already exists under this category.");
      return;
    }

    setSubcategoriesMap(prev => ({
      ...prev,
      [cat]: [...currentSubs, text]
    }));

    setNewSubInputs(prev => ({
      ...prev,
      [cat]: ''
    }));

    onLogAction('Taxonomy Subcategory Created', `Added nested subcategory "${text}" under categories division: ${cat}`);
  };

  const handleUpdateSubcategory = (cat: string, index: number) => {
    const oldName = subcategoriesMap[cat][index];
    const nextName = editSubcategoryName.trim();
    if (!nextName || oldName === nextName) {
      setEditingSubcategoryIndex(null);
      return;
    }

    const updatedSubs = [...(subcategoriesMap[cat] || [])];
    updatedSubs[index] = nextName;

    setSubcategoriesMap(prev => ({
      ...prev,
      [cat]: updatedSubs
    }));

    // Cascade rename to Audit Universe items which have this subcategory!
    const updatedUniverse = universe.map(ent => {
      if (ent.category === cat && ent.subcategory === oldName) {
        return { ...ent, subcategory: nextName };
      }
      return ent;
    });
    onUpdateUniverse(updatedUniverse);

    onLogAction('Taxonomy Subcategory Renamed', `Renamed subcategory "${oldName}" under "${cat}" to "${nextName}"`);
    setEditingSubcategoryIndex(null);
    setEditSubcategoryName('');
  };

  const handleDeleteSubcategory = (cat: string, sub: string) => {
    const currentSubs = subcategoriesMap[cat] || [];
    setSubcategoriesMap(prev => ({
      ...prev,
      [cat]: currentSubs.filter(s => s !== sub)
    }));

    // Reset subcategories in universe elements that match
    const updatedUniverse = universe.map(ent => {
      if (ent.category === cat && ent.subcategory === sub) {
        return { ...ent, subcategory: undefined };
      }
      return ent;
    });
    onUpdateUniverse(updatedUniverse);

    onLogAction('Taxonomy Subcategory Removed', `Removed "${sub}" from category "${cat}" index bounds`);
  };

  // --- ACTIONS FOR AUDITING UNITS ---
  const handleAddAuditingUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newUnitInput.trim();
    if (!val) return;
    if (auditingUnitsList.includes(val)) {
      showAlert("This division unit is already defined.");
      return;
    }
    setAuditingUnitsList([...auditingUnitsList, val]);
    setNewUnitInput('');
    onLogAction('Auditing Division Registered', `Registered dynamic auditing unit department: ${val}`);
  };

  const handleUpdateAuditingUnit = (index: number) => {
    const oldName = auditingUnitsList[index];
    const nextName = editUnitName.trim();
    if (!nextName || oldName === nextName) {
      setEditingUnitIndex(null);
      return;
    }

    const updated = [...auditingUnitsList];
    updated[index] = nextName;
    setAuditingUnitsList(updated);

    // Cascade modification to Audit Universe
    const updatedUniverse = universe.map(ent => {
      if (ent.auditingUnit === oldName) {
        return { ...ent, auditingUnit: nextName };
      }
      return ent;
    });
    onUpdateUniverse(updatedUniverse);

    onLogAction('Auditing Division Modified', `Changed designated audit unit name "${oldName}" to "${nextName}" globally.`);
    setEditingUnitIndex(null);
    setEditUnitName('');
  };

  const handleDeleteAuditingUnit = (unit: string) => {
    showConfirm(`Are you sure you want to delete designated Auditing Division Unit: "${unit}"?`, () => {
      setAuditingUnitsList(auditingUnitsList.filter(u => u !== unit));

      // Reset unit mapping on universe entities
      const updatedUniverse = universe.map(ent => {
        if (ent.auditingUnit === unit) {
          return { ...ent, auditingUnit: undefined };
        }
        return ent;
      });
      onUpdateUniverse(updatedUniverse);

      onLogAction('Auditing Division Removed', `Permanently deleted auditing division definition: ${unit}`);
    });
  };

  const handleAddSubTeamToUnit = (unit: string, subTeamName: string) => {
    const trimmed = subTeamName.trim();
    if (!trimmed) return;

    const currentSubTeams = unitSubTeamsMap[unit] || [];
    if (currentSubTeams.includes(trimmed)) {
      showAlert(`Sub-team "${trimmed}" already exists inside "${unit}".`);
      return;
    }

    const updatedMap = {
      ...unitSubTeamsMap,
      [unit]: [...currentSubTeams, trimmed]
    };
    setUnitSubTeamsMap(updatedMap);

    // Clear input
    setNewSubTeamInputs({
      ...newSubTeamInputs,
      [unit]: ''
    });

    onLogAction('Sub-team Registered', `Registered fieldwork sub-team "${trimmed}" under unit "${unit}".`);
  };

  const handleDeleteSubTeamFromUnit = (unit: string, subTeamName: string) => {
    showConfirm(`Are you sure you want to delete the sub-team "${subTeamName}" from "${unit}"?`, () => {
      const currentSubTeams = unitSubTeamsMap[unit] || [];
      const updatedMap = {
        ...unitSubTeamsMap,
        [unit]: currentSubTeams.filter(st => st !== subTeamName)
      };
      setUnitSubTeamsMap(updatedMap);

      onLogAction('Sub-team Removed', `Removed sub-team "${subTeamName}" from unit "${unit}".`);
    });
  };

  return (
    <div className="space-y-6" id="admin_console_top_canvas">
      
      {/* Security alert header if non-admin attempts access */}
      {!isAdmin && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl" id="admin_unauthorized_alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800">Access Restricted Policy</h3>
              <p className="text-xs text-red-700 mt-1">
                You are currently impersonating <strong>{activeRole}</strong>. The Administration Console requires <strong>Chief Auditor (Admin)</strong> token authority to write schema mutations or user tables. However, you are granted Read-Only review mode of this console for training convenience.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary admin title bar */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="admin_header_dashboard">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold font-sans uppercase tracking-tight">Governance Administration Console</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-light max-w-2xl leading-normal">
            Enact architectural controls on security policies, dynamically define audit taxonomy dimensions (categories & subcategories), manage ADFS user accounts, and review database memory pools.
          </p>
        </div>
        {onExitConsole && (
          <button
            onClick={onExitConsole}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer self-start md:self-center shrink-0 shadow-sm"
          >
            ← Exit Admin Console
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Menu */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0 lg:sticky lg:top-24">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 flex flex-col gap-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Console Menu</div>
            <button
              onClick={() => setActiveAdminTab('users')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className={`w-4 h-4 ${activeAdminTab === 'users' ? 'text-indigo-600' : 'text-slate-400'}`} /> SSO Directories
            </button>
            <button
              onClick={() => setActiveAdminTab('roles')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'roles' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Key className={`w-4 h-4 ${activeAdminTab === 'roles' ? 'text-indigo-600' : 'text-slate-400'}`} /> Role Management
            </button>
            <button
              onClick={() => setActiveAdminTab('universe')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'universe' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building className={`w-4 h-4 ${activeAdminTab === 'universe' ? 'text-indigo-600' : 'text-slate-400'}`} /> Universe Registry
            </button>
            <button
              onClick={() => setActiveAdminTab('templates')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'templates' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeAdminTab === 'templates' ? 'text-indigo-600' : 'text-slate-400'}`} /> Checklist Templates
            </button>
            <button
              onClick={() => setActiveAdminTab('taxonomy')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'taxonomy' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Grid className={`w-4 h-4 ${activeAdminTab === 'taxonomy' ? 'text-indigo-600' : 'text-slate-400'}`} /> Taxonomy Builder
            </button>
            <button
              onClick={() => setActiveAdminTab('units')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'units' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building className={`w-4 h-4 ${activeAdminTab === 'units' ? 'text-indigo-600' : 'text-slate-400'}`} /> Auditing Division Units
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Governance & Compliance</div>
            <button
              onClick={() => setActiveAdminTab('responsibilities')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'responsibilities' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeAdminTab === 'responsibilities' ? 'text-indigo-600' : 'text-slate-400'}`} /> Responsibilities Framework
            </button>
            <button
              onClick={() => setActiveAdminTab('standards')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'standards' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeAdminTab === 'standards' ? 'text-indigo-600' : 'text-slate-400'}`} /> Regulatory Standards
            </button>
            <button
              onClick={() => setActiveAdminTab('policies')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'policies' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeAdminTab === 'policies' ? 'text-indigo-600' : 'text-slate-400'}`} /> Policies & Directives
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button
              onClick={() => setActiveAdminTab('system')}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left ${
                activeAdminTab === 'system' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Database className={`w-4 h-4 ${activeAdminTab === 'system' ? 'text-indigo-600' : 'text-slate-400'}`} /> System Console
            </button>
            {onExitConsole && (
              <>
                <div className="h-px bg-slate-100 my-1"></div>
                <button
                  onClick={onExitConsole}
                  className="px-4 py-2.5 rounded-lg font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all flex items-center justify-start gap-2.5 cursor-pointer text-left"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 text-rose-500" /> Back to Dashboard
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 w-full relative min-w-0">
          {/* TAB RENDERING: 1. SSO DIRECTORIES & USERS */}
          {activeAdminTab === 'users' && (
        <div className="space-y-4" id="users_admin_panel">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sans uppercase">Active Directory (ADFS) SSO User Registries</h2>
              <p className="text-[11px] text-slate-450 mt-0.5">Edit corporate credentials, assign structural units, or de-authorize accounts to lock workspace permissions.</p>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => {
                  setUserViewMode('table');
                  setShowAddUserForm(!showAddUserForm);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                id="btn_add_user_show"
              >
                <UserPlus className="w-4 h-4" /> Register New Account
              </button>
            )}
          </div>

          {/* Sub-view switcher toggles */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
            <button
              onClick={() => setUserViewMode('org-chart')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                userViewMode === 'org-chart'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GitFork className="w-4 h-4 rotate-90" /> Interactive Reporting Hierarchy
            </button>
            <button
              onClick={() => setUserViewMode('table')}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                userViewMode === 'table'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" /> Tabular SSO Directory List
            </button>
          </div>

          {/* Org Chart Visualized View */}
          {userViewMode === 'org-chart' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Reporting Integrity Protocol
                  </span>
                  <h3 className="text-xs font-bold text-slate-800">Hierarchical reporting architecture for Bank Internal Audit</h3>
                  <p className="text-[11px] text-slate-500 max-w-2xl">
                    Below is the real-time reporting hierarchy synchronized with Active Directory (ADFS) SSO. It flows from the <strong>Chief Internal Auditor (Level 1)</strong>, to the <strong>Sub-Process Directors (Level 2)</strong>, down to <strong>Team Managers (Level 3)</strong>, and finalizes with <strong>Member Auditors (Level 4)</strong>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {isAdmin && (
                    <button
                      onClick={handleClearDirectoryAndTeams}
                      className="bg-red-50 hover:bg-red-150 text-red-750 border border-red-250 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-655" /> Clear Directory & Teams
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAddUserForm(true);
                      setUserViewMode('table');
                    }}
                    className="bg-indigo-650 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register Staff Member
                  </button>
                </div>
              </div>

              {/* TREE DRAWING */}
              <div className="space-y-6">
                {/* LEVEL 1: CHIEF TOP OF ALL */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-extrabold tracking-widest text-indigo-650 uppercase mb-2">Level 1: Chief Internal Auditor</span>
                  {users.filter(u => u.role === 'Admin' || u.title?.toLowerCase().includes('chief')).map(chief => (
                    <div key={chief.id} className="relative bg-white border-2 border-indigo-500 rounded-xl p-4 shadow-sm w-full max-w-md text-center hover:shadow-md transition-shadow">
                      <div className="absolute top-2 right-2 bg-indigo-50 text-indigo-700 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                        Chief
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-750 border border-indigo-200 font-black flex items-center justify-center mx-auto text-sm mb-2 shadow-xs">
                        {chief.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{chief.name}</h4>
                      <p className="text-xs font-semibold text-indigo-600">{chief.title || 'Chief Internal Auditor'}</p>
                      <p className="text-[11px] text-slate-450 mt-1">{chief.email} | {chief.department}</p>
                      {chief.employeeId && (
                        <div className="mt-1 text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm inline-block">
                          ID: {chief.employeeId}
                        </div>
                      )}
                      {chief.qualifications && chief.qualifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          {chief.qualifications.map(q => (
                            <span key={q} className="bg-indigo-50 border border-indigo-150 text-indigo-755 font-bold text-[9px] px-1.5 py-0.5 rounded-sm uppercase">
                              {q}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-3">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                          Reports directly to Board Audit Committee
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONNECTING LINE 1-TO-2 */}
                <div className="flex justify-center h-6">
                  <div className="w-0.5 bg-indigo-200 h-full"></div>
                </div>

                {/* LEVEL 2: DIRECTORS (SUB-PROCESS LEADS) */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-[9px] font-extrabold tracking-widest text-indigo-650 uppercase">Level 2: Sub-Process Directors (Reporting to Chief)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Directors list */}
                    {users.filter(u => u.role === 'Manager' && (u.title?.toLowerCase().includes('director') || !u.reportsToId || u.reportsToId === 'usr-1')).map(director => {
                      const mySubprocess = director.category || 'Specialized';
                      const managersReporting = users.filter(u => u.reportsToId === director.id);

                      return (
                        <div key={director.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded uppercase">
                                Sub-Process Director
                              </span>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                                {mySubprocess}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center border border-indigo-150">
                                {director.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 block">{director.name}</h4>
                                <p className="text-[11px] text-indigo-650 font-semibold">{director.title || 'Audit Director'}</p>
                                {director.employeeId && (
                                  <span className="text-[9px] font-mono bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                                    ID: {director.employeeId}
                                  </span>
                                )}
                                {director.qualifications && director.qualifications.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5 mt-1">
                                    {director.qualifications.map(q => (
                                      <span key={q} className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[8px] px-1 rounded-sm uppercase">
                                        {q}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5 bg-slate-50 p-2 rounded-lg mb-3">
                              <div><strong>Department:</strong> {director.department}</div>
                              <div><strong>Email:</strong> {director.email}</div>
                              <div><strong>Reports To:</strong> Chief Internal Auditor</div>
                            </div>
                          </div>

                          {/* Sub-tree section (Level 3: Team Managers) inside Director's card track */}
                          <div className="mt-2 pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wide">
                                Level 3: Reporting Team Managers ({managersReporting.length})
                              </span>
                            </div>

                            {managersReporting.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic">No managers assigned to this director yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {managersReporting.map(mngr => {
                                  const membersReporting = users.filter(u => u.reportsToId === mngr.id);

                                  return (
                                    <div key={mngr.id} className="bg-slate-50/50 border border-slate-150 rounded-lg p-3 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="text-xs font-bold text-slate-800">{mngr.name}</span>
                                          <span className="block text-[10px] text-emerald-700 font-semibold">{mngr.title || 'Team Manager'}</span>
                                          {mngr.employeeId && (
                                            <span className="text-[8px] font-mono bg-white text-slate-500 border border-slate-200 px-1 py-0.2 rounded-sm inline-block mt-0.5 mr-1">
                                              ID: {mngr.employeeId}
                                            </span>
                                          )}
                                          {mngr.qualifications && mngr.qualifications.length > 0 && (
                                            <span className="inline-flex gap-0.5 mt-0.5">
                                              {mngr.qualifications.map(q => (
                                                <span key={q} className="bg-emerald-50 text-emerald-700 font-bold text-[8px] px-1 rounded-sm uppercase">
                                                  {q}
                                                </span>
                                              ))}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                                          Manager
                                        </span>
                                      </div>

                                      {/* Level 4: Member Auditors under this Manager */}
                                      <div className="pl-3 border-l-2 border-emerald-400 space-y-1.5 pt-1">
                                        <span className="text-[9px] font-extrabold text-slate-450 uppercase block">
                                          Level 4: Member Auditors ({membersReporting.length})
                                        </span>
                                        {membersReporting.length === 0 ? (
                                          <span className="text-[10px] text-slate-400 italic block">No member auditors in this team yet.</span>
                                        ) : (
                                          <div className="space-y-1">
                                            {membersReporting.map(auditor => (
                                              <div key={auditor.id} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-150 text-[11px]">
                                                <div>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-800">{auditor.name}</span>
                                                    {auditor.employeeId && (
                                                      <span className="text-[8px] font-mono bg-slate-100 text-slate-500 px-1 rounded-sm">
                                                        {auditor.employeeId}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className="text-slate-555 text-[10px] block">{auditor.title || 'Field Auditor'}</span>
                                                  {auditor.qualifications && auditor.qualifications.length > 0 && (
                                                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                                                      {auditor.qualifications.map(q => (
                                                        <span key={q} className="bg-indigo-50 text-indigo-700 font-bold text-[8px] px-0.5 rounded-sm uppercase">
                                                          {q}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-mono">{auditor.email.split('@')[0]}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OTHER MEMBERS AND AUDITEES */}
                <div className="pt-4 max-w-4xl mx-auto space-y-3">
                  <div className="border-t border-slate-200 pt-4 text-center">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Consultative Contacts & Stakeholder Interfaces</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">SSO profiles outside the primary internal audit execution hierarchy.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {users.filter(u => u.role === 'Executive' || u.role === 'Auditee').map(u => (
                      <div key={u.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase">
                            {u.role}
                          </span>
                          <span className="font-bold text-slate-800 text-xs block mt-1">{u.name}</span>
                          <span className="text-[10px] text-slate-500 block">{u.title || u.department}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-slate-400 block">{u.email}</span>
                          <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">{u.active ? 'Active Connection' : 'Locked'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabular SSO Directory List */}
          {userViewMode === 'table' && (
            <div className="space-y-4 animate-fade-in">
              {/* Table Action Bar */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Personnel SSO Directory Records</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {users.length} Active Accounts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={handleClearDirectoryAndTeams}
                      className="bg-red-50 hover:bg-red-100 text-red-755 border border-red-200 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-650" /> Clear Directory & Teams
                    </button>
                  )}
                  {isAdmin && !showAddUserForm && (
                    <button
                      onClick={() => {
                        setShowAddUserForm(true);
                        // Initialize form defaults
                        setNewUserName('');
                        setNewUserEmail('');
                        setNewUserRole('Auditor');
                        setNewUserDept(auditingUnitsList[0] || 'IT Audit Division');
                        setNewUserCategory('IT Audit');
                        setNewUserTeam((unitSubTeamsMap[auditingUnitsList[0] || ''] || [])[0] || '');
                        setNewUserTitle(getDefaultTitleForRole('Auditor'));
                        const supervisors = getSupervisorsForRole('Auditor');
                        setNewUserReportsToId(supervisors[0]?.id || '');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Register Staff Member
                    </button>
                  )}
                </div>
              </div>

              {/* New User creation drawer */}
              {showAddUserForm && isAdmin && (
                <form onSubmit={handleCreateUser} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4 animate-fade-in" id="add_user_form">
                  <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                    <span className="font-extrabold text-xs text-indigo-700 uppercase flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" /> Create Core Personnel Account
                    </span>
                    <button type="button" onClick={() => setShowAddUserForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Martha Hailu"
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Corporate Email (@bank.et)</label>
                      <input
                        type="email"
                        required
                        placeholder="mhailu@bank.et"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned SSO Authority Role</label>
                      <select
                        value={newUserRole}
                        onChange={e => handleRoleSelectionChange(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
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
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Division / Specialty Unit</label>
                      {newUserRole === 'Admin' ? (
                        <input
                          type="text"
                          disabled
                          value="Internal Audit Department"
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500"
                        />
                      ) : (
                        <select
                          required
                          value={newUserDept}
                          onChange={e => {
                            const dept = e.target.value;
                            setNewUserDept(dept);
                            // Auto-set Category based on department keywords
                            if (dept.toLowerCase().includes('it') || dept.toLowerCase().includes('cyber')) {
                              setNewUserCategory('IT Audit');
                            } else if (dept.toLowerCase().includes('branch')) {
                              setNewUserCategory('Branch Audit');
                            } else {
                              setNewUserCategory('Corporate Audit');
                            }
                            // Auto-set to first subteam
                            const subTeams = unitSubTeamsMap[dept] || [];
                            setNewUserTeam(subTeams[0] || '');
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                        >
                          <option value="">-- Select Auditing Division --</option>
                          {auditingUnitsList.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Corporate Title / Designation</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Director, IT & Cyber Audit"
                        value={newUserTitle}
                        onChange={e => setNewUserTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Immediate Supervisor (Reports To)</label>
                      {newUserRole === 'Admin' ? (
                        <input
                          type="text"
                          disabled
                          value="Board Audit Committee"
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500"
                        />
                      ) : (
                        <select
                          required
                          value={newUserReportsToId}
                          onChange={e => setNewUserReportsToId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                        >
                          <option value="">-- Select Supervisor --</option>
                          {getSupervisorsForRole(newUserRole).map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.title || u.role})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {newUserRole !== 'Admin' && newUserRole !== 'Executive' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Audit Process Category</label>
                          <select
                            required
                            value={newUserCategory}
                            onChange={e => setNewUserCategory(e.target.value as 'Corporate Audit' | 'Branch Audit' | 'IT Audit' | '')}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                          >
                            <option value="">-- Select Category --</option>
                            <option value="Corporate Audit">Corporate Audit</option>
                            <option value="Branch Audit">Branch Audit</option>
                            <option value="IT Audit">IT Audit</option>
                          </select>
                        </div>

                        {newUserRole !== 'Manager' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Sub-Team</label>
                            <select
                              required
                              value={newUserTeam}
                              onChange={e => setNewUserTeam(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                              disabled={!newUserDept}
                            >
                              <option value="">-- Select Sub Team --</option>
                              {(unitSubTeamsMap[newUserDept] || []).map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {newUserRole === 'Manager' && newUserDept && (
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Overseen Sub-Teams (Director Level)</label>
                            <div className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-semibold text-slate-600">
                              Oversees all custom sub-teams under <strong className="text-indigo-700">{newUserDept}</strong>:
                              <span className="block mt-1 text-slate-500 font-medium">
                                {(unitSubTeamsMap[newUserDept] || []).join(', ') || 'No sub-teams registered under this division yet.'}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* New Auditor Registration Fields */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Employee ID</label>
                      <input
                        type="text"
                        placeholder="e.g. EMP-2026-901"
                        value={newUserEmployeeId}
                        onChange={e => setNewUserEmployeeId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Assigned Sub-Process</label>
                      <input
                        type="text"
                        placeholder="e.g. Cybersecurity & Database Infrastructure"
                        value={newUserSubProcess}
                        onChange={e => setNewUserSubProcess(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Employment Status</label>
                      <select
                        value={newUserEmploymentStatus}
                        onChange={e => setNewUserEmploymentStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Professional Qualifications</label>
                      <input
                        type="text"
                        placeholder="e.g. CIA, CISA, ACCA"
                        value={newUserQualifications}
                        onChange={e => setNewUserQualifications(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Areas of Expertise</label>
                      <input
                        type="text"
                        placeholder="e.g. Database Security, Treasury Operations"
                        value={newUserExpertise}
                        onChange={e => setNewUserExpertise(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Contact Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +251-11-667-8901"
                        value={newUserContactPhone}
                        onChange={e => setNewUserContactPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-indigo-150 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddUserForm(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-250 text-slate-650 font-bold hover:bg-slate-50 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer shadow-sm"
                    >
                      Confirm SSO Registration
                    </button>
                  </div>
                </form>
              )}

              {/* User directory table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 uppercase text-[10px] font-bold">
                        <th className="p-4 w-10 text-center">Details</th>
                        <th className="p-4">Staff Member</th>
                        <th className="p-4">Assigned Department</th>
                        <th className="p-4">Reports To (Supervisor)</th>
                        <th className="p-4">Audit Category</th>
                        <th className="p-4">Audit Team / Managed Teams</th>
                        <th className="p-4">Security Level Token</th>
                        <th className="p-4 text-center">Status</th>
                        {isAdmin && <th className="p-4 text-right">Administrative Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => {
                        const isCurrentUserEditing = editingUserId === u.id;
                        const isExpanded = expandedUserId === u.id || isCurrentUserEditing;
                        return (
                          <React.Fragment key={u.id}>
                            <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-indigo-50/15' : ''}`}>
                              <td className="p-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                                  title="View full Auditor registry credentials"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-indigo-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              </td>
                              <td className="p-4">
                              {isCurrentUserEditing ? (
                                <div className="space-y-1.5 max-w-sm">
                                  <input
                                    type="text"
                                    value={editUserName}
                                    onChange={e => setEditUserName(e.target.value)}
                                    className="px-2.5 py-1 bg-white border border-indigo-200 rounded text-xs font-semibold focus:outline-none w-full"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Corporate Title"
                                    value={editUserTitle}
                                    onChange={e => setEditUserTitle(e.target.value)}
                                    className="px-2.5 py-1 bg-white border border-indigo-200 rounded text-[11px] block font-semibold text-indigo-750 w-full"
                                  />
                                  <input
                                    type="email"
                                    value={editUserEmail}
                                    onChange={e => setEditUserEmail(e.target.value)}
                                    className="px-2.5 py-1 bg-white border border-indigo-200 rounded text-[11px] block font-mono text-slate-600 w-full"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold font-mono flex items-center justify-center">
                                    {u.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{u.name}</span>
                                    {u.title && (
                                      <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 inline-block">
                                        {u.title}
                                      </span>
                                    )}
                                    <span className="font-mono text-[11px] text-slate-450 block mt-0.5">{u.email}</span>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="p-4 font-semibold text-slate-700">
                              {isCurrentUserEditing ? (
                                editUserRole === 'Admin' ? (
                                  <span className="text-slate-400 italic text-[11px]">Internal Audit Department</span>
                                ) : (
                                  <select
                                    value={editUserDept}
                                    onChange={e => {
                                      const dept = e.target.value;
                                      setEditUserDept(dept);
                                      if (dept.toLowerCase().includes('it') || dept.toLowerCase().includes('cyber')) {
                                        setEditUserCategory('IT Audit');
                                      } else if (dept.toLowerCase().includes('branch')) {
                                        setEditUserCategory('Branch Audit');
                                      } else {
                                        setEditUserCategory('Corporate Audit');
                                      }
                                      setEditUserTeam(unitSubTeamsMap[dept]?.[0] || '');
                                    }}
                                    className="px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-semibold focus:outline-none cursor-pointer"
                                  >
                                    <option value="">-- Select Division --</option>
                                    {auditingUnitsList.map(unit => (
                                      <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                  </select>
                                )
                              ) : (
                                u.department
                              )}
                            </td>

                            <td className="p-4 font-semibold text-slate-700">
                              {isCurrentUserEditing ? (
                                editUserRole === 'Admin' ? (
                                  <span className="text-slate-400 italic text-[11px]">Board Audit Committee</span>
                                ) : (
                                  <select
                                    value={editUserReportsToId}
                                    onChange={e => setEditUserReportsToId(e.target.value)}
                                    className="px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-semibold focus:outline-none cursor-pointer"
                                  >
                                    <option value="">-- Select Supervisor --</option>
                                    {getSupervisorsForRole(editUserRole).filter(other => other.id !== u.id).map(other => (
                                      <option key={other.id} value={other.id}>
                                        {other.name} ({other.title || other.role})
                                      </option>
                                    ))}
                                  </select>
                                )
                              ) : (
                                u.reportsToName ? (
                                  <span className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-150 rounded px-2 py-1 block">
                                    {u.reportsToName}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Board Audit Committee</span>
                                )
                              )}
                            </td>

                            {/* Audit Category Col */}
                            <td className="p-4">
                              {isCurrentUserEditing ? (
                                editUserRole === 'Admin' ? (
                                  <span className="text-slate-400 italic text-[11px]">N/A (Chief)</span>
                                ) : (
                                  <select
                                    value={editUserCategory}
                                    onChange={e => setEditUserCategory(e.target.value as 'Corporate Audit' | 'Branch Audit' | 'IT Audit' | '')}
                                    className="px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-semibold focus:outline-none cursor-pointer"
                                  >
                                    <option value="">-- None --</option>
                                    <option value="Corporate Audit">Corporate Audit</option>
                                    <option value="Branch Audit">Branch Audit</option>
                                    <option value="IT Audit">IT Audit</option>
                                  </select>
                                )
                              ) : (
                                u.role === 'Admin' ? (
                                  <span className="text-slate-400 italic">None (Chief)</span>
                                ) : u.category ? (
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-750 border border-indigo-150 rounded text-[10px] font-bold uppercase tracking-wider">
                                    {u.category}
                                  </span>
                                ) : (
                                  <span className="text-red-500 italic font-semibold text-[11px]">Unassigned</span>
                                )
                              )}
                            </td>

                            {/* Audit Team Col */}
                            <td className="p-4">
                              {isCurrentUserEditing ? (
                                editUserRole === 'Admin' ? (
                                  <span className="text-slate-400 italic text-[11px]">N/A</span>
                                ) : editUserRole === 'Manager' || editUserRole === 'Executive' ? (
                                  <div className="text-[10px] text-slate-500 max-w-[185px]">
                                    <span className="font-extrabold block text-indigo-700">Director Charge</span>
                                    {editUserDept ? (
                                      <span className="italic">Oversees all {editUserDept} Teams</span>
                                    ) : (
                                      <span className="italic">Oversees category teams</span>
                                    )}
                                  </div>
                                ) : editUserDept ? (
                                  <select
                                    value={editUserTeam}
                                    onChange={e => setEditUserTeam(e.target.value)}
                                    className="px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-semibold focus:outline-none cursor-pointer"
                                  >
                                    <option value="">-- Select Sub Team --</option>
                                    {(unitSubTeamsMap[editUserDept] || []).map(t => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-slate-450 italic text-[11px]">Select division first</span>
                                )
                              ) : (
                                u.role === 'Admin' ? (
                                  <span className="text-slate-400 italic">None (Chief)</span>
                                ) : u.role === 'Manager' || u.role === 'Executive' ? (
                                  <div className="text-[11px] font-medium text-slate-500">
                                    <span className="bg-indigo-50 text-indigo-850 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider mr-1.5 uppercase">Director Level</span>
                                    {u.category ? (
                                      <span className="font-semibold text-slate-650">All {u.category} Teams</span>
                                    ) : (
                                      <span className="italic text-slate-400">All category teams</span>
                                    )}
                                  </div>
                                ) : u.team ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded text-[11px] font-semibold">
                                    {u.team}
                                  </span>
                                ) : (
                                  <span className="text-red-500 italic font-semibold text-[11px]">Unassigned</span>
                                )
                              )}
                            </td>

                            <td className="p-4">
                              {isCurrentUserEditing ? (
                                <select
                                  value={editUserRole}
                                  onChange={e => setEditUserRole(e.target.value as UserRole)}
                                  className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-semibold focus:outline-none cursor-pointer"
                                >
                                  <option value="Admin">Chief Auditor (Admin)</option>
                                  <option value="Manager">Senior Manager</option>
                                  <option value="Team Leader">AIC / Team Leader</option>
                                  <option value="Auditor">Field Auditor</option>
                                  <option value="Auditee">Business Auditee</option>
                                  <option value="Executive">Executive Board</option>
                                </select>
                              ) : (
                                <span className={`px-2.1 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                                  u.role === 'Admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                  u.role === 'Manager' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  u.role === 'Team Leader' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                  u.role === 'Auditor' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  u.role === 'Executive' ? 'bg-orange-100 text-orange-850 border border-orange-250' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {u.role}
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-center">
                              <button
                                type="button"
                                disabled={!isAdmin}
                                onClick={() => handleToggleUserActive(u.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-all ${
                                  u.active 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 hover:bg-emerald-100 hover:text-emerald-850' 
                                    : 'bg-red-50 text-red-600 border border-red-220 hover:bg-red-100 hover:text-red-750'
                                } ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                              >
                                <Power className="w-3 h-3" /> {u.active ? 'ACTIVE' : 'LOCKED'}
                              </button>
                            </td>

                            {isAdmin && (
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {isCurrentUserEditing ? (
                                    <>
                                      <button
                                        onClick={handleSaveUserEdit}
                                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                                        title="Save modification"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingUserId(null)}
                                        className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                                        title="Cancel"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleStartEditingUser(u)}
                                      className="p-1.5 bg-slate-50 text-slate-650 hover:text-slate-900 border border-slate-200 hover:border-slate-350 transition-all rounded-lg cursor-pointer"
                                      title="Edit full credentials"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                            </tr>
                            
                            {isExpanded && (
                              <tr className="bg-indigo-50/10 border-b border-indigo-100">
                                <td colSpan={isAdmin ? 9 : 8} className="p-5">
                                  <div className="bg-white rounded-lg border border-indigo-100 p-4 shadow-2xs space-y-3 animate-fade-in">
                                    <div className="flex items-center gap-2 border-b border-slate-150 pb-2 mb-2">
                                      <span className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">
                                        Auditor Registered Profile Parameters
                                      </span>
                                    </div>
                                    
                                    {isCurrentUserEditing ? (
                                      /* Edit Mode for Auditor specific fields */
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-indigo-650 uppercase">Employee ID</label>
                                          <input
                                            type="text"
                                            value={editUserEmployeeId}
                                            onChange={e => setEditUserEmployeeId(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-indigo-150 rounded text-xs font-semibold focus:outline-none"
                                            placeholder="e.g. EMP-2026-901"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-indigo-650 uppercase">Assigned Sub-Process</label>
                                          <input
                                            type="text"
                                            value={editUserSubProcess}
                                            onChange={e => setEditUserSubProcess(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-indigo-150 rounded text-xs font-semibold focus:outline-none"
                                            placeholder="e.g. Cybersecurity & Databases"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-indigo-650 uppercase">Employment Status</label>
                                          <select
                                            value={editUserEmploymentStatus}
                                            onChange={e => setEditUserEmploymentStatus(e.target.value as any)}
                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-indigo-150 rounded text-xs font-semibold focus:outline-none"
                                          >
                                            <option value="Active">Active</option>
                                            <option value="Suspended">Suspended</option>
                                            <option value="On Leave">On Leave</option>
                                            <option value="Terminated">Terminated</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-indigo-650 uppercase">Qualifications (Comma separated)</label>
                                          <input
                                            type="text"
                                            value={editUserQualifications}
                                            onChange={e => setEditUserQualifications(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-indigo-150 rounded text-xs font-semibold focus:outline-none"
                                            placeholder="e.g. CIA, CISA, ACCA"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-indigo-650 uppercase">Areas of Expertise (Comma separated)</label>
                                          <input
                                            type="text"
                                            value={editUserExpertise}
                                            onChange={e => setEditUserExpertise(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-indigo-150 rounded text-xs font-semibold focus:outline-none"
                                            placeholder="e.g. Cybersecurity, Operational Audits"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-indigo-650 uppercase">Contact Phone Number</label>
                                          <input
                                            type="text"
                                            value={editUserContactPhone}
                                            onChange={e => setEditUserContactPhone(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-indigo-150 rounded text-xs font-semibold focus:outline-none"
                                            placeholder="e.g. +251-11-667-8901"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      /* Read-Only Mode for details */
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                                          <span className="text-[10px] font-bold text-slate-450 uppercase block">Standard Parameters</span>
                                          <div className="space-y-0.5">
                                            <p className="font-semibold text-slate-700">Employee ID: <strong className="text-slate-900 font-bold">{u.employeeId || 'N/A'}</strong></p>
                                            <p className="font-semibold text-slate-700">Contact Phone: <strong className="text-slate-900 font-bold">{u.contactPhone || 'N/A'}</strong></p>
                                            <p className="font-semibold text-slate-700">SSO Status: <strong className="text-slate-900 font-bold">{u.employmentStatus || (u.active ? 'Active' : 'Suspended')}</strong></p>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                                          <span className="text-[10px] font-bold text-slate-450 uppercase block">Functional Mapping</span>
                                          <div className="space-y-0.5">
                                            <p className="font-semibold text-slate-700">Directorate: <strong className="text-slate-900 font-bold">{u.department || 'N/A'}</strong></p>
                                            <p className="font-semibold text-slate-700">Assigned Team: <strong className="text-slate-900 font-bold">{u.team || 'N/A'}</strong></p>
                                            <p className="font-semibold text-slate-700">Assigned Sub-Process: <strong className="text-slate-900 font-bold">{u.subProcess || 'N/A'}</strong></p>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1 md:col-span-2">
                                          <span className="text-[10px] font-bold text-slate-450 uppercase block">Qualifications & Skills Profile</span>
                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-1">Professional Qualifications:</span>
                                              <div className="flex flex-wrap gap-1">
                                                {u.qualifications && u.qualifications.length > 0 ? (
                                                  u.qualifications.map(q => (
                                                    <span key={q} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[9px] rounded-md uppercase">
                                                      {q}
                                                    </span>
                                                  ))
                                                ) : (
                                                  <span className="text-slate-400 italic text-[10px]">No qualifications listed</span>
                                                )}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Areas of Expertise:</span>
                                              <div className="flex flex-wrap gap-1">
                                                {u.expertise && u.expertise.length > 0 ? (
                                                  u.expertise.map(ex => (
                                                    <span key={ex} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-[9px] rounded-md uppercase">
                                                      {ex}
                                                    </span>
                                                  ))
                                                ) : (
                                                  <span className="text-slate-400 italic text-[10px]">No expertise declared</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB RENDERING: ROLE & PERMISSION MANAGEMENT */}
      {activeAdminTab === 'roles' && (
        <div className="space-y-6" id="roles_admin_panel">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sans uppercase">Dynamic Role-Based Access Control (RBAC)</h2>
              <p className="text-[11px] text-slate-450 mt-0.5">Configure compliance action thresholds, authorize custom administrative roles, and map staff credentials to system privileges.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAddRoleForm(!showAddRoleForm);
                  setRoleViewMode('directory');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors animate-fade-in"
                id="btn_create_custom_role"
              >
                <Plus className="w-4 h-4" /> Create Custom Role
              </button>
            </div>
          </div>

          {/* Sub-view selector tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
            <button
              onClick={() => {
                setRoleViewMode('directory');
                setShowAddRoleForm(false);
              }}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                roleViewMode === 'directory' && !showAddRoleForm
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" /> System Roles Directory ({systemRoles.length})
            </button>
            <button
              onClick={() => {
                setRoleViewMode('matrix');
                setShowAddRoleForm(false);
              }}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                roleViewMode === 'matrix'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Granular Access Matrix
            </button>
            <button
              onClick={() => {
                setRoleViewMode('assignments');
                setShowAddRoleForm(false);
              }}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                roleViewMode === 'assignments'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" /> Active Directory User Assignments ({users.length})
            </button>
          </div>

          {/* VIEW 1: CREATING ROLE FORM */}
          {showAddRoleForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <Key className="w-4 h-4" /> Define New Custom Compliance Role
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddRoleForm(false)} 
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomRole} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Role Name</label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    placeholder="e.g., IT Security Lead"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Role Description</label>
                  <input
                    type="text"
                    required
                    value={newRoleDesc}
                    onChange={e => setNewRoleDesc(e.target.value)}
                    placeholder="Brief definition of functional area access..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-1 flex items-center justify-between pt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Initial Status:</span>
                    <button
                      type="button"
                      onClick={() => setNewRoleActive(!newRoleActive)}
                      className={`px-3 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer ${
                        newRoleActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                          : 'bg-slate-100 text-slate-600 border border-slate-250'
                      }`}
                    >
                      {newRoleActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRoleForm(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Save Role
                    </button>
                  </div>
                </div>
              </form>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-850 leading-relaxed">
                  <strong>Access Scoping Guide:</strong> When a new role is saved, it initially defaults to <strong>No Access</strong> across all 14 functional areas. You can immediately fine-tune its CRUD+A action grids in the <strong>Granular Access Matrix</strong> workspace after saving.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 2: ROLES DIRECTORY GRID */}
          {roleViewMode === 'directory' && !showAddRoleForm && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemRoles.map(role => {
                  const assignedCount = users.filter(u => u.title === role.name || (role.name === 'Administrator' && u.role === 'Admin') || (role.name === 'Audit Director' && u.role === 'Manager' && u.title?.includes('Director'))).length;
                  const isCustom = role.id.startsWith('role-custom');
                  
                  return (
                    <div key={role.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            role.active 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                              : 'bg-red-50 text-red-700 border border-red-150'
                          }`}>
                            <Power className="w-2.5 h-2.5" /> {role.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-[10px] bg-slate-50 border border-slate-150 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                            {assignedCount} assigned users
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-indigo-600" /> {role.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed min-h-[36px]">
                            {role.description}
                          </p>
                        </div>

                        {/* Visual Summary of Action Scopes */}
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access Privileges Profile</span>
                          <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px]">
                            <div className="flex items-center justify-between font-semibold text-slate-600">
                              <span>Full Access modules:</span>
                              <span className="font-bold text-indigo-700">
                                {(Object.values(role.permissions) as string[][]).filter(p => p.includes('Read/View') && p.includes('Write/Edit')).length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-semibold text-slate-600">
                              <span>Read-Only modules:</span>
                              <span className="font-bold text-slate-800">
                                {(Object.values(role.permissions) as string[][]).filter(p => p.includes('Read/View') && !p.includes('Write/Edit')).length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-semibold text-slate-600 col-span-2 border-t border-slate-100/80 pt-1">
                              <span>No Access (Restricted Area) total:</span>
                              <span className="font-bold text-rose-600">
                                {(Object.values(role.permissions) as string[][]).filter(p => p.includes('No Access')).length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRoleId(role.id);
                              setRoleViewMode('matrix');
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                          >
                            Configure Privileges
                          </button>
                          
                          <button
                            onClick={() => handleToggleRoleStatus(role.id, role.active, role.name)}
                            className={`font-bold text-[10px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                              role.active
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {role.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>

                        {isCustom && (
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-1.5 rounded-lg border border-red-200 cursor-pointer transition-colors"
                            title="Delete custom role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: GRANULAR ACCESS MATRIX */}
          {roleViewMode === 'matrix' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-800">Dynamic Permissions Controller</h3>
                  <p className="text-[11px] text-slate-500">Configure real-time functional boundaries. Selecting "No Access" automatically invalidates other actions.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Active Governance Profile:</span>
                  <select
                    value={selectedRoleId}
                    onChange={e => setSelectedRoleId(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {systemRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.name} {!r.active ? '(Inactive)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase">
                        <th className="p-4 font-extrabold">System Functional Modules</th>
                        {PERMISSION_TYPES.map(perm => (
                          <th key={perm} className="p-3 text-center min-w-[84px] font-extrabold uppercase tracking-wider">
                            <span className={
                              perm === 'No Access' ? 'text-red-650' : 
                              perm === 'Read/View' ? 'text-indigo-600' :
                              perm === 'Approve' ? 'text-emerald-700' : 'text-slate-600'
                            }>
                              {perm}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {FUNCTIONAL_AREAS.map(area => {
                        const activeRoleObj = systemRoles.find(r => r.id === selectedRoleId) || systemRoles[0];
                        const currentPerms = activeRoleObj.permissions[area] || ['No Access'];
                        const isNoAccessChecked = currentPerms.includes('No Access');

                        return (
                          <tr key={area} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-800">
                              <span className="block">{area}</span>
                              <span className="text-[10px] text-slate-450 font-normal mt-0.5 block">
                                {area === 'Audit Universe Management' && 'Manage entities, score strategic and transactional branch profiles.'}
                                {area === 'Risk Assessment' && 'Quantify qualitative, compliance, and procedural risk weights.'}
                                {area === 'Engagement Management' && 'Draft plans, allocate teams, and monitor audit schedules.'}
                                {area === 'Annual Audit Plan' && 'Publish plans, review milestones, and submit to board committee.'}
                                {area === 'Checklist Template Management' && 'Design standardized control testing worksheets.'}
                                {area === 'Audit Program Management' && 'Authorize testing steps, scope parameters, and samples.'}
                                {area === 'Workpaper Management' && 'Upload execution records, evidence logs, and review notes.'}
                                {area === 'Fieldwork Management' && 'Perform walkthrough procedures, record operational variances.'}
                                {area === 'Finding Management' && 'Register vulnerabilities, quantify cost impacts, define severities.'}
                                {area === 'Recommendation and Corrective Action Management' && 'Assign and track rectification plans with auditees.'}
                                {area === 'Audit Reporting' && 'Draft executive summaries, consolidate final audit ratings.'}
                                {area === 'Follow-Up Management' && 'Perform verification audits, close corrected gaps.'}
                                {area === 'Dashboard and Reporting' && 'Access interactive charts, analytics, and operational tracking.'}
                                {area === 'System Administration' && 'Control system settings, taxomony definitions, division structures.'}
                              </span>
                            </td>
                            {PERMISSION_TYPES.map(perm => {
                              const isChecked = currentPerms.includes(perm);
                              const isDisabled = perm !== 'No Access' && isNoAccessChecked;
                              
                              return (
                                <td key={perm} className="p-3 text-center">
                                  <label className="inline-flex items-center justify-center cursor-pointer w-6 h-6 rounded-md hover:bg-slate-100 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={isDisabled}
                                      onChange={() => handlePermissionToggle(selectedRoleId, area, perm)}
                                      className={`rounded border-slate-300 h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer ${
                                        isDisabled ? 'opacity-25 cursor-not-allowed' : ''
                                      }`}
                                    />
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Any checkbox toggle takes effect in real-time across the workspace. Ensure active directory synchronizations are clean.</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const activeRoleObj = systemRoles.find(r => r.id === selectedRoleId) || systemRoles[0];
                      onLogAction('Role Permissions Modified', `Updated precise access matrices for system role "${activeRoleObj.name}".`);
                      showAlert(`Compliance matrices for "${activeRoleObj.name}" successfully committed and verified.`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Save Access Matrix Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: USER ROLE ASSIGNMENTS */}
          {roleViewMode === 'assignments' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Compliance Warning & Organizational Reporting Alignment</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Reassigning user roles updates their ADFS SSO credentials instantly. The underlying reporting hierarchy and supervisors (Level 1 to Level 4) are determined by these active roles. Changes are fully logged to the unalterable system log for security accountability.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Staff Category</th>
                        <th className="p-4">Current Functional Title</th>
                        <th className="p-4">Assigned Access Role</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => {
                        const currentAssignedRole = systemRoles.find(r => r.name === u.title || r.name === u.role) || systemRoles.find(r => r.id === 'role-auditor') || systemRoles[0];
                        
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-xs">
                                  {u.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-800 block truncate">{u.name}</span>
                                  <span className="text-[10px] text-slate-450 block truncate">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="font-semibold text-slate-700 text-[11px] block">{u.department}</span>
                                {u.category && (
                                  <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    {u.category}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-[11px] text-slate-650 font-medium block">
                                {u.title || 'Internal Auditor'}
                              </span>
                            </td>
                            <td className="p-4">
                              <select
                                value={u.title || u.role}
                                onChange={e => handleAssignUserRole(u.id, e.target.value, u.name)}
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer w-full max-w-[200px]"
                              >
                                {systemRoles.map(role => (
                                  <option key={role.id} value={role.name}>
                                    {role.name} {!role.active ? '(Inactive)' : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.active 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-red-50 text-red-700'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {u.active ? 'Active' : 'Locked'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB RENDERING: 2. TAXONOMY MANAGEMENT (CATEGORY & SUB-CATEGORY) */}
      {activeAdminTab === 'taxonomy' && (
        <div className="space-y-6" id="taxonomy_admin_panel">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sans uppercase">Enterprise Audit Taxonomy Definitions</h2>
              <p className="text-[11px] text-slate-450 mt-0.5">Define high-level Audit Categories (such as IT Audit, Hook Branch Audit, IFB Audit) and assign structured checkable sub-categories.</p>
            </div>

            {isAdmin && (
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="New Category (e.g. IFB Audit)"
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 w-52 md:w-64"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-colors shrink-0 shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </form>
            )}
          </div>

          {/* Grid of existing categories with inline editor and subcategories dynamic manager */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="taxonomy_tree_interactive_grid">
            {categoriesList.map((cat, catIdx) => {
              const nestedSubs = subcategoriesMap[cat] || [];
              const isEditingCat = editingCategoryIndex === catIdx;
              
              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-sm hover:border-slate-250 transition-all">
                  
                  {/* Category Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-150 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      {isEditingCat ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={e => setEditCategoryName(e.target.value)}
                            className="bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold rounded text-slate-800 focus:outline-none"
                            placeholder="Renamed category..."
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateCategory(catIdx)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save Rename"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryIndex(null);
                              setEditCategoryName('');
                            }}
                            className="p-1 bg-slate-350 text-slate-700 rounded hover:bg-slate-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">{cat}</h3>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryIndex(catIdx);
                            setEditCategoryName(cat);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
                          title="Rename Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 text-slate-450 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body: Nested Subcategories */}
                  <div className="p-4 flex-1 space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Nested Sub-Categories:</div>
                    
                    {nestedSubs.length === 0 ? (
                      <div className="bg-slate-50/50 rounded-xl p-6 text-center border border-dashed border-slate-200">
                        <span className="text-xs text-slate-400 italic font-medium">No sub-categories defined. Add applications, infrastructure, or other sub-scopes.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {nestedSubs.map((sub, sIdx) => {
                          const isEditingSub = editingSubcategoryIndex?.category === cat && editingSubcategoryIndex?.index === sIdx;
                          return (
                            <div key={sub} className="bg-slate-50 hover:bg-slate-100/75 border border-slate-150 rounded-xl p-2.5 flex items-center justify-between transition-colors">
                              
                              <div className="flex-1 mr-2">
                                {isEditingSub ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editSubcategoryName}
                                      onChange={e => setEditSubcategoryName(e.target.value)}
                                      className="bg-white border border-indigo-200 px-2 py-0.5 text-xs font-semibold rounded text-slate-705 w-full focus:outline-none"
                                      placeholder="Renamed sub..."
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleUpdateSubcategory(cat, sIdx)}
                                      className="p-0.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-850 font-bold">{sub}</span>
                                )}
                              </div>

                              {isAdmin && !isEditingSub && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSubcategoryIndex({ category: cat, index: sIdx });
                                      setEditSubcategoryName(sub);
                                    }}
                                    className="text-slate-450 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                    title="Edit sub"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubcategory(cat, sub)}
                                    className="text-slate-400 hover:text-red-650 p-0.5 rounded cursor-pointer"
                                    title="Delete sub"
                                  >
                                    &times;
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Subcategory Inline Input */}
                  {isAdmin && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add sub-category (e.g. Cybersecurity)"
                        value={newSubInputs[cat] || ''}
                        onChange={e => setNewSubInputs(prev => ({
                          ...prev,
                          [cat]: e.target.value
                        }))}
                        className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubcategory(cat)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] px-3.5 py-1 rounded-lg cursor-pointer shrink-0 transition-colors uppercase font-mono tracking-wider"
                      >
                        + ADD
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB RENDERING: 3. AUDITING DIVISION UNITS */}
      {activeAdminTab === 'units' && (
        <div className="space-y-6" id="auditing_units_admin_panel">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase">Assigned Auditing Divisions / Specialty Units</h3>
                <p className="text-[10px] text-slate-400 font-medium">Assign these units to oversee risk-rated universe entities. These correspond to distinct teams and branches in the bank.</p>
              </div>

              {isAdmin && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearDirectoryAndTeams}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-650" /> Clear Directory & Teams
                  </button>
                  <form onSubmit={handleAddAuditingUnit} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="E.g. Sharia Compliance Team"
                      value={newUnitInput}
                      onChange={e => setNewUnitInput(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white w-48 md:w-56"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                    >
                      Register Unit
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" id="divisions_grid_list">
              {auditingUnitsList.map((unit, uIdx) => {
                const isEditingUnit = editingUnitIndex === uIdx;
                const mappedCount = universe.filter(item => item.auditingUnit === unit && !item.isDeleted).length;

                return (
                  <div key={unit} className="border border-slate-150 rounded-xl p-4 bg-white hover:border-slate-350 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 mr-3">
                        <Layers className="w-4 h-4 text-slate-450" />
                        
                        {isEditingUnit ? (
                          <div className="flex items-center gap-1 w-full">
                            <input
                              type="text"
                              value={editUnitName}
                              onChange={e => setEditUnitName(e.target.value)}
                              className="bg-white border border-indigo-200 px-2 py-1 text-xs font-bold rounded text-slate-800 focus:outline-none w-full"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateAuditingUnit(uIdx)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-extrabold text-xs text-slate-900">{unit}</span>
                        )}
                      </div>

                      {isAdmin && !isEditingUnit && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUnitIndex(uIdx);
                              setEditUnitName(unit);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-850 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAuditingUnit(unit)}
                            className="p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sub Teams Section */}
                    <div className="space-y-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-slate-500 pb-1 border-b border-slate-200/60">
                        <span>Sub Teams ({(unitSubTeamsMap[unit] || []).length})</span>
                      </div>
                      
                      {(!unitSubTeamsMap[unit] || unitSubTeamsMap[unit].length === 0) ? (
                        <p className="text-[10px] text-slate-400 italic">No sub-teams registered</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                          {(unitSubTeamsMap[unit] || []).map(subTeam => {
                            // Find assigned personnel dynamically
                            const subTeamManager = users.find(u => u.department === unit && u.team === subTeam && u.role === 'Team Leader');
                            const subTeamAuditors = users.filter(u => u.department === unit && u.team === subTeam && u.role === 'Auditor');

                            return (
                              <div key={subTeam} className="bg-white border border-slate-150 rounded-lg p-2 hover:border-indigo-200 transition-colors relative group">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-slate-800 text-[11px] block truncate max-w-[170px]">{subTeam}</span>
                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubTeamFromUnit(unit, subTeam)}
                                      className="text-slate-400 hover:text-red-650 cursor-pointer rounded p-0.5"
                                      title="Delete sub-team"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="text-[9px] text-slate-500 mt-1 space-y-0.5 leading-none">
                                  <div>
                                    <span className="font-bold text-indigo-650">Manager:</span>{' '}
                                    <span className="font-medium text-slate-700">{subTeamManager ? subTeamManager.name : 'Unassigned'}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-emerald-650">Auditors:</span>{' '}
                                    <span className="font-mono text-slate-600">
                                      {subTeamAuditors.length > 0 
                                        ? subTeamAuditors.map(a => a.name.split(' ')[0]).join(', ') 
                                        : 'None'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add sub-team form inline */}
                      {isAdmin && (
                        <div className="flex gap-1.5 pt-2 border-t border-dashed border-slate-200">
                          <input
                            type="text"
                            placeholder="Add sub-team name..."
                            value={newSubTeamInputs[unit] || ''}
                            onChange={e => setNewSubTeamInputs({
                              ...newSubTeamInputs,
                              [unit]: e.target.value
                            })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubTeamToUnit(unit, newSubTeamInputs[unit] || '');
                              }
                            }}
                            className="bg-white border border-slate-255 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubTeamToUnit(unit, newSubTeamInputs[unit] || '')}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer flex items-center justify-center transition-colors"
                            title="Add sub-team"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100/80">
                      <span>Mapped Auditable Units:</span>
                      <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {mappedCount} registered
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'universe' && (
        <div className="space-y-4 animate-fade-in" id="admin_universe_panel">
          <UniversePlanView defaultTab="Registry" hideTabsSelection={true} />
        </div>
      )}

      {activeAdminTab === 'templates' && (
        <div className="space-y-4 animate-fade-in" id="admin_templates_panel">
          <UniversePlanView defaultTab="Templates" hideTabsSelection={true} />
        </div>
      )}

      {activeAdminTab === 'responsibilities' && (
        <div className="space-y-4 animate-fade-in" id="admin_responsibilities_panel">
          <StandardsPolicyView
            users={users}
            onUpdateUsers={onUpdateUsers}
            onLogAction={onLogAction}
            activeRole={activeRole}
            initialSegment="Responsibilities"
            hideHeaderAndSelector={true}
          />
        </div>
      )}

      {activeAdminTab === 'standards' && (
        <div className="space-y-4 animate-fade-in" id="admin_standards_panel">
          <StandardsPolicyView
            users={users}
            onUpdateUsers={onUpdateUsers}
            onLogAction={onLogAction}
            activeRole={activeRole}
            initialSegment="Standards"
            hideHeaderAndSelector={true}
          />
        </div>
      )}

      {activeAdminTab === 'policies' && (
        <div className="space-y-4 animate-fade-in" id="admin_policies_panel">
          <StandardsPolicyView
            users={users}
            onUpdateUsers={onUpdateUsers}
            onLogAction={onLogAction}
            activeRole={activeRole}
            initialSegment="Policies"
            hideHeaderAndSelector={true}
          />
        </div>
      )}

      {/* TAB RENDERING: 4. SYSTEM POOLS & STORAGE DIAGNOSTICS */}
      {activeAdminTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="system_diagnostics_panel">
          
          {/* Card 1: Metrics stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" /> Storage Database Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold block">UNIVERSE ITEMS</span>
                <span className="text-xl font-extrabold text-slate-900">{universe.filter(u => !u.isDeleted).length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold block">SSO USERS</span>
                <span className="text-xl font-extrabold text-slate-900">{users.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold block">ACTIVE AUDITS</span>
                <span className="text-xl font-extrabold text-slate-900">{engagements.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold block">FINDINGS TOTAL</span>
                <span className="text-xl font-extrabold text-slate-900">{findings.length}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Active Directory (ADFS) Integration:</span>
                <span className="text-emerald-700">Online & Encrypted</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Persistence Service:</span>
                <span className="text-slate-605">Durable Local Storage</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Platform System Environment:</span>
                <span className="text-indigo-650">NBE Verify v2.07</span>
              </div>
            </div>
          </div>

          {/* Card 2: Diagnostics */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-600" /> Platform Diagnostics
            </h3>

            <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-4 rounded-xl min-h-[160px] overflow-y-auto space-y-1 block border border-slate-850">
              <div>[INFO] - System Initialization complete.</div>
              <div>[DB] - Connection established with mock memory tables.</div>
              <div>[SSO] - Synced with local AD session authority token.</div>
              <div>[AUDIT] - Registered active taxonomy schema category list.</div>
              <div>[DIAG] - Active divisions matching bounds verified successfully.</div>
              <div>[DIAG] - SLA Escalation checker loop status is [GREEN].</div>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Custom Alert Dialog */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-up space-y-4">
            <h3 className="font-bold border-b border-slate-100 pb-2 text-slate-900">Notice</h3>
            <p className="text-sm text-slate-700">{alertDialog.message}</p>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setAlertDialog({ isOpen: false, message: '' })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-up space-y-4">
            <h3 className="font-bold border-b border-slate-100 pb-2 text-slate-900">Confirm Action</h3>
            <p className="text-sm text-slate-700 font-medium">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
