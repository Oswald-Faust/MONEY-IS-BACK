'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Plus, Trash2, Loader2, Calendar, Flag, Link2, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAppStore, useAuthStore } from '@/store';
import UserSelector from '@/components/ui/UserSelector';
import type { Objective, TaskPriority } from '@/types';

interface ObjectiveCheckpointForm {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  assignees: string[];
  task?: string;
}

type AssigneeLike = string | { _id?: string | null } | null | undefined;
type ProjectLike = string | { _id: string } | null | undefined;

interface ObjectiveCheckpointLike {
  id?: string;
  _id?: string;
  title?: string;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: AssigneeLike;
  assignees?: AssigneeLike[];
  task?: string | { _id?: string | null } | null;
}

interface ObjectivePrefillData {
  title?: string;
  description?: string;
  project?: ProjectLike;
  assignees?: AssigneeLike[];
}

interface CreateObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Objective | null;
  prefillData?: ObjectivePrefillData | null;
  defaultProjectId?: string;
  workspaceId?: string;
}

const objectivePriorityOptions = [
  { value: 'low' as const, label: 'Basse' },
  { value: 'medium' as const, label: 'Moyenne' },
  { value: 'high' as const, label: 'Haute' },
];

const checkpointPriorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'important', label: 'Important', color: '#ef4444' },
  { value: 'less_important', label: 'Normal', color: '#3b82f6' },
  { value: 'waiting', label: 'En attente', color: '#94a3b8' },
];

function createEmptyCheckpoint(): ObjectiveCheckpointForm {
  return {
    id: new Date().getTime().toString(36) + Math.random().toString(36).slice(2, 8),
    title: '',
    completed: false,
    priority: 'less_important',
    dueDate: '',
    assignees: [],
  };
}

function normalizeAssignees(value: AssigneeLike[] | AssigneeLike): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((user) => (typeof user === 'object' ? user?._id : user))
      .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0);
  }

  return [typeof value === 'object' ? value?._id : value].filter(
    (userId): userId is string => typeof userId === 'string' && userId.length > 0
  );
}

function normalizeCheckpoint(checkpoint: ObjectiveCheckpointLike): ObjectiveCheckpointForm {
  const linkedTaskId =
    checkpoint.task && typeof checkpoint.task === 'object'
      ? checkpoint.task._id || undefined
      : checkpoint.task || undefined;

  return {
    id: checkpoint.id || checkpoint._id || createEmptyCheckpoint().id,
    title: checkpoint.title || '',
    completed: Boolean(checkpoint.completed),
    priority: checkpoint.priority || 'less_important',
    dueDate: checkpoint.dueDate ? new Date(checkpoint.dueDate).toISOString().split('T')[0] : '',
    assignees: normalizeAssignees(checkpoint.assignees && checkpoint.assignees.length > 0 ? checkpoint.assignees : checkpoint.assignee),
    task: linkedTaskId,
  };
}

