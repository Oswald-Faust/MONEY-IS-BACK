'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Users, 
  ExternalLink, 
  FolderKanban,
  ArrowLeft,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

function WorkspacesList() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setIsLoading(true);
        const url = userId 
          ? `/api/admin/workspaces?userId=${userId}&search=${search}`
          : `/api/admin/workspaces?search=${search}`;
          
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWorkspaces(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchWorkspaces();
  }, [userId, search, token]);

  return (
    <div className="space-y-8 page-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {userId && (
                <button 
                  onClick={() => router.back()}
                  className="p-1 hover:bg-white/5 rounded-lg text-dim hover:text-main transition-colors mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h1 className="text-3xl font-bold text-main tracking-tight">Workspaces</h1>
            </div>
            <p className="text-dim">
              {userId ? `Espaces de travail de l'utilisateur` : 'Gestion de tous les espaces de travail'}
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher un workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-main placeholder-dim focus:border-indigo-500/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : workspaces.length === 0 ? (
        <div className="glass-card text-center py-20 flex flex-col items-center">
          <Building2 className="w-16 h-16 text-dim opacity-20 mb-4" />
          <h3 className="text-xl font-bold text-main">Aucun workspace trouvé</h3>
          <p className="text-dim">La recherche ne donne aucun résultat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws, index) => (
            <motion.div
              key={ws._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card group hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-main group-hover:text-indigo-400 transition-colors">{ws.name}</h3>
                    <p className="text-xs text-dim uppercase tracking-widest font-bold">{ws.useCase}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  ws.subscriptionPlan === 'pro' ? 'bg-blue-500/10 text-blue-400 border border-blue-400/20' :
                  ws.subscriptionPlan === 'business' ? 'bg-purple-500/10 text-purple-400 border border-purple-400/20' :
                  'bg-white/5 text-dim border border-white/10'
                }`}>
                  {ws.subscriptionPlan}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                  <span className="text-dim flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Propriétaire
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-main font-medium">{ws.owner?.firstName} {ws.owner?.lastName}</span>
                    <div className="w-6 h-6 rounded-full bg-white/5 overflow-hidden">
                      {ws.owner?.avatar ? (
                        <Image src={ws.owner.avatar} alt="" width={24} height={24} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-dim">{ws.owner?.firstName?.[0]}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-dim uppercase font-bold tracking-widest mb-1">Projets</p>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-indigo-400" />
                      <span className="text-lg font-bold text-main">{ws.projectsCount || 0}</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-dim uppercase font-bold tracking-widest mb-1">Membres</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-lg font-bold text-main">{ws.members?.length || 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={`flex items-center gap-1.5 text-xs ${
                    ws.subscriptionStatus === 'active' ? 'text-green-400' : 'text-dim'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      ws.subscriptionStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-dim'
                    }`} />
                    {ws.subscriptionStatus === 'active' ? 'Abonnement Actif' : 'Pas d\'abonnement'}
                  </div>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-dim hover:text-main transition-all group/btn">
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminWorkspacesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <WorkspacesList />
    </Suspense>
  );
}
