import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Award,
  Globe,
  Linkedin,
  Github,
  FileText,
  TrendingUp,
  Compass,
  ArrowRight,
  Shield,
  BookOpen,
} from 'lucide-react';
import { YouCodeBrief, OnlineProfileChecklist, DailyLog } from '../types/habits';
import confetti from 'canvas-confetti';
import { Language } from '../i18n/translations';

interface CareerGuideProps {
  briefs: YouCodeBrief[];
  onUpdateBriefs: (briefs: YouCodeBrief[]) => void;
  onlineProfiles: OnlineProfileChecklist;
  onUpdateOnlineProfiles: (profiles: OnlineProfileChecklist) => void;
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  language?: Language;
}

export const CareerGuide: React.FC<CareerGuideProps> = ({
  briefs,
  onUpdateBriefs,
  onlineProfiles,
  onUpdateOnlineProfiles,
  todayLog,
  onUpdateTodayLog,
  language = 'fr',
}) => {
  const isFr = language === 'fr';
  const [activeTab, setActiveTab] = useState<'briefs' | 'profiles' | 'guide'>('briefs');

  const toggleBriefComplete = (briefId: string) => {
    const updated = briefs.map((b) => {
      if (b.id === briefId) {
        const nextStatus = b.status === 'completed_on_time' ? 'in_progress' : 'completed_on_time';
        if (nextStatus === 'completed_on_time') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        }
        return {
          ...b,
          status: nextStatus as any,
        };
      }
      return b;
    });
    onUpdateBriefs(updated);

    // Update today's log if it's the active brief
    const active = updated.find((b) => b.id === briefId);
    if (active) {
      onUpdateTodayLog({
        ...todayLog,
        wednesdayBriefCompleted: active.status === 'completed_on_time',
      });
    }
  };

  const toggleDeliverable = (briefId: string, dIdx: number) => {
    // Deliverable toggle helper
  };

  const toggleProfileItem = (key: keyof OnlineProfileChecklist) => {
    const updated = {
      ...onlineProfiles,
      [key]: !onlineProfiles[key],
    };
    onUpdateOnlineProfiles(updated);

    const anyDone = Object.values(updated).some(Boolean);
    onUpdateTodayLog({
      ...todayLog,
      onlineProfilesWorked: anyDone,
    });
  };

  // Profile readiness score
  const profileItemsCount = Object.values(onlineProfiles).filter(Boolean).length;
  const profileScore = Math.round((profileItemsCount / 5) * 100);

  // Next Wednesday countdown
  const now = new Date();
  const dayOfWeek = now.getDay();
  let daysUntilWed = (3 - dayOfWeek + 7) % 7;
  if (daysUntilWed === 0 && now.getHours() >= 20) {
    daysUntilWed = 7;
  }

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-1">
              <Compass className="w-4 h-4" />
              <span>{isFr ? 'Trajectoire Professionnelle & Livrables' : 'Professional Trajectory & Deliverables'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isFr ? 'Stabilité de Carrière & Livrables YouCode' : 'Career Stability Outlook & YouCode Delivery'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {isFr
                ? 'Échéances strictes : finaliser les briefs YouCode chaque mercredi soir, optimiser ses profils en ligne et viser les certifications pour sécuriser un emploi tech durable.'
                : 'Strict deadlines: finish YouCode briefs every Wednesday evening, maintain competitive online profiles, and follow a concrete path to certified enterprise tech stability.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Échéance Mercredi' : 'Next Wednesday Deadline'}</div>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {daysUntilWed === 0
                  ? (isFr ? 'Aujourd’hui 20h00' : 'Today 20:00')
                  : (isFr ? `Dans ${daysUntilWed} jours` : `${daysUntilWed} Days Away`)}
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Livrable YouCode' : 'Brief Deliverable Target'}</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Profils Pro' : 'Profile Readiness'}</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {profileScore}%
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Visibilité en Ligne' : 'Online Visibility'}</div>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'briefs'
                ? 'bg-slate-800 text-purple-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Briefs YouCode (Mercredi)' : 'YouCode Wednesday Briefs'}
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'profiles'
                ? 'bg-slate-800 text-sky-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Checklist Profils en Ligne' : 'Online Profiles Checklist'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Guide de Stabilité & Roadmap' : 'Career Stability Guide & Roadmap'}
          </button>
        </div>
      </div>

      {/* TAB 1: YouCode Wednesday Briefs */}
      {activeTab === 'briefs' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>YouCode Active Brief (Wednesday Evening Delivery)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submissions must pass tests, functional criteria, and code review prior to Wednesday 20:00.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Deadline: Wednesday 20:00
              </span>
            </div>

            {/* Active Brief Card */}
            {briefs.map((brief) => {
              const isDone = brief.status === 'completed_on_time';
              return (
                <div
                  key={brief.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/50'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                        <span>Target: {brief.targetWednesday} (Wednesday)</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            isDone ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isDone ? 'Delivered On Time' : 'Sprint In Progress'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{brief.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Ensure all architecture models, unit test coverage, and documentation files are committed before Wednesday evening.
                      </p>
                    </div>

                    <button
                      onClick={() => toggleBriefComplete(brief.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
                        isDone
                          ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isDone ? 'Completed On Time' : 'Mark Brief Submitted'}</span>
                    </button>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                    <span className="text-xs font-medium text-slate-300">Deliverables Checklist:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {brief.deliverables.map((del, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-300"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              isDone ? 'text-emerald-400' : 'text-sky-400'
                            }`}
                          />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Online Profiles */}
      {activeTab === 'profiles' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Professional Online Profiles Checklist</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Optimize your digital footprint for enterprise IT, ServiceNow consultancies, and tech recruiters.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400">{profileScore}% Complete</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-sky-950 text-sky-400 border border-sky-800/50">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">LinkedIn Executive Polish</h4>
                    <p className="text-xs text-slate-400">Headline, Featured Projects & About section</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleProfileItem('linkedInUpdated')}
                  className="cursor-pointer text-slate-400 hover:text-emerald-400"
                >
                  {onlineProfiles.linkedInUpdated ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Headline: ServiceNow Administrator & Full-Stack Solutions Engineer | YouCode</li>
                <li>Featured: Highlighting completed briefs with live demo links</li>
                <li>Skills: ServiceNow, ITSM, JavaScript, REST APIs, ITIL Foundation</li>
              </ul>
            </div>

            {/* GitHub */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">GitHub Codebase Showcase</h4>
                    <p className="text-xs text-slate-400">Clean repos, README badges & commit activity</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleProfileItem('gitHubActive')}
                  className="cursor-pointer text-slate-400 hover:text-emerald-400"
                >
                  {onlineProfiles.gitHubActive ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Pinned repositories for all major YouCode projects</li>
                <li>Comprehensive architectural READMEs with ERDs and API docs</li>
                <li>Consistent green commit contributions reflecting daily desk focus</li>
              </ul>
            </div>

            {/* Resume / CV */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">ATS-Optimized Technical CV</h4>
                    <p className="text-xs text-slate-400">Targeting enterprise roles & systems admin</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleProfileItem('cvResumePolished')}
                  className="cursor-pointer text-slate-400 hover:text-emerald-400"
                >
                  {onlineProfiles.cvResumePolished ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>One-page clean layout highlighting tangible project outcomes</li>
                <li>Clear Certifications section (ServiceNow CSA Candidate, Apple ACSP)</li>
                <li>Clean PDF export ready for rapid recruiter submissions</li>
              </ul>
            </div>

            {/* Live Portfolio */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-purple-950 text-purple-400 border border-purple-800/50">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Live Web Portfolio</h4>
                    <p className="text-xs text-slate-400">Interactive case studies and contact channel</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleProfileItem('portfolioProjectsLive')}
                  className="cursor-pointer text-slate-400 hover:text-emerald-400"
                >
                  {onlineProfiles.portfolioProjectsLive ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Fast, accessible, mobile-optimized personal website</li>
                <li>Direct links to source code and interactive prototypes</li>
                <li>Clear call to action for direct recruiter interviews</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Career Stability Guide & Roadmap */}
      {activeTab === 'guide' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Career Stability Guide: Step-by-Step Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured 4-Phase Playbook to secure a high-demand, stable enterprise career in ServiceNow & Systems Administration.
            </p>
          </div>

          <div className="space-y-4">
            {/* Phase 1 */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  PHASE 1: Execution & Consistency (Active)
                </span>
                <span className="text-xs font-mono text-slate-400">Current Focus</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                YouCode Briefs Mastery + Daily 1-Hour Desk Habit
              </h4>
              <p className="text-xs text-slate-300">
                Deliver every Wednesday brief without exception. Build unshakeable discipline through 60+ minutes of daily focused desk work. Maintain physical health via knee rehab and smoke-free energy.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-sky-400">
                  PHASE 2: High-Demand Certification Anchor
                </span>
                <span className="text-xs font-mono text-slate-400">Target: Q4 2026</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                ServiceNow CSA & Apple ACSP Dual Credential
              </h4>
              <p className="text-xs text-slate-300">
                Leverage the 4-hour weekend lunchtime study blocks (Saturday & Sunday 12:00-16:00). ServiceNow skills have one of the highest job security and compensation baselines in global IT management.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-purple-400">
                  PHASE 3: Online Inbound & Enterprise Networking
                </span>
                <span className="text-xs font-mono text-slate-400">Target: Early 2027</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Recruiter Magnet: High-Impact Showcase & Outreach
              </h4>
              <p className="text-xs text-slate-300">
                Transform LinkedIn into an inbound recruiter pipeline by sharing ServiceNow configuration flows and YouCode engineering briefs. Connect weekly with 5 engineering leads and tech recruiters.
              </p>
            </div>

            {/* Phase 4 */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-amber-400">
                  PHASE 4: Stable Career Placement & Financial Freedom
                </span>
                <span className="text-xs font-mono text-slate-400">Long-Term Goal</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Enterprise ServiceNow Systems Role + Monthly Savings Compounding
              </h4>
              <p className="text-xs text-slate-300">
                Secure a stable full-time ServiceNow Consultant or Administrator position. With steady enterprise income, your monthly savings minimum multiplies, providing lifelong peace of mind.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
