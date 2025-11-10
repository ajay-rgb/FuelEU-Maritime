import { BorrowEntry, CreateBorrowDTO } from '../domain/BorrowEntry';

export interface IBorrowRepository {
  /**
   * Create a new borrow entry
   */
  create(entry: CreateBorrowDTO): Promise<BorrowEntry>;
  
  /**
   * Get borrow entry for a ship in a specific year
   */
  findByShipAndYear(shipId: string, year: number): Promise<BorrowEntry | null>;
  
  /**
   * Get all borrow entries for a ship
   */
  findByShip(shipId: string): Promise<BorrowEntry[]>;
  
  /**
   * Mark a borrow entry as repaid
   */
  markAsRepaid(id: string): Promise<BorrowEntry>;
  
  /**
   * Check if ship borrowed in previous year
   */
  borrowedInPreviousYear(shipId: string, currentYear: number): Promise<boolean>;
  
  /**
   * Get unpaid borrow entry from previous year
   */
  getUnpaidFromPreviousYear(shipId: string, currentYear: number): Promise<BorrowEntry | null>;
}
