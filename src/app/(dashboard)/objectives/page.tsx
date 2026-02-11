'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Filter, Plus, Search, Target, Loader2 } from 'lucide-react';
import { ObjectiveCard } from '@/components/ui';
import { useAppStore, useAuthStore } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ObjectivesPage() {
  const { objectives, projects, setObjectiveModalOpen, setObjectives } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchObjectives = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/objectives', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setObjectives(data.data);
        } else {
          toast.error(data.error || 'Erreur lors du chargement des objectifs');
        }
      } catch {
        toast.error('Erreur lors du chargement des objectifs');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchObjectives();
    }
  }, [token, setObjectives]);

  if (!mounted) return null;

  const selectedProject = projects.find(p => p._id === projectId);

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || obj.priority === filterPriority;
    // Le projet peut être un ID (string) ou un objet peuplé
    const objectiveProjectId = typeof obj.project === 'object' ? (obj.project as { _id: string })?._id : obj.project;
    const matchesProject = !projectId || objectiveProjectId === projectId;
    return matchesSearch && matchesPriority && matchesProject;
  });

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
              {!projectId && <Target className="w-8 h-8 text-indigo-400" />}
              {selectedProject ? `Objectifs - ${selectedProject.name}` : 'Objectifs Globaux'}
            </h1>
            <p className="text-gray-500 mt-1">
              {filteredObjectives.length} objectifs {selectedProject ? 'pour ce projet' : 'au total'}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setObjectiveModalOpen(true)}
          className="
            px-4 py-2.5 rounded-xl flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white font-medium text-sm
            hover:from-indigo-500 hover:to-purple-500
            transition-all duration-200
          "
        >
          <Plus className="w-4 h-4" />
          Nouvel objectif
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un objectif..."
            className="w-full pl-12 pr-4 py-3 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="px-4 py-3 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:border-indigo-500 focus:outline-none transition-all duration-200"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredObjectives.map((objective) => (
            <motion.div
              key={objective._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ObjectiveCard objective={objective} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredObjectives.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
          <p className="text-gray-500">Aucun objectif trouvé</p>
        </div>
      ) : null}
    </div>
  );
}
