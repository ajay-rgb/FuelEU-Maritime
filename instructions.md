# FuelEU Maritime Compliance Platform - Project Context

## Executive Summary
Build a full-stack FuelEU Maritime compliance platform with React/TypeScript frontend and Node.js/PostgreSQL backend using hexagonal architecture. Focus on compliance balance (CB) calculations, banking, pooling, and route management.

## Core Business Logic

### 1. Compliance Balance Formula (Annex IV Part A)
```
CB [gCO2eq] = (GHGIEtarget - GHGIEactual) × [Σ(Mi × LCVi) + ΣEk]

Where:
- GHGIEtarget: Target GHG intensity (2025: 89.3368 gCO2eq/MJ)
- GHGIEactual: Actual weighted average GHG intensity
- Mi: Mass of fuel i (tonnes)
- LCVi: Lower calorific value (MJ/g)
- Ek: OPS electricity (MJ)

Positive CB = Surplus, Negative CB = Deficit
```

### 2. GHG Intensity Calculation
```
GHGIEactual = Σ(Mi × GHGi × LCVi) / Σ(Mi × LCVi × RWDi)

GHGi = WtT + TtW emissions
- WtT: Well-to-tank (upstream)
- TtW: Tank-to-wake (combustion + slip)
- RWDi: Reward factor (2 for RFNBOs 2025-2033, else 1)
```

### 3. Key Fuel Types & Default Values
**Fossil Fuels** (from Annex II):
- HFO: WtT=13.5, TtW≈78.24, Total≈91.74 gCO2eq/MJ
- MDO/MGO: WtT=14.4, TtW≈76.37, Total≈90.77
- LNG (Otto MS): WtT=18.5, TtW≈70.70, slip=3.1%

**Biofuels**: E value from PoS, WtT = E - (CfCO2/LCV)

**RFNBOs/e-fuels**: WtT = E - eu, RWD=2 (2025-2033)

### 4. Banking & Pooling Rules

**Banking:**
- Store positive CB for future use
- No expiration
- Per ship

**Borrowing:**
- Max 2% × GHGIEtarget × Energy
- Repay with 10% aggravation next year
- Not allowed for 2 consecutive years

**Pooling:**
- Σ(Adjusted CB) ≥ 0 required
- Deficit ships cannot exit worse
- Surplus ships cannot exit negative
- Greedy allocation: sort by CB desc, transfer surplus to deficits

## Database Schema (PostgreSQL)

```sql
-- Core tables
routes: id, route_id, vessel_type, fuel_type, year, ghg_intensity, 
        fuel_consumption, distance, total_emissions, is_baseline

ship_compliance: id, ship_id, year, cb_gco2eq, ghgie_actual, 
                 ghgie_target, energy_scope_mj

bank_entries: id, ship_id, year, amount_gco2eq, created_at

pools: id, year, total_cb_before, total_cb_after, created_at

pool_members: pool_id, ship_id, cb_before, cb_after
```

## API Endpoints (RESTful)

### Routes
- `GET /routes` - List all with filters (vesselType, fuelType, year)
- `POST /routes/:id/baseline` - Set baseline
- `GET /routes/comparison` - Baseline vs others with compliance flags

### Compliance
- `GET /compliance/cb?shipId&year` - Calculate & return CB
- `GET /compliance/adjusted-cb?shipId&year` - CB after banking

### Banking
- `GET /banking/records?shipId&year` - List bank entries
- `POST /banking/bank` - Bank positive CB
- `POST /banking/apply` - Apply banked surplus (validate ≤ available)

### Pooling
- `POST /pools` - Create pool
  - Validate: Σ CB ≥ 0
  - Enforce deficit/surplus rules
  - Return cb_after per member

## Frontend Structure (React + Tailwind)

### 4 Main Tabs

**1. Routes Tab**
- Table: routeId, vesselType, fuelType, year, ghgIntensity, fuelConsumption, distance
- "Set Baseline" button per row
- Filters: vessel type, fuel type, year

