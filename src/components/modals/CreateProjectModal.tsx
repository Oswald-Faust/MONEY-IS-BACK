'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';
import { PLAN_LIMITS } from '@/lib/limits';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
}

export default function CreateProjectModal({ isOpen, onClose, workspaceId }: CreateProjectModalProps) {
  const { projects, addProject, updateProject, currentProject } = useAppStore();
  const { token, user } = useAuthStore();
  const { t } = useTranslation();


  const colorOptions = [
    { name: t.modals.project.colors.green, value: '#22c55e' },
    { name: t.modals.project.colors.orange, value: '#f97316' },
    { name: t.modals.project.colors.red, value: '#ef4444' },
    { name: t.modals.project.colors.blue, value: '#3b82f6' },
    { name: t.modals.project.colors.purple, value: '#8b5cf6' },
    { name: t.modals.project.colors.pink, value: '#ec4899' },
    { name: t.modals.project.colors.cyan, value: '#06b6d4' },
    { name: t.modals.project.colors.yellow, value: '#eab308' },
    { name: t.modals.project.colors.indigo, value: '#6366f1' },
    { name: t.modals.project.colors.gray, value: '#94a3b8' },
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!currentProject;
  const currentWorkspace = useAppStore(state => state.currentWorkspace);

  // Check if user is Workspace Admin
  // (Might keep this if needed for other things, but removing for now to clean up if unused)
  /*
  const isWorkspaceAdmin = React.useMemo(() => {
    if (!currentWorkspace || !user) return false;
    if (currentWorkspace.owner === user._id) return true;
    const member = currentWorkspace.members?.find((m: { user: string | { _id: string }; role: string }) => 
      (typeof m.user === 'string' ? m.user : m.user._id) === user._id
    );
    return member?.role === 'admin';
  }, [currentWorkspace, user]);
  */

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
      toast.error(t.modals.project.toasts.nameRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && currentProject) {
        // Appeler l'API PATCH
        const response = await fetch(`/api/projects?id=${currentProject._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            color: formData.color,
          }),
        });

        const data = await response.json();

        if (data.success) {
          updateProject(currentProject._id, data.data);
          toast.success(t.modals.project.toasts.updated);
          onClose();
        } else {
          toast.error(data.error || t.modals.project.toasts.updateError);
        }
      } else {
        if (!token || !user) {
          toast.error(t.modals.project.toasts.mustBeConnected);
          return;
        }

        // Project Limit Check
        if (currentWorkspace && projects) {
          const plan = currentWorkspace.subscriptionPlan || 'starter';
          const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.maxProjects || 0;
          const workspaceProjects = projects.filter(p => {
             if (typeof p.workspace === 'string') return p.workspace === currentWorkspace._id;
             if (p.workspace && typeof p.workspace === 'object' && '_id' in p.workspace) {
                return (p.workspace as { _id: string })._id === currentWorkspace._id;
             }
             return false;
          });
          
          if (workspaceProjects.length >= limit) {
             toast.error(`Limite de projets atteinte pour le plan ${plan.toUpperCase()}. Veuillez passer au plan supérieur.`);
             setIsSubmitting(false);
             return;
          }
        }

        // Récupérer le workspace
        const targetWorkspaceId = workspaceId || currentWorkspace?._id;

        if (!targetWorkspaceId) {
          toast.error(t.modals.project.toasts.workspaceNotFound);
          return;
        }

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
            workspace: targetWorkspaceId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Ajouter le projet au store
          addProject(data.data);
          toast.success(t.modals.project.toasts.created);
          onClose();
        } else {
          toast.error(data.error || t.modals.project.toasts.createError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(isEditing ? t.modals.project.toasts.updateError : t.modals.project.toasts.createError);
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
            <div className="glass-card p-6 m-4 hover:!bg-[var(--bg-card)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-main">
                  {isEditing ? t.modals.project.titleEdit : t.modals.project.titleCreate}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {t.modals.project.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t.modals.project.namePlaceholder}
                    className="
                      w-full px-4 py-3 text-sm
                      bg-glass-bg border border-glass-border
                      rounded-xl text-main placeholder-dim
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                    "
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {t.modals.project.descriptionLabel}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t.modals.project.descriptionPlaceholder}
                    rows={3}
                    className="
                      w-full px-4 py-3 text-sm resize-none
                      bg-glass-bg border border-glass-border
                      rounded-xl text-main placeholder-dim
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                    "
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {t.modals.project.colorLabel}
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
                            ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-secondary scale-110' 
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
                      bg-glass-bg border border-glass-border
                      text-dim font-medium text-sm
                      hover:bg-glass-hover
                      transition-all duration-200
                    "
                  >
                    {t.modals.project.cancel}
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
                      isEditing ? t.modals.project.save : t.modals.project.create
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
