export interface ComplianceBalance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number;
  ghgieActual: number;
  ghgieTarget: number;
  energyScopeMj: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateComplianceBalanceDTO {
  shipId: string;
  year: number;
  cbGco2eq: number;
  ghgieActual: number;
  ghgieTarget: number;
  energyScopeMj: number;
}

export interface ComplianceCalculationResult {
  shipId: string;
  year: number;
  cbGco2eq: number;
  ghgieActual: number;
  ghgieTarget: number;
  energyScopeMj: number;
  isCompliant: boolean;
  surplus?: number;
  deficit?: number;
}
