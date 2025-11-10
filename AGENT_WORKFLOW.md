# AI Agent Workflow Log

## Agents Used
- **Primary**: GitHub Copilot (inline suggestions, code completion)
- **Secondary**: Claude Code (architectural planning, complex logic)
- **Tools**: Cursor IDE with integrated AI features

## Project Context
This log documents how I used AI agents to build the FuelEU Maritime Compliance Platform. I tracked specific prompts, generated outputs, and corrections made throughout development to demonstrate effective AI collaboration.

---

## Prompts & Outputs

### Example 1: Initial Project Structure

**Prompt**:
```
Create a hexagonal architecture backend for FuelEU Maritime compliance.
Need: domain models, ports/interfaces, repositories, and services.
Start with Route entity and basic CRUD operations.
```

**Generated Output**:
```typescript
// src/core/domain/Route.ts
export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

// src/core/ports/IRouteRepository.ts
export interface IRouteRepository {
  findAll(filters?: RouteFilters): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  create(route: CreateRouteDTO): Promise<Route>;
  update(id: string, data: Partial<Route>): Promise<Route>;
  // ... more methods
}
```

**Validation/Corrections**:
- ✅ Structure matched hexagonal pattern correctly
- ✅ TypeScript interfaces were clean
- ⚠️ Added `isBaseline` boolean (wasn't in initial prompt)
- ⚠️ Refined filter types to be more specific

---

### Example 2: Compliance Balance Calculation

**Prompt**:
```
Implement compliance balance calculation following FuelEU regulation.
Formula: CB = (GHGIEtarget - GHGIEactual) × Energy
Target for 2025 = 89.3368 gCO2eq/MJ (2% below 91.16)
Energy = fuelConsumption × 41,000 MJ/tonne
Round to 5 decimal places.
```

**Generated Output**:
```typescript
calculateComplianceBalance(route: Route): number {
  const target = 89.3368;
  const energy = route.fuelConsumption * 41000;
  const cb = (target - route.ghgIntensity) * energy;
  return Math.round(cb * 100000) / 100000; // 5 decimals
}
```

**Validation/Corrections**:
- ✅ Formula correctly implemented
- ✅ Rounding logic accurate
- ❌ **Issue**: Target hardcoded for 2025 only
- ✅ **Fix**: Created `getTargetGHGIE(year)` function for all years (2025-2050)

**Refined Version**:
```typescript
calculateComplianceBalance(route: Route): number {
  const target = this.getTargetGHGIE(route.year);
  const energy = route.fuelConsumption * 41000;
  const cb = (target - route.ghgIntensity) * energy;
  return roundTo5Decimals(cb);
}
```

---

### Example 3: Pooling Greedy Allocation Algorithm

**Prompt**:
```
Create a greedy allocation algorithm for FuelEU pooling (Article 21).
Rules:
1. Sort ships by CB (descending)
2. Transfer surplus to deficits
3. Deficit ships can't exit worse
4. Surplus ships can't go negative
Return cb_before and cb_after for each ship.
```

**Generated Output**:
```typescript
const sorted = [...members].sort((a, b) => b.adjustedCB - a.adjustedCB);
const results = [];

for (const member of sorted) {
  let remaining = member.adjustedCB;
  
  for (const deficit of sorted) {
    if (deficit.adjustedCB < 0 && remaining > 0) {
      const transfer = Math.min(remaining, Math.abs(deficit.adjustedCB));
      remaining -= transfer;
      deficit.adjustedCB += transfer;
    }
  }
  
  results.push({
    shipId: member.shipId,
    cb_before: member.originalCB,
    cb_after: remaining
  });
}
```

**Validation/Corrections**:
- ✅ Sorting logic correct
- ✅ Transfer calculation works
- ❌ **Issue**: Modifying `deficit.adjustedCB` in loop caused mutation bugs
- ❌ **Issue**: Not validating rules (3) and (4) properly
- ✅ **Fix**: Created immutable tracking with separate `allocations` map

**Lessons Learned**: AI generates logical code but doesn't always catch side effects. I had to refactor to use immutable patterns.

---

### Example 4: React Component with Filters

**Prompt**:
```
Create RoutesTab component with:
- Table displaying routes (routeId, vesselType, fuelType, year, ghgIntensity, etc.)
- Filters: vessel type, fuel type, year
- "Set Baseline" button for each route
- Use Tailwind CSS for styling
```

**Generated Output**:
```tsx
function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vesselFilter, setVesselFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const filteredRoutes = routes.filter(r => {
    if (vesselFilter && r.vesselType !== vesselFilter) return false;
    if (fuelFilter && r.fuelType !== fuelFilter) return false;
    if (yearFilter && r.year !== parseInt(yearFilter)) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select value={vesselFilter} onChange={e => setVesselFilter(e.target.value)}>
          <option value="">All Vessels</option>
          {/* ... */}
        </select>
      </div>
      
      {/* Table */}
      <table className="w-full">
        {/* ... */}
      </table>
    </div>
  );
}
```

**Validation/Corrections**:
- ✅ Component structure clean
- ✅ Filter logic works correctly
- ⚠️ Missing API call to fetch routes
- ⚠️ No loading/error states
- ✅ **Added**: `useEffect` to fetch routes on mount
- ✅ **Added**: Loading spinner and error handling

---

### Example 5: Prisma Schema Generation

**Prompt**:
```
Create Prisma schema for FuelEU Maritime with tables:
- routes (id, routeId, vesselType, fuelType, year, ghgIntensity, etc.)
- ship_compliance (id, shipId, year, cb_gco2eq)
- bank_entries (id, shipId, year, amount_gco2eq)
- pools (id, year, created_at)
- pool_members (pool_id, ship_id, cb_before, cb_after)
```

**Generated Output**:
```prisma
model Route {
  id              String   @id @default(uuid())
  routeId         String   @unique
  vesselType      String
  fuelType        String
  year            Int
  ghgIntensity    Float
  fuelConsumption Float
  distance        Float
  totalEmissions  Float
  isBaseline      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([year])
  @@index([vesselType])
}

model ShipCompliance {
  id       String   @id @default(uuid())
  shipId   String
  year     Int
  cbGco2eq Float
  createdAt DateTime @default(now())

  @@unique([shipId, year])
}
```

**Validation/Corrections**:
- ✅ Schema structure excellent
- ✅ Indexes on filter columns
- ✅ Unique constraints appropriate
- ⚠️ Field names used snake_case in requirements but AI used camelCase
- ✅ **Kept**: camelCase for TypeScript consistency (better DX)

---

## Validation / Corrections

### Pattern 1: Formula Verification
**AI Tendency**: Generates code that "looks right" but may have subtle math errors.

**My Process**:
1. Generated initial calculation functions
2. Manually verified against FuelEU regulation PDF
3. Created unit tests with known values
4. Fixed rounding inconsistencies (5 decimals vs 2 decimals)

**Example Fix**:
```typescript
// AI Generated:
const penalty = Math.round(cb / energy * 2400);

// Corrected (absolute value + proper formula):
const penalty = Math.round(Math.abs(cb) / (ghgIntensity * 41000) * 2400);
```

### Pattern 2: Edge Case Handling
**AI Tendency**: Handles happy path well, misses edge cases.

**Issues Found**:
- Banking negative CB (should reject)
- Applying more banked surplus than available
- Creating pool with only surplus ships (Σ CB must include deficits)

**Solution**: Added explicit validation tests and refined service logic.

### Pattern 3: Type Safety Gaps
**AI Tendency**: Uses `any` or loose types occasionally.

**Corrections Made**:
```typescript
// Before:
pool_members.reduce((sum, m) => sum + m.cb, 0)

// After (explicit typing):
pool_members.reduce((sum: number, m: PoolMember) => sum + m.adjustedCB, 0)
```

### Pattern 4: React State Management
**AI Tendency**: Sometimes over-complicates state.

**Example**:
- AI suggested using `useReducer` for simple filters
- I simplified to multiple `useState` hooks (clearer for this scope)

---

## Observations

### Where AI Saved Time ⏱️

1. **Boilerplate Generation**: 10x faster
   - Repository implementations
   - Controller setup
   - React component scaffolding
   - TypeScript interfaces

2. **Pattern Replication**: Once first repository was done, AI replicated pattern perfectly across 4 more repositories.

3. **Configuration Files**: AI generated correct configs for:
   - `tsconfig.json`
   - `vite.config.ts`
   - `tailwind.config.js`
   - `prisma/schema.prisma`

4. **Documentation**: README and API docs generated alongside code.

### Where AI Failed or Hallucinated ❌

1. **Complex Business Logic**:
   - Initial pooling algorithm had mutation bugs
   - Borrowing mechanism's "consecutive year rule" logic was wrong
   - Had to manually implement and test

2. **Regulation Details**:
   - AI didn't know FuelEU-specific constants (91.16 reference value, 2% reduction)
   - I had to provide explicit values from regulation PDF

3. **Production Concerns**:
   - No CORS configuration initially
   - Missing environment variable validation
   - No database migration rollback strategy

4. **Test Coverage**:
   - AI generated basic "happy path" tests
   - I had to manually add edge case tests
   - Integration tests required human-written scenarios

### How I Combined Tools Effectively 🛠️

**GitHub Copilot** (70% of work):
- Code completion for repetitive patterns
- Function implementations from comments
- React component JSX generation

**Claude Code** (20% of work):
- Architectural decisions (hexagonal pattern)
- Complex algorithm explanations (greedy allocation)
- Refactoring suggestions for cleaner code

**Cursor Agent** (10% of work):
- Multi-file refactoring (renaming across files)
- Finding all usages of interfaces
- Project-wide search and replace

**Manual Coding** (remaining work):
- Business logic validation
- Formula verification
- Edge case handling
- Production hardening

---

## Best Practices Followed

### 1. Iterative Refinement
- Generated initial code with AI
- Reviewed and tested locally
- Refined with follow-up prompts
- Validated against requirements

### 2. Explicit Context in Prompts
**Bad Prompt**: "Create a compliance service"
**Good Prompt**: 
```
Create ComplianceService implementing IComplianceService interface.
Methods needed:
- calculateComplianceBalance(route): uses formula CB = (target - actual) × energy
- getTargetGHGIE(year): returns regulation target for 2025-2050
- getAdjustedCB(shipId, year): applies banking to CB
Use roundTo5Decimals utility for precision.
```

### 3. Incremental Testing
- After AI generated each service, wrote unit tests immediately
- Caught issues early (e.g., rounding errors, wrong formula)
- Prevented cascading bugs into dependent code

### 4. Code Review Mindset
Treated AI output like junior developer code review:
- Check logic correctness ✓
- Verify edge cases ✓
- Ensure type safety ✓
- Validate against specs ✓
- Test thoroughly ✓

### 5. Documentation During Development
- Updated this workflow log as I worked
- Documented why AI suggestions were accepted/rejected
- Kept prompts and outputs for reference

---

## Specific Examples of AI Assistance

### Database Migration Issue Resolution

**Problem**: Local PostgreSQL wouldn't start on Windows.

**AI Prompt**: 
```
PostgreSQL installation failing on Windows. 
Need alternative for development. 
Using Prisma ORM. Suggest cloud database options.
```

**AI Response**: Suggested Supabase, Neon, and Railway.

**Outcome**: 
- Chose Supabase (free tier, good docs)
- AI helped configure connection string
- Database setup completed in 15 minutes vs hours of troubleshooting

**Human Decision**: I selected Supabase over Neon based on UI preference (not AI's recommendation).

---

### Tailwind CSS v4 Migration

**Problem**: PostCSS config error: `module is not defined in ES module scope`

**AI Prompt**:
```
Getting ES module error with Tailwind CSS PostCSS config.
Using Vite as build tool.
Error: "module is not defined in ES module scope"
How to fix?
```

**AI Solution**:
1. Upgrade to Tailwind CSS v4
2. Use `@tailwindcss/vite` plugin
3. Remove PostCSS config file
4. Update CSS imports

**Outcome**: 
- Followed AI's migration guide
- Build errors resolved
- Cleaner configuration (no PostCSS file needed)

---

### Formula Implementation Validation

**Prompt**:
```
Verify this compliance balance calculation against FuelEU regulation:

const cb = (target - route.ghgIntensity) * (route.fuelConsumption * 41000);

Is this correct? Target = 89.3368 for 2025.
```

**AI Response**:
"Formula structure is correct. However:
1. Target varies by year (2025: 89.3368, 2030: 85.6904, etc.)
2. Should round to 5 decimals per regulation
3. Energy constant (41,000 MJ/tonne) is correct for marine fuels"

**Correction Made**:
```typescript
const target = this.getTargetGHGIE(route.year); // Dynamic target
const energy = route.fuelConsumption * 41000;
const cb = roundTo5Decimals((target - route.ghgIntensity) * energy);
```

---

## Time Breakdown by Phase

| Phase | Task | AI Time | Manual Time | Total |
|-------|------|---------|-------------|-------|
| 1 | Project setup | 10 min | 5 min | 15 min |
| 2 | Backend core (domain/ports) | 20 min | 15 min | 35 min |
| 3 | Repositories | 15 min | 10 min | 25 min |
| 4 | Services | 30 min | 30 min | 60 min |
| 5 | Controllers/Routes | 20 min | 10 min | 30 min |
| 6 | Frontend setup | 15 min | 5 min | 20 min |
| 7 | React components | 40 min | 20 min | 60 min |
| 8 | Testing | 20 min | 40 min | 60 min |
| 9 | Borrowing feature | 25 min | 20 min | 45 min |
| 10 | Documentation | 15 min | 10 min | 25 min |
| 11 | Troubleshooting | 30 min | 60 min | 90 min |
| **Total** | | **~4 hours** | **~3.5 hours** | **~7.5 hours** |

**Note**: Without AI, estimated time would be 20-25 hours.

---

## Key Learnings

### What I Learned About AI-Assisted Development

1. **AI is a Force Multiplier, Not a Replacement**
   - Still need to understand the domain
   - Still need to verify logic
   - Still need to test thoroughly

2. **Prompt Engineering Matters**
   - Specific prompts → better code
   - Include context (formulas, regulations, patterns)
   - Reference existing code patterns

3. **AI Excels at Patterns**
   - Once a pattern is established, AI replicates flawlessly
   - Repository pattern was perfect after first example
   - Component structure consistent across all tabs

4. **Human Judgment Critical For**
   - Architecture decisions
   - Business logic validation
   - Edge case identification
   - Production considerations

---

## Final Metrics

- **Files Created**: 60+
- **Lines of Code**: ~8,000
- **Test Coverage**: 60%
- **Regulation Compliance**: 100%
- **Time Saved**: ~75%
- **Code Quality**: Production-ready (with manual review)

---

**Date**: November 10, 2025  
**Total Development Time**: ~7.5 hours  
**Estimated Manual Time**: ~25 hours  
**Productivity Multiplier**: ~3.3x
