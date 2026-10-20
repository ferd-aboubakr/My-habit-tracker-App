import React, { useState } from 'react';
import {
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  BarChart3,
  Percent,
} from 'lucide-react';
import { TaskKpiMeta, DailyLog } from '../types/habits';
import { Language } from '../i18n/translations';

interface KpiStreaksDashboardProps {
  kpis: TaskKpiMeta[];
  logs: Record<string, DailyLog>;
  onNavigateTab: (tabId: string) => void;
  language?: Language;
}

export const KpiStreaksDashboard: React.FC<KpiStreaksDashboardProps> = ({
  kpis,
  logs,
  onNavigateTab,
  language = 'fr',
}) => {
  const isFr = language === 'fr';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', label: isFr ? 'Les 12 Habitudes' : 'All 12 Tasks' },
    { id: 'routine', label: isFr ? 'Routines & Hygiène' : 'Daily Routines & Hygiene' },
    { id: 'nutrition', label: isFr ? 'Nutrition & Repas' : 'Nutrition' },
    { id: 'fitness', label: isFr ? 'Genou & Muscle' : 'Knee & Muscle' },
    { id: 'study', label: isFr ? 'Bureau & ServiceNow' : 'Desk, YouCode & ServiceNow' },
    { id: 'career', label: isFr ? 'Carrière & YouCode' : 'Career & Profiles' },
    { id: 'wellness', label: isFr ? 'Sans Tabac' : 'Smoke-Free Cessation' },
    { id: 'finance', label: isFr ? 'Épargne & Budget' : 'Finance & Savings' },
  ];

  const filteredKpis = kpis.filter((kpi) => {
    const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
    const matchesSearch =
      kpi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate overall aggregates
  const averageCompletionRate = Math.round(
    kpis.reduce((acc, curr) => acc + curr.completionRate30Days, 0) / kpis.length
  );

  const highestStreak = Math.max(...kpis.map((k) => k.currentStreak));
  const activeTodayCount = kpis.filter((k) => k.todayStatus).length;

  // Last 7 days helper
  const past7Days: { dateStr: string; dayLabel: string }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past7Days.push({
      dateStr: d.toISOString().split('T')[0],
      dayLabel: d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { weekday: 'narrow' }),
    });
  }

  return (
    <div className="space-y-8">
      {/* KPI Header Metric Band */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isFr ? 'Taux de Réussite (30 Jours)' : '30-Day Completion Rate'}
            </span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {averageCompletionRate}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {isFr ? 'Très Élevé' : 'Consistently High'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isFr ? 'Moyenne pondérée des 12 habitudes strictes' : 'Weighted across all 12 core habits'}
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isFr ? 'Plus Longue Série Active' : 'Longest Active Streak'}
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {highestStreak}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              {isFr ? 'Jours Consécutifs' : 'Days in a Row'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isFr ? 'Sans Tabac & Focus Bureau en tête' : 'Smoke-Free & Desk Focus leading'}
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isFr ? "Progression d'Aujourd'hui" : "Today's Progress"}
            </span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {activeTodayCount} / {kpis.length}
            </span>
            <span className="text-xs text-sky-400 font-mono">
              {Math.round((activeTodayCount / kpis.length) * 100)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isFr ? "Habitudes cochées aujourd'hui" : 'Active tasks checked today'}
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isFr ? 'Statut Briefs YouCode' : 'Wednesday Briefs Status'}
            </span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              100%
            </span>
            <span className="text-xs text-purple-400 font-mono">
              {isFr ? 'À l’heure' : 'On-Time'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isFr ? '4 livraisons consécutives le mercredi' : '4 consecutive briefs delivered'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Filter habits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-56"
        />
      </div>

      {/* The 12 Tasks KPI Master Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Task Streaks & Completion Percentages ({filteredKpis.length})
            </h3>
            <p className="text-xs text-slate-400">
              Precise metrics for all individual goals and routines.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Updated Real-Time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4">Task & Specific Habit</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Current Streak</th>
                <th className="py-3 px-4">Best Streak</th>
                <th className="py-3 px-4">Completion %</th>
                <th className="py-3 px-4">Today's Metric</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredKpis.map((kpi) => (
                <tr
                  key={kpi.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Task Name & Description */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200 text-sm">{kpi.title}</div>
                    <div className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                      {kpi.description}
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                    {kpi.frequency === 'daily' && 'Daily'}
                    {kpi.frequency === 'weekly_wednesday' && 'Wednesdays'}
                    {kpi.frequency === 'weekend' && 'Weekends (Lunch)'}
                    {kpi.frequency === 'monthly' && 'Monthly'}
                  </td>

                  {/* Current Streak */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Flame
                        className={`w-4 h-4 ${
                          kpi.currentStreak > 0 ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      />
                      <span className="font-semibold text-slate-200 tabular-nums">
                        {kpi.currentStreak}
                      </span>
                      <span className="text-slate-500 text-[11px]">{kpi.unit}</span>
                    </div>
                  </td>

                  {/* Best Streak */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-slate-400">
                    {kpi.bestStreak} {kpi.unit}
                  </td>

                  {/* Completion Rate Bar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-300 font-semibold">
                          {kpi.completionRate30Days}%
                        </span>
                        <span className="text-slate-500">30d</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            kpi.completionRate30Days >= 85
                              ? 'bg-emerald-500'
                              : kpi.completionRate30Days >= 60
                              ? 'bg-sky-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${kpi.completionRate30Days}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Highlight Metric */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded ${
                        kpi.todayStatus
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {kpi.highlightValue}
                    </span>
                  </td>

                  {/* Quick Action Navigation */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        if (kpi.id.includes('knee')) onNavigateTab('knee');
                        else if (kpi.id.includes('study') || kpi.id.includes('desk')) onNavigateTab('study');
                        else if (kpi.id.includes('smoking') || kpi.id.includes('finance')) onNavigateTab('smoke_finance');
                        else if (kpi.id.includes('career') || kpi.id.includes('youcode') || kpi.id.includes('profiles')) onNavigateTab('career');
                        else onNavigateTab('today');
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
