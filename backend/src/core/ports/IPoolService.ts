import { Pool, CreatePoolDTO, PoolResult } from '../domain/Pool';

export interface IPoolRepository {
  findById(id: string): Promise<Pool | null>;
  
  findByYear(year: number): Promise<Pool[]>;
  
  create(pool: CreatePoolDTO): Promise<Pool>;
  
  delete(id: string): Promise<void>;
}

export interface IPoolService {
  createPool(poolData: CreatePoolDTO): Promise<PoolResult>;
  
  validatePool(members: Array<{ shipId: string; cbBefore: number }>): {
    isValid: boolean;
    message?: string;
  };
}
