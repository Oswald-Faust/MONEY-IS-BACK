'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Workspace } from '@/types';
import {
  Check,
  Zap,
  Star,
  Rocket,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Search,
  Target,
  Smartphone,
  Plus,
  RefreshCw,
  Infinity as InfinityIcon,
} from 'lucide-react';

const TOKEN_PACKS = [
  { id: 'starter_pack',  label: 'Pack Starter',  tokens: 200_000,   price: 2.99,  description: '~40–60 échanges supplémentaires' },
  { id: 'standard_pack', label: 'Pack Standard', tokens: 1_000_000, price: 9.99,  description: '~200–300 échanges supplémentaires', popular: true },
  { id: 'pro_pack',      label: 'Pack Pro',      tokens: 5_000_000, price: 34.99, description: '~1 000–1 500 échanges supplémentaires' },
];

const AI_PLAN_FEATURES = [
  { plan: 'starter',    tokens: '150 000',      whatsapp: false, label: 'Gratuit' },
  { plan: 'pro',        tokens: '500 000',      whatsapp: true,  label: 'Pro' },
  { plan: 'team',       tokens: '2 000 000',    whatsapp: true,  label: 'Team' },
  { plan: 'business',   tokens: '8 000 000',    whatsapp: true,  label: 'Business' },
  { plan: 'enterprise', tokens: 'Illimité',     whatsapp: true,  label: 'Enterprise' },
];

