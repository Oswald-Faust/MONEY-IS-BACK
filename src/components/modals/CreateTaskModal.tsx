'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Flag, FolderKanban } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import type { TaskPriority, Project } from '@/types';
import UserSelector from '@/components/ui/UserSelector';
import TagSelector from '@/components/ui/TagSelector';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  defaultProjectId?: string;
}

// Les demoProjects ont été supprimés pour utiliser les vrais projets du store

export default function CreateTaskModal({ isOpen, onClose, projects: propProjects, defaultProjectId }: CreateTaskModalProps) {
  const { addTask, projects: storeProjects } = useAppStore();
  const { token, user } = useAuthStore();
  const { t } = useTranslation();

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'important', label: t.modals.task.priorities.important, color: '#ef4444' },
    { value: 'less_important', label: t.modals.task.priorities.lessImportant, color: '#3b82f6' },
    { value: 'waiting', label: t.modals.task.priorities.waiting, color: '#94a3b8' },
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    priority: 'less_important' as TaskPriority,
    dueDate: '',
    assignees: [] as string[],
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        project: defaultProjectId || prev.project || '',
      }));
    }
  }, [isOpen, defaultProjectId]);

  const projectList = propProjects?.length ? propProjects : storeProjects;
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t.modals.task.toasts.titleRequired);
      return;
    }

    if (!formData.project) {
      toast.error(t.modals.task.toasts.projectRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!token || !user) {
        toast.error(t.modals.task.toasts.mustBeConnected);
        return;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          project: formData.project,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          assignees: formData.assignees,
          tags: formData.tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addTask(data.data);
        toast.success(t.modals.task.toasts.created);
        setFormData({
          title: '',
          description: '',
          project: defaultProjectId || '',
          priority: 'less_important',
          dueDate: '',
          assignees: [],
          tags: [],
        });
        onClose();
      }
    } catch {
      toast.error(t.modals.task.toasts.createError);
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
            <div className="glass-card p-6 m-4 max-h-[90vh] overflow-y-auto hover:!bg-[var(--bg-card)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-main">{t.modals.task.titleCreate}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {t.modals.task.taskTitleLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t.modals.task.taskTitlePlaceholder}
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
                    {t.modals.task.descriptionLabel}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t.modals.task.descriptionPlaceholder}
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

                {/* Project Selection - Hidden if defaultProjectId is provided */}
                {!defaultProjectId && (
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" />
                      {t.modals.task.projectLabel}
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
                              ? 'bg-glass-hover border-indigo-500/30'
                              : 'bg-glass-bg border-glass-border hover:bg-glass-hover'}
                          `}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-sm text-main truncate">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    {t.modals.task.priorityLabel}
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
                        <span className={`text-xs ${formData.priority === option.value ? 'text-text-main font-bold' : 'text-text-muted'}`}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div>
                   <UserSelector 
                      value={formData.assignees}
                      onChange={(userIds) => setFormData({ ...formData, assignees: userIds as string[] })}
                      className="mb-4"
                      multiple={true}
                      projectId={formData.project}
                   />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t.modals.task.dueDateLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="
                      w-full px-4 py-3 text-sm
                      bg-glass-bg border border-glass-border
                      rounded-xl text-main
                      focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      transition-all duration-200
                    "
                  />
                </div>

                <div>
                  <TagSelector 
                    value={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    placeholder={t.modals.task.tagsPlaceholder}
                  />
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
                    {t.modals.task.cancel}
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
                      t.modals.task.create
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
