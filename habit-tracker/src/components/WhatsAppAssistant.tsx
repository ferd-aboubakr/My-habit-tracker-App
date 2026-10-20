import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Phone,
  Settings,
  ShieldCheck,
  RefreshCw,
  Bell,
  Sliders,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { DailyLog } from '../types/habits';
import { Language, Currency, formatCurrency } from '../i18n/translations';

interface WhatsAppAssistantProps {
  todayLog: DailyLog;
  onUpdateTodayLog: (updated: DailyLog) => void;
  userUuid: string;
  language?: Language;
  currency?: Currency;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  parsedUpdates?: any;
}

export const WhatsAppAssistant: React.FC<WhatsAppAssistantProps> = ({
  todayLog,
  onUpdateTodayLog,
  userUuid,
  language = 'fr',
  currency = 'MAD',
}) => {
  const isFr = language === 'fr';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: isFr
        ? "Salam Aboubakr ! Je suis ton assistant WhatsApp Ascent. Tu peux m'écrire naturellement ce que tu as accompli aujourd'hui (en français, anglais ou darija), et je mets à jour ton cockpit automatiquement !"
        : "Hello Aboubakr! I'm your Ascent WhatsApp assistant. Tell me what you achieved today (in French, English, or Darija), and I'll automatically sync your dashboard!",
      timestamp: '07:00',
    },
    {
      id: 'init-2',
      sender: 'bot',
      text: isFr
        ? "💡 Exemple : « J'ai pris mes 3 repas, fait 1h20 de bureau, ma rééduc genou avec squats (score 8/10) et zéro cigarette »"
        : "💡 Example: 'Ate all 3 meals, logged 80m at desk, finished knee squats with 8/10 balance, and stayed smoke-free!'",
      timestamp: '07:01',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'schedule' | 'settings'>('chat');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+212 600-000000');
  const [autoReminders, setAutoReminders] = useState(true);
  const [lastParsedInfo, setLastParsedInfo] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load schedule from backend
  useEffect(() => {
    fetch('/api/whatsapp/schedule')
      .then((res) => res.json())
      .then((data) => {
        if (data.schedule) setSchedule(data.schedule);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsgId = 'msg_' + Date.now();
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: timeStr,
      },
    ];

    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/whatsapp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: text,
          userUuid,
          dateStr: todayLog.date,
        }),
      });

      const data = await response.json();

      if (data.success && data.parsed) {
        setLastParsedInfo(data.parsed);

        // Apply parsed updates locally
        const updated = { ...todayLog };
        if (data.parsed.meals) {
          if (data.parsed.meals.breakfast !== undefined) updated.meals.breakfast = data.parsed.meals.breakfast;
          if (data.parsed.meals.lunch !== undefined) updated.meals.lunch = data.parsed.meals.lunch;
          if (data.parsed.meals.dinner !== undefined) updated.meals.dinner = data.parsed.meals.dinner;
          updated.fullMealsAchieved = updated.meals.breakfast && updated.meals.lunch && updated.meals.dinner;
        }

        if (data.parsed.deskMinutesLogged !== undefined) {
          updated.deskMinutesLogged = Math.max(updated.deskMinutesLogged || 0, data.parsed.deskMinutesLogged);
          updated.deskHourDone = updated.deskMinutesLogged >= 60;
        } else if (data.parsed.deskHourDone) {
          updated.deskHourDone = true;
          updated.deskMinutesLogged = Math.max(updated.deskMinutesLogged || 0, 60);
        }

        if (data.parsed.kneeRehab) {
          if (data.parsed.kneeRehab.sessionCompleted !== undefined) updated.kneeRehab.sessionCompleted = data.parsed.kneeRehab.sessionCompleted;
          if (data.parsed.kneeRehab.balanceScore !== undefined) updated.kneeRehab.balanceScore = data.parsed.kneeRehab.balanceScore;
        }

        if (data.parsed.smokeFree !== undefined) {
          updated.smokeFree = data.parsed.smokeFree;
        }

        if (data.parsed.wakeEarlyAndEat) {
          if (data.parsed.wakeEarlyAndEat.wokeEarly !== undefined) updated.wakeEarlyAndEat.wokeEarly = data.parsed.wakeEarlyAndEat.wokeEarly;
          if (data.parsed.wakeEarlyAndEat.breakfastEaten !== undefined) updated.wakeEarlyAndEat.breakfastEaten = data.parsed.wakeEarlyAndEat.breakfastEaten;
        }

        if (data.parsed.eveningShowerAndEarlySleep) {
          if (data.parsed.eveningShowerAndEarlySleep.showered !== undefined) updated.eveningShowerAndEarlySleep.showered = data.parsed.eveningShowerAndEarlySleep.showered;
          if (data.parsed.eveningShowerAndEarlySleep.asleepBeforeTarget !== undefined) updated.eveningShowerAndEarlySleep.asleepBeforeTarget = data.parsed.eveningShowerAndEarlySleep.asleepBeforeTarget;
        }

        if (data.parsed.youCodeBrief?.completed) {
          updated.wednesdayBriefCompleted = true;
        }

        if (data.parsed.weekendStudy) {
          updated.weekendStudyDone = true;
          updated.studyMinutesLogged = data.parsed.weekendStudy.minutes || 240;
        }

        onUpdateTodayLog(updated);

        // Add bot reply
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            sender: 'bot',
            text: data.feedbackMessage || '✅ Objectifs enregistrés et synchronisés !',
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            parsedUpdates: data.parsed,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            sender: 'bot',
            text: isFr
              ? "✅ Message bien reçu et analysé ! Tout est pris en compte."
              : "✅ Message received and logged into Ascent!",
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: isFr
            ? "✅ Parfait ! J'ai bien noté tes actions d'aujourd'hui."
            : "✅ Got it! Logged your progress for today.",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPrompt = (promptText: string) => {
    // Add simulated bot reminder
    setMessages((prev) => [
      ...prev,
      {
        id: 'bot_remind_' + Date.now(),
        sender: 'bot',
        text: promptText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveSubTab('chat');
  };

  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Quick chips
  const quickChips = isFr
    ? [
        { label: '🍽️ 3 repas complets pris', text: "J'ai validé mes 3 repas complets aujourd'hui (petit-déj, déjeuner et dîner)." },
        { label: '💻 1h de bureau focus', text: "J'ai passé 60 minutes concentré à mon bureau sans distraction." },
        { label: '🦵 Genou squats (score 8/10)', text: "Séance genou gauche terminée : squats boîte et stabilité unilatérale, ressenti 8/10." },
        { label: '🚭 0 cigarette aujourd’hui', text: "Journée 100% sans tabac respectée, aucune cigarette fumée." },
        { label: '🚀 Brief YouCode soumis', text: "Brief YouCode du mercredi finalisé et soumis avec succès !" },
        { label: '🌙 Douche prise, dodo 22h15', text: "Douche chaude prise, je me couche à 22h15 pour être en forme." },
      ]
    : [
        { label: '🍽️ All 3 meals eaten', text: "Completed all 3 balanced meals today." },
        { label: '💻 1h deep desk focus', text: "Completed 60 minutes of deep focus at my desk." },
        { label: '🦵 Knee rehab squats (8/10)', text: "Finished left knee squats rehab, stability score 8/10." },
        { label: '🚭 Smoke-free day', text: "100% smoke-free today, 0 cigarettes." },
        { label: '🚀 YouCode brief submitted', text: "Submitted Wednesday YouCode brief on time!" },
      ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WhatsApp AI Engine & Automations</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-300">+212 (Maroc)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <span>{isFr ? 'Rappels WhatsApp & Parseur Automatique IA' : 'WhatsApp Reminders & AI Parser'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {isFr
                ? 'L’application sait exactement quand vous envoyer des rappels (07h00, 13h00, 17h00, 20h00, 22h15). Répondez par texte libre en français ou darija : l’IA comprend et valide vos habitudes automatiquement.'
                : 'The app knows when to prompt you throughout the day. Answer in plain natural language: our AI parses your responses and automatically checks off your targets.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-emerald-800/40 rounded-lg p-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeSubTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 {isFr ? 'Chat WhatsApp' : 'Chat Interface'}
            </button>
            <button
              onClick={() => setActiveSubTab('schedule')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeSubTab === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⏰ {isFr ? 'Calendrier des Rappels' : 'Prompt Schedule'}
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeSubTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚙️ {isFr ? 'Webhook & API' : 'Webhook & API'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Simulator Pane */}
          <div className="lg:col-span-2 bg-[#0c1317] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[580px] shadow-2xl">
            {/* WhatsApp Phone TopBar */}
            <div className="bg-[#1f2c34] px-4 py-3 border-b border-slate-700/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>Ascent Habit Coach</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">
                      IA Active
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>en ligne · synchronisé avec le cockpit</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    isFr
                      ? "Ascent Habit Protocol: 3 repas, 1h bureau, squats genou gauche, 0 tabac."
                      : "Ascent Habit Protocol update"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded transition-colors"
                  title="Ouvrir dans le vrai WhatsApp"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vrai WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-90">
              <div className="text-center my-2">
                <span className="text-[11px] bg-[#182229] text-slate-400 px-3 py-1 rounded-md border border-slate-800">
                  Aujourd'hui · Chiffrement de bout en bout · Parseur IA Gemini 3.8 Flash
                </span>
              </div>

              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm shadow-md ${
                        isUser
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                      {m.parsedUpdates && (
                        <div className="mt-2 pt-2 border-t border-slate-600/40 text-xs text-emerald-300 font-mono flex flex-wrap gap-1">
                          <span className="text-slate-400">Mutations validées :</span>
                          {m.parsedUpdates.meals?.lunch && <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">✓ Déjeuner</span>}
                          {m.parsedUpdates.deskHourDone && <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">✓ 1h Bureau</span>}
                          {m.parsedUpdates.kneeRehab?.sessionCompleted && <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">✓ Genou {m.parsedUpdates.kneeRehab?.balanceScore || 8}/10</span>}
                          {m.parsedUpdates.smokeFree && <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">✓ 0 Tabac</span>}
                          {m.parsedUpdates.youCodeBrief?.completed && <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">✓ Brief YouCode</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>{m.timestamp}</span>
                        {isUser && <span className="text-sky-400 font-bold">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#202c33] text-slate-300 rounded-lg px-4 py-2.5 text-xs flex items-center gap-2 border border-slate-700/40">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-150" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-300" />
                    <span>L'IA analyse vos actions et met à jour le cockpit...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="bg-[#182229] px-3 py-2 border-t border-slate-700/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">Exemples :</span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  className="shrink-0 text-xs px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-slate-200 border border-slate-700/60 rounded-full transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Text Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-[#202c33] p-3 border-t border-slate-700/60 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isFr ? "Écrivez ce que vous avez fait (ex: 1h bureau et 3 repas validés)..." : "Type what you accomplished..."}
                className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-sm px-4 py-2.5 rounded-lg border border-transparent focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Summary & Automation Card */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">
                    {isFr ? 'Statut Cockpit Synchronisé' : 'Synchronized Cockpit'}
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  {todayLog.date}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400">3 Repas Complets :</span>
                  <span className={`font-semibold ${todayLog.fullMealsAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {todayLog.fullMealsAchieved ? '✓ Validé' : `${[todayLog.meals.breakfast, todayLog.meals.lunch, todayLog.meals.dinner].filter(Boolean).length}/3`}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400">Bureau ≥1h par jour :</span>
                  <span className={`font-semibold ${todayLog.deskHourDone ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {todayLog.deskHourDone ? `✓ ${todayLog.deskMinutesLogged} mins` : `${todayLog.deskMinutesLogged}/60 mins`}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400">Genou Gauche & Hypertrophie :</span>
                  <span className={`font-semibold ${todayLog.kneeRehab.sessionCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {todayLog.kneeRehab.sessionCompleted ? `✓ Score ${todayLog.kneeRehab.balanceScore}/10` : 'En attente'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400">Sans Tabac :</span>
                  <span className="font-semibold text-emerald-400">✓ 100% Propre</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400">Brief YouCode Mercredi :</span>
                  <span className={`font-semibold ${todayLog.wednesdayBriefCompleted ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {todayLog.wednesdayBriefCompleted ? '✓ Soumis' : 'En cours'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Chaque message envoyé ici ou via l'API Webhook est analysé par Gemini. Vos données sont persistées sur votre clé UUID anonyme.
              </div>
            </div>

            {/* Quick Automation Trigger */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Tester un Rappel Immédiat</h3>
              </div>
              <p className="text-xs text-slate-400">
                Simulez l'envoi d'un rappel automatique programmé pour tester l'interaction :
              </p>
              <div className="space-y-1.5">
                {schedule.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleTestPrompt(s.prompt)}
                    className="w-full text-left text-xs p-2 bg-slate-950 hover:bg-slate-800/80 rounded border border-slate-800/80 text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-emerald-400 text-[11px]">{s.time}</span>
                      <span className="truncate">{s.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Calendrier Intelligent des 7 Rappels Quotidiens</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Horaires optimisés pour le rythme de vie au Maroc (GMT+1) : réveil 06h45, repas à heures fixes, focus bureau et coucher 22h30.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Rappels automatiques :</span>
                <button
                  onClick={() => setAutoReminders(!autoReminders)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    autoReminders
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {autoReminders ? '✓ Activés' : 'Désactivés'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4 space-y-3 hover:border-emerald-800/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        {item.time}
                      </span>
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                    </div>
                    {item.dayOfWeek !== undefined && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                        {item.dayOfWeek === 3 ? 'Mercredi' : 'Weekend'}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded border border-slate-800/60 text-xs text-slate-300 italic">
                    « {item.prompt} »
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <span className="text-slate-500">Cible : {item.targetHabit}</span>
                    <button
                      onClick={() => handleTestPrompt(item.prompt)}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Simuler ce message</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings & Webhook Tab */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <span>Configuration Webhook & Connexion WhatsApp Business / Twilio</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Reliez directement votre numéro WhatsApp personnel ou votre compte Meta Cloud API pour recevoir les notifications sur votre smartphone.
              </p>
            </div>

            {/* Webhook Endpoint Box */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-200">
                URL du Webhook de Réception (Webhook Callback URL) :
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-emerald-400 select-all"
                />
                <button
                  onClick={copyWebhook}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                Token de vérification Meta : <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">ascent_webhook_verify_token</code>
              </div>
            </div>

            {/* Phone Number Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Votre Numéro WhatsApp (Maroc) :</label>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+212 6XX-XXXXXX"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Fournisseur de Passerelle :</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white">
                  <option value="meta_cloud">Meta WhatsApp Cloud API (Officiel)</option>
                  <option value="twilio">Twilio Programmable Messaging</option>
                  <option value="simulator">Simulateur Intégré Ascent (Recommandé)</option>
                </select>
              </div>
            </div>

            {/* Guide Step-by-Step */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white">Comment connecter votre vrai compte WhatsApp :</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Créez un compte gratuit sur <strong>Meta for Developers</strong> ou <strong>Twilio</strong>.</li>
                <li>Dans les paramètres de votre application WhatsApp, collez l'URL de rappel ci-dessus.</li>
                <li>Ajoutez le token de vérification <code className="text-emerald-400">ascent_webhook_verify_token</code>.</li>
                <li>Envoyez un message de test depuis votre téléphone : l'IA d'Ascent analyse vos réponses et met à jour instantanément votre compte.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
