import React, { useState, useEffect } from 'react';
import {
  Layers,
  GitBranch,
  Github,
  Trello,
  FileText,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Cpu,
  RefreshCw,
  Zap,
  Globe,
  Sliders,
  Terminal,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { DailyLog } from '../types/habits';
import { Language, Currency } from '../i18n/translations';

interface IntegrationsMcpHubProps {
  todayLog: DailyLog;
  userUuid: string;
  language?: Language;
  currency?: Currency;
}

export const IntegrationsMcpHub: React.FC<IntegrationsMcpHubProps> = ({
  todayLog,
  userUuid,
  language = 'fr',
  currency = 'MAD',
}) => {
  const isFr = language === 'fr';

  const [activeTab, setActiveTab] = useState<'mcp' | 'git' | 'services' | 'webhooks'>('mcp');

  // GitHub state
  const [githubUsername, setGithubUsername] = useState('Aboubakr-F');
  const [githubStatus, setGithubStatus] = useState<any>(null);
  const [isCheckingGithub, setIsCheckingGithub] = useState(false);

  // Integrations config
  const [notionDb, setNotionDb] = useState('');
  const [jiraDomain, setJiraDomain] = useState('');
  const [miroBoard, setMiroBoard] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/aboubakr');
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);
  const [copiedMcpEndpoint, setCopiedMcpEndpoint] = useState(false);

  // MCP test console state
  const [mcpToolSelected, setMcpToolSelected] = useState('get_daily_habits');
  const [mcpTestResult, setMcpTestResult] = useState<any>(null);
  const [isExecutingMcp, setIsExecutingMcp] = useState(false);

  const mcpEndpointUrl = `${window.location.origin}/api/mcp`;

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        ascent_habits: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-fetch', mcpEndpointUrl],
          env: {
            ASCENT_USER_UUID: userUuid || 'client-uuid-vault',
          },
        },
      },
    },
    null,
    2
  );

  const checkGithub = async () => {
    if (!githubUsername.trim()) return;
    setIsCheckingGithub(true);
    try {
      const res = await fetch(`/api/integrations/github/${encodeURIComponent(githubUsername)}`);
      const data = await res.json();
      setGithubStatus(data);
    } catch (e) {
      console.error(e);
      setGithubStatus({ found: false, message: 'Erreur de connexion à l’API GitHub' });
    } finally {
      setIsCheckingGithub(false);
    }
  };

  const executeMcpTool = async () => {
    setIsExecutingMcp(true);
    setMcpTestResult(null);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: mcpToolSelected,
            arguments: {
              userId: userUuid,
              date: todayLog.date,
            },
          },
        }),
      });
      const data = await res.json();
      setMcpTestResult(data);
    } catch (e: any) {
      console.error(e);
      setMcpTestResult({ error: e.message });
    } finally {
      setIsExecutingMcp(false);
    }
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(claudeDesktopConfig);
    setCopiedMcpConfig(true);
    setTimeout(() => setCopiedMcpConfig(false), 2000);
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(mcpEndpointUrl);
    setCopiedMcpEndpoint(true);
    setTimeout(() => setCopiedMcpEndpoint(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-800/40 rounded-xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Model Context Protocol (MCP) & Multi-App Gateway</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <span>{isFr ? 'Intégrations Externes & Serveur MCP' : 'External Integrations & MCP Gateway'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {isFr
                ? 'Connectez vos profils GitHub, Jira, Notion, Miro et LinkedIn. Exposez un serveur MCP standard pour permettre à vos agents IA (Claude Desktop, Cursor, profils IA) d’interagir avec vos habitudes.'
                : 'Connect your GitHub, Jira, Notion, Miro, and LinkedIn accounts. Expose a standard MCP server so AI agents (Claude Desktop, Cursor, autonomous agents) can manage your targets.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-purple-800/40 rounded-lg p-2 shrink-0">
            <button
              onClick={() => setActiveTab('mcp')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'mcp'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ {isFr ? 'Passerelle MCP' : 'MCP Gateway'}
            </button>
            <button
              onClick={() => setActiveTab('git')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'git'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🐙 GitHub
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'services'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔗 {isFr ? 'Notion, Jira, Miro' : 'Services'}
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'webhooks'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌐 Webhooks
            </button>
          </div>
        </div>
      </div>

      {/* TAB: MCP GATEWAY */}
      {activeTab === 'mcp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Config & Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">
                  {isFr ? 'Configuration Claude Desktop / Cursor' : 'Claude Desktop / Cursor Config'}
                </h3>
              </div>
              <button
                onClick={copyConfig}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedMcpConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMcpConfig ? 'Copié !' : 'Copier JSON'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Le protocole <strong>Model Context Protocol (MCP)</strong> permet à des agents d'IA externes d'agir directement sur vos 12 habitudes (cocher un repas, lire vos KPIs, générer un briefing).
            </p>

            <div className="relative">
              <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-purple-300 overflow-x-auto leading-relaxed">
                {claudeDesktopConfig}
              </pre>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200">Endpoint MCP Direct :</div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 truncate">
                <span className="truncate">{mcpEndpointUrl}</span>
                <button
                  onClick={copyEndpoint}
                  className="p-1 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copier URL"
                >
                  {copiedMcpEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Live MCP Tool Tester */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Console de Test MCP (Outils Live)</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Sélectionner un outil MCP :</label>
              <select
                value={mcpToolSelected}
                onChange={(e) => setMcpToolSelected(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
              >
                <option value="get_daily_habits">get_daily_habits (Lit les 12 habitudes)</option>
                <option value="get_kpis_and_streaks">get_kpis_and_streaks (Lit les séries et taux)</option>
                <option value="generate_morning_briefing">generate_morning_briefing (Déclenche le briefing)</option>
              </select>
            </div>

            <button
              onClick={executeMcpTool}
              disabled={isExecutingMcp}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isExecutingMcp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Exécuter via le Protocole MCP</span>
            </button>

            {/* Test Result Display */}
            {mcpTestResult && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 font-mono">Réponse JSON-RPC 2.0 :</div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-48 overflow-y-auto">
                  {JSON.stringify(mcpTestResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: GITHUB */}
      {activeTab === 'git' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Github className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-semibold text-white">Synchronisation GitHub & Projets YouCode</h3>
                <p className="text-xs text-slate-400">Vérifie vos commits publics et votre régularité de code</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Nom d'utilisateur GitHub"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
            />
            <button
              onClick={checkGithub}
              disabled={isCheckingGithub}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isCheckingGithub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
              <span>Vérifier l’Activité</span>
            </button>
          </div>

          {githubStatus && (
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Utilisateur :</span>
                <span className="font-mono font-semibold text-white">github.com/{githubStatus.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Commits récents analysés :</span>
                <span className="font-mono font-semibold text-emerald-400">{githubStatus.recentCommitsCount || 0} commits</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Actif aujourd'hui :</span>
                <span className={`font-semibold ${githubStatus.activeToday ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {githubStatus.activeToday ? '✓ Code poussé aujourd’hui' : 'Aucun commit aujourd’hui'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: NOTION, JIRA, MIRO, LINKEDIN */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notion */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">Notion Database Sync</h4>
            </div>
            <p className="text-xs text-slate-400">
              Exportez automatiquement vos fiches quotidiennes d'habitudes vers une base de données Notion.
            </p>
            <input
              type="text"
              value={notionDb}
              onChange={(e) => setNotionDb(e.target.value)}
              placeholder="Notion Database ID (ex: 8b7...)"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono"
            />
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded transition-colors cursor-pointer">
              Enregistrer la liaison Notion
            </button>
          </div>

          {/* Jira */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trello className="w-4 h-4 text-sky-400" />
              <h4 className="text-sm font-semibold text-white">Jira Sprint Deliverables</h4>
            </div>
            <p className="text-xs text-slate-400">
              Synchronisez la finalisation de vos briefs YouCode avec vos tickets de sprint Jira.
            </p>
            <input
              type="text"
              value={jiraDomain}
              onChange={(e) => setJiraDomain(e.target.value)}
              placeholder="https://votre-compte.atlassian.net"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono"
            />
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded transition-colors cursor-pointer">
              Connecter Jira
            </button>
          </div>

          {/* Miro */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Miro Mindmaps & Diagrammes</h4>
            </div>
            <p className="text-xs text-slate-400">
              Reliez vos schémas d'architecture et vos mindmaps de sprints directement à Ascent.
            </p>
            <input
              type="text"
              value={miroBoard}
              onChange={(e) => setMiroBoard(e.target.value)}
              placeholder="Miro Board URL ou ID"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono"
            />
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded transition-colors cursor-pointer">
              Lier le tableau Miro
            </button>
          </div>

          {/* LinkedIn */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">LinkedIn & Réseautage Pro</h4>
            </div>
            <p className="text-xs text-slate-400">
              Alimente l'Habitude 10 (Soin des profils pro et réseautage hebdomadaire pour rôles ServiceNow).
            </p>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/votre-profil"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono"
            />
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded transition-colors cursor-pointer">
              Vérifier le profil LinkedIn
            </button>
          </div>
        </div>
      )}

      {/* TAB: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Webhooks Entrants & Sortants (Zapier, Make, n8n, Shortcuts)</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Déclenchez des actions Ascent depuis vos automatisations Apple Shortcuts (iOS), Zapier ou n8n sur simple requête HTTP POST.
          </p>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-200">Webhook Entrant Universel :</div>
            <code className="block p-2.5 bg-slate-900 rounded font-mono text-xs text-emerald-400 break-all">
              {window.location.origin}/api/whatsapp/parse
            </code>
            <p className="text-[11px] text-slate-400">
              Envoyez un JSON avec <code className="text-slate-300">{`{ "messageText": "...", "userUuid": "${userUuid}" }`}</code> pour mettre à jour instantanément n'importe quelle habitude !
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
