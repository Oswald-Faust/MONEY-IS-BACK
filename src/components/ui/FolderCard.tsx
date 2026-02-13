'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Trash2, Edit2, Loader2, MoreVertical } from 'lucide-react';
import type { DriveFolder } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

interface FolderCardProps {
  folder: DriveFolder;
  onClick: (id: string) => void;
}

export default function FolderCard({ folder, onClick }: FolderCardProps) {
  const { deleteDriveFolder, updateDriveFolder } = useAppStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Supprimer ce dossier et tout son contenu ?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/drive/folders/${folder._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        deleteDriveFolder(folder._id);
        toast.success('Dossier supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Nouveau nom du dossier :', folder.name);
    if (!newName || newName === folder.name || !token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/drive/folders/${folder._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (res.ok) {
        updateDriveFolder(folder._id, { name: data.name });
        toast.success('Dossier renommé');
      } else {
        toast.error('Erreur lors du renommage');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card group p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.04] transition-all relative"
      onClick={() => onClick(folder._id)}
    >
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        </div>
      )}

      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
        <Folder className="w-6 h-6 fill-current opacity-40" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
          {folder.name}
        </h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-medium">Dossier</p>
      </div>

      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 min-w-[160px] glass-card border-white/10 z-30 p-1.5 shadow-2xl overflow-hidden"
              >
                <button onClick={handleRename} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">
                  <Edit2 className="w-4 h-4" /> Renommer
                </button>
                <div className="h-px bg-white/5 my-1.5 mx-2" />
                <button onClick={handleDelete} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-red-500/70 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all uppercase tracking-widest">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
