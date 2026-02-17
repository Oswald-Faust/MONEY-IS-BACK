'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  Shield,
  Crown,
  HelpCircle,
  Briefcase,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

const roles = [
  { value: 'user', label: 'Utilisateur', icon: Briefcase, color: 'bg-bg-tertiary text-dim border-glass-border' },
  { value: 'support', label: 'Support', icon: HelpCircle, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'moderator', label: 'Modérateur', icon: Crown, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
];

export default function AdminAccessPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
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
    } catch {
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

  const updateRole = async (userId: string, newRole: string) => {
    if (userId === currentUser?._id) {
      toast.error('Vous ne pouvez pas modifier votre propre rôle');
      return;
    }

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
        setEditingUserId(null);
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getRoleInfo = (role: string) => roles.find(r => r.value === role) || roles[0];

  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter(u => u.role === roleFilter);

  const roleCounts = {
    admin: users.filter(u => u.role === 'admin').length,
    moderator: users.filter(u => u.role === 'moderator').length,
    support: users.filter(u => u.role === 'support').length,
    user: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="space-y-10 pb-20 page-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-main tracking-tight">Contrôle d&apos;Accès</h1>
            <p className="text-dim">Gérer les rôles et permissions des utilisateurs</p>
          </div>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {roles.map((role) => {
          const count = roleCounts[role.value as keyof typeof roleCounts];
          const isActive = roleFilter === role.value;
          return (
            <button
              key={role.value}
              onClick={() => setRoleFilter(isActive ? 'all' : role.value)}
              className={`glass-card text-left transition-all ${
                isActive ? 'border-amber-500/30 ring-1 ring-amber-500/20' : 'hover:border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${role.color} flex items-center justify-center border`}>
                  <role.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-main">{count}</span>
              </div>
              <p className="text-xs font-bold text-dim uppercase tracking-widest">{role.label}s</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-main flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          Gestion des Rôles
          {roleFilter !== 'all' && (
            <span className="text-xs text-amber-400 font-bold uppercase ml-2">
              Filtre: {getRoleInfo(roleFilter).label}
            </span>
          )}
        </h2>
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim group-focus-within:text-amber-400 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-glass-border rounded-2xl text-main placeholder-dim focus:border-amber-500/40 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-glass-border bg-bg-tertiary/50">
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Rôle Actuel</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Workspaces</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider text-right">Modifier le Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        <p className="text-dim text-sm">Chargement...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-dim">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p>Aucun utilisateur trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, index) => {
                    const roleInfo = getRoleInfo(u.role);
                    const isEditing = editingUserId === u._id;
                    const isSelf = u._id === currentUser?._id;

                    return (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-glass-hover transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/admin/users/${u._id}`}>
                            <div className="flex items-center gap-3 cursor-pointer group/user">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 border border-glass-border group-hover/user:ring-amber-500/50 transition-all">
                                {u.avatar ? (
                                  <Image src={u.avatar} alt="" width={40} height={40} className="object-cover" />
                                ) : (
                                  u.firstName?.[0] || '?'
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-main group-hover/user:text-amber-400 transition-colors">
                                  {u.firstName} {u.lastName}
                                  {isSelf && <span className="text-[10px] text-amber-500 ml-2">(vous)</span>}
                                </p>
                                <p className="text-xs text-dim">{u.email}</p>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${roleInfo.color}`}>
                            <roleInfo.icon className="w-3 h-3" />
                            {roleInfo.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-dim">
                          {u.workspacesCount || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-dim">
                            <Calendar className="w-4 h-4" />
                            {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isSelf ? (
                            <span className="text-xs text-dim italic">—</span>
                          ) : isEditing ? (
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {roles.map((r) => (
                                <button
                                  key={r.value}
                                  onClick={() => updateRole(u._id, r.value)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                    r.value === u.role
                                      ? `${r.color} ring-1 ring-amber-500/30`
                                      : 'bg-bg-secondary border-glass-border text-dim hover:text-main hover:bg-bg-tertiary'
                                  }`}
                                >
                                  {r.value === u.role && <Check className="w-3 h-3 inline mr-1" />}
                                  {r.label}
                                </button>
                              ))}
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="px-2 py-1 text-[10px] text-dim hover:text-main transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingUserId(u._id)}
                              className="px-3 py-1.5 rounded-xl bg-bg-secondary border border-glass-border text-xs font-bold text-dim hover:text-amber-400 hover:border-amber-500/30 transition-all"
                            >
                              Changer
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-glass-border flex items-center justify-between">
            <p className="text-xs text-dim">
              Page <span className="font-bold text-main">{page}</span> sur <span className="font-bold text-main">{pagination.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-bg-secondary border border-glass-border text-dim disabled:opacity-30 hover:text-main hover:bg-bg-tertiary transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-bg-secondary border border-glass-border text-dim disabled:opacity-30 hover:text-main hover:bg-bg-tertiary transition-all"
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
