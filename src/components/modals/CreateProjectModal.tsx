'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const colorOptions = [
  { name: 'Vert', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Gris', value: '#94a3b8' },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
}

export default function CreateProjectModal({ isOpen, onClose, workspaceId }: CreateProjectModalProps) {
  const { addProject, updateProject, currentProject } = useAppStore();
  const { token, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!currentProject;

  // Initialize form when editing
  useEffect(() => {
    if (isEditing && currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description || '',
        color: currentProject.color,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
      });
    }
  }, [isEditing, currentProject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && currentProject) {
        updateProject(currentProject._id, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          updatedAt: new Date().toISOString(),
        });
        toast.success('Projet mis à jour !');
        onClose();
      } else {
        if (!token || !user) {
          toast.error('Vous devez être connecté');
          return;
        }

        // Récupérer le workspace de l'utilisateur
        const workspaceResponse = await fetch('/api/workspaces', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const workspaceData = await workspaceResponse.json();
        
        if (!workspaceData.success || !workspaceData.data || workspaceData.data.length === 0) {
          toast.error('Workspace non trouvé');
          return;
        }

        const workspace = workspaceData.data[0]; // Premier workspace

        // Créer le projet via l'API
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            color: formData.color,
            icon: 'folder',
            workspace: workspace._id,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Ajouter le projet au store
          addProject(data.data);
          toast.success('Projet créé avec succès !');
          onClose();
        } else {
          toast.error(data.error || 'Erreur lors de la création');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(isEditing ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass-card p-6 m-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: FINEA, BUISPACE..."
                    className="
                      w-full px-4 py-3 text-sm
                      bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
                      rounded-xl text-white placeholder-gray-500
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                    "
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre projet..."
                    rows={3}
                    className="
                      w-full px-4 py-3 text-sm resize-none
                      bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
                      rounded-xl text-white placeholder-gray-500
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                    "
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Couleur du projet
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`
                          w-8 h-8 rounded-lg transition-all duration-200
                          ${formData.color === color.value 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12121a] scale-110' 
                            : 'hover:scale-105'}
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      flex-1 py-3 rounded-xl
                      bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
                      text-gray-300 font-medium text-sm
                      hover:bg-[rgba(255,255,255,0.06)]
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
                      bg-gradient-to-r from-indigo-600 to-purple-600
                      text-white font-medium text-sm
                      hover:from-indigo-500 hover:to-purple-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200
                    "
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      isEditing ? 'Enregistrer' : 'Créer le projet'
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
