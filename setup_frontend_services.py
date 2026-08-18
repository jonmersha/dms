types_code = """export interface IrregularityReport {
  id: number;
  branchId: number;
  branchName?: string;
  reportedByName?: string;
  caseDescription: string;
  category: 'CASH_SHORTAGE' | 'FORGERY' | 'THEFT' | 'SYSTEM_GLITCH' | 'PROCESS_VIOLATION' | 'OTHER';
  discoveryTime: string; // ISO DateTime
  responsibleOrgan: string;
  involvedSystem?: string;
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

api_code = """import api from './api';
import type { IrregularityReport } from '../types/irregularity';

export const irregularityApiService = {
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
  }
};
"""

with open('frontend/src/services/irregularityApiService.ts', 'w') as f:
    f.write(api_code)

