# FuelEU Maritime Regulation - Key Extractions for Implementation

## 1. COMPLIANCE BALANCE FORMULA (Annex IV, Part A - p.26-27)

### Core Formula
```
Compliance Balance [gCO2eq] = (GHGIEtarget - GHGIEactual) × [Σ(Mi × LCVi) + ΣEk]

Where:
- GHGIEtarget: GHG intensity limit for the reporting period (gCO2eq/MJ)
- GHGIEactual: Yearly average GHG intensity of energy used onboard (gCO2eq/MJ)
- Mi: Mass of fuel type i consumed (grams)
- LCVi: Lower calorific value of fuel i (MJ/g)
- Ek: Electricity from OPS at connection point k (MJ)
```

### GHG Intensity Targets (Article 4.2, p.10)
```
Reference value: 91.16 gCO2eq/MJ

Year Range    | Reduction | Target (gCO2eq/MJ)
2025-2029     | -2%       | 89.33680
2030-2034     | -6%       | 85.69040
2035-2039     | -14.5%    | 77.94180
2040-2044     | -31%      | 62.90040
2045-2049     | -62%      | 34.64080
2050+         | -80%      | 18.23200
```

## 2. GHG INTENSITY CALCULATION (Annex I, p.10-14)

### Main Formula (Equation 1)
```
GHG intensity [gCO2eq/MJ] = fwind × (WtT + TtW)

Where:
- fwind: Wind-assisted propulsion reward factor (0.95-1.0)
- WtT: Well-to-Tank emissions
- TtW: Tank-to-Wake emissions
```

### WtT (Well-to-Tank) Calculation
```
WtT = Σ(Mi × CO2eqWtT,i × LCVi) / Σ(Mi × LCVi × RWDi + ΣEk)

Where:
- CO2eqWtT,i: WtT GHG emission factor from Annex II or PoS
- RWDi: Reward factor (2 for RFNBOs from 2025-2033, else 1)
```

### TtW (Tank-to-Wake) Calculation
```
TtW = Σ[Mi,j × ((1 - Cslip_j/100) × CO2eq,TtW,i,j + (Cslip_j/100) × CO2eq_TtW,slip,i,j)] 
      / Σ(Mi × LCVi × RWDi + ΣEk)

Where:
- Cslip_j: Non-combusted fuel coefficient (% of mass)
- CO2eq,TtW,i,j: TtW emissions of combusted fuel
- CO2eq_TtW,slip,i,j: TtW emissions of slipped fuel
```

### TtW Emission Factor (Equation 2)
```
CO2eq,TtW,i,j = CfCO2,j × GWPCO2 + CfCH4,j × GWPCH4 + CfN2O,j × GWPN2O

GWP100 values (from IPCC AR4):
- CO2: 1
- CH4: 25
- N2O: 298
```

## 3. FUEL-SPECIFIC CALCULATIONS

### Fossil Fuels
- **Use default values from Annex II ONLY**
- No PoS required

### Biofuels (p.17-21)
```
WtT CO2eq = E - (CfCO2 / LCV)

Where:
- E: Total GHG emissions from PoS (gCO2eq/MJ)
- Must achieve ≥70% GHG savings vs fossil comparator
- Cannot be from food/feed crops
```

### RFNBOs/e-fuels (p.21-25)
```
WtT CO2eq = E - eu

Where:
- E: Total GHG from PoS (gCO2eq/MJ)
- eu: Emissions from fuel in use (combustion)
- Reward factor RWD = 2 (2025-2033)
- Must achieve ≥70% savings (E ≤ 28.2 gCO2eq/MJ)
```

### Biomethane Special Cases (p.77-82)
- Can have NEGATIVE WtT emissions
- Example: E = -15 gCO2eq/MJ possible
- Still apply slip coefficients for TtW

## 4. PENALTY FORMULA (Annex IV, Part B - p.26-27)

### Base Penalty
```
FuelEU Penalty [EUR] = (|Compliance Balance| / (GHGIEactual × 41,000)) × 2,400

Where:
- 41,000 MJ/t: LCV of VLSFO (conversion factor)
- 2,400 EUR/t: Penalty rate per tonne VLSFO equivalent
```

