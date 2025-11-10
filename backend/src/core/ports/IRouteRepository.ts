import { Route, CreateRouteDTO } from '../domain/Route';

export interface IRouteRepository {
  findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;
  
  findById(id: string): Promise<Route | null>;
  
  findByRouteId(routeId: string): Promise<Route | null>;
  
  findBaseline(): Promise<Route | null>;
  
  create(route: CreateRouteDTO): Promise<Route>;
  
  update(id: string, data: Partial<Route>): Promise<Route>;
  
  setBaseline(id: string): Promise<Route>;
  
  delete(id: string): Promise<void>;
}
