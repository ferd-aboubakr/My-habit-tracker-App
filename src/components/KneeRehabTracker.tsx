import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  TrendingUp,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { DailyLog, KneeExercise } from '../types/habits';
import confetti from 'canvas-confetti';
import { Language } from '../i18n/translations';

interface KneeRehabTrackerProps {
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  logs: Record<string, DailyLog>;
  language?: Language;
}

export const KneeRehabTracker: React.FC<KneeRehabTrackerProps> = ({
  todayLog,
  onUpdateTodayLog,
  logs,
  language = 'fr',
}) => {
  const isFr = language === 'fr';
  const [exercises, setExercises] = useState<KneeExercise[]>(
    todayLog.kneeRehab.exercises || []
  );
  const [balanceScore, setBalanceScore] = useState<number>(
    todayLog.kneeRehab.balanceScore || 8
  );
  const [kneeComfort, setKneeComfort] = useState<number>(
    todayLog.kneeRehab.kneeComfort || 8
  );
  const [sessionNotes, setSessionNotes] = useState<string>(
    todayLog.kneeRehab.notes || ''
  );

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(12);

  const toggleExercise = (index: number) => {
    const next = [...exercises];
    next[index].completed = !next[index].completed;
    setExercises(next);

    const allDone = next.every((e) => e.completed);
    if (allDone) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }

    onUpdateTodayLog({
      ...todayLog,
      kneeRehab: {
        ...todayLog.kneeRehab,
        exercises: next,
        sessionCompleted: allDone,
      },
    });
  };

  const handleScoreChange = (score: number) => {
    setBalanceScore(score);
    onUpdateTodayLog({
      ...todayLog,
      kneeRehab: {
        ...todayLog.kneeRehab,
        balanceScore: score,
      },
    });
  };

  const handleSaveNotes = () => {
    onUpdateTodayLog({
      ...todayLog,
      kneeRehab: {
        ...todayLog.kneeRehab,
        notes: sessionNotes,
      },
    });
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: KneeExercise = {
      name: newExName.trim(),
      sets: newExSets,
      reps: newExReps,
      leftFocusNotes: 'Left knee stabilization and hypertrophy focus',
      completed: false,
    };
    const next = [...exercises, newEx];
    setExercises(next);
    setNewExName('');

    onUpdateTodayLog({
      ...todayLog,
      kneeRehab: {
        ...todayLog.kneeRehab,
        exercises: next,
      },
    });
  };

  // Recent 7 days balance scores
  const recentDays = Object.keys(logs)
    .sort()
    .slice(-7)
    .map((dateStr) => {
      const l = logs[dateStr];
      const d = new Date(dateStr);
      return {
        dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        score: l.kneeRehab?.balanceScore ?? 7,
        completed: l.kneeRehab?.sessionCompleted ?? false,
      };
    });

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
              <Activity className="w-4 h-4" />
              <span>{isFr ? 'Protocole Genou Gauche & Hypertrophie Unilatérale' : 'Left Knee Unilateral Balance & Hypertrophy'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isFr ? 'Renforcement Musculaire & Symétrie du Genou Gauche' : 'Left Knee Muscle Mass & Symmetry Tracker'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {isFr
                ? 'Cible le vaste interne (VMO), les ischios-jambiers et le moyen fessier pour éliminer les asymétries et retrouver 100% de stabilité sur la jambe gauche.'
                : 'Targeting vastus medialis (VMO), hamstring-to-quad ratio, and gluteus medius to eliminate asymmetry and feel 100% balanced in the left knee.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Sensation d’Équilibre' : 'Current Balance Feeling'}</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                {balanceScore}
                <span className="text-sm text-slate-500 font-normal">/10</span>
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Stabilité Unilatérale' : 'Unilateral Stability'}</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Volume Réalisé' : 'Target Volume'}</div>
              <div className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
                {exercises.filter((e) => e.completed).length} / {exercises.length}
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Séries Aujourd’hui' : 'Sets Done Today'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Rating & 7-Day Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Knee Feeling Score Selector */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">
              {isFr ? 'Évaluation Quotidienne de l’Équilibre' : 'Daily Left Knee Balance Rating'}
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">{balanceScore}/10</span>
          </div>

          <p className="text-xs text-slate-400">
            {isFr
              ? 'Quel est le ressenti de stabilité et d’ancrage sur la jambe gauche en appui unipodal ?'
              : 'How balanced, grounded, and aligned does your left knee feel during single-leg weight bearing?'}
          </p>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleScoreChange(num)}
                className={`py-2 text-xs font-mono font-bold rounded transition-colors cursor-pointer border ${
                  balanceScore === num
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border-slate-800'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 space-y-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Assessment Guidance:</span>
            </div>
            <p>1-4: Noticeable wobble / knee caving in during stairs or squats.</p>
            <p>5-7: Moderate control, slight quad fatigue or right-side compensation.</p>
            <p>8-10: Solid symmetry, full weight-bearing confidence, smooth patella track.</p>
          </div>
        </div>

        {/* 7-Day Knee Balance Consistency Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">Recent Balance Trend (Last 7 Days)</h3>
            <span className="text-xs font-mono text-slate-400">Goal: ≥8.0 Consistency</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {recentDays.map((item, idx) => {
              const heightPct = Math.round((item.score / 10) * 100);
              const isToday = idx === recentDays.length - 1;
              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {item.score}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t h-28 relative overflow-hidden flex items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        item.score >= 8
                          ? 'bg-emerald-500'
                          : item.score >= 6
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-mono ${
                      isToday ? 'text-sky-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {item.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Symmetry Status: Left quad & knee stabilization advancing smoothly</span>
            <span className="font-mono text-emerald-400 font-semibold">+22% Improvement</span>
          </div>
        </div>
      </div>

      {/* Targeted Rehab & Hypertrophy Regimen */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Targeted Left Knee Exercise Protocol
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict form: push through left heel, keep knee over second toe, slow 3-second descent.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {exercises.filter((e) => e.completed).length}/{exercises.length} Completed
          </span>
        </div>

        {/* Exercises List */}
        <div className="space-y-3">
          {exercises.map((ex, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                ex.completed
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleExercise(idx)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                  >
                    {ex.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{ex.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{ex.leftFocusNotes}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                        {ex.sets} Sets
                      </span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                        {ex.reps} Reps
                      </span>
                      {ex.weightKg !== undefined && ex.weightKg > 0 && (
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                          {ex.weightKg} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleExercise(idx)}
                  className={`text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                    ex.completed
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ex.completed ? 'Logged' : 'Complete Set'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Exercise Form */}
        <form
          onSubmit={handleAddExercise}
          className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-3"
        >
          <div className="text-xs font-semibold text-slate-300">Add Unilateral Knee Exercise</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Exercise name (e.g. Poliquin Step-Up)"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sets:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={newExSets}
                onChange={(e) => setNewExSets(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Reps:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={newExReps}
                onChange={(e) => setNewExReps(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded transition-colors cursor-pointer ml-auto"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Notes & Form Feel */}
        <div className="space-y-2 pt-2 border-t border-slate-800/70">
          <label className="block text-xs font-medium text-slate-300">
            Left Knee Biofeedback & Form Notes:
          </label>
          <textarea
            rows={2}
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Record sensations: e.g. 'Single-leg box squats felt completely aligned, zero lateral wobble...'"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <span className="text-[11px] text-slate-500">Auto-saved when you click away.</span>
        </div>
      </div>
    </div>
  );
};
