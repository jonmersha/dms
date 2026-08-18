/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  PlusCircle, 
  Users, 
  FileText, 
  CheckCircle, 
  Clipboard, 
  Send, 
  ChevronRight, 
  ChevronDown,
  UserCheck, 
  AlertCircle,
  Clock,
  Briefcase,
  FileCheck,
  Trash2,
  FolderOpen,
  RefreshCw
} from 'lucide-react';
import { 
  Engagement, 
  AnnualPlanItem, 
  User, 
  WbsTask,
  UserRole,
  AuditUniverseEntity
} from '../types';

interface StaticSubTeam {
  name: string;
  focus: string;
  lead: string;
  members: string[];
}

interface StaticTeam {
  name: string;
  lead: string;
  subTeams: StaticSubTeam[];
}

interface StaticSection {
  name: string;
  lead: string;
  teams: StaticTeam[];
}

const DEFAULT_AUDIT_DEPARTMENT_STRUCTURE: StaticSection[] = [
  {
    name: 'IT & Cyber Security Audit Section',
    lead: 'Yohannes Hailu (Chief Information Security Auditor)',
    teams: [
      {
        name: 'Infrastructure & Database Security Team',
        lead: 'Yohannes Hailu',
        subTeams: [
          {
            name: 'Database & Cloud Security Sub-team',
            focus: 'DBMS general access controls, operating systems audits, database configuration extraction, and cloud service integrations.',
            lead: 'Yohannes Hailu',
            members: ['Yohannes Hailu', 'Selamawit Demeke']
          },
          {
            name: 'Network & OS Systems Sub-team',
            focus: 'Network topologies, firewalls, routing security, OS patch management protocols, and server environment setups.',
            lead: 'Selamawit Demeke',
            members: ['Selamawit Demeke']
          }
        ]
      },
      {
        name: 'Digital Banking & FinTech Security Team',
        lead: 'Aster Bekele',
        subTeams: [
          {
            name: 'Mobile & API Channels Sub-team',
            focus: 'Mobile applications APIs endpoints, third-party middleware APIs integration security, and customer authentication methods.',
            lead: 'Aster Bekele',
            members: ['Aster Bekele', 'Selamawit Demeke']
          },
          {
            name: 'SWIFT Systems Interfaces Sub-team',
            focus: 'SWIFT customer security programme compliance and gateway connection parameters.',
            lead: 'Yohannes Hailu',
            members: ['Yohannes Hailu']
          }
        ]
      }
    ]
  },
  {
    name: 'Financial & Operations Audit Section',
    lead: 'Tigist Assefa (Senior Audit Director)',
    teams: [
      {
        name: 'HQ Operations & Treasury Audit Team',
        lead: 'Tigist Assefa',
        subTeams: [
          {
            name: 'Treasury Investment Allocations Sub-team',
            focus: 'Foreign exchange rate allocations compliance, investment portfolio limits, and sovereign bond compliance audits.',
            lead: 'Tigist Assefa',
            members: ['Tigist Assefa', 'Yohannes Hailu']
          },
          {
            name: 'General Ledger & ERP Systems Sub-team',
            focus: 'Financial journals entry review, automation matches, and ERP core accounts configuration validations.',
            lead: 'Mekonnen Tadesse',
            members: ['Mekonnen Tadesse']
          }
        ]
      },
      {
        name: 'Branch Network Operations Audit Team',
        lead: 'Selamawit Demeke',
        subTeams: [
          {
            name: 'Bole & Premium Branches Sub-team',
            focus: 'High net worth client transactions checklists, premium branch physical vault security, and custom teller limit checks.',
            lead: 'Selamawit Demeke',
            members: ['Selamawit Demeke']
          },
          {
            name: 'Regional & Main Branches Sub-team',
            focus: 'Operational audits of outlying branch offices, cash handling compliance controls, and local regulatory reporting.',
            lead: 'Selamawit Demeke',
            members: ['Selamawit Demeke']
          }
        ]
      }
    ]
  },
  {
    name: 'Risk & Compliance Audit Section',
    lead: 'Abebe Kebede (Chief Compliance Audit Liaison)',
    teams: [
      {
        name: 'Regulatory & NBE Compliance Team',
        lead: 'Abebe Kebede',
        subTeams: [
          {
            name: 'NBE Guidelines Audit Sub-team',
            focus: 'Core evaluation of capital adequacy regulations, credit exposure controls, and National Bank of Ethiopia regulatory directives.',
            lead: 'Abebe Kebede',
            members: ['Abebe Kebede', 'Tigist Assefa']
          },
          {
            name: 'INSA Security Directives Sub-team',
            focus: 'Audit of systems against Information Network Security Administration (INSA) national protocols.',
            lead: 'Yohannes Hailu',
            members: ['Yohannes Hailu']
          }
        ]
      },
      {
        name: 'Enterprise Risk Management Team',
        lead: 'Worku Lemma',
        subTeams: [
          {
            name: 'Key Control Indicators Sub-team',
            focus: 'Evaluation of operational risk index parameters, business continuity backups, and risk management registry alignment.',
            lead: 'Worku Lemma',
            members: ['Worku Lemma']
          },
          {
            name: 'Fraud Prevention & AML Sub-team',
            focus: 'Anti-money laundering transaction logs analysis, suspicious activities triggers, and KYC profile validation procedures.',
            lead: 'Tigist Assefa',
            members: ['Tigist Assefa', 'Mekonnen Tadesse']
          }
        ]
      }
    ]
  }
];

