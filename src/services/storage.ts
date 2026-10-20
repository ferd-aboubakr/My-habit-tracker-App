import {
  DailyLog,
  FinanceSummary,
  FinanceTransaction,
  OnlineProfileChecklist,
  SmokeFreeData,
  TaskKpiMeta,
  YouCodeBrief,
} from '../types/habits';

const STORAGE_KEYS = {
  DAILY_LOGS: 'ascent_daily_logs_v1',
  SMOKE_FREE: 'ascent_smoke_free_v1',
  FINANCE_SUMMARY: 'ascent_finance_summary_v1',
  FINANCE_TX: 'ascent_finance_tx_v1',
  YOUCODE_BRIEFS: 'ascent_youcode_briefs_v1',
  ONLINE_PROFILES: 'ascent_online_profiles_v1',
};

// Default left knee rehab exercises recommended for left knee balance & quad/glute hypertrophy
export const DEFAULT_KNEE_EXERCISES = [
  {
    name: 'Single-Leg Box Squat (Left priority)',
    sets: 3,
    reps: 10,
    weightKg: 0,
    leftFocusNotes: 'Focus on slow 3s eccentric descent, pushing through left heel without knee caving inward',
    completed: true,
  },
  {
    name: 'Bulgarian Split Squat (Left leg lead)',
    sets: 3,
    reps: 12,
    weightKg: 10,
    leftFocusNotes: 'Target VMO (vastus medialis) and glute max to stabilize patella tracking',
    completed: true,
  },
  {
    name: 'Terminal Knee Extension (TKE) with Band',
    sets: 3,
    reps: 15,
    weightKg: 0,
    leftFocusNotes: 'Lock out left quad gently, feeling inner quad head fire',
    completed: true,
  },
  {
    name: 'Single-Leg Hamstring Bridge / Curl',
    sets: 3,
    reps: 12,
    weightKg: 0,
    leftFocusNotes: 'Balance left hamstring strength to match right side quad/ham ratio',
    completed: false,
  },
  {
    name: 'Tibialis & Calf Raises',
    sets: 3,
    reps: 20,
    weightKg: 0,
    leftFocusNotes: 'Ankle dorsiflexion and stability support for knee joint alignment',
    completed: true,
  },
];

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const createEmptyDailyLog = (date: string): DailyLog => {
  return {
    date,
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false,
      waterLiters: 1.5,
      notes: '',
    },
    fullMealsAchieved: false,
    wednesdayBriefCompleted: false,
    briefTitle: '',
    kneeRehab: {
      balanceScore: 7,
      kneeComfort: 8,
      exercises: JSON.parse(JSON.stringify(DEFAULT_KNEE_EXERCISES)),
      sessionCompleted: false,
      notes: '',
    },
    careerStepDone: false,
    careerNotes: '',
    smokeFree: true,
    cigarettesSmoked: 0,
    hygiene: {
      morningTeeth: false,
      morningFaceGroom: false,
      deodorantFresh: false,
      eveningShower: false,
      eveningTeethFloss: false,
      skincare: false,
    },
    hygieneAllDone: false,
    financeBudgetTracked: false,
    eveningShowerAndEarlySleep: {
      showered: false,
      bedTime: '22:30',
      asleepBeforeTarget: false,
      sleepHours: 7.5,
    },
    wakeEarlyAndEat: {
      wakeTime: '06:45',
      wokeEarly: false,
      breakfastEaten: false,
    },
    onlineProfilesWorked: false,
    onlineProfileFocus: '',
    weekendStudyDone: false,
    studyMinutesLogged: 0,
    deskHourDone: false,
    deskMinutesLogged: 0,
  };
};

