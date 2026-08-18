import React, { useState, useEffect, useMemo } from "react";
import { useAuditContext } from "../context/AuditContext";
import { useAuditContext } from "../context/AuditContext";
import {
  Network,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Users,
  User as UserIcon,
  Briefcase,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Check,
  ArrowRight,
  History,
  Building,
  Search,
  Lock,
  ChevronDown,
  Info,
  Layers,
  Bell
} from 'lucide-react';

import type {
  User,
  Engagement,
  Finding,
  OrganizationalUnit,
  EscalationRecord,
  UserRole
} from '../types';

import {
  initialOrgUnits,
  initialEscalations
} from '../types';

import { apiService } from '../apiService';

export default function OrgStructureView() {
  const { users, setUsers: onUpdateUsers, engagements, setEngagements: onUpdateEngagements, findings, setFindings: onUpdateFindings, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();


  // DB states with local mock fallbacks
  const [orgUnits, setOrgUnits] = useState<OrganizationalUnit[]>(initialOrgUnits);
  const [escalations, setEscalations] = useState<EscalationRecord[]>(initialEscalations);
  const [loading, setLoading] = useState(true);

  // Active sub-tab inside organizational dashboard
  const [subTab, setSubTab] = useState<'registry' | 'assignments' | 'visibility' | 'escalations' | 'findings'>('registry');

  // Search and filter states for registry
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Form states for creating/editing units
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);
  const [unitForm, setUnitForm] = useState<{
    name: string;
    code: string;
    type: OrganizationalUnit['type'];
    parentId: string;
    headId: string;
    positions: string;
    roles: string;
    responsibilities: string;
    employees: string[];
  }>({
    name: '',
    code: '',
    type: 'Team',
    parentId: '',
    headId: '',
    positions: '',
    roles: '',
    responsibilities: '',
    employees: []
  });

  // Escalation flow states
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationForm, setEscalationForm] = useState({
    issueType: 'Unresolved Finding' as EscalationRecord['issueType'],
    title: '',
    description: '',
    sourceUnitId: 'unit-cfad',
    targetUnitId: 'unit-iad',
    escalatedToId: 'usr-1'
  });

  // Decision state for managing an escalation
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationRecord | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Demonstration view states
  const [demoSelectedUser, setDemoSelectedUser] = useState<string>(users[0]?.id || 'usr-1');
  const [assignmentUnitId, setAssignmentUnitId] = useState<string>('unit-hot');
  const [assignmentEngagementId, setAssignmentEngagementId] = useState<string>('');
  const [assignmentLog, setAssignmentLog] = useState<string[]>([]);
  const [visibleItemsFilter, setVisibleItemsFilter] = useState<'engagements' | 'findings'>('engagements');

  // Fetch SQLite organizational records on mount
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setLoading(true);
        const unitsRes = await apiService.getOrgUnits();
        if (unitsRes && unitsRes.length > 0) {
          setOrgUnits(unitsRes);
        }
        const escRes = await apiService.getEscalations();
        if (escRes && escRes.length > 0) {
          setEscalations(escRes);
        }
      } catch (err) {
        console.warn('Failed to load organizational units from SQLite. Using defaults.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgData();
  }, []);

  // Save org units helper
  const handleSaveOrgUnits = async (updatedUnits: OrganizationalUnit[]) => {
    setOrgUnits(updatedUnits);
    try {
      await apiService.saveOrgUnits(updatedUnits);
    } catch (err) {
      console.error('Failed to sync org units to backend:', err);
    }
  };

  // Save escalations helper
  const handleSaveEscalations = async (updatedEsc: EscalationRecord[]) => {
    setEscalations(updatedEsc);
    try {
      await apiService.saveEscalations(updatedEsc);
    } catch (err) {
      console.error('Failed to sync escalations to backend:', err);
    }
  };

  // Helper to resolve unit manager/employees
  const getUnitHeadName = (headId: string) => {
    const user = users.find(u => u.id === headId);
    return user ? `${user.name} (${user.title || user.role})` : 'Unassigned';
  };

  const getParentUnitName = (parentId?: string) => {
    if (!parentId) return 'None (Root Node)';
    const parent = orgUnits.find(u => u.id === parentId);
    return parent ? `${parent.name} [${parent.code}]` : 'Unknown Unit';
  };

  // Handle open create/edit modal
  const handleOpenUnitModal = (unit: OrganizationalUnit | null) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        name: unit.name,
        code: unit.code,
        type: unit.type,
        parentId: unit.parentId || '',
        headId: unit.headId || '',
        positions: (unit.positions || []).join(', '),
        roles: unit.roles || '',
        responsibilities: unit.responsibilities || '',
        employees: unit.employees || []
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        name: '',
        code: '',
        type: 'Team',
        parentId: '',
        headId: '',
        positions: 'Staff, Analyst',
        roles: '',
        responsibilities: '',
        employees: []
      });
    }
    setShowUnitModal(true);
  };

  // Submit Unit Create/Edit
  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name || !unitForm.code) {
      alert('Name and Code are required.');
      return;
    }

    const headUser = users.find(u => u.id === unitForm.headId);

    const newUnit: OrganizationalUnit = {
      id: editingUnit ? editingUnit.id : `unit-${Date.now()}`,
      name: unitForm.name,
      code: unitForm.code,
      type: unitForm.type,
      parentId: unitForm.parentId || undefined,
      headId: unitForm.headId || undefined,
      headName: headUser ? headUser.name : undefined,
      positions: unitForm.positions.split(',').map(p => p.trim()).filter(Boolean),
      roles: unitForm.roles,
      responsibilities: unitForm.responsibilities,
      employees: unitForm.employees
    };

    let nextUnits = [...orgUnits];
    if (editingUnit) {
      nextUnits = nextUnits.map(u => u.id === editingUnit.id ? newUnit : u);
      onLogAction('Org Structure Edit', `Updated organizational unit: ${newUnit.name} [${newUnit.code}]`);
    } else {
      nextUnits.push(newUnit);
      onLogAction('Org Structure Create', `Created new organizational unit: ${newUnit.name} [${newUnit.code}]`);
    }

    handleSaveOrgUnits(nextUnits);
    setShowUnitModal(false);
  };

  // Delete Unit
  const handleDeleteUnit = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? Subordinate nodes will be orphaned.`)) {
      const nextUnits = orgUnits.filter(u => u.id !== id);
      handleSaveOrgUnits(nextUnits);
      onLogAction('Org Structure Delete', `Deleted organizational unit: ${name}`);
    }
  };

  // Hierarchy Tree builder helper (returns elements structured)
  const buildHierarchyTree = (parentId: string | undefined): OrganizationalUnit[] => {
    return orgUnits
      .filter(u => (!parentId && !u.parentId) || u.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Map of unit types to visual colors
  const unitColors: Record<OrganizationalUnit['type'], { bg: string, text: string, border: string }> = {
    'Board of Directors': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Board Committee': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'CEO': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Executive Management': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Directorate/Department': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Division': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Section/Unit': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    'Team': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
  };

  // Demo user lookup
  const selectedSsoUserObject = useMemo(() => {
    return users.find(u => u.id === demoSelectedUser) || users[0];
  }, [demoSelectedUser, users]);

  // Hierarchy Visibility Rule implementation:
  // - Admin, Executive see everything.
  // - Managers and leaders see their own division/unit plus any children units in the parent-child chain.
  // - Auditees only see findings/engagements mapped to their department.
  const isUnitSubordinate = (parentUnitId: string, targetUnitId: string): boolean => {
    if (parentUnitId === targetUnitId) return true;
    const targetUnit = orgUnits.find(u => u.id === targetUnitId);
    if (!targetUnit || !targetUnit.parentId) return false;
    return isUnitSubordinate(parentUnitId, targetUnit.parentId);
  };

  const getAuthorizedUnitsForUser = (user: User): string[] => {
    // Determine which units this user manages or belongs to
    if (user.role === 'Admin' || user.role === 'Executive') {
      return orgUnits.map(u => u.id); // All access
    }

    // Find units where user is the head or assigned employee
    const directUnits = orgUnits.filter(u => u.headId === user.id || (u.employees && u.employees.includes(user.id)) || u.name === user.department);
    if (directUnits.length === 0) {
      // Fallback matching department text string
      const matchedDept = orgUnits.find(u => u.name.toLowerCase().includes(user.department.toLowerCase()));
      if (matchedDept) directUnits.push(matchedDept);
    }

    const authorizedIds: string[] = [];
    for (const dUnit of directUnits) {
      // Add direct unit
      if (!authorizedIds.includes(dUnit.id)) {
        authorizedIds.push(dUnit.id);
      }
      // Add all subordinate child units
      for (const unit of orgUnits) {
        if (isUnitSubordinate(dUnit.id, unit.id)) {
          if (!authorizedIds.includes(unit.id)) {
            authorizedIds.push(unit.id);
          }
        }
      }
    }
    return authorizedIds;
  };

  // Filtered engagements and findings based on chosen user role/hierarchy visibility:
  const demoVisibleEngagements = useMemo(() => {
    if (!selectedSsoUserObject) return [];
    const authUnits = getAuthorizedUnitsForUser(selectedSsoUserObject);
    const authUnitCodes = orgUnits.filter(u => authUnits.includes(u.id)).map(u => u.code);
    const authUnitNames = orgUnits.filter(u => authUnits.includes(u.id)).map(u => u.name);

    return engagements.filter(eng => {
      if (selectedSsoUserObject.role === 'Admin' || selectedSsoUserObject.role === 'Executive') return true;
      // Match by assigned section code, title match, or department string matches
      const sectionMatch = eng.assignedSection && authUnitCodes.includes(eng.assignedSection);
      const nameMatch = authUnitNames.some(name => eng.entityName.toLowerCase().includes(name.toLowerCase()));
      const teamMatch = eng.teamMembers.includes(selectedSsoUserObject.name) || eng.auditorInCharge === selectedSsoUserObject.name;
      return sectionMatch || nameMatch || teamMatch;
    });
  }, [selectedSsoUserObject, engagements, orgUnits]);

  const demoVisibleFindings = useMemo(() => {
    if (!selectedSsoUserObject) return [];
    const authUnits = getAuthorizedUnitsForUser(selectedSsoUserObject);
    const authUnitNames = orgUnits.filter(u => authUnits.includes(u.id)).map(u => u.name);

    return findings.filter(fnd => {
      if (selectedSsoUserObject.role === 'Admin' || selectedSsoUserObject.role === 'Executive') return true;
      // Match by entity name
      return authUnitNames.some(name => fnd.entityName.toLowerCase().includes(name.toLowerCase()));
    });
  }, [selectedSsoUserObject, findings, orgUnits]);

  // Business Process 1: Engagement Assignment Simulation
  const handleAssignEngagement = () => {
    if (!assignmentEngagementId || !assignmentUnitId) {
      alert('Select both an engagement and an organizational unit.');
      return;
    }

    const eng = engagements.find(e => e.id === assignmentEngagementId);
    const unit = orgUnits.find(u => u.id === assignmentUnitId);

    if (!eng || !unit) return;

    // Update engagement on server / state
    const updatedEng: Engagement = {
      ...eng,
      assignedSection: unit.code,
      assignedTeam: unit.parentId ? orgUnits.find(p => p.id === unit.parentId)?.code : undefined
    };

    const nextEngs = engagements.map(e => e.id === eng.id ? updatedEng : e);
    if (onUpdateEngagements) {
      onUpdateEngagements(nextEngs);
    }

    // Simulated communications cascade
    const logEntries = [
      `[ROUTE] Engagements assigned to auditee department: "${unit.name}" (Code: ${unit.code})`,
      `[NOTIFY-LEVEL-1] Sent email alert to Head of Unit: ${getUnitHeadName(unit.headId || '')} (Engagement Initiation)`,
    ];

    if (unit.parentId) {
      const parent = orgUnits.find(p => p.id === unit.parentId);
      if (parent && parent.headId) {
        logEntries.push(`[NOTIFY-LEVEL-2] Cascaded oversight brief to Parent Unit Manager: ${getUnitHeadName(parent.headId)}`);
      }
    }

    logEntries.push(`[AUDIT-TRAIL] Escalation route updated. visibility is restricted to authorized personnel of ${unit.name} and higher governance tiers.`);

    setAssignmentLog(prev => [...logEntries, ...prev]);
    onLogAction('Engagement Assignment Route', `Routed engagement "${eng.title}" to org unit ${unit.name} [${unit.code}]`);
  };

  // Submit Escalation
  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationForm.title || !escalationForm.description) {
      alert('Title and Description are required.');
      return;
    }

    const source = orgUnits.find(s => s.id === escalationForm.sourceUnitId);
    const target = orgUnits.find(t => t.id === escalationForm.targetUnitId);
    const targetUser = users.find(u => u.id === escalationForm.escalatedToId);
    const activeUserObj = users.find(u => u.role === activeRole) || users[0];

    if (!source || !target || !targetUser) return;

    const newEsc: EscalationRecord = {
      id: `esc-${Date.now()}`,
      issueType: escalationForm.issueType,
      title: escalationForm.title,
      description: escalationForm.description,
      sourceUnitId: source.id,
      sourceUnitName: source.name,
      targetUnitId: target.id,
      targetUnitName: target.name,
      status: 'Pending Review',
      escalatedById: activeUserObj.id,
      escalatedByName: activeUserObj.name,
      escalatedToId: targetUser.id,
      escalatedToName: targetUser.name,
      creationDate: new Date().toISOString().split('T')[0]
    };

    const nextEsc = [newEsc, ...escalations];
    handleSaveEscalations(nextEsc);
    setShowEscalateModal(false);

    onLogAction('Hierarchy Escalation', `Submitted ${newEsc.issueType} escalation from "${source.name}" to "${target.name}"`);
  };

  // Resolve / Decide on an Escalation
  const handleResolveEscalation = (status: 'Approved' | 'Resolved' | 'Escalated Higher') => {
    if (!selectedEscalation) return;

    const activeUserObj = users.find(u => u.role === activeRole) || users[0];

    const updatedEsc: EscalationRecord = {
      ...selectedEscalation,
      status,
      decisionDate: new Date().toISOString().split('T')[0],
      decisionNotes: decisionNotes || 'Reviewed and updated.',
      decisionBy: `${activeUserObj.name} (${activeUserObj.title || activeUserObj.role})`
    };

    // If "Escalated Higher", we can logically push it up!
    if (status === 'Escalated Higher') {
      const currentTargetUnit = orgUnits.find(u => u.id === selectedEscalation.targetUnitId);
      if (currentTargetUnit && currentTargetUnit.parentId) {
        const nextTarget = orgUnits.find(u => u.id === currentTargetUnit.parentId);
        if (nextTarget) {
          updatedEsc.targetUnitId = nextTarget.id;
          updatedEsc.targetUnitName = nextTarget.name;
          updatedEsc.escalatedToId = nextTarget.headId || '';
          updatedEsc.escalatedToName = nextTarget.headName || 'Board';
          updatedEsc.decisionNotes = `Escalated Higher to parent unit: ${nextTarget.name}. Notes: ${decisionNotes}`;
        }
      } else {
        // Already at the top, assign to Board
        updatedEsc.targetUnitName = 'Board of Directors Audit Committee';
        updatedEsc.escalatedToName = 'Board Chairman';
        updatedEsc.decisionNotes = `Escalated Higher to Board Audit Committee. Notes: ${decisionNotes}`;
      }
    }

    const nextEsc = escalations.map(e => e.id === selectedEscalation.id ? updatedEsc : e);
    handleSaveEscalations(nextEsc);
    setSelectedEscalation(null);
    setDecisionNotes('');

    onLogAction('Escalation Resolution', `Escalation resolved with status: ${status} by ${activeUserObj.name}`);
  };

  // Business Process 5: Escalating Overdue Finding automatically based on org structure
  const handleTriggerOverdueEscalation = (finding: Finding) => {
    // Find unit that mapped the finding. Finding entityName matches unit
    const unit = orgUnits.find(u => finding.entityName.toLowerCase().includes(u.name.toLowerCase()));
    if (!unit) {
      alert('Could not determine responsible organizational unit for this finding.');
      return;
    }

    const parentUnit = unit.parentId ? orgUnits.find(u => u.id === unit.parentId) : orgUnits.find(u => u.type === 'Board Committee');
    if (!parentUnit) {
      alert('Could not find parent unit to escalate to.');
      return;
    }

    const activeUserObj = users.find(u => u.role === activeRole) || users[0];

    const newEsc: EscalationRecord = {
      id: `esc-${Date.now()}`,
      issueType: 'Overdue Corrective Action',
      title: `Overdue Finding Escalation: ${finding.title}`,
      description: `The corrective action for finding "${finding.title}" (assigned to ${unit.name}) has breached its expected completion date of ${finding.expectedCompletionDate || finding.slaDeadline}. Progress is currently ${finding.rectificationProgress}%.`,
      sourceUnitId: unit.id,
      sourceUnitName: unit.name,
      targetUnitId: parentUnit.id,
      targetUnitName: parentUnit.name,
      status: 'Pending Review',
      escalatedById: activeUserObj.id,
      escalatedByName: activeUserObj.name,
      escalatedToId: parentUnit.headId || 'usr-1',
      escalatedToName: parentUnit.headName || 'Director',
      creationDate: new Date().toISOString().split('T')[0]
    };

    const nextEsc = [newEsc, ...escalations];
    handleSaveEscalations(nextEsc);

    // Also increment finding escalation level
    const updatedFinding: Finding = {
      ...finding,
      escalationLevel: Math.min(finding.escalationLevel + 1, 3) as Finding['escalationLevel']
    };

    const nextFindings = findings.map(f => f.id === finding.id ? updatedFinding : f);
    if (onUpdateFindings) {
      onUpdateFindings(nextFindings);
    }

    alert(`Finding successfully escalated through hierarchy to: ${parentUnit.name} [Head: ${parentUnit.headName}]. Finding escalation tier raised to level ${updatedFinding.escalationLevel}.`);
    onLogAction('Hierarchy Finding Escalation', `Escalated finding ${finding.id} due to deadline breach to unit "${parentUnit.name}"`);
  };

  // Collapsible registry list filtered
  const filteredUnits = useMemo(() => {
    return orgUnits.filter(u => {
      const query = searchQuery.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(query) || u.code.toLowerCase().includes(query) || (u.roles || '').toLowerCase().includes(query);
      const matchType = typeFilter === 'all' || u.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [orgUnits, searchQuery, typeFilter]);

  // Collapsible hierarchy view
  const TreeItem = ({ unit, level = 0 }: { unit: OrganizationalUnit; level: number; key?: string }) => {
    const children = buildHierarchyTree(unit.id);
    const color = unitColors[unit.type] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

    return (
      <div className="space-y-1" style={{ paddingLeft: level > 0 ? '24px' : '0' }}>
        <div className={`p-3.5 bg-white border ${color.border} rounded-lg shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${color.bg}`}>
              <Building className={`w-4 h-4 ${color.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">{unit.name}</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 uppercase font-semibold">{unit.code}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${color.bg} ${color.text}`}>
                  {unit.type}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium"><UserIcon className="w-3 h-3 text-slate-400" /> Leader: <strong>{getUnitHeadName(unit.headId || '')}</strong></span>
                {unit.parentId && <span className="text-slate-300">|</span>}
                {unit.parentId && <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-slate-400" /> Parent: {getParentUnitName(unit.parentId)}</span>}
              </div>
              {unit.roles && (
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 italic leading-relaxed max-w-2xl">
                  "{unit.roles}"
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleOpenUnitModal(unit)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
              title="Edit unit details"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteUnit(unit.id, unit.name)}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Delete unit node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {children.length > 0 && (
          <div className="border-l-2 border-dashed border-slate-200 ml-4 pl-1 space-y-1 mt-1">
            {children.map(child => (
              <TreeItem key={child.id} unit={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="org_structure_view_container">
      
      {/* Tab Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Organizational Structure Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">Maintain governance nodes, reporting chains, visibility policies, and audit escalation rules.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenUnitModal(null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Org Unit</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setSubTab('registry')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === 'registry' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Hierarchy & Registry
        </button>
        <button
          onClick={() => setSubTab('assignments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === 'assignments' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Engagement Assignment Routing
        </button>
        <button
          onClick={() => setSubTab('visibility')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === 'visibility' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Hierarchy-Based Visibility demo
        </button>
        <button
          onClick={() => setSubTab('escalations')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === 'escalations' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Escalation Management Hub
        </button>
        <button
          onClick={() => setSubTab('findings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === 'findings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Corrective Action Escalator
        </button>
      </div>

      {/* MAIN VIEW CONTROLLER */}

      {/* 1. REGISTRY & VISUAL TREE */}
      {subTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="registry_subtab_panel">
          
          {/* Left Column: Visual hierarchy chain tree view */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Hierarchical Governance Tree
                </h2>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500">
                  Total Nodes: {orgUnits.length}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-xs">Loading organizational structure...</div>
              ) : orgUnits.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">No organizational units defined. Click "Add Org Unit" to begin.</div>
              ) : (
                <div className="space-y-3">
                  {/* Find and render root nodes (usually Board or CEO) */}
                  {buildHierarchyTree(undefined).map(rootUnit => (
                    <TreeItem key={rootUnit.id} unit={rootUnit} level={0} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Searchable flat directory and quick stats */}
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="font-bold text-slate-950 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Search className="w-4 h-4 text-indigo-500" />
                Quick Directory Filter
              </h2>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, code or keyword..."
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter by Type</label>
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Board of Directors">Board of Directors</option>
                    <option value="Board Committee">Board Committee</option>
                    <option value="CEO">Chief Executive Officer (CEO)</option>
                    <option value="Executive Management">Executive Management</option>
                    <option value="Directorate/Department">Directorate / Department</option>
                    <option value="Division">Division</option>
                    <option value="Section/Unit">Section or Unit</option>
                    <option value="Team">Team</option>
                  </select>
                </div>
              </div>

              {/* Matched list */}
              <div className="pt-2 max-h-[300px] overflow-y-auto space-y-2.5">
                {filteredUnits.map(unit => (
                  <div key={unit.id} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-850 flex items-center gap-1">
                        {unit.name} <span className="font-mono text-[9px] bg-slate-200 px-1 py-0.2 rounded text-slate-650 uppercase font-semibold">{unit.code}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{unit.type} • Head: {unit.headName || 'Unassigned'}</div>
                    </div>
                    <button
                      onClick={() => handleOpenUnitModal(unit)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Context / Responsibilities Template */}
            <div className="bg-indigo-900 text-white p-6 rounded-xl border border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm">Hierarchy-Based Operations</h3>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                By maintaining a structured parent-child relationship tree from the **Board of Directors** down to **Teams**, the platform automatically regulates reporting scopes, visibility rules, escalation triggers, and corrective action workflows.
              </p>
              <div className="border-t border-indigo-800 pt-3 mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-indigo-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure visibility cascade</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-indigo-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated audit escalation path</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-indigo-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dynamic communication cascade</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. ENGAGEMENT ROUTING & COMMUNICATION */}
      {subTab === 'assignments' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6" id="assignments_subtab_panel">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
              <Send className="w-4 h-4 text-indigo-500" />
              Engagement Assignment & Communication Route
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an ongoing engagement and map it to an audited organizational unit. The system automatically notifies the responsible head and schedules oversight updates for their parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Route Engagement</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Active Audit Engagement</label>
                  <select
                    value={assignmentEngagementId}
                    onChange={e => setAssignmentEngagementId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Engagement --</option>
                    {engagements.map(eng => (
                      <option key={eng.id} value={eng.id}>
                        {eng.title} ({eng.entityName}) [Current Section: {eng.assignedSection || 'None'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Responsible Auditee Unit (Hierarchy Target)</label>
                  <select
                    value={assignmentUnitId}
                    onChange={e => setAssignmentUnitId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {orgUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code}) • Manager: {unit.headName || 'None'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssignEngagement}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Route Engagement & Trigger Cascade Notifications</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                Live Notification Routing Logs
              </h3>
              
              <div className="bg-slate-900 rounded-xl p-4 h-[250px] overflow-y-auto font-mono text-[11px] text-slate-300 space-y-2.5 border border-slate-800">
                {assignmentLog.length === 0 ? (
                  <div className="text-slate-500 italic py-12 text-center">No assignments routed in this session. Execute assignment to view logs.</div>
                ) : (
                  assignmentLog.map((log, index) => (
                    <div key={index} className="border-b border-slate-850 pb-2 last:border-0">
                      <span className="text-indigo-400 font-bold">[SSO STACK]</span> {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HIERARCHY-BASED VISIBILITY DEMO */}
      {subTab === 'visibility' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6" id="visibility_subtab_panel">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-500" />
              Hierarchy-Based Visibility Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a user to simulate Active Directory SSO role restrictions. Higher tiers (Admin, Executive) view all records, while Divisional Heads and Team Leaders only see audit entries linked to their specific branch/department and subordinate nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Control Panel */}
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select SSO Profile</h3>
              
              <div className="space-y-3">
                {users.map(u => {
                  const isSelected = demoSelectedUser === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setDemoSelectedUser(u.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="truncate">{u.name}</div>
                      <div className={`text-[9px] uppercase font-bold truncate mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {u.role} • {u.department}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Workspace */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Visible Records for:</span>
                  <strong className="text-xs text-slate-900 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-150">
                    {selectedSsoUserObject?.name} ({selectedSsoUserObject?.role})
                  </strong>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setVisibleItemsFilter('engagements')}
                    className={`px-3 py-1 rounded font-medium cursor-pointer ${visibleItemsFilter === 'engagements' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500'}`}
                  >
                    Engagements ({demoVisibleEngagements.length})
                  </button>
                  <button
                    onClick={() => setVisibleItemsFilter('findings')}
                    className={`px-3 py-1 rounded font-medium cursor-pointer ${visibleItemsFilter === 'findings' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500'}`}
                  >
                    Findings ({demoVisibleFindings.length})
                  </button>
                </div>
              </div>

              {visibleItemsFilter === 'engagements' ? (
                <div className="space-y-3">
                  {demoVisibleEngagements.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed">
                      No engagements visible to this role under current organizational tree constraints.
                    </div>
                  ) : (
                    demoVisibleEngagements.map(eng => (
                      <div key={eng.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-2xs transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">{eng.entityName}</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{eng.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                              <span>AIC: <strong>{eng.auditorInCharge}</strong></span>
                              <span>•</span>
                              <span>WBS Tasks: <strong>{eng.wbs?.length || 0}</strong></span>
                              {eng.assignedSection && (
                                <>
                                  <span>•</span>
                                  <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">{eng.assignedSection}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase tracking-wider">
                            {eng.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {demoVisibleFindings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed">
                      No audit findings visible to this role under current organizational tree constraints.
                    </div>
                  ) : (
                    demoVisibleFindings.map(fnd => (
                      <div key={fnd.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-2xs transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">{fnd.entityName}</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{fnd.title}</h4>
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{fnd.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                              <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{fnd.riskLevel}</span>
                              <span>•</span>
                              <span>Progress: <strong>{fnd.rectificationProgress}%</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. ESCALATION MANAGEMENT HUB */}
      {subTab === 'escalations' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6" id="escalations_subtab_panel">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                Escalation Management & Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Escalate disputes, resource deficits, approvals or overdue items up the reporting chain. Maintains an immutable governance record of approvals and overrides.
              </p>
            </div>

            <button
              onClick={() => {
                // Preset default form
                setEscalationForm({
                  issueType: 'Resource Request',
                  title: '',
                  description: '',
                  sourceUnitId: orgUnits[4]?.id || 'unit-cfad',
                  targetUnitId: orgUnits[3]?.id || 'unit-iad',
                  escalatedToId: orgUnits[3]?.headId || 'usr-1'
                });
                setShowEscalateModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Escalation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Escalations List */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Escalations</h3>
              
              {escalations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed">
                  No escalations pending in the log.
                </div>
              ) : (
                escalations.map(esc => {
                  const isSelected = selectedEscalation?.id === esc.id;
                  const statusColors = {
                    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Resolved': 'bg-sky-50 text-sky-700 border-sky-200',
                    'Escalated Higher': 'bg-red-50 text-red-700 border-red-200'
                  };

                  return (
                    <div
                      key={esc.id}
                      onClick={() => setSelectedEscalation(esc)}
                      className={`p-4 bg-white border rounded-xl cursor-pointer hover:shadow-2xs transition-all ${
                        isSelected ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                              {esc.issueType}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusColors[esc.status] || 'bg-slate-100 text-slate-600'}`}>
                              {esc.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1.5">{esc.title}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{esc.description}</p>
                          
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-3 flex-wrap">
                            <span>From: <strong className="text-slate-600">{esc.sourceUnitName}</strong></span>
                            <span>→</span>
                            <span>To: <strong className="text-slate-600">{esc.targetUnitName}</strong></span>
                            <span>•</span>
                            <span>Date: {esc.creationDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Decision Workspace / Detailed Trail */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escalation Decision Panel</h3>
              
              {selectedEscalation ? (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedEscalation.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">ID: {selectedEscalation.id}</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-150 text-xs text-slate-650 space-y-2 leading-relaxed">
                    <p>{selectedEscalation.description}</p>
                    <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                      <div>Escalated By: <strong>{selectedEscalation.escalatedByName}</strong></div>
                      <div>Target Decision Maker: <strong>{selectedEscalation.escalatedToName}</strong></div>
                    </div>
                  </div>

                  {selectedEscalation.status !== 'Resolved' && selectedEscalation.status !== 'Approved' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Decision / Response Notes</label>
                        <textarea
                          rows={3}
                          value={decisionNotes}
                          onChange={e => setDecisionNotes(e.target.value)}
                          placeholder="Write feedback, resolution notes or directions here..."
                          className="w-full bg-white text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleResolveEscalation('Approved')}
                          className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleResolveEscalation('Resolved')}
                          className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleResolveEscalation('Escalated Higher')}
                          className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Push Higher
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-lg border border-emerald-250 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Escalation {selectedEscalation.status}
                      </div>
                      <p className="mt-1">"{selectedEscalation.decisionNotes}"</p>
                      <div className="text-[10px] text-slate-400 mt-2">Closed By: {selectedEscalation.decisionBy} on {selectedEscalation.decisionDate}</div>
                    </div>
                  )}

                  {/* Audit Trail Log */}
                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-2">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Immutable Action Trail
                    </span>
                    <div className="space-y-1.5 text-[10px] font-mono text-slate-500 max-h-[150px] overflow-y-auto">
                      <div>[{selectedEscalation.creationDate}] Submitted by {selectedEscalation.escalatedByName} to {selectedEscalation.escalatedToName}</div>
                      {selectedEscalation.decisionDate && (
                        <div className="text-emerald-600">[{selectedEscalation.decisionDate}] Updated status to {selectedEscalation.status} by {selectedEscalation.decisionBy}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed">
                  Select an escalation entry from the left to view decision controls and action trail.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. FINDING AND CORRECTIVE ACTION ESCALATOR */}
      {subTab === 'findings' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6" id="findings_subtab_panel">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-indigo-500" />
              Corrective Action Routing & Overdue Escalator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Findings are assigned to corporate units and heads. In case of SLA breaches (overdue remediation), you can escalate the finding up the organizational hierarchy chain to notify executive management.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Audit Findings Under Remediation</h3>

            {findings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed">
                No active findings recorded in system.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3">Finding Detail</th>
                      <th className="p-3">Assigned Unit</th>
                      <th className="p-3">SLA Deadline</th>
                      <th className="p-3">Status / Progress</th>
                      <th className="p-3 text-center">Escalation Tier</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {findings.map(fnd => {
                      // Determine if overdue
                      const isOverdue = fnd.expectedCompletionDate ? new Date(fnd.expectedCompletionDate) < new Date() : false;
                      // Find matching unit
                      const unit = orgUnits.find(u => fnd.entityName.toLowerCase().includes(u.name.toLowerCase()));

                      return (
                        <tr key={fnd.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{fnd.title}</div>
                            <div className="text-[10px] text-slate-450 mt-0.5">Ref: {fnd.id} • Risk: {fnd.riskLevel}</div>
                          </td>
                          <td className="p-3">
                            {unit ? (
                              <div>
                                <span className="font-semibold text-slate-800">{unit.name}</span>
                                <div className="text-[10px] text-slate-400">Head: {unit.headName || 'None'}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No direct mapping</span>
                            )}
                          </td>
                          <td className="p-3 font-mono">
                            {fnd.expectedCompletionDate || fnd.slaDeadline}
                            {isOverdue && <span className="ml-1 text-[10px] text-red-600 font-bold uppercase animate-pulse">[Breach]</span>}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{fnd.rectificationProgress}%</span>
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full" style={{ width: `${fnd.rectificationProgress}%` }}></div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">{fnd.rectificationValidationStatus}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              fnd.escalationLevel === 3 ? 'bg-red-100 text-red-800' :
                              fnd.escalationLevel === 2 ? 'bg-orange-100 text-orange-800' :
                              fnd.escalationLevel === 1 ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {fnd.escalationLevel === 3 ? 'Level 3 (Board)' :
                               fnd.escalationLevel === 2 ? 'Level 2 (Director)' :
                               fnd.escalationLevel === 1 ? 'Level 1 (AIC)' :
                               'Standard (Unescalated)'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleTriggerOverdueEscalation(fnd)}
                              className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ml-auto"
                              title="Escalate overdue finding up the reporting chain"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Escalate Up</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* 1. UNIT MODAL */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-3xs flex items-center justify-center p-4 z-55 animate-fade-in" id="org_unit_modal_container">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingUnit ? 'Edit Organizational Unit' : 'Create Organizational Unit'}
              </h3>
              <button
                onClick={() => setShowUnitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUnitSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Name *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.name}
                    onChange={e => setUnitForm({ ...unitForm, name: e.target.value })}
                    placeholder="e.g. Credit Operations Team"
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.code}
                    onChange={e => setUnitForm({ ...unitForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. COT-01"
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Type *</label>
                  <select
                    value={unitForm.type}
                    onChange={e => setUnitForm({ ...unitForm, type: e.target.value as OrganizationalUnit['type'] })}
                    className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Board of Directors">Board of Directors</option>
                    <option value="Board Committee">Board Committee</option>
                    <option value="CEO">Chief Executive Officer (CEO)</option>
                    <option value="Executive Management">Executive Management</option>
                    <option value="Directorate/Department">Directorate / Department</option>
                    <option value="Division">Division</option>
                    <option value="Section/Unit">Section or Unit</option>
                    <option value="Team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Unit</label>
                  <select
                    value={unitForm.parentId}
                    onChange={e => setUnitForm({ ...unitForm, parentId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- No Parent (Root Element) --</option>
                    {orgUnits
                      .filter(u => !editingUnit || u.id !== editingUnit.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name} [{u.code}]</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head / Manager</label>
                  <select
                    value={unitForm.headId}
                    onChange={e => setUnitForm({ ...unitForm, headId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.title || u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Categories / Positions</label>
                  <input
                    type="text"
                    value={unitForm.positions}
                    onChange={e => setUnitForm({ ...unitForm, positions: e.target.value })}
                    placeholder="Analyst, Officer, Clerk (comma-separated)"
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Roles & Mandates</label>
                <textarea
                  rows={2}
                  value={unitForm.roles}
                  onChange={e => setUnitForm({ ...unitForm, roles: e.target.value })}
                  placeholder="Primary role in business operations..."
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsibilities & Fiduciary Duties</label>
                <textarea
                  rows={2}
                  value={unitForm.responsibilities}
                  onChange={e => setUnitForm({ ...unitForm, responsibilities: e.target.value })}
                  placeholder="Specific actions and responsibilities assigned to members..."
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-3xs flex items-center justify-center p-4 z-55 animate-fade-in" id="escalate_modal_container">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Raise Audit Escalation Up Hierarchy
              </h3>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Type</label>
                <select
                  value={escalationForm.issueType}
                  onChange={e => setEscalationForm({ ...escalationForm, issueType: e.target.value as EscalationRecord['issueType'] })}
                  className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Resource Request">Resource Request deficit</option>
                  <option value="Audit Approval">Audit plan approval delay</option>
                  <option value="Unresolved Finding">Unresolved Finding deadlock</option>
                  <option value="Overdue Corrective Action">Overdue Corrective action breach</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Escalation Subject *</label>
                <input
                  type="text"
                  required
                  value={escalationForm.title}
                  onChange={e => setEscalationForm({ ...escalationForm, title: e.target.value })}
                  placeholder="e.g. Uncooperative Auditee in Branch cash count"
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Incident / Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={escalationForm.description}
                  onChange={e => setEscalationForm({ ...escalationForm, description: e.target.value })}
                  placeholder="Provide detailed logs of SLA breaches or resources requested..."
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Source Department</label>
                  <select
                    value={escalationForm.sourceUnitId}
                    onChange={e => setEscalationForm({ ...escalationForm, sourceUnitId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {orgUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Authority Unit (Hierarchical Step)</label>
                  <select
                    value={escalationForm.targetUnitId}
                    onChange={e => setEscalationForm({ ...escalationForm, targetUnitId: e.target.value })}
                    className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {orgUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Escalated To (Responsible Leader)</label>
                <select
                  value={escalationForm.escalatedToId}
                  onChange={e => setEscalationForm({ ...escalationForm, escalatedToId: e.target.value })}
                  className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.title || u.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Raise Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
