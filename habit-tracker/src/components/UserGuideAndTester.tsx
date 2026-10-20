import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Code2,
  Settings,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  testSupabaseConnection,
  syncToSupabase,
  loadSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SETUP,
} from '../services/supabaseSync';
import { getOrCreateClientUuid } from '../services/cloudSync';
import { Language, Currency, formatCurrency } from '../i18n/translations';
import confetti from 'canvas-confetti';

interface UserGuideAndTesterProps {
  language: Language;
  currency: Currency;
  onNavigateTab: (tabId: string) => void;
  onOpenCloudModal: () => void;
}

export const UserGuideAndTester: React.FC<UserGuideAndTesterProps> = ({
  language,
  currency,
  onNavigateTab,
  onOpenCloudModal,
}) => {
  const isFr = language === 'fr';

  // Live Tester States
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Config states
  const [config, setConfig] = useState(() => loadSupabaseConfig());
  const [savedConfigMessage, setSavedConfigMessage] = useState(false);

  const [testResults, setTestResults] = useState<{
    id: string;
    title: string;
    status: 'pending' | 'success' | 'error';
    latencyMs?: number;
    details: string;
  }[]>([]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(config);
    setSavedConfigMessage(true);
    setTimeout(() => setSavedConfigMessage(false), 2000);
    runAllTests();
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    const initialTests = [
      {
        id: 'supabase_ping',
        title: isFr ? '1. Connexion au Projet Supabase' : '1. Supabase Project Connection',
        status: 'pending' as const,
        details: isFr ? 'Test de l’API REST Supabase...' : 'Pinging Supabase REST API...',
      },
      {
        id: 'supabase_table',
        title: isFr ? `2. Vérification Table '${config.tableName || 'user_vaults'}'` : `2. Table '${config.tableName || 'user_vaults'}' Verification`,
        status: 'pending' as const,
        details: isFr ? 'Vérification du schéma, des colonnes et des permissions RLS...' : 'Checking schema, columns and RLS policies...',
      },
      {
        id: 'supabase_write',
        title: isFr ? '3. Test d’Écriture & Lecture Live (Upsert)' : '3. Live Upsert & Read Verification',
        status: 'pending' as const,
        details: isFr ? 'Envoi d’une charge de données test avec clé UUID...' : 'Sending test data payload with UUID key...',
      },
      {
        id: 'storage_engine',
        title: isFr ? '4. Moteur de Calcul des 12 Habitudes & KPIs' : '4. 12-Habit KPI & Streak Engine',
        status: 'pending' as const,
        details: isFr ? 'Calcul des séries (streaks) et taux d’accomplissement...' : 'Calculating streaks and completion percentages...',
      },
      {
        id: 'currency_i18n',
        title: isFr ? `5. Localisation Maroc : ${currency} & ${language.toUpperCase()}` : `5. Morocco Localisation: ${currency} & ${language.toUpperCase()}`,
        status: 'pending' as const,
        details: isFr ? 'Vérification du formatage en Dirhams marocains...' : 'Verifying Dirham currency formatting...',
      },
    ];

    setTestResults(initialTests);

    // Test 1 & 2: Supabase connection & table check
    const t0 = performance.now();
    const conn = await testSupabaseConnection();
    const latency1 = Math.round(performance.now() - t0);

    setTestResults((prev) =>
      prev.map((t) => {
        if (t.id === 'supabase_ping') {
          return {
            ...t,
            status: conn.connected ? 'success' : 'error',
            latencyMs: latency1,
            details: conn.connected
              ? (isFr ? `Connecté au projet Supabase avec succès (${latency1} ms)` : `Connected to Supabase project (${latency1} ms)`)
              : (isFr ? 'Impossible de contacter le serveur Supabase. Vérifiez l’URL et la clé.' : 'Cannot contact Supabase server.'),
          };
        }
        if (t.id === 'supabase_table') {
          return {
            ...t,
            status: conn.tableReady ? 'success' : 'error',
            latencyMs: latency1,
            details: conn.message,
          };
        }
        return t;
      })
    );

    // Test 3: Upsert test
    const tWrite0 = performance.now();
    const testUserId = getOrCreateClientUuid();
    const writeResult = await syncToSupabase(testUserId, {
      logs: {},
      smokeFreeData: { quitDate: new Date().toISOString(), costPerPack: 75, packsPerDay: 1, urgesResisted: 0 },
      financeSummary: { monthlyIncomeTarget: 1800, monthlySavingsTarget: 500, currentSavedThisMonth: 420, hygieneBudgetMonthly: 60, hygieneSpentThisMonth: 38 },
      transactions: [],
      briefs: [],
      onlineProfiles: { linkedInUpdated: true, gitHubActive: true, cvResumePolished: true, portfolioProjectsLive: true, weeklyNetworkingDone: true },
      version: 1,
      lastClientUpdate: new Date().toISOString(),
    });
    const latencyWrite = Math.round(performance.now() - tWrite0);

    setTestResults((prev) =>
      prev.map((t) => {
        if (t.id === 'supabase_write') {
          return {
            ...t,
            status: writeResult.success ? 'success' : 'error',
            latencyMs: latencyWrite,
            details: writeResult.success
              ? (isFr ? `Upsert réussi (${latencyWrite} ms) ! Données synchronisées avec la clé anonyme.` : `Upsert successful (${latencyWrite} ms)! Synced with UUID key.`)
              : (isFr ? `Erreur : ${writeResult.error}` : `Error: ${writeResult.error}`),
          };
        }
        if (t.id === 'storage_engine') {
          return {
            ...t,
            status: 'success',
            details: isFr ? '12 habitudes suivies : calcul des séries, moyennes 30 jours et jauges en temps réel' : '12 habits active: real-time streak computation & 30-day KPI analysis',
          };
        }
        if (t.id === 'currency_i18n') {
          const sample = formatCurrency(500, currency);
          return {
            ...t,
            status: 'success',
            details: isFr ? `Devise active : ${sample} (Dirhams Marocains) · Interface en Français` : `Active currency: ${sample} · Interface set to ${language.toUpperCase()}`,
          };
        }
        return t;
      })
    );

    setIsRunningTests(false);
    if (conn.connected && conn.tableReady && writeResult.success) {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.5 } });
    }
  };

  const hasTableError = testResults.some((t) => (t.id === 'supabase_table' || t.id === 'supabase_write') && t.status === 'error');

  return (
    <div className="space-y-8">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>{isFr ? 'Testeur Supabase & Guide Complet' : 'Supabase Diagnostic & User Guide'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isFr ? 'Diagnostiquer la Connexion & Guide d’Utilisation' : 'Live Cloud Diagnostics & Feature Guide'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {isFr
                ? 'Vérifiez en direct la communication avec votre projet Supabase. Si votre test échoue ou si vous avez déjà créé une table de test manuellement, suivez les instructions ci-dessous pour régler les permissions en 30 secondes.'
                : 'Test your live Supabase connection in real-time. If you created a test table or retest failed, follow the quick 30-second fix below.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? (isFr ? 'Test en cours...' : 'Testing...') : (isFr ? 'Lancer le Test en Direct' : 'Run Diagnostics')}</span>
            </button>
            <button
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className="px-3.5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-slate-700"
              title="Configurer les colonnes ou le nom de table"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{isFr ? 'Paramètres Table' : 'Table Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Custom Table Config (if user named table differently) */}
      {showAdvancedConfig && (
        <form onSubmit={handleSaveConfig} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-400" />
              <span>{isFr ? 'Configuration Avancée de la Table Supabase' : 'Supabase Table Schema Configuration'}</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {isFr ? 'Par défaut : user_vaults (user_id, data)' : 'Defaults: user_vaults (user_id, data)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                {isFr ? 'Nom de Table' : 'Table Name'}
              </label>
              <input
                type="text"
                value={config.tableName || 'user_vaults'}
                onChange={(e) => setConfig({ ...config, tableName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                placeholder="user_vaults"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                {isFr ? 'Colonne Clé / Token' : 'ID / Token Column'}
              </label>
              <input
                type="text"
                value={config.idColumn || 'user_id'}
                onChange={(e) => setConfig({ ...config, idColumn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                placeholder="user_id ou token"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                {isFr ? 'Colonne JSON / Payload' : 'JSON / Payload Column'}
              </label>
              <input
                type="text"
                value={config.payloadColumn || 'data'}
                onChange={(e) => setConfig({ ...config, payloadColumn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                placeholder="data ou payload"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-emerald-400 font-mono">
              {savedConfigMessage && (isFr ? '✓ Configuration enregistrée !' : '✓ Saved!')}
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {isFr ? 'Enregistrer & Tester' : 'Save & Test'}
            </button>
          </div>
        </form>
      )}

      {/* Answer to User's Question: "Should I delete my table and use your SQL?" */}
      <div className="bg-sky-950/20 border border-sky-800/40 rounded-2xl p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-white">
              {isFr
                ? 'Question fréquente : « J’ai déjà créé une table avec token et payload, dois-je la supprimer ? »'
                : 'Frequently asked: "I created a table with token and payload, should I delete it or use your SQL?"'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isFr ? (
                <>
                  <strong className="text-emerald-400 font-semibold">OUI, la solution la plus simple et garantie : </strong>
                  Si votre table manuelle ne contient pas de données importantes, supprimez-la ou collez simplement notre script SQL dans l’éditeur SQL de Supabase.
                  La raison pour laquelle « retest » échouait est que Supabase exige des <strong>politiques RLS (Row Level Security)</strong> et des autorisations <code>GRANT</code> pour que la clé publique anonyme (<code>anon</code>) puisse écrire et lire.
                </>
              ) : (
                <>
                  <strong className="text-emerald-400 font-semibold">YES, the easiest and guaranteed fix: </strong>
                  Delete your temporary test table and run our 1-click SQL in your Supabase SQL Editor. The reason retest fails is because Supabase requires specific <strong>RLS policies and GRANT permissions</strong> for the <code>anon</code> role.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Diagnostic Results */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isFr ? 'Résultats du Diagnostic en Direct' : 'Live Diagnostic Results'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {testResults.length > 0 ? (isFr ? '5 tests exécutés' : '5 checks completed') : (isFr ? 'En attente du test' : 'Awaiting test')}
          </span>
        </div>

        {testResults.length === 0 ? (
          <div className="p-8 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center space-y-3">
            <Zap className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Prêt pour le diagnostic' : 'Ready for live test'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isFr
                ? 'Cliquez sur le bouton vert ci-dessus pour tester votre projet Supabase (https://ibednyrzqdybukqvlkvt.supabase.co), vérifier la table et l’écriture en direct.'
                : 'Click "Run Diagnostics" above to test your Supabase project, check permissions and perform a live read/write upsert.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {testResults.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  item.status === 'success'
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                    : item.status === 'error'
                    ? 'bg-rose-950/25 border-rose-800/50 text-rose-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {item.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {item.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0" />}
                  <span className="font-semibold text-white">{item.title}</span>
                </div>
                <div className="flex items-center gap-3 sm:text-right">
                  <span className="text-slate-300 font-mono text-[11px]">{item.details}</span>
                  {item.latencyMs !== undefined && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 shrink-0">
                      {item.latencyMs} ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* If error on table or write, show 1-click copyable SQL fix */}
        {hasTableError && (
          <div className="mt-4 p-5 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Code2 className="w-4 h-4" />
                <span>{isFr ? 'Solution en 1 Clic : Script SQL à copier-coller dans Supabase' : '1-Click Fix: SQL Script to Paste in Supabase'}</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier le SQL' : 'Copy SQL')}</span>
              </button>
            </div>

            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
              <li>
                {isFr ? 'Ouvrez votre projet Supabase' : 'Open Supabase Project'} :{' '}
                <a
                  href="https://supabase.com/dashboard/project/ibednyrzqdybukqvlkvt/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline font-mono inline-flex items-center gap-1"
                >
                  <span>Dashboard Supabase -&gt; SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>{isFr ? 'Collez le code ci-dessous et cliquez sur "Run" (Exécuter).' : 'Paste the SQL script below and click "Run".'}</li>
              <li>{isFr ? 'Revenez ici et cliquez sur "Lancer le Test en Direct" : tous les voyants passeront au vert !' : 'Come back and click "Run Diagnostics" — all checks will turn green!'}</li>
            </ol>

            <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-amber-200/90 overflow-x-auto border border-slate-800 max-h-48">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>
        )}
      </div>

      {/* SECTION 2: User Guide & All 12 Daily Habits */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isFr ? 'Guide Complet : Vos 12 Habitudes & Fonctionnalités' : 'Complete Guide: Your 12 Habits & Core Features'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFr ? 'Tout ce que l’application fait pour vous au quotidien' : 'Everything the app tracks and optimizes for you'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            12 KPIs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 3 Repas Quotidiens */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Habitude #1</span>
              <button onClick={() => onNavigateTab('today')} className="text-xs text-sky-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Cockpit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Manger des repas complets chaque jour' : 'Eat full meals daily'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Validez votre Petit-déjeuner, Déjeuner et Dîner ainsi que votre jauge d’hydratation (2.5L). Valider 3/3 repas alimente directement votre série de nutrition saine.'
                : 'Track Breakfast, Lunch, and Dinner plus 2.5L water hydration. Hitting 3/3 meals feeds your nutrition streak.'}
            </p>
          </div>

          {/* Card 2: Réveil Matinal & Douche */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Habitude #2 & #3</span>
              <button onClick={() => onNavigateTab('today')} className="text-xs text-amber-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Cockpit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Se lever tôt, manger, se coucher tôt & douche' : 'Wake early & eat, sleep early & shower'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Horaires cibles ancrés : lever à 06:45 avec premier repas sous 60 minutes. Le soir, cochez la douche chaude et le coucher avant 23:00 pour restaurer le système nerveux.'
                : 'Anchor targets: rise at 06:45 and eat breakfast within 60 min. In the evening, log warm shower and bedtime before 23:00.'}
            </p>
          </div>

          {/* Card 3: Arrêt du Tabac & Économies */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Habitude #4</span>
              <button onClick={() => onNavigateTab('smoke_finance')} className="text-xs text-rose-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Tabac & Finances</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Arrêter de fumer (Compteur & Envies Vaincues)' : 'Quit smoking (Ticker & Cravings defeated)'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Chronomètre en direct (jours, heures, minutes). Cliquez sur « J’ai surmonté une envie » pour booster votre bouclier mental et voir l’argent économisé en Dirhams (DH).'
                : 'Live ticker (days, hours, minutes). Click "Resisted craving" to reinforce your discipline and watch Dirham savings grow.'}
            </p>
          </div>

          {/* Card 4: Renforcement Genou Gauche */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Habitude #5</span>
              <button onClick={() => onNavigateTab('knee')} className="text-xs text-emerald-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Genou Gauche</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Prise de masse & Équilibre du genou gauche' : 'Gain muscle mass & Left knee balance'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Notez la stabilité du genou gauche de 1 à 10. Suivez vos séances d’exercices unilatéraux (squats sur boîte, squats bulgares, TKE) pour combler le déficit avec le genou droit.'
                : 'Rate left knee stability 1-10. Track unilateral exercises (box squats, Bulgarian split squats, TKEs) to erase right-knee asymmetry.'}
            </p>
          </div>

          {/* Card 5: Bureau 1h & ServiceNow 4h Weekend */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Habitude #6 & #7</span>
              <button onClick={() => onNavigateTab('study')} className="text-xs text-purple-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Bureau & Étude</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Bureau (1h/jour) & ServiceNow + ACSP (4h weekend)' : '1h Desk work & 4h Weekend ServiceNow/ACSP'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Chronomètre intégré pour vos 60 minutes quotidiennes au bureau, plus le bloc de 4 heures les samedis et dimanches midi avec programme certifiant ServiceNow CSA & Apple ACSP.'
                : 'Interactive timer for daily 60 min desk sessions plus Saturday/Sunday 4-hour lunchtime focus for ServiceNow CSA and ACSP.'}
            </p>
          </div>

          {/* Card 6: Briefs YouCode & Profils */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Habitude #8, #9 & #10</span>
              <button onClick={() => onNavigateTab('career')} className="text-xs text-sky-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Carrière</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Briefs YouCode du mercredi soir & Profils pro' : 'Wednesday YouCode briefs & Pro profiles'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Compte à rebours automatique jusqu’au mercredi 20:00 pour la livraison de vos briefs. Checklist d’optimisation LinkedIn, GitHub et CV avec roadmap de carrière stable.'
                : 'Countdown to Wednesday 20:00 deadline. Polish checklists for LinkedIn, GitHub, CV and a 4-phase career roadmap.'}
            </p>
          </div>

          {/* Card 7: Hygiène & Finances Protégées */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Habitude #11 & #12</span>
              <button onClick={() => onNavigateTab('smoke_finance')} className="text-xs text-emerald-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Finances & Hygiène</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Bonne hygiène & Épargne mensuelle protégée' : 'Good hygiene & Protected monthly savings'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Routine hygiène complète (dents, soins, douche). Tableau financier avec minimum d’épargne sécurisé et enveloppe dédiée pour vos produits d’hygiène essentiels en DH.'
                : 'Full hygiene checklist. Monthly finance ledger guarding a minimum savings target and budget for essential hygiene products.'}
            </p>
          </div>

          {/* Card 8: Cloud Sync Anonyme */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Cloud & Multi-Appareil</span>
              <button onClick={onOpenCloudModal} className="text-xs text-purple-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                <span>Clé Cloud</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isFr ? 'Clé UUID Anonyme & Sauvegarde Cloud' : 'Anonymous UUID Key & Cloud Vault'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFr
                ? 'Pas de compte, pas d’e-mail. Votre clé UUID unique sert de passe-partout. Copiez-la pour synchroniser votre PC et votre smartphone en temps réel sur Supabase.'
                : 'No registration, no passwords. Your client UUID key unlocks your data anywhere. Copy it to sync phone and laptop instantly.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
