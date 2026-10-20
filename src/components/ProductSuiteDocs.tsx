import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  ShieldCheck,
  TrendingUp,
  Database,
  Layers,
  Compass,
  DollarSign,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Award,
  Globe,
  Sparkles,
  Download,
} from 'lucide-react';
import { Language, Currency } from '../i18n/translations';

interface ProductSuiteDocsProps {
  language: Language;
  currency: Currency;
  onNavigateTab: (tabId: string) => void;
}

export const ProductSuiteDocs: React.FC<ProductSuiteDocsProps> = ({
  language,
  currency,
  onNavigateTab,
}) => {
  const isFr = language === 'fr';
  const [selectedDocId, setSelectedDocId] = useState<string>('01_vision');
  const [copiedDoc, setCopiedDoc] = useState(false);

  const docSections = [
    {
      id: '01_vision',
      number: '01',
      title: isFr ? 'Vision & Résumé Exécutif' : 'Vision & Executive Summary',
      subtitle: isFr ? 'Pitch investisseurs & déploiement Maroc / Afrique' : 'Pitch deck & African expansion roadmap',
      icon: TrendingUp,
      badge: 'Pitch Deck',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
      filePath: 'product-documentation/01_EXECUTIVE_SUMMARY_AND_VISION.md',
    },
    {
      id: '02_market',
      number: '02',
      title: isFr ? 'Opportunité Marché & Problème' : 'Market Opportunity & Problem',
      subtitle: isFr ? 'Le fossé d’exécution chez les étudiants YouCode & 1337' : 'The developer execution chasm in African bootcamps',
      icon: Compass,
      badge: 'TAM / SAM',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      filePath: 'product-documentation/02_PROBLEM_AND_MARKET_OPPORTUNITY.md',
    },
    {
      id: '03_features',
      number: '03',
      title: isFr ? 'Catalogue Fonctionnalités & KPIs' : 'Feature Catalog & KPIs',
      subtitle: isFr ? 'Matrice des 12 habitudes & formules d’évaluation' : '12-habit operational matrix & scoring engine',
      icon: Award,
      badge: '12 KPIs',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      filePath: 'product-documentation/03_PRODUCT_FEATURES_AND_KPIS.md',
    },
    {
      id: '04_architecture',
      number: '04',
      title: isFr ? 'Architecture Système & Flux' : 'System Architecture & Data Flows',
      subtitle: isFr ? 'Coffre anonyme UUID, cache hors-ligne & Supabase' : 'Zero-login UUID vault, offline cache & Edge CDN',
      icon: Layers,
      badge: 'System Design',
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
      filePath: 'product-documentation/04_SYSTEM_ARCHITECTURE_AND_FLOWS.md',
    },
    {
      id: '05_database',
      number: '05',
      title: isFr ? 'Schéma Base de Données & Modèles' : 'Database Schema & Data Models',
      subtitle: isFr ? 'Script DDL PostgreSQL, contrat JSONB & règles RLS' : 'PostgreSQL DDL, JSONB contracts & RLS security',
      icon: Database,
      badge: 'PostgreSQL',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      filePath: 'product-documentation/05_DATABASE_SCHEMA_AND_DATA_MODELS.md',
    },
    {
      id: '06_gtm',
      number: '06',
      title: isFr ? 'Stratégie Commerciale & Paiements' : 'Go-To-Market & African Payments',
      subtitle: isFr ? 'Tarification en Dirhams (MAD), CMI, CashPlus & B2B' : 'MAD subscription tiers, CMI & B2B bootcamp licensing',
      icon: DollarSign,
      badge: 'Monetization',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      filePath: 'product-documentation/06_GO_TO_MARKET_AND_BUSINESS_MODEL.md',
    },
    {
      id: '07_security',
      number: '07',
      title: isFr ? 'Sécurité, CNDP & RGPD' : 'Security, CNDP & Compliance',
      subtitle: isFr ? 'Conformité Loi marocaine 09-08 & coffre Zéro-PII' : 'Moroccan Law 09-08 & Zero-PII privacy guarantees',
      icon: ShieldCheck,
      badge: 'CNDP / RGPD',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
      filePath: 'product-documentation/07_PRIVACY_SECURITY_AND_COMPLIANCE.md',
    },
  ];

  const currentDoc = docSections.find((d) => d.id === selectedDocId) || docSections[0];

  const handleCopyCurrentDocPath = () => {
    navigator.clipboard.writeText(currentDoc.filePath);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFr ? 'Dossier Commercial & Technique' : 'Commercial & Technical Dossier'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isFr ? 'Livre Blanc & Architecture Produit' : 'Product Whitepaper & Architecture Suite'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isFr
                ? 'Consultez la documentation complète qui transforme Ascent d’un projet personnel en un produit SaaS commercialisable pour le Maroc et l’Afrique. Tous les documents sont générés dans le dossier /product-documentation.'
                : 'Explore the institutional documentation turning Ascent into a commercial SaaS ready for Morocco and Pan-African expansion. All files are organized inside /product-documentation.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopyCurrentDocPath}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-slate-700"
              title="Copier le chemin relatif"
            >
              {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDoc ? (isFr ? 'Copié !' : 'Copied!') : currentDoc.filePath.split('/')[1]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Navigation List + Right Document Content Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Document Index */}
        <div className="lg:col-span-4 space-y-2">
          <div className="px-1 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span>{isFr ? 'Documents Disponibles' : 'Dossier Index'}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">7 Fichiers</span>
          </div>

          {docSections.map((doc) => {
            const Icon = doc.icon;
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500/30 text-white shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] text-slate-500">{doc.number}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{doc.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{doc.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Document Content Overview */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
                <span>DOC {currentDoc.number}</span>
                <span>·</span>
                <span className="text-slate-400">{currentDoc.filePath}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{currentDoc.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{currentDoc.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${currentDoc.badgeColor}`}>
                {currentDoc.badge}
              </span>
            </div>
          </div>

          {/* Document Content Summaries based on selected item */}
          {selectedDocId === '01_vision' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
                      ASCENT EXECUTIVE VALUE MINDMAP
========================================================================
[REALITÉ TERRAIN] Bootcamps intensifs (YouCode, 1337) + Compétition Nearshore
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[Épuisement & Santé Négligée]      [Rupture d'Exécution & Retards]
• Repas sautés, déshydratation    • Procrastination des briefs du mercredi
• Douleur genou gauche assis 12h  • Syllabus ServiceNow CSA laissé de côté
• Cigarettes & stress chronique   • Déficit financier de fin de mois (MAD)
       │                                 │
       └────────────────┬────────────────┘
                        ▼
       ===================================
       | ASCENT: LE CRM DE LA DISCIPLINE |
       | 12 KPIS CALCULÉS EN TEMPS RÉEL  |
       ===================================`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Points Clés du Document 01 :</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Thèse d'Investissement :</strong> Pourquoi la discipline biologique (nutrition, sommeil, rééducation du genou) est le premier prédicteur de réussite technique chez les développeurs.</li>
                <li><strong>Maroc comme Tremplin :</strong> Alignement stratégique avec les écosystèmes YouCode (Safi/Youssoufia), 1337 (Khouribga/Benguerir/Tétouan) et les pôles nearshore de Casablanca.</li>
                <li><strong>Feuille de Route Panafricaine en 3 Phases :</strong> Phase 1 Maroc (10k coffres) → Phase 2 Afrique de l'Ouest francophone (Dakar, Abidjan) → Phase 3 Hubs anglophones (Lagos, Nairobi, Kigali).</li>
              </ul>
            </div>
          )}

          {selectedDocId === '02_market' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
                 DIMENSIONNEMENT DU MARCHÉ (TAM / SAM / SOM)
========================================================================
• TAM (Afrique)  : 716 000 développeurs pro -> 43 000 000 $ USD / an
• SAM (Maghreb)  : 85 000 étudiants tech & juniors -> 5 100 000 $ USD / an
• SOM (Maroc An 1): 8 000 comptes actifs (3k Pro @ 39 MAD) -> 1 404 000 MAD / an
========================================================================`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Pourquoi les Outils Actuels Échouent :</h4>
              <p>Todoist et Notion n'offrent ni compte à rebours synchronisé avec les briefs de YouCode, ni gestion des devises marocaines (MAD), ni chronomètre dédié au programme de certification ServiceNow CSA / Apple ACSP.</p>
            </div>
          )}

          {selectedDocId === '03_features' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
                    MATRICE DES 12 OBJECTIFS CIBLÉS
========================================================================
#01 Repas complets (3/3)          │ #07 Épargne mensuelle protégée & Hygiène
#02 Briefs YouCode (Mercredi 20h)  │ #08 Coucher tôt (22h30) & Douche
#03 Stabilité Genou Gauche (1-10) │ #09 Réveil matinal (06h45) & Premier repas
#04 Jalons Carrière Certifiés     │ #10 Profils pro LinkedIn / GitHub / CV
#05 Arrêt Tabac & Économies DH   │ #11 ServiceNow & ACSP (4h weekend midi)
#06 Routine Hygiène quotidienne   │ #12 Travail au bureau (≥1h focus pur)
========================================================================`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Formules Algorithmiques Implémentées :</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Calcul des Séries Consécutives :</strong> Algorithme tolérant la journée en cours avec protection jusqu'à 23h59.</li>
                <li><strong>Score de Stabilité du Genou :</strong> Pondération à 60% sur le ressenti de stabilité unilatérale et 40% sur la réalisation des exercices correctifs (VMO, squats bulgares).</li>
                <li><strong>Économies Tabac en Dirhams :</strong> Calcul en direct basé sur 75 DH par paquet et calcul du nombre d'envies surmontées.</li>
              </ul>
            </div>
          )}

          {selectedDocId === '04_architecture' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
             FLUX TECHNIQUE : DU CLIENT JUSQU'AU CLOUD SUPABASE
========================================================================
[Client React 19] ──► Écriture immédiate (0ms) dans localStorage
       │
       ▼
[Debounce 700ms]  ──► Envoi HTTP vers PostgREST (Supabase)
       │
       ▼
[PostgreSQL Table]──► public.user_vaults (Clé primaire: UUID Client)
       │
       ▼
[Sécurité RLS]    ──► Policies 'anon' pour un accès direct sécurisé`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Avantages de l'Approche Sans Mot de Passe :</h4>
              <p>Aucun e-mail stocké, aucune fuite de données d'identification possible. La clé UUID aléatoire garantit une synchronisation instantanée entre PC portable et smartphone sans barrière d'authentification.</p>
            </div>
          )}

          {selectedDocId === '05_database' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
            STRUCTURE DE LA TABLE 'public.user_vaults'
========================================================================
CREATE TABLE public.user_vaults (
  user_id    TEXT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index GIN pour requêtage haute performance
CREATE INDEX idx_user_vaults_data_gin ON public.user_vaults USING gin (data);`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Sécurité au Niveau des Lignes (RLS) :</h4>
              <p>Politiques permissives accordées au rôle <code>anon</code> et <code>authenticated</code> avec contrôle par <code>user_id</code> pour permettre aux clients front-end de synchroniser leur état sans jetons JWT complexes.</p>
            </div>
          )}

          {selectedDocId === '06_gtm' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
                 GRILLE TARIFAIRE ADAPTÉE AU POUVOIR D'ACHAT
========================================================================
• Édition Communautaire (Gratuite) : 0 DH (Toutes les 12 habitudes)
• Ascent Pro Mensuel : 39 MAD / mois (~3.90 $ USD)
• Ascent Pro Annuel  : 350 MAD / an (Économie de 25%)
• B2B Écoles & Bootcamps : 15 MAD / étudiant / mois
========================================================================`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Passerelles de Paiement Marocaines & Panafricaines :</h4>
              <p>Intégration prévue avec le <strong>CMI</strong> (Cartes bancaires marocaines nationales), <strong>PayZone Maroc</strong>, paiement en espèces via <strong>CashPlus / Barid Cash</strong>, et <strong>Orange Money / inwi money</strong>.</p>
            </div>
          )}

          {selectedDocId === '07_security' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{`========================================================================
                 CONFORMITÉ LÉGALE & SÉCURITÉ CRYPTOGRAPHIQUE
========================================================================
• Loi Marocaine 09-08 (CNDP) : Statut de données anonymes exemptées de PII
• RGPD Art. 25 & 17          : Privacy by Design & Droit à l'effacement immédiat
• Entropie UUID v4           : 2^122 combinaisons impossibles à deviner par brute-force
========================================================================`}</pre>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Garanties de Confidentialité Zéro-Fuite :</h4>
              <p>L'application ne demande jamais de numéro de téléphone ni d'adresse e-mail. Les données restent la propriété exclusive de l'utilisateur, exportables en un clic au format JSON standard.</p>
            </div>
          )}

          {/* Quick Actions Footer inside card */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono">
              Fichier source : <code className="text-sky-400 font-semibold">{currentDoc.filePath}</code>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('hosting')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <span>{isFr ? 'Voir Guide Hébergement' : 'Hosting Guide'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
