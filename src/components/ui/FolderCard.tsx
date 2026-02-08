'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Trash2, Edit2 } from 'lucide-react';
import type { DriveFolder } from '@/types';
import { useAppStore } from '@/store';

interface FolderCardProps {
  folder: DriveFolder;
  onClick: (id: string) => void;
}

export default function FolderCard({ folder, onClick }: FolderCardProps) {
  const { deleteDriveFolder } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card group p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.04] transition-all"
      onClick={() => onClick(folder._id)}
    >
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
        <Folder className="w-6 h-6 fill-current opacity-40" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">{folder.name}</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Dossier</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Edit logic
          }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Supprimer ce dossier ?')) {
              deleteDriveFolder(folder._id);
            }
          }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