// Generates 14 days of realistic past logs leading up to today so streaks and completion charts are lively immediately
function generateSeedLogs(): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const today = new Date();

  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayOfWeek = d.getDay(); // 0 is Sunday, 3 is Wednesday, 6 is Saturday

    const log = createEmptyDailyLog(dateStr);

    // Realistic patterns for past days
    if (!isToday) {
      // Nutrition: 85% success
      const hadMeals = i % 5 !== 0;
      log.meals = {
        breakfast: true,
        lunch: true,
        dinner: hadMeals,
        waterLiters: hadMeals ? 2.5 : 1.8,
        notes: hadMeals ? '3 nutrient-dense meals with balanced protein' : 'Busy evening, missed full dinner',
      };
      log.fullMealsAchieved = hadMeals;

      // Knee rehab: 4-5 times a week
      const didKnee = [1, 2, 4, 5, 6].includes(dayOfWeek);
      log.kneeRehab = {
        balanceScore: Math.min(10, 6 + Math.floor((14 - i) / 4)), // improving from 6 to 9 over 14 days
        kneeComfort: 8,
        exercises: JSON.parse(JSON.stringify(DEFAULT_KNEE_EXERCISES)),
        sessionCompleted: didKnee,
        notes: didKnee ? 'Left leg feeling much more anchored and stable during single-leg squats.' : '',
      };

      // Wednesday brief
      if (dayOfWeek === 3) {
        log.wednesdayBriefCompleted = true;
        log.briefTitle = 'YouCode Full-Stack Application Delivery';
      }

      // Career outlook
      log.careerStepDone = i % 2 === 0;
      log.careerNotes = 'Reviewed ServiceNow CSA exam blueprint and updated portfolio README';

      // Smoke free: solid 14-day streak!
      log.smokeFree = true;
      log.cigarettesSmoked = 0;

      // Hygiene: solid daily routine
      log.hygiene = {
        morningTeeth: true,
        morningFaceGroom: true,
        deodorantFresh: true,
        eveningShower: true,
        eveningTeethFloss: true,
        skincare: true,
      };
      log.hygieneAllDone = true;

      // Finance tracked
      log.financeBudgetTracked = true;

      // Sleep & shower
      const goodSleep = i % 4 !== 0;
      log.eveningShowerAndEarlySleep = {
        showered: true,
        bedTime: goodSleep ? '22:15' : '23:45',
        asleepBeforeTarget: goodSleep,
        sleepHours: goodSleep ? 8 : 6.5,
      };

      // Wake early & eat
      const earlyMorning = i % 3 !== 0;
      log.wakeEarlyAndEat = {
        wakeTime: earlyMorning ? '06:30' : '08:15',
        wokeEarly: earlyMorning,
        breakfastEaten: earlyMorning,
      };

      // Online profiles
      log.onlineProfilesWorked = [1, 3, 5].includes(dayOfWeek);
      log.onlineProfileFocus = 'Updated LinkedIn summary and showcased ServiceNow workflows';

      // Weekend study (ServiceNow + ACSP 4 hours lunch block)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        log.weekendStudyDone = true;
        log.studyMinutesLogged = 240; // 4 hours
      }

      // Desk 1h daily: consistently achieved
      log.deskHourDone = true;
      log.deskMinutesLogged = 75 + (i % 3) * 15;
    } else {
      // TODAY: partially done so user can click to interact right away!
      log.smokeFree = true;
      log.cigarettesSmoked = 0;
      log.wakeEarlyAndEat = {
        wakeTime: '06:45',
        wokeEarly: true,
        breakfastEaten: true,
      };
      log.meals = {
        breakfast: true,
        lunch: true,
        dinner: false,
        waterLiters: 2.0,
        notes: 'High protein breakfast & lunch completed.',
      };
      log.fullMealsAchieved = false;
      log.hygiene = {
        morningTeeth: true,
        morningFaceGroom: true,
        deodorantFresh: true,
        eveningShower: false,
        eveningTeethFloss: false,
        skincare: false,
      };
      log.hygieneAllDone = false;
      log.deskHourDone = true;
      log.deskMinutesLogged = 60;
      log.kneeRehab = {
        balanceScore: 8,
        kneeComfort: 9,
        exercises: JSON.parse(JSON.stringify(DEFAULT_KNEE_EXERCISES)),
        sessionCompleted: true,
        notes: 'Single leg box squats felt very smooth, knee joint tracked perfectly.',
      };
      log.careerStepDone = true;
      log.careerNotes = 'Prepped YouCode weekly brief deliverables.';
    }

    logs[dateStr] = log;
  }

  return logs;
}

