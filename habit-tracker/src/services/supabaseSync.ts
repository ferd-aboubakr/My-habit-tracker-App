import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppSyncData } from './cloudSync';

const SUPABASE_CONFIG_KEY = 'ascent_supabase_config_v1';

export const DEFAULT_SUPABASE_URL = 'https://ibednyrzqdybukqvlkvt.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_3aN8YSl47yQzOAWYgy-riA_Kp9j6ECb';
export const DEFAULT_TABLE_NAME = 'user_vaults';
export const DEFAULT_ID_COLUMN = 'user_id';
export const DEFAULT_DATA_COLUMN = 'data';

export interface SupabaseConfig {
  enabled: boolean;
  url: string;
  anonKey: string;
  tableName?: string;
  idColumn?: string;
  payloadColumn?: string;
}

export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled ?? true,
        url: parsed.url || DEFAULT_SUPABASE_URL,
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_KEY,
        tableName: parsed.tableName || DEFAULT_TABLE_NAME,
        idColumn: parsed.idColumn || DEFAULT_ID_COLUMN,
        payloadColumn: parsed.payloadColumn || DEFAULT_DATA_COLUMN,
      };
    }
  } catch {}

  // Pre-configured with user's provided Supabase project
  return {
    enabled: true,
    url: (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY,
    tableName: DEFAULT_TABLE_NAME,
    idColumn: DEFAULT_ID_COLUMN,
    payloadColumn: DEFAULT_DATA_COLUMN,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    clientInstance = null; // force recreate client with updated credentials
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let clientInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = loadSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    clientInstance = null;
    return null;
  }
  if (clientInstance && currentUrl === config.url && currentKey === config.anonKey) {
    return clientInstance;
  }
  try {
    clientInstance = createClient(config.url.trim(), config.anonKey.trim());
    currentUrl = config.url;
    currentKey = config.anonKey;
    return clientInstance;
  } catch (e) {
    console.error('Failed to create Supabase client:', e);
    return null;
  }
}

export const SUPABASE_SQL_SETUP = `-- ==============================================================
-- 🚀 SCRIPT SQL SUPABASE RECOMMANDÉ (1-CLIC DANS L'ÉDITEUR SQL)
-- ==============================================================
-- Si vous aviez créé une table de test manuellement, vous pouvez soit:
-- 1. La supprimer (DROP TABLE si elle n'a pas de vraies données)
-- 2. OU exécuter directement ce script qui crée 'public.user_vaults'
-- ==============================================================

-- 1. Création de la table principale user_vaults
create table if not exists public.user_vaults (
  user_id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Autorisations sur le schéma public et la table
grant usage on schema public to anon, authenticated;
grant all on table public.user_vaults to anon, authenticated, service_role;

-- 3. Activation de la sécurité au niveau des lignes (RLS)
alter table public.user_vaults enable row level security;

-- 4. Politiques d'accès complètes pour le rôle 'anon' (clé publique UUID)
drop policy if exists "Allow all read with user_id" on public.user_vaults;
create policy "Allow all read with user_id" on public.user_vaults 
  for select to anon, authenticated using (true);

drop policy if exists "Allow all insert with user_id" on public.user_vaults;
create policy "Allow all insert with user_id" on public.user_vaults 
  for insert to anon, authenticated with check (true);

drop policy if exists "Allow all update with user_id" on public.user_vaults;
create policy "Allow all update with user_id" on public.user_vaults 
  for update to anon, authenticated using (true);
`;

