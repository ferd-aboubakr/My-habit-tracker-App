# 📄 Document 03: Product Features, KPIs & Algorithmic Engine
**Product:** Ascent KPI Engine  
**Module:** Core Feature Catalog, Metrics Engine & Scoring Rules  

---

## 1. Visual Mindmap: The 12-Habit KPI Engine

```
========================================================================================
                      THE 12-HABIT KPI ENGINE (VISUAL MINDMAP)
========================================================================================

                                  [DAILY LOG RECORD]
                             Date (ISO 8601: YYYY-MM-DD)
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
[PILLAR 1: BIO & ENERGY]        [PILLAR 2: JOINT & BODY]       [PILLAR 3: CAREER & CODE]
┌───────────────────────────┐   ┌───────────────────────────┐  ┌───────────────────────────┐
│ #01 Eat full meals (3/3)  │   │ #03 Left knee muscle gain │  │ #02 Finish YouCode briefs │
│     Breakfast+Lunch+Dinner│   │     Stability (1-10) +    │  │     Wednesdays 20:00 limit│
│ #09 Wake early (06:45)    │   │     Single-leg rehab sets │  │ #11 ServiceNow & ACSP     │
│     Breakfast under 1 hour│   │ #05 Quit smoking          │  │     Weekend 4h lunch block│
│ #08 Sleep early (22:30) & │   │     Live ticker + urges   │  │ #12 Desk focus ≥1h daily  │
│     warm shower           │   │     resisted counter      │  │     Deep execution timer  │
│ #06 Complete daily hygiene│   │ #07 Monthly finances      │  │ #10 Professional profiles │
│     Oral, face, deodorant │   │     Guaranteed savings    │  │     LinkedIn, GitHub, CV  │
│                           │   │     min + hygiene budget  │  │ #04 Stable career roadmap │
└───────────────────────────┘   └───────────────────────────┘  └───────────────────────────┘
       │                                  │                                  │
       └──────────────────────────────────┼──────────────────────────────────┘
                                          ▼
                      =========================================
                      |       KPI COMPUTATION CORE            |
                      |  • Daily %: (Tasks Met / 12) * 100    |
                      |  • 30-Day Completion Moving Average   |
                      |  • Consecutive Active Streak Engine   |
                      |  • Moroccan Dirham Financial Health   |
                      =========================================
========================================================================================
```

---

## 2. Exhaustive Feature Matrix of the 12 Targeted Habits

| # | Habit Identifier | Strict Pass/Fail Verification Rule | Real-World Objective & Metric |
| :-: | :--- | :--- | :--- |
| **01** | `full_meals` | `breakfast == true && lunch == true && dinner == true` | Sustained cognitive stamina; eliminates afternoon hypoglycemia and brain fog. Hydration target: 2.5L. |
| **02** | `youcode_briefs` | `briefSubmittedOnTime == true` | Submitted before Wednesday 20:00 PM. Eliminates grade penalization and teaches corporate deadline rigor. |
| **03** | `knee_balance` | `kneeExercisesDone == true && kneeStabilityScore >= 7` | Eliminates unilateral left knee instability through targeted VMO single-leg squats, bulgarians, and TKE extensions. |
| **04** | `career_outlook` | `milestoneCompleted == true` | Systematic progression through 4 phases towards certified enterprise systems engineering positions. |
| **05** | `quit_smoking` | `smokeFreeDay == true` (Zero cigarettes) | Lung capacity restoration, oxygenated blood flow for studying, and instant capital savings calculated in MAD. |
| **06** | `hygiene_routine` | `morningTeeth && morningFace && deodorant` | High personal self-esteem, social confidence, and clean presentation for on-site bootcamp and interview environments. |
| **07** | `monthly_finances`| `currentSaved >= monthlySavingsTarget && hygieneSpent <= hygieneBudget` | Financial survival cushion protected; dedicated reserve for hygiene products without deficit. |
| **08** | `sleep_shower` | `showerTaken == true && inBedBy2230 == true` | Parasympathetic nervous system recovery, REM sleep optimization for algorithmic memory consolidation. |
| **09** | `wake_early_eat` | `wokeEarly == true && ateBreakfastQuickly == true` | Morning circadian anchoring: awake by 06:45 AM, nutritious breakfast consumed within 60 minutes. |
| **10** | `online_profiles`| `profilesReviewedWeekly == true` (Score ≥ 80%) | Constant market readiness: LinkedIn headline, clean GitHub repos, polished technical resume. |
| **11** | `weekend_study` | `weekendHoursLogged >= 4` on Saturdays & Sundays | 4-hour lunchtime intensive study (12:00–16:00) dedicated to ServiceNow CSA & Apple ACSP syllabi. |
| **12** | `desk_work` | `deskMinutesLogged >= 60` daily | Uninterrupted high-intensity desk execution (no notifications, single-task deep focus). |

