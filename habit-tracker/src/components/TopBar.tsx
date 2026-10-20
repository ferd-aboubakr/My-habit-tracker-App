import React from 'react';
import {
  Menu,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  Cloud,
  CloudOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SyncStatus } from '../services/cloudSync';
import { Language, Currency, translations } from '../i18n/translations';

interface TopBarProps {
  activeTab: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  todayCompletionRate: number;
  syncStatus: SyncStatus;
  onOpenCloudModal: () => void;
  currentDateStr: string;
  onNavigateDay: (offset: number) => void;
  onJumpToToday: () => void;
  isViewingToday: boolean;
  onExportData: () => void;
  language: Language;
  isAccessibilityMode?: boolean;
  onToggleAccessibilityMode?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  todayCompletionRate,
  syncStatus,
  onOpenCloudModal,
  currentDateStr,
  onNavigateDay,
  onJumpToToday,
  isViewingToday,
  onExportData,
  language,
  isAccessibilityMode,
  onToggleAccessibilityMode,
}) => {
  const t = translations[language];

  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#38bdf8', '#34d399', '#f59e0b', '#6366f1'],
    });
  };

  // Get human readable tab name
  const tabTitles: Record<string, string> = {
    today: t.nav.today,
    kpis: t.nav.kpis,
    whatsapp: (t.nav as any).whatsapp || (language === 'fr' ? 'WhatsApp & Rappels Auto' : 'WhatsApp & AI Parser'),
    ai_coach: (t.nav as any).ai_coach || (language === 'fr' ? 'Coach IA & Briefing Matin' : 'AI Coach & Morning Mail'),
    knee: t.nav.knee,
    study: t.nav.study,
    smoke_finance: t.nav.smoke_finance,
    career: t.nav.career,
    integrations: (t.nav as any).integrations || (language === 'fr' ? 'Intégrations & MCP' : 'Integrations & MCP'),
    hosting: t.nav.hosting,
    tester: (t.nav as any).tester || (language === 'fr' ? 'Guide & Testeur' : 'Live Tester & Guide'),
    docs: (t.nav as any).docs || (language === 'fr' ? 'Livre Blanc & Produit' : 'Product Suite & Docs'),
  };

  const currentTabTitle = tabTitles[activeTab] || t.nav.today;

  return (
    <header className="sticky top-0 z-30 bg-[#0c0f17]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left Zone: Sidebar toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Retract Toggle */}
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Déplier la barre de navigation' : 'Rétracter la barre de navigation'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-4 h-4 text-sky-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono hidden sm:inline">Ascent</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-white font-semibold truncate max-w-[150px] sm:max-w-none">
                {currentTabTitle}
              </span>
            </div>
          </div>

          {/* Center Zone: Date Navigator */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1">
              <button
                onClick={() => onNavigateDay(-1)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="Jour Précédent"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-medium text-slate-200 px-1">
                {currentDateStr}
              </span>
              <button
                onClick={() => onNavigateDay(1)}
                disabled={isViewingToday}
                className={`p-0.5 cursor-pointer ${
                  isViewingToday
                    ? 'text-slate-700 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Jour Suivant"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isViewingToday && (
              <button
                onClick={onJumpToToday}
                className="text-sky-400 hover:text-sky-300 font-medium px-2 py-1 rounded-md bg-sky-950/40 border border-sky-800/40 cursor-pointer"
              >
                {t.common.jumpToToday}
              </button>
            )}
          </div>

          {/* Right Zone: Cloud Sync, Today Progress, Celebrate & Export */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cloud Sync Status */}
            <button
              onClick={onOpenCloudModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                syncStatus === 'synced'
                  ? 'bg-slate-900/90 text-emerald-400 border-emerald-900/50 hover:bg-slate-800'
                  : syncStatus === 'syncing'
                  ? 'bg-slate-900/90 text-amber-400 border-amber-900/50 hover:bg-slate-800'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Statut Cloud & Clé UUID"
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
              <span className="hidden sm:inline">
                {syncStatus === 'synced' && (language === 'fr' ? 'Supabase Connecté' : 'Supabase Synced')}
                {syncStatus === 'syncing' && t.header.syncing}
                {syncStatus === 'offline' && t.header.offline}
                {syncStatus === 'error' && 'Cloud'}
                {syncStatus === 'initial' && t.header.connecting}
              </span>
            </button>

            {/* Today Score Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono tabular-nums bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-500">{t.header.todayDone}:</span>
              <span className="text-emerald-400 font-bold">{todayCompletionRate}%</span>
            </div>

            {/* Accessibility / Voice Mode Toggle */}
            {onToggleAccessibilityMode && (
              <button
                onClick={onToggleAccessibilityMode}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  isAccessibilityMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title={isAccessibilityMode ? 'Désactiver le mode vocal' : 'Activer le mode vocal & facile'}
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline text-[11px] font-medium">
                  {isAccessibilityMode ? 'Vocal Activé' : 'Mode Vocal'}
                </span>
              </button>
            )}

            {/* Celebrate button */}
            <button
              onClick={triggerCelebration}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/10"
              title="Célébrer la série"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.header.celebrate}</span>
            </button>

            {/* Export backup */}
            <button
              onClick={onExportData}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title={t.common.exportBackup}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Date Switcher Bar (only on smaller screens) */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
            <button
              onClick={() => onNavigateDay(-1)}
              className="text-slate-400 p-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-200 px-1">{currentDateStr}</span>
            <button
              onClick={() => onNavigateDay(1)}
              disabled={isViewingToday}
              className="text-slate-400 p-0.5"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {!isViewingToday && (
            <button
              onClick={onJumpToToday}
              className="text-sky-400 font-medium px-2 py-0.5 rounded bg-sky-950/40 border border-sky-800/40"
            >
              {t.common.jumpToToday}
            </button>
          )}
          <span className="text-emerald-400 font-mono font-bold">{todayCompletionRate}% Complété</span>
        </div>
      </div>
    </header>
  );
};
