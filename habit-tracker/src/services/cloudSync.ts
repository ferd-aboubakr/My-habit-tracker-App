import {
  DailyLog,
  FinanceSummary,
  FinanceTransaction,
  OnlineProfileChecklist,
  SmokeFreeData,
  YouCodeBrief,
} from '../types/habits';

export interface AppSyncData {
  logs: Record<string, DailyLog>;
  smokeFreeData: SmokeFreeData;
  financeSummary: FinanceSummary;
  transactions: FinanceTransaction[];
  briefs: YouCodeBrief[];
  onlineProfiles: OnlineProfileChecklist;
  version: number;
  lastClientUpdate?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'initial';

const UUID_STORAGE_KEY = 'ascent_user_uuid_v1';
const LAST_SYNCED_TIMESTAMP_KEY = 'ascent_last_synced_time_v1';

// Generates a cryptographically strong client-side UUID
export function generateClientUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback random UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Retrieves existing random client UUID or creates and saves a new one
export function getOrCreateClientUuid(): string {
  try {
    const existing = localStorage.getItem(UUID_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_\-]{8,100}$/.test(existing)) {
      return existing;
    }
    const freshUuid = generateClientUuid();
    localStorage.setItem(UUID_STORAGE_KEY, freshUuid);
    return freshUuid;
  } catch {
    return generateClientUuid();
  }
}

// Switches to a new user UUID (e.g. when importing an existing key from another device)
export function saveClientUuid(uuid: string): void {
  try {
    localStorage.setItem(UUID_STORAGE_KEY, uuid.trim());
  } catch (e) {
    console.error('Failed to set UUID in storage', e);
  }
}

export function getLastSyncedTime(): string | null {
  try {
    return localStorage.getItem(LAST_SYNCED_TIMESTAMP_KEY);
  } catch {
    return null;
  }
}

export function setLastSyncedTime(isoString: string): void {
  try {
    localStorage.setItem(LAST_SYNCED_TIMESTAMP_KEY, isoString);
  } catch {}
}

// Fetch remote cloud data for the given user UUID
export async function fetchRemoteSyncData(
  userId: string
): Promise<{ found: boolean; data?: AppSyncData; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(`/api/sync/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return { found: false, error: `Cloud returned HTTP ${res.status}` };
    }

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.warn('Could not contact cloud backend (running in offline mode):', err);
    return { found: false, error: err.message || 'Network error' };
  }
}

// Push local data up to cloud backend for this user UUID
export async function pushRemoteSyncData(
  userId: string,
  data: AppSyncData
): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
  try {
    const res = await fetch(`/api/sync/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        clientUpdatedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return { success: false, error: `Cloud returned HTTP ${res.status}` };
    }

    const json = await res.json();
    if (json.updatedAt) {
      setLastSyncedTime(json.updatedAt);
    }
    return { success: true, updatedAt: json.updatedAt };
  } catch (err: any) {
    console.warn('Failed to push to cloud backend (data safe in local storage):', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
