'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Trash2, 
  Shield, 
  Crown, 
  Building2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Briefcase,
  HelpCircle,
  Calendar,
  Eye
} from 'lucide-react';
import { useAuthStore } from '@/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const { token, user: currentUser } = useAuthStore();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/users?page=${page}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, token]);

  const toggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser?._id) {
      toast.error('Vous ne pouvez pas modifier votre propre rôle');
      return;
    }

    const roles = ['user', 'moderator', 'support', 'admin'];
    const currentIndex = roles.indexOf(currentRole);
    const nextIndex = (currentIndex + 1) % roles.length;
    const newRole = roles[nextIndex];

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        toast.success(`Rôle mis à jour: ${newRole}`);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?._id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('Utilisateur supprimé');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-8 page-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-main tracking-tight">Utilisateurs</h1>
            <p className="text-dim">Gérer et modérer les comptes membres</p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-main placeholder-dim focus:border-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Workspaces</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-dim text-sm">Chargement des membres...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-dim">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p>Aucun utilisateur trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/admin/users/${u._id}`}>
                          <div className="flex items-center gap-3 cursor-pointer group/user">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-white/5 group-hover/user:ring-indigo-500/50 transition-all">
                              {u.avatar ? (
                                <Image src={u.avatar} alt="" width={40} height={40} className="object-cover" />
                              ) : (
                                u.firstName?.[0] || '?'
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-main group-hover/user:text-indigo-400 transition-colors">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-dim">{u.email}</p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRole(u._id, u.role)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' :
                            u.role === 'moderator' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20' :
                            u.role === 'support' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20' :
                            'bg-white/5 text-dim border-white/10 hover:text-main hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : 
                             u.role === 'moderator' ? <Crown className="w-3 h-3" /> :
                             u.role === 'support' ? <HelpCircle className="w-3 h-3" /> :
                             <Briefcase className="w-3 h-3" />}
                            {u.role}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/workspaces?userId=${u._id}`}>
                          <div className="flex items-center gap-2 text-sm text-dim hover:text-indigo-400 transition-colors cursor-pointer group/ws">
                            <Building2 className="w-4 h-4 group-hover/ws:scale-110 transition-transform" />
                            {u.workspacesCount || 0}
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover/ws:opacity-100 transition-all" />
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-dim">
                          <Calendar className="w-4 h-4" />
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/users/${u._id}`}>
                            <button className="p-2 rounded-xl hover:bg-white/5 text-dim hover:text-main transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => deleteUser(u._id)}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-dim hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-xl hover:bg-white/5 text-dim hover:text-main transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-dim">
              Affichage de <span className="font-bold text-main">{users.length}</span> sur <span className="font-bold text-main">{pagination.total}</span> membres
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-dim disabled:opacity-30 hover:text-main hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      page === i + 1 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-dim hover:text-main hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-dim disabled:opacity-30 hover:text-main hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
