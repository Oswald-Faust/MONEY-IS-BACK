'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  Activity,
  Building2,
  ExternalLink,
  Filter,
  Briefcase,
  Zap,
  Globe,
  X,
  Save,
  ShieldCheck,
  Crown,
  Star,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PLANS = [
  { id: 'starter', label: 'Starter', sublabel: 'Gratuit', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Briefcase },
  { id: 'pro',     label: 'Pro',     sublabel: '9,99€/mois', color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  icon: Zap },
  { id: 'team',    label: 'Team',    sublabel: '29,99€/mois', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Star },
  { id: 'business',label: 'Business',sublabel: 'Custom',  color: 'text-purple-400',bg: 'bg-purple-500/10',border: 'border-purple-500/20', icon: Activity },
  { id: 'enterprise',label:'Enterprise',sublabel:'Custom',color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   icon: Globe },
];

const STATUSES = [
  { id: 'active',   label: 'Actif',    dot: 'bg-green-400 animate-pulse',  badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'inactive', label: 'Inactif',  dot: 'bg-slate-400',                badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { id: 'trialing', label: 'Trial',    dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { id: 'past_due', label: 'Retard',   dot: 'bg-orange-400',               badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'canceled', label: 'Annulé',   dot: 'bg-red-400',                  badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'unpaid',   label: 'Impayé',   dot: 'bg-red-600',                  badge: 'bg-red-600/10 text-red-500 border-red-600/20' },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find(x => x.id === status) ?? STATUSES[1];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const p = PLANS.find(x => x.id === plan) ?? PLANS[0];
  const Icon = p.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${p.color} ${p.bg} ${p.border}`}>
      <Icon className="w-3 h-3" />
      {p.label}
    </span>
  );
}

type Draft = {
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionInterval: string;
  subscriptionEnd: string;
};

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer state
  const [drawerWs, setDrawerWs] = useState<any>(null);
  const [draft, setDraft] = useState<Draft>({ subscriptionPlan: 'starter', subscriptionStatus: 'inactive', subscriptionInterval: '', subscriptionEnd: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Promote admin state
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  const { token } = useAuthStore();

  const toInputDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/subscriptions?plan=${planFilter}&status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, [planFilter, statusFilter, token]);

  const openDrawer = (ws: any) => {
    setDrawerWs(ws);
    setDraft({
      subscriptionPlan: ws.subscriptionPlan || 'starter',
      subscriptionStatus: ws.subscriptionStatus || 'inactive',
      subscriptionInterval: ws.subscriptionInterval || '',
      subscriptionEnd: toInputDate(ws.subscriptionEnd),
    });
  };

  const saveSubscription = async () => {
    if (!drawerWs) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          workspaceId: drawerWs._id,
          subscriptionPlan: draft.subscriptionPlan,
          subscriptionStatus: draft.subscriptionStatus,
          subscriptionInterval: draft.subscriptionInterval || null,
          subscriptionEnd: draft.subscriptionEnd || null,
        }),
      });
      const result = await res.json();
      if (!result.success) { toast.error(result.error || 'Erreur'); return; }
      toast.success(`Abonnement mis à jour → ${draft.subscriptionPlan.toUpperCase()}`);
      setDrawerWs(null);
      await fetchSubscriptions();
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setIsSaving(false);
    }
  };

  const promoteToAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Promouvoir ${userName} en administrateur Edwin ?`)) return;
    setPromotingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: 'admin' }),
      });
      const result = await res.json();
      if (!result.success) { toast.error(result.error || 'Erreur'); return; }
      toast.success(`${userName} est maintenant administrateur`);
      await fetchSubscriptions();
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setPromotingUserId(null);
    }
  };

  const planIcons: any = { starter: Briefcase, pro: Zap, business: Activity, enterprise: Globe, team: Star };

  return (
    <div className="space-y-10 pb-20 page-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight">Abonnements</h1>
            <p className="text-text-dim">Suivi des revenus et des plans utilisateurs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSubscriptions} className="p-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-dim hover:text-text-main transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="glass-card !py-3 !px-5 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Revenue Mensuel (MRR)</p>
              <p className="text-2xl font-black text-emerald-400">{data?.mrr || 0}€</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {PLANS.map((p) => {
          const planStat = data?.stats.find((s: any) => s._id === p.id);
          const Icon = p.icon;
          const total = data?.workspaces.length || 1;
          const pct = Math.round(((planStat?.count || 0) / total) * 100);
          return (
            <div key={p.id} className={`glass-card group cursor-pointer transition-all hover:border-opacity-50 ${planFilter === p.id ? `${p.border} border` : ''}`}
              onClick={() => setPlanFilter(planFilter === p.id ? 'all' : p.id)}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${p.bg} ${p.border} border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <span className="text-2xl font-black text-text-main">{planStat?.count || 0}</span>
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${p.color}`}>{p.label}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className={`h-full ${p.bg.replace('/10', '/60')}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-text-dim">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500" />
          Workspaces
          {data?.workspaces.length > 0 && (
            <span className="text-xs bg-glass-bg border border-glass-border px-2 py-0.5 rounded-full text-text-dim font-normal">
              {data.workspaces.length}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-secondary border border-glass-border rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-text-dim" />
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-text-main focus:outline-none cursor-pointer">
              <option value="all">Tous les plans</option>
              {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-bg-secondary border border-glass-border rounded-xl px-3 py-2">
            <Activity className="w-3.5 h-3.5 text-text-dim" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-text-main focus:outline-none cursor-pointer">
              <option value="all">Tous les statuts</option>
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border bg-bg-tertiary/50">
                <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-wider">Workspace</th>
                <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-wider">Propriétaire</th>
                <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-wider">Fin d&apos;abonnement</th>
                <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-text-dim">
                    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    Chargement...
                  </td>
                </tr>
              ) : !data?.workspaces?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-text-dim italic">
                    Aucun abonnement correspondant
                  </td>
                </tr>
              ) : (
                data.workspaces.map((ws: any) => (
                  <tr key={ws._id} className="hover:bg-glass-hover transition-colors group">
                    {/* Workspace */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 border border-glass-border flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main">{ws.name}</p>
                          <p className="text-[10px] text-text-dim font-mono">
                            {ws.subscriptionId ? `ID: ${ws.subscriptionId.slice(0, 14)}…` : 'Pas d\'ID Stripe'}
                          </p>
                        </div>
                        <Link href={`/admin/workspaces/${ws._id}`}
                          className="p-1.5 rounded-lg hover:bg-glass-hover text-text-dim hover:text-text-main transition-colors opacity-0 group-hover:opacity-100">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-main border border-glass-border flex-shrink-0 overflow-hidden">
                          {ws.owner?.avatar
                            ? <Image src={ws.owner.avatar} alt="" width={32} height={32} className="rounded-full" />
                            : ws.owner?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-text-main">{ws.owner?.firstName} {ws.owner?.lastName}</p>
                            {ws.owner?.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase">
                                <ShieldCheck className="w-2.5 h-2.5" /> Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-text-dim">{ws.owner?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">
                      <PlanBadge plan={ws.subscriptionPlan || 'starter'} />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={ws.subscriptionStatus || 'inactive'} />
                    </td>

                    {/* End date */}
                    <td className="px-6 py-4 text-sm text-text-dim">
                      {ws.subscriptionEnd
                        ? new Date(ws.subscriptionEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-text-muted">—</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Promote admin button */}
                        {ws.owner && ws.owner.role !== 'admin' && (
                          <button
                            onClick={() => promoteToAdmin(ws.owner._id, `${ws.owner.firstName} ${ws.owner.lastName}`)}
                            disabled={promotingUserId === ws.owner._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                            title="Promouvoir en admin Edwin"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            {promotingUserId === ws.owner._id ? '…' : 'Admin'}
                          </button>
                        )}
                        {/* Edit subscription button */}
                        <button
                          onClick={() => openDrawer(ws)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Drawer */}
      <AnimatePresence>
        {drawerWs && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setDrawerWs(null)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-primary border-l border-glass-border z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-glass-border">
                <div>
                  <p className="text-xs text-text-dim uppercase tracking-widest font-bold mb-0.5">Modifier l&apos;abonnement</p>
                  <h3 className="text-lg font-bold text-text-main">{drawerWs.name}</h3>
                </div>
                <button onClick={() => setDrawerWs(null)}
                  className="p-2 rounded-xl hover:bg-glass-hover text-text-dim hover:text-text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                {/* Plan selector */}
                <div>
                  <p className="text-xs font-bold text-text-dim uppercase tracking-widest mb-3">Plan d&apos;abonnement</p>
                  <div className="space-y-2">
                    {PLANS.map(p => {
                      const Icon = p.icon;
                      const isSelected = draft.subscriptionPlan === p.id;
                      return (
                        <button key={p.id}
                          onClick={() => setDraft(d => ({ ...d, subscriptionPlan: p.id }))}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                            ${isSelected
                              ? `${p.bg} ${p.border} border-2`
                              : 'bg-glass-bg border-glass-border hover:border-glass-border hover:bg-glass-hover'
                            }`}>
                          <div className={`w-9 h-9 rounded-lg ${p.bg} ${p.border} border flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${p.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${isSelected ? p.color : 'text-text-main'}`}>{p.label}</p>
                            <p className="text-[11px] text-text-dim">{p.sublabel}</p>
                          </div>
                          {isSelected && (
                            <div className={`w-5 h-5 rounded-full ${p.bg} ${p.border} border-2 flex items-center justify-center`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${p.bg.replace('/10', '/80')}`} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status selector */}
                <div>
                  <p className="text-xs font-bold text-text-dim uppercase tracking-widest mb-3">Statut</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map(s => {
                      const isSelected = draft.subscriptionStatus === s.id;
                      return (
                        <button key={s.id}
                          onClick={() => setDraft(d => ({ ...d, subscriptionStatus: s.id }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all
                            ${isSelected ? s.badge + ' border-2' : 'bg-glass-bg border-glass-border hover:bg-glass-hover text-text-dim'}`}>
                          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interval */}
                <div>
                  <p className="text-xs font-bold text-text-dim uppercase tracking-widest mb-3">Intervalle de facturation</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '', label: 'Aucun' },
                      { id: 'month', label: 'Mensuel' },
                      { id: 'year', label: 'Annuel' },
                    ].map(opt => (
                      <button key={opt.id}
                        onClick={() => setDraft(d => ({ ...d, subscriptionInterval: opt.id }))}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all
                          ${draft.subscriptionInterval === opt.id
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 border-2'
                            : 'bg-glass-bg border-glass-border hover:bg-glass-hover text-text-dim'
                          }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* End date */}
                <div>
                  <p className="text-xs font-bold text-text-dim uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Date de fin d&apos;abonnement
                  </p>
                  <input
                    type="date"
                    value={draft.subscriptionEnd}
                    onChange={e => setDraft(d => ({ ...d, subscriptionEnd: e.target.value }))}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  {draft.subscriptionEnd && (
                    <button onClick={() => setDraft(d => ({ ...d, subscriptionEnd: '' }))}
                      className="mt-1.5 text-[11px] text-text-dim hover:text-text-main transition-colors">
                      Effacer la date
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-glass-border flex items-center gap-3">
                <button onClick={() => setDrawerWs(null)}
                  className="flex-1 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-dim text-sm font-bold hover:bg-glass-hover transition-colors">
                  Annuler
                </button>
                <button onClick={saveSubscription} disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
