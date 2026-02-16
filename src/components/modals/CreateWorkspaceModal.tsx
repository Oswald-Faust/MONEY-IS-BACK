'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Loader2, Palette } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const colorOptions = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Vert', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Rouge', value: '#ef4444' },
];

export default function CreateWorkspaceModal() {
  const { isWorkspaceModalOpen, setWorkspaceModalOpen, setWorkspaces, setCurrentWorkspace, workspaces } = useAppStore();
  const { token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    useCase: 'other' as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du workspace est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          defaultProjectColor: formData.color,
          useCase: formData.useCase,
          theme: 'dark',
          subscriptionPlan: 'starter', // New workspaces always start as starter
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Workspace créé avec succès !');
        // Update workspaces list and switch to new one
        const updatedWorkspaces = [...workspaces, data.data];
        setWorkspaces(updatedWorkspaces);
        setCurrentWorkspace(data.data);
        setWorkspaceModalOpen(false);
        // Clear form
        setFormData({ name: '', description: '', color: '#6366f1', useCase: 'other' });
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la création du workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setWorkspaceModalOpen(false);
    setFormData({ name: '', description: '', color: '#6366f1', useCase: 'other' });
  };

  return (
    <AnimatePresence>
      {isWorkspaceModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
          >
            <div className="glass-card p-6 m-4 !bg-[#1a1a24] border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Nouveau Workspace</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du workspace *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Mon Equipe, Projet Perso..."
                    className="
                      w-full px-4 py-3 text-sm
                      bg-white/5 border border-white/10
                      rounded-xl text-white placeholder-gray-500
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-all duration-200
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="De quoi s'agit-il ?"
                    rows={3}
                    className="
                      w-full px-4 py-3 text-sm resize-none
                      bg-white/5 border border-white/10
                      rounded-xl text-white placeholder-gray-500
                      focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                      transition-all duration-200
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Couleur du thème
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`
                          h-8 rounded-lg transition-all duration-200 border-2
                          ${formData.color === color.value 
                            ? 'border-white scale-110 shadow-lg' 
                            : 'border-transparent hover:scale-105'}
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      flex-1 py-3 rounded-xl
                      bg-white/5 border border-white/10
                      text-gray-400 font-medium text-sm
                      hover:bg-white/10 hover:text-white
                      transition-all duration-200
                    "
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      flex-1 py-3 rounded-xl flex items-center justify-center gap-2
                      bg-indigo-600 text-white font-medium text-sm
                      hover:bg-indigo-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200
                    "
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Créer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
