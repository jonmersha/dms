# 1. types/irregularity.ts
types_code = """export interface IncidentCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IncidentSystem {
  id: number;
  name: string;
  isActive: boolean;
}

export interface ResponsibleOrgan {
  id: number;
  name: string;
  isActive: boolean;
}

export interface IrregularityReport {
  id: number;
  branchId?: number;
  branchName?: string;
  reportedByName?: string;
  
  categoryId?: number;
  categoryName?: string;
  
  involvedSystemId?: number;
  involvedSystemName?: string;
  
  responsibleOrganId?: number;
  responsibleOrganName?: string;
  
  caseDescription: string;
  discoveryTime: string; // ISO DateTime
  amountInvolved?: number | null;
  recommendedAction: string;
  escalationProcedure: string;
  status: 'PENDING' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  createdAt?: string;
  updatedAt?: string;
}
"""
with open('frontend/src/types/irregularity.ts', 'w') as f:
    f.write(types_code)

# 2. services/irregularityApiService.ts
api_code = """import api from '../api/axios';
import type { 
  IrregularityReport, 
  IncidentCategory, 
  IncidentSystem, 
  ResponsibleOrgan 
} from '../types/irregularity';

export const irregularityApiService = {
  // Reports
  async getReports(): Promise<IrregularityReport[]> {
    try {
      const response = await api.get('/irregularities/reports/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch irregularities', e);
      return [];
    }
  },

  async createReport(data: Partial<IrregularityReport>): Promise<IrregularityReport> {
    const response = await api.post('/irregularities/reports/', data);
    return response.data;
  },

  async updateReport(id: number, data: Partial<IrregularityReport>): Promise<IrregularityReport> {
    const response = await api.patch(`/irregularities/reports/${id}/`, data);
    return response.data;
  },

  async deleteReport(id: number): Promise<void> {
    await api.delete(`/irregularities/reports/${id}/`);
  },

  // Categories
  async getCategories(): Promise<IncidentCategory[]> {
    const res = await api.get('/irregularities/categories/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
  async createCategory(data: Partial<IncidentCategory>): Promise<IncidentCategory> {
    const res = await api.post('/irregularities/categories/', data);
    return res.data;
  },
  async updateCategory(id: number, data: Partial<IncidentCategory>): Promise<IncidentCategory> {
    const res = await api.patch(`/irregularities/categories/${id}/`, data);
    return res.data;
  },
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/irregularities/categories/${id}/`);
  },

  // Systems
  async getSystems(): Promise<IncidentSystem[]> {
    const res = await api.get('/irregularities/systems/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
  async createSystem(data: Partial<IncidentSystem>): Promise<IncidentSystem> {
    const res = await api.post('/irregularities/systems/', data);
    return res.data;
  },
  async updateSystem(id: number, data: Partial<IncidentSystem>): Promise<IncidentSystem> {
    const res = await api.patch(`/irregularities/systems/${id}/`, data);
    return res.data;
  },
  async deleteSystem(id: number): Promise<void> {
    await api.delete(`/irregularities/systems/${id}/`);
  },

  // Organs
  async getOrgans(): Promise<ResponsibleOrgan[]> {
    const res = await api.get('/irregularities/organs/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
  async createOrgan(data: Partial<ResponsibleOrgan>): Promise<ResponsibleOrgan> {
    const res = await api.post('/irregularities/organs/', data);
    return res.data;
  },
  async updateOrgan(id: number, data: Partial<ResponsibleOrgan>): Promise<ResponsibleOrgan> {
    const res = await api.patch(`/irregularities/organs/${id}/`, data);
    return res.data;
  },
  async deleteOrgan(id: number): Promise<void> {
    await api.delete(`/irregularities/organs/${id}/`);
  }
};
"""
with open('frontend/src/services/irregularityApiService.ts', 'w') as f:
    f.write(api_code)

