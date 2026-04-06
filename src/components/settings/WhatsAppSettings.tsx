'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircleMore,
  Send,
  Smartphone,
  Sparkles,
  Unlink,
  Wand2,
  Webhook,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '@/components/ui/Avatar';
import { useAppStore, useAuthStore } from '@/store';

type WhatsAppLinkUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
};

type WhatsAppLinkRecord = {
  _id: string;
  workspace: string;
  user: string | WhatsAppLinkUser;
  phone: string;
  waUserId?: string;
  label?: string;
  status: 'pending_verification' | 'verified' | 'disabled' | 'failed';
  isActive: boolean;
  verificationCode?: string;
  verificationExpiresAt?: string;
  initializationMessageSentAt?: string;
  initializationLastError?: string;
  verifiedAt?: string;
  lastInboundAt?: string;
  updatedAt: string;
  createdAt: string;
};

type WhatsAppConfigState = {
  metaConfigured: boolean;
  initTemplateConfigured?: boolean;
  defaultWorkspaceId: string | null;
  defaultUserId: string | null;
  webhookPath: string;
};

type QuickReply = {
  id: string;
  title: string;
};

type SimulationResult = {
  reply?: string;
  quickReplies?: QuickReply[];
  createdEntity?: {
    kind: 'task' | 'objective' | 'idea';
    id: string;
    title: string;
  };
  pending?: {
    kind: 'task' | 'objective' | 'idea';
    missingFields: string[];
  };
  conversationId?: string;
  link?: {
    id: string;
    status: 'pending_verification' | 'verified' | 'disabled' | 'failed';
    verificationCode?: string;
    verificationExpiresAt?: string;
  };
};

function isPopulatedUser(user: string | WhatsAppLinkUser): user is WhatsAppLinkUser {
  return typeof user === 'object' && user !== null && '_id' in user;
}