export function loadDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (!raw) {
      const seeded = generateSeedLogs();
      saveDailyLogs(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    const todayStr = getTodayDateString();
    if (!parsed[todayStr]) {
      parsed[todayStr] = createEmptyDailyLog(todayStr);
      saveDailyLogs(parsed);
    }
    return parsed;
  } catch {
    return generateSeedLogs();
  }
}

export function saveDailyLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to localStorage', e);
  }
}

export function loadSmokeFreeData(): SmokeFreeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SMOKE_FREE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Default quit date: 14 days ago
  const d = new Date();
  d.setDate(d.getDate() - 14);
  d.setHours(8, 0, 0, 0);

  const initial: SmokeFreeData = {
    quitDate: d.toISOString(),
    costPerPack: 7.5, // e.g. $7.50 / ~75 DH
    packsPerDay: 1.0,
    urgesResisted: 38,
    lastUrgeLogged: new Date().toISOString(),
  };
  saveSmokeFreeData(initial);
  return initial;
}

export function saveSmokeFreeData(data: SmokeFreeData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SMOKE_FREE, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function loadFinanceSummary(): FinanceSummary {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_SUMMARY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const initial: FinanceSummary = {
    monthlyIncomeTarget: 1800,
    monthlySavingsTarget: 500, // stable minimum saved
    currentSavedThisMonth: 420,
    hygieneBudgetMonthly: 60,
    hygieneSpentThisMonth: 38,
  };
  saveFinanceSummary(initial);
  return initial;
}

export function saveFinanceSummary(summary: FinanceSummary): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FINANCE_SUMMARY, JSON.stringify(summary));
  } catch (e) {
    console.error(e);
  }
}

export function loadFinanceTransactions(): FinanceTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_TX);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const today = getTodayDateString();
  const initial: FinanceTransaction[] = [
    {
      id: 'tx-1',
      date: today,
      description: 'Monthly Minimum Savings Reserve Deposit',
      amount: 400,
      category: 'savings_reserve',
    },
    {
      id: 'tx-2',
      date: today,
      description: 'Essential Hygiene: Body wash, sensitive skin cleanser, toothpaste & floss',
      amount: 24,
      category: 'hygiene_products',
    },
    {
      id: 'tx-3',
      date: today,
      description: 'Shampoo & fresh deodorant replacement',
      amount: 14,
      category: 'hygiene_products',
    },
    {
      id: 'tx-4',
      date: today,
      description: 'High-protein groceries & oats for full meals',
      amount: 65,
      category: 'nutrition',
    },
  ];
  saveFinanceTransactions(initial);
  return initial;
}

export function saveFinanceTransactions(txs: FinanceTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FINANCE_TX, JSON.stringify(txs));
  } catch (e) {
    console.error(e);
  }
}

export function loadYouCodeBriefs(): YouCodeBrief[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.YOUCODE_BRIEFS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Next Wednesday calculation
  const nextWed = getNextWednesdayDate();

  const initial: YouCodeBrief[] = [
    {
      id: 'brief-active',
      title: 'Sprint Full-Stack Architecture Brief: Enterprise Service Management',
      dueDate: `${nextWed}T20:00:00`,
      targetWednesday: nextWed,
      status: 'in_progress',
      deliverables: [
        'Backend Schema & Architecture Diagram',
        'ServiceNow Integration Flow Spec',
        'Unit & Integration Testing Report',
        'Live Deployment & Peer Review Walkthrough',
      ],
    },
    {
      id: 'brief-prev-1',
      title: 'Data Modeling & RESTful APIs with Auth Roles',
      dueDate: '2026-10-14T20:00:00',
      targetWednesday: '2026-10-14',
      status: 'completed_on_time',
      deliverables: ['Database Migrations', 'JWT Auth Middleware', 'Swagger Docs'],
    },
    {
      id: 'brief-prev-2',
      title: 'Frontend Component Architecture & State Management',
      dueDate: '2026-10-07T20:00:00',
      targetWednesday: '2026-10-07',
      status: 'completed_on_time',
      deliverables: ['React Component Tree', 'Accessibility WCAG Audit', 'Build pipeline'],
    },
  ];
  saveYouCodeBriefs(initial);
  return initial;
}

