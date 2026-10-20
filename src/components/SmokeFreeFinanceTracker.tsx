import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  DollarSign,
  Heart,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Droplet,
  Package,
} from 'lucide-react';
import {
  SmokeFreeData,
  FinanceSummary,
  FinanceTransaction,
  DailyLog,
} from '../types/habits';
import confetti from 'canvas-confetti';

import { Currency, Language, formatCurrency, CURRENCIES } from '../i18n/translations';

interface SmokeFreeFinanceTrackerProps {
  smokeFreeData: SmokeFreeData;
  onUpdateSmokeFreeData: (data: SmokeFreeData) => void;
  financeSummary: FinanceSummary;
  onUpdateFinanceSummary: (summary: FinanceSummary) => void;
  transactions: FinanceTransaction[];
  onUpdateTransactions: (txs: FinanceTransaction[]) => void;
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  currency?: Currency;
  language?: Language;
}

export const SmokeFreeFinanceTracker: React.FC<SmokeFreeFinanceTrackerProps> = ({
  smokeFreeData,
  onUpdateSmokeFreeData,
  financeSummary,
  onUpdateFinanceSummary,
  transactions,
  onUpdateTransactions,
  todayLog,
  onUpdateTodayLog,
  currency = 'MAD',
  language = 'fr',
}) => {
  const isFr = language === 'fr';
  // Live ticker for smoke-free duration
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  // Finance form state
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState<number>(20);
  const [txCategory, setTxCategory] = useState<
    'savings_reserve' | 'hygiene_products' | 'nutrition' | 'learning_career' | 'general'
  >('hygiene_products');

  useEffect(() => {
    const updateDuration = () => {
      const quit = new Date(smokeFreeData.quitDate).getTime();
      const now = new Date().getTime();
      const diffSecs = Math.max(0, Math.floor((now - quit) / 1000));

      const days = Math.floor(diffSecs / 86400);
      const hours = Math.floor((diffSecs % 86400) / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      setElapsed({ days, hours, minutes, seconds, totalSeconds: diffSecs });
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [smokeFreeData.quitDate]);

  // Money saved calculation
  const daysSmokeFree = elapsed.days + elapsed.hours / 24;
  const moneySaved = Math.round(
    daysSmokeFree * smokeFreeData.packsPerDay * smokeFreeData.costPerPack
  );

  const handleResistUrge = () => {
    const nextUrges = smokeFreeData.urgesResisted + 1;
    const updated = {
      ...smokeFreeData,
      urgesResisted: nextUrges,
      lastUrgeLogged: new Date().toISOString(),
    };
    onUpdateSmokeFreeData(updated);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#fbbf24'],
    });
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription.trim() || txAmount <= 0) return;

    const newTx: FinanceTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: txDescription.trim(),
      amount: txAmount,
      category: txCategory,
    };

    const updatedTxs = [newTx, ...transactions];
    onUpdateTransactions(updatedTxs);

    // Update summary
    if (txCategory === 'savings_reserve') {
      onUpdateFinanceSummary({
        ...financeSummary,
        currentSavedThisMonth: financeSummary.currentSavedThisMonth + txAmount,
      });
    } else if (txCategory === 'hygiene_products') {
      onUpdateFinanceSummary({
        ...financeSummary,
        hygieneSpentThisMonth: financeSummary.hygieneSpentThisMonth + txAmount,
      });
    }

    setTxDescription('');
    setTxAmount(20);

    onUpdateTodayLog({
      ...todayLog,
      financeBudgetTracked: true,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const updated = transactions.filter((t) => t.id !== id);
    onUpdateTransactions(updated);

    if (tx.category === 'savings_reserve') {
      onUpdateFinanceSummary({
        ...financeSummary,
        currentSavedThisMonth: Math.max(0, financeSummary.currentSavedThisMonth - tx.amount),
      });
    } else if (tx.category === 'hygiene_products') {
      onUpdateFinanceSummary({
        ...financeSummary,
        hygieneSpentThisMonth: Math.max(0, financeSummary.hygieneSpentThisMonth - tx.amount),
      });
    }
  };

  // Health milestones data
  const healthMilestones = [
    {
      title: '20 Minutes: Pulse & Blood Pressure Normalize',
      hoursReq: 0.33,
      description: 'Your circulation begins to rebound from nicotine constriction.',
    },
    {
      title: '8 Hours: Oxygen Levels Restore',
      hoursReq: 8,
      description: 'Carbon monoxide in your blood drops to normal levels; cellular oxygen doubles.',
    },
    {
      title: '48 Hours: Nerve Endings Heal & Taste/Smell Returns',
      hoursReq: 48,
      description: 'Sensory clarity sharpens and food flavours return noticeably.',
    },
    {
      title: '72 Hours: Bronchial Tubes Relax & Breathing Deepens',
      hoursReq: 72,
      description: 'Lungs begin expelling residue; lung volume and energy spike.',
    },
    {
      title: '2 Weeks: Circulation & Left Knee Healing Accelerate',
      hoursReq: 336, // 14 days
      description: 'Blood supply to muscle tissue & knee tendons surges, boosting hypertrophy.',
    },
  ];

  const totalHoursElapsed = elapsed.totalSeconds / 3600;

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Clean Living & Financial Safeguard</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Smoke-Free Cessation & Financial Minimums
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Protect your health and your wallet: zero tobacco consumption, guaranteed monthly savings minimum, and protected budget for essential hygiene products.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Argent Économisé' : 'Total Money Saved'}</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(moneySaved, currency)}
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Non dépensé en cigarettes' : 'Unspent on Cigarettes'}</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400">{isFr ? 'Épargne Mensuelle' : 'Monthly Savings'}</div>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {formatCurrency(financeSummary.currentSavedThisMonth, currency)}
                <span className="text-xs text-slate-500 font-normal"> / {formatCurrency(financeSummary.monthlySavingsTarget, currency)}</span>
              </div>
              <div className="text-[11px] text-slate-500">{isFr ? 'Coussin protégé' : 'Target Protected'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Smoke-Free Cessation Live Counter */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Smoke-Free Live Ticker</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously counting every second of freedom and respiratory regeneration.
            </p>
          </div>

          <button
            onClick={handleResistUrge}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-rose-950"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I Defeated an Urge! (+1)</span>
          </button>
        </div>

        {/* 4 Clock Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Days</span>
            <div className="text-4xl font-mono font-bold text-white tabular-nums my-1">
              {elapsed.days}
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">Clean & Sober</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Hours</span>
            <div className="text-4xl font-mono font-bold text-slate-200 tabular-nums my-1">
              {elapsed.hours.toString().padStart(2, '0')}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Oxygen Restored</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Minutes</span>
            <div className="text-4xl font-mono font-bold text-slate-200 tabular-nums my-1">
              {elapsed.minutes.toString().padStart(2, '0')}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Circulation Gained</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Seconds</span>
            <div className="text-4xl font-mono font-bold text-sky-400 tabular-nums my-1">
              {elapsed.seconds.toString().padStart(2, '0')}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Continuous</span>
          </div>
        </div>

        {/* Cravings Resisted Counter & Financial Gains */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">Total Cravings Defeated</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {smokeFreeData.urgesResisted} Urges Resisted
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Each urge lasts only ~3 minutes. You conquered every single one.</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">Packs Not Smoked</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {(daysSmokeFree * smokeFreeData.packsPerDay).toFixed(1)} Packs Avoided
            </div>
            <p className="text-[11px] text-slate-500 mt-1">~280 toxic cigarettes prevented from entering your body.</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-xs text-slate-400">Direct Capital Saved</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              ${moneySaved} Retained
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Can be reallocated to monthly savings & hygiene products.</p>
          </div>
        </div>

        {/* Health Recovery Milestones */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Physiological Recovery Progress
          </h4>
          <div className="space-y-2.5">
            {healthMilestones.map((milestone, idx) => {
              const isAchieved = totalHoursElapsed >= milestone.hoursReq;
              const progressPct = Math.min(
                100,
                Math.round((totalHoursElapsed / milestone.hoursReq) * 100)
              );
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    isAchieved
                      ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{milestone.title}</span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      {isAchieved ? '100% Achieved' : `${progressPct}%`}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{milestone.description}</p>
                  {!isAchieved && (
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: Monthly Finances & Hygiene Products Budget */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Monthly Finances & Hygiene Products Allocation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Guaranteed minimum savings cushion + reserved funds for personal care and toiletries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Savings Target:</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              ${financeSummary.monthlySavingsTarget}/mo minimum
            </span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Minimum Savings Bar */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{isFr ? 'Épargne Minimum Stable' : 'Stable Minimum Savings'}</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(financeSummary.currentSavedThisMonth, currency)} / {formatCurrency(financeSummary.monthlySavingsTarget, currency)} (
                {Math.round(
                  (financeSummary.currentSavedThisMonth / financeSummary.monthlySavingsTarget) * 100
                )}
                %)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (financeSummary.currentSavedThisMonth / financeSummary.monthlySavingsTarget) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {isFr ? 'Ne jamais toucher ce coussin. Garantie d’indépendance financière.' : 'Never touch this cushion. Guaranteed financial runway and independence.'}
            </p>
          </div>

          {/* Hygiene Products Budget */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{isFr ? 'Budget Hygiène Dédié' : 'Dedicated Hygiene Fund'}</span>
              <span className="font-mono font-bold text-sky-400">
                {formatCurrency(financeSummary.hygieneSpentThisMonth, currency)} / {formatCurrency(financeSummary.hygieneBudgetMonthly, currency)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (financeSummary.hygieneSpentThisMonth / financeSummary.hygieneBudgetMonthly) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {isFr ? 'Réservé aux gels douche, brosses à dents, déodorant et soins.' : 'Reserved strictly for shower gels, oral care, deodorant, clean grooming, and towels.'}
            </p>
          </div>
        </div>

        {/* Add Transaction Form */}
        <form
          onSubmit={handleAddTransaction}
          className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3"
        >
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Record Finance Entry / Expense</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Description (e.g. Toothpaste, soap, or savings deposit)"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-mono font-bold text-emerald-400">
                {CURRENCIES[currency].symbol}
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={txAmount}
                onChange={(e) => setTxAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white font-mono"
              />
            </div>
            <select
              value={txCategory}
              onChange={(e: any) => setTxCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white"
            >
              <option value="hygiene_products">{isFr ? 'Produits d\'Hygiène' : 'Hygiene Products'}</option>
              <option value="savings_reserve">{isFr ? 'Dépôt Réserve Épargne' : 'Savings Reserve Deposit'}</option>
              <option value="nutrition">{isFr ? 'Nutrition / Repas Complets' : 'Nutrition / Full Meals'}</option>
              <option value="learning_career">{isFr ? 'Formation / Carrière' : 'Learning / Career'}</option>
              <option value="general">{isFr ? 'Général' : 'General'}</option>
            </select>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              {isFr ? 'Ajouter la Transaction' : 'Add Entry'}
            </button>
          </div>
        </form>

        {/* Transaction History Table */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">
            {isFr ? 'Grand Livre Financier Récent' : 'Recent Financial Ledger'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">{isFr ? 'Date' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isFr ? 'Description' : 'Description'}</th>
                  <th className="py-2.5 px-3">{isFr ? 'Catégorie' : 'Category'}</th>
                  <th className="py-2.5 px-3">{isFr ? 'Montant' : 'Amount'}</th>
                  <th className="py-2.5 px-3 text-right">{isFr ? 'Action' : 'Delete'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{tx.date}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">{tx.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {tx.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title={isFr ? 'Supprimer' : 'Remove transaction'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
