'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FolderKanban } from 'lucide-react';
import ProjectCard from '@/components/ui/ProjectCard';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import { useAppStore } from '@/store';
import type { Project } from '@/types';

// Demo data
const demoProjects: Project[] = [
  {
    _id: '1',
    name: 'FINEA',
    description: 'Application de gestion financière',
    color: '#22c55e',
    icon: 'folder',
    workspace: '1',
    owner: '1',
    members: [],
    status: 'active',
    tasksCount: 12,
    completedTasksCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'BUISPACE',
    description: 'Plateforme immobilière',
    color: '#f97316',
    icon: 'folder',
    workspace: '1',
    owner: '1',
    members: [],
    status: 'active',
    tasksCount: 18,
    completedTasksCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'AFFI',
    description: 'Système d\'affiliation',
    color: '#ef4444',
    icon: 'folder',
    workspace: '1',
    owner: '1',
    members: [],
    status: 'active',
    tasksCount: 7,
    completedTasksCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'MATHIAS',
    description: 'Projets personnels',
    color: '#94a3b8',
    icon: 'folder',
    workspace: '1',
    owner: '1',
    members: [],
    status: 'active',
    tasksCount: 4,
    completedTasksCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'AGBK',
    description: 'Business Development',
    color: '#8b5cf6',
    icon: 'folder',
    workspace: '1',
    owner: '1',
    members: [],
    status: 'active',
    tasksCount: 9,
    completedTasksCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ProjectsPage() {
  const { projects: storeProjects, setProjectModalOpen, isProjectModalOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'paused'>('all');

  // Combine store projects with demo projects
  const allProjects = [...demoProjects, ...storeProjects];

  // Filter projects
  const filteredProjects = allProjects.filter((project) => {
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
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-indigo-400" />
            Mes Projets
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredProjects.length} projets
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setProjectModalOpen(true)}
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
              bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
              rounded-xl text-white placeholder-gray-500
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
                  : 'bg-[rgba(255,255,255,0.03)] text-gray-400 border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)]'}
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
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
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
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Paused Projects */}
        {pausedProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
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
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Projects */}
        {archivedProjects.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
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
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Créez votre premier projet pour commencer'}
            </p>
            <button
              onClick={() => setProjectModalOpen(true)}
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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
}
