'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Lock,
  Camera,
  Mail,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Users,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import toast from 'react-hot-toast';
import UsersManagement from '@/components/admin/UsersManagement';
import AccessControl from '@/components/admin/AccessControl';
import Avatar from '@/components/ui/Avatar';
import WorkspaceMembers from '@/components/settings/WorkspaceMembers';
import WorkspaceSettings from '@/components/settings/WorkspaceSettings';

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  workspaceOnly?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { id: 'profile', label: 'Profil Personnel', icon: User },
  { id: 'security', label: 'Sécurité & Accès', icon: Shield },
  { id: 'workspace', label: 'Espace de travail', icon: Briefcase, workspaceOnly: true },
  { id: 'members', label: 'Personnes', icon: Users, workspaceOnly: true },
  { id: 'access', label: 'Accès & Vérifications', icon: ShieldCheck, adminOnly: true },
  { id: 'users', label: 'Gestion des utilisateurs', icon: Users, adminOnly: true },
];

const PRESET_COLORS = [
  'bg-gradient-to-br from-indigo-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-yellow-500 to-amber-600',
  'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  'bg-gradient-to-br from-slate-500 to-zinc-600',
];

export default function SettingsPage() {
  const { user, updateUser, token } = useAuthStore();
  const { currentWorkspace } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null,
    profileColor: user?.profileColor || PRESET_COLORS[0],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (Max 5MB)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Upload en cours...');

    try {
      const response = await fetch('/api/upload?type=avatar', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({ ...prev, avatar: data.url }));
        toast.success('Avatar chargé ! N\'oubliez pas d\'enregistrer.', { id: toastId });
      } else {
        toast.error(data.error || 'Erreur upload', { id: toastId });
      }
    } catch {
      toast.error('Erreur lors de l\'upload', { id: toastId });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = useAuthStore.getState().token;

    try {
      if (activeTab === 'profile') {
         const response = await fetch('/api/users/me', {
             method: 'PATCH',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify(profileData)
         });
         
         const data = await response.json();
         if (data.success) {
             updateUser(data.data);
             toast.success('Profil mis à jour avec succès');
         } else {
             throw new Error(data.error);
         }

      } else if (activeTab === 'security') {
        // Validation des mots de passe
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Veuillez remplir tous les champs du mot de passe');
            setIsSaving(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Les nouveaux mots de passe ne correspondent pas');
            setIsSaving(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
            setIsSaving(false);
            return;
        }
        
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error);
        }

        toast.success(data.message || 'Mot de passe modifié avec succès');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
        console.error('Save error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        toast.error(errorMessage);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 page-fade">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-main tracking-tight">Paramètres</h1>
        <p className="text-dim">Gérez votre profil, vos préférences et la sécurité de votre compte.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <motion.div 
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="hidden lg:block shrink-0 space-y-2"
        >
          <div className="flex justify-end mb-2">
             <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-glass-hover text-dim hover:text-main transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          {sidebarItems
            .filter(item => 
              (!item.adminOnly || user?.role === 'admin') && 
              (!('workspaceOnly' in item) || currentWorkspace)
            )
            .map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden whitespace-nowrap
                ${activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                  : 'text-dim hover:bg-bg-secondary hover:text-main border border-transparent'}
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {activeTab === item.id && isSidebarOpen && (
                <motion.div layoutId="active-pill" className="ml-auto">
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </motion.div>

        {/* Mobile Navigation (Standard Stacked) */}
        <div className="block lg:hidden space-y-2">
           {sidebarItems
            .filter(item => 
              (!item.adminOnly || user?.role === 'admin') && 
              (!('workspaceOnly' in item) || currentWorkspace)
            )
            .map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                  : 'text-dim hover:bg-bg-secondary hover:text-main border border-transparent'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="active-pill-mobile" className="ml-auto">
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card !p-8 space-y-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 border-b border-glass-border pb-8">
                  <div className="relative group">
                    <Avatar 
                        src={profileData.avatar} 
                        fallback={profileData.firstName || user?.firstName || '?'} 
                        color={profileData.profileColor}
                        size="xl" // 24x24 approx
                        className="w-24 h-24 rounded-3xl text-3xl shadow-2xl"
                    />
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-3xl"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange} 
                    />
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-lg font-bold text-main">Photo de profil</h3>
                        <p className="text-sm text-dim">Personnalisez votre apparence sur la plateforme.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                         {/* Color Picker */}
                         <div className="flex items-center gap-2 p-1 rounded-lg bg-bg-tertiary border border-glass-border">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setProfileData({...profileData, profileColor: color})}
                                    className={`w-6 h-6 rounded-full ${color} transition-transform hover:scale-110 ${profileData.profileColor === color ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                />
                            ))}
                         </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-colors"
                      >
                        Uploader une photo
                      </button>
                      {(profileData.avatar || profileData.profileColor) && (
                          <button 
                            onClick={() => setProfileData({...profileData, avatar: null, profileColor: PRESET_COLORS[0]})}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
                          >
                            Réinitialiser
                          </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Prénom</label>
                    <input 
                      type="text" 
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-2.5 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Nom</label>
                    <input 
                      type="text" 
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-2.5 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full pl-12 bg-bg-secondary border border-glass-border rounded-xl px-4 py-2.5 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Bio</label>
                    <textarea 
                      rows={4} 
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="Dites-en un peu plus sur vous..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    Changer le mot de passe
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Mot de passe actuel</label>
                      <input 
                        type="password" 
                        className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Confirmer nouveau mot de passe</label>
                      <input 
                        type="password" 
                        className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-main focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-main font-bold">Authentification à deux facteurs</h4>
                      <p className="text-sm text-dim">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                    </div>
                    <button className="btn-primary scale-90">Activer</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'access' && user?.role === 'admin' && (
              <AccessControl />
            )}

            {activeTab === 'members' && (
              <WorkspaceMembers />
            )}

            {activeTab === 'users' && user?.role === 'admin' && (
              <UsersManagement />
            )}

            {activeTab === 'workspace' && currentWorkspace && (
              <WorkspaceSettings />
            )}

            {/* Footer Actions */}
            <div className="pt-8 border-t border-glass-border flex items-center justify-between mt-8">
                <button className="text-sm font-bold text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Supprimer le compte
                </button>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 rounded-xl border border-glass-border text-main text-sm font-bold hover:bg-glass-hover transition-all">
                        Annuler
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {isSaving ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
