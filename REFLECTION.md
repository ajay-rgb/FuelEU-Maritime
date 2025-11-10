# Reflection: AI-Assisted Development Experience

## Introduction

When I started this FuelEU Maritime project, I was honestly a bit skeptical about how much AI could really help with something this complex. Maritime regulations, hexagonal architecture, full-stack development - these aren't trivial things. But I decided to lean into it and document the entire experience. Here's what I learned.

---

## The Good: Where AI Really Shined

### 1. The "Boring" Stuff Was Effortless

Let me be honest - nobody enjoys writing boilerplate. Setting up Express routes, creating Prisma models, scaffolding React components... it's necessary but tedious. This is where AI absolutely crushed it.

**Real Example**:
After creating my first repository (RouteRepository), I simply told Copilot: "Create ComplianceRepository following the same pattern." Boom. Done. Perfect structure, consistent naming, proper TypeScript types. What would've taken me 20 minutes took 30 seconds.

**Time saved**: Probably 3-4 hours total on boilerplate alone.

### 2. Learning New Patterns Faster

I'd heard about hexagonal architecture but never actually implemented it. AI became like a patient mentor:
- Showed me how to separate domain logic from infrastructure
- Explained the ports/adapters pattern through generated code
- Helped me understand dependency injection by example

**Insight**: AI doesn't just write code for you - it teaches you patterns through implementation.

### 3. Problem-Solving Partner

When my PostgreSQL installation failed on Windows, I was ready to spend hours troubleshooting. Instead, I asked AI for alternatives. It suggested Supabase, Neon, and Railway. I picked Supabase, and 15 minutes later I had a working database.

When Tailwind CSS threw an ES module error, AI knew immediately it was a PostCSS config issue and suggested migrating to Tailwind v4. Problem solved.

**Lesson**: AI's knowledge base is vast. It's seen these problems before.

---

## The Reality Check: Where I Had to Step In

### 1. Business Logic Required My Brain

Here's the thing - AI can write code that *looks* right, but sometimes the logic is subtly wrong.

**Example: Pooling Algorithm**

The AI-generated pooling algorithm had this code:
```typescript
deficit.adjustedCB += transfer; // Mutating in loop!
```

This worked... sort of. But it caused state mutation bugs that were hard to track. I had to refactor it to use immutable patterns with a separate allocations map.

**Takeaway**: For complex business logic, AI gives you a 70% solution. You need domain knowledge to get to 100%.

### 2. Regulation Details Needed Human Verification

AI didn't know that FuelEU's reference value is 91.16 gCO2eq/MJ. It didn't know about the 2% reduction for 2025, or the 5-decimal precision requirement. I had to provide these specifics.

**Formula Verification Process**:
1. AI generated initial calculation
2. I checked against regulation PDF
3. Created test cases with known values
4. Fixed edge cases (negative CB, rounding)

**Lesson**: AI is a junior developer. You're still the architect who needs to verify everything.

### 3. Testing Was Still On Me

AI wrote "happy path" tests:
```typescript
it('should calculate compliance balance', () => {
  const cb = service.calculate(validRoute);
  expect(cb).toBeDefined();
});
```

But what about edge cases? What if fuel consumption is zero? What if someone tries to bank negative CB? I had to think through these scenarios myself.

**Reality**: AI tests the obvious. You test the tricky stuff.

---

## Honest Time Breakdown

| What I Did | If Solo | With AI | Difference |
|------------|---------|---------|------------|
| Project setup & config | 2 hours | 15 min | **87% faster** |
| Backend architecture | 6 hours | 1 hour | **83% faster** |
| React components | 4 hours | 1 hour | **75% faster** |
| Business logic | 3 hours | 2.5 hours | **16% faster** |
| Testing & validation | 3 hours | 2.5 hours | **16% faster** |
| Troubleshooting setup issues | 3 hours | 1.5 hours | **50% faster** |
| **Total** | **21 hours** | **~7.5 hours** | **~64% faster** |

