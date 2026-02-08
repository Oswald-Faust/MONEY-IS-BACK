'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Lightbulb,
  ChevronLeft
} from 'lucide-react';
import { IdeaCard } from '@/components/ui';
import { useAppStore } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Idea } from '@/types';

export default function IdeasPage() {
  const { ideas, projects, setIdeaModalOpen, addIdea } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Demo data if empty
    if (mounted && ideas.length === 0) {
      const demoIdeas: Idea[] = [
        {
          _id: 'i1',
          title: 'Système de Parrainage',
          content: 'Mettre en place un système où les utilisateurs reçoivent des jetons pour chaque nouvel inscrit.',
          project: '1',
          creator: '1',
          attachments: [],
          tags: ['marketing', 'croissance'],
          status: 'active',
          votes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'i2',
          title: 'Mode Sombre Automatique',
          content: 'L\'interface doit s\'adapter aux réglages du système de l\'utilisateur.',
          project: '2',
          creator: '1',
          attachments: [],
          tags: ['ui', 'ux'],
          status: 'active',
          votes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'i3',
          title: 'Export PDF des Rapports',
          content: 'Permettre aux administrateurs de télécharger les statistiques mensuelles en un clic.',
          creator: '1',
          attachments: [],
          tags: ['feature'],
          status: 'active',
          votes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      demoIdeas.forEach(i => addIdea(i));
    }
  }, [mounted, ideas.length, addIdea]);

  if (!mounted) return null;

  const selectedProject = projects.find(p => p._id === projectId);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         idea.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !projectId || idea.project === projectId;
    return matchesSearch && matchesProject;
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
              <Lightbulb className="w-8 h-8 text-amber-500" />
              {selectedProject ? `Idées - ${selectedProject.name}` : 'Boîte à Idées'}
            </h1>
            <p className="text-gray-500 mt-1 uppercase text-[10px] font-bold tracking-widest">
              {filteredIdeas.length} {filteredIdeas.length > 1 ? 'idées partagées' : 'idée partagée'}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIdeaModalOpen(true)}
          className="px-6 py-2.5 rounded-xl flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          Nouvelle idée
        </motion.button>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 py-4 border-y border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une idée, un concept..."
            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredIdeas.map(idea => (
            <IdeaCard key={idea._id} idea={idea} />
          ))}
        </AnimatePresence>
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-32 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
          <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-20" />
          <p className="text-gray-500 font-medium tracking-wide">Aucune idée trouvée</p>
          <button 
            onClick={() => setIdeaModalOpen(true)}
            className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Lancer la première idée
          </button>
        </div>
      )}
    </div>
  );
}
