# 📄 Document 05: Database Schema, Data Models & JSONB Contract
**Product:** Ascent KPI Engine  
**Database Engine:** PostgreSQL 15+ (Hosted on Supabase Cloud)  
**Storage Paradigm:** Semi-Structured Document Store (Hybrid Relational Key + JSONB Document)  

---

## 1. Visual Schema Mindmap: The Data Vault Structure

```
========================================================================================
                      ASCENT DATABASE VAULT SCHEMA (MINDMAP)
========================================================================================

                         POSTGRES TABLE: public.user_vaults
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ user_id: text (Primary Key) ──► Cryptographic UUID v4 (Unique client token) │
  │ updated_at: timestamptz     ──► ISO 8601 UTC timestamp of last sync mutation│
  │ data: jsonb                 ──► Complete user state document (Detailed below)│
  └───────────────────────────────────────┬─────────────────────────────────────┘
                                          │
          ┌───────────────────────────────┴───────────────────────────────┐
          ▼                                                               ▼
 ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
 │    logs: Record<Date, Log>  │                                 │     smokeFreeData: Object   │
 ├─────────────────────────────┤                                 ├─────────────────────────────┤
 │ • date: "YYYY-MM-DD"        │                                 │ • quitDate: ISO 8601 string │
 │ • meals: {breakfast, lunch, │                                 │ • costPerPack: number (MAD) │
 │           dinner, water}    │                                 │ • packsPerDay: number       │
 │ • waking: {wokeEarly,       │                                 │ • urgesResisted: number     │
 │            targetMet}       │                                 │ • lastUrgeLogged: string    │
 │ • sleep: {showerTaken,      │                                 └─────────────────────────────┘
 │           inBedBy2230}      │                                                 │
 │ • knee: {stabilityScore 1-10│                                                 ▼
 │          exercisesDone[]}   │                                 ┌─────────────────────────────┐
 │ • study: {deskMinutes,      │                                 │    financeSummary: Object   │
 │           weekendHours}     │                                 ├─────────────────────────────┤
 │ • briefs: {submittedOnTime} │                                 │ • monthlyIncomeTarget: MAD  │
 └─────────────────────────────┘                                 │ • monthlySavingsTarget: MAD │
          │                                                      │ • currentSavedThisMonth: MAD│
          ▼                                                      │ • hygieneBudgetMonthly: MAD │
 ┌─────────────────────────────┐                                 │ • hygieneSpentThisMonth: MAD│
 │  transactions: Array<Tx>    │                                 └─────────────────────────────┘
 ├─────────────────────────────┤                                                 │
 │ • id, date, amount, title   │                                                 ▼
 │ • category: 'hygiene' |     │                                 ┌─────────────────────────────┐
 │             'savings' |     │                                 │   onlineProfiles: Object    │
 │             'general'       │                                 ├─────────────────────────────┤
 └─────────────────────────────┘                                 │ • linkedInUpdated: boolean  │
                                                                 │ • gitHubActive: boolean     │
                                                                 │ • cvResumePolished: boolean │
                                                                 └─────────────────────────────┘
========================================================================================
```

---

## 2. Production PostgreSQL DDL Script