function getUserDisplayName(user: string | WhatsAppLinkUser) {
  if (!isPopulatedUser(user)) {
    return 'Utilisateur Edwin';
  }

  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

function formatDateTime(value?: string) {
  if (!value) return 'Jamais';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Jamais';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function buildQuickRepliesPayload(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, 3)
    .map((value) => ({
      id: value,
      title: value,
    }));
}

export default function WhatsAppSettings() {
  const { token, user } = useAuthStore();
  const { currentWorkspace } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [savingLink, setSavingLink] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [testingInbound, setTestingInbound] = useState(false);
  const [sendingOutbound, setSendingOutbound] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const [config, setConfig] = useState<WhatsAppConfigState>({
    metaConfigured: false,
    defaultWorkspaceId: null,
    defaultUserId: null,
    webhookPath: '/api/ai/whatsapp/webhook',
  });
  const [currentLink, setCurrentLink] = useState<WhatsAppLinkRecord | null>(null);
  const [workspaceLinks, setWorkspaceLinks] = useState<WhatsAppLinkRecord[]>([]);
  const [canManageWorkspaceLinks, setCanManageWorkspaceLinks] = useState(false);

  const [linkForm, setLinkForm] = useState({
    phone: '',
    waUserId: '',
    label: '',
  });
  const [simulationText, setSimulationText] = useState(
    'Crée une tâche pour relancer le client vendredi et assigne-la à Sarah'
  );
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [lastSimulationInput, setLastSimulationInput] = useState('');
  const [outboundMessage, setOutboundMessage] = useState(
    'Edwin est connecté. Réponds directement ici pour créer une tâche, un objectif ou envoyer une note vocale.'
  );
  const [outboundQuickReplies, setOutboundQuickReplies] = useState(['', '', '']);
  const [verificationHintCode, setVerificationHintCode] = useState('');

  const loadSettings = async () => {
    if (!token || !currentWorkspace?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/ai/whatsapp/links?workspaceId=${encodeURIComponent(currentWorkspace._id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Impossible de charger la configuration WhatsApp');
      }

      const nextLink = (data.data.currentLink as WhatsAppLinkRecord | null) || null;
      setCurrentLink(nextLink);
      setWorkspaceLinks(Array.isArray(data.data.workspaceLinks) ? data.data.workspaceLinks : []);
      setCanManageWorkspaceLinks(Boolean(data.data.canManageWorkspaceLinks));
      setConfig(data.data.config as WhatsAppConfigState);
      setLinkForm({
        phone: nextLink?.phone || '',
        waUserId: nextLink?.waUserId || '',
        label: nextLink?.label || '',
      });
      setVerificationHintCode('');
    } catch (error) {
      console.error('Load WhatsApp settings error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de chargement WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentWorkspace?._id]);

  const handleSaveLink = async () => {
    if (!token || !currentWorkspace?._id) return;
    if (!linkForm.phone.trim()) {
      toast.error('Le numéro WhatsApp est requis');
      return;
    }

    try {
      setSavingLink(true);
      const response = await fetch('/api/ai/whatsapp/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace._id,
          phone: linkForm.phone,
          waUserId: linkForm.waUserId || undefined,
          label: linkForm.label || undefined,
        }),
      });

      const data = await response.json();
      if (!data.success && !data.data?.link) {
        throw new Error(data.error || 'Impossible d’enregistrer le numéro WhatsApp');
      }

      const nextLink = data.data?.link as WhatsAppLinkRecord | undefined;
      setVerificationHintCode(nextLink?.status === 'pending_verification' ? nextLink.verificationCode || '' : '');
      toast.success(data.message || 'Connexion WhatsApp enregistrée');
      await loadSettings();
    } catch (error) {
      console.error('Save WhatsApp link error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l’enregistrement');
    } finally {
      setSavingLink(false);
    }
  };

  const handleResendVerification = async () => {
    if (!token || !currentWorkspace?._id) return;

    try {
      setResendingVerification(true);
      const response = await fetch('/api/ai/whatsapp/links', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace._id,
          action: 'resend_verification',
        }),
      });

      const data = await response.json();
      if (!data.success && !data.data?.link) {
        throw new Error(data.error || 'Impossible de renvoyer la vérification');
      }

      const nextLink = data.data?.link as WhatsAppLinkRecord | undefined;
      setVerificationHintCode(nextLink?.verificationCode || '');
      toast.success(data.message || 'Message de vérification renvoyé');
      await loadSettings();
    } catch (error) {
      console.error('Resend WhatsApp verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de renvoi');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleDisconnect = async () => {
    if (!token || !currentWorkspace?._id || !currentLink) return;

    try {
      setDisconnecting(true);
      const response = await fetch(
        `/api/ai/whatsapp/links?workspaceId=${encodeURIComponent(currentWorkspace._id)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Impossible de déconnecter le numéro');
      }

      toast.success('Numéro WhatsApp déconnecté');
      setSimulationResult(null);
      setCurrentLink(null);
      await loadSettings();
    } catch (error) {
      console.error('Disconnect WhatsApp link error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la déconnexion');
    } finally {
      setDisconnecting(false);
    }
  };

  const runSimulation = async (textOverride?: string) => {
    if (!token || !currentWorkspace?._id) return;

    const message = (textOverride || simulationText).trim();
    const phone = (currentLink?.phone || linkForm.phone).trim();
    const waUserId = (currentLink?.waUserId || linkForm.waUserId).trim();

    if (!message) {
      toast.error('Ajoute un message à simuler');
      return;
    }

    if (!phone) {
      toast.error('Lie ou renseigne d’abord un numéro WhatsApp');
      return;
    }

    try {
      setTestingInbound(true);
      setLastSimulationInput(message);

      const response = await fetch('/api/ai/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace._id,
          phone,
          waUserId: waUserId || undefined,
          text: message,
          source: 'test',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Impossible de simuler le message WhatsApp');
      }

      setSimulationResult(data.data as SimulationResult);
      setVerificationHintCode(data.data?.link?.verificationCode || '');
      toast.success('Simulation WhatsApp exécutée');
      await loadSettings();
    } catch (error) {
      console.error('WhatsApp simulation error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de simulation WhatsApp');
    } finally {
      setTestingInbound(false);
    }
  };

  const handleSendOutbound = async () => {
    if (!token || !currentWorkspace?._id) return;

    const message = outboundMessage.trim();
    if (!message) {
      toast.error('Le message sortant est requis');
      return;
    }

    try {
      setSendingOutbound(true);
      const response = await fetch('/api/ai/whatsapp/outbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace._id,
          message,
          quickReplies: buildQuickRepliesPayload(outboundQuickReplies),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Impossible d’envoyer le message WhatsApp');
      }

      toast.success(data.message || 'Message WhatsApp envoyé');
    } catch (error) {
      console.error('WhatsApp outbound error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l’envoi WhatsApp');
    } finally {
      setSendingOutbound(false);
    }
  };

  const useSuggestedButtons = () => {
    const nextValues = (simulationResult?.quickReplies || []).map((item) => item.title);
    setOutboundQuickReplies([nextValues[0] || '', nextValues[1] || '', nextValues[2] || '']);
  };

  if (!currentWorkspace) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-dim">
        Sélectionne un workspace pour connecter WhatsApp à Edwin.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-main">WhatsApp & assistant Edwin</h2>
                <p className="text-sm text-dim">
                  Lie ton numéro au workspace, teste les messages entrants, puis envoie de vrais
                  boutons interactifs sans passer par le terminal.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                  config.metaConfigured
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-amber-500/10 text-amber-300'
                }`}
              >
                {config.metaConfigured ? 'Meta configuré' : 'Meta non configuré'}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                  currentLink?.status === 'verified'
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : currentLink?.status === 'pending_verification'
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-white/10 text-dim'
                }`}
              >
                {currentLink?.status === 'verified'
                  ? 'Numéro vérifié'
                  : currentLink?.status === 'pending_verification'
                    ? 'Vérification en attente'
                    : currentLink
                      ? 'Numéro relié'
                      : 'Aucun numéro relié'}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-dim">
                {currentWorkspace.name}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-dim">
            <div className="flex items-center gap-2 text-main">
              <Webhook className="h-4 w-4 text-indigo-400" />
              Webhook
            </div>
            <p className="mt-2 font-mono text-xs text-dim">{config.webhookPath}</p>
            <p className="mt-2 text-xs text-dim">
              Ce workspace utilisera le mapping numéro → utilisateur courant pour créer de vraies
              données Edwin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400">
              <MessageCircleMore className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-main">Connexion du numéro</h3>
              <p className="text-sm text-dim">
                Ce numéro sera lié à ton utilisateur Edwin dans ce workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Numéro WhatsApp
              </label>
              <input
                type="text"
                value={linkForm.phone}
                onChange={(event) =>
                  setLinkForm((previous) => ({ ...previous, phone: event.target.value }))
                }
                placeholder="+229 00 00 00 00"
                className="w-full rounded-2xl border border-glass-border bg-bg-secondary px-4 py-3 text-main outline-none transition-all focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                WhatsApp User ID
              </label>
              <input
                type="text"
                value={linkForm.waUserId}
                onChange={(event) =>
                  setLinkForm((previous) => ({ ...previous, waUserId: event.target.value }))
                }
                placeholder="Optionnel, laisse vide pour utiliser le numéro"
                className="w-full rounded-2xl border border-glass-border bg-bg-secondary px-4 py-3 text-main outline-none transition-all focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Label interne
              </label>
              <input
                type="text"
                value={linkForm.label}
                onChange={(event) =>
                  setLinkForm((previous) => ({ ...previous, label: event.target.value }))
                }
                placeholder="Téléphone personnel, téléphone commercial..."
                className="w-full rounded-2xl border border-glass-border bg-bg-secondary px-4 py-3 text-main outline-none transition-all focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleSaveLink}
                disabled={savingLink}
                className="btn-primary flex min-w-[180px] items-center justify-center gap-2"
              >
                {savingLink ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Enregistrer la connexion
              </button>
              <button
                onClick={handleResendVerification}
                disabled={!currentLink || currentLink.status === 'verified' || resendingVerification}
                className="flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendingVerification ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Renvoyer l&apos;initialisation
              </button>
              <button
                onClick={handleDisconnect}
                disabled={!currentLink || disconnecting}
                className="flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                Déconnecter le numéro
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-main">Statut de test</h3>
              <p className="text-sm text-dim">
                Vérifie rapidement si tout est prêt côté Edwin et côté Meta.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-main">
                {currentLink ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
                Lien utilisateur/workspace
              </div>
              <p className="mt-2 text-sm text-dim">
                {currentLink
                  ? currentLink.status === 'verified'
                    ? `Actif pour ${linkForm.phone || currentLink.phone}`
                    : `Numéro enregistré pour ${linkForm.phone || currentLink.phone}, en attente de confirmation`
                  : 'Aucun numéro lié à ton utilisateur dans ce workspace'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-main">
                {config.metaConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
                Cloud API Meta
              </div>
              <p className="mt-2 text-sm text-dim">
                {config.metaConfigured
                  ? 'Le webhook peut recevoir et envoyer de vrais messages WhatsApp.'
                  : 'Le mode simulation local fonctionne déjà. Pour le vrai WhatsApp, configure les variables Meta.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-main">
                {config.initTemplateConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
                Initialisation proactive
              </div>
              <p className="mt-2 text-sm text-dim">
                {config.initTemplateConfigured
                  ? 'Le template d’initialisation est configuré pour contacter un nouveau numéro.'
                  : 'Ajoute WHATSAPP_INIT_TEMPLATE_NAME pour contacter automatiquement un numéro hors fenêtre 24h.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-dim">
              <p className="font-semibold text-main">Dernière activité et vérification</p>
              <p className="mt-2">Dernière activité: {formatDateTime(currentLink?.lastInboundAt)}</p>
              <p className="mt-1">Dernière init: {formatDateTime(currentLink?.initializationMessageSentAt)}</p>
              <p className="mt-1">Confirmé le: {formatDateTime(currentLink?.verifiedAt)}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-400">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-main">Simulation locale sans Meta</h3>
            <p className="text-sm text-dim">
              Envoie un faux message WhatsApp, regarde la réponse de l’IA, puis clique sur les
              boutons de clarification proposés.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <textarea
              value={simulationText}
              onChange={(event) => setSimulationText(event.target.value)}
              rows={6}
              className="w-full rounded-[24px] border border-glass-border bg-bg-secondary px-4 py-4 text-main outline-none transition-all focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Crée un objectif pour lancer la bêta privée et assigne-le à Sarah pour le 30 mars 2026"
            />

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => runSimulation()}
                disabled={testingInbound}
                className="btn-primary flex min-w-[180px] items-center justify-center gap-2"
              >
                {testingInbound ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Simuler un message entrant
              </button>
              <button
                onClick={() =>
                  setSimulationText(
                    'Ajoute une idée: lancer un mini audit onboarding pour les nouveaux clients'
                  )
                }
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-main transition-colors hover:bg-glass-hover"
              >
                Charger un exemple idée
              </button>
              {verificationHintCode && (
                <button
                  onClick={() => setSimulationText(verificationHintCode)}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/15"
                >
                  Simuler la confirmation du code
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Résultat assistant
            </p>

            {simulationResult ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                    Message simulé
                  </p>
                  <p className="mt-2 text-sm text-main">{lastSimulationInput}</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Réponse Edwin
                  </p>
                  <p className="mt-2 text-sm text-main">
                    {simulationResult.reply || 'Aucune réponse texte retournée'}
                  </p>
                </div>

                {simulationResult.createdEntity && (
                  <div className="rounded-2xl border border-sky-500/15 bg-sky-500/5 p-4 text-sm text-main">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                      Création réelle
                    </p>
                    <p className="mt-2">
                      {simulationResult.createdEntity.kind} créé: {simulationResult.createdEntity.title}
                    </p>
                  </div>
                )}

                {simulationResult.pending && (
                  <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 text-sm text-main">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                      Clarification attendue
                    </p>
                    <p className="mt-2">
                      Champ(s) manquant(s): {simulationResult.pending.missingFields.join(', ')}
                    </p>
                  </div>
                )}

                {simulationResult.quickReplies && simulationResult.quickReplies.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        Boutons proposés
                      </p>
                      <button
                        onClick={useSuggestedButtons}
                        className="text-xs font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
                      >
                        Réutiliser pour l’envoi réel
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {simulationResult.quickReplies.map((reply) => (
                        <button
                          key={`${reply.id}-${reply.title}`}
                          onClick={() => runSimulation(reply.title)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-main transition-colors hover:bg-glass-hover"
                        >
                          {reply.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {simulationResult.conversationId && (
                  <p className="text-xs text-dim">Conversation IA: {simulationResult.conversationId}</p>
                )}

                {simulationResult.link?.verificationCode && (
                  <p className="text-xs text-amber-300">
                    Code de test local: {simulationResult.link.verificationCode}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-dim">
                Lance une simulation pour voir la réponse, les champs manquants et les boutons de
                clarification.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-fuchsia-500/10 p-3 text-fuchsia-400">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-main">Envoi réel vers WhatsApp</h3>
            <p className="text-sm text-dim">
              Envoie un message WhatsApp au numéro lié et, si besoin, ajoute jusqu’à 3 boutons
              interactifs.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <textarea
              value={outboundMessage}
              onChange={(event) => setOutboundMessage(event.target.value)}
              rows={5}
              className="w-full rounded-[24px] border border-glass-border bg-bg-secondary px-4 py-4 text-main outline-none transition-all focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Confirme ici le message à envoyer sur WhatsApp"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {outboundQuickReplies.map((value, index) => (
                <input
                  key={`quick-reply-${index}`}
                  type="text"
                  value={value}
                  onChange={(event) =>
                    setOutboundQuickReplies((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      )
                    )
                  }
                  placeholder={`Bouton ${index + 1}`}
                  className="w-full rounded-2xl border border-glass-border bg-bg-secondary px-4 py-3 text-main outline-none transition-all focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSendOutbound}
                disabled={sendingOutbound || !config.metaConfigured || !currentLink}
                className="btn-primary flex min-w-[180px] items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingOutbound ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Envoyer sur WhatsApp
              </button>
              <button
                onClick={() => setOutboundQuickReplies(['Oui', 'Non', 'Plus tard'])}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-main transition-colors hover:bg-glass-hover"
              >
                Charger des boutons simples
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-white/10 bg-black/10 p-5 text-sm text-dim">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Checklist de validation
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-main">1. Liaison utilisateur/workspace</p>
                <p className="mt-2">
                  Lie ton numéro ci-dessus. Edwin crée alors une liaison en attente, envoie un
                  message d&apos;initialisation, puis active réellement le numéro après confirmation.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-main">2. Test complet local</p>
                <p className="mt-2">
                  Simule d&apos;abord la confirmation du code, puis une tâche, un objectif et une
                  clarification. Vérifie que l&apos;entité apparaît bien dans Edwin après la réponse finale.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold text-main">3. Test Meta réel</p>
                <p className="mt-2">
                  Renseigne les variables Meta, branche le webhook public, puis envoie un vrai
                  message depuis ton téléphone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-main">Mappings du workspace</h3>
            <p className="text-sm text-dim">
              Vue de contrôle pour vérifier quel numéro est relié à quel utilisateur Edwin.
            </p>
          </div>
        </div>

        <div className="mt-6">
          {workspaceLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-dim">
              Aucun mapping actif pour ce workspace.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {workspaceLinks.map((link) => {
                const linkedUser = isPopulatedUser(link.user) ? link.user : null;
                const isCurrentUser = linkedUser?._id === user?._id;

                return (
                  <div
                    key={link._id}
                    className="rounded-3xl border border-white/10 bg-black/10 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={linkedUser?.avatar}
                          fallback={(linkedUser?.firstName || 'E').slice(0, 1)}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-main">
                            {getUserDisplayName(link.user)}
                            {isCurrentUser ? ' · Vous' : ''}
                          </p>
                          <p className="text-sm text-dim">{linkedUser?.email || 'Utilisateur Edwin'}</p>
                        </div>
                      </div>
                      {isCurrentUser && (
                        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                          {link.status === 'verified' ? 'Vérifié' : 'En attente'}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-dim">
                      <p>
                        <span className="text-main">Numéro:</span> {link.phone}
                      </p>
                      <p>
                        <span className="text-main">WA ID:</span> {link.waUserId || 'Auto'}
                      </p>
                      <p>
                        <span className="text-main">Label:</span> {link.label || 'Aucun'}
                      </p>
                      <p>
                        <span className="text-main">Statut:</span> {link.status}
                      </p>
                      <p>
                        <span className="text-main">Dernière activité:</span>{' '}
                        {formatDateTime(link.lastInboundAt || link.updatedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!canManageWorkspaceLinks && workspaceLinks.length > 0 && (
            <p className="mt-4 text-xs text-dim">
              Cette vue est limitée à ton propre mapping. Les admins du workspace voient la liste
              complète.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
