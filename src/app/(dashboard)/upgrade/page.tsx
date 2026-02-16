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
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const plans = [
  {
    name: 'Gratuit',
    id: 'starter',
    price: { monthly: 0, yearly: 0 },
    originalPrice: { monthly: 0, yearly: 0 },
    description: 'Pour explorer les bases de MONEY IS BACK.',
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
      const targetPlanId = urlParams.get('planId');
      
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

      const data = await response.json();
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
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Mettre à niveau votre expérience
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-dim max-w-2xl mx-auto"
          >
            Choisissez le plan qui correspond le mieux à vos ambitions et débloquez tout le potentiel de MONEY IS BACK.
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
                <h2 className="text-xl font-bold text-white mb-1">
                  Plan Actuel : {plans.find(p => p.id === currentPlanId)?.name}
                  <span className="text-indigo-400 ml-2 text-sm font-normal">
                    (Workspace: {currentWorkspace?.name})
                  </span>
                </h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-dim">
                    <Clock className="w-3.5 h-3.5" />
                    Fin de l&apos;abonnement : <span className="text-white font-medium ml-1">
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
                  <div className="flex items-center gap-1.5 text-xs text-dim">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status : <span className={`${currentWorkspace?.subscriptionStatus === 'active' ? 'text-[#00FFB2]' : 'text-orange-400'} font-medium ml-1 uppercase text-[10px]`}>
                      {currentWorkspace?.subscriptionStatus || (currentPlanId === 'starter' ? 'Actif' : 'Inconnu')}
                      {currentWorkspace?.subscriptionInterval && (
                        <span className="ml-1 text-dim font-normal normal-case">
                          ({currentWorkspace.subscriptionInterval === 'month' ? 'Mensuel' : 'Annuel'})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
                <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                   Gérer mon abonnement
                   <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1.5 bg-secondary border border-glass-border rounded-2xl">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-dim hover:text-white'}`}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-dim hover:text-white'}`}
            >
              Annuel
              <span className="text-[10px] bg-[#00FFB2]/20 text-[#00FFB2] px-1.5 py-0.5 rounded-md font-bold uppercase">-25%</span>
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
                    ? 'bg-[#12121e] border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
                    : 'bg-secondary border-glass-border hover:border-white/10'
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
                      style={{ backgroundColor: `${plan.color}15`, border: `1px solid ${plan.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: plan.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-dim text-sm h-10 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="relative z-10 flex flex-col mb-8">
                    <div className="flex flex-col">
                      <span className="text-sm text-dim line-through decoration-indigo-500/50 decoration-2">
                        {typeof originalPrice === 'number' ? `$${originalPrice}` : originalPrice}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">
                          {price === 0 ? 'GRATUIT' : `$${price}`}
                        </span>
                        {typeof price === 'number' && price !== 0 && (
                          <span className="text-dim text-[10px]">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 flex-1 flex flex-col">
                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-[#00FFB2]" />
                        </div>
                        <span className="text-sm text-dim leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    disabled={isCurrent || isUpgrading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2
                      ${isCurrent 
                        ? 'bg-white/5 text-dim border border-white/5 cursor-default' 
                        : plan.popular
                          ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25'
                          : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
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

        {/* FAQ or Trust Badges Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                 <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-white font-bold mb-2">Sécurité Maximale</h4>
              <p className="text-xs text-dim">Vos données sont encryptées de bout en bout avec les standards les plus élevés du marché.</p>
           </div>
           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                 <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-white font-bold mb-2">Paiement Sécurisé</h4>
              <p className="text-xs text-dim">Nous utilisons Stripe pour traiter tous les paiements. Vos informations bancaires ne sont jamais stockées chez nous.</p>
           </div>
           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#00FFB2]/10 flex items-center justify-center mb-4">
                 <Calendar className="w-5 h-5 text-[#00FFB2]" />
              </div>
              <h4 className="text-white font-bold mb-2">Sans Engagement</h4>
              <p className="text-xs text-dim">Annulez ou changez de plan à tout moment. Pas de frais cachés, pas de mauvaise surprise.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
