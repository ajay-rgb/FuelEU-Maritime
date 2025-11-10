const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions?: number;
  isBaseline: boolean;
}

export interface ComplianceBalance {
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

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}

export interface BankBalance {
  shipId: string;
  totalBanked: number;
  entries: BankEntry[];
}

export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter?: number;
}

export interface PoolResult {
  poolId: string;
  year: number;
  totalCbBefore: number;
  totalCbAfter: number;
  members: PoolMember[];
  isValid: boolean;
  message?: string;
}

// Routes API
export const routesAPI = {
  getAll: async (filters?: { vesselType?: string; fuelType?: string; year?: number }) => {
    const params = new URLSearchParams();
    if (filters?.vesselType) params.append('vesselType', filters.vesselType);
    if (filters?.fuelType) params.append('fuelType', filters.fuelType);
    if (filters?.year) params.append('year', filters.year.toString());
    
    const response = await fetch(`${API_BASE_URL}/routes?${params}`);
    return response.json();
  },

  setBaseline: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/routes/${id}/baseline`, {
      method: 'POST',
    });
    return response.json();
  },

  getComparison: async () => {
    const response = await fetch(`${API_BASE_URL}/routes/comparison`);
    return response.json();
  },
};

// Compliance API
export const complianceAPI = {
  getComplianceBalance: async (shipId: string, year: number) => {
    const response = await fetch(
      `${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`
    );
    return response.json();
  },

  getAdjustedCB: async (shipId: string, year: number) => {
    const response = await fetch(
      `${API_BASE_URL}/compliance/adjusted-cb?shipId=${shipId}&year=${year}`
    );
    return response.json();
  },

  getTarget: async (year: number) => {
    const response = await fetch(`${API_BASE_URL}/compliance/target?year=${year}`);
    return response.json();
  },
};

// Banking API
export const bankingAPI = {
  getRecords: async (shipId: string, year?: number) => {
    const params = new URLSearchParams({ shipId });
    if (year) params.append('year', year.toString());
    
    const response = await fetch(`${API_BASE_URL}/banking/records?${params}`);
    return response.json();
  },

  bankSurplus: async (shipId: string, year: number, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipId, year, amount }),
    });
    return response.json();
  },

  applyBanked: async (shipId: string, year: number, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipId, year, amount }),
    });
    return response.json();
  },
};

// Pooling API
export const poolingAPI = {
  createPool: async (year: number, members: PoolMember[]) => {
    const response = await fetch(`${API_BASE_URL}/pools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, members }),
    });
    return response.json();
  },

  validatePool: async (members: PoolMember[]) => {
    const response = await fetch(`${API_BASE_URL}/pools/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members }),
    });
    return response.json();
  },
};