export default function CreateObjectiveModal({
  isOpen,
  onClose,
  initialData,
  prefillData,
  defaultProjectId: propProjectId,
  workspaceId,
}: CreateObjectiveModalProps) {
  const { projects, addObjective, updateObjective } = useAppStore();
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const searchProjectId = searchParams.get('project');
  const defaultProjectId = propProjectId || searchProjectId;

  const [loading, setLoading] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    checkpoints: [createEmptyCheckpoint()] as ObjectiveCheckpointForm[],
    targetDate: '',
    assignees: [] as string[],
  });

  React.useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setAiPrompt('');
      setFollowUpQuestions([]);
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        project:
          typeof initialData.project === 'object' && initialData.project
            ? initialData.project._id
            : (initialData.project as string) || '',
        priority: initialData.priority,
        checkpoints:
          initialData.checkpoints && initialData.checkpoints.length > 0
            ? initialData.checkpoints.map(normalizeCheckpoint)
            : [createEmptyCheckpoint()],
        targetDate: initialData.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '',
        assignees: normalizeAssignees(initialData.assignees && initialData.assignees.length > 0 ? initialData.assignees : initialData.assignee),
      });
      return;
    }

    if (prefillData) {
      setAiPrompt('');
      setFollowUpQuestions([]);
      setFormData({
        title: prefillData.title || '',
        description: prefillData.description || '',
        project:
          typeof prefillData.project === 'object' && prefillData.project
            ? prefillData.project._id
            : (prefillData.project as string) || defaultProjectId || '',
        priority: 'medium',
        checkpoints: [createEmptyCheckpoint()],
        targetDate: '',
        assignees: normalizeAssignees(prefillData.assignees),
      });
      return;
    }

    setAiPrompt('');
    setFollowUpQuestions([]);
    setFormData({
      title: '',
      description: '',
      project: defaultProjectId || '',
      priority: 'medium',
      checkpoints: [createEmptyCheckpoint()],
      targetDate: '',
      assignees: [],
    });
  }, [isOpen, defaultProjectId, initialData, prefillData]);

  const checkpointWorkspaceId = formData.project ? undefined : workspaceId;

  const updateCheckpoint = (id: string, updates: Partial<ObjectiveCheckpointForm>) => {
    setFormData((previous) => ({
      ...previous,
      checkpoints: previous.checkpoints.map((checkpoint) =>
        checkpoint.id === id ? { ...checkpoint, ...updates } : checkpoint
      ),
    }));
  };

  const addCheckpoint = () => {
    setFormData((previous) => ({
      ...previous,
      checkpoints: [...previous.checkpoints, createEmptyCheckpoint()],
    }));
  };

  const removeCheckpoint = (id: string) => {
    setFormData((previous) => ({
      ...previous,
      checkpoints:
        previous.checkpoints.length === 1
          ? previous.checkpoints
          : previous.checkpoints.filter((checkpoint) => checkpoint.id !== id),
    }));
  };

  const handleGenerateWithAI = async () => {
    if (!token) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!workspaceId && !formData.project) {
      toast.error('Selectionnez un workspace ou un projet avant de lancer l IA');
      return;
    }

    if (!aiPrompt.trim() && !formData.title.trim() && !formData.description.trim()) {
      toast.error('Donnez un contexte ou une demande a l IA');
      return;
    }

    setIsGeneratingWithAI(true);
    setFollowUpQuestions([]);

    try {
      const response = await fetch('/api/ai/objectives/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId,
          projectId: formData.project || undefined,
          title: formData.title,
          description: formData.description,
          prompt: aiPrompt,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la generation IA');
      }

      setFormData((previous) => ({
        ...previous,
        title: data.data.title || previous.title,
        description: data.data.description || previous.description,
        priority: data.data.priority || previous.priority,
        targetDate: data.data.targetDate || previous.targetDate,
        checkpoints:
          data.data.checkpoints?.length > 0
            ? data.data.checkpoints.map((checkpoint: {
                title: string;
                priority?: TaskPriority;
                dueDate?: string;
              }) => ({
                id: createEmptyCheckpoint().id,
                title: checkpoint.title,
                completed: false,
                priority: checkpoint.priority || 'less_important',
                dueDate: checkpoint.dueDate || '',
                assignees: [],
              }))
            : previous.checkpoints,
      }));
      setFollowUpQuestions(data.data.followUpQuestions || []);
      toast.success(`Brouillon genere via ${data.data.provider}`);
    } catch (error) {
      console.error(error);
      toast.error('Impossible de generer le brouillon avec l IA');
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!token) {
      toast.error('Vous devez être connecté');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      project: formData.project || undefined,
      workspace: workspaceId,
      priority: formData.priority,
      targetDate: formData.targetDate || undefined,
      assignees: formData.assignees,
      checkpoints: formData.checkpoints
        .map((checkpoint) => ({
          id: checkpoint.id,
          title: checkpoint.title.trim(),
          completed: checkpoint.completed,
          priority: checkpoint.priority,
          dueDate: checkpoint.dueDate || undefined,
          assignees: checkpoint.assignees,
          task: checkpoint.task,
        }))
        .filter((checkpoint) => checkpoint.title.length > 0),
    };

    setLoading(true);

    try {
      const response = await fetch(initialData ? `/api/objectives?id=${initialData._id}` : '/api/objectives', {
        method: initialData ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
        return;
      }

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
        project: defaultProjectId || '',
        priority: 'medium',
        checkpoints: [createEmptyCheckpoint()],
        targetDate: '',
        assignees: [],
      });
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
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />

      {/* Conteneur centré — bottom-sheet sur mobile, centré sur sm+ */}
      <div className="fixed inset-0 z-[61] flex flex-col items-stretch justify-end sm:items-center sm:justify-center sm:p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          className="pointer-events-auto relative w-full sm:max-w-2xl lg:max-w-4xl bg-bg-secondary border border-glass-border rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b border-glass-border bg-bg-secondary/20 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-text-main leading-tight">
                  {initialData ? "Modifier l'objectif" : 'Nouvel objectif'}
                </h2>
                <p className="text-xs sm:text-sm text-text-muted hidden sm:block">
                  Les checkpoints sont automatiquement relies a la to-do list.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulaire scrollable */}
          <form
            id="objective-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 sm:px-6 sm:py-6 space-y-5"
          >
            {/* Titre + Projet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Titre de l&apos;objectif</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  placeholder="Ex: Lancement Beta v1.0"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main placeholder-text-muted/50 focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Projet associé</label>
                <select
                  value={formData.project}
                  onChange={(event) => setFormData({ ...formData, project: event.target.value })}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-accent-primary/50 transition-all appearance-none"
                >
                  <option value="">Objectif global</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Contexte, resultat attendu, indicateurs de succes..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main placeholder-text-muted/50 focus:border-accent-primary/50 outline-none transition-all resize-none"
              />
            </div>

            {/* Assistance IA */}
            <div className="space-y-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <label className="text-sm font-medium text-text-main flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    Assistance IA
                  </label>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Genere une description, une priorite et des checkpoints executables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingWithAI}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-3 py-2 text-xs font-bold text-white shadow-lg shadow-accent-primary/20 transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                >
                  {isGeneratingWithAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generer
                </button>
              </div>

              <textarea
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Ex: Nous voulons lancer une beta privee en 30 jours avec des etapes concretes, une priorite claire et une execution simple."
                rows={3}
                className="w-full rounded-2xl border border-indigo-500/10 bg-bg-secondary px-4 py-3 text-sm text-text-main placeholder-text-muted/50 focus:border-accent-primary/40 focus:outline-none resize-none"
              />

              {followUpQuestions.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
                    Questions utiles
                  </p>
                  <ul className="mt-2 space-y-1">
                    {followUpQuestions.map((question) => (
                      <li key={question} className="text-sm text-text-dim">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Assignés + Priorité + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <UserSelector
                  value={formData.assignees}
                  onChange={(userIds) => setFormData({ ...formData, assignees: userIds as string[] })}
                  multiple={true}
                  projectId={formData.project || undefined}
                  workspaceId={checkpointWorkspaceId}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Priorite de l&apos;objectif</label>
                <div className="grid grid-cols-3 gap-2">
                  {objectivePriorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value })}
                      className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                        formData.priority === option.value
                          ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                          : 'bg-bg-tertiary border-glass-border text-text-muted hover:border-text-dim'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Date cible</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(event) => setFormData({ ...formData, targetDate: event.target.value })}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-accent-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-4">
              <div className="flex items-start justify-between ml-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-muted">Checkpoints lies a la to-do list</label>
                  <p className="text-xs text-text-muted mt-0.5">
                    Chaque checkpoint cree ou met a jour automatiquement une tache reliee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCheckpoint}
                  className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {formData.checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint.id} className="rounded-2xl border border-glass-border bg-bg-tertiary/50 p-3 sm:p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-bg-secondary border border-glass-border flex items-center justify-center text-xs font-bold text-text-muted flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Titre checkpoint + supprimer */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={checkpoint.title}
                            onChange={(event) => updateCheckpoint(checkpoint.id, { title: event.target.value })}
                            placeholder="Titre du checkpoint..."
                            className="flex-1 min-w-0 px-3 py-2.5 bg-bg-secondary border border-glass-border rounded-xl text-sm text-text-main placeholder-text-muted/40 focus:border-accent-primary/30 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeCheckpoint(checkpoint.id)}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Priorité + Échéance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                              <Flag className="w-3.5 h-3.5" />
                              Priorite
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {checkpointPriorityOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => updateCheckpoint(checkpoint.id, { priority: option.value })}
                                  className={`px-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                    checkpoint.priority === option.value
                                      ? 'text-text-main border-white/20'
                                      : 'text-text-muted border-glass-border hover:border-white/10'
                                  }`}
                                  style={{
                                    backgroundColor:
                                      checkpoint.priority === option.value
                                        ? `${option.color}20`
                                        : 'rgba(255,255,255,0.02)',
                                  }}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              Echeance
                            </label>
                            <input
                              type="date"
                              value={checkpoint.dueDate}
                              onChange={(event) => updateCheckpoint(checkpoint.id, { dueDate: event.target.value })}
                              className="w-full px-3 py-2.5 bg-bg-secondary border border-glass-border rounded-xl text-sm text-text-main outline-none focus:border-accent-primary/50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Assignés checkpoint + lien tâche */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                          <div className="flex-1 min-w-0">
                            <UserSelector
                              value={checkpoint.assignees}
                              onChange={(userIds) => updateCheckpoint(checkpoint.id, { assignees: userIds as string[] })}
                              multiple={true}
                              label="Assignes du checkpoint"
                              projectId={formData.project || undefined}
                              workspaceId={checkpointWorkspaceId}
                            />
                          </div>
                          {checkpoint.task && (
                            <div className="px-3 py-2 rounded-xl bg-bg-secondary border border-glass-border text-xs text-text-muted flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                              <Link2 className="w-3.5 h-3.5" />
                              Tache deja liee
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-4 sm:px-6 sm:py-5 border-t border-glass-border bg-bg-secondary/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-glass-hover transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="objective-form"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-accent-primary/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : initialData ? (
                'Enregistrer'
              ) : (
                "Creer l'objectif"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
