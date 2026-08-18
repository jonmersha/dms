import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserRole, User, AuditUniverseEntity, AnnualPlanItem, Engagement, Finding, 
  ComplianceControl, SystemLog, initialUsers, initialUniverse, initialAnnualPlan, 
  initialEngagements, initialFindings, initialComplianceControls, initialSystemLogs
} from '../types';
import { apiService } from '../apiService';

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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('audit_auth_user');
    return cached ? JSON.parse(cached) : null;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem('audit_users');
    return cached ? JSON.parse(cached) : initialUsers;
  });

  const [universe, setUniverse] = useState<AuditUniverseEntity[]>(() => {
    const cached = localStorage.getItem('audit_universe');
    return cached ? JSON.parse(cached) : initialUniverse;
  });

  const [annualPlan, setAnnualPlan] = useState<AnnualPlanItem[]>(() => {
    const cached = localStorage.getItem('audit_annualplan');
    return cached ? JSON.parse(cached) : initialAnnualPlan;
  });

  const [engagements, setEngagements] = useState<Engagement[]>(() => {
    const cached = localStorage.getItem('audit_engagements');
    return cached ? JSON.parse(cached) : initialEngagements;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const cached = localStorage.getItem('audit_findings');
    return cached ? JSON.parse(cached) : initialFindings;
  });

  const [complianceControls, setComplianceControls] = useState<ComplianceControl[]>(() => {
    const cached = localStorage.getItem('audit_compliance');
    return cached ? JSON.parse(cached) : initialComplianceControls;
  });

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => {
    const cached = localStorage.getItem('audit_logs');
    return cached ? JSON.parse(cached) : initialSystemLogs;
  });

  const [activeRole, setActiveRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState('Dashboard & KPIs');
  const [selectedRemediationFindingId, setSelectedRemediationFindingId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('audit_auth_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
    } else {
      localStorage.removeItem('audit_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const uRes = await apiService.getUsers();
        if (uRes) setUsers(uRes);

        const univRes = await apiService.getUniverse();
        if (univRes) setUniverse(univRes);

        const apRes = await apiService.getAnnualPlan();
        if (apRes) setAnnualPlan(apRes);

        const engRes = await apiService.getEngagements();
        if (engRes) setEngagements(engRes);

        const findRes = await apiService.getFindings();
        if (findRes) setFindings(findRes);

        const compRes = await apiService.getComplianceControls();
        if (compRes) setComplianceControls(compRes);

        const logRes = await apiService.getSystemLogs();
        if (logRes) setSystemLogs(logRes);
      } catch (err) {
        console.warn('SQLite background service unavailable. Defaulting to local memory.', err);
      } finally {
        setDataLoaded(true);
      }
    };
    syncBackendData();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_users', JSON.stringify(users));
    apiService.saveUsers(users);
  }, [users, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_universe', JSON.stringify(universe));
    apiService.saveUniverse(universe);
  }, [universe, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_annualplan', JSON.stringify(annualPlan));
    apiService.saveAnnualPlan(annualPlan);
  }, [annualPlan, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_engagements', JSON.stringify(engagements));
    apiService.saveEngagements(engagements);
  }, [engagements, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_findings', JSON.stringify(findings));
    apiService.saveFindings(findings);
  }, [findings, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_compliance', JSON.stringify(complianceControls));
    apiService.saveComplianceControls(complianceControls);
  }, [complianceControls, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem('audit_logs', JSON.stringify(systemLogs));
    apiService.saveSystemLogs(systemLogs);
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
