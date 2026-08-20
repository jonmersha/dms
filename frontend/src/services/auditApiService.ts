import api from '../api/axios';
import type { 
  User, 
  AuditUniverseEntity, 
  AnnualPlanItem, 
  Engagement, 
  Finding, 
  ComplianceControl, 
  SystemLog,
  OrganizationalUnit,
  EscalationRecord
} from '../types/audit_flow';

// Helper for mapping API responses to the React UI types.
// The Django API might have slightly different casing or nesting, but for now we'll pass it straight through
// or we can add mapping logic here if needed.

export const auditApiService = {
  // Users APIs
  async getUsers(): Promise<User[] | null> {
    try {
      const response = await api.get('/api/directory/users/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch users', e);
      return null;
    }
  },

  // Audit Universe APIs
  async getUniverse(): Promise<AuditUniverseEntity[] | null> {
    try {
      const response = await api.get('/api/audits/universe/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch universe', e);
      return null;
    }
  },
  async saveUniverse(universe: AuditUniverseEntity[]): Promise<any> {
    return api.post('/api/audits/universe/', universe);
  },

  // Annual Plan APIs
  async getAnnualPlan(): Promise<AnnualPlanItem[] | null> {
    try {
      const response = await api.get('/api/audits/annual-plans/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch annual plans', e);
      return null;
    }
  },
  async saveAnnualPlan(plans: AnnualPlanItem[]): Promise<any> {
    return api.post('/api/audits/annual-plans/', plans);
  },

  // Engagements APIs
  async getEngagements(): Promise<Engagement[] | null> {
    try {
      const response = await api.get('/api/audits/engagements/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch engagements', e);
      return null;
    }
  },
  async saveEngagements(engs: Engagement[]): Promise<any> {
    return api.post('/api/audits/engagements/', engs);
  },

  // Findings APIs
  async getFindings(): Promise<Finding[] | null> {
    try {
      const response = await api.get('/api/audits/findings/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch findings', e);
      return null;
    }
  },
  async saveFindings(findings: Finding[]): Promise<any> {
    return api.post('/api/audits/findings/', findings);
  },

  // Compliance Controls APIs
  async getComplianceControls(): Promise<ComplianceControl[] | null> {
    try {
      const response = await api.get('/api/audits/compliance-controls/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch compliance controls', e);
      return null;
    }
  },
  async saveComplianceControls(controls: ComplianceControl[]): Promise<any> {
    return api.post('/api/audits/compliance-controls/', controls);
  },

  // Escalations
  async getEscalations(): Promise<EscalationRecord[] | null> {
    try {
      const response = await api.get('/api/audits/escalations/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch escalations', e);
      return null;
    }
  },
  async saveEscalations(escalations: EscalationRecord[]): Promise<any> {
    return api.post('/api/audits/escalations/', escalations);
  },

  // System Logs APIs (Mocked to local state for CAP since there is no backend table for this yet)
  async getSystemLogs(): Promise<SystemLog[] | null> {
    return [];
  },
  async appendSystemLog(log: SystemLog): Promise<any> {
    return Promise.resolve();
  },

  // Auth mock for LoginView
  async login(e: string, p: string): Promise<any> { return {}; },
  async register(data: any): Promise<any> { return {}; },
  async getGoogleAuthUrl(): Promise<any> { return ''; },

  // Org Structure mock
  async getOrgUnits(): Promise<OrganizationalUnit[] | null> {
    try {
      const response = await api.get('/api/audits/org-units/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch(e) { return null; }
  },
  async saveOrgUnits(units: OrganizationalUnit[]): Promise<any> {
    return api.post('/api/audits/org-units/', units);
  },
  async saveUsers(users: User[]): Promise<any> {
    return api.post('/api/admin/users/', users);
  }
};
