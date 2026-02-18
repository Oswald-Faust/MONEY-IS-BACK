'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FolderKanban, Clock } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { RoutineDays, Project } from '@/types';
import UserSelector from '@/components/ui/UserSelector';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
}

const dayOptions: { key: keyof RoutineDays; label: string }[] = [
  { key: 'monday', label: 'Lun' },
  { key: 'tuesday', label: 'Mar' },
  { key: 'wednesday', label: 'Mer' },
  { key: 'thursday', label: 'Jeu' },
  { key: 'friday', label: 'Ven' },
  { key: 'saturday', label: 'Sam' },
  { key: 'sunday', label: 'Dim' },
];

export default function CreateRoutineModal({ isOpen, onClose, projects }: CreateRoutineModalProps) {
  const { addRoutine, projects: storeProjects } = useAppStore();
  const { token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    time: '',
    days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    } as RoutineDays,
    assignee: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectList = projects?.length ? projects : storeProjects;
  
  const selectedProject = projectList.find(p => p._id === formData.project);

  const toggleDay = (day: keyof RoutineDays) => {
    setFormData({
      ...formData,
      days: {
        ...formData.days,
        [day]: !formData.days[day],
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre de la routine est requis');
      return;
    }

    if (!formData.project) {
        toast.error('Le projet est requis');
        return;
    }

    setIsSubmitting(true);

    try {
      if (!token) {
        toast.error('Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          project: formData.project,
          time: formData.time,
          days: formData.days,
          color: selectedProject?.color,
          assignee: formData.assignee || undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        addRoutine(data.data);
        toast.success('Routine créée avec succès !');
        setFormData({
          title: '',
          description: '',
          project: '',
          time: '',
          days: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
          assignee: ''
        });
        onClose();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la création de la routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-card p-6 m-4 max-h-[90vh] overflow-y-auto hover:!bg-[var(--bg-card)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-main">Nouvelle routine</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                    placeholder="Ex: Séance de sport, Lecture..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" /> Projet associé *
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-accent-primary/20 appearance-none"
                  >
                    <option value="" className="bg-bg-secondary text-text-muted">Sélectionner un projet</option>
                    {projectList.map((p) => (
                      <option key={p._id} value={p._id} className="bg-bg-secondary text-text-main">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <UserSelector 
                    value={formData.assignee}
                    onChange={(userId) => setFormData({ ...formData, assignee: userId as string })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Heure (optionnel)
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-4">Récurrence</label>
                  <div className="flex justify-between gap-1">
                    {dayOptions.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`
                          flex-1 py-3 rounded-xl border text-xs font-bold transition-all
                          ${formData.days[day.key]
                            ? 'bg-accent-primary/20 border-accent-primary text-accent-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'bg-bg-tertiary border-glass-border text-text-muted hover:bg-glass-hover'}
                        `}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-glass-border">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 rounded-xl bg-bg-tertiary text-text-muted font-bold hover:bg-glass-hover transition-all"
                  >
                    ANNULER
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-xl bg-accent-primary text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CRÉER'}
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
