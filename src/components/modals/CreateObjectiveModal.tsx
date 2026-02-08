'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import toast from 'react-hot-toast';

interface CreateObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateObjectiveModal({ isOpen, onClose }: CreateObjectiveModalProps) {
  const { projects, addObjective } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetDate: '',
    checkpoints: [{ id: '1', title: '', completed: false }]
  });

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
      const selectedProject = projects.find(p => p._id === formData.project);
      
      const newObjective = {
        _id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description,
        project: formData.project,
        projectName: selectedProject?.name,
        projectColor: selectedProject?.color,
        creator: '1',
        progress: 0,
        checkpoints: formData.checkpoints.filter(cp => cp.title.trim() !== ''),
        status: 'not_started' as const,
        priority: formData.priority,
        targetDate: formData.targetDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addObjective(newObjective);
      toast.success('Objectif créé avec succès');
      onClose();
      setFormData({
        title: '',
        description: '',
        project: '',
        priority: 'medium',
        targetDate: '',
        checkpoints: [{ id: '1', title: '', completed: false }]
      });
    } catch {
      toast.error('Erreur lors de la création de l\'objectif');
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
          className="relative w-full max-w-2xl bg-[#12121a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Nouvel Objectif</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Title & Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Titre de l&apos;objectif</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Lancement Beta v1.0"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Projet associé</label>
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all appearance-none"
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
              <label className="text-sm font-medium text-gray-400 ml-1">Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails de l'objectif..."
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 outline-none transition-all resize-none"
              />
            </div>

            {/* Priority & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Priorité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`
                        py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all
                        ${formData.priority === p 
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                          : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10'}
                      `}
                    >
                      {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Date limite</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-gray-400">Checkpoints / Sous-objectifs</label>
                <button
                  type="button"
                  onClick={addCheckpoint}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {formData.checkpoints.map((cp, index) => (
                  <div key={cp.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-xs font-bold text-gray-500">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={cp.title}
                      onChange={e => updateCheckpoint(cp.id, e.target.value)}
                      placeholder="Titre du checkpoint..."
                      className="flex-1 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-700 focus:border-indigo-500/30 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeCheckpoint(cp.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer l\'objectif'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
