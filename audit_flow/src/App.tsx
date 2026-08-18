/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building,
  ShieldCheck, 
  Users, 
  Terminal, 
  ClipboardCheck, 
  FileCheck, 
  Sparkles, 
  Activity, 
  ArrowRightLeft,
  KeyRound,
  Fingerprint,
  CalendarDays,
  Menu,
  X,
  Sliders,
  Settings,
  BookOpen,
  Network
} from 'lucide-react';

import { 
  UserRole, 
  User, 
  AuditUniverseEntity, 
  AnnualPlanItem, 
  Engagement, 
  Finding, 
  ComplianceControl, 
  SystemLog,
} from './types';

// Import custom views
import DashboardKpiView from './components/DashboardKpiView';
import UniversePlanView from './components/UniversePlanView';
import RiskAssessmentView from './components/RiskAssessmentView';
import EngagementView from './components/EngagementView';
import FieldworkFindingView from './components/FieldworkFindingView';
import RemediationView from './components/RemediationView';
import StandardsPolicyView from './components/StandardsPolicyView';
import CaatAnalyticsView from './components/CaatAnalyticsView';
import ImmutableLogView from './components/ImmutableLogView';
import LoginView from './components/LoginView';
import AdminConsoleView from './components/AdminConsoleView';
import OrgStructureView from './components/OrgStructureView';

// Import SQLite API service
import { useAuditContext } from './context/AuditContext';

