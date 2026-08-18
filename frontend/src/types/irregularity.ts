export interface IncidentCategory {
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
