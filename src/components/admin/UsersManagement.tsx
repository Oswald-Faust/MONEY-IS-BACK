'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Crown, UserCheck, Calendar, Mail, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
}

export default function UsersManagement() {
  const { token, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Réinitialiser la confirmation après 5 secondes
    if (confirmDeleteId) {
      const timer = setTimeout(() => {
        setConfirmDeleteId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.error || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirmDeleteId || confirmDeleteId !== userId) {
      // Première fois : demander confirmation
      setConfirmDeleteId(userId);
      return;
    }

    // Deuxième fois : confirmer et supprimer
    try {
      setDeletingUserId(userId);
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Utilisateur supprimé avec succès');
        // Retirer l'utilisateur de la liste
        setUsers(users.filter(u => u._id !== userId));
        setConfirmDeleteId(null);
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gestion des utilisateurs</h3>
            <p className="text-sm text-dim">{users.length} utilisateur{users.length > 1 ? 's' : ''} au total</p>
          </div>
        </div>
        
        <button
          onClick={() => useAppStore.getState().setCreateUserModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/20 active:scale-95"
        >
          <UserCheck className="w-4 h-4" />
          Créer un utilisateur
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dim focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-dim">
            Aucun utilisateur trouvé
          </div>
        ) : (
          filteredUsers.map((userData, index) => (
            <motion.div
              key={userData._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt={userData.firstName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      `${userData.firstName[0]}${userData.lastName[0]}`
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white truncate">
                        {userData.firstName} {userData.lastName}
                      </h4>
                      {userData.role === 'admin' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Admin</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-dim">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{userData.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Inscrit le {formatDate(userData.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Badge & Delete Button */}
                <div className="flex items-center gap-3">
                  {userData.role === 'user' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs font-bold">Utilisateur</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-bold">Administrateur</span>
                    </div>
                  )}

                  {/* Delete Button */}
                  {userData._id !== currentUser?._id && (
                    <button
                      onClick={() => handleDeleteUser(userData._id)}
                      disabled={deletingUserId === userData._id}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${confirmDeleteId === userData._id
                          ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse'
                          : 'bg-white/5 border border-white/10 text-dim hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'}
                        ${deletingUserId === userData._id ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      title={confirmDeleteId === userData._id ? 'Cliquer à nouveau pour confirmer' : 'Supprimer cet utilisateur'}
                    >
                      {deletingUserId === userData._id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : confirmDeleteId === userData._id ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-xs text-dim">Total utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-xs text-dim">Administrateurs</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'user').length}</p>
              <p className="text-xs text-dim">Utilisateurs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
