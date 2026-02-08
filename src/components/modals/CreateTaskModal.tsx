'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Flag, FolderKanban } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { TaskPriority, Project } from '@/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  defaultProjectId?: string;
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'important', label: 'Important', color: '#ef4444' },
  { value: 'less_important', label: 'Moins important', color: '#3b82f6' },
  { value: 'waiting', label: 'En attente', color: '#94a3b8' },
];

const demoProjects: Project[] = [
  { _id: '1', name: 'FINEA', color: '#22c55e', description: '', icon: '', workspace: '', owner: '', members: [], status: 'active', tasksCount: 0, completedTasksCount: 0, createdAt: '', updatedAt: '' },
  { _id: '2', name: 'BUISPACE', color: '#f97316', description: '', icon: '', workspace: '', owner: '', members: [], status: 'active', tasksCount: 0, completedTasksCount: 0, createdAt: '', updatedAt: '' },
  { _id: '3', name: 'AFFI', color: '#ef4444', description: '', icon: '', workspace: '', owner: '', members: [], status: 'active', tasksCount: 0, completedTasksCount: 0, createdAt: '', updatedAt: '' },
  { _id: '4', name: 'MATHIAS', color: '#94a3b8', description: '', icon: '', workspace: '', owner: '', members: [], status: 'active', tasksCount: 0, completedTasksCount: 0, createdAt: '', updatedAt: '' },
  { _id: '5', name: 'AGBK', color: '#8b5cf6', description: '', icon: '', workspace: '', owner: '', members: [], status: 'active', tasksCount: 0, completedTasksCount: 0, createdAt: '', updatedAt: '' },
];

export default function CreateTaskModal({ isOpen, onClose, projects, defaultProjectId }: CreateTaskModalProps) {
  const { addTask } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    priority: 'less_important' as TaskPriority,
    dueDate: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectList = projects?.length ? projects : demoProjects;
  
  const selectedProject = projectList.find(p => p._id === formData.project);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre de la tâche est requis');
      return;
    }

    if (!formData.project) {
      toast.error('Veuillez sélectionner un projet');
      return;
    }

    setIsSubmitting(true);

    try {
      const newTask = {
        _id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        project: formData.project,
        projectName: selectedProject?.name,
        projectColor: selectedProject?.color,
        creator: '1',
        priority: formData.priority,
        status: 'todo' as const,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        subtasks: [],
        attachments: [],
        comments: [],
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addTask(newTask);
      toast.success('Tâche créée avec succès !');
      setFormData({
        title: '',
        description: '',
        project: defaultProjectId || '',
        priority: 'less_important',
        dueDate: '',
        tags: '',
      });
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la création de la tâche');
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-card p-6 m-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Nouvelle tâche</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Créer la landing page..."
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
                    placeholder="Décrivez la tâche en détail..."
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

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Projet *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {projectList.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => setFormData({ ...formData, project: project._id })}
                        className={`
                          flex items-center gap-2 p-3 rounded-xl border transition-all duration-200
                          ${formData.project === project._id
                            ? 'bg-[rgba(255,255,255,0.08)] border-white/20'
                            : 'bg-[rgba(255,255,255,0.02)] border-white/5 hover:bg-[rgba(255,255,255,0.05)]'}
                        `}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm text-white truncate">{project.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priorité
                  </label>
                  <div className="flex gap-2">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: option.value })}
                        className={`
                          flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all duration-200
                          ${formData.priority === option.value
                            ? 'border-white/20'
                            : 'border-white/5 hover:border-white/10'}
                        `}
                        style={{
                          backgroundColor: formData.priority === option.value 
                            ? `${option.color}20` 
                            : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="text-xs text-white">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="
                      w-full px-4 py-3 text-sm
                      bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
                      rounded-xl text-white
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                      [color-scheme:dark]
                    "
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Ex: urgent, design, frontend"
                    className="
                      w-full px-4 py-3 text-sm
                      bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
                      rounded-xl text-white placeholder-gray-500
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                    "
                  />
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
                      'Créer la tâche'
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