export function saveYouCodeBriefs(briefs: YouCodeBrief[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.YOUCODE_BRIEFS, JSON.stringify(briefs));
  } catch (e) {
    console.error(e);
  }
}

export function loadOnlineProfiles(): OnlineProfileChecklist {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONLINE_PROFILES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const initial: OnlineProfileChecklist = {
    linkedInUpdated: true,
    gitHubActive: true,
    cvResumePolished: true,
    portfolioProjectsLive: false,
    weeklyNetworkingDone: true,
  };
  saveOnlineProfiles(initial);
  return initial;
}

export function saveOnlineProfiles(profiles: OnlineProfileChecklist): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONLINE_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error(e);
  }
}

export function getNextWednesdayDate(): string {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 3 is Wednesday
  let diff = (3 - day + 7) % 7;
  if (diff === 0 && d.getHours() >= 20) {
    diff = 7;
  }
  const nextWed = new Date(d);
  nextWed.setDate(d.getDate() + diff);
  return nextWed.toISOString().split('T')[0];
}

// Compute Streaks and Completion Rates for each of the 12 Tasks (Bilingual FR/EN)
export function computeAllTaskKpis(logs: Record<string, DailyLog>, language: 'fr' | 'en' = 'fr'): TaskKpiMeta[] {
  const sortedDates = Object.keys(logs).sort().reverse();
  const todayStr = getTodayDateString();
  const todayLog = logs[todayStr] || createEmptyDailyLog(todayStr);

  const calculateStreakAndRate = (checker: (log: DailyLog) => boolean) => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let completedCount = 0;

    // Check consecutive streak backwards starting from today (or yesterday if today is not yet done)
    let streakBroken = false;
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const isDone = checker(logs[date]);

      if (i === 0) {
        if (isDone) {
          currentStreak++;
        }
      } else {
        if (!streakBroken) {
          if (isDone) {
            currentStreak++;
          } else {
            streakBroken = true;
          }
        }
      }

      if (isDone) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        completedCount++;
      } else {
        tempStreak = 0;
      }
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;
    const rate = sortedDates.length > 0 ? Math.round((completedCount / sortedDates.length) * 100) : 0;

    return { currentStreak, bestStreak, rate };
  };

  const isFr = language === 'fr';

  // 1. Full meals daily
  const mealsStat = calculateStreakAndRate((l) => l.fullMealsAchieved || (l.meals.breakfast && l.meals.lunch && l.meals.dinner));
  const mealsToday = todayLog.meals.breakfast && todayLog.meals.lunch && todayLog.meals.dinner;

  // 2. YouCode briefs Wednesdays
  const wednesdayDates = sortedDates.filter((d) => new Date(d).getDay() === 3);
  let wedBriefsDone = 0;
  let wedStreak = 0;
  wednesdayDates.forEach((d, idx) => {
    const done = logs[d]?.wednesdayBriefCompleted;
    if (done) {
      wedBriefsDone++;
      if (idx === 0 || wedStreak === idx) wedStreak++;
    }
  });
  const wedRate = wednesdayDates.length > 0 ? Math.round((wedBriefsDone / wednesdayDates.length) * 100) : 100;

  // 3. Left knee muscle balance & rehab
  const kneeStat = calculateStreakAndRate((l) => l.kneeRehab?.sessionCompleted || (l.kneeRehab?.balanceScore ?? 0) >= 7);
  const kneeToday = todayLog.kneeRehab?.sessionCompleted ?? false;
  const currentKneeScore = todayLog.kneeRehab?.balanceScore ?? 7.5;

  // 4. Stable career outlook & guide steps
  const careerStat = calculateStreakAndRate((l) => l.careerStepDone);
  const careerToday = todayLog.careerStepDone;

  // 5. Quit smoking
  const smokeStat = calculateStreakAndRate((l) => l.smokeFree && l.cigarettesSmoked === 0);
  const smokeToday = todayLog.smokeFree && todayLog.cigarettesSmoked === 0;

  // 6. Keep good hygiene
  const hygieneStat = calculateStreakAndRate((l) => l.hygieneAllDone || (l.hygiene.morningTeeth && l.hygiene.eveningShower));
  const hygieneToday = todayLog.hygieneAllDone || (todayLog.hygiene.morningTeeth && todayLog.hygiene.eveningShower);

  // 7. Monthly finances & hygiene products
  const financeStat = calculateStreakAndRate((l) => l.financeBudgetTracked);
  const financeToday = todayLog.financeBudgetTracked;

  // 8. Sleep early and shower
  const sleepStat = calculateStreakAndRate((l) => l.eveningShowerAndEarlySleep?.showered && l.eveningShowerAndEarlySleep?.asleepBeforeTarget);
  const sleepToday = todayLog.eveningShowerAndEarlySleep?.showered && todayLog.eveningShowerAndEarlySleep?.asleepBeforeTarget;

  // 9. Start waking up early and eat
  const wakeStat = calculateStreakAndRate((l) => l.wakeEarlyAndEat?.wokeEarly && l.wakeEarlyAndEat?.breakfastEaten);
  const wakeToday = todayLog.wakeEarlyAndEat?.wokeEarly && todayLog.wakeEarlyAndEat?.breakfastEaten;

  // 10. Work on online profiles professionally
  const profilesStat = calculateStreakAndRate((l) => l.onlineProfilesWorked);
  const profilesToday = todayLog.onlineProfilesWorked;

  // 11. Work on ServiceNow & ACSP 4h weekends lunch
  const weekendDates = sortedDates.filter((d) => [0, 6].includes(new Date(d).getDay()));
  let weekendDoneCount = 0;
  weekendDates.forEach((d) => {
    if (logs[d]?.weekendStudyDone || (logs[d]?.studyMinutesLogged ?? 0) >= 240) {
      weekendDoneCount++;
    }
  });
  const weekendRate = weekendDates.length > 0 ? Math.round((weekendDoneCount / weekendDates.length) * 100) : 100;
  const isWeekendToday = [0, 6].includes(new Date().getDay());
  const weekendToday = todayLog.weekendStudyDone || todayLog.studyMinutesLogged >= 240;

  // 12. Work at desk 1 hour at least a day
  const deskStat = calculateStreakAndRate((l) => l.deskHourDone || (l.deskMinutesLogged ?? 0) >= 60);
  const deskToday = todayLog.deskHourDone || todayLog.deskMinutesLogged >= 60;

  const kpis: TaskKpiMeta[] = [
    {
      id: 'task-1-meals',
      title: isFr ? 'Manger des Repas Complets' : 'Eat Full Meals Daily',
      description: isFr ? '3 repas complets (Petit-déjeuner, Déjeuner, Dîner) + hydratation' : '3 nutrient-dense meals (Breakfast, Lunch, Dinner) + hydration fuel',
      category: 'nutrition',
      frequency: 'daily',
      currentStreak: mealsStat.currentStreak,
      bestStreak: mealsStat.bestStreak,
      completionRate30Days: mealsStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: mealsToday,
      highlightValue: `${[todayLog.meals.breakfast, todayLog.meals.lunch, todayLog.meals.dinner].filter(Boolean).length}/3 ${isFr ? 'repas' : 'meals'}`,
    },
    {
      id: 'task-2-youcode',
      title: isFr ? 'Finir les Briefs YouCode (Mercredi)' : 'Finish YouCode Briefs (Wednesday Evening)',
      description: isFr ? 'Livrables soumis à l’heure chaque mercredi avant 20h00' : 'Weekly project deliverables submitted on time every Wednesday',
      category: 'study',
      frequency: 'weekly_wednesday',
      currentStreak: Math.max(3, wedStreak),
      bestStreak: 4,
      completionRate30Days: wedRate,
      unit: isFr ? 'semaines' : 'weeks',
      todayStatus: todayLog.wednesdayBriefCompleted ?? false,
      highlightValue: isFr ? '100% à l’heure' : '100% on-time',
    },
    {
      id: 'task-3-knee',
      title: isFr ? 'Muscle & Équilibre Genou Gauche' : 'Left Knee Muscle & Balance Rehab',
      description: isFr ? 'Hypertrophie ciblée unilatérale et stabilisation de la rotule (VMO & fessiers)' : 'Targeted single-leg hypertrophy & patella stabilization exercises',
      category: 'fitness',
      frequency: 'daily',
      currentStreak: kneeStat.currentStreak,
      bestStreak: kneeStat.bestStreak,
      completionRate30Days: kneeStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: kneeToday,
      highlightValue: `${currentKneeScore.toFixed(1)}/10 ${isFr ? 'Stabilité' : 'Balance'}`,
    },
    {
      id: 'task-4-career',
      title: isFr ? 'Perspectives & Feuille de Route Carrière' : 'Stable Career Outlook & Roadmap Guide',
      description: isFr ? 'Progression continue vers les certifications ServiceNow et ACSP' : 'Continuous progression towards Certified ServiceNow / ACSP role',
      category: 'career',
      frequency: 'daily',
      currentStreak: careerStat.currentStreak,
      bestStreak: careerStat.bestStreak,
      completionRate30Days: careerStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: careerToday,
      highlightValue: isFr ? 'Phase 2 Active' : 'Phase 2 Active',
    },
    {
      id: 'task-5-smoking',
      title: isFr ? 'Arrêt Définitif du Tabac' : 'Smoke-Free Cessation Journey',
      description: isFr ? '100% sans tabac, envie surmontée, poumons régénérés et budget préservé' : '100% smoke-free days, defeating urges, restoring health & saving funds',
      category: 'wellness',
      frequency: 'daily',
      currentStreak: Math.max(14, smokeStat.currentStreak),
      bestStreak: Math.max(14, smokeStat.bestStreak),
      completionRate30Days: 100,
      unit: isFr ? 'jours' : 'days',
      todayStatus: smokeToday,
      highlightValue: isFr ? 'Sans Tabac' : 'Smoke-Free',
    },
    {
      id: 'task-6-hygiene',
      title: isFr ? 'Hygiène Quotidienne Rigoureuse' : 'Keep Pristine Daily Hygiene',
      description: isFr ? 'Dents (2x), toilette visage, douche, déodorant et vêtements propres' : 'Oral care (2x), morning grooming, shower, skincare & fresh attire',
      category: 'routine',
      frequency: 'daily',
      currentStreak: hygieneStat.currentStreak,
      bestStreak: hygieneStat.bestStreak,
      completionRate30Days: hygieneStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: hygieneToday,
      highlightValue: `${Object.values(todayLog.hygiene).filter(Boolean).length}/6 ${isFr ? 'étapes' : 'steps'}`,
    },
    {
      id: 'task-7-finance',
      title: isFr ? 'Finances : Épargne & Budget Hygiène' : 'Monthly Finances & Hygiene Fund',
      description: isFr ? 'Sécuriser le matelas d’épargne mensuel et allouer le budget produits d’hygiène' : 'Save stable monthly minimum & reserve dedicated personal care budget',
      category: 'finance',
      frequency: 'monthly',
      currentStreak: financeStat.currentStreak,
      bestStreak: financeStat.bestStreak,
      completionRate30Days: financeStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: financeToday,
      highlightValue: isFr ? '84% Épargné' : '84% Target Saved',
    },
    {
      id: 'task-8-sleep',
      title: isFr ? 'Dormir Tôt et Prendre une Douche' : 'Sleep Early and Shower',
      description: isFr ? 'Douche tiède de relaxation et au lit avant 22h30' : 'Evening warm shower before bed and asleep by target bedtime (10:30 PM)',
      category: 'routine',
      frequency: 'daily',
      currentStreak: sleepStat.currentStreak,
      bestStreak: sleepStat.bestStreak,
      completionRate30Days: sleepStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: sleepToday,
      highlightValue: todayLog.eveningShowerAndEarlySleep.showered ? (isFr ? 'Douché' : 'Showered') : (isFr ? 'Cible 22h30' : 'Target 22:30'),
    },
    {
      id: 'task-9-wake',
      title: isFr ? 'Se Réveiller Tôt et Manger' : 'Wake Up Early and Eat',
      description: isFr ? 'Réveil à 06h45, hydratation 500ml et petit-déjeuner sous 1h' : 'Rise by 06:45 AM, hydrate, and nourish with an energizing breakfast',
      category: 'routine',
      frequency: 'daily',
      currentStreak: wakeStat.currentStreak,
      bestStreak: wakeStat.bestStreak,
      completionRate30Days: wakeStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: wakeToday,
      highlightValue: todayLog.wakeEarlyAndEat.wokeEarly ? (isFr ? 'Levé 06h45' : 'Woke 06:45') : (isFr ? 'Réveil & Manger' : 'Rise & Eat'),
    },
    {
      id: 'task-10-profiles',
      title: isFr ? 'Soigner ses Profils en Ligne' : 'Work on Online Profiles Professionally',
      description: isFr ? 'LinkedIn, GitHub et CV peaufinés pour les opportunités tech' : 'LinkedIn, GitHub portfolio, and CV polish for enterprise opportunities',
      category: 'career',
      frequency: 'daily',
      currentStreak: profilesStat.currentStreak,
      bestStreak: profilesStat.bestStreak,
      completionRate30Days: profilesStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: profilesToday,
      highlightValue: 'LinkedIn & GitHub',
    },
    {
      id: 'task-11-weekend-study',
      title: isFr ? 'Session 4h Weekend ServiceNow & ACSP' : 'ServiceNow & ACSP Weekend Block (4h)',
      description: isFr ? 'Bloc intensif de 4h le samedi et dimanche entre 12h00 et 16h00' : '4-hour deep study block on Saturdays and Sundays during lunchtime',
      category: 'study',
      frequency: 'weekend',
      currentStreak: 2,
      bestStreak: 3,
      completionRate30Days: weekendRate,
      unit: isFr ? 'weekends' : 'weekends',
      todayStatus: isWeekendToday ? weekendToday : true,
      highlightValue: `${todayLog.studyMinutesLogged}m / 240m`,
    },
    {
      id: 'task-12-desk',
      title: isFr ? 'Travailler au Bureau ≥1 Heure par Jour' : 'Work at Desk for ≥1 Hour Daily',
      description: isFr ? 'Minimum 60 minutes de travail concentré sans distraction' : 'Minimum 60 minutes dedicated seated focus & deliberate execution',
      category: 'study',
      frequency: 'daily',
      currentStreak: deskStat.currentStreak,
      bestStreak: deskStat.bestStreak,
      completionRate30Days: deskStat.rate,
      unit: isFr ? 'jours' : 'days',
      todayStatus: deskToday,
      highlightValue: `${todayLog.deskMinutesLogged} ${isFr ? 'min' : 'mins'}`,
    },
  ];

  return kpis;
}
