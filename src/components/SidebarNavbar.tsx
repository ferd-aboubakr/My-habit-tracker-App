import React from 'react';
import {
  CalendarCheck,
  Flame,
  Activity,
  Laptop,
  ShieldCheck,
  Briefcase,
  Database,
  Zap,
  PanelLeftClose,
  PanelLeft,
  X,
  Key,
  Copy,
  Check,
  Globe,
  Sun,
  Moon,
  Cloud,
  BookOpen,
  MessageSquare,
  Sparkles,
  Cpu,
  Volume2,
} from 'lucide-react';
import { Language, Currency, CURRENCIES, translations } from '../i18n/translations';
import { SyncStatus } from '../services/cloudSync';

interface SidebarNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  todayCompletionRate: number;
  userUuid: string;
  onOpenCloudModal: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  syncStatus?: SyncStatus;
  isAccessibilityMode?: boolean;
  onToggleAccessibilityMode?: () => void;
}

export const SidebarNavbar: React.FC<SidebarNavbarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  todayCompletionRate,
  userUuid,
  onOpenCloudModal,
  language,
  onLanguageChange,
  currency,
  onCurrencyChange,
  theme,
  onThemeToggle,
  syncStatus,
  isAccessibilityMode,
  onToggleAccessibilityMode,
}) => {
  const [copiedKey, setCopiedKey] = React.useState(false);
  const t = translations[language];

  const handleCopyKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userUuid) return;
    navigator.clipboard.writeText(userUuid);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const navSections = [
    {
      title: language === 'fr' ? 'Principal & IA' : 'Main & AI',
      items: [
        {
          id: 'today',
          label: t.nav.today,
          icon: CalendarCheck,
          badge: `${todayCompletionRate}%`,
          badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        },
        {
          id: 'kpis',
          label: t.nav.kpis,
          icon: Flame,
          badge: '14j',
          badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
        },
        {
          id: 'whatsapp',
          label: (t.nav as any).whatsapp || (language === 'fr' ? 'WhatsApp & Rappels' : 'WhatsApp & AI Parser'),
          icon: MessageSquare,
          badge: 'IA 24/7',
          badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        },
        {
          id: 'ai_coach',
          label: (t.nav as any).ai_coach || (language === 'fr' ? 'Coach IA & Briefing' : 'AI Coach & Morning Mail'),
          icon: Sparkles,
          badge: '07h00',
          badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
        },
      ],
    },
    {
      title: language === 'fr' ? 'Corps & Focus' : 'Health & Focus',
      items: [
        {
          id: 'knee',
          label: t.nav.knee,
          icon: Activity,
          badge: '8/10',
          badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        },
        {
          id: 'study',
          label: t.nav.study,
          icon: Laptop,
          badge: '1h/4h',
          badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
        },
        {
          id: 'smoke_finance',
          label: t.nav.smoke_finance,
          icon: ShieldCheck,
          badge: CURRENCIES[currency].symbol,
          badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
        },
      ],
    },
    {
      title: language === 'fr' ? 'Carrière & Écosystème' : 'Career & Ecosystem',
      items: [
        {
          id: 'career',
          label: t.nav.career,
          icon: Briefcase,
          badge: 'Mercredi',
          badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
        },
        {
          id: 'integrations',
          label: (t.nav as any).integrations || (language === 'fr' ? 'Intégrations & MCP' : 'Integrations & MCP'),
          icon: Cpu,
          badge: 'MCP',
          badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
        },
        {
          id: 'hosting',
          label: t.nav.hosting,
          icon: Database,
          badge: 'Supabase',
          badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        },
        {
          id: 'tester',
          label: (t.nav as any).tester || 'Guide & Testeur',
          icon: Zap,
          badge: 'Live',
          badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
        },
        {
          id: 'docs',
          label: (t.nav as any).docs || (language === 'fr' ? 'Livre Blanc & Produit' : 'Product Suite & Docs'),
          icon: BookOpen,
          badge: '7 Docs',
          badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
        },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand & Retract Button Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <button
          onClick={() => handleItemClick('today')}
          className={`flex items-center gap-2.5 transition-opacity cursor-pointer ${
            isCollapsed ? 'justify-center w-full' : ''
          }`}
          title="Ascent Habit & Career Engine"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <div className="text-sm font-bold text-white tracking-tight leading-none">
                Ascent
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                KPI Engine
              </div>
            </div>
          )}
        </button>

        {/* Desktop Retract / Expand Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={isCollapsed ? (language === 'fr' ? 'Déplier le menu' : 'Expand sidebar') : (language === 'fr' ? 'Rétracter le menu' : 'Retract sidebar')}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4 text-sky-400" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu Items List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Footer Area */}
      <div className="p-3 border-t border-slate-800/80 space-y-3 shrink-0 bg-slate-950/40">
        {/* Anonymous Cloud Vault Key Badge */}
        {!isCollapsed ? (
          <div
            onClick={onOpenCloudModal}
            className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Key className="w-3 h-3 text-sky-400" />
                <span>{language === 'fr' ? 'Clé Coffre' : 'Vault Key'}</span>
              </span>
              <button
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-white p-0.5 rounded"
                title="Copier la clé"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="font-mono text-[10px] text-slate-300 truncate group-hover:text-sky-300">
              {userUuid}
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenCloudModal}
            className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-900 transition-colors cursor-pointer relative group"
            title="Clé Cloud (UUID)"
          >
            <Key className="w-4 h-4 text-sky-400" />
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] font-mono rounded shadow border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {language === 'fr' ? 'Gérer Clé Cloud' : 'Manage Cloud Key'}
            </div>
          </button>
        )}

        {/* Quick Toggles: Language, Currency, Theme */}
        <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          {/* FR / EN Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                language === 'fr'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
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
            >
              EN
            </button>
          </div>

          {/* Currency Pill */}
          {!isCollapsed && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              {(['MAD', 'EUR', 'USD'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => onCurrencyChange(cur)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    currency === cur
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={CURRENCIES[cur].label}
                >
                  {CURRENCIES[cur].symbol}
                </button>
              ))}
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg cursor-pointer transition-colors"
            title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Tablet Retractable Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-40 bg-[#0c0f17]/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 3. Mobile Slide-in Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0c0f17] border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
