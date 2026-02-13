'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FolderKanban } from 'lucide-react';
import ProjectCard from '@/components/ui/ProjectCard';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import EditTaskModal from '@/components/modals/EditTaskModal';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store';

import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';

export default function ProjectsPage() {
  const { projects, setProjects, setProjectModalOpen, isProjectModalOpen, setCurrentProject, deleteProject } = useAppStore();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'paused'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<any>(null);
  const searchParams = useSearchParams();

  // Handle URL params for direct task access
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && token) {
        // Fetch task details
        fetch(`/api/tasks?id=${taskId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setEditingTask(data.data);
            }
        })
        .catch(err => console.error(err));
    }
  }, [searchParams, token]);

  const handleDeleteProject = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet ${name} ?`)) {
      try {
        const response = await fetch(`/api/projects?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        if (data.success) {
          deleteProject(id);
          toast.success('Projet supprimé !');
        } else {
          toast.error(data.error || 'Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur de connexion');
      }
    }
  };

  const handleEditProject = (project: any) => {
    setCurrentProject(project);
    setProjectModalOpen(true);
  };

  // Charger les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setProjects(data.data);
        } else {
          toast.error(data.error || 'Erreur lors du chargement des projets');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Erreur de connexion au serveur');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token, setProjects]);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group by status
  const activeProjects = filteredProjects.filter(p => p.status === 'active');
  const archivedProjects = filteredProjects.filter(p => p.status === 'archived');
  const pausedProjects = filteredProjects.filter(p => p.status === 'paused');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-main flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-indigo-400" />
            Mes Projets
          </h1>
          <p className="text-dim mt-1">
            {filteredProjects.length} projets
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setCurrentProject(null);
            setProjectModalOpen(true);
          }}
          className="
            px-4 py-2.5 rounded-xl flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white font-medium text-sm
            hover:from-indigo-500 hover:to-purple-500
            transition-all duration-200
          "
        >
          <Plus className="w-4 h-4" />
          Nouveau projet
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
            placeholder="Rechercher un projet..."
            className="
              w-full pl-12 pr-4 py-3 text-sm
              bg-glass-bg border border-glass-border
              rounded-xl text-main placeholder-dim
              focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
              transition-all duration-200
            "
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${statusFilter === status
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-glass-bg text-dim border border-glass-border hover:bg-glass-hover'}
              `}
            >
              {status === 'all' && 'Tous'}
              {status === 'active' && 'Actifs'}
              {status === 'paused' && 'En pause'}
              {status === 'archived' && 'Archivés'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-dim">Chargement des projets...</p>
          </div>
        </div>
      ) : (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-dim mb-4 uppercase tracking-wider">
              Projets actifs ({activeProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard 
                    project={project} 
                    onEdit={handleEditProject}
                    onDelete={(p) => handleDeleteProject(p._id, p.name)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Paused Projects */}
        {pausedProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-dim mb-4 uppercase tracking-wider">
              En pause ({pausedProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pausedProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard 
                    project={project} 
                    onEdit={handleEditProject}
                    onDelete={(p) => handleDeleteProject(p._id, p.name)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Projects */}
        {archivedProjects.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-dim mb-4 uppercase tracking-wider">
              Archivés ({archivedProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {archivedProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard 
                    project={project} 
                    onEdit={handleEditProject}
                    onDelete={(p) => handleDeleteProject(p._id, p.name)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FolderKanban className="w-12 h-12 text-dim mx-auto mb-4 opacity-20" />
            <h3 className="text-main font-medium mb-2">Aucun projet trouvé</h3>
            <p className="text-dim text-sm mb-4">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Créez votre premier projet pour commencer'}
            </p>
            <button
              onClick={() => {
                setCurrentProject(null);
                setProjectModalOpen(true);
              }}
              className="
                px-4 py-2 rounded-xl
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white font-medium text-sm
              "
            >
              Créer un projet
            </button>
          </div>
        )}
      </motion.section>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />

      {/* Edit Task Modal (from URL) */}
      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => {
          setEditingTask(null);
          // Clear URL param
          const url = new URL(window.location.href);
          url.searchParams.delete('taskId');
          window.history.replaceState({}, '', url);
        }}
        task={editingTask}
        onUpdate={(updatedTask) => {
             // Optional: update local state if needed, though simpler just to rely on modal
        }}
      />
    </div>
  );
}