### Consecutive Non-Compliance (Article 23.2)
```
Total Penalty = FuelEU Penalty × (1 + (n-1) × 0.10)

Where n = number of consecutive non-compliant reporting periods

Examples:
- Year 1 deficit: Penalty × 1.0
- Year 2 consecutive deficit: Penalty × 1.1
- Year 3 consecutive deficit: Penalty × 1.2
```

## 5. BANKING (Article 20, p.104-105)

### Rules
1. **Storage**: Positive compliance balance can be banked
2. **No expiration**: Banked surplus valid indefinitely
3. **Accumulative**: Surpluses accumulate over years
4. **Per ship**: Banking is ship-specific
5. **Voluntary**: Company decides to bank or not

### Process
```
Adjusted CB Year N = Initial CB Year N + Banked Surplus (N-1) - Aggravated ACS (N-1)

Where:
- Initial CB: Calculated per Annex IV Part A
- Banked Surplus: From previous periods
- Aggravated ACS: Borrowed amount × 1.1 (if borrowed previous year)
```

### Timeline
- **By 31 March Year N+1**: Adjusted CB calculated by verifier
- **1-30 April Year N+1**: Flexibility mechanism period
- **By 30 June Year N+1**: Banking must be registered in THETIS-MRV

## 6. BORROWING (Article 20.3-20.5, p.104-105)

### Limits
```
Maximum ACS = 2% × GHGIEtarget × Energy consumed

ACS (Advance Compliance Surplus) ≤ 2% × GHGIEtarget × Σ(Mi × LCVi + ΣEk)
```

### Restrictions
1. **Cannot borrow for 2 consecutive years**
2. **Cannot borrow if deficit > 2% limit**
3. **Must repay with 10% aggravation**

### Repayment
```
Aggravated ACS Year N = 1.1 × ACS Year N

Deducted from: Adjusted CB Year N+1
```

### Example Calculation
```
If energy consumed = 15,000 MJ in 2029:
Max ACS 2029 = 2% × 89.3368 × 15,000 = 26,801 gCO2eq

If borrowed 20,000 gCO2eq in 2029:
Repay in 2030: 20,000 × 1.1 = 22,000 gCO2eq
```

## 7. POOLING (Article 21, p.105-108)

### Requirements (Article 21.1)
1. **Positive sum**: Σ(Adjusted CB of all ships) ≥ 0
2. **No double pooling**: Ship can only be in one pool per year
3. **No borrowing + pooling**: Cannot combine in same year
4. **Valid DoC**: All ships must have valid FuelEU Document of Compliance

### Allocation Rules (Article 21.2)
```
For each ship in pool:
1. Deficit ships: CB_after ≥ CB_before (cannot exit worse)
2. Surplus ships: CB_after ≥ 0 (cannot exit negative)
3. Sum constraint: Σ(CB_after) ≥ 0
```

### Greedy Allocation Algorithm (p.106-107)
```
1. Sort ships by Adjusted CB (descending)
2. While (total_deficit > 0 AND total_surplus > 0):
   a. Take highest surplus ship
   b. Take highest deficit ship
   c. Transfer = min(surplus_available, deficit_needed)
   d. surplus_ship.CB -= Transfer
   e. deficit_ship.CB += Transfer
   f. Validate constraints after each transfer
3. Return final CB_after for each ship
```

### Example Pool Validation
```
Ship A: +200 gCO2eq (surplus)
Ship B: -30 gCO2eq (deficit)
Ship C: -50 gCO2eq (deficit)
Ship D: +10 gCO2eq (surplus)
Ship E: -100 gCO2eq (deficit)

Sum = +30 gCO2eq ✓ Valid pool (≥ 0)

Valid allocation example:
A: +200 → +30 (gave 170)
B: -30 → 0 (received 30)
C: -50 → 0 (received 50)
D: +10 → 0 (gave 10)
E: -100 → -80 (received 20)

Sum after = +30 - 30 = 0 ✓
E improved: -100 → -80 ✓
A still positive: +30 ✓
```

### Timeline
- **1-30 April Year N+1**: Pool creation window
- **By 30 April**: All pool allocations finalized
- **By 30 June**: Verified compliance balance confirmed

## 8. COMPLIANCE WORKFLOW (p.109-110)

