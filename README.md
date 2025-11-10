# FuelEU Maritime Compliance Platform

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
- PostgreSQL 14 or higher
- npm or yarn

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

4. Update the `.env` file with your PostgreSQL connection string:
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
   ```bash
   npm run prisma:migrate
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

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

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
