'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FolderPlus, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Grid3X3, 
  List as ListIcon,
  HardDrive,
  Loader2
} from 'lucide-react';
import { FileCard, FolderCard } from '@/components/ui';
import { useAppStore, useAuthStore } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';

export default function DrivePage() {
  const { 
    driveFiles, 
    driveFolders, 
    projects,
    setUploadModalOpen,
    setCreateFolderModalOpen,
    setDriveFiles,
    setDriveFolders
  } = useAppStore();
  
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [apiPath, setApiPath] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDrive = async () => {
      if (!token) return;
      setLoading(true);
      try {
        let url = `/api/drive?`;
        if (projectId) url += `project=${projectId}&`;
        if (currentFolderId) url += `folderId=${currentFolderId}&`;
        if (searchQuery) url += `search=${searchQuery}`;

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.folders) setDriveFolders(data.folders);
        if (data.files) setDriveFiles(data.files);
        if (data.path) setApiPath(data.path);
      } catch (err) {
        console.error('Failed to fetch drive:', err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      const timer = setTimeout(() => {
        fetchDrive();
      }, searchQuery ? 500 : 0); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [mounted, token, projectId, currentFolderId, searchQuery, setDriveFiles, setDriveFolders]);

  if (!mounted) return null;

  const selectedProject = projects.find(p => p._id === projectId);

  // Filter logic
  const filteredFolders = driveFolders.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !projectId || f.project === projectId;
    const matchesParent = searchQuery ? true : ((f.parentId || null) === (currentFolderId || null));
    return matchesSearch && matchesProject && matchesParent;
  });

  const filteredFiles = driveFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !projectId || f.project === projectId;
    const matchesParent = searchQuery ? true : ((f.folderId || null) === (currentFolderId || null));
    return matchesSearch && matchesProject && matchesParent;
  });

  // Breadcrumbs logic
  const getBreadcrumbs = () => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Drive' }];
    apiPath.forEach(p => crumbs.push({ id: p._id, name: p.name }));
    return crumbs;
  };

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
              <HardDrive className="w-8 h-8 text-indigo-400" />
              {selectedProject ? `Drive - ${selectedProject.name}` : 'Mon Drive Global'}
            </h1>
            <p className="text-gray-500 mt-1 uppercase text-[10px] font-bold tracking-widest">
              {filteredFiles.length} fichiers • {filteredFolders.length} dossiers
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateFolderModalOpen(true, projectId || undefined, currentFolderId || undefined)}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-white/[0.03] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.08] transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            Dossier
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setUploadModalOpen(true, projectId || undefined, currentFolderId || undefined)}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Upload className="w-4 h-4" />
            Nouveau fichier
          </motion.button>
        </div>
      </motion.div>

      {/* Toolbar & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-white/5">
        <div className="flex items-center gap-2 text-sm font-medium">
          {getBreadcrumbs().map((crumb, idx) => (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-700" />}
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`hover:text-white transition-colors uppercase tracking-widest text-[10px] ${
                  crumb.id === currentFolderId ? 'text-white font-bold' : 'text-gray-500'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all w-64"
            />
          </div>
          <div className="flex items-center bg-white/[0.03] rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-500 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-500 hover:text-white'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Section */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredFolders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Dossiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFolders.map(folder => (
                <FolderCard key={folder._id} folder={folder} onClick={setCurrentFolderId} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Files Section */}
      {!loading && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Fichiers récents</h2>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
          }>
            <AnimatePresence mode="popLayout">
              {filteredFiles.map(file => (
                <FileCard key={file._id} file={file} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!loading && filteredFiles.length === 0 && filteredFolders.length === 0 && (
        <div className="text-center py-32 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
          <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-20" />
          <p className="text-gray-500 font-medium tracking-wide">Ce dossier est vide</p>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Uploader mon premier fichier
          </button>
        </div>
      )}
    </div>
  );
}
