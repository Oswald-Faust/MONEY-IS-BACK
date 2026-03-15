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

function normalizeAssignees(value: AssigneeLike[] | AssigneeLike) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((user) => (typeof user === 'object' ? user?._id : user))
      .filter(Boolean);
  }

  return [typeof value === 'object' ? value?._id : value].filter(Boolean);
}

function normalizeCheckpoint(checkpoint: ObjectiveCheckpointLike): ObjectiveCheckpointForm {
  return {
    id: checkpoint.id || checkpoint._id || createEmptyCheckpoint().id,
    title: checkpoint.title || '',
    completed: Boolean(checkpoint.completed),
    priority: checkpoint.priority || 'less_important',
    dueDate: checkpoint.dueDate ? new Date(checkpoint.dueDate).toISOString().split('T')[0] : '',
    assignees: normalizeAssignees(checkpoint.assignees && checkpoint.assignees.length > 0 ? checkpoint.assignees : checkpoint.assignee),
    task: typeof checkpoint.task === 'object' ? checkpoint.task?._id : checkpoint.task,
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
          className="relative w-full max-w-4xl bg-bg-secondary border border-glass-border rounded-3xl shadow-2xl overflow-hidden hover:!bg-bg-secondary"
        >
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main">
                  {initialData ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                </h2>
                <p className="text-sm text-text-muted">
                  Les checkpoints sont automatiquement relies a la to-do list.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form id="objective-form" onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Contexte, resultat attendu, indicateurs de succes..."
                rows={4}
                className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main placeholder-text-muted/50 focus:border-accent-primary/50 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="text-sm font-medium text-text-main flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-primary" />
                    Assistance IA
                  </label>
                  <p className="mt-1 text-xs text-text-muted">
                    Genere une description, une priorite et des checkpoints executables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingWithAI}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent-primary/20 transition-all hover:opacity-90 disabled:opacity-50"
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
                className="w-full rounded-2xl border border-indigo-500/10 bg-bg-secondary px-4 py-3 text-sm text-text-main placeholder-text-muted/50 focus:border-accent-primary/40 focus:outline-none"
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                      className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
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

            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <div>
                  <label className="text-sm font-medium text-text-muted">Checkpoints lies a la to-do list</label>
                  <p className="text-xs text-text-muted mt-1">
                    Chaque checkpoint cree ou met a jour automatiquement une tache reliee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCheckpoint}
                  className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-4">
                {formData.checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint.id} className="rounded-2xl border border-glass-border bg-bg-tertiary/50 p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-bg-secondary border border-glass-border flex items-center justify-center text-xs font-bold text-text-muted">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col xl:flex-row gap-3">
                          <input
                            type="text"
                            value={checkpoint.title}
                            onChange={(event) => updateCheckpoint(checkpoint.id, { title: event.target.value })}
                            placeholder="Titre du checkpoint..."
                            className="flex-1 px-4 py-3 bg-bg-secondary border border-glass-border rounded-xl text-text-main placeholder-text-muted/40 focus:border-accent-primary/30 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeCheckpoint(checkpoint.id)}
                            className="self-start p-3 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                              <Flag className="w-3.5 h-3.5" />
                              Priorite de la tache
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {checkpointPriorityOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => updateCheckpoint(checkpoint.id, { priority: option.value })}
                                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                    checkpoint.priority === option.value
                                      ? 'text-text-main border-white/20'
                                      : 'text-text-muted border-glass-border hover:border-white/10'
                                  }`}
                                  style={{
                                    backgroundColor:
                                      checkpoint.priority === option.value ? `${option.color}20` : 'rgba(255,255,255,0.02)',
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
                              className="w-full px-4 py-3 bg-bg-secondary border border-glass-border rounded-xl text-text-main outline-none focus:border-accent-primary/50 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-end">
                          <UserSelector
                            value={checkpoint.assignees}
                            onChange={(userIds) => updateCheckpoint(checkpoint.id, { assignees: userIds as string[] })}
                            multiple={true}
                            label="Assignes du checkpoint"
                            projectId={formData.project || undefined}
                            workspaceId={checkpointWorkspaceId}
                          />

                          {checkpoint.task && (
                            <div className="px-3 py-2 rounded-xl bg-bg-secondary border border-glass-border text-xs text-text-muted flex items-center gap-2 whitespace-nowrap">
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

          <div className="p-6 border-t border-glass-border bg-bg-secondary/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-glass-hover transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="objective-form"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-accent-primary/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : initialData ? (
                'Enregistrer'
              ) : (
                'Creer l\'objectif'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