function formatTokenDisplay(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

const plans = [
  {
    name: 'Gratuit',
    id: 'starter',
    price: { monthly: 0, yearly: 0 },
    originalPrice: { monthly: 0, yearly: 0 },
    description: 'Pour explorer les bases de Edwin.',
    features: [
      '1 Utilisateur maximum',
      '1 Projet maximum',
      '1 Go de stockage Drive',
      '7 Tâches max par projet',
      'Routines limitées',
    ],
    icon: Rocket,
    color: '#94a3b8',
    gradient: 'from-slate-500/10 to-transparent',
  },
  {
    name: 'Pro',
    id: 'pro',
    price: { monthly: 9.99, yearly: 8.99 },
    originalPrice: { monthly: 15, yearly: 12 },
    description: 'Idéal pour les indépendants et petites équipes.',
    features: [
      '3 Utilisateurs inclus',
      '€6.99/user supplémentaire',
      '3 Projets inclus',
      '€4.99/projet supplémentaire',
      '10 Go de stockage Drive',
      'Tâches & Routines illimitées',
    ],
    icon: Zap,
    color: '#6366f1',
    gradient: 'from-indigo-500/20 to-transparent',
    popular: true,
  },
  {
    name: 'Team',
    id: 'team',
    price: { monthly: 29.99, yearly: 24.99 },
    originalPrice: { monthly: 39, yearly: 29 },
    description: 'Le choix ultime pour les équipes structurées.',
    features: [
      '10 Utilisateurs inclus',
      '€4.99/user supplémentaire',
      'Stockage Drive Illimité',
      'Dashboards personnalisés',
      'Mindmaps & Timelines',
      'Projets illimités (plus de 5)',
    ],
    icon: Star,
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 to-transparent',
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    originalPrice: { monthly: '...', yearly: '...' },
    description: 'Sécurité et contrôle pour les grandes organisations.',
    features: [
      'Utilisateurs illimités',
      'White Label (Votre logo)',
      'SAML SSO / Okta intégré',
      'API illimitée',
      'Success Manager dédié',
      'Logs d\'Audit complets',
    ],
    icon: ShieldCheck,
    color: '#00FFB2',
    gradient: 'from-[#00FFB2]/20 to-transparent',
  },
];

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
  
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } = useAppStore();
  const { token } = useAuthStore();
  const router = useRouter();
  const hasRefreshed = React.useRef(false);

  // Handle successful payment redirection
  React.useEffect(() => {
    // Only proceed on client side where window is available
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    
    if (isSuccess && token && !hasRefreshed.current) {
      hasRefreshed.current = true;
      setIsSyncing(true);
      
      toast.success('Paiement réussi ! Finalisation de votre abonnement...', { 
        icon: '🎉',
        id: 'stripe-success',
        duration: 5000
      });
      
      let attempts = 0;
      const intervalId = setInterval(async () => {
        attempts++;
        if (attempts > 15) { // 30s max
          clearInterval(intervalId);
          setIsSyncing(false);
          toast.error('Délai dépassé. Vos données seront actualisées d\'ici peu.', { id: 'stripe-success' });
          return;
        }

        try {
          const sessionId = urlParams.get('session_id');
          const syncUrl = sessionId 
            ? `/api/workspaces?t=${Date.now()}&session_id=${sessionId}`
            : `/api/workspaces?t=${Date.now()}`;

          const response = await fetch(syncUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          
          if (data.success && data.data.length > 0) {
            // Plan-agnostic check: if status is now active, we are good
            const currentId = currentWorkspace?._id;
            const updatedWs = (data.data as Workspace[]).find((w: Workspace) => w._id === currentId) || data.data[0];
            
            const isUpdated = updatedWs.subscriptionStatus === 'active';

            if (isUpdated) {
              setWorkspaces(data.data);
              setCurrentWorkspace(updatedWs);
              setIsSyncing(false);
              clearInterval(intervalId);
              toast.success(`Votre plan ${updatedWs.subscriptionPlan.toUpperCase()} est désormais actif !`, {
                icon: '🚀',
                id: 'sync-complete'
              });
              router.replace('/upgrade', { scroll: false });
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000);

      return () => {
        clearInterval(intervalId);
        setIsSyncing(false);
      };
    }
  }, [token, currentWorkspace?._id, setCurrentWorkspace, setWorkspaces, router]);
  
  const currentPlanId = currentWorkspace?.subscriptionPlan || 'starter';
  
  const refreshData = useCallback(async (silent = false) => {
    if (!token) return;
    const loadingToast = silent ? null : toast.loading('Actualisation des données...');
    try {
      const response = await fetch(`/api/workspaces?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setWorkspaces(data.data);
        const currentId = currentWorkspace?._id;
        const updatedWs = (data.data as Workspace[]).find((w: Workspace) => w._id === currentId) || data.data[0];
        setCurrentWorkspace(updatedWs);
        if (loadingToast) toast.success('Données actualisées', { id: loadingToast });
      }
    } catch (error) {
      console.error('Refresh error:', error);
      if (loadingToast) toast.error('Erreur lors de l\'actualisation', { id: loadingToast });
    }
  }, [token, currentWorkspace?._id, setCurrentWorkspace, setWorkspaces]);

  // Auto-refresh on mount
  React.useEffect(() => {
    if (token) {
      refreshData(true);
    }
  }, [token, refreshData]);

  const handleBuyPack = async (packId: string) => {
    if (!currentWorkspace) {
      toast.error('Veuillez sélectionner un workspace');
      return;
    }
    setPurchasingPack(packId);
    try {
      const res = await fetch('/api/stripe/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      setPurchasingPack(null);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') return;
    if (!currentWorkspace) {
      toast.error('Veuillez sélectionner un workspace');
      return;
    }

    try {
      setIsUpgrading(planId);
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace._id,
          planId,
          billingCycle
        })
      });
      const data: { url?: string; error?: string } = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de la création de la session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsUpgrading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="page-fade min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="pt-10 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-mono text-indigo-400 tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-3 h-3" />
            VOTRE ABONNEMENT
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-text-main mb-6 tracking-tight"
          >
            Mettre à niveau votre expérience
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-dim max-w-2xl mx-auto"
          >
            Choisissez le plan qui correspond le mieux à vos ambitions et débloquez tout le potentiel de Edwin.
          </motion.p>
        </div>

        {/* Current Plan Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent opacity-50 transition-opacity group-hover:opacity-70" />
          <div className="relative glass-card border-indigo-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main mb-1">
                  Plan Actuel : {plans.find(p => p.id === currentPlanId)?.name}
                  <span className="text-indigo-500 dark:text-indigo-400 ml-2 text-sm font-normal">
                    (Workspace: {currentWorkspace?.name})
                  </span>
                </h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-text-dim">
                    <Clock className="w-3.5 h-3.5" />
                    Fin de l&apos;abonnement : <span className="text-text-main font-medium ml-1">
                      {currentWorkspace?.subscriptionEnd && !isNaN(new Date(currentWorkspace.subscriptionEnd).getTime())
                        ? new Date(currentWorkspace.subscriptionEnd).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) 
                        : currentPlanId === 'starter' 
                          ? 'À vie (Gratuit)' 
                          : isSyncing ? 'Chargement...' : 'Date non définie'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-dim">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status : <span className={`${currentWorkspace?.subscriptionStatus === 'active' ? 'text-[#00FFB2]' : 'text-orange-500 dark:text-orange-400'} font-medium ml-1 uppercase text-[10px]`}>
                      {currentWorkspace?.subscriptionStatus || (currentPlanId === 'starter' ? 'Actif' : 'Inconnu')}
                      {currentWorkspace?.subscriptionInterval && (
                        <span className="ml-1 text-text-dim font-normal normal-case">
                          ({currentWorkspace.subscriptionInterval === 'month' ? 'Mensuel' : 'Annuel'})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1.5 bg-secondary border border-glass-border rounded-2xl">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'text-text-dim hover:text-text-main'}`}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'text-text-dim hover:text-text-main'}`}
            >
              Annuel
              <span className="text-[10px] bg-[#00FFB2]/20 text-emerald-600 dark:text-[#00FFB2] px-1.5 py-0.5 rounded-md font-bold uppercase">-25%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const Icon = plan.icon;
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const originalPrice = billingCycle === 'monthly' ? plan.originalPrice.monthly : plan.originalPrice.yearly;

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={`flex flex-col relative rounded-[32px] border transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-[1.02] z-10' 
                    : 'bg-bg-secondary border-glass-border hover:border-glass-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold tracking-widest uppercase z-10">
                    RECOMMANDÉ
                  </div>
                )}

                <div className={`p-8 pb-0 overflow-hidden relative rounded-t-[32px]`}>
                  <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${plan.gradient} blur-3xl opacity-50`} />
                  
                  <div className="relative z-10 flex flex-col mb-8">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                      style={{ 
                        backgroundColor: plan.popular ? 'rgba(255,255,255,0.2)' : `${plan.color}15`, 
                        border: `1px solid ${plan.popular ? 'rgba(255,255,255,0.4)' : `${plan.color}30`}` 
                      }}
                    >
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-white' : ''}`} style={plan.popular ? {} : { color: plan.color }} />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 tracking-tight ${plan.popular ? 'text-white' : 'text-text-main'}`}>{plan.name}</h3>
                    <p className={`text-sm h-10 leading-relaxed font-medium ${plan.popular ? 'text-indigo-100' : 'text-text-dim'}`}>{plan.description}</p>
                  </div>

                  <div className="relative z-10 flex flex-col mb-8">
                    <div className="flex flex-col">
                      <span className={`text-sm line-through decoration-2 ${plan.popular ? 'text-indigo-300 decoration-indigo-200' : 'text-text-muted decoration-indigo-500/50'}`}>
                        {typeof originalPrice === 'number' ? `$${originalPrice}` : originalPrice}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold ${plan.popular ? 'text-white' : 'text-text-main'}`}>
                          {price === 0 ? 'GRATUIT' : `$${price}`}
                        </span>
                        {typeof price === 'number' && price !== 0 && (
                          <span className={`${plan.popular ? 'text-indigo-100' : 'text-text-dim'} text-[11px] font-medium`}>/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 flex-1 flex flex-col">
                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-white/20 border border-white/40' : 'bg-emerald-500/10 dark:bg-[#00FFB2]/10 border border-emerald-500/20 dark:border-[#00FFB2]/20'}`}>
                          <Check className={`w-2.5 h-2.5 ${plan.popular ? 'text-white' : 'text-emerald-600 dark:text-[#00FFB2]'}`} />
                        </div>
                        <span className={`text-sm leading-tight ${plan.popular ? 'text-white/90' : 'text-text-dim'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    disabled={isCurrent || isUpgrading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2
                      ${isCurrent 
                        ? plan.popular ? 'bg-white/10 text-white/50 cursor-default' : 'bg-bg-tertiary text-text-dim border border-glass-border cursor-default' 
                        : plan.popular
                          ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-white/10'
                          : 'bg-bg-secondary text-text-main border border-glass-border hover:bg-glass-hover'
                      }
                      ${isUpgrading === plan.id ? 'opacity-50 cursor-wait' : ''}
                    `}
                  >
                    {isCurrent ? 'Plan Actuel' : isUpgrading === plan.id ? 'Chargement...' : `Choisir ${plan.name}`}
                    {!isCurrent && !isUpgrading && <Zap className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Section IA & Tokens ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24"
        >
          {/* Header section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-mono text-indigo-400 tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3" />
              INTELLIGENCE ARTIFICIELLE
            </div>
            <h2 className="text-3xl font-bold text-text-main mb-3 tracking-tight">Quota IA par plan</h2>
            <p className="text-text-dim max-w-xl mx-auto text-sm">
              Chaque token consommé correspond à un échange avec l&apos;IA (message envoyé + réponse reçue + contexte workspace). Les tokens se renouvellent chaque mois.
            </p>
          </div>

          {/* Tableau tokens par plan */}
          <div className="overflow-x-auto rounded-2xl border border-glass-border bg-bg-secondary mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Fonctionnalité</th>
                  {AI_PLAN_FEATURES.map(p => (
                    <th key={p.plan} className={`px-6 py-4 text-center font-semibold ${p.plan === currentPlanId ? 'text-indigo-400' : 'text-text-dim'}`}>
                      {p.label}
                      {p.plan === currentPlanId && <span className="ml-1 text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md font-bold">ACTUEL</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-glass-border">
                  <td className="px-6 py-4 text-text-dim flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    Tokens IA / mois
                  </td>
                  {AI_PLAN_FEATURES.map(p => (
                    <td key={p.plan} className="px-6 py-4 text-center">
                      {p.tokens === 'Illimité'
                        ? <span className="inline-flex items-center gap-1 text-[#00FFB2] font-semibold"><InfinityIcon className="w-4 h-4" /> Illimité</span>
                        : <span className={`font-semibold ${p.plan === currentPlanId ? 'text-indigo-400' : 'text-text-main'}`}>{p.tokens}</span>
                      }
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-glass-border">
                  <td className="px-6 py-4 text-text-dim flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-green-400 flex-shrink-0" />
                    WhatsApp IA
                  </td>
                  {AI_PLAN_FEATURES.map(p => (
                    <td key={p.plan} className="px-6 py-4 text-center">
                      {p.whatsapp
                        ? <Check className="w-4 h-4 text-[#00FFB2] mx-auto" />
                        : <span className="text-text-muted text-xs">—</span>
                      }
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-glass-border">
                  <td className="px-6 py-4 text-text-dim flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    Recherche IA
                  </td>
                  {AI_PLAN_FEATURES.map(() => (
                    <td key={Math.random()} className="px-6 py-4 text-center">
                      <Check className="w-4 h-4 text-[#00FFB2] mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-text-dim flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    Génération d&apos;objectifs
                  </td>
                  {AI_PLAN_FEATURES.map(() => (
                    <td key={Math.random()} className="px-6 py-4 text-center">
                      <Check className="w-4 h-4 text-[#00FFB2] mx-auto" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-text-muted mb-12">
            1 échange assistant ≈ 3 000–7 000 tokens · 1 recherche IA ≈ 2 000–4 000 tokens · 1 génération d&apos;objectif ≈ 3 000–6 000 tokens
          </p>

          {/* Packs de tokens */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-text-main mb-1">Acheter des tokens supplémentaires</h3>
            <p className="text-sm text-text-dim">
              Disponibles pour tous les plans. Les tokens achetés s&apos;ajoutent à votre quota mensuel et <strong className="text-text-main">n&apos;expirent pas</strong> en fin de mois.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TOKEN_PACKS.map(pack => (
              <div
                key={pack.id}
                className={`relative rounded-2xl p-6 flex flex-col gap-4 border transition-all ${
                  pack.popular
                    ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                    : 'bg-bg-secondary border-glass-border hover:border-indigo-500/30'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold tracking-widest uppercase">
                    POPULAIRE
                  </div>
                )}
                <div>
                  <p className={`font-bold text-lg ${pack.popular ? 'text-white' : 'text-text-main'}`}>{pack.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${pack.popular ? 'text-white' : 'text-indigo-400'}`}>
                    {formatTokenDisplay(pack.tokens)} <span className="text-sm font-normal opacity-70">tokens</span>
                  </p>
                  <p className={`text-xs mt-1 ${pack.popular ? 'text-indigo-100' : 'text-text-muted'}`}>{pack.description}</p>
                </div>
                <button
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={!!purchasingPack}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                    pack.popular
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                  }`}
                >
                  {purchasingPack === pack.id
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Chargement...</>
                    : <><Plus className="w-4 h-4" /> {pack.price.toFixed(2)} €</>
                  }
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ or Trust Badges Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 rounded-2xl bg-bg-secondary border border-glass-border">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                 <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-text-main font-bold mb-2">Sécurité Maximale</h4>
              <p className="text-xs text-text-dim">Vos données sont encryptées de bout en bout avec les standards les plus élevés du marché.</p>
           </div>
           <div className="p-6 rounded-2xl bg-bg-secondary border border-glass-border">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                 <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-text-main font-bold mb-2">Paiement Sécurisé</h4>
              <p className="text-xs text-text-dim">Nous utilisons Stripe pour traiter tous les paiements. Vos informations bancaires ne sont jamais stockées chez nous.</p>
           </div>
           <div className="p-6 rounded-2xl bg-bg-secondary border border-glass-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-[#00FFB2]/10 flex items-center justify-center mb-4">
                 <Calendar className="w-5 h-5 text-emerald-600 dark:text-[#00FFB2]" />
              </div>
              <h4 className="text-text-main font-bold mb-2">Sans Engagement</h4>
              <p className="text-xs text-text-dim">Annulez ou changez de plan à tout moment. Pas de frais cachés, pas de mauvaise surprise.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
