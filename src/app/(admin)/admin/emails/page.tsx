'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Settings,
  LayoutTemplate,
  Send,
  Plus,
  AlertCircle,
  RefreshCw,
  X,
  Save,
  Trash2,
  BarChart3,
  Users,
  Play,
  Eye,
  Clock3,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';

type Template = {
  _id?: string;
  name: string;
  subject: string;
  body: string;
  type: 'automation' | 'campaign' | 'system';
  automationKey?: string;
  variables: string[];
  updatedAt?: string;
};

type CampaignAudienceType = 'all_users' | 'admins' | 'notifications_enabled' | 'recent_users' | 'custom_emails';

type Campaign = {
  _id?: string;
  name: string;
  description?: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  audience: {
    type: CampaignAudienceType;
    customEmails?: string[];
    daysSinceSignup?: number;
    lastResolvedCount?: number;
  };
  stats?: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  };
  sentAt?: string;
  updatedAt?: string;
};

type CampaignForm = {
  _id?: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  audience: {
    type: CampaignAudienceType;
    daysSinceSignup: number;
    customEmailsText: string;
  };
};

type EmailLog = {
  _id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  category: 'automation' | 'campaign' | 'system' | 'test';
  templateName?: string;
  campaignName?: string;
  errorMessage?: string;
  createdAt: string;
};

type AnalyticsResponse = {
  overview: {
    periodDays: number;
    totalAttempts: number;
    sent: number;
    failed: number;
    skipped: number;
    successRate: number;
    campaignsCreated: number;
    campaignsSent: number;
    campaignsFailed: number;
  };
  categories: Record<string, number>;
  daily: Array<{ date: string; sent: number; failed: number; skipped: number }>;
  topTemplates: Array<{ name: string; count: number }>;
  topCampaigns: Array<{ name: string; count: number }>;
  recentFailures: Array<{
    _id: string;
    to: string;
    subject: string;
    errorMessage?: string;
    createdAt: string;
    templateName?: string;
    campaignName?: string;
  }>;
};

const emptyCampaignForm = (): CampaignForm => ({
  name: '',
  description: '',
  subject: '',
  body: '<p>Bonjour {{firstName}},</p><p>Votre message ici...</p>',
  audience: {
    type: 'all_users',
    daysSinceSignup: 30,
    customEmailsText: '',
  },
});

const audienceOptions: Array<{ value: CampaignAudienceType; label: string; desc: string }> = [
  { value: 'all_users', label: 'Tous les utilisateurs', desc: 'Tous les comptes enregistrés' },
  { value: 'admins', label: 'Admins uniquement', desc: 'Comptes avec rôle admin' },
  { value: 'notifications_enabled', label: 'Notifications activées', desc: 'Utilisateurs ayant activé les notifications' },
  { value: 'recent_users', label: 'Utilisateurs récents', desc: 'Inscrits sur une période donnée' },
  { value: 'custom_emails', label: 'Liste custom', desc: 'Emails saisis manuellement (CSV / ligne)' },
];

function formatDate(date?: string) {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString('fr-FR');
  } catch {
    return date;
  }
}

function statusBadgeClass(status: string) {
  if (status === 'sent') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (status === 'failed') return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (status === 'sending') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-text-dim bg-glass-bg border-glass-border';
}

