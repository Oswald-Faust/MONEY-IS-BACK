import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Camera, 
  Trash2, 
  Check, 
  RotateCcw,
  Palette,
  Type,
  Layout,
  LayoutGrid
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import toast from 'react-hot-toast';
import Image from 'next/image';

const WORKSPACE_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
];

const THEMES: { id: 'dark' | 'light', label: string, icon: React.ElementType }[] = [
  { id: 'dark', label: 'Sombre', icon: LayoutGrid },
  { id: 'light', label: 'Clair', icon: Layout },
];

export default function WorkspaceSettings() {
  const { token } = useAuthStore();
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } = useAppStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || '',
    settings: {
      defaultProjectColor: currentWorkspace?.settings?.defaultProjectColor || '#6366f1',
      image: currentWorkspace?.settings?.image || '',
      theme: currentWorkspace?.settings?.theme || 'dark',
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentWorkspace) {
      setFormData({
        name: currentWorkspace.name,
        description: currentWorkspace.description || '',
        settings: {
          defaultProjectColor: currentWorkspace.settings?.defaultProjectColor || '#6366f1',
          image: currentWorkspace.settings?.image || '',
          theme: currentWorkspace.settings?.theme || 'dark',
        }
      });
    }
  }, [currentWorkspace]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (Max 2MB)');
      return;
    }

    const toastId = toast.loading('Chargement de l\'image...');
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('/api/upload?type=workspace-icon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          settings: { ...prev.settings, image: data.url }
        }));
        toast.success('Image chargée ! N\'oubliez pas d\'enregistrer.', { id: toastId });
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload', { id: toastId });
      }
    } catch {
      toast.error('Erreur réseau lors de l\'upload', { id: toastId });
    }
  };

  const handleSave = async () => {
    if (!currentWorkspace || !token) return;
    if (!formData.name.trim()) {
      toast.error('Le nom du workspace est requis');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Update both the current workspace and the list of workspaces in the store
        setCurrentWorkspace(data.data);
        
        // We also need to update the workspaces list to reflect changes in selection menu
        const refreshRes = await fetch('/api/workspaces', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
            setWorkspaces(refreshData.data);
        }

        toast.success('Paramètres du workspace mis à jour');
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
      if (!currentWorkspace || !token) return;
      
      const confirmMsg = `Êtes-vous ABSOLUMENT sûr de vouloir supprimer "${currentWorkspace.name}" ? Cette action est irréversible et supprimera TOUS les projets et tâches associés.`;
      
      if (!window.confirm(confirmMsg)) return;
      
      const secondConfirm = window.prompt('Pour confirmer, tapez le nom du workspace ci-dessous :');
      if (secondConfirm !== currentWorkspace.name) {
          toast.error('Le nom ne correspond pas. Suppression annulée.');
          return;
      }

      const toastId = toast.loading('Suppression en cours...');
      try {
          const response = await fetch(`/api/workspaces/${currentWorkspace._id}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          const data = await response.json();
          if (data.success) {
              toast.success('Workspace supprimé', { id: toastId });
              // Redirect to dashboard or first available workspace
              window.location.href = '/dashboard';
          } else {
              toast.error(data.error || 'Erreur lors de la suppression', { id: toastId });
          }
      } catch {
          toast.error('Erreur de connexion', { id: toastId });
      }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          Paramètres du Workspace
        </h2>
        <p className="text-sm text-gray-500">Personnalisez l&apos;identité et l&apos;apparence de votre espace de travail.</p>
      </div>

      <div className="space-y-8">
        {/* Workspace Identity Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/5 pb-10">
          <div className="relative group">
            <div 
              className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center border-2 border-dashed border-white/20 group-hover:border-indigo-500/50 transition-all overflow-hidden relative"
              style={{ backgroundColor: !formData.settings.image ? formData.settings.defaultProjectColor : 'transparent' }}
            >
              {formData.settings.image ? (
                <Image 
                  src={formData.settings.image} 
                  alt="Workspace Logo" 
                  fill
                  className="object-cover" 
                />
              ) : (
                <span className="text-3xl font-bold text-white uppercase">{formData.name.substring(0, 2)}</span>
              )}
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Nom du Workspace</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Mon équipe géniale"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Description (Optionnelle)</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Décrivez votre espace de travail..."
              />
            </div>
          </div>
        </div>

        {/* Global Appearance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <Palette className="w-4 h-4" /> Couleur par défaut
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {WORKSPACE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({
                    ...formData, 
                    settings: { ...formData.settings, defaultProjectColor: color }
                  })}
                  className={`w-full aspect-square rounded-xl transition-all hover:scale-105 relative flex items-center justify-center ${formData.settings.defaultProjectColor === color ? 'ring-2 ring-white ring-offset-4 ring-offset-[#0f0f13]' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                >
                  {formData.settings.defaultProjectColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 italic mt-2">Cette couleur sera utilisée pour vos projets par défaut et votre avatar de workspace.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Thème Visuel
            </h3>
            <div className="flex gap-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({
                    ...formData,
                    settings: { ...formData.settings, theme: theme.id }
                  })}
                  className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                    formData.settings.theme === theme.id 
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-500/5' 
                      : 'bg-white/5 border-white/10 text-dim hover:text-white'
                  }`}
                >
                  <theme.icon className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-500">Zone de danger</h4>
            <p className="text-xs text-gray-500">Ces actions sont irréversibles.</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
             <button 
                onClick={handleDeleteWorkspace}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer le Workspace
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isSaving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                         <RotateCcw className="w-4 h-4" />
                    </motion.div>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
