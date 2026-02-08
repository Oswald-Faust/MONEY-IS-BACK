'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle,
  Clock,
  TrendingUp,
  FolderKanban,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import ProjectCard from '@/components/ui/ProjectCard';
import TaskCard from '@/components/ui/TaskCard';
import CustomCalendar from '@/components/ui/CustomCalendar';
import RoutineCalendar from '@/components/ui/RoutineCalendar';
import { useAppStore, useAuthStore } from '@/store';
import type { Project, Task, Routine } from '@/types';

// Demo data for initialization
const demoProjects: Project[] = [
  { _id: '1', name: 'FINEA', description: 'Application de gestion financière', color: '#22c55e', icon: 'folder', workspace: '1', owner: '1', members: [], status: 'active', tasksCount: 12, completedTasksCount: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '2', name: 'BUISPACE', description: 'Plateforme immobilière', color: '#f97316', icon: 'folder', workspace: '1', owner: '1', members: [], status: 'active', tasksCount: 18, completedTasksCount: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '3', name: 'AFFI', description: 'Système d\'affiliation', color: '#ef4444', icon: 'folder', workspace: '1', owner: '1', members: [], status: 'active', tasksCount: 7, completedTasksCount: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '4', name: 'MATHIAS', description: 'Projets personnels', color: '#94a3b8', icon: 'folder', workspace: '1', owner: '1', members: [], status: 'active', tasksCount: 4, completedTasksCount: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '5', name: 'AGBK', description: 'Business Development', color: '#8b5cf6', icon: 'folder', workspace: '1', owner: '1', members: [], status: 'active', tasksCount: 9, completedTasksCount: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const demoTasks: Task[] = [
  { _id: '1', title: 'CRÉE PAMM MAT & NICO', project: '1', projectName: 'FINEA', projectColor: '#22c55e', creator: '1', priority: 'important', status: 'todo', tags: [], subtasks: [], attachments: [], comments: [], order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '2', title: 'PAIEMENT EN PLUSIEURS FOIS', project: '2', projectName: 'BUISPACE', projectColor: '#f97316', creator: '1', priority: 'important', status: 'todo', tags: [], subtasks: [], attachments: [], comments: [], order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '3', title: 'BRANCHER ALGOMATIC', project: '2', projectName: 'BUISPACE', projectColor: '#f97316', creator: '1', priority: 'important', status: 'todo', tags: [], subtasks: [], attachments: [], comments: [], order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '8', title: 'INTÉGRET OUTILS COMPARAISON', project: '1', projectName: 'FINEA', projectColor: '#22c55e', creator: '1', priority: 'waiting', status: 'todo', tags: [], subtasks: [], attachments: [], comments: [], order: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '9', title: 'PROMO JEU CONCOURS', project: '1', projectName: 'FINEA', projectColor: '#22c55e', creator: '1', priority: 'waiting', status: 'todo', tags: [], subtasks: [], attachments: [], comments: [], order: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const demoRoutines: Routine[] = [
  { _id: '1', title: 'Post Instagram', description: 'Publication Instagram', project: '4', projectColor: '#ef4444', creator: '1', days: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true }, isActive: true, color: '#ef4444', completedDates: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '2', title: 'Story Review', description: 'Check analytics', project: '4', projectColor: '#8b5cf6', creator: '1', days: { monday: false, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true }, isActive: true, color: '#8b5cf6', completedDates: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
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
    deleteProject
  } = useAppStore();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Initialize store with demo data if empty
  useEffect(() => {
    if (projects.length === 0) setProjects(demoProjects);
    if (tasks.length === 0) setTasks(demoTasks);
    if (routines.length === 0) setRoutines(demoRoutines);
  }, [projects.length, tasks.length, routines.length, setProjects, setTasks, setRoutines]);

  const stats = [
    { label: 'Projets Actifs', value: projects.length, icon: FolderKanban, color: '#6366f1' },
    { label: 'Tâches en cours', value: tasks.filter(t => t.status !== 'done').length, icon: Clock, color: '#f97316' },
    { label: 'Tâches terminées', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle, color: '#22c55e' },
    { label: 'Productivité', value: '78%', icon: TrendingUp, color: '#8b5cf6' },
  ];

  const importantTasks = tasks.filter(t => t.priority === 'important');
  const otherTasks = tasks.filter(t => t.priority !== 'important');

  return (
    <div className="page-fade space-y-12 pb-20">
      {/* Header with Welcome message */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Bonjour, {user?.firstName || 'Mathias'}
            </h1>
          </div>
          <p className="text-dim text-lg">
            Tout est prêt pour une journée productive.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle tâche
          </button>
          
          <button
            onClick={() => {
              setCurrentProject(null);
              setProjectModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 px-6"
          >
            <Plus className="w-4 h-4" />
            Nouveau projet
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
              <p className="text-sm font-medium text-dim mb-1 group-hover:text-white transition-colors">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mes Business - Full Width Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="relative group">
            <div className="absolute -inset-x-4 -inset-y-2 bg-indigo-500/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="section-title mb-0 flex items-center gap-3 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <LayoutGrid className="w-4 h-4" />
              </div>
              Mes Business
            </h2>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-indigo-400 hover:text-white hover:bg-indigo-500/10 flex items-center gap-2 transition-all group/link">
            Gérer tout 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.slice(0, 4).map((project) => (
            <ProjectCard 
              key={project._id} 
              project={project}
              onEdit={(p) => {
                setCurrentProject(p);
                setProjectModalOpen(true);
              }}
              onDelete={(p) => {
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet ${p.name} ?`)) {
                  deleteProject(p._id);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Main Grid: Priorities & Calendar/Routines */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Priorities */}
        <div className="xl:col-span-8 space-y-12">
          {/* Priorities Section - Better spacing */}
          <section>
            <h2 className="section-title flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              Tâches Prioritaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Important Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    Crucial
                  </span>
                  <span className="text-xs text-dim bg-white/5 px-2 py-0.5 rounded-full">{importantTasks.length} tâches</span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {importantTasks.map(task => (
                      <TaskCard key={task._id} task={task} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Waiting/Less Important Column - Merged for clarity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Prochainement
                  </span>
                  <span className="text-xs text-dim bg-white/5 px-2 py-0.5 rounded-full">{otherTasks.length} tâches</span>
                </div>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {otherTasks.map(task => (
                      <TaskCard key={task._id} task={task} />
                    ))}
                  </AnimatePresence>
                  <button 
                    onClick={() => setTaskModalOpen(true)}
                    className="w-full p-10 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <p className="text-xs font-medium">Libérer mon esprit</p>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Calendar & Sidebar Info */}
        <div className="xl:col-span-4 space-y-10">
          <section className="glass-card !p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                Planning
              </h2>
            </div>
            <div className="p-6">
              <CustomCalendar
                tasks={tasks}
                selectedDate={selectedDate}
                onDateClick={setSelectedDate}
              />
            </div>
          </section>

          {/* Quick routine mini-view */}
          <section className="glass-card">
            <h2 className="section-title !m-0 !mb-4 flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              Routine du jour
            </h2>
            <div className="space-y-3">
              {routines.map(routine => (
                <div key={routine._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: routine.color }} />
                    <span className="text-sm font-medium text-white">{routine.title}</span>
                  </div>
                  <button className="p-1.5 rounded-lg border border-white/10 text-dim group-hover:text-white transition-colors">
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
          Suivi Hebdomadaire
        </h2>
        <div className="glass-card">
          <RoutineCalendar routines={routines} />
        </div>
      </section>
    </div>
  );
}
