'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface AdminStats {
  counts: {
    users: number;
    workspaces: number;
    projects: number;
    tasks: number;
    subscriptions: number;
  };
  growth: {
    newUsersWeek: number;
  };
  useCaseDistribution: { _id: string; count: number }[];
  recentUsers: User[];
  recentWorkspaces: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (_err) {
        toast.error('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  const primaryStats = [
    { 
      label: 'Utilisateurs Totaux', 
      value: stats?.counts.users || 0, 
      icon: Users, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10',
      trend: '+12%',
      trendUp: true 
    },
    { 
      label: 'Abonnements Actifs', 
      value: stats?.counts.subscriptions || 0, 
      icon: CreditCard, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      trend: '+5%',
      trendUp: true 
    },
    { 
      label: 'Nouveaux (7j)', 
      value: stats?.growth.newUsersWeek || 0, 
      icon: TrendingUp, 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/10',
      trend: '+18%',
      trendUp: true 
    },
    { 
      label: 'MRR Estimé', 
      value: `${(stats?.counts.subscriptions || 0) * 29}€`, 
      icon: Activity, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10',
      trend: '+8%',
      trendUp: true 
    },
  ];

  return (
    <div className="space-y-10 pb-20 page-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-main tracking-tight">Admin Dashboard</h1>
              <p className="text-dim text-lg">Suivi global des performances du produit</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Système Opérationnel
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card relative overflow-hidden group hover:border-red-500/30 transition-all duration-500"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] -mr-16 -mt-16 opacity-30 group-hover:opacity-60 transition-opacity`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border border-glass-border`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              
              <p className="text-sm font-medium text-dim mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-main">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Workspaces */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-main flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-500" />
            Workspaces Récents
          </h2>
          <div className="glass-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-glass-border bg-bg-tertiary/50">
                    <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Workspace</th>
                    <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Propriétaire</th>
                    <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {stats?.recentWorkspaces.map((ws) => (
                    <tr key={ws._id} className="hover:bg-glass-hover transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            {ws.settings?.icon ? <Activity className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-main">{ws.name}</p>
                            <p className="text-[10px] text-dim uppercase">{ws.useCase}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/users/${ws.owner?._id}`}>
                          <div className="flex items-center gap-2 group/owner cursor-pointer">
                            <div className="w-6 h-6 rounded-full bg-bg-deep flex items-center justify-center overflow-hidden ring-1 border border-glass-border group-hover/owner:ring-red-500/50 transition-all">
                              {ws.owner?.avatar ? (
                                <Image src={ws.owner.avatar} alt="" width={24} height={24} className="object-cover" />
                              ) : (
                                <Users className="w-3 h-3 text-dim" />
                              )}
                            </div>
                            <span className="text-sm text-dim group-hover/owner:text-red-400 transition-colors">{ws.owner?.firstName} {ws.owner?.lastName}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          ws.subscriptionPlan === 'pro' ? 'bg-indigo-500/20 text-indigo-400' :
                          ws.subscriptionPlan === 'business' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-bg-tertiary text-dim'
                        }`}>
                          {ws.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs ${
                          ws.subscriptionStatus === 'active' ? 'text-green-400' : 'text-dim'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             ws.subscriptionStatus === 'active' ? 'bg-green-400' : 'bg-dim'
                          }`} />
                          {ws.subscriptionStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-glass-hover text-dim hover:text-main transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Use Case Distribution Section */}
          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-bold text-main flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              Répartition des Usages
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
               {stats?.useCaseDistribution.map((item) => (
                 <div key={item._id} className="glass-card flex flex-col items-center text-center p-4 hover:border-red-500/20 transition-all group">
                    <span className="text-[10px] font-bold text-dim uppercase tracking-widest mb-1 group-hover:text-red-500 transition-colors">{item._id || 'Autre'}</span>
                    <span className="text-2xl font-bold text-main">{item.count}</span>
                    <div className="w-full h-1 bg-bg-deep rounded-full mt-3 overflow-hidden">
                       <div 
                         className="h-full bg-red-500" 
                         style={{ width: `${(item.count / (stats.counts.workspaces || 1)) * 100}%` }} 
                       />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Recent Users column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-main flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Derniers Inscrits
          </h2>
          <div className="glass-card space-y-4">
            {stats?.recentUsers.map((u) => (
              <Link key={u._id} href={`/admin/users/${u._id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-glass-hover transition-colors border border-transparent hover:border-glass-border group/u cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 border border-glass-border group-hover/u:ring-red-500/50 transition-all">
                      {u.avatar ? (
                        <Image src={u.avatar} alt="" width={40} height={40} className="object-cover" />
                      ) : (
                        u.firstName[0]
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-main group-hover/u:text-red-400 transition-colors">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-dim truncate max-w-[140px]">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-dim uppercase">Inscrit le</p>
                    <p className="text-[10px] text-main font-bold">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/admin/users" className="block text-center pt-2">
              <button className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest">
                Voir tous les utilisateurs
              </button>
            </Link>
          </div>

          {/* Platform Performance Card */}
          <div className="glass-card bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Statut Plateforme</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dim">Database</span>
                <span className="text-xs text-green-400 font-bold">Sain</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[98%]" />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-dim">Storage API</span>
                <span className="text-xs text-green-400 font-bold">100%</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[100%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
