'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle,
  Clock,
  TrendingUp,
  FolderKanban,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProjectCard from '@/components/ui/ProjectCard';
import TaskCard from '@/components/ui/TaskCard';
import RoutineCalendar from '@/components/ui/RoutineCalendar';
import TeamSection from '@/components/dashboard/TeamSection';
import { useAppStore, useAuthStore } from '@/store';
import type { RoutineDays } from '@/types';
import { useTranslation } from '@/lib/i18n';

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const { 
    projects, 
    tasks, 
    routines, 
    setProjects, 
    setTasks,
    setRoutines,
    setProjectModalOpen, 
    setTaskModalOpen,
    setCurrentProject,
    deleteProject,
    updateTask,
    currentWorkspace // Added
  } = useAppStore();
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(true);

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        updateTask(taskId, data.data);
        toast.success(newStatus === 'done' ? t.mockup.taskCompleted : 'Tâche rétablie');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Initialize store with real data from API
  useEffect(() => {
    if (token && currentWorkspace) {
      const workspace = currentWorkspace; // Capture for closure narrowing
      
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const wsId = workspace._id;
          
          // Fetch projects
          const projectsRes = await fetch(`/api/projects?workspace=${wsId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const projectsData = await projectsRes.json();
          if (projectsData.success) {
            setProjects(projectsData.data);
          }

          // Fetch tasks
          const tasksRes = await fetch(`/api/tasks?workspace=${wsId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const tasksData = await tasksRes.json();
          if (tasksData.success) {
            setTasks(tasksData.data);
          }

          // Fetch routines
          const routinesRes = await fetch('/api/routines', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const routinesData = await routinesRes.json();
          if (routinesData.success) {
            setRoutines(routinesData.data);
          }
          
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [token, currentWorkspace, setProjects, setTasks, setRoutines]);

  // Calcul dynamique de la productivité
  const productivity = useMemo(() => {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const importantTasksList = tasks.filter(t => t.priority === 'important');
    const doneImportant = importantTasksList.filter(t => t.status === 'done').length;

    const now = new Date();
    const overdueTasks = tasks.filter(
      t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const dayKeys: (keyof RoutineDays)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[now.getDay()];
    const todayStr = now.toISOString().split('T')[0];
    const todayRoutines = routines.filter(r => r.isActive && r.days?.[todayKey]);
    const doneRoutinesToday = todayRoutines.filter(
      r => r.completedDates?.some((d: string) => d.startsWith(todayStr))
    ).length;

    let score = 0;
    let totalWeight = 0;

    if (totalTasks > 0) {
      score += (doneTasks / totalTasks) * 50;
      totalWeight += 50;
    }
    if (importantTasksList.length > 0) {
      score += (doneImportant / importantTasksList.length) * 30;
      totalWeight += 30;
    }
    if (todayRoutines.length > 0) {
      score += (doneRoutinesToday / todayRoutines.length) * 20;
      totalWeight += 20;
    }

    if (totalWeight === 0) return 0;
    const normalizedScore = (score / totalWeight) * 100;
    const overduePenalty = totalTasks > 0 ? Math.min(20, (overdueTasks / totalTasks) * 30) : 0;
    return Math.max(0, Math.min(100, Math.round(normalizedScore - overduePenalty)));
  }, [tasks, routines]);

  const stats = [
    { label: t.dashboard.stats.activeProjects, value: projects.length, icon: FolderKanban, color: '#6366f1' },
    { label: t.dashboard.stats.tasksInProgress, value: tasks.filter(t => t.status !== 'done').length, icon: Clock, color: '#f97316' },
    { label: t.dashboard.stats.completedTasks, value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle, color: '#22c55e' },
    { label: t.dashboard.stats.productivity, value: `${productivity}%`, icon: TrendingUp, color: '#8b5cf6' },
  ];

  const importantTasks = tasks.filter(t => t.priority === 'important');
  const otherTasks = tasks.filter(t => t.priority !== 'important');

  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const pausedProjectsCount = projects.filter(p => p.status === 'paused').length;
  const totalProjectTasks = projects.reduce((sum, p) => sum + p.tasksCount, 0);
  const completedProjectTasks = projects.reduce((sum, p) => sum + p.completedTasksCount, 0);
  const projectCompletionRate = totalProjectTasks > 0 ? Math.round((completedProjectTasks / totalProjectTasks) * 100) : 0;

  return (
    <div className="page-fade space-y-12 pb-20">
      {/* Header with Welcome message */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight">
              {t.dashboard.welcome} {user?.firstName || 'John'}
            </h1>
          </div>
          <p className="text-text-dim text-lg">
            {t.dashboard.ready}
          </p>
        </div>

        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 max-w-md p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl flex items-center justify-between gap-4 group hover:border-red-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-red-500 uppercase tracking-widest">{t.sidebar.creatorMode}</p>
                <p className="text-sm text-text-main font-medium">{t.dashboard.manageEdwin}</p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                {t.dashboard.openPanel}
              </button>
            </Link>
          </motion.div>
        )}
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-glass-bg border border-glass-border text-text-main font-semibold hover:bg-glass-hover transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.newTask}
          </button>
          
          <button
            onClick={() => {
              setCurrentProject(null);
              setProjectModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 px-6 rounded-2xl"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.newProject}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-medium text-text-dim mb-1 group-hover:text-text-main transition-colors">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-text-main">{stat.value}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-glass-bg group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Section */}
      {currentWorkspace && (
        <div className="mb-8">
          <TeamSection workspaceId={currentWorkspace._id} />
        </div>
      )}

      {/* Mes Business - Full Width Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] border border-glass-border bg-bg-secondary/70 p-6 md:p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)] mb-6"
        >
          <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            {/* Title row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim">
                  <LayoutGrid className="w-3.5 h-3.5 text-accent-primary" />
                  {currentWorkspace?.name}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight flex items-center gap-3">
                  <FolderKanban className="w-7 h-7 text-accent-primary" />
                  {t.dashboard.myBusiness}
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent-primary/20 hover:opacity-90 transition-all flex-shrink-0 self-start"
              >
                {t.dashboard.manageAll}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  {t.projectsPage.stats.active}
                </p>
                <p className="mt-3 text-3xl font-bold text-text-main">{activeProjectsCount}</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  {t.projectsPage.stats.paused}
                </p>
                <p className="mt-3 text-3xl font-bold text-text-main">{pausedProjectsCount}</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  {t.projectsPage.stats.totalTasks}
                </p>
                <p className="mt-3 text-3xl font-bold text-text-main">{totalProjectTasks}</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  {t.projectsPage.stats.completion}
                </p>
                <p className="mt-3 text-3xl font-bold text-text-main">{projectCompletionRate}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-[30px] border-dashed border-2 bg-bg-secondary/40 p-16 text-center">
            <FolderKanban className="mx-auto mb-6 h-16 w-16 text-text-muted opacity-20" />
            <h3 className="mb-2 text-2xl font-bold text-text-main">{t.dashboard.noProjects}</h3>
            <p className="mx-auto mb-8 max-w-md text-sm text-text-dim">{t.dashboard.createFirstProject}</p>
            <button
              onClick={() => setProjectModalOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white"
            >
              {t.dashboard.createProject}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.slice(0, 4).map((project, index) => (
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
                  onEdit={(p) => {
                    setCurrentProject(p);
                    setProjectModalOpen(true);
                  }}
                  onDelete={async (p) => {
                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet ${p.name} ?`)) {
                      try {
                        const response = await fetch(`/api/projects?id=${p._id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` },
                        });
                        const data = await response.json();
                        if (data.success) {
                          deleteProject(p._id);
                          toast.success('Projet supprimé !');
                        } else {
                          toast.error(data.error || 'Erreur lors de la suppression');
                        }
                      } catch {
                        toast.error('Erreur de connexion');
                      }
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Main Grid: Priorities & Calendar/Routines */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Priorities */}
        <div className="xl:col-span-8 space-y-12">
          {/* Priorities Section - Better spacing */}
          <section>
            <h2 className="section-title flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              {t.dashboard.priorityTasks}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Important Column */}
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    {t.dashboard.crucial}
                  </span>
                  <span className="text-xs text-text-dim bg-glass-bg px-2 py-0.5 rounded-full border border-glass-border">{importantTasks.length} tâches</span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {importantTasks.map(task => (
                      <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                    ))}
                  </AnimatePresence>
                  {importantTasks.length === 0 && (
                    <div className="text-center py-8 text-text-muted text-sm italic">
                      {t.dashboard.noCrucialTasks}
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting/Less Important Column - Merged for clarity */}
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-accent-primary font-bold text-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-accent-primary" />
                    {t.dashboard.upcoming}
                  </span>
                  <span className="text-xs text-text-dim bg-glass-bg px-2 py-0.5 rounded-full border border-glass-border">{otherTasks.length} tâches</span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {otherTasks.map(task => (
                      <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                    ))}
                  </AnimatePresence>
                  {otherTasks.length === 0 && (
                    <div className="text-center py-8 text-text-muted text-sm italic">
                      {t.dashboard.noUpcomingTasks}
                    </div>
                  )}
                  <button 
                    onClick={() => setTaskModalOpen(true)}
                    className="w-full p-4 rounded-2xl bg-glass-bg border border-glass-border border-dashed flex items-center justify-center gap-2 text-text-dim hover:text-text-main hover:bg-glass-hover hover:border-accent-primary/30 transition-all group"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">{t.dashboard.addTask}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Calendar & Sidebar Info */}
        <div className="xl:col-span-4 space-y-10">


          {/* Quick routine mini-view */}
          <section className="glass-card">
            <h2 className="section-title !m-0 !mb-4 flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              {t.dashboard.dailyRoutine}
            </h2>
            <div className="space-y-3">
              {routines.map(routine => (
                <div key={routine._id} className="flex items-center justify-between p-3 bg-glass-bg rounded-xl group hover:bg-glass-hover transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: routine.color }} />
                    <span className="text-sm font-medium text-text-main">{routine.title}</span>
                  </div>
                  <button className="p-1.5 rounded-lg text-text-dim group-hover:text-text-main transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Full Routine Section at the bottom */}
      <section className="pt-8">
        <h2 className="section-title flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          {t.dashboard.weeklyFollowup}
        </h2>
        <div className="glass-card">
          <RoutineCalendar routines={routines} />
        </div>
      </section>
    </div>
  );
}
