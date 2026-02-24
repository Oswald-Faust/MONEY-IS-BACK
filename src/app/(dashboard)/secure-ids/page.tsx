'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Key, 
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useAuthStore } from '@/store';
import { Project } from '@/types';
import toast from 'react-hot-toast';

interface SecureId {
  _id: string;
  title: string;
  username?: string;
  password?: string; // Only present when revealed
  link?: string;
  notes?: string;
  category?: string;
  createdAt: string;
}

export default function SecureIdsPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const { projects, currentWorkspace, updateProject } = useAppStore();
  const { token, user } = useAuthStore();
  const router = useRouter();

  // State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data
  const [secureIds, setSecureIds] = useState<SecureId[]>([]);
  const [revealedIds, setRevealedIds] = useState<Record<string, string>>({}); // id -> password
  
  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    username: '',
    password: '',
    link: '',
    notes: '',
    category: 'Général'
  });

  // Project Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newProjectPassword, setNewProjectPassword] = useState('');
  const [showNewProjectPassword, setShowNewProjectPassword] = useState(false);

  // Check if Workspace Admin
  const isWorkspaceAdmin = React.useMemo(() => {
    if (!currentWorkspace || !user) return false;
    if (currentWorkspace.owner === user._id) return true;
    const member = currentWorkspace.members?.find((m) => {
      const memberUserId = typeof m.user === 'string' ? m.user : m.user._id;
      return memberUserId === user._id;
    });
    return member?.role === 'admin';
  }, [currentWorkspace, user]);

  const fetchSecureIds = React.useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const res = await fetch(`/api/secure-ids?project=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 403) {
          setError('Accés refusé. Vous devez être administrateur du projet.');
          setIsUnlocked(false); // Re-lock or show error state
          return;
      }

      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSecureIds(data);
    } catch (error) {
        console.error(error);
        setError('Erreur lors du chargement des données.');
    }
  }, [projectId, token]);

  // Fetch initial list if unlocked (or check session)
  useEffect(() => {
    if (isUnlocked && projectId) {
      fetchSecureIds();
    }
  }, [isUnlocked, projectId, fetchSecureIds]);

  const handleUnlock = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: adminPassword, projectId }),
      });

      const data = await res.json();

      if (data.success) {
        setIsUnlocked(true);
      } else {
        setError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [adminPassword, token, projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.password) return;

    try {
      const res = await fetch('/api/secure-ids', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newItem, projectId }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewItem({ title: '', username: '', password: '', link: '', notes: '', category: 'Général' });
        fetchSecureIds();
      } else {
          // Handle error
          const d = await res.json();
          alert(d.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
        const res = await fetch(`/api/secure-ids/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setSecureIds(prev => prev.filter(i => i._id !== id));
        }
    } catch (err) {
        console.error(err);
    }
  };

  const toggleReveal = async (id: string) => {
    if (revealedIds[id]) {
      // Hide
      const newRevealed = { ...revealedIds };
      delete newRevealed[id];
      setRevealedIds(newRevealed);
    } else {
      // Show (Fetch)
      try {
        const res = await fetch(`/api/secure-ids/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           setRevealedIds(prev => ({ ...prev, [id]: data.password }));
        }
      } catch (err) {
          console.error(err);
      }
    }
  };

  const handleUpdateProjectPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectPassword || !projectId || !token) return;

    try {
      const res = await fetch(`/api/projects?id=${projectId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ securePassword: newProjectPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        updateProject(projectId, data.data);
        toast.success('Mot de passe du projet mis à jour !');
        setIsPasswordModalOpen(false);
        setNewProjectPassword('');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur de connexion');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-8 flex flex-col items-center gap-6 border-red-500/20 shadow-red-900/10"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-main mb-2">Zone sécurisée</h2>
            <p className="text-text-dim">
              Cette section contient des informations sensibles.
              Veuillez confirmer votre identité pour continuer.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Mot de passe sécurisé</label>
              <div className="relative">
                <input 
                  type={showAdminPassword ? "text" : "password"} 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Votre mot de passe..."
                  className="w-full bg-bg-tertiary border border-glass-border rounded-xl px-4 py-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-red-500/50 transition-all pl-10 pr-10"
                  autoFocus
                />
                <Key className="w-5 h-5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-main transition-colors"
                >
                  {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-200 text-sm flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !adminPassword}
              className="w-full btn-primary bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Vérification...' : 'Déverrouiller le coffre'}
            </button>
          </form>
          
          <button 
            onClick={() => router.back()}
            className="text-sm text-text-dim hover:text-text-main transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </motion.div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="page-fade pb-20 space-y-10">
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto pt-10">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Unlock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-text-main">Sélecteur de Projet Secouru</h1>
          <p className="text-text-dim">
            Les accès sécurisés sont cloisonnés par projet. Veuillez sélectionner un projet pour accéder à ses identifiants confidentiels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <Link key={project._id} href={`/secure-ids?project=${project._id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card p-6 flex items-center gap-4 hover:border-red-500/30 transition-all cursor-pointer group"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                  {project.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-main truncate group-hover:text-red-400 transition-colors">{project.name}</h3>
                  <p className="text-xs text-text-dim">Accéder au coffre-fort</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-text-dim group-hover:text-red-500 rotate-180 transition-all" />
              </motion.div>
            </Link>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full py-20 glass-card flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
              <ShieldAlert className="w-12 h-12 text-text-dim" />
              <div>
                <p className="text-text-main font-bold">Aucun projet trouvé</p>
                <p className="text-text-dim text-sm">Créez d&apos;abord un projet pour y stocker des accès sécurisés.</p>
              </div>
              <button 
                onClick={() => router.push('/projects')}
                className="text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                Gérer les projets
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW
  return (
    <div className="page-fade pb-20 space-y-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-bg-tertiary hover:bg-bg-secondary text-text-dim hover:text-text-main transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                    Confidentiel
                </span>
                <p className="text-xs font-bold text-text-dim uppercase tracking-widest">Coffre-fort du projet</p>
            </div>
            <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
              <Unlock className="w-8 h-8 text-red-500" />
              Accès Sécurisés
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isWorkspaceAdmin && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="p-2.5 rounded-xl bg-bg-tertiary hover:bg-glass-hover text-text-dim hover:text-text-main transition-all border border-glass-border"
              title="Gérer le mot de passe du projet"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            AJOUTER UN ACCÈS
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {secureIds.map((item) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card hover:border-red-500/30 transition-all group relative overflow-hidden"
              >
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                  
                  <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-text-main mb-1 group-hover:text-red-500 transition-colors">{item.title}</h3>
                            <p className="text-xs text-text-dim uppercase tracking-wider">{item.category || 'Général'}</p>
                          </div>
                          
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>

                      <div className="space-y-3">
                          {item.link && (
                              <div className="flex items-center gap-3 text-sm">
                                  <ExternalLink className="w-4 h-4 text-text-muted shrink-0" />
                                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline truncate font-medium">
                                      {item.link}
                                  </a>
                              </div>
                          )}
                          
                          {item.username && (
                            <div className="flex items-center gap-3 text-sm bg-bg-tertiary p-2 rounded-lg border border-glass-border group-hover:border-accent-primary/30 transition-colors">
                                <span className="text-text-dim shrink-0 w-4 font-mono select-none">ID</span>
                                <span className="text-text-main font-mono select-all flex-1 truncate">{item.username}</span>
                                <button 
                                    onClick={() => copyToClipboard(item.username!)}
                                    className="p-1 hover:text-text-main text-text-dim transition-colors"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                          )}

                        <div className="flex items-center gap-3 text-sm bg-red-500/5 p-2 rounded-lg border border-red-500/10 group-hover:border-red-500/20 transition-colors">
                            <span className="text-text-dim shrink-0 w-4 font-mono select-none">PW</span>
                            <div className="flex-1 font-mono text-text-main truncate relative">
                                {revealedIds[item._id] ? (
                                    <span className="text-red-500 dark:text-red-200 font-bold">{revealedIds[item._id]}</span>
                                ) : (
                                    <span className="text-text-muted tracking-[3px] select-none opacity-50">••••••••••••</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => toggleReveal(item._id)}
                                    className="p-1.5 hover:text-text-main text-text-dim transition-colors"
                                    title={revealedIds[item._id] ? "Masquer" : "Révéler"}
                                >
                                    {revealedIds[item._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                {revealedIds[item._id] && (
                                    <button 
                                        onClick={() => copyToClipboard(revealedIds[item._id])}
                                        className="p-1.5 hover:text-text-main text-text-dim transition-colors"
                                        title="Copier"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                      </div>

                      {item.notes && (
                           <div className="pt-2 border-t border-glass-border">
                              <p className="text-sm text-text-muted italic line-clamp-2 hover:line-clamp-none transition-all cursor-help">
                                  {item.notes}
                              </p>
                          </div>
                      )}
                  </div>
              </motion.div>
          ))}
          
          {secureIds.length === 0 && (
               <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-glass-border rounded-2xl">
                  <Lock className="w-12 h-12 mb-4 opacity-20" />
                  <p>Aucun élément sécurisé pour le moment.</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 text-red-400 hover:text-red-300 font-medium"
                  >
                      Ajouter le premier accès
                  </button>
              </div>
          )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsCreateModalOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-card w-full max-w-lg p-0 border-red-500/20 shadow-2xl relative z-10 overflow-hidden"
                >
                    <div className="p-6 border-b border-border-main flex justify-between items-center bg-bg-secondary">
                        <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            Nouvel accès sécurisé
                        </h3>
                        <button onClick={() => setIsCreateModalOpen(false)} className="text-text-dim hover:text-text-main transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleCreate} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-dim uppercase">Titre (Requis)</label>
                            <input 
                                type="text" 
                                value={newItem.title}
                                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                placeholder="Ex: Accès Base de Données Prod"
                                className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:border-red-500/50 transition-all"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-dim uppercase">Catégorie</label>
                                <select 
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-red-500/50 transition-all appearance-none"
                                >
                                    <option className="bg-bg-tertiary text-text-main" value="Général">Général</option>
                                    <option className="bg-bg-tertiary text-text-main" value="Serveur">Serveur</option>
                                    <option className="bg-bg-tertiary text-text-main" value="Base de données">Base de données</option>
                                    <option className="bg-bg-tertiary text-text-main" value="Service Tiers">Service Tiers</option>
                                    <option className="bg-bg-tertiary text-text-main" value="Réseaux Sociaux">Réseaux Sociaux</option>
                                    <option className="bg-bg-tertiary text-text-main" value="Email">Email</option>
                                    <option className="bg-bg-tertiary text-text-main" value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-dim uppercase">Lien / URL</label>
                                <input 
                                    type="text" 
                                    value={newItem.link}
                                    onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                                    placeholder="https://..."
                                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:border-red-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-dim uppercase">Nom d&apos;utilisateur / ID</label>
                            <input 
                                type="text" 
                                value={newItem.username}
                                onChange={(e) => setNewItem({...newItem, username: e.target.value})}
                                placeholder="admin@example.com"
                                className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:border-red-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-dim uppercase text-red-500">Mot de passe / Secret (Requis)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={newItem.password}
                                    onChange={(e) => setNewItem({...newItem, password: e.target.value})}
                                    placeholder="Le secret à protéger..."
                                    className="w-full bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-text-main placeholder:text-red-500/30 focus:outline-none focus:border-red-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-dim uppercase">Notes</label>
                            <textarea 
                                value={newItem.notes}
                                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                                placeholder="Détails supplémentaires..."
                                className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:border-red-500/50 transition-all min-h-[80px] resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-text-dim hover:text-text-main hover:bg-bg-tertiary transition-all font-medium"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                disabled={!newItem.title || !newItem.password}
                                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Enregistrer la clé
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Project Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsPasswordModalOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-card w-full max-w-md p-0 border-indigo-500/20 shadow-2xl relative z-10 overflow-hidden"
                >
                    <div className="p-6 border-b border-glass-border flex justify-between items-center bg-bg-secondary">
                        <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <Key className="w-5 h-5 text-indigo-400" />
                            Mot de passe du projet
                        </h3>
                        <button onClick={() => setIsPasswordModalOpen(false)} className="text-text-dim hover:text-text-main transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdateProjectPassword} className="p-6 space-y-4">
                        <p className="text-sm text-text-dim">
                            Définissez un mot de passe spécifique pour ce projet. S&apos;il est vide, le mot de passe de votre compte sera utilisé par défaut.
                        </p>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-dim uppercase">Nouveau mot de passe</label>
                            <div className="relative">
                                <input 
                                    type={showNewProjectPassword ? "text" : "password"} 
                                    value={newProjectPassword}
                                    onChange={(e) => setNewProjectPassword(e.target.value)}
                                    placeholder="Nouveau secret..."
                                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-indigo-500/50 transition-all pr-12"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewProjectPassword(!showNewProjectPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-main"
                                >
                                    {showNewProjectPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-text-dim hover:text-text-main hover:bg-bg-tertiary transition-all font-medium"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                disabled={!newProjectPassword}
                                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Mettre à jour
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
