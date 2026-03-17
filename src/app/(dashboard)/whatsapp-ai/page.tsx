'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageCircle, Link as LinkIcon, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function WhatsAppAIPage() {
  const { currentWorkspace, setCurrentWorkspace } = useAppStore();
  const { token } = useAuthStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Feature states
  const [features, setFeatures] = useState({
    autoReply: true,
    leadQualif: true,
    scheduling: false
  });
  const [isUpdatingFeature, setIsUpdatingFeature] = useState<string | null>(null);

  // Sync state with workspace
  useEffect(() => {
    if (currentWorkspace?.aiProfile) {
      setIsConnected(!!currentWorkspace.aiProfile.whatsappEnabled);
      setFeatures({
        autoReply: currentWorkspace.aiProfile.whatsappAutoReply ?? true,
        leadQualif: currentWorkspace.aiProfile.whatsappLeadQualif ?? true,
        scheduling: currentWorkspace.aiProfile.whatsappScheduling ?? false,
      });
    }
  }, [currentWorkspace]);

  const handleConnect = async () => {
    if (!currentWorkspace || !token) return;

    setIsLoading(true);
    const newState = !isConnected;

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aiProfile: {
            whatsappEnabled: newState
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsConnected(newState);
        setCurrentWorkspace(data.data);
        toast.success(newState ? 'Numéro connecté avec succès' : 'Numéro déconnecté');
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeature = async (key: keyof typeof features) => {
    if (!currentWorkspace || !token) return;

    const newFeatures = { ...features, [key]: !features[key] };
    setIsUpdatingFeature(key);

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aiProfile: {
            whatsappAutoReply: newFeatures.autoReply,
            whatsappLeadQualif: newFeatures.leadQualif,
            whatsappScheduling: newFeatures.scheduling,
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFeatures(newFeatures);
        setCurrentWorkspace(data.data);
        toast.success('Configuration mise à jour');
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setIsUpdatingFeature(null);
    }
  };

  return (
    <div className="page-fade space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight">
              Connexion WhatsApp & IA
            </h1>
          </div>
          <p className="text-text-dim text-lg">
            Gérez votre assistant virtuel et connectez-le directement à WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 relative overflow-hidden group border border-glass-border hover:border-emerald-500/20 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-colors duration-500" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              Statut de la connexion
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {isConnected ? 'CONNECTÉ' : 'DÉCONNECTÉ'}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`flex items-center gap-4 p-4 rounded-xl bg-glass-bg border transition-all ${isConnected ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-glass-border'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isConnected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-text-dim'}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-main">Numéro WhatsApp</p>
                <p className="text-xs text-text-dim font-mono mt-0.5">{isConnected ? '+33 6 12 34 56 78' : 'Aucun numéro configuré'}</p>
              </div>
              {isConnected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </motion.div>
              )}
            </div>

            <button 
              onClick={handleConnect}
              disabled={isLoading || !currentWorkspace}
              className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                isConnected 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
              } disabled:opacity-70`}
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isConnected ? (
                'Déconnecter le numéro'
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  Connecter mon numéro
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* AI Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-colors duration-500" />
          
          <h2 className="text-xl font-semibold flex items-center gap-3 mb-8">
            <Zap className="w-5 h-5 text-purple-400" />
            Assistant IA Edwin
          </h2>

          <div className="space-y-4">
            <FeatureToggle 
              title="Réponses automatiques" 
              desc="Edwin répond aux questions fréquentes." 
              active={features.autoReply} 
              onToggle={() => handleToggleFeature('autoReply')}
              isLoading={isUpdatingFeature === 'autoReply'}
            />
            <FeatureToggle 
              title="Qualification des leads" 
              desc="Collecte les informations pertinentes." 
              active={features.leadQualif} 
              onToggle={() => handleToggleFeature('leadQualif')}
              isLoading={isUpdatingFeature === 'leadQualif'}
            />
            <FeatureToggle 
              title="Prise de rendez-vous" 
              desc="Synchronisé avec votre calendrier." 
              active={features.scheduling} 
              onToggle={() => handleToggleFeature('scheduling')}
              isLoading={isUpdatingFeature === 'scheduling'}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureToggle({ 
  title, 
  desc, 
  active, 
  onToggle, 
  isLoading 
}: { 
  title: string, 
  desc: string, 
  active: boolean, 
  onToggle: () => void,
  isLoading?: boolean 
}) {
  return (
    <div 
      onClick={!isLoading ? onToggle : undefined}
      className={`flex items-center justify-between p-4 rounded-xl transition-all border ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer'} ${active ? 'bg-purple-500/5 border-purple-500/20' : 'bg-glass-bg border-transparent hover:border-glass-border'}`}
    >
      <div>
        <p className={`text-sm font-medium transition-colors ${active ? 'text-purple-400' : 'text-text-main'}`}>{title}</p>
        <p className="text-xs text-text-dim mt-0.5">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors relative ${active ? 'bg-purple-500' : 'bg-glass-border'}`}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
        )}
      </div>
    </div>
  );
}
