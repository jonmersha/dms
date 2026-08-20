import api from '../api/axios';
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
      const response = await api.get('/api/irregularities/reports/');
      return Array.isArray(response.data) ? response.data : (response.data?.results || []);
    } catch (e) {
      console.warn('[API ERROR] Failed to fetch irregularities', e);
      return [];
    }
  },

  async createReport(data: Partial<IrregularityReport>): Promise<IrregularityReport> {
    const response = await api.post('/api/irregularities/reports/', data);
    return response.data;
  },

  async updateReport(id: number, data: Partial<IrregularityReport>): Promise<IrregularityReport> {
    const response = await api.patch(`/api/irregularities/reports/${id}/`, data);
    return response.data;
  },

  async deleteReport(id: number): Promise<void> {
    await api.delete(`/api/irregularities/reports/${id}/`);
  },

  // Categories
  async getCategories(): Promise<IncidentCategory[]> {
    const res = await api.get('/api/irregularities/categories/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
  async createCategory(data: Partial<IncidentCategory>): Promise<IncidentCategory> {
    const res = await api.post('/api/irregularities/categories/', data);
    return res.data;
  },
  async updateCategory(id: number, data: Partial<IncidentCategory>): Promise<IncidentCategory> {
    const res = await api.patch(`/api/irregularities/categories/${id}/`, data);
    return res.data;
  },
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/irregularities/categories/${id}/`);
  },

  // Systems
  async getSystems(): Promise<IncidentSystem[]> {
    const res = await api.get('/api/irregularities/systems/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
  async createSystem(data: Partial<IncidentSystem>): Promise<IncidentSystem> {
    const res = await api.post('/api/irregularities/systems/', data);
    return res.data;
  },
  async updateSystem(id: number, data: Partial<IncidentSystem>): Promise<IncidentSystem> {
    const res = await api.patch(`/api/irregularities/systems/${id}/`, data);
    return res.data;
  },
  async deleteSystem(id: number): Promise<void> {
    await api.delete(`/api/irregularities/systems/${id}/`);
  },

  // Organs
  async getOrgans(): Promise<ResponsibleOrgan[]> {
    const res = await api.get('/api/irregularities/organs/');
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },
  async createOrgan(data: Partial<ResponsibleOrgan>): Promise<ResponsibleOrgan> {
    const res = await api.post('/api/irregularities/organs/', data);
    return res.data;
  },
  async updateOrgan(id: number, data: Partial<ResponsibleOrgan>): Promise<ResponsibleOrgan> {
    const res = await api.patch(`/api/irregularities/organs/${id}/`, data);
    return res.data;
  },
  async deleteOrgan(id: number): Promise<void> {
    await api.delete(`/api/irregularities/organs/${id}/`);
  }
};
