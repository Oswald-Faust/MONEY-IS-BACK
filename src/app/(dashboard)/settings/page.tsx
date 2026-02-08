'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Smartphone, 
  Globe, 
  Palette,
  Camera,
  Mail,
  Trash2,
  ChevronRight,
  Check,
  CreditCard,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Image from 'next/image';

const sidebarItems = [
  { id: 'profile', label: 'Profil Personnel', icon: User },
  { id: 'security', label: 'Sécurité & Accès', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Préférences', icon: Palette },
  { id: 'billing', label: 'Abonnement', icon: CreditCard },
  { id: 'devices', label: 'Appareils', icon: Smartphone },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Mathias',
    lastName: user?.lastName || 'MERCIER',
    email: user?.email || 'admin@projecthub.com',
    bio: 'Entrepreneur & Designer. Passionné par la productivité et les nouveaux business.',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Paramètres enregistrés avec succès');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 page-fade">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Paramètres</h1>
        <p className="text-dim">Gérez votre profil, vos préférences et la sécurité de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                  : 'text-dim hover:bg-white/5 hover:text-white border border-transparent'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto">
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card !p-8 space-y-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl overflow-hidden relative">
                      {user?.avatar ? (
                        <Image src={user.avatar} alt="Profile" fill className="object-cover" />
                      ) : (
                        'M'
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Photo de profil</h3>
                    <p className="text-sm text-dim">JPG, GIF ou PNG. Max 2MB.</p>
                    <div className="flex gap-2 mt-3">
                      <button className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-colors">
                        Changer
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
                        Supprimer
                      </button>
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
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Nom</label>
                    <input 
                      type="text" 
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full"
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
                        className="w-full pl-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Bio</label>
                    <textarea 
                      rows={4} 
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full"
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
                      <input type="password" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Nouveau mot de passe</label>
                      <input type="password" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Confirmer nouveau mot de passe</label>
                      <input type="password" className="w-full" />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-white font-bold">Authentification à deux facteurs</h4>
                      <p className="text-sm text-dim">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                    </div>
                    <button className="btn-primary scale-90">Activer</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
                <div className="space-y-8">
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest w-fit">
                                Actuel
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white">Project Hub Pro</h3>
                                <p className="text-indigo-100/80">Prochaine facturation : 12 mars 2026</p>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-4xl font-black text-white">49€</span>
                                <span className="text-indigo-100/60 font-bold mb-1">/ mois</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-white tracking-wide uppercase text-xs">Historique des factures</h3>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-dim" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Facture #{2026 - i}-00{i}</p>
                                            <p className="text-xs text-dim">0{i} fév. 2026</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg bg-white/5 hover:text-indigo-400 transition-colors">
                                        <Globe className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'preferences' && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Apparence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Clair', 'Sombre', 'Système'].map((theme) => (
                                <button 
                                    key={theme}
                                    className={`
                                        p-4 rounded-2xl border transition-all text-center space-y-3
                                        ${theme === 'Sombre' 
                                            ? 'bg-indigo-500/10 border-indigo-500/40' 
                                            : 'bg-white/5 border-white/10 hover:border-white/20'}
                                    `}
                                >
                                    <div className={`h-20 w-full rounded-lg ${theme === 'Clair' ? 'bg-white' : 'bg-[#0c0c12]'} border border-white/5 flex items-center justify-center`}>
                                        <div className="w-1/2 h-1 bg-white/10 rounded-full" />
                                    </div>
                                    <span className="text-sm font-bold text-white">{theme}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Langue</h3>
                        <select className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white">
                            <option>Français (FR)</option>
                            <option>English (US)</option>
                            <option>Español (ES)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-8">
                <button className="text-sm font-bold text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Supprimer le compte
                </button>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all">
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
