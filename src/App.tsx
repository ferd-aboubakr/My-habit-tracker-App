/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SidebarNavbar } from './components/SidebarNavbar';
import { TopBar } from './components/TopBar';
import { TodayChecklist } from './components/TodayChecklist';
import { KpiStreaksDashboard } from './components/KpiStreaksDashboard';
import { KneeRehabTracker } from './components/KneeRehabTracker';
import { WeekendStudyTracker } from './components/WeekendStudyTracker';
import { SmokeFreeFinanceTracker } from './components/SmokeFreeFinanceTracker';
import { CareerGuide } from './components/CareerGuide';
import { CloudSyncModal } from './components/CloudSyncModal';
import { HostingGuide } from './components/HostingGuide';
import { UserGuideAndTester } from './components/UserGuideAndTester';
import { ProductSuiteDocs } from './components/ProductSuiteDocs';
import { WhatsAppAssistant } from './components/WhatsAppAssistant';
import { AiCoachMorningHub } from './components/AiCoachMorningHub';
import { IntegrationsMcpHub } from './components/IntegrationsMcpHub';
import {
  loadDailyLogs,
  saveDailyLogs,
  loadSmokeFreeData,
  saveSmokeFreeData,
  loadFinanceSummary,
  saveFinanceSummary,
  loadFinanceTransactions,
  saveFinanceTransactions,
  loadYouCodeBriefs,
  saveYouCodeBriefs,
  loadOnlineProfiles,
  saveOnlineProfiles,
  computeAllTaskKpis,
  getTodayDateString,
  createEmptyDailyLog,
} from './services/storage';
import {
  getOrCreateClientUuid,
  saveClientUuid,
  fetchRemoteSyncData,
  pushRemoteSyncData,
  getLastSyncedTime,
  setLastSyncedTime,
  generateClientUuid,
  AppSyncData,
  SyncStatus,
} from './services/cloudSync';
import {
  loadSupabaseConfig,
  syncToSupabase,
  fetchFromSupabase,
} from './services/supabaseSync';
import {
  Language,
  Currency,
  translations,
} from './i18n/translations';
import {
  DailyLog,
  SmokeFreeData,
  FinanceSummary,
  FinanceTransaction,
  YouCodeBrief,
  OnlineProfileChecklist,
} from './types/habits';
import {
  Cloud,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('today');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [currentDateStr, setCurrentDateStr] = useState<string>(getTodayDateString());
  const [smokeFreeData, setSmokeFreeData] = useState<SmokeFreeData | null>(null);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [briefs, setBriefs] = useState<YouCodeBrief[]>([]);
  const [onlineProfiles, setOnlineProfiles] = useState<OnlineProfileChecklist | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Retractable Sidebar state (desktop collapse + mobile drawer)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ascent_sidebar_collapsed_v1') === 'true';
    } catch {}
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ascent_sidebar_collapsed_v1', String(next));
      } catch {}
      return next;
    });
  };

  // Localization, Currency & Theme preferences (default Moroccan Dirham & French)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ascent_lang_v1');
      if (saved === 'fr' || saved === 'en') return saved;
    } catch {}
    return 'fr'; // French default as requested for Morocco
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('ascent_currency_v1');
      if (saved === 'MAD' || saved === 'EUR' || saved === 'USD') return saved;
    } catch {}
    return 'MAD'; // Moroccan Dirham default
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('ascent_theme_v1');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // Accessibility & Speech (Voice / High Contrast Mode)
  const [isAccessibilityMode, setIsAccessibilityMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ascent_accessibility_mode_v1') === 'true';
    } catch {}
    return false;
  });

  const toggleAccessibilityMode = () => {
    setIsAccessibilityMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ascent_accessibility_mode_v1', String(next));
      } catch {}
      return next;
    });
  };

  // Cloud sync & anonymous client UUID states
  const [userUuid, setUserUuid] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('initial');
  const [lastSyncedTime, setLastSyncedTimeState] = useState<string | null>(getLastSyncedTime());
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);

  const syncTimerRef = useRef<any>(null);

  // Apply theme class to document
  useEffect(() => {
    try {
      localStorage.setItem('ascent_theme_v1', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.body.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light');
      }
    } catch {}
  }, [theme]);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('ascent_lang_v1', newLang);
    } catch {}
  };

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    try {
      localStorage.setItem('ascent_currency_v1', newCurr);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize data and cloud sync on mount
  useEffect(() => {
    const loadedLogs = loadDailyLogs();
    const loadedSmoke = loadSmokeFreeData();
    const loadedFin = loadFinanceSummary();
    const loadedTx = loadFinanceTransactions();
    const loadedBriefs = loadYouCodeBriefs();
    const loadedProfiles = loadOnlineProfiles();

    setLogs(loadedLogs);
    setSmokeFreeData(loadedSmoke);
    setFinanceSummary(loadedFin);
    setTransactions(loadedTx);
    setBriefs(loadedBriefs);
    setOnlineProfiles(loadedProfiles);
    setIsLoaded(true);

    // Retrieve or generate random client UUID key
    const clientKey = getOrCreateClientUuid();
    setUserUuid(clientKey);

    // Connect to cloud backend (Supabase or built-in /api/sync)
    const initCloudSync = async () => {
      setSyncStatus('syncing');
      const supabaseConfig = loadSupabaseConfig();

      try {
        // If Supabase is enabled, attempt fetching from Supabase first
        if (supabaseConfig.enabled) {
          const supaRes = await fetchFromSupabase(clientKey);
          if (supaRes.found && supaRes.data) {
            applyRemotePayload(supaRes.data);
            setSyncStatus('synced');
            return;
          }
        }

        // Standard cloud backend API fetch
        const remote = await fetchRemoteSyncData(clientKey);
        if (remote.found && remote.data) {
          applyRemotePayload(remote.data);
          setSyncStatus('synced');
          if (remote.updatedAt) {
            setLastSyncedTimeState(remote.updatedAt);
            setLastSyncedTime(remote.updatedAt);
          }
        } else {
          // Push initial local state
          const initialPayload: AppSyncData = {
            logs: loadedLogs,
            smokeFreeData: loadedSmoke,
            financeSummary: loadedFin,
            transactions: loadedTx,
            briefs: loadedBriefs,
            onlineProfiles: loadedProfiles,
            version: 1,
            lastClientUpdate: new Date().toISOString(),
          };

          if (supabaseConfig.enabled) {
            await syncToSupabase(clientKey, initialPayload);
          }
          const pushResult = await pushRemoteSyncData(clientKey, initialPayload);
          if (pushResult.success) {
            setSyncStatus('synced');
            if (pushResult.updatedAt) {
              setLastSyncedTimeState(pushResult.updatedAt);
            }
          } else {
            setSyncStatus('offline');
          }
        }
      } catch {
        setSyncStatus('offline');
      }
    };

    initCloudSync();
  }, []);

  const applyRemotePayload = (remoteData: AppSyncData) => {
    if (remoteData.logs) {
      setLogs(remoteData.logs);
      saveDailyLogs(remoteData.logs);
    }
    if (remoteData.smokeFreeData) {
      setSmokeFreeData(remoteData.smokeFreeData);
      saveSmokeFreeData(remoteData.smokeFreeData);
    }
    if (remoteData.financeSummary) {
      setFinanceSummary(remoteData.financeSummary);
      saveFinanceSummary(remoteData.financeSummary);
    }
    if (remoteData.transactions) {
      setTransactions(remoteData.transactions);
      saveFinanceTransactions(remoteData.transactions);
    }
    if (remoteData.briefs) {
      setBriefs(remoteData.briefs);
      saveYouCodeBriefs(remoteData.briefs);
    }
    if (remoteData.onlineProfiles) {
      setOnlineProfiles(remoteData.onlineProfiles);
      saveOnlineProfiles(remoteData.onlineProfiles);
    }
  };

  // Debounced auto-sync helper
  const scheduleAutoSync = useCallback(
    (overrides?: Partial<AppSyncData>) => {
      if (!userUuid || !smokeFreeData || !financeSummary || !onlineProfiles) return;

      setSyncStatus('syncing');
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }

      syncTimerRef.current = setTimeout(async () => {
        const payload: AppSyncData = {
          logs: overrides?.logs || logs,
          smokeFreeData: overrides?.smokeFreeData || smokeFreeData,
          financeSummary: overrides?.financeSummary || financeSummary,
          transactions: overrides?.transactions || transactions,
          briefs: overrides?.briefs || briefs,
          onlineProfiles: overrides?.onlineProfiles || onlineProfiles,
          version: 1,
          lastClientUpdate: new Date().toISOString(),
        };

        const supabaseConfig = loadSupabaseConfig();
        if (supabaseConfig.enabled) {
          await syncToSupabase(userUuid, payload);
        }

        const result = await pushRemoteSyncData(userUuid, payload);
        if (result.success) {
          setSyncStatus('synced');
          if (result.updatedAt) {
            setLastSyncedTimeState(result.updatedAt);
          }
        } else {
          setSyncStatus('offline');
        }
      }, 700);
    },
    [userUuid, logs, smokeFreeData, financeSummary, transactions, briefs, onlineProfiles]
  );

  // Sync update handlers
  const handleUpdateTodayLog = (updated: DailyLog) => {
    const newLogs = {
      ...logs,
      [currentDateStr]: updated,
    };
    setLogs(newLogs);
    saveDailyLogs(newLogs);
    scheduleAutoSync({ logs: newLogs });
  };

  const handleUpdateSmokeFree = (data: SmokeFreeData) => {
    setSmokeFreeData(data);
    saveSmokeFreeData(data);
    scheduleAutoSync({ smokeFreeData: data });
  };

  const handleResistUrge = () => {
    if (!smokeFreeData) return;
    const updated = {
      ...smokeFreeData,
      urgesResisted: smokeFreeData.urgesResisted + 1,
      lastUrgeLogged: new Date().toISOString(),
    };
    handleUpdateSmokeFree(updated);
  };

  const handleUpdateFinanceSummary = (summary: FinanceSummary) => {
    setFinanceSummary(summary);
    saveFinanceSummary(summary);
    scheduleAutoSync({ financeSummary: summary });
  };

  const handleUpdateTransactions = (txs: FinanceTransaction[]) => {
    setTransactions(txs);
    saveFinanceTransactions(txs);
    scheduleAutoSync({ transactions: txs });
  };

  const handleUpdateBriefs = (updatedBriefs: YouCodeBrief[]) => {
    setBriefs(updatedBriefs);
    saveYouCodeBriefs(updatedBriefs);
    scheduleAutoSync({ briefs: updatedBriefs });
  };

  const handleUpdateOnlineProfiles = (profiles: OnlineProfileChecklist) => {
    setOnlineProfiles(profiles);
    saveOnlineProfiles(profiles);
    scheduleAutoSync({ onlineProfiles: profiles });
  };

  // Manual trigger to force cloud sync
  const handleForceSync = async () => {
    if (!userUuid) return;
    setSyncStatus('syncing');

    const supabaseConfig = loadSupabaseConfig();
    if (supabaseConfig.enabled) {
      const supaResult = await syncToSupabase(userUuid, {
        logs,
        smokeFreeData: smokeFreeData!,
        financeSummary: financeSummary!,
        transactions,
        briefs,
        onlineProfiles: onlineProfiles!,
        version: 1,
        lastClientUpdate: new Date().toISOString(),
      });
      if (supaResult.success) {
        setSyncStatus('synced');
        const now = new Date().toLocaleTimeString();
        setLastSyncedTimeState(now);
        setLastSyncedTime(now);
        return;
      }
    }

    const payload: AppSyncData = {
      logs,
      smokeFreeData: smokeFreeData!,
      financeSummary: financeSummary!,
      transactions,
      briefs,
      onlineProfiles: onlineProfiles!,
      version: 1,
      lastClientUpdate: new Date().toISOString(),
    };

    const result = await pushRemoteSyncData(userUuid, payload);
    if (result.success) {
      setSyncStatus('synced');
      if (result.updatedAt) {
        setLastSyncedTimeState(result.updatedAt);
      }
    } else {
      setSyncStatus('offline');
    }
  };

  // Switch to another client UUID key
  const handleSwitchUserUuid = async (newKey: string): Promise<boolean> => {
    setSyncStatus('syncing');
    const supabaseConfig = loadSupabaseConfig();

    if (supabaseConfig.enabled) {
      const supa = await fetchFromSupabase(newKey);
      if (supa.found && supa.data) {
        applyRemotePayload(supa.data);
        saveClientUuid(newKey);
        setUserUuid(newKey);
        setSyncStatus('synced');
        return true;
      }
    }

    const remote = await fetchRemoteSyncData(newKey);
    if (remote.found && remote.data) {
      applyRemotePayload(remote.data);
    } else {
      const payload: AppSyncData = {
        logs,
        smokeFreeData: smokeFreeData!,
        financeSummary: financeSummary!,
        transactions,
        briefs,
        onlineProfiles: onlineProfiles!,
        version: 1,
        lastClientUpdate: new Date().toISOString(),
      };
      await pushRemoteSyncData(newKey, payload);
    }

    saveClientUuid(newKey);
    setUserUuid(newKey);
    setSyncStatus('synced');
    if (remote.updatedAt) {
      setLastSyncedTimeState(remote.updatedAt);
    }
    return true;
  };

  const handleGenerateNewUuid = async () => {
    const freshUuid = generateClientUuid();
    await handleSwitchUserUuid(freshUuid);
  };

  // Date switching
  const todayStr = getTodayDateString();
  const currentLog = logs[currentDateStr] || createEmptyDailyLog(currentDateStr);
  const isViewingToday = currentDateStr === todayStr;

  const navigateDay = (offset: number) => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + offset);
    const nextStr = d.toISOString().split('T')[0];
    if (!logs[nextStr]) {
      const nextLog = createEmptyDailyLog(nextStr);
      const newLogs = { ...logs, [nextStr]: nextLog };
      setLogs(newLogs);
      saveDailyLogs(newLogs);
    }
    setCurrentDateStr(nextStr);
  };

  // Export JSON backup
  const exportData = () => {
    const fullBackup = {
      userUuid,
      language,
      currency,
      logs,
      smokeFreeData,
      financeSummary,
      transactions,
      briefs,
      onlineProfiles,
      lastSyncedTime,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascent_habits_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // KPIs
  const allKpis = computeAllTaskKpis(logs, language);
  const todayCompletionRate =
    allKpis.length > 0
      ? Math.round(
          (allKpis.filter((k) => k.todayStatus).length / allKpis.length) * 100
        )
      : 0;

  if (!isLoaded || !smokeFreeData || !financeSummary || !onlineProfiles) {
    return (
      <div className="min-h-screen bg-[#0c0f17] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3 font-mono text-sm">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>{language === 'fr' ? 'Connexion au Cloud et Chargement du Coffre...' : 'Connecting to Cloud Backend & Loading Vault...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f17] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white transition-colors duration-200">
      {/* Modern Retractable Sidebar Navbar */}
      <SidebarNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        todayCompletionRate={todayCompletionRate}
        userUuid={userUuid}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        language={language}
        onLanguageChange={handleLanguageChange}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        theme={theme}
        onThemeToggle={toggleTheme}
        syncStatus={syncStatus}
        isAccessibilityMode={isAccessibilityMode}
        onToggleAccessibilityMode={toggleAccessibilityMode}
      />

      {/* Main Layout Area offset by sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Modern Sticky TopBar */}
        <TopBar
          activeTab={activeTab}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          todayCompletionRate={todayCompletionRate}
          syncStatus={syncStatus}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          currentDateStr={currentDateStr}
          onNavigateDay={navigateDay}
          onJumpToToday={() => setCurrentDateStr(todayStr)}
          isViewingToday={isViewingToday}
          onExportData={exportData}
          language={language}
          isAccessibilityMode={isAccessibilityMode}
          onToggleAccessibilityMode={toggleAccessibilityMode}
        />

        {/* Main Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'today' && (
            <TodayChecklist
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              smokeFreeData={smokeFreeData}
              onResistUrge={handleResistUrge}
              financeSummary={financeSummary}
              onNavigateTab={setActiveTab}
              language={language}
              currency={currency}
              isAccessibilityMode={isAccessibilityMode}
              onToggleAccessibilityMode={toggleAccessibilityMode}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppAssistant
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              userUuid={userUuid}
              language={language}
              currency={currency}
            />
          )}

          {activeTab === 'ai_coach' && (
            <AiCoachMorningHub
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              userUuid={userUuid}
              language={language}
              currency={currency}
            />
          )}

          {activeTab === 'kpis' && (
            <KpiStreaksDashboard
              kpis={allKpis}
              logs={logs}
              onNavigateTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'knee' && (
            <KneeRehabTracker
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              logs={logs}
              language={language}
            />
          )}

          {activeTab === 'study' && (
            <WeekendStudyTracker
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              logs={logs}
              language={language}
            />
          )}

          {activeTab === 'smoke_finance' && (
            <SmokeFreeFinanceTracker
              smokeFreeData={smokeFreeData}
              onUpdateSmokeFreeData={handleUpdateSmokeFree}
              financeSummary={financeSummary}
              onUpdateFinanceSummary={handleUpdateFinanceSummary}
              transactions={transactions}
              onUpdateTransactions={handleUpdateTransactions}
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              currency={currency}
              language={language}
            />
          )}

          {activeTab === 'career' && (
            <CareerGuide
              briefs={briefs}
              onUpdateBriefs={handleUpdateBriefs}
              onlineProfiles={onlineProfiles}
              onUpdateOnlineProfiles={handleUpdateOnlineProfiles}
              todayLog={currentLog}
              onUpdateTodayLog={handleUpdateTodayLog}
              language={language}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsMcpHub
              todayLog={currentLog}
              userUuid={userUuid}
              language={language}
              currency={currency}
            />
          )}

          {activeTab === 'hosting' && (
            <HostingGuide lang={language} />
          )}

          {activeTab === 'tester' && (
            <UserGuideAndTester
              language={language}
              currency={currency}
              onNavigateTab={setActiveTab}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
            />
          )}

          {activeTab === 'docs' && (
            <ProductSuiteDocs
              language={language}
              currency={currency}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>

        {/* Cloud Sync & User Key Modal */}
        <CloudSyncModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          userUuid={userUuid}
          syncStatus={syncStatus}
          lastSynced={lastSyncedTime}
          onForceSync={handleForceSync}
          onSwitchUserUuid={handleSwitchUserUuid}
          onGenerateNewUuid={handleGenerateNewUuid}
          onNavigateToHosting={() => setActiveTab('hosting')}
          language={language}
        />

        {/* Clean Quiet Footer */}
        <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950/60 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Ascent KPI Engine</span>
              <span aria-hidden="true">·</span>
              <span>{language === 'fr' ? 'Synchronisé Cloud via Clé UUID' : 'Cloud Synced via Client UUID'}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-sky-400" />
                <span>Supabase Live Vault & Express</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{currency} (Maroc) · {language.toUpperCase()}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
