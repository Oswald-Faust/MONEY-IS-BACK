'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, LayoutGrid, List, Plus, Search, Sparkles } from 'lucide-react';
import ProjectCard from '@/components/ui/ProjectCard';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import EditTaskModal from '@/components/modals/EditTaskModal';
import type { Project, Task } from '@/types';
import { useSearchParams } from 'next/navigation';
import { useAppStore, useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

type ProjectStatusFilter = 'all' | 'active' | 'archived' | 'paused';
type ViewMode = 'grid' | 'list';

const VIEW_MODE_KEY = 'projects-view-mode';

export default function ProjectsPage() {
  const {
    projects,
    setProjects,
    setProjectModalOpen,
    isProjectModalOpen,
    setCurrentProject,
    deleteProject,
    currentWorkspace,
  } = useAppStore();
  const { token } = useAuthStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const searchParams = useSearchParams();

  // Restore view preference
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === 'list' || saved === 'grid') setViewMode(saved);
  }, []);

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && token) {
      fetch(`/api/tasks?id=${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setEditingTask(data.data);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [searchParams, token]);

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`${t.projectsPage.confirmDelete} ${name} ?`)) return;

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        deleteProject(id);
        toast.success(t.projectsPage.toasts.deleted);
      } else {
        toast.error(data.error || t.projectsPage.toasts.deleteError);
      }
    } catch {
      toast.error(t.projectsPage.toasts.connectionError);
    }
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setProjectModalOpen(true);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentWorkspace) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects?workspace=${currentWorkspace._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setProjects(data.data);
        } else {
          toast.error(data.error || t.projectsPage.toasts.loadError);
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error(t.projectsPage.toasts.serverError);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && currentWorkspace) {
      fetchProjects();
    }
  }, [token, currentWorkspace, setProjects, t.projectsPage.toasts.loadError, t.projectsPage.toasts.serverError]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeProjects = filteredProjects.filter((project) => project.status === 'active');
  const archivedProjects = filteredProjects.filter((project) => project.status === 'archived');
  const pausedProjects = filteredProjects.filter((project) => project.status === 'paused');

  const totalTasks = filteredProjects.reduce((sum, project) => sum + project.tasksCount, 0);
  const totalCompletedTasks = filteredProjects.reduce(
    (sum, project) => sum + project.completedTasksCount,
    0
  );
  const completionRate = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  const statusOptions: Array<{
    value: ProjectStatusFilter;
    label: string;
    count: number;
  }> = [
    {
      value: 'all',
      label: t.projectsPage.filters.all,
      count: filteredProjects.length,
    },
    {
      value: 'active',
      label: t.projectsPage.filters.active,
      count: activeProjects.length,
    },
    {
      value: 'paused',
      label: t.projectsPage.filters.paused,
      count: pausedProjects.length,
    },
    {
      value: 'archived',
      label: t.projectsPage.filters.archived,
      count: archivedProjects.length,
    },
  ];

  const projectSections = [
    {
      key: 'active',
      title: t.projectsPage.sections.activeProjects,
      description: t.projectsPage.sectionDescriptions.activeProjects,
      items: activeProjects,
    },
    {
      key: 'paused',
      title: t.projectsPage.sections.pausedProjects,
      description: t.projectsPage.sectionDescriptions.pausedProjects,
      items: pausedProjects,
    },
    {
      key: 'archived',
      title: t.projectsPage.sections.archivedProjects,
      description: t.projectsPage.sectionDescriptions.archivedProjects,
      items: archivedProjects,
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <motion.section
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] border border-glass-border bg-bg-secondary/70 p-6 md:p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)]"
      >
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative space-y-8">
          {/* Title row */}
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim">
                <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
                {t.projectsPage.workspaceLabel}
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight flex items-center gap-3">
                  <FolderKanban className="w-8 h-8 text-accent-primary" />
                  {t.projectsPage.title}
                </h1>
                <p className="mt-3 text-base md:text-lg text-text-dim leading-7">
                  {t.projectsPage.subtitle}
                </p>
                {currentWorkspace && (
                  <p className="mt-4 text-sm text-text-muted">
                    {t.projectsPage.workspaceLabel}:{' '}
                    <span className="text-text-main font-semibold">
                      {currentWorkspace.name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentProject(null);
                setProjectModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent-primary/20 transition-all hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              {t.projectsPage.newProject}
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                {t.projectsPage.stats.active}
              </p>
              <p className="mt-3 text-3xl font-bold text-text-main">{activeProjects.length}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                {t.projectsPage.stats.paused}
              </p>
              <p className="mt-3 text-3xl font-bold text-text-main">{pausedProjects.length}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                {t.projectsPage.stats.totalTasks}
              </p>
              <p className="mt-3 text-3xl font-bold text-text-main">{totalTasks}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                {t.projectsPage.stats.completion}
              </p>
              <p className="mt-3 text-3xl font-bold text-text-main">{completionRate}%</p>
            </div>
          </div>

          {/* Search + filters + view toggle */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.projectsPage.searchPlaceholder}
                  className="w-full rounded-2xl border border-glass-border bg-bg-tertiary pl-12 pr-4 py-3.5 text-sm text-text-main placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none focus:ring-4 focus:ring-accent-primary/5 transition-all duration-200"
                />
              </div>

              {/* View toggle */}
              <div className="flex-shrink-0 flex items-center gap-1 rounded-2xl border border-glass-border bg-bg-tertiary p-1.5">
                <button
                  onClick={() => handleViewMode('grid')}
                  title="Vue grille"
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main hover:bg-glass-hover'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewMode('list')}
                  title="Vue liste"
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'list'
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main hover:bg-glass-hover'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-2xl border px-4 py-2.5 text-left transition-all ${
                    statusFilter === option.value
                      ? 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary shadow-sm'
                      : 'border-glass-border bg-bg-tertiary text-text-muted hover:bg-glass-hover hover:text-text-main'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em]">
                    {option.label}
                  </div>
                  <div className="mt-0.5 text-lg font-bold">{option.count}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-dim">{t.projectsPage.loading}</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card rounded-[30px] border-dashed border-2 bg-bg-secondary/40 p-16 text-center">
          <FolderKanban className="mx-auto mb-6 h-16 w-16 text-text-muted opacity-20" />
          <h3 className="mb-2 text-2xl font-bold text-text-main">{t.projectsPage.empty.title}</h3>
          <p className="mx-auto mb-8 max-w-md text-sm text-text-dim">
            {searchQuery
              ? t.projectsPage.empty.tryAnotherSearch
              : t.projectsPage.empty.createFirst}
          </p>
          <button
            onClick={() => {
              setCurrentProject(null);
              setProjectModalOpen(true);
            }}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white"
          >
            {t.projectsPage.empty.createButton}
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {projectSections.map((section, sectionIndex) =>
            section.items.length > 0 ? (
              <motion.section
                key={section.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + sectionIndex * 0.05 }}
                className="space-y-4"
              >
                {/* Section header */}
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-text-main">
                      {section.title}{' '}
                      <span className="text-text-muted">({section.items.length})</span>
                    </h2>
                    <p className="mt-0.5 text-sm text-text-dim">{section.description}</p>
                  </div>
                </div>

                {/* Grid or List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {section.items.map((project, index) => (
                      <motion.div
                        key={project._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="h-full"
                      >
                        <ProjectCard
                          project={project}
                          variant="grid"
                          onEdit={handleEditProject}
                          onDelete={(currentProject) =>
                            handleDeleteProject(currentProject._id, currentProject.name)
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {section.items.map((project, index) => (
                      <motion.div
                        key={project._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <ProjectCard
                          project={project}
                          variant="list"
                          onEdit={handleEditProject}
                          onDelete={(currentProject) =>
                            handleDeleteProject(currentProject._id, currentProject.name)
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            ) : null
          )}
        </div>
      )}

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        workspaceId={currentWorkspace?._id}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => {
          setEditingTask(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('taskId');
          window.history.replaceState({}, '', url);
        }}
        task={editingTask}
        onUpdate={() => {
          // No local update needed here.
        }}
      />
    </div>
  );
}
