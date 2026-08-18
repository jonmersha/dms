import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  UserRole, User, AuditUniverseEntity, AnnualPlanItem, Engagement, Finding, 
  ComplianceControl, SystemLog, OrganizationalUnit, EscalationRecord 
} from '../types/audit_flow';
import { auditApiService } from '../services/auditApiService';

interface AuditContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  universe: AuditUniverseEntity[];
  setUniverse: React.Dispatch<React.SetStateAction<AuditUniverseEntity[]>>;
  annualPlan: AnnualPlanItem[];
  setAnnualPlan: React.Dispatch<React.SetStateAction<AnnualPlanItem[]>>;
  engagements: Engagement[];
  setEngagements: React.Dispatch<React.SetStateAction<Engagement[]>>;
  findings: Finding[];
  setFindings: React.Dispatch<React.SetStateAction<Finding[]>>;
  complianceControls: ComplianceControl[];
  setComplianceControls: React.Dispatch<React.SetStateAction<ComplianceControl[]>>;
  systemLogs: SystemLog[];
  setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>;
  activeRole: UserRole;
  setActiveRole: React.Dispatch<React.SetStateAction<UserRole>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  selectedRemediationFindingId: string | null;
  setSelectedRemediationFindingId: React.Dispatch<React.SetStateAction<string | null>>;
  handleLogSystemAction: (action: string, details: string) => void;
  getActiveSsoUser: () => User | null;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function useAuditContext() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditContext must be used within an AuditProvider');
  }
  return context;
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [universe, setUniverse] = useState<AuditUniverseEntity[]>([]);
  const [annualPlan, setAnnualPlan] = useState<AnnualPlanItem[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [complianceControls, setComplianceControls] = useState<ComplianceControl[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  const [activeRole, setActiveRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState('Dashboard & KPIs');
  const [selectedRemediationFindingId, setSelectedRemediationFindingId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [u, un, ap, e, f, cc, sl] = await Promise.all([
          auditApiService.getUsers(),
          auditApiService.getUniverse(),
          auditApiService.getAnnualPlan(),
          auditApiService.getEngagements(),
          auditApiService.getFindings(),
          auditApiService.getComplianceControls(),
          auditApiService.getSystemLogs()
        ]);
        
        if (u) setUsers(u);
        if (un) setUniverse(un);
        if (ap) setAnnualPlan(ap);
        if (e) setEngagements(e);
        if (f) setFindings(f);
        if (cc) setComplianceControls(cc);
        if (sl) setSystemLogs(sl);
        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load audit data from API", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('audit_auth_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
    } else {
      localStorage.removeItem('audit_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!dataLoaded) return;
    try {
      auditApiService.saveUsers(users);
    } catch(e) { console.error(e) }
  }, [users, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      try {
        auditApiService.saveUniverse(universe);
      } catch(e) { console.error(e) }
    }
  }, [universe, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      try {
        auditApiService.saveAnnualPlan(annualPlan);
      } catch(e) { console.error(e) }
    }
  }, [annualPlan, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      try {
        auditApiService.saveEngagements(engagements);
      } catch(e) { console.error(e) }
    }
  }, [engagements, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      try {
        auditApiService.saveFindings(findings);
      } catch(e) { console.error(e) }
    }
  }, [findings, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      try {
        auditApiService.saveComplianceControls(complianceControls);
      } catch(e) { console.error(e) }
    }
  }, [complianceControls, dataLoaded]);

  useEffect(() => {
    if (dataLoaded && systemLogs.length > 0) {
      // Avoid saving logs on every render, in real Django app we will append logs via API
      // We will skip full save here since we have appendSystemLog
    }
  }, [systemLogs, dataLoaded]);

  const getActiveSsoUser = (): User | null => {
    if (currentUser && activeRole === currentUser.role) {
      return currentUser;
    }
    const found = users.find(u => u.role === activeRole);
    if (found) return found;
    return null;
  };

  const handleLogSystemAction = (action: string, details: string) => {
    const user = getActiveSsoUser();
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user ? user.email : 'system@bank.et',
      role: activeRole,
      action,
      details,
      ipAddress: '192.168.12.82'
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  return (
    <AuditContext.Provider value={{
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
    }}>
      {children}
    </AuditContext.Provider>
  );
}
