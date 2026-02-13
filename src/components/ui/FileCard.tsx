'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, FileText, FileImage, FileCode, Trash2, Download, ExternalLink, MoreVertical, Edit2, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { DriveFile } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

interface FileCardProps {
  file: DriveFile;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImage className="w-8 h-8" />;
  if (type.includes('pdf')) return <FileText className="w-8 h-8" />;
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <FileCode className="w-8 h-8" />;
  return <File className="w-8 h-8" />;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FileCard({ file }: FileCardProps) {
  const { deleteDriveFile, updateDriveFile } = useAppStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm('Supprimer définitivement ce fichier ?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/drive/files/${file._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        deleteDriveFile(file._id);
        toast.success('Fichier supprimé');
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    const newName = prompt('Nouveau nom du fichier :', file.name);
    if (!newName || newName === file.name || !token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/drive/files/${file._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (res.ok) {
        updateDriveFile(file._id, { name: data.name });
        toast.success('Fichier renommé');
      } else {
        toast.error('Erreur lors du renommage');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(file.url);
    toast.success('Lien copié');
    setMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="glass-card group p-5 flex flex-col gap-4 relative"
    >
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Type Badge */}
      <div className="flex items-center justify-between relative">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
          {getFileIcon(file.type)}
        </div>
        
        <div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 min-w-[180px] glass-card border-white/10 z-30 p-1.5 shadow-2xl overflow-hidden"
                >
                  <button onClick={handleRename} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">
                    <Edit2 className="w-4 h-4" /> Renommer
                  </button>
                  <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">
                    <LinkIcon className="w-4 h-4" /> Copier le lien
                  </button>
                  <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">
                    <Download className="w-4 h-4" /> Télécharger
                  </a>
                  <div className="h-px bg-white/5 my-1.5 mx-2" />
                  <button onClick={handleDelete} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-red-500/70 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all uppercase tracking-widest">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
          {file.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{file.type.split('/')[1] || 'FILE'}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{formatSize(file.size)}</span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
          {new Date(file.createdAt).toLocaleDateString()}
        </span>
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
        >
          Ouvrir <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
