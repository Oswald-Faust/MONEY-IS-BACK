'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import UserSelector from '@/components/ui/UserSelector';

import { useSearchParams } from 'next/navigation';

import type { Objective } from '@/types';

interface CreateObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Objective | null;
  defaultProjectId?: string;
  workspaceId?: string;
}

export default function CreateObjectiveModal({ isOpen, onClose, initialData, defaultProjectId: propProjectId, workspaceId }: CreateObjectiveModalProps) {
  const { projects, addObjective, updateObjective } = useAppStore();
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const searchProjectId = searchParams.get('project');
  const defaultProjectId = propProjectId || searchProjectId;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    checkpoints: [{ id: '1', title: '', completed: false }],
    targetDate: '',
    assignees: [] as string[]
  });


  
  // ... rest of the file


  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Handle assignees: try to get list, fallback to single assignee
        let loadedAssignees: string[] = [];
        if ((initialData as any).assignees && Array.isArray((initialData as any).assignees)) {
            loadedAssignees = (initialData as any).assignees.map((u: any) => typeof u === 'object' ? u._id : u);
        } else if (initialData.assignee) {
            loadedAssignees = [typeof initialData.assignee === 'object' ? (initialData.assignee as any)._id : initialData.assignee];
        }

        setFormData({
          title: initialData.title,
          description: initialData.description || '',
          project: typeof initialData.project === 'object' && initialData.project ? (initialData.project as any)._id : (initialData.project as string) || '',
          priority: initialData.priority as 'low' | 'medium' | 'high',
          checkpoints: initialData.checkpoints || [],
          targetDate: initialData.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '',
          assignees: loadedAssignees
        });
      } else {
        setFormData({
            title: '',
            description: '',
            project: defaultProjectId || '',
            priority: 'medium' as 'low' | 'medium' | 'high',
            checkpoints: [{ id: '1', title: '', completed: false }],
            targetDate: '',
            assignees: []
        });
      }
    }
  }, [isOpen, defaultProjectId, initialData]);

  const addCheckpoint = () => {
    setFormData(prev => ({
      ...prev,
      checkpoints: [
        ...prev.checkpoints,
        { id: Math.random().toString(36).substr(2, 9), title: '', completed: false }
      ]
    }));
  };

  const removeCheckpoint = (id: string) => {
    if (formData.checkpoints.length === 1) return;
    setFormData(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.filter(cp => cp.id !== id)
    }));
  };

  const updateCheckpoint = (id: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.map(cp => cp.id === id ? { ...cp, title } : cp)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Le titre est requis');
    
    setLoading(true);
    try {
      if (!token) {
        toast.error('Vous devez être connecté');
        return;
      }

      const url = initialData ? `/api/objectives?id=${initialData._id}` : '/api/objectives';
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          project: formData.project,
          workspace: workspaceId,
          priority: formData.priority,
          targetDate: formData.targetDate,
          assignees: formData.assignees,
          checkpoints: formData.checkpoints.filter(cp => cp.title.trim() !== ''),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (initialData) {
            updateObjective(data.data._id, data.data);
            toast.success('Objectif mis à jour avec succès');
        } else {
            addObjective(data.data);
            toast.success('Objectif créé avec succès');
        }
        onClose();
        setFormData({
          title: '',
          description: '',
          project: '',
          priority: 'medium',
          targetDate: '',
          assignees: [],
          checkpoints: [{ id: '1', title: '', completed: false }]
        });
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error saving objective:', error);
      toast.error('Erreur lors de la sauvegarde de l\'objectif');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-bg-secondary border border-glass-border rounded-3xl shadow-2xl overflow-hidden hover:!bg-bg-secondary"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-text-main">{initialData ? 'Modifier l\'Objectif' : 'Nouvel Objectif'}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Title & Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Titre de l&apos;objectif</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Lancement Beta v1.0"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main placeholder-text-muted/50 focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Projet associé</label>
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-accent-primary/50 transition-all appearance-none"
                >
                  <option value="">Objectif Global</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted ml-1">Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails de l'objectif..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main placeholder-text-muted/50 focus:border-accent-primary/50 outline-none transition-all resize-none"
              />
            </div>

            {/* Assignee */}
            <div>
               <UserSelector 
                  value={formData.assignees}
                  onChange={(userIds) => setFormData({ ...formData, assignees: userIds })}
                  multiple={true}
               />
            </div>

            {/* Priority & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Priorité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`
                        py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all
                        ${formData.priority === p 
                          ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' 
                          : 'bg-bg-tertiary border-glass-border text-text-muted hover:border-text-dim'}
                      `}
                    >
                      {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Date limite</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-accent-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-text-muted">Checkpoints / Sous-objectifs</label>
                <button
                  type="button"
                  onClick={addCheckpoint}
                  className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {formData.checkpoints.map((cp, index) => (
                  <div key={cp.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-tertiary border border-glass-border flex items-center justify-center text-xs font-bold text-text-muted">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={cp.title}
                      onChange={e => updateCheckpoint(cp.id, e.target.value)}
                      placeholder="Titre du checkpoint..."
                      className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-glass-border rounded-xl text-text-main placeholder-text-muted/40 focus:border-accent-primary/30 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeCheckpoint(cp.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-glass-border bg-bg-secondary/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-glass-hover transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-accent-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? 'Enregistrer' : 'Créer l\'objectif')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