**The Nuance**: AI saved massive time on infrastructure and boilerplate, moderate time on business logic, but testing still required significant effort.

---

## What Surprised Me

### 1. AI Understood Context Remarkably Well

After establishing patterns early, AI would suggest code that fit perfectly into the existing architecture. It "got" that we were using dependency injection, it remembered interface names, it matched coding style.

**Mind-Blown Moment**: I wrote a comment "// Validate pool rules from Article 21" and Copilot auto-completed the validation logic with the correct constraints (Σ CB ≥ 0, deficit ships can't worsen, etc.). It somehow inferred the requirements from context.

### 2. Prompt Quality Matters Way More Than I Thought

**Bad Prompt** (my first attempt):
> "Create a service for compliance"

**Result**: Generic code with loose types and missing methods.

**Good Prompt** (after I learned):
> "Create ComplianceService implementing IComplianceService. Use formula CB = (target - actual) × energy. Target varies by year (2025: 89.3368, 2030: 85.6904). Round to 5 decimals."

**Result**: Nearly production-ready code.

**Lesson**: Treat AI like a new team member - give context, be specific, reference existing patterns.

### 3. AI Can Adapt to Problems

When PostCSS failed, Tailwind threw errors, and my database wouldn't connect - AI didn't just give up. It suggested alternatives, explained trade-offs, and helped me pick solutions. This wasn't just code generation; it was problem-solving collaboration.

---

## What I'd Do Differently Next Time

### 1. Write Tests First

I let AI generate code, then wrote tests. This was backwards. Next time:
1. Define test scenarios first
2. Let AI implement code to pass tests
3. Validate business logic against specs

This would catch logic errors earlier.

### 2. Start with a "Pattern Library"

After realizing AI replicates patterns perfectly, I should've started by creating one perfect example of each pattern (repository, service, controller) with comments explaining the architecture. Then AI could've replicated these consistently.

### 3. Use AI for Documentation Too

I wrote most documentation manually. But AI could've generated:
- API endpoint documentation from route definitions
- JSDoc comments from TypeScript interfaces
- Setup guides from package.json scripts

**Missed Opportunity**: I did documentation as an afterthought instead of having AI generate it alongside code.

---

## Honest Takeaways

### AI is NOT a Replacement

You still need to:
- Understand the domain and business requirements
- Make architectural decisions
- Verify logic against specifications
- Think through edge cases
- Review and refactor code

### AI IS a Massive Accelerator

What it's exceptional at:
- Generating boilerplate and repetitive code
- Replicating established patterns
- Suggesting solutions to common problems
- Providing code examples and documentation
- Reducing context-switching (it remembers your patterns)

### The New Skill: AI Collaboration

Software development with AI is becoming less about "writing every line" and more about:
- **Architecting**: Making high-level structural decisions
- **Guiding**: Writing good prompts with context
- **Validating**: Reviewing AI output critically
- **Refining**: Iterating on generated code

---

## Final Thought

Building this FuelEU platform took me ~7.5 hours with AI. Solo, I estimate 20-25 hours minimum. That's not just a time saving - it fundamentally changed how I worked.

Instead of getting bogged down in boilerplate, I spent time on what matters:
- Understanding FuelEU regulations deeply
- Designing a clean architecture
- Validating calculations were correct
- Ensuring edge cases were handled

AI didn't replace my expertise - it amplified it. I went from "code writer" to "code architect", focusing on the interesting problems while AI handled the mechanical parts.

**Would I do it again?** Absolutely. But now I know: AI is a powerful tool, not a magic wand. Use it wisely, verify everything, and remember - you're still the one responsible for the final product.

---

**Project**: FuelEU Maritime Compliance Platform  
**Date**: November 10, 2025  
**Development Time**: 7.5 hours (estimated 20-25 hours without AI)  
**Complexity**: High (maritime regulations, hexagonal architecture, full-stack)  
**AI Tools**: GitHub Copilot, Claude Code, Cursor IDE  
**Final Verdict**: AI is a game-changer for accelerating development, but human expertise remains essential for quality and correctness.

---