### Annual Timeline
```
Year N          : Reporting Period (ship operations)
31 Jan Year N+1 : FuelEU Report submitted to verifier
31 Mar Year N+1 : Adjusted CB calculated by verifier
1-30 Apr Year N+1: Flexibility mechanisms (banking/borrowing/pooling)
30 Apr Year N+1 : Pool allocations finalized
1 Jun Year N+1  : Penalties calculated by administering state
30 Jun Year N+1 : Document of Compliance (DoC) issued
```

### States Flow
```
1. Initial CB calculated (Annex IV Part A)
2. Add: Previous Banked Surplus
3. Subtract: Aggravated ACS (if borrowed previous year)
4. = Adjusted CB

5. IF Adjusted CB < 0:
   - Option A: Join pool (if available)
   - Option B: Borrow (if eligible)
   - Option C: Pay penalty

6. IF Adjusted CB > 0:
   - Option A: Bank surplus
   - Option B: Join pool (share with others)
   - Option C: Don't bank (voluntary cancellation)

7. = Verified CB

8. IF Verified CB < 0:
   - Calculate penalty
   - Issue DoC after payment

9. IF Verified CB ≥ 0:
   - Issue DoC immediately
```

## 9. ADDITIONAL CHECKS & REVISIONS (Article 17.4, p.107-108)

### Administering State Powers
- Can audit any ship for previous 2 reporting periods
- Can revise compliance balance if errors found
- Retroactive pool invalidation possible

### Pool Invalidation Conditions
```
Pool becomes INVALID if:
1. Error found in ship's Adjusted CB after audit
2. Corrected sum of Adjusted CB < 0
3. Pool requirement 1 violated retroactively

Outcome:
- Affected ship pays penalty for corrected deficit
- Other ships' allocations remain valid (frozen)
- New DoC issued for affected ship only
```

## 10. KEY CONSTANTS & PARAMETERS

### Energy Conversion
```
- VLSFO LCV: 41,000 MJ/tonne (penalty calculation)
- Energy scope: Σ(Mi × LCVi) in MJ
```

### Fuel LCVs (Annex II, selected examples)
```
HFO: 0.0405 MJ/g = 40,500 MJ/tonne
LFO: 0.0410 MJ/g = 41,000 MJ/tonne
MDO/MGO: 0.0427 MJ/g = 42,700 MJ/tonne
LNG: 0.0491 MJ/g = 49,100 MJ/tonne
Methanol: 0.0199 MJ/g = 19,900 MJ/tonne
Ammonia: 0.0186 MJ/g = 18,600 MJ/tonne
Hydrogen: 0.1200 MJ/g = 120,000 MJ/tonne
```

### Default Slip Coefficients (Annex II)
```
HFO/MDO/MGO: 0%
LNG Otto MS: 3.1%
LNG Otto SS: 1.7%
LNG Diesel SS: 0.2%
LNG LBSI: 2.6%
Others: 0% (default if not listed)
```

## 11. ROUNDING RULES (p.29)

```
- All intermediate calculations: 5 decimal places
- GHG intensity: 5 decimals (gCO2eq/MJ)
- Compliance balance: 5 decimals (gCO2eq)
- Final penalty: Round to nearest integer (EUR)
- Do NOT round intermediate results
```

## 12. CRITICAL VALIDATION RULES

### Pool Creation
```typescript
// Validation checks before pool creation
1. Check: Σ(Adjusted_CB) ≥ 0
2. Check: No ship borrowed this year
3. Check: No ship in another pool
4. Check: All ships have valid DoC from last period
5. Check: All ships had ≥1 EEA port call in reporting period

// Allocation constraints
For each ship:
  IF CB_before < 0: CB_after ≥ CB_before
  IF CB_before ≥ 0: CB_after ≥ 0
  
Sum: Σ(CB_after) ≥ 0 (same as CB_before sum)
```

### Borrowing Validation
```typescript
// Check eligibility
1. Adjusted_CB < 0 (has deficit)
2. |Adjusted_CB| ≤ 2% × GHGIEtarget × Energy
3. Did NOT borrow previous year
4. Not in a pool this year

// Calculate ACS
ACS = |Adjusted_CB| // Must equal deficit exactly
Aggravated_ACS = ACS × 1.1 // For next year
```

### Banking Validation
```typescript
// Check eligibility
1. Verified_CB > 0 (has surplus)
2. Before 30 June of verification period
3. DoC not yet issued

// Store
Banked_Surplus[ship_id, year] = Verified_CB
Cumulative_Banked[ship_id] += Verified_CB
```
