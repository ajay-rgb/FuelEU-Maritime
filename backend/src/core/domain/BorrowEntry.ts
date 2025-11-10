/**
 * Borrow Entry Domain Model
 * Represents Advanced Compliance Surplus (ACS) borrowing
 */

export interface BorrowEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;        // Amount borrowed (ACS)
  aggravatedAmount: number;     // Amount to repay (ACS × 1.1)
  repaid: boolean;
  createdAt: Date;
}

export interface CreateBorrowDTO {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BorrowResult {
  success: boolean;
  message: string;
  entry?: BorrowEntry;
  aggravatedAmount?: number;
}

export interface BorrowValidation {
  canBorrow: boolean;
  reason?: string;
  maxAllowedACS?: number;
  borrowedLastYear?: boolean;
  deficitAmount?: number;
}
