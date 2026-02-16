'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  FolderKanban, 
  CheckSquare, 
  Target, 
  Lightbulb, 
  Command, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'project' | 'task' | 'objective' | 'idea';
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  href: string;
  status?: string;
  priority?: string;
}

export default function GlobalSearch() {
  const { isSearchModalOpen, setSearchModalOpen, currentWorkspace } = useAppStore();
  const { token } = useAuthStore();
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const handleSearch = async (q: string) => {
      if (!token || !currentWorkspace) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&workspaceId=${currentWorkspace._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, token, currentWorkspace]);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isSearchModalOpen]);

  // Keyboard shortcut CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    }
  };

  const navigateToResult = (result: SearchResult) => {
    setSearchModalOpen(false);
    router.push(result.href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderKanban className="w-5 h-5" />;
      case 'task': return <CheckSquare className="w-5 h-5" />;
      case 'objective': return <Target className="w-5 h-5" />;
      case 'idea': return <Lightbulb className="w-5 h-5" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'important': return 'text-red-400 bg-red-400/10';
      case 'less_important': return 'text-amber-400 bg-amber-400/10';
      case 'waiting': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <AnimatePresence>
      {isSearchModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <div className="bg-[#1a1a24]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* SearchBar */}
              <div className="relative flex items-center p-4 border-b border-white/5 bg-white/5">
                <Search className="w-6 h-6 text-indigo-400 mr-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher des projets, tâches, objectifs..."
                  className="w-full bg-transparent border-none focus:outline-none text-xl text-white placeholder-gray-500"
                />
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                      <Command className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider font-mono">K</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setSearchModalOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {query.length < 2 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">Recherche Globale</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">
                      Tapez au moins 2 caractères pour rechercher dans tout votre espace de travail.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                       {['Projets', 'Tâches', 'Objectifs', 'Idées'].map(tag => (
                         <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-gray-500">
                           {tag}
                         </span>
                       ))}
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {results.map((result, index) => (
                      <motion.div
                        key={`${result.type}-${result.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => navigateToResult(result)}
                        className={`
                          flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200
                          ${selectedIndex === index 
                            ? 'bg-indigo-500/20 border border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                            : 'hover:bg-white/5 border border-transparent'}
                        `}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: `${result.color}20` }}
                        >
                          <div 
                            className="absolute inset-x-0 bottom-0 h-1" 
                            style={{ backgroundColor: result.color }}
                          />
                          <div style={{ color: result.color }}>
                            {getIcon(result.type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white truncate">{result.title}</h4>
                            {result.priority && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${getPriorityColor(result.priority)}`}>
                                {result.priority.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                        </div>

                        {selectedIndex === index && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-indigo-400 flex items-center gap-1 text-xs font-medium"
                          >
                            Ouvrir <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : !isLoading && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">Aucun résultat</h3>
                    <p className="text-gray-400">
                      Nous n&apos;avons rien trouvé pour &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">↑↓</span>
                    Naviguer
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">⏎</span>
                    Sélectionner
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">ESC</span>
                    Fermer
                  </div>
                </div>
                <div className="text-[10px] text-indigo-400/50 font-bold uppercase tracking-[0.2em]">
                  MONEY IS BACK SEARCH
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
