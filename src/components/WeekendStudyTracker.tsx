import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  BookOpen,
  Award,
  Zap,
  Laptop,
} from 'lucide-react';
import { DailyLog } from '../types/habits';
import confetti from 'canvas-confetti';
import { Language } from '../i18n/translations';

interface WeekendStudyTrackerProps {
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  logs: Record<string, DailyLog>;
  language?: Language;
}

export const WeekendStudyTracker: React.FC<WeekendStudyTrackerProps> = ({
  todayLog,
  onUpdateTodayLog,
  logs,
  language = 'fr',
}) => {
  const isFr = language === 'fr';
  // Timer state (seconds)
  const [timerMode, setTimerMode] = useState<'desk_60' | 'weekend_240'>('desk_60');
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 mins default
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionNote, setSessionNote] = useState<string>('');

  // ServiceNow CSA & ACSP Syllabus Objectives
  const [serviceNowModules, setServiceNowModules] = useState([
    { title: 'User Interface & Navigation (List & Form layout)', completed: true },
    { title: 'Collaboration & Task Management (Connect, SLA, Workflows)', completed: true },
    { title: 'Database Administration (Tables, Records, Dictionary & Schema)', completed: true },
    { title: 'Self-Service & Process Automation (Flow Designer, Scripting Basics)', completed: false },
    { title: 'Security & Access Control (Roles, ACLs, Contextual Security)', completed: false },
    { title: 'Introduction to Development & Update Sets', completed: false },
  ]);

  const [acspModules, setAcspModules] = useState([
    { title: 'macOS Installation & Recovery Environment', completed: true },
    { title: 'User Accounts, Keychain & FileVault Security', completed: true },
    { title: 'File Systems, APFS Snapshots & Permissions', completed: true },
    { title: 'Network Configuration & Troubleshooting', completed: false },
    { title: 'Peripheral Management & System Diagnostics', completed: false },
  ]);

  // Timer interval hook
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });

      // Automatically log minutes
      const completedMinutes = timerMode === 'desk_60' ? 60 : 240;
      if (timerMode === 'desk_60') {
        onUpdateTodayLog({
          ...todayLog,
          deskHourDone: true,
          deskMinutesLogged: (todayLog.deskMinutesLogged || 0) + 60,
        });
      } else {
        onUpdateTodayLog({
          ...todayLog,
          weekendStudyDone: true,
          studyMinutesLogged: (todayLog.studyMinutesLogged || 0) + 240,
        });
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode, todayLog, onUpdateTodayLog]);

  const switchMode = (mode: 'desk_60' | 'weekend_240') => {
    setTimerMode(mode);
    setIsRunning(false);
    setTimeLeft(mode === 'desk_60' ? 60 * 60 : 240 * 60);
  };

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMode === 'desk_60' ? 60 * 60 : 240 * 60);
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const toggleServiceNowModule = (index: number) => {
    const next = [...serviceNowModules];
    next[index].completed = !next[index].completed;
    setServiceNowModules(next);
  };

  const toggleAcspModule = (index: number) => {
    const next = [...acspModules];
    next[index].completed = !next[index].completed;
    setAcspModules(next);
  };

  // Quick manual add
  const addQuickDeskHour = () => {
    onUpdateTodayLog({
      ...todayLog,
      deskHourDone: true,
      deskMinutesLogged: Math.max(60, (todayLog.deskMinutesLogged || 0) + 60),
    });
    confetti({ particleCount: 30, spread: 40 });
  };

  const addQuickWeekendBlock = () => {
    onUpdateTodayLog({
      ...todayLog,
      weekendStudyDone: true,
      studyMinutesLogged: 240,
    });
    confetti({ particleCount: 40, spread: 60 });
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1">
              <Laptop className="w-4 h-4" />
              <span>{isFr ? 'Focus Technique Approfondi & Certifications' : 'Deep Technical Focus & Certification Pipeline'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isFr ? 'ServiceNow, ACSP & Travail au Bureau' : 'ServiceNow, ACSP & Daily Desk Tracker'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {isFr
                ? 'Règles strictes : minimum 1h par jour de focus sur bureau + créneau dédié de 4h le weekend (12h00 – 16h00 samedi & dimanche) pour ServiceNow CSA et Apple ACSP.'
                : 'Strict rules: Daily minimum 1 hour desk focus + dedicated 4-hour weekend block (12:00 PM – 4:00 PM Saturday & Sunday) for ServiceNow CSA and Apple ACSP certification mastery.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Focus Bureau du Jour' : 'Desk Focus Today'}</div>
              <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                {todayLog.deskMinutesLogged || 0}
                <span className="text-xs text-slate-500 font-normal"> / 60 {isFr ? 'min' : 'mins'}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {todayLog.deskHourDone
                  ? (isFr ? 'Objectif Atteint' : 'Target Met')
                  : (isFr ? 'En Cours' : 'In Progress')}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Bloc Weekend 4h' : 'Weekend 4h Block'}</div>
              <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
                {todayLog.studyMinutesLogged || 0}
                <span className="text-xs text-slate-500 font-normal"> / 240 {isFr ? 'min' : 'mins'}</span>
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Sam/Dim 12h-16h' : 'Sat/Sun 12:00-16:00'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Timer Suite */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-white">Interactive Session Stopwatch & Timer</h3>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => switchMode('desk_60')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timerMode === 'desk_60'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily 1-Hour Desk Session
            </button>
            <button
              onClick={() => switchMode('weekend_240')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timerMode === 'weekend_240'
                  ? 'bg-slate-800 text-purple-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekend 4-Hour Lunch Block
            </button>
          </div>
        </div>

        {/* Large Timer Display */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
            {timerMode === 'desk_60' ? 'Daily Desk Focus Target: 60:00' : 'Weekend Lunch Block Target: 4:00:00'}
          </span>
          <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight text-white tabular-nums my-2">
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {isRunning ? 'Session Active — Flow State On' : 'Ready to start'}
          </span>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={toggleRun}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Focus' : 'Start Focus'}</span>
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Quick Log Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400">Quick-log without running the real-time clock:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={addQuickDeskHour}
              className="px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 text-sky-300 rounded font-medium cursor-pointer"
            >
              + Log 1-Hour Desk Completed
            </button>
            <button
              onClick={addQuickWeekendBlock}
              className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/60 text-purple-300 rounded font-medium cursor-pointer"
            >
              + Log 4-Hour Weekend Block Completed
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Tracker: ServiceNow CSA & Apple ACSP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ServiceNow CSA */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">ServiceNow CSA Certification Roadmap</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {serviceNowModules.filter((m) => m.completed).length}/{serviceNowModules.length} Done
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Key domains tested in the ServiceNow Certified System Administrator examination:
          </p>

          <div className="space-y-2">
            {serviceNowModules.map((mod, idx) => (
              <div
                key={idx}
                onClick={() => toggleServiceNowModule(idx)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                  mod.completed
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span>{mod.title}</span>
                {mod.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Apple ACSP */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Apple ACSP Certification Roadmap</h3>
            </div>
            <span className="text-xs font-mono text-sky-400">
              {acspModules.filter((m) => m.completed).length}/{acspModules.length} Done
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Key domains tested in Apple Certified Support Professional (macOS deployment & support):
          </p>

          <div className="space-y-2">
            {acspModules.map((mod, idx) => (
              <div
                key={idx}
                onClick={() => toggleAcspModule(idx)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                  mod.completed
                    ? 'bg-sky-950/30 border-sky-800/50 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span>{mod.title}</span>
                {mod.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 ml-2" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
