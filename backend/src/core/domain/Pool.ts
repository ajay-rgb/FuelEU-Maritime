export interface Pool {
  id: string;
  year: number;
  totalCbBefore: number;
  totalCbAfter: number;
  createdAt?: Date;
  members?: PoolMember[];
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolDTO {
  year: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
  }>;
}

export interface PoolResult {
  poolId: string;
  year: number;
  totalCbBefore: number;
  totalCbAfter: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }>;
  isValid: boolean;
  message?: string;
}
