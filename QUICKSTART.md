# Quick Start Guide

## Project Overview

The FuelEU Maritime Compliance Platform is now fully built with:
- ✅ Backend API with hexagonal architecture
- ✅ Frontend with React and Tailwind CSS
- ✅ Database schema with Prisma
- ✅ Seed data
- ✅ Basic tests
- ✅ Complete documentation

## Directory Structure

```
FuelEU-Maritime/
├── backend/          # Node.js/Express/TypeScript backend
├── frontend/         # React/TypeScript frontend
├── instructions.md   # Original project requirements
├── README.md         # Complete setup guide
├── AGENT_WORKFLOW.md # Development workflow log
└── REFLECTION.md     # AI efficiency analysis
```

## Next Steps

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Setup Database

1. Ensure PostgreSQL is running
2. Create a database: `createdb fueleu_maritime`
3. Copy `.env.example` to `.env` in backend folder
4. Update DATABASE_URL in `.env` with your PostgreSQL credentials
5. Run migrations:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on: http://localhost:3000

## Features Implemented

### 1. Routes Tab
- View all maritime routes
- Filter by vessel type, fuel type, year
- Set baseline route for comparisons

### 2. Compare Tab
- Compare routes against baseline
- Visual charts showing GHG intensities
- Compliance status indicators
- Target values display

### 3. Banking Tab
- Calculate compliance balance for ships
- Bank surplus credits
- Apply banked credits to deficits
- View banking history

### 4. Pooling Tab
- Select multiple ships for pool
- Validate pool eligibility
- Create pools with greedy allocation
- View before/after compliance balances

## API Endpoints

All endpoints are prefixed with `/api`:

- **Routes**: `/api/routes`
- **Compliance**: `/api/compliance/cb`, `/api/compliance/adjusted-cb`
- **Banking**: `/api/banking/bank`, `/api/banking/apply`
- **Pooling**: `/api/pools`

See README.md for complete API documentation.

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Sample Data

The database includes:
- 5 routes (R001-R005)
- 3 ships (SHIP001, SHIP002, SHIP003)
- Sample compliance and banking data

## Technology Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma
- Hexagonal Architecture

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts

## Key Files to Review

1. `backend/src/core/application/ComplianceService.ts` - Core compliance calculations
2. `backend/src/core/application/PoolingService.ts` - Pooling algorithm
3. `frontend/src/components/` - All UI components
4. `backend/prisma/schema.prisma` - Database schema

## Troubleshooting

**Database connection issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists

**Port conflicts:**
- Backend uses port 3001
- Frontend uses port 3000
- Change in .env or vite.config.ts if needed

**Prisma errors:**
- Run `npm run prisma:generate` after schema changes
- Run migrations: `npm run prisma:migrate`

## Documentation

- **README.md**: Complete setup and usage guide
- **AGENT_WORKFLOW.md**: Development process documentation
- **REFLECTION.md**: AI development efficiency analysis
- **instructions.md**: Original project requirements

## Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

**Happy coding!** 🚢

For questions or issues, refer to the detailed README.md or the original instructions.md file.
