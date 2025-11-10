# FuelEU Maritime Compliance Platform
![Uploading home.JPG…]()

A full-stack FuelEU Maritime compliance platform with React/TypeScript frontend and Node.js/PostgreSQL backend using hexagonal architecture.

## Features

- **Route Management**: Track and manage maritime routes with GHG intensity calculations
- **Compliance Calculations**: Automated compliance balance (CB) calculations based on FuelEU regulations
- **Banking System**: Bank surplus compliance credits for future use
- **Pooling Mechanism**: Create compliance pools with greedy allocation algorithm
- **Real-time Monitoring**: Track GHG emissions and compliance status

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Architecture**: Hexagonal (Ports & Adapters)
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## Project Structure

```
FuelEU-Maritime/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Seed data
│   ├── src/
│   │   ├── core/
│   │   │   ├── domain/            # Domain entities
│   │   │   ├── application/       # Use cases & services
│   │   │   └── ports/             # Interface definitions
│   │   ├── adapters/
│   │   │   ├── inbound/
│   │   │   │   └── http/          # Controllers & routes
│   │   │   └── outbound/
│   │   │       └── postgres/      # Repository implementations
│   │   └── infrastructure/
│   │       └── server/            # Express app setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── api/                   # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── README.md
├── AGENT_WORKFLOW.md
└── REFLECTION.md
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- **Either**: PostgreSQL 14+ **OR** Supabase account (recommended)

### Database Setup

#### Option 1: Supabase (Recommended - No local installation needed)

1. Create a free account at [supabase.com](https://supabase.com)

2. Create a new project:
   - Project name: `fueleu-maritime`
   - Database password: Choose a strong password (save it!)
   - Region: Choose closest to you
   - Plan: Free tier is sufficient

3. Get your connection string:
   - Go to **Settings** → **Database**
   - Find **Connection string** → **URI** → **Session mode**
   - Copy the connection string (it will look like):
     ```
     postgresql://postgres.PROJECT_REF:[YOUR-PASSWORD]@aws-region.pooler.supabase.com:5432/postgres
     ```

4. Replace `[YOUR-PASSWORD]` with your actual database password

#### Option 2: Local PostgreSQL

1. Download and install [PostgreSQL 14+](https://www.postgresql.org/download/)
2. Create a database named `fueleu_maritime`
3. Note your connection details (username, password, host, port)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database connection string:

   **For Supabase:**
   ```env
   DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-region.pooler.supabase.com:5432/postgres"
   PORT=3001
   NODE_ENV=development
   ```

   **For Local PostgreSQL:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fueleu_maritime?schema=public"
   PORT=3001
   NODE_ENV=development
   ```

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. Run database migrations:

   **For first-time setup (recommended):**
   ```bash
   npx prisma db push
   ```

   **OR for migration files (optional):**
   ```bash
   npm run prisma:migrate dev --name init
   ```

7. Seed the database:
   ```bash
   npm run prisma:seed
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Routes
- `GET /api/routes` - List all routes with optional filters
- `GET /api/routes/:id` - Get a specific route
- `POST /api/routes/:id/baseline` - Set a route as baseline
- `GET /api/routes/comparison` - Compare routes against baseline
- `POST /api/routes` - Create a new route

### Compliance
- `GET /api/compliance/cb?shipId=&year=` - Calculate compliance balance
- `GET /api/compliance/adjusted-cb?shipId=&year=` - Get adjusted CB after banking
- `GET /api/compliance/target?year=` - Get target GHG intensity for year

### Banking
- `GET /api/banking/records?shipId=&year=` - Get bank records
- `POST /api/banking/bank` - Bank surplus CB
- `POST /api/banking/apply` - Apply banked surplus

### Pooling
- `POST /api/pools` - Create a compliance pool
- `POST /api/pools/validate` - Validate pool configuration

### Borrowing
- `GET /api/borrowing/validate?shipId=xxx&year=2025` - Check borrowing eligibility
- `POST /api/borrowing/borrow` - Borrow deficit (max 2%, 10% aggravation)
- `GET /api/borrowing/history?shipId=xxx` - Get borrowing history

## Running Tests

### Backend Tests

**Run All Tests:**
```bash
cd backend
npm test -- --no-coverage
```

**Run Specific Tests:**
```bash
# Calculation utilities (10 tests - all passing ✓)
npm test -- --no-coverage calculations

# Service tests
npm test -- --no-coverage ComplianceService
npm test -- --no-coverage PoolingService

# Integration tests (requires database)
npm test -- --no-coverage integration
```

**Run with Coverage:**
```bash
npm test
```

**Watch Mode:**
```bash
npm run test:watch
```

**Test Status:**
- ✅ 10/10 Calculation utility tests (rounding, penalty, borrowing)
- ✅ 3/3 Pooling service tests
- ✅ 20+ Integration test scenarios (API endpoints)

## Key Features

### ✅ Complete Regulation Compliance
1. **Compliance Balance Calculation** (Annex IV Part A)
2. **GHG Intensity with WtT/TtW** (Annex I)
3. **Banking & Surplus Management** (Article 19)
4. **Pooling with Greedy Allocation** (Article 21)
5. **Borrowing Mechanism** (Article 20.3-20.5)
   - Max 2% borrowing limit
   - 10% aggravation on repayment
   - Two-year consecutive rule
6. **Penalty Calculation** (Annex IV Part B)
   - Formula: |CB| / (GHGIEactual × 41,000) × 2,400 EUR
   - Consecutive year multiplier
7. **5-Decimal Precision** (Regulation page 29)

## Key Formulas

### Compliance Balance (CB)
```
CB [gCO2eq] = (GHGIEtarget - GHGIEactual) × Energy[MJ]
```

### GHG Intensity
```
GHGIEactual = Σ(Mi × GHGi × LCVi) / Σ(Mi × LCVi × RWDi)
```

Where:
- `Mi`: Mass of fuel i (tonnes)
- `GHGi`: GHG emission factor (WtT + TtW)
- `LCVi`: Lower calorific value (MJ/g)
- `RWDi`: Reward factor (2 for RFNBOs, else 1)

### Target Values
- **2025-2029**: 89.3368 gCO2eq/MJ (2% reduction)
- **2030-2034**: 85.6904 gCO2eq/MJ (6% reduction)
- **2035-2039**: 79.2808 gCO2eq/MJ (13% reduction)
- **2040-2044**: 68.3700 gCO2eq/MJ (26% reduction)
- **2045-2049**: 57.4592 gCO2eq/MJ (37% reduction)
- **2050+**: 18.2320 gCO2eq/MJ (80% reduction)

## Development

### Building for Production

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Seed Data

The database is seeded with 5 sample routes:
- R001: Container ship, HFO, 2024
- R002: Bulk Carrier, LNG, 2024
- R003: Tanker, MGO, 2024
- R004: RoRo, HFO, 2025
- R005: Container, LNG, 2025

And 3 sample ships with compliance data (SHIP001, SHIP002, SHIP003).

## License

ISC

## Contributing

This is a demonstration project for FuelEU Maritime compliance calculations.
