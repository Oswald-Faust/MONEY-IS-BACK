'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const { token } = useAuthStore();
  const { projects, addDriveFolder, createFolderProjectId, createFolderParentId } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [parentId, setParentId] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setProjectId(createFolderProjectId || '');
      setParentId(createFolderParentId || '');
    }
  }, [isOpen, createFolderProjectId, createFolderParentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !token) return toast.error('Le nom du dossier est requis');
    
    setLoading(true);
    try {
      const res = await fetch('/api/drive/folders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name, 
          projectId: projectId || null, 
          parentId: parentId || null 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addDriveFolder(data);
        toast.success('Dossier créé');
        onClose();
        setName('');
        setProjectId('');
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#12121a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Nouveau dossier</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Nom du dossier</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Factures"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Projet (optionnel)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 appearance-none"
              >
                <option value="">Aucun projet</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer le dossier'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
