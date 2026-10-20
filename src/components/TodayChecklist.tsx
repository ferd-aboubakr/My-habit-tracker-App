import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Utensils,
  Moon,
  Sun,
  Activity,
  Flame,
  Sparkles,
  Briefcase,
  Monitor,
  Clock,
  DollarSign,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  Check,
} from 'lucide-react';
import { DailyLog, SmokeFreeData, FinanceSummary } from '../types/habits';
import confetti from 'canvas-confetti';
import { Language, Currency, formatCurrency, translations } from '../i18n/translations';

interface TodayChecklistProps {
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  smokeFreeData: SmokeFreeData;
  onResistUrge: () => void;
  financeSummary: FinanceSummary;
  onNavigateTab: (tabId: string) => void;
  language?: Language;
  currency?: Currency;
  isAccessibilityMode?: boolean;
  onToggleAccessibilityMode?: () => void;
}

export const TodayChecklist: React.FC<TodayChecklistProps> = ({
  todayLog,
  onUpdateTodayLog,
  smokeFreeData,
  onResistUrge,
  financeSummary,
  onNavigateTab,
  language = 'fr',
  currency = 'MAD',
  isAccessibilityMode = false,
  onToggleAccessibilityMode,
}) => {
  const isFr = language === 'fr';
  const t = translations[language].today;
  const common = translations[language].common;

  const [deskMinutesInput, setDeskMinutesInput] = useState<number>(todayLog.deskMinutesLogged || 60);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Text-To-Speech (TTS) for accessibility and low literacy support
  const speakAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingText === text) {
      setSpeakingText(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isFr ? 'fr-FR' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    setSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Helper toggle functions
  const toggleMeal = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const updatedMeals = {
      ...todayLog.meals,
      [meal]: !todayLog.meals[meal],
    };
    const allMealsDone = updatedMeals.breakfast && updatedMeals.lunch && updatedMeals.dinner;
    onUpdateTodayLog({
      ...todayLog,
      meals: updatedMeals,
      fullMealsAchieved: allMealsDone,
    });
  };

  const toggleWakeEarly = () => {
    const nextVal = !todayLog.wakeEarlyAndEat.wokeEarly;
    onUpdateTodayLog({
      ...todayLog,
      wakeEarlyAndEat: {
        ...todayLog.wakeEarlyAndEat,
        wokeEarly: nextVal,
      },
    });
  };

  const toggleWakeBreakfast = () => {
    const nextVal = !todayLog.wakeEarlyAndEat.breakfastEaten;
    onUpdateTodayLog({
      ...todayLog,
      wakeEarlyAndEat: {
        ...todayLog.wakeEarlyAndEat,
        breakfastEaten: nextVal,
      },
      meals: {
        ...todayLog.meals,
        breakfast: nextVal,
      },
    });
  };

  const toggleHygiene = (key: keyof typeof todayLog.hygiene) => {
    const nextHygiene = {
      ...todayLog.hygiene,
      [key]: !todayLog.hygiene[key],
    };
    const allDone = Object.values(nextHygiene).every(Boolean);
    onUpdateTodayLog({
      ...todayLog,
      hygiene: nextHygiene,
      hygieneAllDone: allDone,
    });
  };

  const toggleNightShower = () => {
    const nextVal = !todayLog.eveningShowerAndEarlySleep.showered;
    onUpdateTodayLog({
      ...todayLog,
      eveningShowerAndEarlySleep: {
        ...todayLog.eveningShowerAndEarlySleep,
        showered: nextVal,
      },
      hygiene: {
        ...todayLog.hygiene,
        eveningShower: nextVal,
      },
    });
  };

  const toggleSleepEarly = () => {
    const nextVal = !todayLog.eveningShowerAndEarlySleep.asleepBeforeTarget;
    onUpdateTodayLog({
      ...todayLog,
      eveningShowerAndEarlySleep: {
        ...todayLog.eveningShowerAndEarlySleep,
        asleepBeforeTarget: nextVal,
      },
    });
  };

  const toggleKneeRehab = () => {
    const nextVal = !todayLog.kneeRehab.sessionCompleted;
    if (nextVal) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
    onUpdateTodayLog({
      ...todayLog,
      kneeRehab: {
        ...todayLog.kneeRehab,
        sessionCompleted: nextVal,
      },
    });
  };

  const updateKneeBalanceScore = (score: number) => {
    onUpdateTodayLog({
      ...todayLog,
      kneeRehab: {
        ...todayLog.kneeRehab,
        balanceScore: score,
      },
    });
  };

  const toggleDeskHour = () => {
    const nextVal = !todayLog.deskHourDone;
    const mins = nextVal ? Math.max(60, todayLog.deskMinutesLogged) : 0;
    onUpdateTodayLog({
      ...todayLog,
      deskHourDone: nextVal,
      deskMinutesLogged: mins,
    });
  };

  const logCustomDeskMinutes = () => {
    onUpdateTodayLog({
      ...todayLog,
      deskMinutesLogged: deskMinutesInput,
      deskHourDone: deskMinutesInput >= 60,
    });
  };

  const toggleSmokeFree = () => {
    const nextVal = !todayLog.smokeFree;
    onUpdateTodayLog({
      ...todayLog,
      smokeFree: nextVal,
      cigarettesSmoked: nextVal ? 0 : 1,
    });
  };

  const toggleWednesdayBrief = () => {
    const nextVal = !todayLog.wednesdayBriefCompleted;
    if (nextVal) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    }
    onUpdateTodayLog({
      ...todayLog,
      wednesdayBriefCompleted: nextVal,
    });
  };

  const toggleOnlineProfiles = () => {
    const nextVal = !todayLog.onlineProfilesWorked;
    onUpdateTodayLog({
      ...todayLog,
      onlineProfilesWorked: nextVal,
      onlineProfileFocus: nextVal ? (isFr ? 'Profils professionnels et projets à jour' : 'Refined professional experience') : '',
    });
  };

  const toggleCareerStep = () => {
    const nextVal = !todayLog.careerStepDone;
    onUpdateTodayLog({
      ...todayLog,
      careerStepDone: nextVal,
      careerNotes: nextVal ? (isFr ? 'Étape validée dans le guide carrière' : 'Actioned career milestone') : '',
    });
  };

  const toggleWeekendStudy = () => {
    const nextVal = !todayLog.weekendStudyDone;
    onUpdateTodayLog({
      ...todayLog,
      weekendStudyDone: nextVal,
      studyMinutesLogged: nextVal ? 240 : 0,
    });
  };

  const toggleFinanceTracked = () => {
    const nextVal = !todayLog.financeBudgetTracked;
    onUpdateTodayLog({
      ...todayLog,
      financeBudgetTracked: nextVal,
    });
  };

  // Calculate today's completion stats
  const completedChecklistItems = [
    todayLog.meals.breakfast && todayLog.meals.lunch && todayLog.meals.dinner,
    todayLog.wakeEarlyAndEat.wokeEarly && todayLog.wakeEarlyAndEat.breakfastEaten,
    todayLog.hygiene.morningTeeth && todayLog.hygiene.eveningShower,
    todayLog.deskHourDone,
    todayLog.kneeRehab.sessionCompleted,
    todayLog.smokeFree,
    todayLog.eveningShowerAndEarlySleep.showered && todayLog.eveningShowerAndEarlySleep.asleepBeforeTarget,
    todayLog.wednesdayBriefCompleted,
    todayLog.onlineProfilesWorked,
    todayLog.careerStepDone,
    todayLog.weekendStudyDone,
    todayLog.financeBudgetTracked,
  ].filter(Boolean).length;

  const totalPrimaryHabits = 12;
  const todayPercentage = Math.round((completedChecklistItems / totalPrimaryHabits) * 100);

  const isTodayWednesday = new Date().getDay() === 3;
  const isTodayWeekend = [0, 6].includes(new Date().getDay());

  // Formatted date string in appropriate language
  const dateFormatted = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Cockpit Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
              <span>{isFr ? 'Protocole des 12 Habitudes' : 'Daily Habits Protocol'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-200 capitalize">{dateFormatted}</span>
              {isTodayWednesday && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    {isFr ? 'Mercredi : Livraison Brief YouCode' : 'Wednesday YouCode Brief Deadline'}
                  </span>
                </>
              )}
              {isTodayWeekend && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-sky-400 font-semibold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                    {isFr ? 'Weekend : Session 4h ServiceNow & ACSP' : 'Weekend ServiceNow 4h Window'}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{t.cockpitTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t.cockpitSubtitle}
            </p>
          </div>

          {/* Quick Score Card & Accessibility Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onToggleAccessibilityMode && (
              <button
                onClick={onToggleAccessibilityMode}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  isAccessibilityMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Activer le mode gros caractères, contraste et lecture vocale"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{isAccessibilityMode ? 'Mode Vocal Activé 🔊' : 'Mode Vocal & Facile 🔊'}</span>
              </button>
            )}

            <div className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400">{t.todaysProgress}</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  {todayPercentage}%
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {completedChecklistItems} {t.doneOf} {totalPrimaryHabits} {t.habitsDone}
                </div>
              </div>
              <div className="w-13 h-13 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-500 ease-out"
                    strokeDasharray={`${todayPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-100">
                  {completedChecklistItems}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick urgent banners */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80">
            <span className="text-slate-400">{t.smokeFreeStreak}</span>
            <span className="font-mono font-semibold text-emerald-400">14 {t.cleanDays}</span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80">
            <span className="text-slate-400">{t.kneeBalance}</span>
            <span className="font-mono font-semibold text-emerald-400">
              {todayLog.kneeRehab.balanceScore}/10 {t.stability}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80">
            <span className="text-slate-400">{t.monthlySavings}</span>
            <span className="font-mono font-semibold text-amber-400">
              {formatCurrency(financeSummary.currentSavedThisMonth, currency)} / {formatCurrency(financeSummary.monthlySavingsTarget, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Checklist Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCK 1: Morning, Nutrition & Hydration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.morningFuel}</h3>
                <p className="text-xs text-slate-400">{t.morningFuelDesc}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {[todayLog.meals.breakfast, todayLog.meals.lunch, todayLog.meals.dinner].filter(Boolean).length}/3 {isFr ? 'repas' : 'meals'}
            </span>
          </div>

          {/* Habit 09: Start waking up early and eat */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber-400 font-mono font-semibold uppercase tracking-wider">Habitude 09</span>
                  <button
                    onClick={() => speakAloud(`${t.habit09Title}. ${t.habit09Desc}. ${todayLog.wakeEarlyAndEat.wokeEarly ? (isFr ? 'Statut : Validé.' : 'Status: Completed.') : (isFr ? 'Statut : À faire.' : 'Status: Pending.')}`)}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit09Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit09Desc}</p>
              </div>

              <button
                onClick={toggleWakeEarly}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.wakeEarlyAndEat.wokeEarly
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider le réveil tôt"
              >
                {todayLog.wakeEarlyAndEat.wokeEarly ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={toggleWakeBreakfast}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  todayLog.wakeEarlyAndEat.breakfastEaten
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.habit09Breakfast}</span>
              </button>
              <span className="text-xs font-mono text-slate-400">{t.wakeTime}</span>
            </div>
          </div>

          {/* Habit 01: Eat full meals daily */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber-400 font-mono font-semibold uppercase tracking-wider">Habitude 01</span>
                  <button
                    onClick={() => speakAloud(`${t.habit01Title}. ${t.habit01Desc}. ${todayLog.fullMealsAchieved ? (isFr ? 'Statut : Les 3 repas sont validés.' : 'Status: All 3 meals done.') : (isFr ? 'Statut : En cours.' : 'Status: In progress.')}`)}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit01Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit01Desc}</p>
              </div>

              <span
                className={`text-xs font-mono font-semibold px-2.5 py-1 rounded border shrink-0 ${
                  todayLog.fullMealsAchieved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {todayLog.fullMealsAchieved ? '3/3 Complet' : `${[todayLog.meals.breakfast, todayLog.meals.lunch, todayLog.meals.dinner].filter(Boolean).length}/3 En cours`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { key: 'breakfast' as const, label: t.breakfast, icon: '🥞' },
                { key: 'lunch' as const, label: t.lunch, icon: '🍗' },
                { key: 'dinner' as const, label: t.dinner, icon: '🥗' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => toggleMeal(m.key)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border flex flex-col items-center gap-1 ${
                    todayLog.meals[m.key]
                      ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600/80 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {todayLog.meals[m.key] ? '✓ Fait' : 'À faire'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOCK 2: Physical Strength & Left Knee Rehab */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.kneeTitle}</h3>
                <p className="text-xs text-slate-400">{t.kneeSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('knee')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{t.drilldown}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">Habitude 03</span>
                  <button
                    onClick={() => speakAloud(`${t.habit03Title}. ${t.habit03Desc}. ${todayLog.kneeRehab.sessionCompleted ? (isFr ? 'Statut : Séance validée.' : 'Status: Completed.') : (isFr ? 'Statut : Séance en attente.' : 'Status: Pending.')}`)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit03Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit03Desc}</p>
              </div>

              <button
                onClick={toggleKneeRehab}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.kneeRehab.sessionCompleted
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider la séance genou"
              >
                {todayLog.kneeRehab.sessionCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Left Knee Balance Rating Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.kneeBalanceRating}</span>
                <span className="font-mono font-bold text-emerald-400">
                  {todayLog.kneeRehab.balanceScore}/10 {t.stability}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateKneeBalanceScore(num)}
                    className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-md transition-all cursor-pointer border ${
                      todayLog.kneeRehab.balanceScore === num
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-0.5">
                {t.kneeGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* BLOCK 3: Desk Focus & Technical Weekend Study */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.deskTitle}</h3>
                <p className="text-xs text-slate-400">{t.deskSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('study')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{t.timerLogs}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Habit 12: Work on the desk 1 hour at least a day */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-sky-400 font-mono font-semibold uppercase tracking-wider">Habitude 12</span>
                  <button
                    onClick={() => speakAloud(`${t.habit12Title}. ${t.habit12Desc}. ${todayLog.deskHourDone ? (isFr ? `Statut : ${todayLog.deskMinutesLogged} minutes validées.` : `Status: ${todayLog.deskMinutesLogged} minutes done.`) : (isFr ? 'Statut : Moins de 60 minutes.' : 'Status: Under 60 minutes.')}`)}
                    className="p-1 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit12Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit12Desc}</p>
              </div>

              <button
                onClick={toggleDeskHour}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.deskHourDone
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider l'heure de bureau"
              >
                {todayLog.deskHourDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min="0"
                  step="15"
                  value={deskMinutesInput}
                  onChange={(e) => setDeskMinutesInput(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white"
                />
                <span className="text-xs text-slate-300">{t.minutes}</span>
              </div>
              <button
                onClick={logCustomDeskMinutes}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                {t.logMinutes}
              </button>
              <button
                onClick={() => onNavigateTab('study')}
                className="px-3 py-1 bg-sky-950/80 border border-sky-800/60 hover:bg-sky-900 text-sky-300 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>{t.timerBtn}</span>
              </button>
            </div>
          </div>

          {/* Habit 11: Work on ServiceNow & ACSP 4h in weekends lunchtime */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-sky-400 font-mono font-semibold uppercase tracking-wider">Habitude 11</span>
                  <button
                    onClick={() => speakAloud(`${t.habit11Title}. ${t.habit11Desc}.`)}
                    className="p-1 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit11Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit11Desc}</p>
              </div>

              <button
                onClick={toggleWeekendStudy}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.weekendStudyDone
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider le bloc weekend"
              >
                {todayLog.weekendStudyDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">{t.statusLabel}</span>
              <span className="font-mono text-slate-200">
                {todayLog.studyMinutesLogged > 0
                  ? `${todayLog.studyMinutesLogged} / 240 mins (4.0 hrs)`
                  : t.scheduledWeekend}
              </span>
            </div>
          </div>
        </div>

        {/* BLOCK 4: Smoke-Free Cessation & Hygiene */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.smokeHygieneTitle}</h3>
                <p className="text-xs text-slate-400">{t.smokeHygieneSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('smoke_finance')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{t.detailsBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Habit 05: Quit smoking */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-rose-400 font-mono font-semibold uppercase tracking-wider">Habitude 05</span>
                  <button
                    onClick={() => speakAloud(`${t.habit05Title}. ${t.habit05Desc}. ${todayLog.smokeFree ? (isFr ? 'Statut : Zéro cigarette.' : 'Status: Smoke free.') : (isFr ? 'Statut : Cigarette signalée.' : 'Status: Relapse reported.')}`)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit05Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit05Desc}</p>
              </div>

              <button
                onClick={toggleSmokeFree}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.smokeFree
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-rose-400 bg-rose-500/20 border border-rose-500/40'
                }`}
                title="Basculer le statut sans tabac"
              >
                {todayLog.smokeFree ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={onResistUrge}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-200 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.defeatedUrge}</span>
              </button>
              <div className="text-xs text-right">
                <span className="text-slate-400">{t.resistedCount} </span>
                <span className="font-mono font-bold text-emerald-400">
                  {smokeFreeData.urgesResisted}
                </span>
              </div>
            </div>
          </div>

          {/* Habit 06: Keep good hygiene */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-rose-400 font-mono font-semibold uppercase tracking-wider">Habitude 06</span>
                  <button
                    onClick={() => speakAloud(`${t.habit06Title}. ${t.habit06Desc}.`)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit06Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit06Desc}</p>
              </div>

              <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                {Object.values(todayLog.hygiene).filter(Boolean).length}/6 {isFr ? 'soins' : 'steps'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { key: 'morningTeeth' as const, label: t.hygieneMorningTeeth },
                { key: 'morningFaceGroom' as const, label: t.hygieneFaceGroom },
                { key: 'deodorantFresh' as const, label: t.hygieneDeodorant },
                { key: 'eveningShower' as const, label: t.hygieneEveningShower },
                { key: 'eveningTeethFloss' as const, label: t.hygieneEveningTeethFloss },
                { key: 'skincare' as const, label: t.hygieneSkincare },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleHygiene(item.key)}
                  className={`py-1.5 px-2.5 text-xs rounded-md text-left transition-colors cursor-pointer border flex items-center justify-between ${
                    todayLog.hygiene[item.key]
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 font-medium'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {todayLog.hygiene[item.key] && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOCK 5: Evening Shower, Sleep & Finance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.eveningRestTitle}</h3>
                <p className="text-xs text-slate-400">{t.eveningRestSubtitle}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {t.targetBedtime}
            </span>
          </div>

          {/* Habit 08: Sleep early and shower */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-indigo-400 font-mono font-semibold uppercase tracking-wider">Habitude 08</span>
                  <button
                    onClick={() => speakAloud(`${t.habit08Title}. ${t.habit08Desc}.`)}
                    className="p-1 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit08Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit08Desc}</p>
              </div>

              <button
                onClick={toggleSleepEarly}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.eveningShowerAndEarlySleep.asleepBeforeTarget
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider le coucher tôt"
              >
                {todayLog.eveningShowerAndEarlySleep.asleepBeforeTarget ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={toggleNightShower}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  todayLog.eveningShowerAndEarlySleep.showered
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.showerTaken}</span>
              </button>
              <button
                onClick={toggleSleepEarly}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  todayLog.eveningShowerAndEarlySleep.asleepBeforeTarget
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.inBedBy}</span>
              </button>
            </div>
          </div>

          {/* Habit 07: Manage monthly finances */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-indigo-400 font-mono font-semibold uppercase tracking-wider">Habitude 07</span>
                  <button
                    onClick={() => speakAloud(`${t.habit07Title}. ${t.habit07Desc}.`)}
                    className="p-1 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit07Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit07Desc}</p>
              </div>

              <button
                onClick={toggleFinanceTracked}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.financeBudgetTracked
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider la gestion financière"
              >
                {todayLog.financeBudgetTracked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{t.savingsTargetLabel}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatCurrency(financeSummary.currentSavedThisMonth, currency)} / {formatCurrency(financeSummary.monthlySavingsTarget, currency)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{t.hygieneSpentLabel}</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {formatCurrency(financeSummary.hygieneSpentThisMonth, currency)} / {formatCurrency(financeSummary.hygieneBudgetMonthly, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 6: Career Outlook, YouCode Briefs & Online Profiles */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t.careerDeliverablesTitle}</h3>
                <p className="text-xs text-slate-400">{t.careerDeliverablesSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('career')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{t.careerGuideBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Habit 02: Finish YouCode briefs on Wednesday evening */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-purple-400 font-mono font-semibold uppercase tracking-wider">Habitude 02</span>
                  <button
                    onClick={() => speakAloud(`${t.habit02Title}. ${t.habit02Desc}.`)}
                    className="p-1 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit02Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit02Desc}</p>
              </div>

              <button
                onClick={toggleWednesdayBrief}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.wednesdayBriefCompleted
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider la soumission du brief"
              >
                {todayLog.wednesdayBriefCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">{t.deadlineWed}</span>
              <span className="font-mono text-amber-400 font-bold">Mercredi 20:00</span>
            </div>
          </div>

          {/* Habit 10: Work on online profiles professionally */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-purple-400 font-mono font-semibold uppercase tracking-wider">Habitude 10</span>
                  <button
                    onClick={() => speakAloud(`${t.habit10Title}. ${t.habit10Desc}.`)}
                    className="p-1 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
                    title="Écouter à voix haute"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{t.habit10Title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.habit10Desc}</p>
              </div>

              <button
                onClick={toggleOnlineProfiles}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  todayLog.onlineProfilesWorked
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title="Valider les profils en ligne"
              >
                {todayLog.onlineProfilesWorked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={toggleCareerStep}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  todayLog.careerStepDone
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.habit04Milestone}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