export default function App() {
  const {
    currentUser, setCurrentUser,
    users, setUsers,
    universe, setUniverse,
    annualPlan, setAnnualPlan,
    engagements, setEngagements,
    findings, setFindings,
    complianceControls, setComplianceControls,
    systemLogs, setSystemLogs,
    activeRole, setActiveRole,
    activeTab, setActiveTab,
    selectedRemediationFindingId, setSelectedRemediationFindingId,
    handleLogSystemAction,
    getActiveSsoUser
  } = useAuditContext();

  const activeUser = getActiveSsoUser() || (currentUser || users[0] || {
      id: 'system',
      name: 'Abebe Kebede',
      email: 'akebede@bank.et',
      role: 'Admin',
      department: 'Internal Audit Department',
      active: true,
      title: 'Chief Internal Auditor'
  });

  // Handle manual role change log events
  const handleRoleImpersonationChange = (role: UserRole) => {
    setActiveRole(role);
    const resolvedUser = users.find(u => u.role === role) || users[0];
    
    // Log SSO re-route
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: resolvedUser.email,
      role,
      action: 'SSO Role Switch',
      details: `Active Directory SSO impersonation switched profile connection to (${resolvedUser.name}) under role: ${role}`,
      ipAddress: '192.168.12.82'
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    if (currentUser) {
      handleLogSystemAction('Auth Sign-Out', `Employee (${currentUser.name}) successfully closed active session from secure portal.`);
    }
    setCurrentUser(null);
  };

  // Safe navigation directly to Remediation Finding
  const handleSelectFindingFromDash = (findingId: string) => {
    setSelectedRemediationFindingId(findingId);
    setActiveTab('Remediation (Follow-up)');
  };

  // Sidebar groups for structured visual layout
  const sidebarGroups = [
    {
      groupName: 'Strategy & Intelligence',
      items: [
        { name: 'Dashboard & KPIs', icon: Activity },
        { name: 'Audit Universe Registry', icon: Building },
        { name: 'Risk Assessment', icon: Sliders },
        { name: 'Annual Audit Plan', icon: CalendarDays }
      ]
    },
    {
      groupName: 'Audit Operations',
      items: [
        { name: 'Engagements & Programs', icon: ClipboardCheck },
        { name: 'Fieldwork & Findings', icon: ShieldCheck },
        { name: 'Remediation (Follow-up)', icon: FileCheck }
      ]
    },
    {
      groupName: 'Analytics & Structure',
      items: [
        { name: 'Org Structure Management', icon: Network },
        { name: 'CAAT & Anomaly Analytics', icon: Sparkles }
      ]
    },
    {
      groupName: 'System & Governance',
      items: [
        { name: 'SSO Security Logs', icon: Terminal },
        { name: 'Administration Console', icon: Settings }
      ]
    }
  ];

  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return (
      <LoginView 
        onSuccess={(user) => {
          // Log authentication verification
          const newLog: SystemLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: user.email,
            role: user.role,
            action: 'Account Sign-In',
            details: `Corporate employee (${user.name}) successfully passed credential validation and opened a secure connection session.`,
            ipAddress: '192.168.12.82'
          };
          setSystemLogs(prev => [newLog, ...prev]);
          setCurrentUser(user);
        }} 
      />
    );
  }

  return (
    <div className="h-screen bg-slate-150 flex flex-col font-sans text-slate-800 selection:bg-indigo-600 selection:text-white overflow-hidden" id="main_app_canvas">
      
      {/* 1. Global Header with SSO Active status & Role Switcher */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 shrink-0 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm z-40" id="app_header">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-slate-400 p-1.5 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3" id="header_logo">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base block font-sans tracking-tight text-white uppercase leading-none">VERIFY</span>
              <span className="text-[10px] text-slate-400 font-light block uppercase tracking-wider">Enterprise Audit Platform</span>
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('Administration Console')}
            className={`hidden md:flex ml-4 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'Administration Console' 
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
             title="Open Governance Administration Console"
          >
            <Settings className={`w-4 h-4 ${activeTab === 'Administration Console' ? 'text-indigo-400' : ''}`} />
            <span>Admin Console</span>
          </button>
        </div>

        {/* Unified active directory SSO and Impersonator controls */}
        <div className="flex items-center gap-4" id="sso_controller">
          
          {/* Active Directory SSO Integration identifier bar */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800 text-slate-350 border border-slate-700 px-3.5 py-1.5 rounded-lg text-[11px]" id="sso_indicator_banner">
            <Fingerprint className="w-4 h-4 text-indigo-400 animate-pulse" />
            <div className="font-mono text-[10px]" id="ad_username_tag">
              ADFS SSO connected: <strong className="font-semibold text-white uppercase">{activeUser.name}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700" id="role_switcher_wrapper">
            <KeyRound className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            <span className="text-[10px] uppercase font-bold text-slate-450 hidden sm:inline mr-1 text-slate-400">SSO Active:</span>
            
            <select
              value={activeRole}
              onChange={e => handleRoleImpersonationChange(e.target.value as UserRole)}
              className="bg-slate-900 border-none text-xs px-2 py-1 rounded-lg font-medium font-sans cursor-pointer focus:ring-1 focus:ring-indigo-500 text-white outline-none"
              id="role_dropdown_switcher"
            >
              <option value="Admin">Chief Auditor (Admin)</option>
              <option value="Manager">Senior Manager</option>
              <option value="Team Leader">AIC / Team Leader</option>
              <option value="Auditor">Field Auditor</option>
              <option value="Auditee">Business Auditee</option>
              <option value="Executive">Executive Board</option>
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-955/30 hover:bg-red-900/40 border border-red-900/60 text-red-200 hover:text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-sm"
            id="workspace_logout_btn"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* 2. Side navigation & content viewport */}
      <div className="flex-1 flex flex-row overflow-hidden relative" id="app_body_container">
        
        {/* Left Sidebar (Grouped) for Desktop */}
        {activeTab !== 'Administration Console' && (
          <aside className="hidden md:flex flex-col w-72 border-r border-slate-200 bg-white shrink-0 overflow-y-auto" id="desktop_sidebar">
            <div className="p-4 space-y-6">
              
              {/* Active User Badge */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-3" id="sidebar_profile_badge">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono border border-indigo-150 flex items-center justify-center text-xs shrink-0">
                  {activeUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-800 text-xs block truncate" title={activeUser.name}>{activeUser.name}</span>
                  <span className="text-[10px] text-indigo-650 font-extrabold font-mono block uppercase truncate" title={activeUser.department}>
                    {activeUser.department}
                  </span>
                </div>
              </div>

              {/* Grouped Navigation */}
              <nav className="space-y-5" id="desktop_grouped_nav">
                {sidebarGroups.map(group => (
                  <div key={group.groupName} className="space-y-1.5">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5">
                      {group.groupName}
                    </h3>
                    <div className="space-y-0.5">
                      {group.items.map(tab => {
                        const IconComponent = tab.icon;
                        const isSelected = activeTab === tab.name;
                        return (
                          <button
                            key={tab.name}
                            onClick={() => {
                              setActiveTab(tab.name);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-50 text-indigo-750 font-extrabold' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{tab.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Mobile Nav Overlay Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 fixed top-16 left-0 right-0 z-50 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto" id="mobile_dropdown_nav">
            <div className="p-4 space-y-5">
              <nav className="space-y-5" id="mobile_grouped_nav">
                {sidebarGroups.map(group => (
                  <div key={group.groupName} className="space-y-1.5">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5">
                      {group.groupName}
                    </h3>
                    <div className="space-y-0.5">
                      {group.items.map(tab => {
                        const IconComponent = tab.icon;
                        const isSelected = activeTab === tab.name;
                        return (
                          <button
                            key={tab.name}
                            onClick={() => {
                              setActiveTab(tab.name);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-600 rounded-l-none' 
                                : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{tab.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Profile specifications at the bottom of mobile menu */}
              <div className="border-t border-slate-100 pt-4 space-y-3" id="mobile_sso_meta">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono border border-indigo-100 flex items-center justify-center text-xs">
                    {activeUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-xs leading-none">
                    <span className="font-bold text-slate-800 block">{activeUser.name}</span>
                    <span className="text-slate-500 text-[10px] block font-mono mt-0.5">{activeUser.email}</span>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3.5 text-white text-xs space-y-1.5 border border-slate-800" id="mobile_indicator_node">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Corporate Node Identity</div>
                  <div>Dept: <strong className="text-white font-medium">{activeUser.department}</strong></div>
                  <div>Authority: <strong className="text-emerald-400 font-medium font-mono">NBE Registered</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area Container */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-100 relative animate-fade-in" id="layout_body">
          
          {/* Backdrop for mobile overlays */}
          {mobileMenuOpen && (
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-3xs z-40 md:hidden"
              id="mobile_backdrop"
            />
          )}

          {/* 3. Main Workspace Area */}
          <main className="flex-1 p-4 md:p-6 lg:p-8" id="main_workspace">
          
          {/* Active Tab router rendering */}
          {activeTab === 'Dashboard & KPIs' && (
            <DashboardKpiView />
          )}

          {activeTab === 'Audit Universe Registry' && (
            <UniversePlanView defaultTab="Registry" hideTabsSelection={false} />
          )}

          {activeTab === 'Risk Assessment' && (
            <RiskAssessmentView targetModule="RiskAssessment" />
          )}

          {activeTab === 'Annual Audit Plan' && (
            <RiskAssessmentView targetModule="AnnualPlan" />
          )}

          {activeTab === 'Engagements & Programs' && (
            <EngagementView />
          )}

          {activeTab === 'Org Structure Management' && (
            <OrgStructureView />
          )}

          {activeTab === 'Fieldwork & Findings' && (
            <FieldworkFindingView />
          )}

          {activeTab === 'Remediation (Follow-up)' && (
            <RemediationView />
          )}

          {activeTab === 'CAAT & Anomaly Analytics' && (
            <CaatAnalyticsView />
          )}

          {activeTab === 'SSO Security Logs' && (
            <ImmutableLogView />
          )}

          {activeTab === 'Administration Console' && (
            <AdminConsoleView />
          )}

        </main>
      </div>
    </div>
  </div>
  );
}