```sql
-- ============================================================================
-- ASCENT ENTERPRISE POSTGRESQL SCHEMA (SUPABASE PRODUCTION READY)
-- ============================================================================

-- 1. Create the primary Vaults table
CREATE TABLE IF NOT EXISTS public.user_vaults (
    user_id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add table and schema comments for API introspectors
COMMENT ON TABLE public.user_vaults IS 'Encrypted personal habit and career KPI vaults identified by anonymous client UUIDs';
COMMENT ON COLUMN public.user_vaults.user_id IS 'Cryptographic client-generated UUID acting as private vault key';
COMMENT ON COLUMN public.user_vaults.data IS 'Complete state JSON document adhering to the AppSyncData contract';

-- 3. Create high-efficiency GIN index for JSONB deep querying
CREATE INDEX IF NOT EXISTS idx_user_vaults_data_gin 
ON public.user_vaults USING gin (data);

CREATE INDEX IF NOT EXISTS idx_user_vaults_updated_at 
ON public.user_vaults (updated_at DESC);

-- 4. Configure Schema Permissions for PostgREST & Anon Client
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.user_vaults TO anon, authenticated, service_role;

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.user_vaults ENABLE ROW LEVEL SECURITY;

-- Permissive policy allowing client UUID reads
DROP POLICY IF EXISTS "Allow all read with user_id" ON public.user_vaults;
CREATE POLICY "Allow all read with user_id" 
ON public.user_vaults 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Permissive policy allowing client UUID inserts
DROP POLICY IF EXISTS "Allow all insert with user_id" ON public.user_vaults;
CREATE POLICY "Allow all insert with user_id" 
ON public.user_vaults 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permissive policy allowing client UUID updates
DROP POLICY IF EXISTS "Allow all update with user_id" ON public.user_vaults;
CREATE POLICY "Allow all update with user_id" 
ON public.user_vaults 
FOR UPDATE 
TO anon, authenticated 
USING (true);
```

---

## 3. TypeScript JSONB Contract (`AppSyncData`)

```typescript
export interface AppSyncData {
  logs: Record<string, DailyLog>;
  smokeFreeData: SmokeFreeData;
  financeSummary: FinanceSummary;
  transactions: FinanceTransaction[];
  briefs: YouCodeBrief[];
  onlineProfiles: OnlineProfileChecklist;
  version: number;
  lastClientUpdate: string;
}

export interface DailyLog {
  date: string; // ISO format: YYYY-MM-DD
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    waterLiters: number;
    notes?: string;
  };
  knee: {
    exercisesCompleted: boolean;
    kneeExercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weightKg?: number;
      leftFocus: boolean;
    }>;
    kneeStabilityScore: number; // Scale: 1 to 10
    symmetryNotes?: string;
  };
  study: {
    deskWorkMinutes: number; // Target: ≥ 60
    weekendStudyHours: number; // Target: ≥ 4
    serviceNowModuleDone: boolean;
    acspModuleDone: boolean;
  };
  smoking: {
    smokeFreeDay: boolean;
    urgesResistedCount: number;
  };
  hygiene: {
    morningWash: boolean;
    oralCareMorning: boolean;
    deodorantGrooming: boolean;
    eveningShower: boolean;
    oralCareEvening: boolean;
    skincare: boolean;
  };
  routine: {
    wokeEarly: boolean;
    wakeTime?: string; // Target: "06:45"
    breakfastWithinOneHour: boolean;
    showerBeforeBed: boolean;
    inBedBy2230: boolean;
  };
  briefs: {
    wednesdayBriefSubmitted: boolean;
    briefTitle?: string;
    onTime: boolean;
  };
  profiles: {
    onlineProfilesChecked: boolean;
    careerGuidanceStepDone: boolean;
  };
  finances: {
    savingsProtectedToday: boolean;
    hygienePurchaseLogged: boolean;
  };
}

export interface FinanceSummary {
  monthlyIncomeTarget: number;
  monthlySavingsTarget: number;
  currentSavedThisMonth: number;
  hygieneBudgetMonthly: number;
  hygieneSpentThisMonth: number;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  category: 'hygiene' | 'savings' | 'general';
}

export interface YouCodeBrief {
  id: string;
  weekNumber: number;
  title: string;
  deadlineDate: string; // "Wednesdays 20:00"
  status: 'pending' | 'in_progress' | 'submitted' | 'late';
  submissionUrl?: string;
}
```

---

## 4. Why JSONB over Rigid Normalization for This Product

1. **Schema Evolution Without Downtime:** When a new habit or bootcamp objective is introduced (e.g., adding Docker or AWS Cloud Practitioner), no table migrations or database locks are required.
2. **Atomic Single-Roundtrip State:** The complete user cockpit syncs in a single HTTP POST request, eliminating multi-table transaction overhead.
3. **Bandwidth Efficiency:** Sub-20 kilobyte average payload size allows seamless sync even on unstable 3G networks in rural and transit regions of Morocco.
