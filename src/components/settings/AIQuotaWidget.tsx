'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Zap, MessageSquare, Search, Target, Smartphone, Plus, RefreshCw, ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import toast from 'react-hot-toast';
import { PLAN_LIMITS } from '@/lib/limits';

interface UsageData {
  tokensUsed: number;
  tokensLimit: number;
  bonusTokens: number;
  totalLimit: number;
  tokensRemaining: number;
  plan: string;
  month: string;
  allowed: boolean;
  breakdown: {
    assistant: number;
    search: number;
    objectives: number;
    whatsapp: number;
  };
}

interface TokenPack {
  id: string;
  label: string;
  tokens: number;
  amount: number;
  description: string;
}

const TOKEN_PACKS: TokenPack[] = [
  { id: 'starter_pack',  label: 'Pack Starter',  tokens: 200_000,   amount: 2.99,  description: '~40–60 échanges' },
  { id: 'standard_pack', label: 'Pack Standard', tokens: 1_000_000, amount: 9.99,  description: '~200–300 échanges' },
  { id: 'pro_pack',      label: 'Pack Pro',      tokens: 5_000_000, amount: 34.99, description: '~1 000–1 500 échanges' },
];

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function formatMonth(m: string): string {
  const [y, mo] = m.split('-');
  const date = new Date(Number(y), Number(mo) - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  team: 'Team',
  business: 'Business',
  enterprise: 'Enterprise',
};

const FEATURE_ICONS = {
  assistant:  { icon: MessageSquare, label: 'Assistant IA',      color: '#6366f1' },
  search:     { icon: Search,        label: 'Recherche IA',      color: '#8b5cf6' },
  objectives: { icon: Target,        label: 'Génération objectifs', color: '#06b6d4' },
  whatsapp:   { icon: Smartphone,    label: 'WhatsApp IA',       color: '#22c55e' },
};

export default function AIQuotaWidget() {
  const { token } = useAuthStore();
  const { currentWorkspace } = useAppStore();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!currentWorkspace?._id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/usage?workspaceId=${currentWorkspace._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsage(data.data);
    } catch {
      toast.error('Impossible de charger l\'usage IA');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?._id, token]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  // Lire le succès d'achat depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token_success') === 'true') {
      const pack = params.get('pack');
      const found = TOKEN_PACKS.find(p => p.id === pack);
      toast.success(`Pack ${found?.label ?? ''} crédité ! Vos tokens sont disponibles.`);
      fetchUsage();
      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.searchParams.delete('token_success');
      url.searchParams.delete('pack');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    }
    if (params.get('token_canceled') === 'true') {
      toast.error('Achat annulé.');
      const url = new URL(window.location.href);
      url.searchParams.delete('token_canceled');
      window.history.replaceState({}, '', url.toString());
    }
  }, [fetchUsage]);

  const handleBuyPack = async (packId: string) => {
    if (!currentWorkspace?._id || !token) return;
    setPurchasing(packId);
    try {
      const res = await fetch('/api/stripe/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: currentWorkspace._id, packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de la création du paiement');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-tertiary)' }} />
        ))}
      </div>
    );
  }

  if (!usage) return null;

  const isUnlimited = usage.tokensLimit === -1;
  const planLabel = PLAN_LABELS[usage.plan] ?? usage.plan;
  const planLimits = PLAN_LIMITS[usage.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.starter;
  const whatsappEnabled = planLimits.aiWhatsapp;

  // Pourcentage de consommation (sur le total incluant bonus)
  const pct = isUnlimited ? 0 : Math.min(100, (usage.tokensUsed / usage.totalLimit) * 100);
  const isCritical = pct >= 90;
  const isWarning = pct >= 70 && pct < 90;

  const barColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#6366f1';

  return (
    <div className="space-y-6">

      {/* Header plan */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>Quota IA — Plan {planLabel}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatMonth(usage.month)}</p>
          </div>
        </div>
        <button
          onClick={fetchUsage}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-dim)' }}
          title="Actualiser"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Barre principale */}
      {isUnlimited ? (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <CheckCircle size={18} style={{ color: '#6366f1' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Tokens illimités — Plan Enterprise</span>
        </div>
      ) : (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-dim)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{formatTokens(usage.tokensUsed)}</span>
              {' '}/ {formatTokens(usage.totalLimit)} tokens
            </span>
            <span className="font-medium" style={{ color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--text-muted)' }}>
              {formatTokens(usage.tokensRemaining)} restants
            </span>
          </div>

          {/* Barre de progression */}
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>

          {/* Détail : plan + bonus */}
          {usage.bonusTokens > 0 && (
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Plan : {formatTokens(usage.tokensLimit)}</span>
              <span className="flex items-center gap-1">
                <Zap size={11} style={{ color: '#f59e0b' }} />
                Bonus : {formatTokens(usage.bonusTokens)}
              </span>
            </div>
          )}

          {isCritical && (
            <p className="text-xs font-medium" style={{ color: '#ef4444' }}>
              ⚠ Quota presque épuisé — achetez des tokens ou passez au plan supérieur.
            </p>
          )}

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Renouvellement le 1er du mois prochain.
          </p>
        </div>
      )}

      {/* Breakdown par feature */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-dim)' }}>Consommation par fonctionnalité</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(FEATURE_ICONS) as [keyof typeof FEATURE_ICONS, typeof FEATURE_ICONS[keyof typeof FEATURE_ICONS]][]).map(([key, { icon: Icon, label, color }]) => {
            const used = usage.breakdown[key] ?? 0;
            const isWADisabled = key === 'whatsapp' && !whatsappEnabled;
            return (
              <div
                key={key}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'var(--bg-tertiary)', opacity: isWADisabled ? 0.5 : 1 }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                    {isWADisabled ? <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>Non inclus</span> : formatTokens(used)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section achat de tokens (tous plans sauf enterprise) */}
      {!isUnlimited && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} style={{ color: '#f59e0b' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Acheter des tokens</p>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Les tokens achetés s'ajoutent à votre quota mensuel et ne s'expirent pas en fin de mois.
          </p>
          <div className="space-y-2">
            {TOKEN_PACKS.map(pack => (
              <div
                key={pack.id}
                className="rounded-xl p-4 flex items-center justify-between gap-4"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                    {pack.label}
                    <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                      {formatTokens(pack.tokens)} tokens
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pack.description}</p>
                </div>
                <button
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={!!purchasing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 flex-shrink-0"
                  style={{ background: 'var(--accent-primary)', color: '#fff' }}
                >
                  {purchasing === pack.id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {pack.amount.toFixed(2)} €
                </button>
              </div>
            ))}
          </div>

          {/* Lien upgrade plan */}
          <a
            href="/upgrade"
            className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Sparkles size={15} />
            Passer à un plan supérieur pour plus de tokens
            <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}
