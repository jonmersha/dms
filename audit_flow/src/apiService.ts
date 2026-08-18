import { 
  User, 
  AuditUniverseEntity, 
  AnnualPlanItem, 
  Engagement, 
  Finding, 
  ComplianceControl, 
  SystemLog,
  OrganizationalUnit,
  EscalationRecord
} from './types';

// Helper for making API requests with optional local cache fallbacks
const apiRequest = async <T>(url: string, method: string = 'GET', body?: any): Promise<T | null> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} on ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[VERIFY-API-ERROR] failed on ${url}:`, error);
    return null;
  }
};

export const apiService = {
  // Users APIs
  async getUsers(): Promise<User[] | null> {
    return apiRequest<User[]>('/api/users');
  },
  async saveUsers(users: User[]): Promise<any> {
    return apiRequest('/api/users', 'POST', users);
  },

  // Audit Universe APIs
  async getUniverse(): Promise<AuditUniverseEntity[] | null> {
    return apiRequest<AuditUniverseEntity[]>('/api/universe');
  },
  async saveUniverse(universe: AuditUniverseEntity[]): Promise<any> {
    return apiRequest('/api/universe', 'POST', universe);
  },

  // Annual Plan APIs
  async getAnnualPlan(): Promise<AnnualPlanItem[] | null> {
    return apiRequest<AnnualPlanItem[]>('/api/annual_plan');
  },
  async saveAnnualPlan(plans: AnnualPlanItem[]): Promise<any> {
    return apiRequest('/api/annual_plan', 'POST', plans);
  },

  // Engagements APIs
  async getEngagements(): Promise<Engagement[] | null> {
    return apiRequest<Engagement[]>('/api/engagements');
  },
  async saveEngagements(engs: Engagement[]): Promise<any> {
    return apiRequest('/api/engagements', 'POST', engs);
  },

  // Findings APIs
  async getFindings(): Promise<Finding[] | null> {
    return apiRequest<Finding[]>('/api/findings');
  },
  async saveFindings(findings: Finding[]): Promise<any> {
    return apiRequest('/api/findings', 'POST', findings);
  },

  // Compliance Controls APIs
  async getComplianceControls(): Promise<ComplianceControl[] | null> {
    return apiRequest<ComplianceControl[]>('/api/compliance_controls');
  },
  async saveComplianceControls(controls: ComplianceControl[]): Promise<any> {
    return apiRequest('/api/compliance_controls', 'POST', controls);
  },

  // System Logs APIs
  async getSystemLogs(): Promise<SystemLog[] | null> {
    return apiRequest<SystemLog[]>('/api/system_logs');
  },
  async saveSystemLogs(logs: SystemLog[]): Promise<any> {
    return apiRequest('/api/system_logs', 'POST', logs);
  },
  async appendSystemLog(log: SystemLog): Promise<any> {
    return apiRequest('/api/system_logs', 'POST', [log]);
  },

  // Auth APIs
  async login(email: string, password: string): Promise<User | null> {
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    };
    const response = await fetch('/api/auth/login', options);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status} on login`);
    }
    return await response.json();
  },

  async register(profile: Omit<User, 'id' | 'active'> & { password?: string }): Promise<User | null> {
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    };
    const response = await fetch('/api/auth/register', options);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status} on registration`);
    }
    return await response.json();
  },

  async getGoogleAuthUrl(): Promise<{ url: string } | null> {
    return apiRequest<{ url: string }>('/api/auth/google/url', 'GET');
  },

  // Organizational Units APIs
  async getOrgUnits(): Promise<OrganizationalUnit[] | null> {
    return apiRequest<OrganizationalUnit[]>('/api/org_units');
  },
  async saveOrgUnits(units: OrganizationalUnit[]): Promise<any> {
    return apiRequest('/api/org_units', 'POST', units);
  },

  // Escalations APIs
  async getEscalations(): Promise<EscalationRecord[] | null> {
    return apiRequest<EscalationRecord[]>('/api/escalations');
  },
  async saveEscalations(esc: EscalationRecord[]): Promise<any> {
    return apiRequest('/api/escalations', 'POST', esc);
  },
};
