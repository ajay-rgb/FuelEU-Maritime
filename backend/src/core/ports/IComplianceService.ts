import { 
  ComplianceBalance, 
  CreateComplianceBalanceDTO,
  ComplianceCalculationResult 
} from '../domain/ComplianceBalance';

export interface IComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;
  
  create(compliance: CreateComplianceBalanceDTO): Promise<ComplianceBalance>;
  
  update(id: string, data: Partial<ComplianceBalance>): Promise<ComplianceBalance>;
  
  delete(id: string): Promise<void>;
}

export interface IComplianceService {
  calculateComplianceBalance(shipId: string, year: number): Promise<ComplianceCalculationResult>;
  
  getAdjustedCB(shipId: string, year: number): Promise<number>;
  
  getTargetGHGIE(year: number): number;
}
