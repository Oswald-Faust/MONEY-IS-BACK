'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore, useAuthStore } from '@/store';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  UserPlus, 
  Trash2, 
  Users,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import UserSelector from '@/components/ui/UserSelector';

interface ProjectMemberStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  estimatedTime: number;
  timeSpent: number;
  completionRate: number;
}

interface ProjectMember {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  role: 'admin' | 'editor';
  joinedAt: string;
  stats: ProjectMemberStats;
}

export default function ProjectTeamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { projects } = useAppStore();
  
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = useMemo(() => projects.find(p => p._id === id), [projects, id]);

  const fetchMembers = useCallback(async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/members?projectId=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.members);
      } else {
        toast.error(data.error || 'Erreur lors du chargement des membres');
        // If access denied, redirect?
        if (res.status === 403 || res.status === 401) {
             router.push(`/projects/${id}`);
        }
      }
    } catch (error) {
       console.error(error);
       toast.error('Erreur connexion');
    } finally {
      setLoading(false);
    }
  }, [token, id, router]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberId) {
        toast.error('Veuillez sélectionner un utilisateur');
        return;
    }

    setIsSubmitting(true);
    try {
        const res = await fetch('/api/projects/members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                projectId: id,
                userId: newMemberId,
                role: newMemberRole
            })
        });
        const data = await res.json();
        if (data.success) {
            toast.success('Membre ajouté avec succès');
            setNewMemberId('');
            setIsAddingMember(false);
            fetchMembers();
        } else {
            toast.error(data.error || 'Erreur lors de l\'ajout');
        }
    } catch {
        toast.error('Erreur serveur');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre du projet ?')) return;
    
    try {
        const res = await fetch('/api/projects/members', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                projectId: id,
                userId
            })
        });
        const data = await res.json();
        if (data.success) {
            toast.success('Membre retiré');
            fetchMembers(); // Refresh list
        } else {
            toast.error(data.error || 'Erreur lors de la suppression');
        }
    } catch {
        toast.error('Erreur serveur');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
     try {
        const res = await fetch('/api/projects/members', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                projectId: id,
                userId,
                role: newRole
            })
        });
        const data = await res.json();
        if (data.success) {
            toast.success('Rôle mis à jour');
            fetchMembers();
        } else {
             toast.error(data.error || 'Erreur mise à jour rôle');
        }
     } catch {
         toast.error('Erreur serveur');
     }
  };

  if (!project) return null;

  return (
    <div className="page-fade space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/projects/${id}`)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-dim hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-dim uppercase tracking-widest">Projet</span>
                <span className="w-1 h-1 rounded-full bg-loading-bar"></span>
                <span className="text-xs font-bold text-dim uppercase tracking-widest">Équipe</span>
            </div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-400" />
              Gestion de l&apos;équipe
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddingMember(!isAddingMember)}
          className={`btn-primary flex items-center gap-2 ${isAddingMember ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isAddingMember ? (
              <>Annuler</>
          ) : (
              <>
                <UserPlus className="w-5 h-5" />
                AJOUTER UN MEMBRE
              </>
          )}
        </button>
      </div>

      {/* Add Member Form */}
      {isAddingMember && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-l-4 border-indigo-500"
        >
            <h3 className="text-lg font-bold text-white mb-4">Ajouter un membre au projet</h3>
            <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <UserSelector 
                        value={newMemberId}
                        onChange={setNewMemberId}
                        label="Sélectionner un utilisateur"
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                    <select 
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as any)}
                        className="w-full px-4 py-3 bg-glass-bg border border-glass-border rounded-xl text-main focus:outline-none focus:border-indigo-500"
                    >
                        <option value="editor">Éditeur</option>
                        <option value="admin">Administrateur</option>
                    </select>
                </div>
                <button 
                    type="submit"
                    disabled={isSubmitting || !newMemberId}
                    className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[46px]"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ajouter'}
                </button>
            </form>
        </motion.div>
      )}

      {/* Team List & Stats */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
            <div className="text-center py-20 text-dim">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                Chargement de l&apos;équipe...
            </div>
        ) : members.length === 0 ? (
            <div className="text-center py-20 text-dim">
                Aucun membre dans ce projet (à part le propriétaire ?)
            </div>
        ) : (
            members.map((member) => (
                <motion.div 
                    key={member.user?._id || Math.random()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 flex flex-col lg:flex-row items-center gap-6 group hover:bg-white/[0.02] transition-colors"
                >
                    {/* User Info */}
                    <div className="flex items-center gap-4 min-w-[250px] w-full lg:w-auto">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                {member.user?.avatar ? (
                                    <Image src={member.user.avatar} alt={member.user.firstName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-glass-bg">
                                        {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {member.user?.firstName} {member.user?.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-dim">{member.user?.email}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    member.role === 'admin' 
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                    {member.role === 'admin' ? 'Administrateur' : 'Éditeur'}
                                </span>
                                {project.owner === member.user?._id && (
                                     <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        Propriétaire
                                     </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-xs text-dim uppercase tracking-wider font-bold mb-1">Tâches</div>
                            <div className="text-xl font-bold text-white">{member.stats.totalTasks}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-xs text-dim uppercase tracking-wider font-bold mb-1">En cours</div>
                            <div className="text-xl font-bold text-blue-400">{member.stats.inProgressTasks}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-xs text-dim uppercase tracking-wider font-bold mb-1">Terminées</div>
                            <div className="text-xl font-bold text-green-400">{member.stats.completedTasks}</div>
                        </div>
                         <div className="bg-white/5 rounded-xl p-3 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-green-500/5" style={{ height: `${member.stats.completionRate}%`, bottom: 0, top: 'auto', zIndex: 0 }}></div>
                            <div className="text-xs text-dim uppercase tracking-wider font-bold mb-1 relative z-10">Succès</div>
                            <div className="text-xl font-bold text-emerald-400 relative z-10">{member.stats.completionRate}%</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 w-full lg:w-auto justify-end lg:justify-center border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                         {project.owner !== member.user?._id && (
                             <>
                                <select 
                                    value={member.role}
                                    onChange={(e) => handleChangeRole(member.user._id, e.target.value)}
                                    className="bg-black/20 text-xs text-dim border border-white/10 rounded-lg p-2 focus:outline-none"
                                >
                                    <option value="editor">Éditeur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                                <button 
                                    onClick={() => handleRemoveMember(member.user._id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-dim hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                                    title="Retirer du projet"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="lg:hidden text-sm">Retirer</span>
                                </button>
                             </>
                         )}
                    </div>
                </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
