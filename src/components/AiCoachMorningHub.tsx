import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
  Flame,
  Coffee,
  Sun,
  Eye,
} from 'lucide-react';
import { DailyLog } from '../types/habits';
import { Language, Currency, formatCurrency } from '../i18n/translations';

interface AiCoachMorningHubProps {
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  userUuid: string;
  language?: Language;
  currency?: Currency;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedUpdates?: any;
}

export const AiCoachMorningHub: React.FC<AiCoachMorningHubProps> = ({
  todayLog,
  onUpdateTodayLog,
  userUuid,
  language = 'fr',
  currency = 'MAD',
}) => {
  const isFr = language === 'fr';

  const [activeTab, setActiveTab] = useState<'chat' | 'morning_email'>('morning_email');

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-coach',
      sender: 'bot',
      text: isFr
        ? "Salam Aboubakr ! Je suis ton Coach d'Excellence Personnelle & Carrière. Je suis là pour t'aider à maintenir tes 12 habitudes avec rigueur, équilibrer ton genou gauche, assurer la livraison de tes briefs YouCode le mercredi et protéger ton épargne en Dirhams. Que souhaites-tu aborder ?"
        : "Hello Aboubakr! I am your Ascent Habit & Career Coach. I'm here to help you sustain your 12 habits, rehabilitate your left knee, deliver YouCode briefs every Wednesday, and protect your MAD savings. How can I support you right now?",
      timestamp: '07:00',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Morning Email State
  const [recipientEmail, setRecipientEmail] = useState('Ferd.aboubakr@gmail.com');
  const [briefingData, setBriefingData] = useState<{
    subject: string;
    markdown: string;
    html: string;
  } | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [autoMorningDelivery, setAutoMorningDelivery] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate initial briefing on mount
  useEffect(() => {
    generateMorningBriefing();
  }, [language]);

  const generateMorningBriefing = async () => {
    setIsGeneratingBriefing(true);
    setEmailDeliveryStatus(null);
    try {
      const response = await fetch('/api/ai/morning-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUuid,
          recipientEmail,
          language,
          context: {
            date: todayLog.date,
            kneeScore: todayLog.kneeRehab?.balanceScore || 7.5,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBriefingData({
          subject: data.subject,
          markdown: data.markdown,
          html: data.html,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!briefingData) return;
    setIsSendingEmail(true);
    setEmailDeliveryStatus(null);
    try {
      const response = await fetch('/api/ai/deliver-morning-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          subject: briefingData.subject,
          html: briefingData.html,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEmailDeliveryStatus(data.message || `Briefing transmis à ${recipientEmail}`);
      }
    } catch (e) {
      console.error(e);
      setEmailDeliveryStatus("Erreur d'envoi. Veuillez vérifier la connexion.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          context: {
            date: todayLog.date,
            kneeScore: todayLog.kneeRehab.balanceScore,
            currentSavings: 2100,
            targetSavings: 2500,
          },
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: data.reply || "Je suis à tes côtés pour assurer l'exécution aujourd'hui.",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          suggestedUpdates: data.suggestedUpdates,
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: "Excellent focus. Garde ton cap sur le bureau d'1h et ton équilibre du genou gauche !",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyHtmlEmail = () => {
    if (!briefingData) return;
    navigator.clipboard.writeText(briefingData.html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const quickChatPrompts = isFr
    ? [
        "Où dois-je porter mon focus en priorité aujourd'hui ?",
        "Comment bien exécuter mes squats pour le genou gauche ?",
        "Comment protéger mon épargne ce mois sans stresser ?",
        "Conseille-moi pour mon brief YouCode du mercredi",
      ]
    : [
        "Where should I focus my energy today?",
        "Tips for left knee single-leg stability",
        "How to protect my monthly savings reserve",
        "YouCode Wednesday brief advice",
      ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 border border-sky-800/40 rounded-xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash AI Engine</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-300">Maroc (GMT+1)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <span>{isFr ? 'Coach IA & Briefing Matinal par Email' : 'AI Coach & Morning Email Briefing'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {isFr
                ? 'Recevez chaque matin à 07h00 un email bienveillant et réaliste avec vos priorités du jour, vos pièges à anticiper et l’état de vos séries. Discutez en direct avec votre coach IA.'
                : 'Receive a supportive, grounded morning briefing email every morning at 07:00 AM with prioritized targets and realistic guidance. Chat directly with your AI coach.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-sky-800/40 rounded-lg p-2 shrink-0">
            <button
              onClick={() => setActiveTab('morning_email')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'morning_email'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ☀️ {isFr ? 'Briefing Matinal (Email)' : 'Morning Email Briefing'}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 {isFr ? 'Coach IA en Direct' : 'Live AI Coach'}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MORNING EMAIL BRIEFING */}
      {activeTab === 'morning_email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Preview Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {/* Fake Email Client Header */}
              <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span>De : <strong>Ascent Morning Engine &lt;briefing@ascent-habits.ma&gt;</strong></span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      À : <strong className="text-white">{recipientEmail}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={generateMorningBriefing}
                    disabled={isGeneratingBriefing}
                    className="p-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Régénérer le briefing avec l'IA"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBriefing ? 'animate-spin text-sky-400' : ''}`} />
                    <span className="hidden sm:inline">Régénérer</span>
                  </button>
                  <button
                    onClick={copyHtmlEmail}
                    className="p-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copier le code HTML de l'email"
                  >
                    {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copiedHtml ? 'Copié !' : 'Copier HTML'}</span>
                  </button>
                </div>
              </div>

              {/* Subject bar */}
              <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800 text-xs font-semibold text-sky-300 flex items-center gap-2">
                <span>Objet :</span>
                <span className="text-white truncate">
                  {briefingData?.subject || "Chargement du briefing..."}
                </span>
              </div>

              {/* Email Content Body */}
              <div className="p-6 bg-[#0c1220] min-h-[420px] text-slate-200 leading-relaxed text-sm">
                {isGeneratingBriefing ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400 text-xs">
                    <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini 3.8 Flash synthétise vos habitudes et rédige votre briefing...</span>
                  </div>
                ) : briefingData ? (
                  <div className="space-y-4 max-w-2xl">
                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-300 border-l-2 border-sky-500/60 pl-4 py-1">
                      {briefingData.markdown}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Aucun briefing généré pour l'instant.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery & Schedule Column (Right col) */}
          <div className="space-y-4">
            {/* Direct Send Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Send className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  {isFr ? 'Déclencher l’Envoi Maintenant' : 'Dispatch Email Now'}
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Adresse Email Destinataire :</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail || isGeneratingBriefing || !briefingData}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Envoyer le Briefing à Ferd.aboubakr@gmail.com</span>
                  </>
                )}
              </button>

              {emailDeliveryStatus && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{emailDeliveryStatus}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 leading-normal">
                Ce briefing sera archivé dans vos réceptions matinales et servira de guide d'action quotidien.
              </div>
            </div>

            {/* Automatic Schedule Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-semibold text-white">Livraison Automatique (07h00)</h4>
                </div>
                <button
                  onClick={() => setAutoMorningDelivery(!autoMorningDelivery)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                    autoMorningDelivery
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {autoMorningDelivery ? 'Activé' : 'Désactivé'}
                </button>
              </div>

              <p className="text-xs text-slate-400">
                L’agent Ascent planifie automatiquement la génération à 06h45 pour que l’email soit dans votre boîte dès votre réveil.
              </p>

              <div className="p-3 bg-slate-950/70 rounded border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Fuseau horaire :</span>
                  <span className="font-mono text-slate-200">Africa/Casablanca (GMT+1)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Prochaine livraison :</span>
                  <span className="font-mono text-sky-400">Demain 07h00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE AI COACH CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-[#0c1317] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
          {/* Header */}
          <div className="bg-[#1f2c34] px-4 py-3 border-b border-slate-700/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span>Ascent AI Companion</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono border border-sky-500/30">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Coach personnel d'excellence · Réalisme & Soutien pragmatique
                </div>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-4 py-3 text-sm shadow-md ${
                      isUser
                        ? 'bg-sky-700 text-white rounded-tr-none'
                        : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-slate-400">
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#202c33] text-slate-300 rounded-lg px-4 py-2.5 text-xs flex items-center gap-2 border border-slate-700/40">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce delay-150" />
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce delay-300" />
                  <span>Le coach réfléchit à vos objectifs...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="bg-[#182229] px-3 py-2 border-t border-slate-700/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium">Suggestions :</span>
            {quickChatPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChatMessage(p)}
                className="shrink-0 text-xs px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-slate-200 border border-slate-700/60 rounded-full transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="bg-[#202c33] p-3 border-t border-slate-700/60 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isFr ? "Posez une question ou demandez un conseil..." : "Ask your coach a question..."}
              className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-sm px-4 py-2.5 rounded-lg border border-transparent focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isChatLoading}
              className="w-10 h-10 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
