'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Grid3X3, List, CheckCircle, ChevronLeft } from 'lucide-react';
import TaskCard from '@/components/ui/TaskCard';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import type { TaskPriority } from '@/types';


import { useAppStore, useAuthStore } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const { tasks, projects, isTaskModalOpen, setTaskModalOpen, setTasks, updateTask } = useAppStore();
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');
  const [mounted, setMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

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
        updateTask(taskId, { status: newStatus });
        toast.success(newStatus === 'done' ? 'Tâche terminée !' : 'Tâche rétablie');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  React.useEffect(() => {
    setMounted(true);
    
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setTasks(data.data);
        }
      } catch {
        toast.error('Erreur lors du chargement des tâches');
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token, setTasks]);

  if (!mounted) return null;

  const selectedProject = projects.find(p => p._id === projectId);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    // Le projet peut être un ID (string) ou un objet peuplé
    const taskProjectId = typeof task.project === 'object' ? (task.project as { _id: string })?._id : task.project;
    const matchesProject = !projectId || taskProjectId === projectId;
    
    return matchesSearch && matchesPriority && matchesProject;
  });

  // Group by priority for Kanban
  const importantTasks = filteredTasks.filter(t => t.priority === 'important');
  const lessImportantTasks = filteredTasks.filter(t => t.priority === 'less_important');
  const waitingTasks = filteredTasks.filter(t => t.priority === 'waiting');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          {projectId && (
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              {!projectId && <CheckCircle className="w-8 h-8 text-indigo-400" />}
              {selectedProject ? `To Do - ${selectedProject.name}` : 'To Do Global'}
            </h1>
            <p className="text-gray-500 mt-1">
              {filteredTasks.length} tâches {selectedProject ? 'pour ce projet' : 'au total'}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTaskModalOpen(true)}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tâche
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une tâche..."
            className="w-full pl-12 pr-4 py-3 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
            className="px-4 py-3 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:border-indigo-500 focus:outline-none transition-all duration-200"
          >
            <option value="all">Toutes les priorités</option>
            <option value="important">Important</option>
            <option value="less_important">Moins important</option>
            <option value="waiting">En attente</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => setViewMode('kanban')}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${viewMode === 'kanban' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-white'}
            `}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-white'}
            `}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Important Column */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h3 className="text-sm font-semibold text-white">Important</h3>
              <span className="ml-auto text-xs text-gray-500 bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">
                {importantTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {importantTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                ))}
              </AnimatePresence>
              {importantTasks.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Aucune tâche importante</p>
              )}
            </div>
          </div>

          {/* Less Important Column */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="text-sm font-semibold text-white">Moins important</h3>
              <span className="ml-auto text-xs text-gray-500 bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">
                {lessImportantTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {lessImportantTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                ))}
              </AnimatePresence>
              {lessImportantTasks.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Aucune tâche</p>
              )}
            </div>
          </div>

          {/* Waiting Column */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <h3 className="text-sm font-semibold text-white">En attente</h3>
              <span className="ml-auto text-xs text-gray-500 bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">
                {waitingTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {waitingTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
                ))}
              </AnimatePresence>
              {waitingTasks.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Aucune tâche en attente</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
              ))}
            </AnimatePresence>
            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">Aucune tâche trouvée</p>
            )}
          </div>
        </motion.div>
      )}

      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        defaultProjectId={projectId || undefined}
      />
    </div>
  );
}
