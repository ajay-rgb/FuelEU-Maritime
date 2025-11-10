export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt?: Date;
}

export interface CreateBankEntryDTO {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BankBalance {
  shipId: string;
  totalBanked: number;
  entries: BankEntry[];
}
