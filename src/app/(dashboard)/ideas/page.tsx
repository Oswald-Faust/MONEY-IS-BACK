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
import { useAppStore, useAuthStore } from '@/store';
import { CreateIdeaModal } from '@/components/modals';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function IdeasPage() {
  const { ideas, projects, setIdeaModalOpen, setIdeas, currentWorkspace } = useAppStore();
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');
  
  const [mounted, setMounted] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any>(null); // State for editing from URL

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'raw' | 'standby' | 'in_progress' | 'implemented'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Handle URL params for direct idea access
  useEffect(() => {
    const ideaId = searchParams.get('ideaId');
    if (ideaId && token) {
        fetch(`/api/ideas?id=${ideaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setEditingIdea(data.data);
            }
        })
        .catch(err => console.error(err));
    }
  }, [searchParams, token]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!token || !currentWorkspace) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/ideas?workspace=${currentWorkspace._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setIdeas(data.data);
        } else {
          toast.error(data.error || 'Erreur lors du chargement des idées');
          setIdeas([]);
        }
      } catch {
        toast.error('Erreur lors du chargement des idées');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && currentWorkspace) {
      fetchIdeas();
    }
  }, [token, setIdeas, currentWorkspace]);

  if (!mounted) return null;

  const selectedProject = projects.find(p => p._id === projectId);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         idea.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !projectId || 
      (typeof idea.project === 'object' ? (idea.project as { _id: string })?._id === projectId : idea.project === projectId);
    const matchesStatus = activeTab === 'all' || idea.status === activeTab;
    
    return matchesSearch && matchesProject && matchesStatus;
  });

  const tabs = [
    { id: 'all', label: 'Toutes' },
    { id: 'raw', label: 'Premier Degré' },
    { id: 'standby', label: 'Standby' },
    { id: 'in_progress', label: 'En Cours' },
    { id: 'implemented', label: 'Terminé' },
  ];

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

      {/* Toolbar & Tabs */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une idée, un concept..."
            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'raw' | 'standby' | 'in_progress' | 'implemented')}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                  : 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredIdeas.map(idea => (
            <div key={idea._id} className="relative group">
              <IdeaCard idea={idea} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {!isLoading && filteredIdeas.length === 0 && (
        <div className="text-center py-32 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
          <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-20" />
          <p className="text-gray-500 font-medium tracking-wide">Aucune idée trouvée pour ce filtre</p>
          <button 
            onClick={() => setIdeaModalOpen(true)}
            className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Lancer une nouvelle idée
          </button>
        </div>
      )}

      {/* Edit Idea Modal (from URL) */}
      <CreateIdeaModal 
        isOpen={!!editingIdea} 
        onClose={() => {
            setEditingIdea(null);
            const url = new URL(window.location.href);
            url.searchParams.delete('ideaId');
            window.history.replaceState({}, '', url);
        }} 
        initialData={editingIdea}
        workspaceId={currentWorkspace?._id}
      />
    </div>
  );
}
