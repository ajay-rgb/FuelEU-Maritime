import { BankEntry, CreateBankEntryDTO, BankBalance } from '../domain/BankEntry';

export interface IBankRepository {
  findByShipAndYear(shipId: string, year?: number): Promise<BankEntry[]>;
  
  create(entry: CreateBankEntryDTO): Promise<BankEntry>;
  
  getTotalBanked(shipId: string): Promise<number>;
  
  getBankBalance(shipId: string): Promise<BankBalance>;
  
  delete(id: string): Promise<void>;
}
