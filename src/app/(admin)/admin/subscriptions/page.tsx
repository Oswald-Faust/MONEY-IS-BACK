'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2,
  Users,
  ExternalLink,
  ChevronDown,
  Filter,
  DollarSign,
  Briefcase,
  Zap,
  Globe
} from 'lucide-react';
import { useAuthStore } from '@/store';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { token } = useAuthStore();

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/subscriptions?plan=${planFilter}&status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [planFilter, statusFilter, token]);

  const planColors: any = {
    starter: 'bg-white/5 text-dim border-white/10',
    pro: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    business: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    enterprise: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const planIcons: any = {
    starter: Briefcase,
    pro: Zap,
    business: Activity,
    enterprise: Globe
  };

  return (
    <div className="space-y-10 pb-20 page-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-main tracking-tight">Abonnements</h1>
            <p className="text-dim">Suivi des revenus et des plans utilisateurs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card !py-2 !px-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-dim uppercase font-bold tracking-widest">Revenue Mensuel (MRR)</p>
              <p className="text-xl font-black text-emerald-400">{data?.mrr || 0}€</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['starter', 'pro', 'business', 'enterprise'].map((p) => {
          const planStat = data?.stats.find((s: any) => s._id === p);
          const Icon = planIcons[p];
          return (
            <div key={p} className="glass-card group hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${planColors[p]} flex items-center justify-center border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-main">{planStat?.count || 0}</span>
              </div>
              <p className="text-sm font-bold text-dim uppercase tracking-widest group-hover:text-main transition-colors">{p}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${planColors[p].split(' ')[1].replace('text-', 'bg-')}`} 
                    style={{ width: `${(planStat?.count / (data?.workspaces.length || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-dim">{Math.round((planStat?.count / (data?.workspaces.length || 1)) * 100)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-main flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Workspaces Planifiés
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-dim" />
              <select 
                value={planFilter} 
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-main focus:outline-none cursor-pointer"
              >
                <option value="all">Tous les plans</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Activity className="w-3.5 h-3.5 text-dim" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-main focus:outline-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="canceled">Annulé</option>
                <option value="past_due">En retard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Workspace</th>
                  <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Propriétaire</th>
                  <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Prochain Paiement</th>
                  <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dim">
                       <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                       Chargement des données financières...
                    </td>
                  </tr>
                ) : data?.workspaces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dim italic">
                       Aucun abonnement correspondant aux critères
                    </td>
                  </tr>
                ) : (
                  data?.workspaces.map((ws: any) => (
                    <tr key={ws._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 border border-white/5`}>
                             <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-main">{ws.name}</p>
                            <p className="text-[10px] text-dim font-bold uppercase">{ws.subscriptionId ? `ID: ${ws.subscriptionId.slice(0, 12)}...` : 'Pas d\'ID Stripe'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-main border border-white/10">
                              {ws.owner?.avatar ? <Image src={ws.owner.avatar} alt="" width={32} height={32} className="rounded-full" /> : ws.owner?.firstName?.[0]}
                           </div>
                           <div>
                            <p className="text-sm text-main">{ws.owner?.firstName} {ws.owner?.lastName}</p>
                            <p className="text-[10px] text-dim">{ws.owner?.email}</p>
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${planColors[ws.subscriptionPlan]}`}>
                          {ws.subscriptionPlan}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          ws.subscriptionStatus === 'active' ? 'bg-green-500/10 text-green-400' :
                          ws.subscriptionStatus === 'canceled' ? 'bg-red-500/10 text-red-400' :
                          'bg-white/5 text-dim shadow-inner'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             ws.subscriptionStatus === 'active' ? 'bg-green-400 animate-pulse' :
                             ws.subscriptionStatus === 'canceled' ? 'bg-red-400' : 'bg-dim'
                          }`} />
                          {ws.subscriptionStatus === 'active' ? 'Actif' : ws.subscriptionStatus || 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-dim">
                        {ws.subscriptionEnd ? new Date(ws.subscriptionEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-white/5 text-dim hover:text-main transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
