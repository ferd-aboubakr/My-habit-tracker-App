import React, { useState } from 'react';
import { Sparkles, Cloud, CloudOff, Sun, Moon, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SyncStatus } from '../services/cloudSync';
import { Language, Currency, CURRENCIES, translations } from '../i18n/translations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  todayCompletionRate: number;
  syncStatus: SyncStatus;
  onOpenCloudModal: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  todayCompletionRate,
  syncStatus,
  onOpenCloudModal,
  language,
  onLanguageChange,
  currency,
  onCurrencyChange,
  theme,
  onThemeToggle,
}) => {
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const t = translations[language];

  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#38bdf8', '#34d399', '#f59e0b', '#6366f1'],
    });
  };

  const navItems = [
    { id: 'today', label: t.nav.today },
    { id: 'kpis', label: t.nav.kpis },
    { id: 'knee', label: t.nav.knee },
    { id: 'study', label: t.nav.study },
    { id: 'smoke_finance', label: t.nav.smoke_finance },
    { id: 'career', label: t.nav.career },
    { id: 'hosting', label: t.nav.hosting },
    { id: 'tester', label: (t.nav as any).tester || 'Guide & Testeur' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0f17]/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Brand title */}
          <button
            onClick={() => setActiveTab('today')}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></span>
            <span>Ascent</span>
            <span className="hidden sm:inline text-xs font-mono font-normal text-slate-400">KPI Engine</span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-400">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 text-xs md:text-sm ${
                    isActive
                      ? 'text-white border-sky-400 font-semibold'
                      : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions, Language, Currency, Theme & Sync */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Switcher (FR / EN) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs font-mono">
              <button
                onClick={() => onLanguageChange('fr')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  language === 'fr'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Passer en Français"
              >
                FR
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  language === 'en'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Currency Switcher (MAD / EUR / USD) */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-md cursor-pointer flex items-center gap-1"
                title="Change currency (MAD, EUR, USD)"
              >
                <span className="font-semibold text-emerald-400">{CURRENCIES[currency].symbol}</span>
                <span className="hidden sm:inline">{currency}</span>
              </button>

              {showCurrencyMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs">
                  {(Object.keys(CURRENCIES) as Currency[]).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => {
                        onCurrencyChange(cur);
                        setShowCurrencyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between cursor-pointer ${
                        currency === cur ? 'text-sky-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>{CURRENCIES[cur].label}</span>
                      <span className="font-mono">{CURRENCIES[cur].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={onThemeToggle}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-md cursor-pointer transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            </button>

            {/* Cloud Sync Status */}
            <button
              onClick={onOpenCloudModal}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                syncStatus === 'synced'
                  ? 'bg-slate-900/90 text-emerald-400 border-emerald-900/50 hover:bg-slate-800'
                  : syncStatus === 'syncing'
                  ? 'bg-slate-900/90 text-amber-400 border-amber-900/50 hover:bg-slate-800'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Cloud Sync settings & anonymous user key"
            >
              {syncStatus === 'offline' ? (
                <CloudOff className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <Cloud
                  className={`w-3.5 h-3.5 ${
                    syncStatus === 'synced'
                      ? 'text-emerald-400'
                      : syncStatus === 'syncing'
                      ? 'text-amber-400 animate-pulse'
                      : 'text-slate-400'
                  }`}
                />
              )}
              <span className="hidden md:inline">
                {syncStatus === 'synced' && t.header.cloudSynced}
                {syncStatus === 'syncing' && t.header.syncing}
                {syncStatus === 'offline' && t.header.offline}
                {syncStatus === 'error' && 'Cloud'}
                {syncStatus === 'initial' && t.header.connecting}
              </span>
            </button>

            {/* Celebrate button */}
            <button
              onClick={triggerCelebration}
              className="px-2.5 sm:px-3 py-1 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer shadow-sm shadow-sky-500/10"
              title="Celebrate streak & progress"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden lg:inline">{t.header.celebrate}</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Secondary Tab Strip */}
        <div className="xl:hidden flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-slate-800/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
