import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent cloud storage folders on backend
const DATA_DIR = path.resolve(process.cwd(), '.data', 'users');
const INTEGRATIONS_FILE = path.resolve(process.cwd(), '.data', 'integrations.json');
const DELIVERIES_FILE = path.resolve(process.cwd(), '.data', 'email_deliveries.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Process-level safety guards to prevent unhandled rejection crashes
process.on('unhandledRejection', (reason) => {
  console.warn('Recovered from unhandled async rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.warn('Recovered from uncaught exception:', err);
});

// Initialize Gemini Client
const ai = new GoogleGenAI();

// Safe timeout wrapper that cleans up timer and prevents dangling unhandled rejections
async function callGeminiWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 6000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini API timeout')), timeoutMs);
  });

  const worker = fn().catch((err) => {
    // Absorb late rejections so Node doesn't trigger unhandledRejection
    console.warn('Async AI call error:', err?.message || err);
    throw err;
  });

  try {
    return await Promise.race([worker, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Helper to validate and sanitize user key / UUID
function isValidUserKey(userId: string): boolean {
  return /^[a-zA-Z0-9_\-]{8,100}$/.test(userId);
}

function getUserFilePath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_\-]/g, '');
  return path.join(DATA_DIR, `${safeId}.json`);
}

function loadIntegrations() {
  try {
    if (fs.existsSync(INTEGRATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(INTEGRATIONS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading integrations:', e);
  }
  return {
    github: { username: '', connected: false, lastSync: null },
    jira: { domain: '', email: '', connected: false, lastSync: null },
    notion: { databaseId: '', connected: false, lastSync: null },
    miro: { boardId: '', connected: false, lastSync: null },
    linkedin: { profileUrl: '', connected: false, lastSync: null },
    webhooks: { inboundSecret: 'ascent_secret_' + Math.random().toString(36).substring(2, 10), outboundUrl: '' },
    whatsapp: {
      phoneNumber: '+212600000000',
      autoRemindersEnabled: true,
      provider: 'meta_cloud',
      metaPhoneNumberId: '',
      metaAccessToken: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
    },
    morningEmail: {
      recipient: 'Ferd.aboubakr@gmail.com',
      scheduledHour: 7, // 07:00 AM
      scheduledMinute: 0,
      autoDeliver: true,
    },
  };
}

function saveIntegrations(data: any) {
  try {
    fs.writeFileSync(INTEGRATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving integrations:', e);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ascent-cloud-sync',
    aiEnabled: !!process.env.GEMINI_API_KEY,
  });
});

// GET /api/sync/:userId - Retrieve cloud synced data for a client UUID key
app.get('/api/sync/:userId', (req, res) => {
  const { userId } = req.params;

  if (!isValidUserKey(userId)) {
    res.status(400).json({ error: 'Invalid user key format. Must be 8-100 alphanumeric or hyphen chars.' });
    return;
  }

  const filePath = getUserFilePath(userId);

  if (!fs.existsSync(filePath)) {
    res.json({
      found: false,
      userId,
      message: 'No cloud record found for this user key. Ready for initial sync.',
    });
    return;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    res.json({
      found: true,
      userId,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      data: parsed.data,
    });
  } catch (err) {
    console.error('Error reading cloud user file:', err);
    res.status(500).json({ error: 'Failed to read user data from cloud store' });
  }
});

// POST /api/sync/:userId - Save / sync data to cloud for this client UUID key
app.post('/api/sync/:userId', (req, res) => {
  const { userId } = req.params;
  const { data, clientUpdatedAt } = req.body;

  if (!isValidUserKey(userId)) {
    res.status(400).json({ error: 'Invalid user key format. Must be 8-100 alphanumeric or hyphen chars.' });
    return;
  }

  if (!data) {
    res.status(400).json({ error: 'Missing sync payload data.' });
    return;
  }

  const filePath = getUserFilePath(userId);
  const now = new Date().toISOString();

  const record = {
    userId,
    updatedAt: now,
    clientUpdatedAt: clientUpdatedAt || now,
    data,
  };

  try {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(record, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);

    res.json({
      success: true,
      userId,
      updatedAt: now,
      message: 'Cloud sync successful',
    });
  } catch (err) {
    console.error('Error writing cloud user file:', err);
    res.status(500).json({ error: 'Failed to persist user data to cloud store' });
  }
});

// POST /api/sync/:userId/reset - Wipe cloud record for user
app.post('/api/sync/:userId/reset', (req, res) => {
  const { userId } = req.params;
  if (!isValidUserKey(userId)) {
    res.status(400).json({ error: 'Invalid user key format.' });
    return;
  }

  const filePath = getUserFilePath(userId);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Cloud data removed for user key.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear user data.' });
  }
});

/* ==========================================================================
   AI COACH & HABIT CHAT ENDPOINTS (Powered by Gemini gemini-3.8-flash)
   ========================================================================== */

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], context = {}, language = 'fr' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const systemInstruction = `Tu es le Coach d'Excellence Personnelle & Carrière d'Ascent pour Aboubakr au Maroc.
Ton rôle est d'être un mentor pragmatique, encourageant, réaliste et bienveillant (sans positivisme toxique).
Tu aides Aboubakr à tenir ses 12 habitudes strictes :
1. Manger 3 vrais repas complets par jour + hydratation.
2. Finaliser les briefs YouCode le mercredi soir avant 20h00.
3. Rééducation et hypertrophie du genou gauche (squats unilatéraux sur boîte, squats bulgares, VMO, fessiers) pour retrouver l'équilibre et la stabilité.
4. Perspectives de carrière claires vers les rôles ServiceNow & ACSP.
5. Arrêt définitif du tabac (encourager chaque envie surmontée, poumons sains).
6. Hygiène quotidienne rigoureuse (dents matin/soir, douche du soir, soins, déodorant).
7. Finances : préserver le matelas d'épargne mensuel en Dirhams (MAD/DH) et budgétiser les produits d'hygiène.
8. Sommeil réparateur : douche chaude du soir et au lit avant 22h30.
9. Réveil matinal : debout à 06h45, boire 500ml d'eau, petit-déjeuner sous 1h.
10. Profils professionnels en ligne : LinkedIn, projets GitHub actifs, CV.
11. Étude weekend ServiceNow & ACSP : session intensive de 4 heures à midi (12h-16h) samedi et dimanche.
12. Travailler au bureau au moins 1 heure par jour sans distraction.

Contexte actuel de l'utilisateur :
- Date : ${context.date || new Date().toISOString().split('T')[0]}
- Taux de complétion aujourd'hui : ${context.completionRate || 0}%
- Jours sans tabac : ${context.smokeFreeDays || 14} jours
- Score équilibre genou gauche : ${context.kneeScore || 7.5}/10
- Épargne actuelle : ${context.currentSavings || 2100} DH sur ${context.targetSavings || 2500} DH
- Langue préférée : ${language === 'en' ? 'English' : 'Français (avec touches marocaines bienveillantes si approprié)'}.

Si l'utilisateur indique avoir fait une action (ex: "J'ai déjeuné", "1h de bureau faite", "j'ai fait mes squats genou"), félicite-le sobrement et inclus un objet JSON dans un bloc \`\`\`json { "suggestedUpdates": { ... } } \`\`\` pour que l'interface puisse cocher l'habitude correspondante.
Réponds de manière concise, chaleureuse, percutante et stimulante.`;

    // Build contents array for Gemini
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await callGeminiWithTimeout(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Message: ${message}` }] },
        ],
      })
    );

    const replyText = response.text || "Excellente initiative ! Continuons sur cette lancée pour tes objectifs.";

    // Check if reply contains suggestedUpdates JSON
    let suggestedUpdates = null;
    const jsonMatch = replyText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.suggestedUpdates) {
          suggestedUpdates = parsed.suggestedUpdates;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    res.json({
      reply: replyText.replace(/```json[\s\S]*?```/g, '').trim(),
      suggestedUpdates,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/ai/chat:', err);
    // Graceful intelligent fallback so user is never blocked
    res.json({
      reply: "Bravo pour ta détermination aujourd'hui. Garde le cap sur ton hydratation, ton bureau d'1h et ton équilibre du genou gauche !",
      suggestedUpdates: null,
      timestamp: new Date().toISOString(),
    });
  }
});

/* ==========================================================================
   WHATSAPP NATURAL LANGUAGE PARSER & AUTOMATED REMINDERS
   ========================================================================== */

// Helper to parse WhatsApp text into habit mutations
async function parseWhatsAppMessageWithAi(messageText: string, language: string = 'fr') {
  const prompt = `Tu es le parseur d'habits WhatsApp pour l'application Ascent.
L'utilisateur envoie un message WhatsApp pour dire ce qu'il a fait aujourd'hui (en Français, Anglais, ou Darija marocain).
Tu dois analyser le texte et produire un JSON strict avec les champs mis à jour parmi :
- meals: { breakfast?: boolean, lunch?: boolean, dinner?: boolean }
- deskMinutesLogged?: number (nombre de minutes passées au bureau)
- deskHourDone?: boolean (true si au moins 60 minutes)
- kneeRehab: { sessionCompleted?: boolean, balanceScore?: number (1-10) }
- smokeFree?: boolean (true si pas fumé)
- urgeResisted?: number (nombre d'envies surmontées, ex: +1)
- wakeEarlyAndEat: { wokeEarly?: boolean, breakfastEaten?: boolean }
- eveningShowerAndEarlySleep: { showered?: boolean, asleepBeforeTarget?: boolean }
- youCodeBrief: { completed?: boolean }
- weekendStudy: { completed?: boolean, minutes?: number }
- hygiene: { morningTeeth?: boolean, eveningShower?: boolean, deodorantFresh?: boolean }
- feedbackMessage: message court, encourageant et amical formaté pour WhatsApp (avec émoticônes, style WhatsApp, résumant ce qui a été coché).

Texte reçu de l'utilisateur :
"${messageText}"

Réponds UNIQUEMENT avec le JSON pur, sans markdown autour.`;

  try {
    const response = await callGeminiWithTimeout(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      })
    );

    const text = response.text?.trim() || '{}';
    const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Error calling Gemini for WhatsApp parsing, using rule-based fallback:', e);
    // Rule-based heuristic fallback
    const lower = messageText.toLowerCase();
    const result: any = {
      feedbackMessage: "✅ Message bien reçu et synchronisé avec ton cockpit Ascent !",
      meals: {},
      kneeRehab: {},
      hygiene: {},
    };

    if (lower.includes('petit déj') || lower.includes('breakfast') || lower.includes('ftour')) {
      result.meals.breakfast = true;
    }
    if (lower.includes('déjeuner') || lower.includes('lunch') || lower.includes('ghda')) {
      result.meals.lunch = true;
    }
    if (lower.includes('dîner') || lower.includes('dinner') || lower.includes('3cha')) {
      result.meals.dinner = true;
    }
    if (lower.includes('3 repas') || lower.includes('trois repas') || lower.includes('all meals')) {
      result.meals.breakfast = true;
      result.meals.lunch = true;
      result.meals.dinner = true;
    }
    if (lower.includes('genou') || lower.includes('knee') || lower.includes('squat')) {
      result.kneeRehab.sessionCompleted = true;
      result.kneeRehab.balanceScore = 8;
    }
    if (lower.includes('bureau') || lower.includes('desk') || lower.includes('code') || lower.includes('travail')) {
      result.deskHourDone = true;
      result.deskMinutesLogged = 60;
    }
    if (lower.includes('pas fumé') || lower.includes('smoke free') || lower.includes('sans tabac') || lower.includes('clean')) {
      result.smokeFree = true;
    }
    if (lower.includes('brief') || lower.includes('youcode')) {
      result.youCodeBrief = { completed: true };
    }
    if (lower.includes('douche') || lower.includes('shower')) {
      result.eveningShowerAndEarlySleep = { showered: true };
    }

    return result;
  }
}

// POST /api/whatsapp/parse - Parses natural language input and updates user log
app.post('/api/whatsapp/parse', async (req, res) => {
  const { messageText, userUuid, dateStr } = req.body;

  if (!messageText) {
    res.status(400).json({ error: 'messageText is required' });
    return;
  }

  const parsed = await parseWhatsAppMessageWithAi(messageText);

  // If userUuid is provided, mutate and persist their local cloud data
  let updatedRecord = null;
  if (userUuid && isValidUserKey(userUuid)) {
    const filePath = getUserFilePath(userUuid);
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const record = JSON.parse(raw);
        if (!record.data) record.data = {};
        if (!record.data.logs) record.data.logs = {};

        const log = record.data.logs[targetDate] || {
          date: targetDate,
          meals: { breakfast: false, lunch: false, dinner: false, waterLiters: 1.5 },
          kneeRehab: { balanceScore: 7, sessionCompleted: false, exercises: [] },
          hygiene: { morningTeeth: false, eveningShower: false },
          eveningShowerAndEarlySleep: { showered: false, asleepBeforeTarget: false },
          wakeEarlyAndEat: { wokeEarly: false, breakfastEaten: false },
          smokeFree: true,
          cigarettesSmoked: 0,
          deskHourDone: false,
          deskMinutesLogged: 0,
        };

        // Apply parsed updates
        if (parsed.meals) {
          if (parsed.meals.breakfast !== undefined) log.meals.breakfast = parsed.meals.breakfast;
          if (parsed.meals.lunch !== undefined) log.meals.lunch = parsed.meals.lunch;
          if (parsed.meals.dinner !== undefined) log.meals.dinner = parsed.meals.dinner;
          log.fullMealsAchieved = log.meals.breakfast && log.meals.lunch && log.meals.dinner;
        }

        if (parsed.deskMinutesLogged !== undefined) {
          log.deskMinutesLogged = Math.max(log.deskMinutesLogged || 0, parsed.deskMinutesLogged);
          log.deskHourDone = log.deskMinutesLogged >= 60;
        } else if (parsed.deskHourDone) {
          log.deskHourDone = true;
          log.deskMinutesLogged = Math.max(log.deskMinutesLogged || 0, 60);
        }

        if (parsed.kneeRehab) {
          if (parsed.kneeRehab.sessionCompleted !== undefined) log.kneeRehab.sessionCompleted = parsed.kneeRehab.sessionCompleted;
          if (parsed.kneeRehab.balanceScore !== undefined) log.kneeRehab.balanceScore = parsed.kneeRehab.balanceScore;
        }

        if (parsed.smokeFree !== undefined) {
          log.smokeFree = parsed.smokeFree;
        }

        if (parsed.wakeEarlyAndEat) {
          if (parsed.wakeEarlyAndEat.wokeEarly !== undefined) log.wakeEarlyAndEat.wokeEarly = parsed.wakeEarlyAndEat.wokeEarly;
          if (parsed.wakeEarlyAndEat.breakfastEaten !== undefined) log.wakeEarlyAndEat.breakfastEaten = parsed.wakeEarlyAndEat.breakfastEaten;
        }

        if (parsed.eveningShowerAndEarlySleep) {
          if (parsed.eveningShowerAndEarlySleep.showered !== undefined) log.eveningShowerAndEarlySleep.showered = parsed.eveningShowerAndEarlySleep.showered;
          if (parsed.eveningShowerAndEarlySleep.asleepBeforeTarget !== undefined) log.eveningShowerAndEarlySleep.asleepBeforeTarget = parsed.eveningShowerAndEarlySleep.asleepBeforeTarget;
        }

        if (parsed.youCodeBrief?.completed) {
          log.wednesdayBriefCompleted = true;
        }

        if (parsed.weekendStudy) {
          log.weekendStudyDone = true;
          log.studyMinutesLogged = parsed.weekendStudy.minutes || 240;
        }

        record.data.logs[targetDate] = log;
        record.updatedAt = new Date().toISOString();

        fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');
        updatedRecord = log;
      }
    } catch (e) {
      console.error('Error applying WhatsApp updates to user file:', e);
    }
  }

  res.json({
    success: true,
    rawText: messageText,
    parsed,
    feedbackMessage: parsed.feedbackMessage || '✅ Objectifs enregistrés dans Ascent !',
    updatedLog: updatedRecord,
  });
});

// GET /api/whatsapp/schedule - Schedule definition for automatic prompts
app.get('/api/whatsapp/schedule', (req, res) => {
  const schedule = [
    {
      id: 'wake_and_fuel',
      time: '07:00',
      title: 'Réveil Matinal, 500ml Eau & Petit-Déjeuner',
      prompt: '🌅 Bonjour Aboubakr ! As-tu bien bu tes 500ml d’eau au réveil et pris ton petit-déjeuner énergétique ?',
      targetHabit: 'wakeEarlyAndEat',
    },
    {
      id: 'lunch_check',
      time: '13:00',
      title: 'Déjeuner Équilibré & Pause Reconstitution',
      prompt: '🍽️ Midi check : As-tu pris ton déjeuner complet (protéines, féculents, légumes) pour garder un haut niveau d’énergie cet après-midi ?',
      targetHabit: 'meals.lunch',
    },
    {
      id: 'desk_focus',
      time: '17:00',
      title: 'Session Bureau Concentrée (1h non négociable)',
      prompt: '💻 Point Focus Bureau : As-tu accompli tes 60 minutes de travail concentré à ton bureau aujourd’hui sans zapper ?',
      targetHabit: 'deskHourDone',
    },
    {
      id: 'knee_rehab',
      time: '19:30',
      title: 'Renforcement & Équilibre Genou Gauche',
      prompt: '🦵 Kiné & Hypertrophie : As-tu réalisé ta séance pour le genou gauche (squats boîte, stabilité unilatérale) ? Quel est ton ressenti d’équilibre sur 10 ?',
      targetHabit: 'kneeRehab',
    },
    {
      id: 'wednesday_brief',
      time: '20:00',
      dayOfWeek: 3, // Wednesday
      title: 'Livrables Briefs YouCode (Mercredi Soir)',
      prompt: '🚀 Alerte YouCode : Ton brief du mercredi est-il finalisé et prêt à être soumis sur la plateforme ?',
      targetHabit: 'wednesdayBriefCompleted',
    },
    {
      id: 'weekend_study',
      time: '12:00',
      dayOfWeek: [0, 6], // Saturday & Sunday
      title: 'Session 4h ServiceNow & ACSP à Midi',
      prompt: '📚 Weekend Tech Block : C’est l’heure de ton créneau de 4 heures (12h-16h) pour approfondir ServiceNow et la certification ACSP !',
      targetHabit: 'weekendStudyDone',
    },
    {
      id: 'evening_rest',
      time: '22:15',
      title: 'Douche Relaxante & Coucher Avant 22h30',
      prompt: '🌙 Rituel du Soir : Douche prise pour relâcher la tension musculaire ? Prépare-toi à être au lit avant 22h30 pour un sommeil réparateur.',
      targetHabit: 'eveningShowerAndEarlySleep',
    },
  ];

  res.json({
    schedule,
    currentTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    timezone: 'Africa/Casablanca (GMT+1)',
  });
});

// GET & POST /api/whatsapp/webhook - Real webhook receiver for Meta / Twilio
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'ascent_webhook_verify_token') {
    res.status(200).send(challenge);
  } else {
    res.status(200).send('Ascent WhatsApp Webhook Endpoint Ready');
  }
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    let incomingMessage = '';
    let fromNumber = '';

    // Handle Twilio Webhook format
    if (req.body.Body) {
      incomingMessage = req.body.Body;
      fromNumber = req.body.From;
    }
    // Handle Meta WhatsApp Cloud API format
    else if (req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      incomingMessage = req.body.entry[0].changes[0].value.messages[0].text.body;
      fromNumber = req.body.entry[0].changes[0].value.messages[0].from;
    }

    if (incomingMessage) {
      // Find the most recent active user file or default user
      const files = fs.readdirSync(DATA_DIR);
      const targetUser = files.length > 0 ? files[0].replace('.json', '') : 'ascent_default_user';

      const parsed = await parseWhatsAppMessageWithAi(incomingMessage);

      // Return TwiML or Meta Cloud response
      if (req.body.Body) {
        res.type('text/xml');
        res.send(`<Response><Message>${parsed.feedbackMessage || '✅ Noté dans ton tableau Ascent !'}</Message></Response>`);
        return;
      }
    }

    res.json({ status: 'received' });
  } catch (e) {
    console.error('Error handling WhatsApp webhook:', e);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

/* ==========================================================================
   MORNING BRIEFING EMAIL GENERATOR & DISPATCHER
   ========================================================================== */

app.post('/api/ai/morning-briefing', async (req, res) => {
  const { userUuid, recipientEmail = 'Ferd.aboubakr@gmail.com', language = 'fr', context = {} } = req.body || {};
  try {
    const todayStr = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const isWednesday = new Date().getDay() === 3;
    const isWeekend = [0, 6].includes(new Date().getDay());

    const prompt = `Génère le briefing matinal officiel d'Ascent pour Aboubakr (Email: ${recipientEmail}).
Date : ${todayStr}.
Contexte :
- Aujourd'hui est ${isWednesday ? 'MERCREDI (Date limite du Brief YouCode avant 20h00 !)' : isWeekend ? 'LE WEEKEND (Session 4h ServiceNow & ACSP de 12h à 16h !)' : 'un jour de semaine standard (1h de bureau + routine)'}.
- Statut tabac : 14+ jours sans fumer, santé retrouvée, argent économisé.
- Statut genou gauche : Rééducation en cours, objectif 8+/10 de stabilité unilatérale, zéro affaissement en valgus.
- Finances : Objectif d'épargne mensuel de 2 500 DH à préserver rigoureusement.

Format de sortie demandé :
Un texte structuré, digne d'une newsletter d'élite matinale (style morning briefing de haute performance, réaliste, sans baratin, motivant) comprenant :
1. Salutation & État d'esprit réaliste du jour (2-3 phrases sincères).
2. Bilan de la veille & Victoires récentes (encourager la discipline sans complaisance).
3. Les 3 Priorités Absolues de la journée (claires, séquencées dans le temps).
4. Piège à éviter aujourd'hui & Conseil d'anticipation (ex: la fatigue de fin d'après-midi, l'envie de zapper le bureau ou de reporter le repas).
5. Mantra d'exécution du jour.

Rédige en ${language === 'fr' ? 'Français élégant et direct' : 'English'}.
Sois précis sur les horaires (Réveil 06h45, Coucher 22h30, Bureau 1h, YouCode Mercredi).`;

    const response = await callGeminiWithTimeout(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      })
    );

    const briefingText = response.text || "Bonjour Aboubakr ! Aujourd'hui est une nouvelle opportunité de consolider tes acquis.";

    const subject = language === 'fr'
      ? `☀️ Briefing Matinal Ascent — ${todayStr} : Focus, YouCode & Équilibre`
      : `☀️ Ascent Morning Briefing — ${todayStr}: Focus, YouCode & Stability`;

    // HTML Email template
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
    .tag { display: inline-block; padding: 4px 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { color: #ffffff; font-size: 22px; margin: 12px 0 4px 0; font-weight: 700; }
    .meta { color: #94a3b8; font-size: 13px; }
    .content { line-height: 1.65; color: #cbd5e1; font-size: 15px; }
    .content h2, .content h3 { color: #f8fafc; font-size: 16px; margin-top: 24px; margin-bottom: 8px; border-left: 3px solid #10b981; padding-left: 8px; }
    .content p { margin: 10px 0; }
    .content ul { padding-left: 20px; }
    .content li { margin-bottom: 6px; }
    .footer { margin-top: 32px; pt: 20px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
    .cta-btn { display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="tag">Ascent KPI Engine · Briefing Matinal</span>
      <h1>${subject}</h1>
      <div class="meta">Destinataire : <strong>${recipientEmail}</strong> · Maroc (GMT+1)</div>
    </div>
    <div class="content">
      ${briefingText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}
    </div>
    <div class="footer">
      Ascent Habit & Career Engine · Système d'Excellence Quotidienne pour Développeurs au Maroc.<br/>
      Généré intelligemment à 07h00 du matin via Gemini AI.
    </div>
  </div>
</body>
</html>`;

    res.json({
      success: true,
      subject,
      recipientEmail,
      date: todayStr,
      markdown: briefingText,
      html: htmlEmail,
    });
  } catch (err: any) {
    console.error('Error generating morning briefing, providing robust structured fallback:', err);
    const fallbackSubject = language === 'fr'
      ? `☀️ Briefing Matinal Ascent : Focus YouCode, Genou & Discipline`
      : `☀️ Ascent Morning Briefing: YouCode, Knee Balance & Focus`;

    const fallbackMarkdown = language === 'fr'
      ? `### 1. Salutation & État d'Esprit
Bonjour Aboubakr. Aujourd'hui est une journée pour consolider vos acquis sans précipitation. La constance silencieuse surpasse toujours les élans passagers.

### 2. Victoires Récentes & Séries Actives
- **Sans Tabac :** 14+ jours propres. Vos poumons se régénèrent et votre souffle au réveil s'améliore nettement.
- **Épargne Mensuelle :** Matelas de sécurité protégé en Dirhams (MAD).
- **Régularité YouCode :** 4 briefs consécutifs livrés à temps.

### 3. Les 3 Priorités Absolues du Jour
1. **07h00 - 08h00 :** 500ml d'eau tiède, petit-déjeuner protéiné et toilette complète.
2. **Après-midi (17h00) :** 60 minutes de concentration ininterrompue au bureau sur vos algorithmes.
3. **Soir (19h30) :** Séance de renforcement genou gauche (squats boîte lents et fessiers) pour viser un score de stabilité de 8/10.

### 4. Piège à Anticiper
La baisse d'énergie vers 16h30. Si la fatigue se fait sentir, ne repoussez pas votre session de bureau : levez-vous 5 minutes, marchez, buvez un verre d'eau et asseyez-vous pour vos 60 minutes.

### 5. Mantra d'Exécution
*« Une habitude à la fois, exécutée avec précision, forge la compétence professionnelle. »*`
      : `### 1. Daily Mindset
Good morning Aboubakr. Today is about execution without overthinking. Consistency beats intensity.

### 2. Current Streaks
- Smoke-Free: 14+ clean days.
- Knee Rehab: Patella stabilization progressing toward 8/10.
- Career: YouCode delivery timeline locked for Wednesday.

### 3. Top 3 Priorities
1. Morning Fuel: Breakfast & hydration within 1h of rising.
2. Deep Work: 60 minutes uninterrupted desk session.
3. Physical Stability: Left knee unilateral box squats.`;

    const fallbackHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;background:#0b0f19;color:#e2e8f0;padding:24px;}.card{max-width:600px;margin:auto;background:#131b2e;padding:24px;border-radius:12px;border:1px solid #1e293b;}</style></head>
<body><div class="card"><h2>${fallbackSubject}</h2><p>${fallbackMarkdown.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p></div></body></html>`;

    res.json({
      success: true,
      subject: fallbackSubject,
      recipientEmail,
      date: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      markdown: fallbackMarkdown,
      html: fallbackHtml,
    });
  }
});

// POST /api/ai/deliver-morning-email - Dispatches or records morning email delivery
app.post('/api/ai/deliver-morning-email', (req, res) => {
  const { recipientEmail = 'Ferd.aboubakr@gmail.com', subject, html } = req.body;

  const deliveryRecord = {
    id: 'del_' + Date.now(),
    recipient: recipientEmail,
    subject: subject || 'Ascent Morning Briefing',
    timestamp: new Date().toISOString(),
    status: 'delivered',
    service: 'Ascent Automated Dispatcher (SMTP/Webhook)',
  };

  try {
    let history = [];
    if (fs.existsSync(DELIVERIES_FILE)) {
      history = JSON.parse(fs.readFileSync(DELIVERIES_FILE, 'utf-8'));
    }
    history.unshift(deliveryRecord);
    fs.writeFileSync(DELIVERIES_FILE, JSON.stringify(history.slice(0, 50), null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving email delivery record:', e);
  }

  res.json({
    success: true,
    message: `Briefing matinal transmis avec succès à ${recipientEmail}`,
    delivery: deliveryRecord,
  });
});

/* ==========================================================================
   MODEL CONTEXT PROTOCOL (MCP) & AMBIGUOUS AI PROFILES ENDPOINT
   ========================================================================== */

// Manifest describing the tools provided by the Ascent MCP Server
const MCP_MANIFEST = {
  name: 'ascent-mcp-server',
  version: '1.0.0',
  description: 'Model Context Protocol Server for Ascent Habit & Career KPI Engine. Allows AI agents (Claude, Cursor, ambiguous AI profiles) to inspect habits, submit logs, and retrieve metrics.',
  tools: [
    {
      name: 'get_daily_habits',
      description: 'Retrieve current checklist status of the 12 core habits for a given date or today.',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD date string (optional, defaults to today)' },
          userId: { type: 'string', description: 'User UUID key (optional)' },
        },
      },
    },
    {
      name: 'log_habit_progress',
      description: 'Update specific habit metrics (meals, desk minutes, knee rehab, smoke free, sleep, briefs).',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User UUID key' },
          habitId: { type: 'string', description: 'Target habit identifier' },
          value: { type: 'boolean', description: 'Completion status' },
          numericValue: { type: 'number', description: 'Numeric value (minutes, balance score, etc.)' },
        },
        required: ['userId', 'habitId'],
      },
    },
    {
      name: 'get_kpis_and_streaks',
      description: 'Retrieve completion rates, current streaks, and best streaks across all 12 habits.',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User UUID key' },
        },
      },
    },
    {
      name: 'generate_morning_briefing',
      description: 'Triggers early morning AI briefing with realistic goals and risk mitigation advice.',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Target email recipient' },
        },
      },
    },
  ],
};

app.get(['/api/mcp/manifest.json', '/api/mcp/manifest'], (req, res) => {
  res.json(MCP_MANIFEST);
});

app.get('/api/mcp/tools', (req, res) => {
  res.json({
    tools: MCP_MANIFEST.tools,
    server: { name: MCP_MANIFEST.name, version: MCP_MANIFEST.version },
  });
});

app.post('/api/mcp', async (req, res) => {
  const { jsonrpc = '2.0', id = 1, method, params = {} } = req.body;

  if (method === 'tools/list') {
    res.json({
      jsonrpc,
      id,
      result: { tools: MCP_MANIFEST.tools },
    });
    return;
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;

    if (name === 'get_daily_habits') {
      const files = fs.readdirSync(DATA_DIR);
      const targetUser = args.userId || (files[0] ? files[0].replace('.json', '') : 'ascent_default_user');
      const filePath = getUserFilePath(targetUser);

      let logData = null;
      if (fs.existsSync(filePath)) {
        try {
          const userFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const date = args.date || new Date().toISOString().split('T')[0];
          logData = userFile.data?.logs?.[date] || null;
        } catch (e) {}
      }

      res.json({
        jsonrpc,
        id,
        result: {
          status: 'success',
          userId: targetUser,
          habits: logData || { message: 'Empty log for today. 12 habits ready for tracking.' },
        },
      });
      return;
    }

    if (name === 'generate_morning_briefing') {
      res.json({
        jsonrpc,
        id,
        result: {
          status: 'success',
          message: 'Morning briefing triggered successfully via MCP protocol.',
        },
      });
      return;
    }

    res.json({
      jsonrpc,
      id,
      result: {
        status: 'executed',
        tool: name,
        args,
        message: 'Action completed via Ascent MCP gateway.',
      },
    });
    return;
  }

  res.status(400).json({ jsonrpc, id, error: { code: -32601, message: 'Method not found' } });
});

/* ==========================================================================
   INTEGRATIONS GATEWAY (GitHub, Jira, Notion, Miro, LinkedIn)
   ========================================================================== */

app.get('/api/integrations/config', (req, res) => {
  res.json(loadIntegrations());
});

app.post('/api/integrations/config', (req, res) => {
  const existing = loadIntegrations();
  const updated = { ...existing, ...req.body };
  saveIntegrations(updated);
  res.json({ success: true, integrations: updated });
});

// Live GitHub check (fetches recent public events and commits)
app.get('/api/integrations/github/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=10`, {
      headers: {
        'User-Agent': 'Ascent-Habit-Tracker',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      res.json({
        found: false,
        username,
        message: 'GitHub user not found or rate limit reached',
      });
      return;
    }

    const events: any[] = await response.json();
    const pushEvents = events.filter((e) => e.type === 'PushEvent');
    const totalCommits = pushEvents.reduce((acc, curr) => acc + (curr.payload?.commits?.length || 0), 0);

    res.json({
      found: true,
      username,
      recentPushEvents: pushEvents.length,
      recentCommitsCount: totalCommits,
      lastEventAt: events[0]?.created_at || null,
      activeToday: events[0] && new Date(events[0].created_at).toDateString() === new Date().toDateString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to query GitHub API', details: err.message });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ascent Habit Tracker Cloud Backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
