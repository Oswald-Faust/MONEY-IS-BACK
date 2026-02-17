'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Building2, 
  FolderKanban, 
  CheckCircle2, 
  Activity, 
  Shield, 
  Clock,
  Zap,
  Crown,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '@/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface UserDetailData {
  user: any;
  workspaces: any[];
  projects: any[];
  stats: {
    totalWorkspaces: number;
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    productivity: number;
  };
  recentLogs: any[];
}

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { token } = useAuthStore();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error(json.error || 'Erreur lors du chargement');
        }
      } catch (_err: any) {
        toast.error('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) fetchUserDetails();
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { user, workspaces, stats, recentLogs } = data;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'moderator': return <Crown className="w-4 h-4 text-orange-500" />;
      case 'support': return <HelpCircle className="w-4 h-4 text-blue-500" />;
      default: return <Briefcase className="w-4 h-4 text-dim" />;
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'moderator': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'support': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-white/5 text-dim border-white/10';
    }
  };

  return (
    <div className="space-y-8 page-fade pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-glass-hover rounded-xl text-dim hover:text-main transition-colors border border-glass-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-main">Profil Utilisateur</h1>
            <p className="text-dim text-sm">Informations détaillées et activité</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-bg-secondary border border-glass-border rounded-xl text-sm font-bold text-dim hover:text-main hover:bg-bg-tertiary transition-all">
            Désactiver
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
            Actions Admin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card flex flex-col items-center text-center"
          >
            <div className="relative mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-glass-border">
                {user.avatar ? (
                  <Image src={user.avatar} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-4xl font-bold text-white">
                    {user.firstName[0]}
                  </div>
                )}
              </div>
              <div className={`absolute bottom-0 right-0 p-2 rounded-full border-2 border-bg-primary ${getRoleStyle(user.role)}`}>
                {getRoleIcon(user.role)}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-main mb-1">{user.firstName} {user.lastName}</h2>
            <div className="flex items-center gap-2 text-dim text-sm mb-6">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>

            <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getRoleStyle(user.role)} mb-8`}>
              {user.role}
            </div>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-glass-border pt-8">
              <div className="space-y-1">
                <p className="text-[10px] text-dim font-black uppercase tracking-widest">Inscrit le</p>
                <div className="flex items-center justify-center gap-2 text-main font-medium">
                  <Calendar className="w-4 h-4 text-red-400" />
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="space-y-1 border-l border-glass-border text-center">
                <p className="text-[10px] text-dim font-black uppercase tracking-widest">Productivité</p>
                <div className="flex items-center justify-center gap-2 text-main font-medium">
                  <Activity className="w-4 h-4 text-green-400" />
                  {stats.productivity}%
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Statistiques Globales
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Workspaces', value: stats.totalWorkspaces, icon: Building2, color: 'text-blue-400' },
                { label: 'Projets', value: stats.totalProjects, icon: FolderKanban, color: 'text-indigo-400' },
                { label: 'Tâches Totales', value: stats.totalTasks, icon: Clock, color: 'text-purple-400' },
                { label: 'Tâches Terminées', value: stats.completedTasks, icon: CheckCircle2, color: 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg-deep/50 border border-glass-border rounded-xl hover:bg-bg-deep transition-colors">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm text-dim">{stat.label}</span>
                  </div>
                  <span className="text-main font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Content Tabs Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Workspaces List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-main flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Workspaces ({workspaces.length})
              </h3>
              <Link href={`/admin/workspaces?userId=${id}`} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest transition-colors">
                Voir tout
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map((ws: any) => (
                <div key={ws._id} className="p-4 bg-bg-deep/30 border border-glass-border rounded-2xl hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      ws.subscriptionPlan === 'pro' ? 'bg-blue-500/10 text-blue-400 border border-blue-400/20' :
                      ws.subscriptionPlan === 'business' ? 'bg-purple-500/10 text-purple-400 border border-purple-400/20' :
                      'bg-bg-tertiary text-dim border border-glass-border'
                    }`}>
                      {ws.subscriptionPlan}
                    </div>
                  </div>
                  <h4 className="text-main font-bold group-hover:text-indigo-400 transition-colors">{ws.name}</h4>
                  <p className="text-xs text-dim mb-4">{ws.useCase}</p>
                  <div className="flex items-center justify-between text-[10px] text-dim uppercase font-black">
                    <span>{ws.members?.length || 1} Membres</span>
                    <span className={ws.subscriptionStatus === 'active' ? 'text-green-500' : ''}>{ws.subscriptionStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Logs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
             <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              Activités Récentes
            </h3>
            <div className="space-y-1">
              {recentLogs.length === 0 ? (
                <p className="text-dim text-center py-8">Aucune activité enregistrée</p>
              ) : (
                recentLogs.map((log: any) => (
                  <div key={log._id} className="flex items-center gap-4 p-4 hover:bg-glass-hover rounded-xl transition-colors border-b border-glass-border last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.status === 'error' ? 'bg-red-500/10 text-red-500' :
                      log.status === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">{log.action}</p>
                      <p className="text-xs text-dim truncate">{log.details}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-main">{new Date(log.createdAt).toLocaleDateString('fr-FR')}</p>
                      <p className="text-[10px] text-dim">{new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