---

## 3. Algorithmic Specifications & Scoring Formulas

### 3.1 Daily Completion Rate Algorithm
$$R_{day} = \text{round}\left( \frac{\sum_{i=1}^{12} S_i}{12} \times 100 \right)$$
Where $S_i \in \{0, 1\}$ represents the binary achievement status of Habit $i$ for the target date.

### 3.2 Consecutive Active Streak Algorithm
Let $L(t)$ be the log status on calendar day $t$, where $t=0$ is today, $t=1$ is yesterday, etc.
$$\text{Streak} = \begin{cases} 
0, & \text{if } S(t=0) = 0 \text{ and } S(t=1) = 0 \\
k, & \text{where } k = \max \{ m \mid \forall j \in [0, m-1], S(t=j) = 1 \} 
\end{cases}$$
*(If today's habits are still in progress, the engine evaluates from $t=1$ to protect unbroken chains until 23:59).*

### 3.3 Tobacco Financial Savings & Health Regeneration Formula
Let $D_{quit}$ be the timestamp of cessation, $C_{pack}$ be price in Moroccan Dirhams (default: 75 DH per premium pack), and $P_{day}$ be packs per day:
$$\text{Total Days Smoke-Free} = \frac{\text{Now} - D_{quit}}{86400000}$$
$$\text{Money Saved (MAD)} = \text{Total Days} \times P_{day} \times C_{pack}$$
$$\text{Cigarettes Avoided} = \text{Total Days} \times P_{day} \times 20$$

### 3.4 Left Knee Muscular Symmetry Score
The user logs stability $V_{stab} \in [1, 10]$ and checks rehabilitation exercises $E \in [0, 4]$.
$$\text{Knee Health Score} = (V_{stab} \times 0.6) + \left(\frac{E_{completed}}{4} \times 4.0\right)$$
- **Score $\ge 8.0$:** Excellent unilateral symmetry, ready for bilateral heavy loading.
- **Score $5.0 - 7.9$:** Moderate stabilization required; prioritize single-leg box squats.
- **Score $< 5.0$:** Warning: potential valgus collapse; perform isometric TKE extensions.

---

## 4. Feature Comparison: Community Edition vs. Enterprise Pro

| Feature Capability | Community Edition (Free) | Professional / Cohort Edition (Paid) |
| :--- | :---: | :---: |
| 12-Habit Core Cockpit | ✅ Full Access | ✅ Full Access |
| Client-Side UUID Anonymous Vault | ✅ Unlimited | ✅ Unlimited |
| LocalStorage Offline Engine | ✅ Yes | ✅ Yes |
| Real-time Supabase Cloud Sync | ✅ Pre-configured | ✅ Dedicated High-Bandwidth Instance |
| Moroccan MAD & Multi-Currency | ✅ MAD, EUR, USD | ✅ MAD, EUR, USD, XOF, CFA |
| Live Diagnostic Tester | ✅ In-App | ✅ In-App + API Webhooks |
| YouCode Wednesday Briefs Countdown | ✅ Yes | ✅ Calendar sync + GitHub PR alerts |
| ServiceNow CSA & ACSP Timers | ✅ Built-in | ✅ Official Exam Mock Questions |
| Bootcamp Cohort Admin Dashboard | ❌ No | ✅ B2B Multi-student analytics |
| Automated PDF Progress Reports | ❌ No | ✅ 1-Click Monthly Certificate |
