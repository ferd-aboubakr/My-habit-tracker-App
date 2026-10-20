import React, { useState } from 'react';
import {
  Cloud,
  Check,
  Copy,
  RefreshCw,
  Key,
  Shield,
  Smartphone,
  AlertCircle,
  X,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { SyncStatus } from '../services/cloudSync';

import { Language } from '../i18n/translations';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUuid: string;
  syncStatus: SyncStatus;
  lastSynced: string | null;
  onForceSync: () => Promise<void>;
  onSwitchUserUuid: (newUuid: string) => Promise<boolean>;
  onGenerateNewUuid: () => Promise<void>;
  onNavigateToHosting?: () => void;
  language?: Language;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  userUuid,
  syncStatus,
  lastSynced,
  onForceSync,
  onSwitchUserUuid,
  onGenerateNewUuid,
  onNavigateToHosting,
  language = 'fr',
}) => {
  const isFr = language === 'fr';
  const [copied, setCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(userUuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSync = async () => {
    setIsProcessing(true);
    setSuccessMsg('');
    try {
      await onForceSync();
      setSuccessMsg('Successfully synced data with cloud backend!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCustomKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError('');
    setSuccessMsg('');

    const clean = inputKey.trim();
    if (!clean) {
      setKeyError('Please paste a valid user key / UUID.');
      return;
    }
    if (!/^[a-zA-Z0-9_\-]{8,100}$/.test(clean)) {
      setKeyError('Invalid key format. Must be an 8-100 character alphanumeric or UUID string.');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await onSwitchUserUuid(clean);
      if (success) {
        setSuccessMsg('Switched cloud key and loaded vault successfully!');
        setInputKey('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setKeyError('Could not load data for this key. Please check your connection or key.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFresh = async () => {
    if (
      window.confirm(
        'Generate a new random UUID key? Your current habits on this device will start syncing to the new cloud vault.'
      )
    ) {
      setIsProcessing(true);
      try {
        await onGenerateNewUuid();
        setSuccessMsg('Generated new random client UUID key!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cloud Backend & User Key Sync</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero login or email required. Authenticated via client-side UUID key.
            </p>
          </div>
        </div>

        {/* Status Strip */}
        <div className="mt-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-400 animate-pulse'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-200">
              {syncStatus === 'synced' && 'Cloud Sync: Active & Up to Date'}
              {syncStatus === 'syncing' && 'Cloud Sync: Synchronizing...'}
              {syncStatus === 'offline' && 'Cloud Sync: Offline Cached'}
              {syncStatus === 'error' && 'Cloud Sync: Connection Pending'}
              {syncStatus === 'initial' && 'Cloud Sync: Initializing'}
            </span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isProcessing}
            className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>

        {lastSynced && (
          <div className="text-[11px] font-mono text-slate-500 mt-1 px-1">
            Last successful remote sync: {new Date(lastSynced).toLocaleTimeString()} ({lastSynced.split('T')[0]})
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Your Unique Client UUID */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-sky-400" />
              <span>Your Random Client UUID (Cloud Key)</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">Anonymous Vault Key</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-sky-300 select-all overflow-x-auto no-scrollbar">
              {userUuid}
            </div>
            <button
              onClick={handleCopyKey}
              className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Key'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            This random UUID uniquely identifies your habit data on the cloud backend (stored at{' '}
            <code className="text-slate-300 font-mono text-[11px]">/api/sync/:userId</code>). Save or copy this key to access your habits on another phone or computer without creating an account or providing an email address.
          </p>
        </div>

        {/* Section 2: Switch / Load Key From Another Device */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-semibold text-white">
              Connect Another Device (Paste Existing Key)
            </h4>
          </div>

          <form onSubmit={handleApplyCustomKey} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste client UUID from your other device..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Load Vault
              </button>
            </div>
            {keyError && (
              <div className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{keyError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Section 3: Supabase & Cloudflare Deployment Guide Link */}
        {onNavigateToHosting && (
          <div className="mt-5 p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-white block">
                {isFr ? 'Vous souhaitez héberger sur Cloudflare & Supabase ?' : 'Want to host on Cloudflare & Supabase?'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {isFr ? 'Voir le guide étape par étape et configurer vos clés' : 'See step-by-step setup guide and configure keys'}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToHosting();
              }}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
            >
              {isFr ? 'Ouvrir le Guide' : 'Open Guide'}
            </button>
          </div>
        )}

        {/* Section 4: Key Generation & Privacy info */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={handleGenerateFresh}
            disabled={isProcessing}
            className="hover:text-slate-200 underline cursor-pointer text-xs"
          >
            {isFr ? 'Générer une Nouvelle Clé' : 'Generate New Key'}
          </button>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isFr ? 'Chiffré en transit & privé' : 'Encrypted in transit & private'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