**2. Compare Tab**
- Fetch `/routes/comparison`
- Target: 89.3368 gCO2eq/MJ (2% below 91.16)
- Table: baseline vs comparison, % diff, ✅/❌ compliant
- Chart: bar/line comparing GHG intensities

**3. Banking Tab**
- Display current CB via `/compliance/cb?year=YYYY`
- "Bank Surplus" button (disabled if CB ≤ 0)
- "Apply Banked" button with amount input
- Show: cb_before, applied, cb_after

**4. Pooling Tab**
- Fetch `/compliance/adjusted-cb?year=YYYY` for multiple ships
- Select ships for pool
- Display: ship list with before/after CBs, pool sum indicator
- "Create Pool" button (disabled if invalid)
- Validation: Σ CB ≥ 0, deficit/surplus rules

## Hexagonal Architecture

```
src/
  core/
    domain/          # Entities: Route, ComplianceBalance, BankEntry, Pool
    application/     # Use cases: CalculateCB, CreatePool, BankSurplus
    ports/           # Interfaces: IRouteRepository, IComplianceService
  
  adapters/
    inbound/
      http/          # Express routes/controllers
    outbound/
      postgres/      # Repository implementations
    
  infrastructure/
    db/              # Prisma/Knex setup
    server/          # Express app config
```

## Key Calculations to Implement

### 1. ComputeComplianceBalance Use Case
```typescript
// Input: shipId, year
// 1. Fetch fuel consumption data
// 2. Calculate GHGIEactual (weighted average)
// 3. Get GHGIEtarget for year
// 4. Calculate CB = (target - actual) × energy
// 5. Store in ship_compliance
```

### 2. CreatePool Use Case
```typescript
// Input: poolMembers[] with shipId, year
// 1. Fetch adjusted CB for each ship
// 2. Validate: Σ CB ≥ 0
// 3. Sort by CB descending
// 4. Greedy allocation:
//    - While deficit exists and surplus available:
//      - Transfer from highest surplus to highest deficit
//      - Respect rules (deficit can't worsen, surplus can't go negative)
// 5. Store pool and members with cb_after
```

### 3. BankSurplus Use Case
```typescript
// Input: shipId, year, amount
// 1. Fetch CB for ship/year
// 2. Validate: CB > 0 and amount ≤ CB
// 3. Insert into bank_entries
// 4. Return success
```

## Seed Data (5 Routes)
```
R001: Container, HFO, 2024, 91.0, 5000t, 12000km
R002: BulkCarrier, LNG, 2024, 88.0, 4800t, 11500km
R003: Tanker, MGO, 2024, 93.5, 5100t, 12500km
R004: RoRo, HFO, 2025, 89.2, 4900t, 11800km
R005: Container, LNG, 2025, 90.5, 4950t, 11900km
```

## Critical Implementation Notes

1. **No localStorage/sessionStorage** - Use React state or in-memory storage
2. **Rounding**: 5 decimal places for all calculations except final penalty (nearest integer)
3. **Energy calculation**: Energy [MJ] = fuel_mass [g] × LCV [MJ/g]
4. **Target values**: 2025-2029: 89.3368, 2030-2034: 85.6904 gCO2eq/MJ
5. **Penalty formula**: |CB| / (GHGIEactual × 41,000) × 2,400 EUR

## Testing Priorities

1. **Unit tests**: ComputeCB, CreatePool, BankSurplus, ApplyBanked
2. **Integration tests**: API endpoints with Supertest
3. **Edge cases**: 
   - Negative CB scenarios
   - Over-applying banked surplus
   - Invalid pool (Σ CB < 0)
   - Deficit/surplus rule violations

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js 18+, TypeScript, Express
- **Database**: PostgreSQL 14+
- **ORM**: Prisma or Knex
- **Testing**: Jest, Supertest

## Deliverables
1. Working `/frontend` and `/backend` folders
2. `AGENT_WORKFLOW.md` - AI agent usage log
3. `README.md` - Setup & run instructions
4. `REFLECTION.md` - AI efficiency learnings
5. Passing tests (`npm run test`)
6. Working demo (`npm run dev`)