// Test Supabase connection and table status with detailed diagnostics
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableReady: boolean;
  message: string;
  sqlRequired: boolean;
  detailedCode?: string;
}> {
  const config = loadSupabaseConfig();
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      tableReady: false,
      message: 'Client Supabase non initialisé ou URL/Clé manquante.',
      sqlRequired: false,
    };
  }

  const tableName = config.tableName || DEFAULT_TABLE_NAME;
  const idCol = config.idColumn || DEFAULT_ID_COLUMN;

  try {
    const { error } = await supabase.from(tableName).select(idCol).limit(1);

    if (!error) {
      return {
        connected: true,
        tableReady: true,
        message: `Connexion réussie ! La table '${tableName}' est accessible en lecture et écriture pour le rôle anon.`,
        sqlRequired: false,
      };
    }

    // Permission denied: RLS is active but policy / GRANT is missing
    if (error.code === '42501' || error.message?.toLowerCase().includes('permission denied')) {
      return {
        connected: true,
        tableReady: false,
        message: `Table '${tableName}' détectée, mais les permissions RLS manquent pour le rôle anon. Exécutez le script SQL ci-dessous.`,
        sqlRequired: true,
        detailedCode: error.code,
      };
    }

    // Table missing or relation does not exist
    if (
      error.code === 'PGRST205' ||
      error.code === '42P01' ||
      error.message?.toLowerCase().includes('relation') ||
      error.message?.toLowerCase().includes('does not exist') ||
      error.message?.toLowerCase().includes('schema cache')
    ) {
      return {
        connected: true,
        tableReady: false,
        message: `Connecté à Supabase ! La table '${tableName}' n'existe pas encore. Exécutez le script SQL ci-dessous dans l'éditeur SQL de Supabase.`,
        sqlRequired: true,
        detailedCode: error.code,
      };
    }

    // Column not found (e.g. column user_id does not exist if named differently)
    if (error.code === '42703' || error.message?.toLowerCase().includes('column')) {
      return {
        connected: true,
        tableReady: false,
        message: `La table '${tableName}' existe mais la colonne '${idCol}' est introuvable. Exécutez le script SQL pour créer la structure standard.`,
        sqlRequired: true,
        detailedCode: error.code,
      };
    }

    return {
      connected: true,
      tableReady: false,
      message: `Réponse Supabase : ${error.message} (Code: ${error.code || 'Inconnu'})`,
      sqlRequired: true,
      detailedCode: error.code,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableReady: false,
      message: err.message || 'Impossible de joindre le serveur Supabase. Vérifiez votre réseau.',
      sqlRequired: false,
    };
  }
}

// Sync with Supabase directly
export async function syncToSupabase(
  userId: string,
  data: AppSyncData
): Promise<{ success: boolean; error?: string }> {
  const config = loadSupabaseConfig();
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client non configuré' };
  }

  const tableName = config.tableName || DEFAULT_TABLE_NAME;
  const idCol = config.idColumn || DEFAULT_ID_COLUMN;
  const payloadCol = config.payloadColumn || DEFAULT_DATA_COLUMN;

  try {
    const record: Record<string, any> = {
      [idCol]: userId,
      [payloadCol]: data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from(tableName).upsert(record, {
      onConflict: idCol,
    });

    if (error) {
      return { success: false, error: `${error.message} (${error.code})` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Échec de la requête Supabase' };
  }
}

// Fetch from Supabase directly
export async function fetchFromSupabase(
  userId: string
): Promise<{ found: boolean; data?: AppSyncData; error?: string }> {
  const config = loadSupabaseConfig();
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { found: false, error: 'Supabase client non configuré' };
  }

  const tableName = config.tableName || DEFAULT_TABLE_NAME;
  const idCol = config.idColumn || DEFAULT_ID_COLUMN;
  const payloadCol = config.payloadColumn || DEFAULT_DATA_COLUMN;

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(`${payloadCol}, updated_at`)
      .eq(idCol, userId)
      .maybeSingle();

    if (error) {
      return { found: false, error: error.message };
    }
    if (data && (data as any)[payloadCol]) {
      return { found: true, data: (data as any)[payloadCol] };
    }
    return { found: false };
  } catch (err: any) {
    return { found: false, error: err.message || 'Échec de récupération Supabase' };
  }
}