export default function EmailsAdminPage() {
  const { token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'settings'>('campaigns');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshingCampaigns, setIsRefreshingCampaigns] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  const [logQuery, setLogQuery] = useState('');
  const [previewAudience, setPreviewAudience] = useState<{ count: number; sample: Array<{ email: string }> } | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignForm | null>(null);

  const [emailConfig, setEmailConfig] = useState({
    smtp: {
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      user: '',
      pass: '',
      from: 'Edwin <contact@edwin.com>',
    },
    automations: {
      onRegister: true,
      onPayment: true,
      onWorkspaceAction: true,
      onInvitation: true,
      onWorkspaceWelcome: true,
    },
  });

  const authHeaders = React.useCallback(
    (json = false) => ({
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const fetchSettings = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/emails/settings', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data?.smtp) {
        setEmailConfig((prev) => ({
          smtp: { ...prev.smtp, ...(data.smtp || {}) },
          automations: { ...prev.automations, ...(data.automations || {}) },
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [authHeaders, token]);

  const fetchTemplates = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/emails/templates', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [authHeaders, token]);

  const fetchCampaigns = React.useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/admin/emails/campaigns', { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setCampaigns(data.items || []);
  }, [authHeaders, token]);

  const fetchLogs = React.useCallback(async (searchQuery = '') => {
    if (!token) return;
    const params = new URLSearchParams({ limit: '25' });
    if (searchQuery.trim()) params.set('q', searchQuery.trim());

    const res = await fetch(`/api/admin/emails/logs?${params.toString()}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setLogs(data.items || []);
  }, [authHeaders, token]);

  const fetchAnalytics = React.useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/admin/emails/analytics', { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setAnalytics(data);
  }, [authHeaders, token]);

  const refreshCampaignWorkspace = React.useCallback(async (searchQuery = '') => {
    if (!token) return;
    setIsRefreshingCampaigns(true);
    try {
      await Promise.all([fetchCampaigns(), fetchLogs(searchQuery), fetchAnalytics()]);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du rafraîchissement des campagnes');
    } finally {
      setIsRefreshingCampaigns(false);
    }
  }, [fetchAnalytics, fetchCampaigns, fetchLogs, token]);

  useEffect(() => {
    if (!token) return;
    void fetchSettings();
    void fetchTemplates();
    void refreshCampaignWorkspace();
  }, [fetchSettings, fetchTemplates, refreshCampaignWorkspace, token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/emails/settings', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(emailConfig),
      });
      if (res.ok) toast.success('Paramètres SMTP enregistrés');
      else toast.error('Erreur lors de l\'enregistrement');
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!token) return;
    const destination = prompt("Entrez l'e-mail de destination pour le test :", emailConfig.smtp.user);
    if (!destination) return;

    setIsTesting(true);
    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ to: destination }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`E-mail de test envoyé à ${destination}`);
        void refreshCampaignWorkspace(logQuery);
      } else {
        toast.error(`Échec : ${data.error?.message || data.error || 'Vérifiez la configuration SMTP'}`);
      }
    } catch {
      toast.error('Erreur lors du test');
    } finally {
      setIsTesting(false);
    }
  };

  const openTemplateModal = (tpl: Template | null = null) => {
    setEditingTemplate(
      tpl || {
        name: '',
        subject: '',
        body: '',
        type: 'automation',
        variables: [],
      }
    );
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !token) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/emails/templates', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(editingTemplate),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la sauvegarde du template');
        return;
      }

      toast.success('Template enregistré');
      setIsTemplateModalOpen(false);
      await fetchTemplates();
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!token) return;
    if (!confirm('Supprimer ce template ?')) return;

    try {
      const res = await fetch(`/api/admin/emails/templates?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        toast.error('Impossible de supprimer ce template');
        return;
      }
      toast.success('Template supprimé');
      await fetchTemplates();
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const openCampaignModal = (campaign?: Campaign) => {
    if (!campaign) {
      setEditingCampaign(emptyCampaignForm());
      setPreviewAudience(null);
      setIsCampaignModalOpen(true);
      return;
    }

    setEditingCampaign({
      _id: campaign._id,
      name: campaign.name,
      description: campaign.description || '',
      subject: campaign.subject,
      body: campaign.body,
      audience: {
        type: campaign.audience?.type || 'all_users',
        daysSinceSignup: campaign.audience?.daysSinceSignup || 30,
        customEmailsText: (campaign.audience?.customEmails || []).join('\n'),
      },
    });
    setPreviewAudience(
      typeof campaign.audience?.lastResolvedCount === 'number'
        ? { count: campaign.audience.lastResolvedCount, sample: [] }
        : null
    );
    setIsCampaignModalOpen(true);
  };

  const buildCampaignPayload = (form: CampaignForm) => ({
    _id: form._id,
    name: form.name,
    description: form.description,
    subject: form.subject,
    body: form.body,
    audience: {
      type: form.audience.type,
      daysSinceSignup: form.audience.daysSinceSignup,
      customEmails: form.audience.customEmailsText
        .split(/[\n,;]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    },
  });

  const handlePreviewAudience = async () => {
    if (!editingCampaign || !token) return;

    setPreviewLoading(true);
    try {
      const payload = buildCampaignPayload(editingCampaign);
      const res = await fetch('/api/admin/emails/campaigns', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ action: 'previewAudience', audience: payload.audience }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Impossible de prévisualiser l\'audience');
        return;
      }
      setPreviewAudience({ count: data.count || 0, sample: data.sample || [] });
      toast.success(`Audience résolue: ${data.count || 0} destinataires`);
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign || !token) return;

    setIsLoading(true);
    try {
      const payload = buildCampaignPayload(editingCampaign);
      const res = await fetch('/api/admin/emails/campaigns', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ action: 'save', campaign: payload }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la sauvegarde de la campagne');
        return;
      }

      setPreviewAudience((prev) => ({
        count: data.audiencePreviewCount ?? prev?.count ?? 0,
        sample: prev?.sample || [],
      }));
      toast.success('Campagne enregistrée en brouillon');
      setIsCampaignModalOpen(false);
      await refreshCampaignWorkspace(logQuery);
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    if (!token) return;
    if (!confirm('Envoyer cette campagne maintenant ?')) return;

    setSendingCampaignId(campaignId);
    try {
      const res = await fetch('/api/admin/emails/campaigns', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ action: 'send', campaignId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Échec de l\'envoi de la campagne');
        return;
      }

      toast.success(`Campagne envoyée (${data.stats?.sent || 0} envoyés)`);
      await refreshCampaignWorkspace(logQuery);
    } catch {
      toast.error('Erreur réseau lors de l\'envoi');
    } finally {
      setSendingCampaignId(null);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!token) return;
    if (!confirm('Supprimer cette campagne ?')) return;

    try {
      const res = await fetch(`/api/admin/emails/campaigns?id=${campaignId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        toast.error('Impossible de supprimer la campagne');
        return;
      }
      toast.success('Campagne supprimée');
      await refreshCampaignWorkspace(logQuery);
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const tabs = [
    { id: 'campaigns', label: 'Campagnes', icon: Send },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'settings', label: 'Paramètres SMTP', icon: Settings },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Mail className="w-8 h-8 text-indigo-500" />
          Mailing & Automatisations
        </h1>
        <p className="text-text-dim text-sm">
          Templates dynamiques, campagnes ciblées, automatisations (inscription/paiement/activité) et historique des envois.
        </p>
      </div>

      <div className="flex gap-2 border-b border-glass-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-text-dim hover:text-text-main hover:bg-glass-hover/50 rounded-t-lg'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-bg-secondary p-6 rounded-2xl border border-glass-border space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold mb-1">Configuration SMTP</p>
                    <p>
                      Hôte, port, identifiants et adresse expéditrice. Utilisez un e-mail pro (Hostinger ou autre) avec SMTP activé.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-dim uppercase">Hôte SMTP</label>
                      <input
                        type="text"
                        value={emailConfig.smtp.host}
                        onChange={(e) =>
                          setEmailConfig({ ...emailConfig, smtp: { ...emailConfig.smtp, host: e.target.value } })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-dim uppercase">Port</label>
                      <input
                        type="number"
                        value={emailConfig.smtp.port}
                        onChange={(e) =>
                          setEmailConfig({
                            ...emailConfig,
                            smtp: { ...emailConfig.smtp, port: Number.parseInt(e.target.value || '0', 10) || 0 },
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Connexion sécurisée (SSL/TLS)</label>
                    <button
                      type="button"
                      onClick={() =>
                        setEmailConfig({ ...emailConfig, smtp: { ...emailConfig.smtp, secure: !emailConfig.smtp.secure } })
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        emailConfig.smtp.secure ? 'bg-indigo-500' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          emailConfig.smtp.secure ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Utilisateur SMTP</label>
                    <input
                      type="text"
                      placeholder="contact@votre-domaine.com"
                      value={emailConfig.smtp.user}
                      onChange={(e) =>
                        setEmailConfig({ ...emailConfig, smtp: { ...emailConfig.smtp, user: e.target.value } })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Mot de passe SMTP</label>
                    <input
                      type="password"
                      value={emailConfig.smtp.pass}
                      onChange={(e) =>
                        setEmailConfig({ ...emailConfig, smtp: { ...emailConfig.smtp, pass: e.target.value } })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Adresse “From”</label>
                    <input
                      type="text"
                      value={emailConfig.smtp.from}
                      onChange={(e) =>
                        setEmailConfig({ ...emailConfig, smtp: { ...emailConfig.smtp, from: e.target.value } })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-glass-border text-text-dim hover:bg-glass-hover transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Tester l’envoi SMTP
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-bg-secondary p-6 rounded-2xl border border-glass-border space-y-6 h-fit">
                <h3 className="text-lg font-bold text-text-main">Automatisations activées</h3>
                <div className="space-y-4">
                  {[
                    { key: 'onRegister', label: 'E-mail de bienvenue (inscription)' },
                    { key: 'onPayment', label: 'Confirmation de paiement' },
                    { key: 'onWorkspaceAction', label: 'Notification activité workspace' },
                    { key: 'onInvitation', label: 'Invitation workspace' },
                    { key: 'onWorkspaceWelcome', label: 'Ajout à un workspace' },
                  ].map((auto) => {
                    const isEnabled = emailConfig.automations[auto.key as keyof typeof emailConfig.automations];
                    return (
                      <div
                        key={auto.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-bg-primary border border-glass-border"
                      >
                        <p className="font-semibold text-text-main text-sm">{auto.label}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setEmailConfig({
                              ...emailConfig,
                              automations: {
                                ...emailConfig.automations,
                                [auto.key]: !isEnabled,
                              },
                            })
                          }
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            isEnabled ? 'bg-indigo-500' : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              isEnabled ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-main">Templates e-mail</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void fetchTemplates()}
                    className="px-3 py-2 rounded-xl border border-glass-border text-text-dim hover:bg-glass-hover transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openTemplateModal()}
                    className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-2 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un template
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl._id}
                    onClick={() => openTemplateModal(tpl)}
                    className="bg-bg-secondary p-5 rounded-2xl border border-glass-border hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <h3 className="font-semibold text-text-main group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {tpl.name}
                      </h3>
                      <LayoutTemplate className="w-4 h-4 text-text-dim shrink-0" />
                    </div>
                    <p className="text-xs text-text-dim mb-2 truncate">{tpl.subject}</p>
                    <div className="mb-3 flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-1 rounded-lg bg-glass-bg border border-glass-border text-text-dim uppercase">
                        {tpl.type}
                      </span>
                      {tpl.automationKey && (
                        <span className="px-2 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 font-mono">
                          {tpl.automationKey}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 min-h-12">
                      {tpl.variables.join(', ') || 'Aucune variable'}
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tpl._id) void deleteTemplate(tpl._id);
                        }}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">Campagnes, historique et analyses</h2>
                  <p className="text-sm text-text-dim">Créer des campagnes ciblées, envoyer, puis suivre les résultats et les erreurs d’envoi.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void refreshCampaignWorkspace()}
                    disabled={isRefreshingCampaigns}
                    className="px-4 py-2 rounded-xl border border-glass-border text-text-dim hover:bg-glass-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingCampaigns ? 'animate-spin' : ''}`} />
                    Rafraîchir
                  </button>
                  <button
                    onClick={() => openCampaignModal()}
                    className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle campagne
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Envois (30j)',
                    value: analytics?.overview.totalAttempts ?? 0,
                    detail: `${analytics?.overview.sent ?? 0} envoyés`,
                    icon: Mail,
                    color: 'text-indigo-400',
                  },
                  {
                    label: 'Taux de succès',
                    value: `${analytics?.overview.successRate ?? 0}%`,
                    detail: `${analytics?.overview.failed ?? 0} échecs`,
                    icon: BarChart3,
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Campagnes créées',
                    value: analytics?.overview.campaignsCreated ?? 0,
                    detail: `${analytics?.overview.campaignsSent ?? 0} envoyées`,
                    icon: Send,
                    color: 'text-cyan-400',
                  },
                  {
                    label: 'Automations (30j)',
                    value: analytics?.categories?.automation ?? 0,
                    detail: `${analytics?.categories?.test ?? 0} tests SMTP`,
                    icon: Clock3,
                    color: 'text-amber-400',
                  },
                ].map((card) => (
                  <div key={card.label} className="bg-bg-secondary border border-glass-border rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-text-dim">{card.label}</p>
                        <p className="text-2xl font-bold text-text-main mt-1">{card.value}</p>
                        <p className="text-xs text-text-dim mt-1">{card.detail}</p>
                      </div>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.25fr,0.75fr] gap-6">
                <div className="bg-bg-secondary border border-glass-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Campagnes enregistrées
                    </h3>
                    <span className="text-xs text-text-dim">{campaigns.length} campagne(s)</span>
                  </div>

                  <div className="space-y-3">
                    {campaigns.length === 0 && (
                      <div className="border border-dashed border-glass-border rounded-xl p-6 text-center text-text-dim">
                        Aucune campagne pour le moment.
                      </div>
                    )}

                    {campaigns.map((campaign) => (
                      <div key={campaign._id} className="rounded-xl border border-glass-border bg-bg-primary p-4 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-text-main truncate">{campaign.name}</h4>
                              <span className={`px-2 py-1 rounded-lg border text-[10px] uppercase ${statusBadgeClass(campaign.status)}`}>
                                {campaign.status}
                              </span>
                              <span className="px-2 py-1 rounded-lg border border-glass-border text-[10px] text-text-dim uppercase">
                                {audienceOptions.find((o) => o.value === campaign.audience?.type)?.label || campaign.audience?.type}
                              </span>
                            </div>
                            <p className="text-xs text-text-dim truncate">{campaign.subject}</p>
                            <p className="text-[11px] text-text-dim">
                              Audience estimée: <span className="text-text-main font-semibold">{campaign.audience?.lastResolvedCount ?? 0}</span> •
                              Dernière MAJ: <span className="text-text-main"> {formatDate(campaign.updatedAt)}</span>
                              {campaign.sentAt ? <> • Envoyée: <span className="text-text-main">{formatDate(campaign.sentAt)}</span></> : null}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openCampaignModal(campaign)}
                              className="px-3 py-2 rounded-xl border border-glass-border text-text-dim hover:bg-glass-hover transition-colors"
                              title="Modifier"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {campaign._id && (
                              <button
                                onClick={() => void sendCampaign(campaign._id!)}
                                disabled={sendingCampaignId === campaign._id || campaign.status === 'sending'}
                                className="px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                {sendingCampaignId === campaign._id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                Envoyer
                              </button>
                            )}
                            {campaign._id && (
                              <button
                                onClick={() => void deleteCampaign(campaign._id!)}
                                className="px-3 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="rounded-lg border border-glass-border p-2 bg-bg-secondary/40">
                            <p className="text-text-dim">Total</p>
                            <p className="font-semibold text-text-main">{campaign.stats?.total ?? 0}</p>
                          </div>
                          <div className="rounded-lg border border-glass-border p-2 bg-emerald-500/5">
                            <p className="text-text-dim">Envoyés</p>
                            <p className="font-semibold text-emerald-400">{campaign.stats?.sent ?? 0}</p>
                          </div>
                          <div className="rounded-lg border border-glass-border p-2 bg-red-500/5">
                            <p className="text-text-dim">Échecs</p>
                            <p className="font-semibold text-red-400">{campaign.stats?.failed ?? 0}</p>
                          </div>
                          <div className="rounded-lg border border-glass-border p-2 bg-amber-500/5">
                            <p className="text-text-dim">Skip</p>
                            <p className="font-semibold text-amber-400">{campaign.stats?.skipped ?? 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-bg-secondary border border-glass-border rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-text-main">Top templates (30j)</h3>
                    <div className="space-y-2 text-sm">
                      {(analytics?.topTemplates || []).length === 0 && <p className="text-text-dim">Pas encore de données.</p>}
                      {(analytics?.topTemplates || []).map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-lg border border-glass-border p-2">
                          <span className="text-text-main truncate pr-3">{item.name}</span>
                          <span className="text-indigo-400 font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-bg-secondary border border-glass-border rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-text-main">Top campagnes (30j)</h3>
                    <div className="space-y-2 text-sm">
                      {(analytics?.topCampaigns || []).length === 0 && <p className="text-text-dim">Pas encore de données.</p>}
                      {(analytics?.topCampaigns || []).map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-lg border border-glass-border p-2">
                          <span className="text-text-main truncate pr-3">{item.name}</span>
                          <span className="text-cyan-400 font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-bg-secondary border border-glass-border rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-text-main">Erreurs récentes</h3>
                    <div className="space-y-2 text-xs">
                      {(analytics?.recentFailures || []).length === 0 && <p className="text-text-dim">Aucune erreur récente.</p>}
                      {(analytics?.recentFailures || []).map((failure) => (
                        <div key={failure._id} className="rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                          <p className="text-red-300 font-medium truncate">{failure.to}</p>
                          <p className="text-text-dim truncate">{failure.subject}</p>
                          <p className="text-red-200/80 mt-1 line-clamp-2">{failure.errorMessage || 'Erreur inconnue'}</p>
                          <p className="text-text-dim mt-1">{formatDate(failure.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-bg-secondary border border-glass-border rounded-2xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h3 className="font-bold text-text-main">Historique des envois</h3>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                      <input
                        value={logQuery}
                        onChange={(e) => setLogQuery(e.target.value)}
                        placeholder="Rechercher e-mail, sujet, campagne..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                    onClick={() => void fetchLogs(logQuery)}
                      className="px-4 py-2 rounded-xl border border-glass-border text-text-dim hover:bg-glass-hover transition-colors"
                    >
                      Rechercher
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="text-left text-text-dim border-b border-glass-border">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Destinataire</th>
                        <th className="py-2 pr-4">Sujet</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Statut</th>
                        <th className="py-2 pr-4">Campagne / Template</th>
                        <th className="py-2">Erreur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-text-dim">
                            Aucun envoi trouvé.
                          </td>
                        </tr>
                      )}
                      {logs.map((log) => (
                        <tr key={log._id} className="border-b border-glass-border/50 align-top">
                          <td className="py-3 pr-4 text-xs text-text-dim whitespace-nowrap">{formatDate(log.createdAt)}</td>
                          <td className="py-3 pr-4 text-text-main">{log.to}</td>
                          <td className="py-3 pr-4 text-text-main max-w-72 truncate">{log.subject}</td>
                          <td className="py-3 pr-4 text-xs uppercase text-text-dim">{log.category}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded-lg border text-[10px] uppercase ${statusBadgeClass(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-xs text-text-dim max-w-52 truncate">
                            {log.campaignName || log.templateName || '—'}
                          </td>
                          <td className="py-3 text-xs text-red-300/90 max-w-72 truncate">{log.errorMessage || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-bg-secondary rounded-3xl border border-glass-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-glass-border flex items-center justify-between bg-glass-bg">
                <h3 className="font-bold text-lg text-text-main">
                  {editingTemplate?._id ? 'Modifier le template' : 'Nouveau template'}
                </h3>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-2 hover:bg-glass-hover rounded-xl text-text-dim transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Nom du template</label>
                    <input
                      type="text"
                      required
                      value={editingTemplate?.name || ''}
                      onChange={(e) => setEditingTemplate((t) => (t ? { ...t, name: e.target.value } : null))}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Type</label>
                    <select
                      value={editingTemplate?.type || 'automation'}
                      onChange={(e) =>
                        setEditingTemplate((t) =>
                          t ? { ...t, type: e.target.value as Template['type'] } : null
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                    >
                      <option value="automation">automation</option>
                      <option value="campaign">campaign</option>
                      <option value="system">system</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-dim uppercase">Clé automation (optionnel)</label>
                  <input
                    type="text"
                    value={editingTemplate?.automationKey || ''}
                    onChange={(e) =>
                      setEditingTemplate((t) => (t ? { ...t, automationKey: e.target.value || undefined } : null))
                    }
                    placeholder="welcome, payment, workspace_action..."
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-dim uppercase">Sujet de l&apos;e-mail</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate?.subject || ''}
                    onChange={(e) => setEditingTemplate((t) => (t ? { ...t, subject: e.target.value } : null))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-dim uppercase">Corps (HTML)</label>
                  <textarea
                    rows={10}
                    required
                    value={editingTemplate?.body || ''}
                    onChange={(e) => setEditingTemplate((t) => (t ? { ...t, body: e.target.value } : null))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    placeholder="<p>Bonjour {{firstName}}...</p>"
                  />
                  <p className="text-xs text-text-dim">
                    Variables supportées: <code>{'{{variable}}'}</code> (échappé) et <code>{'{{{variable}}}'}</code> (non échappé, ex: URL).
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-glass-border text-text-main hover:bg-glass-hover font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCampaignModalOpen && editingCampaign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCampaignModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-auto bg-bg-secondary rounded-3xl border border-glass-border shadow-2xl"
            >
              <div className="p-6 border-b border-glass-border flex items-center justify-between bg-glass-bg sticky top-0 z-10">
                <h3 className="font-bold text-lg text-text-main">
                  {editingCampaign._id ? 'Modifier la campagne' : 'Nouvelle campagne'}
                </h3>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="p-2 hover:bg-glass-hover rounded-xl text-text-dim transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCampaign} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Nom</label>
                    <input
                      type="text"
                      required
                      value={editingCampaign.name}
                      onChange={(e) => setEditingCampaign((c) => (c ? { ...c, name: e.target.value } : c))}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Audience</label>
                    <select
                      value={editingCampaign.audience.type}
                      onChange={(e) =>
                        setEditingCampaign((c) =>
                          c
                            ? {
                                ...c,
                                audience: {
                                  ...c.audience,
                                  type: e.target.value as CampaignAudienceType,
                                },
                              }
                            : c
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                    >
                      {audienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-dim">
                      {audienceOptions.find((o) => o.value === editingCampaign.audience.type)?.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-dim uppercase">Description (optionnelle)</label>
                  <input
                    type="text"
                    value={editingCampaign.description}
                    onChange={(e) => setEditingCampaign((c) => (c ? { ...c, description: e.target.value } : c))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {editingCampaign.audience.type === 'recent_users' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Inscrits depuis (jours)</label>
                    <input
                      type="number"
                      min={1}
                      value={editingCampaign.audience.daysSinceSignup}
                      onChange={(e) =>
                        setEditingCampaign((c) =>
                          c
                            ? {
                                ...c,
                                audience: {
                                  ...c.audience,
                                  daysSinceSignup: Number.parseInt(e.target.value || '30', 10) || 30,
                                },
                              }
                            : c
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {editingCampaign.audience.type === 'custom_emails' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-dim uppercase">Liste d&apos;e-mails personnalisée</label>
                    <textarea
                      rows={4}
                      value={editingCampaign.audience.customEmailsText}
                      onChange={(e) =>
                        setEditingCampaign((c) =>
                          c
                            ? {
                                ...c,
                                audience: {
                                  ...c.audience,
                                  customEmailsText: e.target.value,
                                },
                              }
                            : c
                        )
                      }
                      placeholder={'alice@example.com\nbob@example.com\n...'}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    />
                    <p className="text-xs text-text-dim">Séparez par ligne, virgule ou point-virgule.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-dim uppercase">Sujet</label>
                  <input
                    type="text"
                    required
                    value={editingCampaign.subject}
                    onChange={(e) => setEditingCampaign((c) => (c ? { ...c, subject: e.target.value } : c))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Nouveautés {{firstName}}"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-dim uppercase">Contenu HTML</label>
                  <textarea
                    rows={10}
                    required
                    value={editingCampaign.body}
                    onChange={(e) => setEditingCampaign((c) => (c ? { ...c, body: e.target.value } : c))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-glass-border text-text-main focus:outline-none focus:border-indigo-500 font-mono text-sm"
                  />
                  <p className="text-xs text-text-dim">
                    Personnalisation possible: <code>{'{{firstName}}'}</code>, <code>email</code>, <code>fullName</code>, <code>dashboardUrl</code>, <code>appUrl</code>.
                  </p>
                </div>

                <div className="rounded-xl border border-glass-border bg-bg-primary p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-text-main">Prévisualisation audience</h4>
                      <p className="text-xs text-text-dim">Calcule le nombre de destinataires avant sauvegarde/envoi.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePreviewAudience}
                      disabled={previewLoading}
                      className="px-4 py-2 rounded-xl border border-glass-border text-text-dim hover:bg-glass-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      Prévisualiser audience
                    </button>
                  </div>

                  {previewAudience && (
                    <div className="space-y-2">
                      <p className="text-sm text-text-main">
                        <span className="font-bold text-indigo-400">{previewAudience.count}</span> destinataire(s) trouvés.
                      </p>
                      {previewAudience.sample.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {previewAudience.sample.slice(0, 8).map((entry) => (
                            <span
                              key={entry.email}
                              className="px-2 py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs"
                            >
                              {entry.email}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-glass-border text-text-main hover:bg-glass-hover font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer la campagne
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
