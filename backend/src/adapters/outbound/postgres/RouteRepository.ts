import { PrismaClient } from '@prisma/client';
import { IRouteRepository } from '../../core/ports/IRouteRepository';
import { Route, CreateRouteDTO } from '../../core/domain/Route';

export class RouteRepository implements IRouteRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    const where: any = {};
    
    if (filters?.vesselType) {
      where.vesselType = filters.vesselType;
    }
    if (filters?.fuelType) {
      where.fuelType = filters.fuelType;
    }
    if (filters?.year) {
      where.year = filters.year;
    }

    return this.prisma.route.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Route | null> {
    return this.prisma.route.findUnique({
      where: { id }
    });
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    return this.prisma.route.findUnique({
      where: { routeId }
    });
  }

  async findBaseline(): Promise<Route | null> {
    return this.prisma.route.findFirst({
      where: { isBaseline: true }
    });
  }

  async create(route: CreateRouteDTO): Promise<Route> {
    return this.prisma.route.create({
      data: route
    });
  }

  async update(id: string, data: Partial<Route>): Promise<Route> {
    return this.prisma.route.update({
      where: { id },
      data
    });
  }

  async setBaseline(id: string): Promise<Route> {
    // First, unset any existing baseline
    await this.prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false }
    });

    // Then set the new baseline
    return this.prisma.route.update({
      where: { id },
      data: { isBaseline: true }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.route.delete({
      where: { id }
    });
  }
}
