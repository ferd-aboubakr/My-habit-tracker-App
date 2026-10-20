export interface MealLog {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  waterLiters: number;
  notes?: string;
}

export interface KneeExercise {
  name: string;
  sets: number;
  reps: number;
  weightKg?: number;
  leftFocusNotes: string;
  completed: boolean;
}

export interface KneeRehabLog {
  balanceScore: number; // 1 to 10 scale (1 = severe imbalance, 10 = completely stable and balanced)
  kneeComfort: number; // 1 to 10
  exercises: KneeExercise[];
  sessionCompleted: boolean;
  notes?: string;
}

export interface SmokeFreeData {
  quitDate: string; // ISO string
  costPerPack: number;
  packsPerDay: number;
  urgesResisted: number;
  lastUrgeLogged?: string;
}

export interface HygieneChecklist {
  morningTeeth: boolean;
  morningFaceGroom: boolean;
  deodorantFresh: boolean;
  eveningShower: boolean;
  eveningTeethFloss: boolean;
  skincare: boolean;
}

export interface FinanceSummary {
  monthlyIncomeTarget: number;
  monthlySavingsTarget: number; // stable minimum savings
  currentSavedThisMonth: number;
  hygieneBudgetMonthly: number;
  hygieneSpentThisMonth: number;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'savings_reserve' | 'hygiene_products' | 'nutrition' | 'learning_career' | 'general';
}

export interface YouCodeBrief {
  id: string;
  title: string;
  dueDate: string; // typically Wednesday evening
  targetWednesday: string; // YYYY-MM-DD
  status: 'assigned' | 'in_progress' | 'review' | 'completed_on_time' | 'late';
  deliverables: string[];
}

export interface OnlineProfileChecklist {
  linkedInUpdated: boolean;
  gitHubActive: boolean;
  cvResumePolished: boolean;
  portfolioProjectsLive: boolean;
  weeklyNetworkingDone: boolean;
}

export interface StudyBlockSession {
  id: string;
  date: string;
  targetDay: 'saturday' | 'sunday' | 'weekday';
  topic: 'servicenow' | 'acsp' | 'desk_general';
  durationMinutes: number;
  targetMinutes: number; // e.g. 240 for 4h weekend lunch block, 60 for daily desk
  completed: boolean;
  notes: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD

  // 1. Eat full meals daily
  meals: MealLog;
  fullMealsAchieved: boolean; // all 3 meals checked

  // 2. Finish YouCode briefs on Wednesdays evening
  wednesdayBriefCompleted?: boolean;
  briefTitle?: string;

  // 3. Gain muscle mass to feel balanced in my left knee especially
  kneeRehab: KneeRehabLog;

  // 4. Career outlook step taken
  careerStepDone: boolean;
  careerNotes?: string;

  // 5. Smoke-free day
  smokeFree: boolean;
  cigarettesSmoked: number; // 0 if successful

  // 6. Good hygiene
  hygiene: HygieneChecklist;
  hygieneAllDone: boolean;

  // 7. Monthly finance & hygiene budget check
  financeBudgetTracked: boolean;

  // 8. Sleep early and shower
  eveningShowerAndEarlySleep: {
    showered: boolean;
    bedTime: string; // e.g. "22:30"
    asleepBeforeTarget: boolean; // e.g. target 23:00
    sleepHours: number;
  };

  // 9. Start waking up early and eat
  wakeEarlyAndEat: {
    wakeTime: string; // e.g. "06:45"
    wokeEarly: boolean; // e.g. woke before 07:30
    breakfastEaten: boolean;
  };

  // 10. Work on online profiles professionally
  onlineProfilesWorked: boolean;
  onlineProfileFocus?: string;

  // 11. Work on ServiceNow and ACSP 4h weekend lunchtime
  weekendStudyDone: boolean; // Sat/Sun 4h
  studyMinutesLogged: number;

  // 12. Work at desk 1 hour at least a day
  deskHourDone: boolean;
  deskMinutesLogged: number;
}

export interface TaskKpiMeta {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'fitness' | 'routine' | 'career' | 'study' | 'finance' | 'wellness';
  frequency: 'daily' | 'weekly_wednesday' | 'weekend' | 'monthly';
  currentStreak: number;
  bestStreak: number;
  completionRate30Days: number;
  unit: string;
  todayStatus: boolean;
  highlightValue: string;
}