export default function EngagementView() {
  const { engagements, setEngagements: onUpdateEngagements, annualPlan, users, universe, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();


  // Selected Engagement for Detail view (WBS / Letter review)
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(
    engagements.length > 0 ? engagements[0].id : null
  );

  const selectedEngagement = engagements.find(e => e.id === selectedEngagementId);

  // Program Edit States
  const [editIntro, setEditIntro] = useState('');
  const [editObjectives, setEditObjectives] = useState('');
  const [editScope, setEditScope] = useState('');
  const [editMethodology, setEditMethodology] = useState('');

  // Entry Conference Edit States
  const [ecDate, setEcDate] = useState('');
  const [ecMinutes, setEcMinutes] = useState('');
  const [ecAttendees, setEcAttendees] = useState('');

  // Sub-tabs within EngagementView: 'tracker' or 'hierarchy'
  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'hierarchy'>('tracker');

  // Form State: Convert Plan to active Engagement
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [topCreationTab, setTopCreationTab] = useState<'single' | 'bulk'>('single');
  const [creationMode, setCreationMode] = useState<'plan' | 'universe' | 'custom'>('plan');
  const [planToConvertId, setPlanToConvertId] = useState('');
  const [selectedUniverseEntityId, setSelectedUniverseEntityId] = useState('');
  const [customEntityName, setCustomEntityName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [auditorInCharge, setAuditorInCharge] = useState('Yohannes Hailu');
  const [selectedTeam, setSelectedTeam] = useState<string[]>(['Selamawit Demeke']);
  const [startDate, setStartDate] = useState('2026-06-10');
  const [endDate, setEndDate] = useState('2026-07-30');

  // Bulk given period parameters
  const [bulkPeriodYear, setBulkPeriodYear] = useState('2026');
  const [bulkPeriodQuarter, setBulkPeriodQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Full Year'>('Q1');
  const [bulkSelectedEntityIds, setBulkSelectedEntityIds] = useState<string[]>([]);

  // Dynamic department structure state
  const [departmentStructure, setDepartmentStructure] = useState<StaticSection[]>(() => {
    const cached = localStorage.getItem('AUDIT_DEPARTMENT_STRUCTURE');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    // Default is empty array to satisfy the "clear directory" seed requirement,
    // but the user can use "Reset Defaults" if they want to repopulate.
    return [];
  });

  const updateDepartmentStructureState = (newStructure: StaticSection[]) => {
    setDepartmentStructure(newStructure);
    localStorage.setItem('AUDIT_DEPARTMENT_STRUCTURE', JSON.stringify(newStructure));
  };

  // State for modals / management forms
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionLead, setNewSectionLead] = useState('');

  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [targetSectionForTeam, setTargetSectionForTeam] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLead, setNewTeamLead] = useState('');

  const [showAddSubTeamModal, setShowAddSubTeamModal] = useState(false);
  const [targetSectionForSubTeam, setTargetSectionForSubTeam] = useState('');
  const [targetTeamForSubTeam, setTargetTeamForSubTeam] = useState('');
  const [newSubTeamName, setNewSubTeamName] = useState('');
  const [newSubTeamLead, setNewSubTeamLead] = useState('');
  const [newSubTeamFocus, setNewSubTeamFocus] = useState('');
  const [newSubTeamMembers, setNewSubTeamMembers] = useState('');

  // Interactive drop-downs for hierarchy assignments during creation
  const [selectedSectionName, setSelectedSectionName] = useState(() => {
    const cached = localStorage.getItem('AUDIT_DEPARTMENT_STRUCTURE');
    const parsed = cached ? JSON.parse(cached) : [];
    return parsed[0]?.name || '';
  });
  const [selectedTeamName, setSelectedTeamName] = useState(() => {
    const cached = localStorage.getItem('AUDIT_DEPARTMENT_STRUCTURE');
    const parsed = cached ? JSON.parse(cached) : [];
    return parsed[0]?.teams[0]?.name || '';
  });
  const [selectedSubTeamName, setSelectedSubTeamName] = useState(() => {
    const cached = localStorage.getItem('AUDIT_DEPARTMENT_STRUCTURE');
    const parsed = cached ? JSON.parse(cached) : [];
    return parsed[0]?.teams[0]?.subTeams[0]?.name || '';
  });

  // Hierarchy Accordion view expander states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'IT & Cyber Security Audit Section': true,
    'Financial & Operations Audit Section': false,
    'Risk & Compliance Audit Section': false
  });
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
    'Infrastructure & Database Security Team': true,
    'HQ Operations & Treasury Audit Team': true,
    'Regulatory & NBE Compliance Team': true
  });
  const [selectedHierarchySubTeam, setSelectedHierarchySubTeam] = useState<StaticSubTeam | null>(() => {
    const cached = localStorage.getItem('AUDIT_DEPARTMENT_STRUCTURE');
    const parsed = cached ? JSON.parse(cached) : [];
    return parsed[0]?.teams[0]?.subTeams[0] || null;
  });

  // Sync state when departmentStructure changes
  useEffect(() => {
    if (departmentStructure.length > 0) {
      const firstSec = departmentStructure[0];
      if (!selectedSectionName || !departmentStructure.some(s => s.name === selectedSectionName)) {
        setSelectedSectionName(firstSec.name);
      }
      
      const currentSec = departmentStructure.find(s => s.name === (selectedSectionName || firstSec.name)) || firstSec;
      if (currentSec.teams.length > 0) {
        const firstTeam = currentSec.teams[0];
        if (!selectedTeamName || !currentSec.teams.some(t => t.name === selectedTeamName)) {
          setSelectedTeamName(firstTeam.name);
        }
        
        const currentTeam = currentSec.teams.find(t => t.name === (selectedTeamName || firstTeam.name)) || firstTeam;
        if (currentTeam.subTeams.length > 0) {
          const firstSub = currentTeam.subTeams[0];
          if (!selectedSubTeamName || !currentTeam.subTeams.some(s => s.name === selectedSubTeamName)) {
            setSelectedSubTeamName(firstSub.name);
          }
          if (!selectedHierarchySubTeam || !currentTeam.subTeams.some(s => s.name === selectedHierarchySubTeam.name)) {
            setSelectedHierarchySubTeam(firstSub);
          }
        } else {
          setSelectedSubTeamName('');
          setSelectedHierarchySubTeam(null);
        }
      } else {
        setSelectedTeamName('');
        setSelectedSubTeamName('');
        setSelectedHierarchySubTeam(null);
      }
    } else {
      setSelectedSectionName('');
      setSelectedTeamName('');
      setSelectedSubTeamName('');
      setSelectedHierarchySubTeam(null);
    }
  }, [departmentStructure, selectedSectionName, selectedTeamName]);

  // State to hold selected active engagement ID for quick assignment in hierarchy detail view
  const [reassignEngId, setReassignEngId] = useState('');

  // Lifecycle Phase Tab state: 'planning' | 'program' | 'review' | 'entry' | 'fieldwork' | 'closure'
  const [activePhaseTab, setActivePhaseTab] = useState<'planning' | 'program' | 'review' | 'entry' | 'fieldwork' | 'closure'>('planning');

  // Fallback defaults and getters for planning details (ensuring no blank or broken states)
  const getIntroduction = (eng: Engagement) => {
    return eng.engagementLetter.introduction || `This audit engagement of ${eng.entityName} is initiated in accordance with the annual risk-based work plan. The review focuses on operational security, compliance, and procedural controls.`;
  };

  const getObjectives = (eng: Engagement) => {
    return eng.engagementLetter.objectives || `1. Assess the adequacy and effectiveness of key operational controls.\n2. Ensure alignment with National Bank of Ethiopia (NBE) and INSA directives.\n3. Identify operational security weaknesses and recommend remedial actions.`;
  };

  const getScope = (eng: Engagement) => {
    return eng.engagementLetter.scope || `The scope spans processes, administrative logs, systems configuration, and resource allocations active in the fiscal period of 2026.`;
  };

  const getMethodology = (eng: Engagement) => {
    return eng.engagementLetter.methodology || `1. Document Review: Examine policies, system diagrams, and backup records.\n2. Inquiries: Conduct interviews with systems administrators and unit management.\n3. Control Testing: Perform password configuration extracts and access matrix validation.\n4. Analytical Review: Cross-verify transaction rate tolerances.`;
  };

  const getTimeline = (eng: Engagement) => {
    return eng.engagementLetter.timeline || {
      planningStart: eng.startDate,
      planningEnd: eng.startDate,
      fieldworkStart: eng.startDate,
      fieldworkEnd: eng.endDate,
      reportingStart: eng.endDate,
      reportingEnd: eng.endDate,
      closureStart: eng.endDate,
      closureEnd: eng.endDate,
    };
  };

  const getTeamRoles = (eng: Engagement) => {
    const roles: Record<string, 'Engagement Manager' | 'Team Leader' | 'Field Auditor'> = {};
    eng.teamMembers.forEach((member, idx) => {
      if (idx === 0) {
        roles[member] = 'Team Leader';
      } else if (idx === 1 && eng.teamMembers.length > 2) {
        roles[member] = 'Engagement Manager';
      } else {
        roles[member] = 'Field Auditor';
      }
    });
    return eng.engagementLetter.teamRoles || roles;
  };

  const getEntryConference = (eng: Engagement) => {
    return eng.engagementLetter.entryConference || {
      date: eng.startDate,
      scheduled: false,
      completed: false,
      attendees: [eng.auditorInCharge],
      minutes: `The Entry Conference was held with management of ${eng.entityName} to align objectives, confirm scope, and agree on information requests.`,
      checklists: {
        teamIntroduced: false,
        objectivesConfirmed: false,
        methodologyDiscussed: false,
        timelineConfirmed: false,
        infoRequirementsExplained: false,
        rolesClarified: false,
        communicationAgreed: false,
      }
    };
  };

  // Generic letter field update helper
  const handleUpdateEngagementLetterDetails = (updatedLetterFields: any) => {
    if (!selectedEngagement) return;
    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          engagementLetter: {
            ...item.engagementLetter,
            ...updatedLetterFields
          }
        };
      }
      return item;
    });
    onUpdateEngagements(updatedEngagements);
  };

  const handleUpdateTeamRole = (member: string, role: 'Engagement Manager' | 'Team Leader' | 'Field Auditor') => {
    if (!selectedEngagement) return;
    const currentRoles = getTeamRoles(selectedEngagement);
    const updatedRoles = { ...currentRoles, [member]: role };
    handleUpdateEngagementLetterDetails({ teamRoles: updatedRoles });
    onLogAction('Team Role Definition', `Assigned role "${role}" to ${member} in Engagement #${selectedEngagement.id}`);
  };

  const handleUpdateTimeline = (field: string, val: string) => {
    if (!selectedEngagement) return;
    const currentTimeline = getTimeline(selectedEngagement);
    const updatedTimeline = { ...currentTimeline, [field]: val };
    handleUpdateEngagementLetterDetails({ timeline: updatedTimeline });
  };

  const handleUpdateProgramDetails = (fields: { introduction?: string; objectives?: string; scope?: string; methodology?: string }) => {
    handleUpdateEngagementLetterDetails(fields);
  };

  const handleUpdateEntryConference = (fields: any) => {
    if (!selectedEngagement) return;
    const currentEc = getEntryConference(selectedEngagement);
    const updatedEc = {
      ...currentEc,
      ...fields,
      checklists: {
        ...currentEc.checklists,
        ...(fields.checklists || {})
      }
    };
    handleUpdateEngagementLetterDetails({ entryConference: updatedEc });
  };

  // Automatically adjust the active view tab and initialize edit form states when selected engagement changes
  React.useEffect(() => {
    if (!selectedEngagement) return;
    const ec = getEntryConference(selectedEngagement);
    
    // Set edit form values
    setEditIntro(getIntroduction(selectedEngagement));
    setEditObjectives(getObjectives(selectedEngagement));
    setEditScope(getScope(selectedEngagement));
    setEditMethodology(getMethodology(selectedEngagement));
    setEcDate(ec.date || selectedEngagement.startDate);
    setEcMinutes(ec.minutes || '');
    setEcAttendees(ec.attendees ? ec.attendees.join(', ') : selectedEngagement.auditorInCharge);

    if (selectedEngagement.status === 'Initiated' || selectedEngagement.status === 'Draft Report' || selectedEngagement.status === 'Completed') {
      if (!selectedEngagement.engagementLetter.programApproved) {
        setActivePhaseTab('planning');
      } else if (!selectedEngagement.engagementLetter.isAccepted) {
        setActivePhaseTab('review');
      } else if (!ec.completed) {
        setActivePhaseTab('entry');
      } else {
        setActivePhaseTab('fieldwork');
      }
    } else if (selectedEngagement.status === 'Fieldwork') {
      setActivePhaseTab('fieldwork');
    }
  }, [selectedEngagementId]);

  // Handle cascading hierarchy select changes in form using dynamic state
  const handleSectionChange = (sectionName: string) => {
    setSelectedSectionName(sectionName);
    const sec = departmentStructure.find(s => s.name === sectionName);
    if (sec && sec.teams.length > 0) {
      setSelectedTeamName(sec.teams[0].name);
      if (sec.teams[0].subTeams.length > 0) {
        setSelectedSubTeamName(sec.teams[0].subTeams[0].name);
      } else {
        setSelectedSubTeamName('');
      }
    } else {
      setSelectedTeamName('');
      setSelectedSubTeamName('');
    }
  };

  const handleTeamChange = (teamName: string) => {
    setSelectedTeamName(teamName);
    const sec = departmentStructure.find(s => s.name === selectedSectionName);
    if (sec) {
      const team = sec.teams.find(t => t.name === teamName);
      if (team && team.subTeams.length > 0) {
        setSelectedSubTeamName(team.subTeams[0].name);
      } else {
        setSelectedSubTeamName('');
      }
    }
  };

  // Directory management helper functions
  const handleAddSection = (name: string, lead: string) => {
    if (!name.trim()) return;
    const exists = departmentStructure.some(s => s.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      alert("A section with this name already exists.");
      return;
    }
    const newSection: StaticSection = {
      name: name.trim(),
      lead: lead.trim() || 'Unassigned Section Head',
      teams: []
    };
    const updated = [...departmentStructure, newSection];
    updateDepartmentStructureState(updated);
  };

  const handleDeleteSection = (sectionName: string) => {
    if (!confirm(`Are you sure you want to delete the "${sectionName}" division/section? All its nested teams and sub-teams will be deleted.`)) return;
    const updated = departmentStructure.filter(s => s.name !== sectionName);
    updateDepartmentStructureState(updated);
  };

  const handleAddTeam = (sectionName: string, teamName: string, teamLead: string) => {
    if (!teamName.trim()) return;
    const updated = departmentStructure.map(sec => {
      if (sec.name === sectionName) {
        const exists = sec.teams.some(t => t.name.toLowerCase() === teamName.trim().toLowerCase());
        if (exists) {
          alert("A team with this name already exists in this section.");
          return sec;
        }
        return {
          ...sec,
          teams: [
            ...sec.teams,
            {
              name: teamName.trim(),
              lead: teamLead.trim() || 'Unassigned Team Lead',
              subTeams: []
            }
          ]
        };
      }
      return sec;
    });
    updateDepartmentStructureState(updated);
  };

  const handleDeleteTeam = (sectionName: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete the "${teamName}" team?`)) return;
    const updated = departmentStructure.map(sec => {
      if (sec.name === sectionName) {
        return {
          ...sec,
          teams: sec.teams.filter(t => t.name !== teamName)
        };
      }
      return sec;
    });
    updateDepartmentStructureState(updated);
  };

  const handleAddSubTeam = (sectionName: string, teamName: string, subTeamName: string, subTeamLead: string, focus: string, members: string[]) => {
    if (!subTeamName.trim()) return;
    const updated = departmentStructure.map(sec => {
      if (sec.name === sectionName) {
        return {
          ...sec,
          teams: sec.teams.map(team => {
            if (team.name === teamName) {
              const exists = team.subTeams.some(sub => sub.name.toLowerCase() === subTeamName.trim().toLowerCase());
              if (exists) {
                alert("A sub-team with this name already exists in this team.");
                return team;
              }
              return {
                ...team,
                subTeams: [
                  ...team.subTeams,
                  {
                    name: subTeamName.trim(),
                    lead: subTeamLead.trim() || 'Unassigned Sub-team Leader',
                    focus: focus.trim() || 'General audit fieldwork assignments.',
                    members: members.length > 0 ? members : ['Unassigned Auditor']
                  }
                ]
              };
            }
            return team;
          })
        };
      }
      return sec;
    });
    updateDepartmentStructureState(updated);
  };

  const handleDeleteSubTeam = (sectionName: string, teamName: string, subTeamName: string) => {
    if (!confirm(`Are you sure you want to delete the "${subTeamName}" sub-team?`)) return;
    const updated = departmentStructure.map(sec => {
      if (sec.name === sectionName) {
        return {
          ...sec,
          teams: sec.teams.map(team => {
            if (team.name === teamName) {
              return {
                ...team,
                subTeams: team.subTeams.filter(sub => sub.name !== subTeamName)
              };
            }
            return team;
          })
        };
      }
      return sec;
    });
    updateDepartmentStructureState(updated);
  };

  const handleClearAllDirectory = () => {
    if (!confirm("Are you sure you want to clear the entire Audit Department Directory, including all sections, teams, and sub-teams?")) return;
    updateDepartmentStructureState([]);
    alert("Audit Department Directory and teams cleared successfully!");
  };

  const handleResetToDefaultDirectory = () => {
    if (!confirm("Are you sure you want to restore the pre-seeded default Audit Department Directory sections and teams?")) return;
    updateDepartmentStructureState(DEFAULT_AUDIT_DEPARTMENT_STRUCTURE);
    alert("Default organization structure restored!");
  };

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleTeam = (name: string) => {
    setExpandedTeams(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleReassignEngagement = (subTeamName: string, sectionName: string, teamName: string) => {
    if (!reassignEngId) return;
    
    const targetEng = engagements.find(e => e.id === reassignEngId);
    if (!targetEng) return;

    const updated = engagements.map(e => {
      if (e.id === reassignEngId) {
        return {
          ...e,
          assignedSection: sectionName,
          assignedTeam: teamName,
          assignedSubTeam: subTeamName
        };
      }
      return e;
    });

    onUpdateEngagements(updated);
    onLogAction(
      'Engagement Reassignment',
      `Reassigned Active Engagement #${reassignEngId} ("${targetEng.title}") to ${sectionName} -> ${teamName} -> ${subTeamName}.`
    );
    alert(`Successfully reassigned engagement "${targetEng.title}" to ${subTeamName}!`);
    setReassignEngId('');
  };

  // Filter approved plans that aren't already converted
  const approvedPlans = annualPlan.filter(
    p => p.status === 'Approved' && !engagements.some(e => e.planId === p.id)
  );

  // Filter candidates for team allocation
  const teamLeaders = users.filter(u => u.role === 'Team Leader' || u.role === 'Admin');
  const fieldAuditors = users.filter(u => u.role === 'Auditor');

  // Launch Engagement
  const handleCreateEngagement = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (topCreationTab === 'single') {
      let resolvedPlanId = 'adhoc';
      let resolvedEntityId = '';
      let resolvedEntityName = '';
      let resolvedTitle = '';

      if (creationMode === 'plan') {
        const plan = annualPlan.find(p => p.id === planToConvertId);
        if (!plan) {
          alert("Please select a valid approved plan item.");
          return;
        }
        resolvedPlanId = plan.id;
        resolvedEntityId = plan.entityId;
        resolvedEntityName = plan.entityName;
        resolvedTitle = `${plan.entityName} Controls Engagement`;
      } else if (creationMode === 'universe') {
        const entity = universe.find(ent => ent.id === selectedUniverseEntityId);
        if (!entity) {
          alert("Please select a valid Audit Universe Entity.");
          return;
        }
        resolvedPlanId = 'adhoc';
        resolvedEntityId = entity.id;
        resolvedEntityName = entity.name;
        resolvedTitle = customTitle.trim() || `${entity.name} Controls Engagement`;
      } else { // custom
        if (!customEntityName.trim()) {
          alert("Please provide an Auditable Entity Name.");
          return;
        }
        resolvedPlanId = 'custom';
        resolvedEntityId = `ent-custom-${Date.now().toString().slice(-4)}`;
        resolvedEntityName = customEntityName.trim();
        resolvedTitle = customTitle.trim() || `${resolvedEntityName} Controls Engagement`;
      }

      const uniqueTeamMembers = Array.from(new Set([auditorInCharge, ...selectedTeam]));

      const newEng: Engagement = {
        id: `eng-${Date.now().toString().slice(-4)}`,
        planId: resolvedPlanId,
        title: resolvedTitle,
        entityId: resolvedEntityId,
        entityName: resolvedEntityName,
        auditorInCharge,
        teamMembers: uniqueTeamMembers,
        status: 'Initiated',
        startDate,
        endDate,
        engagementLetter: {
          body: `Dear Operations Management,\n\nIn accordance with the 2026 Audit Mandates and risk framework, we are establishing the active audit engagement: "${resolvedTitle}" covering security, controls and compliance for "${resolvedEntityName}".\n\nFieldwork operations scheduled to run from ${startDate} through ${endDate}.\n\nSincerely,\nTigist Assefa\nSenior Audit Manager`,
          sentDate: new Date().toISOString().split('T')[0],
          isAccepted: false
        },
        wbs: [
          { id: 'wbs-1', title: 'Preliminary Survey & Risk Mapping', assignee: auditorInCharge, startDate, endDate: startDate, status: 'Not Started', workingPapers: [] }
        ],
        assignedSection: selectedSectionName,
        assignedTeam: selectedTeamName,
        assignedSubTeam: selectedSubTeamName
      };

      onUpdateEngagements([...engagements, newEng]);
      setShowCreateForm(false);
      setSelectedEngagementId(newEng.id);
      
      const detailsMsg = creationMode === 'plan' 
        ? `Promoted annual plan #${resolvedPlanId} for "${resolvedEntityName}" to Active Engagement assigned to "${selectedSubTeamName}".`
        : `Created ad-hoc/direct Engagement "${resolvedTitle}" for "${resolvedEntityName}" assigned to "${selectedSubTeamName}".`;
        
      onLogAction('Engagement Creation', detailsMsg);
    } else {
      // Bulk creation for given period
      if (bulkSelectedEntityIds.length === 0) {
        alert("Please select at least one Auditable Object (Entity) to generate engagements.");
        return;
      }

      const uniqueTeamMembers = Array.from(new Set([auditorInCharge, ...selectedTeam]));
      const newEngs: Engagement[] = [];

      bulkSelectedEntityIds.forEach((entId, idx) => {
        const entity = universe.find(ent => ent.id === entId);
        if (!entity) return;

        // Try to find if there is an approved plan item for this entity
        const matchedPlan = annualPlan.find(p => p.entityId === entId && p.status === 'Approved');
        const resolvedPlanId = matchedPlan ? matchedPlan.id : 'adhoc';

        const resolvedTitle = `${entity.name} ${bulkPeriodQuarter} Controls Engagement`;
        const engId = `eng-bulk-${Date.now().toString().slice(-4)}-${idx + 1}`;

        newEngs.push({
          id: engId,
          planId: resolvedPlanId,
          title: resolvedTitle,
          entityId: entId,
          entityName: entity.name,
          auditorInCharge,
          teamMembers: uniqueTeamMembers,
          status: 'Initiated',
          startDate,
          endDate,
          engagementLetter: {
            body: `Dear Operations Management,\n\nIn accordance with the ${bulkPeriodYear} Audit Mandates and risk framework, we are establishing the active audit engagement: "${resolvedTitle}" covering security, controls and compliance for "${entity.name}".\n\nFieldwork operations scheduled to run from ${startDate} through ${endDate}.\n\nSincerely,\nTigist Assefa\nSenior Audit Manager`,
            sentDate: new Date().toISOString().split('T')[0],
            isAccepted: false
          },
          wbs: [
            { id: 'wbs-1', title: 'Preliminary Survey & Risk Mapping', assignee: auditorInCharge, startDate, endDate: startDate, status: 'Not Started', workingPapers: [] }
          ],
          assignedSection: selectedSectionName,
          assignedTeam: selectedTeamName,
          assignedSubTeam: selectedSubTeamName
        });
      });

      onUpdateEngagements([...engagements, ...newEngs]);
      setShowCreateForm(false);
      if (newEngs.length > 0) {
        setSelectedEngagementId(newEngs[0].id);
      }
      
      onLogAction('Bulk Engagement Creation', `Bulk generated ${newEngs.length} engagements for Period: ${bulkPeriodQuarter} ${bulkPeriodYear}.`);
      alert(`Successfully bulk-generated ${newEngs.length} engagements for the period ${bulkPeriodQuarter} ${bulkPeriodYear}!`);
    }
  };

  // WBS Task creation
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskStart, setTaskStart] = useState('');
  const [taskEnd, setTaskEnd] = useState('');

  const handleAddWbsTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement || !taskTitle.trim()) return;

    const newTask: WbsTask = {
      id: `wbs-${Date.now().toString().slice(-4)}`,
      title: taskTitle,
      assignee: taskAssignee || selectedEngagement.auditorInCharge,
      startDate: taskStart || selectedEngagement.startDate,
      endDate: taskEnd || selectedEngagement.endDate,
      status: 'Not Started',
      workingPapers: []
    };

    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          wbs: [...item.wbs, newTask]
        };
      }
      return item;
    });

    onUpdateEngagements(updatedEngagements);
    setShowAddTaskForm(false);
    setTaskTitle('');
    onLogAction('WBS Task Definition', `Added audit procedure "${taskTitle}" to active WBS for ${selectedEngagement.entityName}`);
  };

  // Promote engagement status triggered by user events
  const handleUpdateWbsStatus = (taskId: string, status: 'Not Started' | 'In Progress' | 'Completed') => {
    if (!selectedEngagement) return;
    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        const revisedWbs = item.wbs.map(w => w.id === taskId ? { ...w, status } : w);
        return { ...item, wbs: revisedWbs };
      }
      return item;
    });
    onUpdateEngagements(updatedEngagements);
  };

  // Submit Audit Program for Approval (Team Leader action)
  const handleAuditProgramSubmit = () => {
    if (!selectedEngagement) return;
    alert("Audit program and procedures outline Submitted to Lead Audit Manager (Tigist Assefa) for program review.");
    onLogAction('Program Review Submission', `Submitted comprehensive task lists for Engagement #${selectedEngagement.id}`);
  };

  // Manager Approves Audit Program -> Generates Engagement Letter
  const handleManagerApproveProgram = () => {
    if (!selectedEngagement) return;
    
    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          status: 'Initiated' as const, // Stays in Initiated planning phase
          engagementLetter: {
            ...item.engagementLetter,
            sentDate: new Date().toISOString().split('T')[0],
            programApproved: true,
            programApprovedBy: activeRole === 'Manager' ? 'Tigist Assefa' : 'Abebe Kebede',
            programApprovalDate: new Date().toISOString().split('T')[0]
          }
        };
      }
      return item;
    });
    onUpdateEngagements(updatedEngagements);
    alert("Audit Program approved by Manager! Formal Engagement sign-off letter has been issued to the Auditee.");
    onLogAction('Audit Program Approval', `Approved fieldwork checklist for Engagement #${selectedEngagement.id}. Generated Letter.`);
  };

  // Auditee signs off and accepts Engagement Letter -> Unlocks Entry Conference
  const [internalContact, setInternalContact] = useState('');
  const handleAuditeeSignLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement || !internalContact.trim()) return;

    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          engagementLetter: {
            ...item.engagementLetter,
            isAccepted: true,
            acceptedBy: activeRole === 'Auditee' ? 'Mekonnen Tadesse' : 'Aster Bekele',
            acceptedDate: new Date().toISOString().split('T')[0],
            contactPerson: internalContact
          }
        };
      }
      return item;
    });

    onUpdateEngagements(updatedEngagements);
    setInternalContact('');
    alert("Engagement letter formally accepted by Auditee! The audit is now ready for the Entry Conference phase.");
    onLogAction('Letter Endorsement', `Auditee signed off engagement letter for Engagement #${selectedEngagement.id}. Selected lead point-of-contact: ${internalContact}`);
  };

  // Team Leader signs off Entry Conference -> Formally transitions to Fieldwork Status!
  const handleCompleteEntryConference = () => {
    if (!selectedEngagement) return;
    const currentEc = getEntryConference(selectedEngagement);

    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          status: 'Fieldwork' as const, // Formally enters fieldwork!
          engagementLetter: {
            ...item.engagementLetter,
            entryConference: {
              ...currentEc,
              completed: true
            }
          }
        };
      }
      return item;
    });

    onUpdateEngagements(updatedEngagements);
    alert("Entry Conference completed & documented! Active fieldwork phase has been unlocked.");
    onLogAction('Entry Conference Completion', `Conducted and closed Entry Conference for Engagement #${selectedEngagement.id}. Transitioned to Fieldwork status.`);
  };

  const handleTransitionToReporting = () => {
    if (!selectedEngagement) return;
    const allCompleted = selectedEngagement.wbs.every(w => w.status === 'Completed');
    if (!allCompleted) {
      alert("All fieldwork WBS procedures must be marked as 'Completed' before proceeding to Draft Reporting.");
      return;
    }
    
    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          status: 'Draft Report' as const
        };
      }
      return item;
    });

    onUpdateEngagements(updatedEngagements);
    alert("Fieldwork completed! Engagement transitioned to Draft Report phase.");
    onLogAction('Reporting Phase Transition', `Fieldwork finalized for Engagement #${selectedEngagement.id}. Started Draft Reporting phase.`);
  };

  const handleCloseEngagement = () => {
    if (!selectedEngagement) return;
    if (selectedEngagement.status !== 'Draft Report') {
      alert("Engagement must be in 'Draft Report' status to be formally closed.");
      return;
    }
    
    const updatedEngagements = engagements.map(item => {
      if (item.id === selectedEngagement.id) {
        return {
          ...item,
          status: 'Completed' as const
        };
      }
      return item;
    });

    onUpdateEngagements(updatedEngagements);
    alert("Engagement formally Closed! All reporting and review activities are finalized.");
    onLogAction('Engagement Closure', `Formally closed and finalized Engagement #${selectedEngagement.id}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-700 font-sans" id="engagement_root_container">
      
      {/* Tab Switcher at the top */}
      <div className="flex border-b border-slate-200 gap-6 text-sm bg-white p-3 px-6 rounded-xl shadow-2xs" id="engagement_subtabs_panel">
        <button 
          onClick={() => setActiveSubTab('tracker')}
          className={`pb-2 font-bold cursor-pointer transition-all border-b-2 text-xs uppercase tracking-wider relative ${
            activeSubTab === 'tracker' 
              ? 'border-indigo-600 text-indigo-700' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          id="tab_trigger_tracker"
        >
          Engagements Tracker & Procedures
        </button>
        <button 
          onClick={() => setActiveSubTab('hierarchy')}
          className={`pb-2 font-bold cursor-pointer transition-all border-b-2 text-xs uppercase tracking-wider relative ${
            activeSubTab === 'hierarchy' 
              ? 'border-indigo-600 text-indigo-700' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          id="tab_trigger_hierarchy"
        >
          Audit Department Directory & Teams
        </button>
      </div>

      {activeSubTab === 'tracker' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-700" id="engagement_main_grid">
      
      {/* Left Column: Active Engagement Cards */}
      <div className="lg:col-span-4 space-y-4" id="engagement_left_pane">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Engagements</h3>
            <p className="text-[11px] text-slate-400 font-medium">Entities moved into active testing.</p>
          </div>
          {(activeRole === 'Manager' || activeRole === 'Admin') && (
            <button
              onClick={() => {
                if (approvedPlans.length > 0) {
                  setCreationMode('plan');
                  setPlanToConvertId(approvedPlans[0].id);
                } else if (universe.length > 0) {
                  setCreationMode('universe');
                  setSelectedUniverseEntityId(universe[0].id);
                  setCustomTitle(`${universe[0].name} Controls Engagement`);
                } else {
                  setCreationMode('custom');
                  setCustomEntityName('');
                  setCustomTitle('');
                }
                setShowCreateForm(true);
              }}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase font-bold px-3 py-2 rounded-lg cursor-pointer transition-all shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Scope
            </button>
          )}
        </div>

        {/* Engagement List Items */}
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1" id="engagement_items_list">
          {engagements.map(e => (
            <div
              key={e.id}
              onClick={() => setSelectedEngagementId(e.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedEngagementId === e.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-805 border-slate-200 hover:border-slate-400'
              }`}
              id={`eng_card_${e.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-mono tracking-widest font-bold uppercase px-2 py-0.5 rounded leading-none ${
                  selectedEngagementId === e.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                }`}>
                  {e.id}
                </span>
                
                {/* Status Badge */}
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                  e.status === 'Initiated' ? 'bg-amber-100 text-amber-800' :
                  e.status === 'Fieldwork' ? 'bg-emerald-100 text-emerald-800 font-bold' :
                  'bg-slate-150 text-slate-700'
                }`} id={`card_status_${e.id}`}>
                  {e.status}
                </span>
              </div>

              <h4 className="text-xs font-bold leading-tight line-clamp-2">{e.title}</h4>
              <p className={`text-[10px] mt-2 block font-medium ${selectedEngagementId === e.id ? 'text-slate-350' : 'text-slate-500'}`}>
                Scope Unit: <strong className={selectedEngagementId === e.id ? 'text-white' : 'text-slate-900 font-bold'}>{e.entityName}</strong>
              </p>
              {e.assignedSubTeam && (
                <p className={`text-[10px] mt-1 block font-mono ${selectedEngagementId === e.id ? 'text-indigo-200' : 'text-indigo-600 font-bold'}`}>
                  Assigned Sub-team: <span className="underline">{e.assignedSubTeam}</span>
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-semibold">
                <Users className="w-3 h-3 shrink-0 text-indigo-600" />
                <span className="truncate">Lead: {e.auditorInCharge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Approved Plan Conversion Requisites Info */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-500 space-y-1.5 font-medium leading-relaxed">
          <span className="font-bold text-slate-750 block">Scope Eligibility Details</span>
          <p>Only Approved Annual Plan Items can be promoted to active Fieldwork. Currently, there are <strong className="text-slate-900 font-bold">{approvedPlans.length} items</strong> approved by the board awaiting fieldwork initiation.</p>
        </div>
      </div>

      {/* Right Column: Active Information Panel (WBS & Letter detailed work) */}
      <div className="lg:col-span-8 flex flex-col space-y-5" id="engagement_right_pane">
        {selectedEngagement ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6" id="engagement_details_card">
            
            {/* Header Title details */}
            <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-bold">
                  Active Engagement Details
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2 leading-tight">{selectedEngagement.title}</h2>
                <span className="text-xs mt-1 text-slate-500 block font-semibold">Unit Owner: <strong className="text-slate-805 font-bold">{selectedEngagement.entityName}</strong> | Period: {selectedEngagement.startDate} to {selectedEngagement.endDate}</span>
                {selectedEngagement.assignedSubTeam && (
                  <span className="text-xs text-indigo-700 font-mono bg-indigo-50/75 p-1 px-2.5 rounded-lg border border-indigo-100/50 mt-2 inline-block">
                    Mapped Department Hierarchy: <strong className="font-semibold">{selectedEngagement.assignedSection}</strong> &rarr; <strong>{selectedEngagement.assignedSubTeam}</strong>
                  </span>
                )}
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2 text-xs min-w-44">
                <Users className="w-4 h-4 text-indigo-600 font-bold" />
                <div className="text-[11px] text-slate-655 font-medium">
                  <span className="block font-bold text-slate-900">Audit Workteam:</span>
                  <span className="block font-mono text-slate-500 font-bold">{selectedEngagement.teamMembers.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Elegant horizontal phase stepper tabs */}
            <div className="border-b border-slate-100 pb-3 flex flex-wrap gap-2 md:gap-4 select-none" id="lifecycle_stepper_tabs">
              {[
                { id: 'planning', label: '1. Team & Schedule', icon: Users, desc: 'Setup team roles & schedules' },
                { id: 'program', label: '2. Audit Program', icon: Clipboard, desc: 'Objectives, scope, methodology' },
                { id: 'review', label: '3. Review & Letter', icon: CheckCircle, desc: 'Sign-off & engagement letter' },
                { id: 'entry', label: '4. Entry Conference', icon: Send, desc: 'Minutes & legal checklists' },
                { id: 'fieldwork', label: '5. Fieldwork (WBS)', icon: Briefcase, desc: 'Execute active procedures' },
                { id: 'closure', label: '6. Closure', icon: FileCheck, desc: 'Wrap-up & sign-off' }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activePhaseTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePhaseTab(tab.id as any)}
                    className={`flex-1 min-w-[140px] text-left p-3 rounded-lg cursor-pointer transition-all border ${
                      isSelected 
                        ? 'border-indigo-200 bg-indigo-50/40 text-indigo-800 shadow-2xs' 
                        : 'border-slate-100 hover:border-slate-350 bg-slate-50/50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-extrabold leading-none">{tab.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-snug font-medium">{tab.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* PHASE 1: TEAM & SCHEDULE PLANNING */}
            {activePhaseTab === 'planning' && (
              <div className="space-y-6 animate-fade-in" id="phase_panel_planning">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Audit Team Role Allocation
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Assign specific professional designations to each mapped resource for Engagement #{selectedEngagement.id} based on ISACA role matrices.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {selectedEngagement.teamMembers.map(member => {
                      const roles = getTeamRoles(selectedEngagement);
                      const currentRole = roles[member] || 'Field Auditor';
                      
                      return (
                        <div key={member} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-3xs">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block">{member}</span>
                            <span className="text-[10px] text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md font-semibold inline-block">
                              {currentRole}
                            </span>
                          </div>
                          <div>
                            <select
                              value={currentRole}
                              onChange={e => handleUpdateTeamRole(member, e.target.value as any)}
                              disabled={activeRole !== 'Manager' && activeRole !== 'Admin'}
                              className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-250 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer shadow-3xs"
                            >
                              <option value="Engagement Manager">Engagement Manager</option>
                              <option value="Team Leader">Team Leader</option>
                              <option value="Field Auditor">Field Auditor</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Target Lifecycle Milestones & Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Establish start and end date estimates for each key stage of the audit lifecycle. These timeline gates will be validated during program sign-offs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {[
                      { key: 'planning', label: '1. Planning Stage' },
                      { key: 'fieldwork', label: '2. Fieldwork Execution' },
                      { key: 'reporting', label: '3. Draft Reporting' },
                      { key: 'closure', label: '4. Closure / Follow-up' }
                    ].map(stage => {
                      const timeline = getTimeline(selectedEngagement);
                      const startVal = timeline[`${stage.key}Start`] || selectedEngagement.startDate;
                      const endVal = timeline[`${stage.key}End`] || selectedEngagement.endDate;

                      return (
                        <div key={stage.key} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
                          <span className="text-[10px] font-bold text-slate-700 block uppercase leading-none">{stage.label}</span>
                          <div className="space-y-1.5">
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block uppercase">Start</label>
                              <input
                                type="date"
                                value={startVal}
                                onChange={e => handleUpdateTimeline(`${stage.key}Start`, e.target.value)}
                                disabled={activeRole !== 'Team Leader' && activeRole !== 'Manager' && activeRole !== 'Admin'}
                                className="w-full bg-white border border-slate-200 text-xs px-2 py-1 rounded shadow-3xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block uppercase">End</label>
                              <input
                                type="date"
                                value={endVal}
                                onChange={e => handleUpdateTimeline(`${stage.key}End`, e.target.value)}
                                disabled={activeRole !== 'Team Leader' && activeRole !== 'Manager' && activeRole !== 'Admin'}
                                className="w-full bg-white border border-slate-200 text-xs px-2 py-1 rounded shadow-3xs font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhaseTab('program');
                      alert("Planning timeline and roles configured! Let's proceed to define the Audit Program objectives.");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    Proceed to Audit Program &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* PHASE 2: AUDIT PROGRAM DEFINITION */}
            {activePhaseTab === 'program' && (
              <div className="space-y-6 animate-fade-in" id="phase_panel_program">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clipboard className="w-4 h-4 text-indigo-600" />
                        Audit Program Attributes Formulation
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        Document the background context, goals, restrictions, and general techniques applied to verify auditable items.
                      </p>
                    </div>
                    
                    {(activeRole === 'Team Leader' || activeRole === 'Manager' || activeRole === 'Admin') && (
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateProgramDetails({
                            introduction: editIntro,
                            objectives: editObjectives,
                            scope: editScope,
                            methodology: editMethodology
                          });
                          alert("Audit program text attributes successfully updated and serialized to database.");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-3xs"
                      >
                        Save Program Fields
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-semibold">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">1. Introduction & Background</label>
                      <textarea
                        rows={4}
                        value={editIntro}
                        onChange={e => setEditIntro(e.target.value)}
                        disabled={activeRole !== 'Team Leader' && activeRole !== 'Manager' && activeRole !== 'Admin'}
                        placeholder="Provide historical context of the audited unit..."
                        className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none font-sans font-medium leading-relaxed resize-none shadow-3xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">2. Audit Objectives</label>
                      <textarea
                        rows={4}
                        value={editObjectives}
                        onChange={e => setEditObjectives(e.target.value)}
                        disabled={activeRole !== 'Team Leader' && activeRole !== 'Manager' && activeRole !== 'Admin'}
                        placeholder="e.g. 1. Verify access permissions. 2. Assess data backup adequacy..."
                        className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none font-sans font-medium leading-relaxed resize-none shadow-3xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">3. Audit Scope</label>
                      <textarea
                        rows={4}
                        value={editScope}
                        onChange={e => setEditScope(e.target.value)}
                        disabled={activeRole !== 'Team Leader' && activeRole !== 'Manager' && activeRole !== 'Admin'}
                        placeholder="Specifies process limits, technical boundaries, and timeline parameters covered..."
                        className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none font-sans font-medium leading-relaxed resize-none shadow-3xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">4. Audit Methodology</label>
                      <textarea
                        rows={4}
                        value={editMethodology}
                        onChange={e => setEditMethodology(e.target.value)}
                        disabled={activeRole !== 'Team Leader' && activeRole !== 'Manager' && activeRole !== 'Admin'}
                        placeholder="Identify specific tools, testing scripts, physical sampling sizes, or walkthrough guidelines..."
                        className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none font-sans font-medium leading-relaxed resize-none shadow-3xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Inline WBS Procedure builder */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clipboard className="w-4 h-4 text-indigo-600" />
                        Program Field Procedures (WBS mapping)
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        Break down the high-level program objectives into step-by-step procedures assigned to auditors.
                      </p>
                    </div>
                    
                    {(activeRole === 'Team Leader' || activeRole === 'Admin') && (
                      <button
                        type="button"
                        onClick={() => setShowAddTaskForm(true)}
                        className="flex items-center gap-1 text-[11px] border border-slate-200 hover:bg-slate-100 font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-3xs bg-white"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Add Procedure
                      </button>
                    )}
                  </div>

                  {showAddTaskForm && (
                    <form onSubmit={handleAddWbsTask} className="p-4 bg-white border border-slate-205 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3" id="add_task_form">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Procedure Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Inspect password security policy rotation configurations logs"
                          value={taskTitle}
                          onChange={e => setTaskTitle(e.target.value)}
                          className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Assigned Auditor</label>
                        <select
                          value={taskAssignee}
                          onChange={e => setTaskAssignee(e.target.value)}
                          className="mt-1 block w-full bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                        >
                          {selectedEngagement.teamMembers.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
                          <input
                            type="date"
                            value={taskStart}
                            onChange={e => setTaskStart(e.target.value)}
                            className="mt-1 block w-full bg-white border border-slate-200 text-xs px-2 py-1 rounded"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">End Date</label>
                          <input
                            type="date"
                            value={taskEnd}
                            onChange={e => setTaskEnd(e.target.value)}
                            className="mt-1 block w-full bg-white border border-slate-200 text-xs px-2 py-1 rounded"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-1.5 pt-1 font-semibold">
                        <button
                          type="button"
                          onClick={() => setShowAddTaskForm(false)}
                          className="bg-white border border-slate-200 text-slate-650 px-3 py-1.5 text-xs rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 text-xs rounded-lg cursor-pointer"
                        >
                          Add to Plan
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedEngagement.wbs.map(task => (
                      <div key={task.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs font-semibold shadow-3xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-800 font-bold block">{task.title}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Assigned: {task.assignee} | Target End: {task.endDate}</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhaseTab('review');
                      alert("Audit program attributes and procedures mapped! Let's review and sign off the program next.");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    Proceed to Review & Sign-off &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* PHASE 3: REVIEW & FINAL APPROVAL */}
            {activePhaseTab === 'review' && (
              <div className="space-y-6 animate-fade-in" id="phase_panel_review">
                
                {/* Manager sign-off checklist */}
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                      Manager Program Approval Checklist
                    </h3>
                    
                    {selectedEngagement.engagementLetter.programApproved ? (
                      <span className="bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Program Formally Approved
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-850 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Manager Review
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    According to internal standards, the audit manager must complete this structural assessment of objectives, methodology, and resources prior to sending the formal engagement letter.
                  </p>

                  <div className="space-y-2.5 bg-white p-4 border border-slate-200 rounded-lg shadow-3xs font-semibold">
                    {[
                      { id: 'c1', label: 'Review of audit objectives and scope for completeness and compliance' },
                      { id: 'c2', label: 'Review of audit methodology, techniques and planned procedures effectiveness' },
                      { id: 'c3', label: 'Review of work breakdown structure and target scheduling milestone gates' },
                      { id: 'c4', label: 'Confirmation of team member roles and workload capacity' },
                      { id: 'c5', label: 'Final official approval of the engagement plan and structured audit program' }
                    ].map((chk, idx) => {
                      const isApproved = !!selectedEngagement.engagementLetter.programApproved;
                      return (
                        <label key={chk.id} className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isApproved}
                            disabled={!isApproved && (activeRole !== 'Manager' && activeRole !== 'Admin')}
                            onChange={() => {
                              if (!isApproved) {
                                handleManagerApproveProgram();
                              }
                            }}
                            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{idx + 1}. {chk.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {!selectedEngagement.engagementLetter.programApproved && (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10px] text-indigo-850 font-bold leading-relaxed flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        {activeRole === 'Manager' || activeRole === 'Admin' 
                          ? "Audit Manager Actions Unlocked: Check any box or click below to issue the cryptographically verified Engagement Letter."
                          : "Audit Manager Actions Locked: Review checklist can only be endorsed by an active Senior Audit Manager (Tigist Assefa)."}
                      </span>
                    </div>
                  )}

                  {!selectedEngagement.engagementLetter.programApproved && (activeRole === 'Manager' || activeRole === 'Admin') && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={handleManagerApproveProgram}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        Sign-off Work Program & Issue Letter
                      </button>
                    </div>
                  )}
                </div>

                {/* Legal Engagement Letter */}
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Legal Engagement Letter Requisition
                    </h3>

                    {selectedEngagement.engagementLetter.isAccepted ? (
                      <span className="bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Signed & Accepted
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-850 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Signature
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Formal legal communication sent to the auditee management outlining background, timeline, objectives and general technical requirements.
                  </p>

                  <div className="p-4 bg-white font-mono text-[11px] text-slate-655 leading-relaxed max-h-[160px] overflow-y-auto border border-slate-205 rounded-lg shadow-inner whitespace-pre-wrap">
                    {selectedEngagement.engagementLetter.body}
                  </div>

                  {selectedEngagement.engagementLetter.programApproved ? (
                    <div>
                      {!selectedEngagement.engagementLetter.isAccepted ? (
                        <div className="border-t border-dashed border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="text-xs text-slate-505 flex gap-1.5 items-center font-bold">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Awaiting auditee sign-off before Entry Conference can be hosted.</span>
                          </div>

                          {activeRole === 'Auditee' ? (
                            <form onSubmit={handleAuditeeSignLetter} className="flex gap-2 w-full sm:w-auto" id="sign_letter_form">
                              <input
                                type="text"
                                required
                                placeholder="Designated Auditee Contact"
                                value={internalContact}
                                onChange={e => setInternalContact(e.target.value)}
                                className="bg-white border border-slate-250 text-xs px-3 py-1.5 rounded-lg w-full sm:w-44 focus:outline-none focus:border-indigo-600 font-semibold shadow-3xs"
                              />
                              <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-white" />
                                Sign & Accept
                              </button>
                            </form>
                          ) : (
                            <div className="text-[10px] italic text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md font-semibold">
                              Switch role to <strong className="text-slate-800">Auditee</strong> to sign and accept.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-50/50 border border-emerald-150 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-bold">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4.5 h-4.5 text-emerald-600" />
                            <span>Designated Point of Contact: <strong className="text-slate-900 font-bold">{selectedEngagement.engagementLetter.contactPerson}</strong></span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">Endorsed: {selectedEngagement.engagementLetter.acceptedDate}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-500 font-bold italic text-center">
                      🔒 Requisition Locked: Engagement letter becomes available for signing once the Audit Program has been formally approved by the Manager above.
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhaseTab('entry');
                    }}
                    disabled={!selectedEngagement.engagementLetter.isAccepted}
                    className={`font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs ${
                      selectedEngagement.engagementLetter.isAccepted 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Entry Conference &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* PHASE 4: ENTRY CONFERENCE */}
            {activePhaseTab === 'entry' && (
              <div className="space-y-6 animate-fade-in" id="phase_panel_entry">
                
                {!selectedEngagement.engagementLetter.isAccepted ? (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">Stage Legally Gated</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      According to internal governance requirements, the official Entry Conference cannot proceed until the Auditee has signed off on the formal Engagement Letter.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePhaseTab('review')}
                        className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg"
                      >
                        View Engagement Letter
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Send className="w-4 h-4 text-indigo-600" />
                          Entry Conference Protocol Details
                        </h3>
                        {getEntryConference(selectedEngagement).completed ? (
                          <span className="bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Minutes Closed & Signed-off
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-850 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Conference In Progress
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Conduct the formal entry conference with auditee management representatives. Tick off the standard conference checkpoints, document the official meeting minutes, and submit to finalize.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">1. Date of Conference</label>
                          <input
                            type="date"
                            value={ecDate}
                            onChange={e => {
                              setEcDate(e.target.value);
                              handleUpdateEntryConference({ date: e.target.value });
                            }}
                            disabled={getEntryConference(selectedEngagement).completed || (activeRole !== 'Team Leader' && activeRole !== 'Admin')}
                            className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg font-semibold shadow-3xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">2. Attendees List (Comma separated)</label>
                          <input
                            type="text"
                            value={ecAttendees}
                            onChange={e => {
                              setEcAttendees(e.target.value);
                              handleUpdateEntryConference({ attendees: e.target.value.split(',').map(s => s.trim()) });
                            }}
                            disabled={getEntryConference(selectedEngagement).completed || (activeRole !== 'Team Leader' && activeRole !== 'Admin')}
                            placeholder="e.g. Yohannes Hailu, Selamawit Demeke, Aster Bekele"
                            className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg font-semibold shadow-3xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mandated Entry Conference Checkpoints Checklist */}
                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-indigo-600" />
                        Mandated Agenda Checkpoint Requirements
                      </h4>

                      <div className="space-y-2 bg-white p-4 border border-slate-200 rounded-lg shadow-3xs font-semibold">
                        {[
                          { id: 'teamIntroduced', label: 'Introduction of the active audit team and qualifications' },
                          { id: 'objectivesConfirmed', label: 'Confirmation of the targeted audit objectives and regulatory context' },
                          { id: 'methodologyDiscussed', label: 'Discussion of the specific audit methodology, sample testing and tools' },
                          { id: 'timelineConfirmed', label: 'Confirmation of timeline expectations and key intermediate milestones' },
                          { id: 'infoRequirementsExplained', label: 'Explanation of technical documentation, server logs, and evidence requirements' },
                          { id: 'rolesClarified', label: 'Clarification of specific auditor/auditee operational roles and SLA deadlines' },
                          { id: 'communicationAgreed', label: 'Agreement on communication rules, escalation paths, and reporting formats' }
                        ].map((chk) => {
                          const ec = getEntryConference(selectedEngagement);
                          const isChecked = !!(ec.checklists && (ec.checklists as any)[chk.id]);
                          const isEcCompleted = ec.completed;

                          return (
                            <label key={chk.id} className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isEcCompleted || (activeRole !== 'Team Leader' && activeRole !== 'Admin')}
                                onChange={e => {
                                  const lists = { ...ec.checklists, [chk.id]: e.target.checked };
                                  handleUpdateEntryConference({ checklists: lists });
                                }}
                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{chk.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Meeting Minutes */}
                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        Formal Conference Minutes & Document Upload
                      </h4>

                      <div className="space-y-3 font-semibold">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Entry Conference Minutes Summary</label>
                          <textarea
                            rows={4}
                            value={ecMinutes}
                            onChange={e => {
                              setEcMinutes(e.target.value);
                              handleUpdateEntryConference({ minutes: e.target.value });
                            }}
                            disabled={getEntryConference(selectedEngagement).completed || (activeRole !== 'Team Leader' && activeRole !== 'Admin')}
                            placeholder="Enter the official meeting minutes summary..."
                            className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none font-sans font-medium leading-relaxed resize-none shadow-3xs"
                          />
                        </div>

                        {/* File Upload Simulation */}
                        <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-white text-center">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <span className="text-xs font-bold text-slate-700 block">Signed Meeting Minutes Attachment</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">PDF or Word files accepted up to 10MB</span>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (getEntryConference(selectedEngagement).completed) return;
                                handleUpdateEntryConference({
                                  minutesFile: {
                                    name: 'Signed_Entry_Conference_Minutes.pdf',
                                    size: '1.4 MB',
                                    date: new Date().toISOString().split('T')[0]
                                  }
                                });
                                alert("Simulated Entry Conference minutes PDF uploaded successfully!");
                              }}
                              disabled={getEntryConference(selectedEngagement).completed}
                              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-150 transition-colors"
                            >
                              {getEntryConference(selectedEngagement).minutesFile 
                                ? `✓ Attached: ${getEntryConference(selectedEngagement).minutesFile?.name} (${getEntryConference(selectedEngagement).minutesFile?.size})`
                                : 'Upload Signed Document'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Launch Fieldwork trigger buttons */}
                      {!getEntryConference(selectedEngagement).completed && (activeRole === 'Team Leader' || activeRole === 'Admin') && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleCompleteEntryConference}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                          >
                            Sign-off Minutes & Unlock Fieldwork
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PHASE 5: FIELDWORK EXECUTION */}
            {activePhaseTab === 'fieldwork' && (
              <div className="space-y-6 animate-fade-in" id="phase_panel_fieldwork">
                
                {selectedEngagement.status === 'Initiated' && !getEntryConference(selectedEngagement).completed ? (
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">Fieldwork Gated</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      According to internal standards, active testing cannot be executed on this engagement until the formal Entry Conference minutes are fully signed-off.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePhaseTab('entry')}
                        className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg"
                      >
                        View Entry Conference
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Progress tracking indicator */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800 uppercase tracking-wider">Fieldwork Progress Overview</span>
                        <span className="font-mono text-indigo-700">
                          {Math.round((selectedEngagement.wbs.filter(w => w.status === 'Completed').length / (selectedEngagement.wbs.length || 1)) * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${(selectedEngagement.wbs.filter(w => w.status === 'Completed').length / (selectedEngagement.wbs.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4" id="wbs_controls_block">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                          <Clipboard className="w-4 h-4 text-indigo-600" />
                          Audit Program & Field procedures (WBS)
                        </h4>
                        {(activeRole === 'Team Leader' || activeRole === 'Admin') && (
                          <button
                            type="button"
                            onClick={() => setShowAddTaskForm(true)}
                            className="flex items-center gap-1 text-xs border border-slate-200 hover:bg-slate-50 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-2xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-indigo-650" />
                            Add Audit Procedure
                          </button>
                        )}
                      </div>

                      {/* Add Task Sub-Box Form */}
                      {showAddTaskForm && (
                        <form onSubmit={handleAddWbsTask} className="p-4 bg-slate-50 border border-slate-205 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3" id="add_task_form">
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Procedure Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Inspect password rotation rules configurations logs"
                              value={taskTitle}
                              onChange={e => setTaskTitle(e.target.value)}
                              className="mt-1 block w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Assigned Auditor</label>
                            <select
                              value={taskAssignee}
                              onChange={e => setTaskAssignee(e.target.value)}
                              className="mt-1 block w-full bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                            >
                              {selectedEngagement.teamMembers.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <div className="w-1/2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Start</label>
                              <input
                                type="date"
                                value={taskStart}
                                onChange={e => setTaskStart(e.target.value)}
                                className="mt-1 block w-full bg-white border border-slate-200 text-xs px-2 py-1 rounded"
                              />
                            </div>
                            <div className="w-1/2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Target End</label>
                              <input
                                type="date"
                                value={taskEnd}
                                onChange={e => setTaskEnd(e.target.value)}
                                className="mt-1 block w-full bg-white border border-slate-200 text-xs px-2 py-1 rounded"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2 flex justify-end gap-1.5 pt-1 font-semibold">
                            <button
                              type="button"
                              onClick={() => setShowAddTaskForm(false)}
                              className="bg-white border border-slate-200 text-slate-650 px-3 py-1.5 text-xs rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 text-xs rounded-lg cursor-pointer"
                            >
                              Add to Plan
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Tasks List */}
                      <div className="space-y-3" id="wbs_tasks_items">
                        {selectedEngagement.wbs.map(task => (
                          <div key={task.id} className="p-4 bg-white border border-slate-200 hover:border-slate-350 transition-colors rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs" id={`wbs_row_${task.id}`}>
                            <div className="space-y-1 md:w-3/5">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-slate-50 border border-slate-150 font-mono text-slate-500 p-1 px-1.5 rounded-md leading-none font-bold">
                                  {task.id}
                                </span>
                                <h5 className="text-xs font-bold text-slate-905 leading-snug">{task.title}</h5>
                              </div>
                              <div className="flex gap-3 text-[10px] text-slate-500 font-medium">
                                <span>Assigned: <strong className="text-slate-650 font-semibold">{task.assignee}</strong></span>
                                <span>•</span>
                                <span>Deadline: <strong className="text-slate-650 font-mono font-bold">{task.endDate}</strong></span>
                                <span>•</span>
                                <span>Papers: <strong className="text-slate-805 font-bold">{task.workingPapers.length} uploaded</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 justify-end shrink-0" id={`wbs_task_ops_${task.id}`}>
                              {/* Active Status dropdown */}
                              {activeRole === 'Auditor' || activeRole === 'Team Leader' || activeRole === 'Admin' ? (
                                <select
                                  value={task.status}
                                  onChange={e => handleUpdateWbsStatus(task.id, e.target.value as any)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md border leading-none font-mono cursor-pointer ${
                                    task.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    task.status === 'In Progress' ? 'bg-amber-50 text-amber-850 border-amber-200 animate-pulse' :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              ) : (
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border leading-none font-mono ${
                                  task.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                                  task.status === 'In Progress' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {task.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedEngagement.status === 'Fieldwork' && (
                  <div className="pt-6 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={handleTransitionToReporting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <FileCheck className="w-4 h-4" />
                      Finalize Fieldwork & Transition to Reporting
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PHASE 6: CLOSURE / WRAP-UP */}
            {activePhaseTab === 'closure' && (
              <div className="space-y-6 animate-fade-in" id="phase_panel_closure">
                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200">
                  <div className="text-center space-y-4 max-w-lg mx-auto py-8">
                    {selectedEngagement.status === 'Completed' ? (
                      <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Engagement Closed</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          This engagement has been formally completed and closed. The final audit report has been issued and management action plans (if any) are being tracked in the Follow-up module.
                        </p>
                      </>
                    ) : selectedEngagement.status === 'Draft Report' ? (
                      <>
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileText className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Draft Reporting & Wrap-Up</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                          Fieldwork has been finalized. Please ensure the final audit report is drafted, reviewed, and issued to the auditee before formally closing this engagement.
                        </p>
                        
                        {(activeRole === 'Manager' || activeRole === 'Admin') ? (
                          <div className="pt-4 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={handleCloseEngagement}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 mx-auto"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Formally Close Engagement
                            </button>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-slate-200 text-amber-700 text-xs font-bold bg-amber-50 rounded-lg p-3">
                            Only the Audit Manager can formally close the engagement.
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Engagement In Progress</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          This engagement must complete the Fieldwork phase and transition to Draft Reporting before it can be formally closed.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 bg-white border border-zinc-200 rounded-xl max-w-full text-center min-h-[400px]" id="engagement_empty_card">
            <AlertCircle className="w-12 h-12 text-zinc-300 mb-4" />
            <h3 className="text-zinc-600 font-semibold text-sm">No Active Engagements Found</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">Run active conversions from the Chief Work Plan list or switch roles to initiate fieldwork programs.</p>
          </div>
        )}
      </div>
    </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-800" id="hierarchy_main_panel">
          
          {/* Left Column: Organization Hierarchy Selector & Explorer */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 font-sans" id="hierarchy_left_pane">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-905">Audit Department Directory</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Interactive overview of the divisions, dedicated teams, and operational fieldwork sub-teams.</p>
              </div>
            </div>

            {/* Admin Management Controls */}
            <div className="flex flex-wrap gap-2 pt-1 border-y border-slate-100 py-3">
              <button
                onClick={handleClearAllDirectory}
                className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200/50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                id="clear_directory_btn"
                title="Completely empty the directory"
              >
                <Trash2 className="w-3 h-3" />
                Clear Directory
              </button>

              <button
                onClick={handleResetToDefaultDirectory}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                id="reset_directory_btn"
                title="Restore default pre-seeded sections & teams"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>

              {(activeRole === 'Manager' || activeRole === 'Admin') && (
                <button
                  onClick={() => setShowAddSectionModal(!showAddSectionModal)}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ml-auto"
                  id="add_section_toggle"
                >
                  <PlusCircle className="w-3 h-3" />
                  Add Division
                </button>
              )}
            </div>

            {/* Add Section Form Block */}
            {showAddSectionModal && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs animate-fade-in animate-duration-200" id="add_section_form_block">
                <h4 className="font-bold text-slate-800">Add New Division Section</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Division Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Financial & Operational Audit Division"
                      value={newSectionName}
                      onChange={e => setNewSectionName(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Division Chief / Lead</label>
                    <input
                      type="text"
                      placeholder="e.g. Tigist Assefa (Senior Audit Director)"
                      value={newSectionLead}
                      onChange={e => setNewSectionLead(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSectionModal(false);
                        setNewSectionName('');
                        setNewSectionLead('');
                      }}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 font-semibold rounded text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSectionName) {
                          alert("Section name is required");
                          return;
                        }
                        handleAddSection(newSectionName, newSectionLead);
                        setShowAddSectionModal(false);
                        setNewSectionName('');
                        setNewSectionLead('');
                      }}
                      className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded text-[11px]"
                    >
                      Save Division
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Team Form Block */}
            {showAddTeamModal && targetSectionForTeam && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs animate-fade-in animate-duration-200" id="add_team_form_block">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">Add Team to <span className="text-indigo-600">{targetSectionForTeam}</span></h4>
                  <button onClick={() => { setShowAddTeamModal(false); setTargetSectionForTeam(''); }} className="text-slate-400 hover:text-slate-650 font-bold text-base">×</button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Team Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HQ Operations Audit Team"
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Team Lead Representative</label>
                    <input
                      type="text"
                      placeholder="e.g. Yohannes Hailu"
                      value={newTeamLead}
                      onChange={e => setNewTeamLead(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTeamModal(false);
                        setTargetSectionForTeam('');
                        setNewTeamName('');
                        setNewTeamLead('');
                      }}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 font-semibold rounded text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newTeamName) {
                          alert("Team name is required");
                          return;
                        }
                        handleAddTeam(targetSectionForTeam, newTeamName, newTeamLead);
                        setShowAddTeamModal(false);
                        setTargetSectionForTeam('');
                        setNewTeamName('');
                        setNewTeamLead('');
                      }}
                      className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded text-[11px]"
                    >
                      Save Team
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Sub-Team Form Block */}
            {showAddSubTeamModal && targetSectionForSubTeam && targetTeamForSubTeam && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs animate-fade-in animate-duration-200" id="add_subteam_form_block">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">Add Sub-Team to <span className="text-indigo-600">{targetTeamForSubTeam}</span></h4>
                  <button onClick={() => { setShowAddSubTeamModal(false); setTargetSectionForSubTeam(''); setTargetTeamForSubTeam(''); }} className="text-slate-400 hover:text-slate-650 font-bold text-base">×</button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sub-Team Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Treasury & FX Sub-team"
                      value={newSubTeamName}
                      onChange={e => setNewSubTeamName(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sub-Team Lead Representative</label>
                    <input
                      type="text"
                      placeholder="e.g. Selamawit Demeke"
                      value={newSubTeamLead}
                      onChange={e => setNewSubTeamLead(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Focus Area Description</label>
                    <textarea
                      placeholder="e.g. Focuses on investment allocations review, limits compliance, etc."
                      value={newSubTeamFocus}
                      onChange={e => setNewSubTeamFocus(e.target.value)}
                      rows={2}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Auditor Members (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Yohannes Hailu, Selamawit Demeke"
                      value={newSubTeamMembers}
                      onChange={e => setNewSubTeamMembers(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSubTeamModal(false);
                        setTargetSectionForSubTeam('');
                        setTargetTeamForSubTeam('');
                        setNewSubTeamName('');
                        setNewSubTeamLead('');
                        setNewSubTeamFocus('');
                        setNewSubTeamMembers('');
                      }}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 font-semibold rounded text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSubTeamName) {
                          alert("Sub-team name is required");
                          return;
                        }
                        const membersArr = newSubTeamMembers
                          .split(',')
                          .map(m => m.trim())
                          .filter(m => m.length > 0);
                        handleAddSubTeam(
                          targetSectionForSubTeam,
                          targetTeamForSubTeam,
                          newSubTeamName,
                          newSubTeamLead,
                          newSubTeamFocus,
                          membersArr
                        );
                        setShowAddSubTeamModal(false);
                        setTargetSectionForSubTeam('');
                        setTargetTeamForSubTeam('');
                        setNewSubTeamName('');
                        setNewSubTeamLead('');
                        setNewSubTeamFocus('');
                        setNewSubTeamMembers('');
                      }}
                      className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded text-[11px]"
                    >
                      Save Sub-Team
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Directory Section List */}
            {departmentStructure.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50 space-y-3" id="directory_empty_state">
                <Users className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-xs text-slate-550 font-bold leading-relaxed">
                  No divisions, teams, or sub-teams have been registered.
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Populate the structure using "Reset Defaults" or add your custom organizational chart divisions.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={handleResetToDefaultDirectory}
                    className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    Reset Defaults
                  </button>
                  {(activeRole === 'Manager' || activeRole === 'Admin') && (
                    <button
                      onClick={() => setShowAddSectionModal(true)}
                      className="text-[11px] font-bold text-slate-705 bg-white border border-slate-205 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Add Division
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-2" id="hierarchy_sections_list">
                {departmentStructure.map(section => {
                  const isSecExpanded = expandedSections[section.name];
                  return (
                    <div key={section.name} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/20" id={`sec_card_${section.name.replace(/\s+/g, '_')}`}>
                      {/* Section Row */}
                      <div 
                        className="flex items-center justify-between p-3.5 bg-slate-100/65 border-b border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="space-y-0.5 flex-1" onClick={() => toggleSection(section.name)}>
                          <span className="text-[9px] uppercase font-bold text-indigo-600 block tracking-wider font-mono">Division Section</span>
                          <h4 className="text-xs font-bold text-slate-900">{section.name}</h4>
                          <span className="text-[9px] text-slate-500 block font-semibold leading-none mt-1">Head: {section.lead.split(' (')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(activeRole === 'Manager' || activeRole === 'Admin') && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTargetSectionForTeam(section.name);
                                  setShowAddTeamModal(true);
                                }}
                                className="p-1 px-1.5 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200/45 transition-all cursor-pointer"
                                title="Add Team to this Section"
                              >
                                + Team
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.name);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <div onClick={() => toggleSection(section.name)} className="p-1">
                            {isSecExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </div>
                        </div>
                      </div>

                      {/* Section Body */}
                      {isSecExpanded && (
                        <div className="p-3 bg-white space-y-3" id={`sec_body_${section.name.replace(/\s+/g, '_')}`}>
                          {section.teams && section.teams.length > 0 ? (
                            section.teams.map(team => {
                              const isTeamExpanded = expandedTeams[team.name];
                              return (
                                <div key={team.name} className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50/10">
                                  {/* Team Row */}
                                  <div 
                                    className="flex items-center justify-between p-2.5 bg-slate-50 border-b border-slate-200/50 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                                  >
                                    <div className="space-y-0.5 flex-1" onClick={() => toggleTeam(team.name)}>
                                      <span className="text-[8px] uppercase font-mono tracking-wider text-emerald-600 font-bold block">Assigned Team</span>
                                      <h5 className="text-[11px] font-bold text-slate-805 leading-tight">{team.name}</h5>
                                      <span className="text-[9px] text-slate-500 font-semibold leading-none mt-1 block font-sans">Lead: {team.lead}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {(activeRole === 'Manager' || activeRole === 'Admin') && (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setTargetSectionForSubTeam(section.name);
                                              setTargetTeamForSubTeam(team.name);
                                              setShowAddSubTeamModal(true);
                                            }}
                                            className="p-1 px-1.5 text-[8px] font-bold text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200/45 transition-all cursor-pointer"
                                            title="Add Sub-team to this Team"
                                          >
                                            + Sub-team
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTeam(section.name, team.name);
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                            title="Delete Team"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </>
                                      )}
                                      <div onClick={() => toggleTeam(team.name)} className="p-1">
                                        {isTeamExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Team Body: Sub-teams */}
                                  {isTeamExpanded && (
                                    <div className="p-2 space-y-1.5 bg-white">
                                      {team.subTeams && team.subTeams.length > 0 ? (
                                        team.subTeams.map(subTeam => {
                                          const subTeamEngs = engagements.filter(e => e.assignedSubTeam === subTeam.name);
                                          const isSelected = selectedHierarchySubTeam?.name === subTeam.name;
                                          return (
                                            <div
                                              key={subTeam.name}
                                              onClick={() => setSelectedHierarchySubTeam(subTeam)}
                                              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                                                isSelected
                                                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-semibold'
                                                  : 'bg-white border-slate-100 hover:border-slate-305 text-slate-705 font-medium'
                                              }`}
                                              id={`subteam_item_${subTeam.name.replace(/\s+/g, '_')}`}
                                            >
                                              <div className="space-y-0.5 max-w-[65%]">
                                                <span className="text-[8px] uppercase font-bold tracking-widest text-slate-400 block">Sub-team</span>
                                                <h6 className="text-[11px] font-bold leading-tight truncate">{subTeam.name}</h6>
                                                <span className={`text-[9px] block font-semibold ${isSelected ? 'text-slate-350' : 'text-slate-450'}`}>Leader: {subTeam.lead}</span>
                                              </div>

                                              <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                                                  subTeamEngs.length > 0 
                                                    ? 'bg-indigo-50 text-indigo-850 font-extrabold border border-indigo-150/40'
                                                    : isSelected ? 'bg-slate-800 text-slate-300 font-semibold' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                  {subTeamEngs.length === 1 ? '1 Eng' : `${subTeamEngs.length} Engs`}
                                                </span>
                                                {(activeRole === 'Manager' || activeRole === 'Admin') && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteSubTeam(section.name, team.name, subTeam.name);
                                                    }}
                                                    className={`p-1 rounded cursor-pointer ${isSelected ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-red-500 hover:bg-red-50'}`}
                                                    title="Delete Sub-team"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="p-3 text-center text-[10px] text-slate-400 font-semibold italic">
                                          No fieldwork sub-teams registered.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-center text-xs text-slate-400 font-semibold italic">
                              No teams registered in this section yet.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Sub-team Workspace View and Active Assignments */}
          <div className="lg:col-span-7 flex flex-col space-y-5 animate-fade-in" id="hierarchy_right_pane">
            {selectedHierarchySubTeam ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6" id="sub_team_workspace_card">
                
                {/* Header */}
                <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono uppercase bg-indigo-50 text-indigo-705 px-2.5 py-0.5 rounded font-bold tracking-wider">
                      Operational Workspace
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 mt-2 leading-tight">{selectedHierarchySubTeam.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">
                      Fieldwork Assignment & Technical Focus mapping within the Audit Office.
                    </p>
                  </div>
                </div>

                {/* Focus Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200" id="sub_team_focus_block">
                  <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1 font-mono mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 font-mono" />
                    Mandated Scope Focus & Authority
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-605 font-semibold">
                    {selectedHierarchySubTeam.focus}
                  </p>
                </div>

                {/* Members Strength */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="sub_team_leaders_members">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Sub-Team Lead Representative</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-55 text-indigo-700 border border-indigo-150 flex items-center justify-center font-bold text-xs uppercase font-mono">
                        {selectedHierarchySubTeam.lead ? selectedHierarchySubTeam.lead.split(' ').map(n => n[0]).join('') : ''}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{selectedHierarchySubTeam.lead}</span>
                        <span className="text-[10px] text-slate-505 block font-semibold">AIC / Lead Field Auditor</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">Active Auditors Strength ({selectedHierarchySubTeam.members.length})</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedHierarchySubTeam.members.map(member => (
                        <div key={member} className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 px-2.5 rounded-lg text-xs font-medium text-slate-705">
                          <div className="w-4 h-4 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-[8px] font-bold font-mono shrink-0">
                            {member.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="truncate max-w-[110px]">{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Linked Engagements */}
                <div className="space-y-3" id="sub_team_engagements_section">
                  <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                    Assigned Audit Engagements ({engagements.filter(e => e.assignedSubTeam === selectedHierarchySubTeam.name).length})
                  </h4>
                  
                  <div className="space-y-2.5 text-xs font-medium" id="sub_team_engagements_list">
                    {engagements.filter(e => e.assignedSubTeam === selectedHierarchySubTeam.name).length > 0 ? (
                      engagements.filter(e => e.assignedSubTeam === selectedHierarchySubTeam.name).map(eng => (
                        <div key={eng.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:border-slate-400/80 transition-colors shadow-2xs" id={`subteam_eng_card_${eng.id}`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono bg-slate-105 border border-slate-205 text-slate-500 p-0.5 px-1 rounded-sm leading-none font-bold select-none">
                                {eng.id}
                              </span>
                              <span className="font-bold text-slate-905 truncate max-w-72 block md:max-w-md">{eng.title}</span>
                            </div>
                            
                            <div className="flex gap-2.5 text-[10px] text-slate-550 font-semibold">
                              <span>Auditable Unit: <strong className="text-slate-800">{eng.entityName}</strong></span>
                              <span>•</span>
                              <span>Timeline: <strong className="text-slate-605 font-mono">{eng.startDate} to {eng.endDate}</strong></span>
                            </div>
                          </div>

                          <div>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase font-mono shrink-0 ${
                              eng.status === 'Initiated' ? 'bg-amber-100 text-amber-800' :
                              eng.status === 'Fieldwork' ? 'bg-emerald-100 text-emerald-850 font-bold' :
                              'bg-slate-150 text-slate-600'
                            }`}>
                              {eng.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-405 font-semibold italic">
                        No active audit engagements are currently mapped to this sub-team.
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Controller */}
                {(activeRole === 'Manager' || activeRole === 'Admin') && (
                  <div className="border-t border-dashed border-slate-200 pt-5 space-y-3" id="reassign_controller_block">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase">Hierarchy Map Controller</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">Re-route or assign any active engagement across sections directly to this sub-team.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5" id="reassign_tools_row">
                      <select
                        value={reassignEngId}
                        onChange={e => setReassignEngId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl font-semibold text-xs px-3 py-2 flex-1 focus:ring-1 focus:ring-indigo-600 text-slate-800"
                        id="reassign_eng_picker"
                      >
                        <option value="">-- Choose active engagement to assign --</option>
                        {engagements
                          .filter(e => e.assignedSubTeam !== selectedHierarchySubTeam.name)
                          .map(e => (
                            <option key={e.id} value={e.id}>
                              [{e.id}] {e.title} {e.assignedSubTeam ? `(assigned to ${e.assignedSubTeam})` : '(unassigned)'}
                            </option>
                          ))}
                      </select>
                      
                      <button
                        type="button"
                        disabled={!reassignEngId}
                        onClick={() => {
                          const section = departmentStructure.find(s => 
                            s.teams.some(t => t.subTeams.some(sub => sub.name === selectedHierarchySubTeam.name))
                          );
                          const team = section?.teams.find(t => 
                            t.subTeams.some(sub => sub.name === selectedHierarchySubTeam.name)
                          );
                          if (section && team) {
                            handleReassignEngagement(selectedHierarchySubTeam.name, section.name, team.name);
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs px-4 py-2 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        id="execute_assignment_trigger"
                      >
                        Assign to Sub-team
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                <Briefcase className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-slate-800 font-bold text-sm">No Active Sub-team Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Select an operational sub-team from the organization tree on the left, or add new sections and teams to establish the audit directory.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Convert annual plan to active engagement form modally */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="convert_modal">
          <div className="bg-white rounded-xl shadow-lg border border-zinc-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Launch Field Audit Engagement</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Initialize testing and team composition for active fieldwork.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Top Level Choice: Per Audit Object vs Given Period */}
            <div className="flex border-b border-slate-100" id="top_creation_tab_bar">
              <button
                type="button"
                onClick={() => setTopCreationTab('single')}
                className={`flex-1 pb-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  topCreationTab === 'single'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Per Audit Object (Single)
              </button>
              <button
                type="button"
                onClick={() => setTopCreationTab('bulk')}
                className={`flex-1 pb-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  topCreationTab === 'bulk'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Given Period (Bulk)
              </button>
            </div>

            <form onSubmit={handleCreateEngagement} className="space-y-4 text-xs font-semibold" id="convert_form">
              
              {topCreationTab === 'single' ? (
                <div className="space-y-3.5">
                  {/* Creation Mode Tabs */}
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode('plan');
                        if (approvedPlans.length > 0) {
                          setPlanToConvertId(approvedPlans[0].id);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        creationMode === 'plan'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      From Approved Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode('universe');
                        if (universe.length > 0) {
                          setSelectedUniverseEntityId(universe[0].id);
                          setCustomTitle(`${universe[0].name} Controls Engagement`);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        creationMode === 'universe'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      From Audit Universe
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode('custom');
                        setCustomEntityName('');
                        setCustomTitle('');
                      }}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        creationMode === 'custom'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Ad-hoc Custom
                    </button>
                  </div>

                  {/* Dynamic Inputs based on Creation Mode */}
                  {creationMode === 'plan' && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Select Board-Approved Plan</label>
                      {approvedPlans.length > 0 ? (
                        <select
                          value={planToConvertId}
                          onChange={e => setPlanToConvertId(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                        >
                          {approvedPlans.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.entityName} (Approved - Resource Req {p.assignedResources})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="mt-1 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100 font-medium animate-pulse">
                          No unassigned approved items exist in the annual plan. Please choose "From Audit Universe" or "Ad-hoc Custom" above to create an engagement.
                        </p>
                      )}
                    </div>
                  )}

                  {creationMode === 'universe' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">Select Audit Universe Entity</label>
                        <select
                          value={selectedUniverseEntityId}
                          onChange={e => {
                            setSelectedUniverseEntityId(e.target.value);
                            const entity = universe.find(ent => ent.id === e.target.value);
                            if (entity) {
                              setCustomTitle(`${entity.name} Controls Engagement`);
                            }
                          }}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                        >
                          <option value="">-- Choose Audit Universe Entity --</option>
                          {universe.map(entity => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name} ({entity.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">Engagement Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Core Banking System Configuration Review"
                          value={customTitle}
                          onChange={e => setCustomTitle(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {creationMode === 'custom' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">Auditable Entity Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Southwest Regional Office"
                          value={customEntityName}
                          onChange={e => {
                            setCustomEntityName(e.target.value);
                            if (e.target.value) {
                              setCustomTitle(`${e.target.value} General Control Audit`);
                            }
                          }}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">Engagement Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Southwest Regional Office Operations Evaluation"
                          value={customTitle}
                          onChange={e => setCustomTitle(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {/* Period Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Target Period Year</label>
                      <select
                        value={bulkPeriodYear}
                        onChange={e => setBulkPeriodYear(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                      >
                        <option value="2025">2025 Plan Period</option>
                        <option value="2026">2026 Plan Period</option>
                        <option value="2027">2027 Plan Period</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Target Period Quarter</label>
                      <select
                        value={bulkPeriodQuarter}
                        onChange={e => setBulkPeriodQuarter(e.target.value as any)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                      >
                        <option value="Q1">Q1 (First Quarter)</option>
                        <option value="Q2">Q2 (Second Quarter)</option>
                        <option value="Q3">Q3 (Third Quarter)</option>
                        <option value="Q4">Q4 (Fourth Quarter)</option>
                        <option value="Full Year">Full Year (All Quarters)</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Entity Checkbox selection list */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Select Auditable Objects (Entities)</label>
                      <span className="text-[11px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-full">
                        {bulkSelectedEntityIds.length} Objects Selected
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
                      <button
                        type="button"
                        onClick={() => setBulkSelectedEntityIds(universe.map(ent => ent.id))}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
                      >
                        Select All Universe
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkSelectedEntityIds([])}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const approvedEntIdsForPeriod = annualPlan
                            .filter(p => 
                              p.status === 'Approved' && 
                              p.auditYear === bulkPeriodYear && 
                              (bulkPeriodQuarter === 'Full Year' || p.targetQuarter === bulkPeriodQuarter)
                            )
                            .map(p => p.entityId);
                          setBulkSelectedEntityIds(Array.from(new Set(approvedEntIdsForPeriod)));
                        }}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded font-extrabold border border-indigo-100 cursor-pointer transition-all"
                      >
                        Auto-Select Approved Plan ({
                          annualPlan.filter(p => 
                            p.status === 'Approved' && 
                            p.auditYear === bulkPeriodYear && 
                            (bulkPeriodQuarter === 'Full Year' || p.targetQuarter === bulkPeriodQuarter)
                          ).length
                        })
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-2.5 max-h-40 overflow-y-auto space-y-1.5 bg-slate-50/50">
                      {universe.length === 0 ? (
                        <p className="text-zinc-400 text-center py-4 font-medium">No entities registered in the Audit Universe.</p>
                      ) : (
                        universe.map(entity => {
                          const isChecked = bulkSelectedEntityIds.includes(entity.id);
                          const matchedPlan = annualPlan.find(p => p.entityId === entity.id && p.status === 'Approved' && p.auditYear === bulkPeriodYear);
                          
                          return (
                            <label
                              key={entity.id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all text-xs font-semibold border ${
                                isChecked 
                                  ? 'bg-indigo-50/40 border-indigo-200 text-indigo-900 shadow-3xs' 
                                  : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setBulkSelectedEntityIds([...bulkSelectedEntityIds, entity.id]);
                                  } else {
                                    setBulkSelectedEntityIds(bulkSelectedEntityIds.filter(id => id !== entity.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-extrabold block truncate text-slate-900">{entity.name}</span>
                                <span className="text-[10px] text-slate-400 block font-semibold">
                                  Category: {entity.category} {matchedPlan && <span className="text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded ml-2">Plan Approved: {matchedPlan.targetQuarter}</span>}
                                </span>
                              </div>
                              <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                entity.riskLevel === 'High' 
                                  ? 'bg-red-50 text-red-600' 
                                  : entity.riskLevel === 'Medium' 
                                  ? 'bg-amber-50 text-amber-600' 
                                  : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {entity.riskLevel}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Common Team Composition and Department Mapping Fields (shared gracefully) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-150">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase">Auditor-In-Charge (Lead)</label>
                  <select
                    value={auditorInCharge}
                    onChange={e => setAuditorInCharge(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                  >
                    {teamLeaders.map(tl => (
                      <option key={tl.name} value={tl.name}>{tl.name} ({tl.role})</option>
                    ))}
                  </select>
                </div>

                {departmentStructure.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-250 text-amber-800 text-xs rounded-lg font-bold text-center col-span-3 space-y-1">
                    <div>No organizational divisions found in the directory!</div>
                    <div className="text-[10px] font-semibold text-amber-600">Please reset default directory sections or add custom ones in the "Audit Department Directory" tab before initiating a fieldwork engagement.</div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Assigned Audit Section</label>
                      <select
                        value={selectedSectionName}
                        onChange={e => handleSectionChange(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                      >
                        {departmentStructure.map(sec => (
                          <option key={sec.name} value={sec.name}>{sec.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Assigned Audit Team</label>
                      <select
                        value={selectedTeamName}
                        onChange={e => handleTeamChange(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                      >
                        {departmentStructure.find(s => s.name === selectedSectionName)?.teams.map(t => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase">Assigned Fieldwork Sub-Team</label>
                      <select
                        value={selectedSubTeamName}
                        onChange={e => setSelectedSubTeamName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-805 font-semibold"
                      >
                        {departmentStructure.find(s => s.name === selectedSectionName)?.teams.find(t => t.name === selectedTeamName)?.subTeams.map(sub => (
                          <option key={sub.name} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase">Fieldwork Duration Dates</label>
                <div className="flex gap-2 text-zinc-655 font-semibold">
                  <div className="w-1/2">
                    <span className="text-[9px] text-zinc-400">Start Fieldwork</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="mt-0.5 block w-full px-3 py-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-800 font-semibold"
                    />
                  </div>
                  <div className="w-1/2">
                    <span className="text-[9px] text-zinc-400">End Fieldwork</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="mt-0.5 block w-full px-3 py-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100" id="convert_form_actions">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    topCreationTab === 'single'
                      ? (creationMode === 'plan' && approvedPlans.length === 0)
                      : (bulkSelectedEntityIds.length === 0)
                  }
                  className="px-4 py-2 bg-zinc-900 border border-zinc-905 text-white hover:bg-zinc-850 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {topCreationTab === 'single' 
                    ? 'Initiate Engagement' 
                    : `Bulk Initiate Engagements (${bulkSelectedEntityIds.length})`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
