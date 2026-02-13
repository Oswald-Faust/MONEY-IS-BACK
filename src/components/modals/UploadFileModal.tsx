'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, File as FileIcon } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadFileModal({ isOpen, onClose }: UploadFileModalProps) {
  const { token } = useAuthStore();
  const { driveFolders, projects, addDriveFile, uploadProjectId, uploadFolderId } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [folderId, setFolderId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setProjectId(uploadProjectId || '');
      setFolderId(uploadFolderId || '');
    }
  }, [isOpen, uploadProjectId, uploadFolderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) return toast.error('Veuillez sélectionner un fichier');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (projectId) formData.append('projectId', projectId);
      if (folderId) formData.append('folderId', folderId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        addDriveFile(data.file);
        toast.success('Fichier uploadé avec succès');
        onClose();
        setSelectedFile(null);
        setProjectId('');
        setFolderId('');
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Erreur de connexion lors de l\'upload');
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
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Uploader un fichier</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Sélectionner un fichier</label>
              <div className="relative group">
                <input
                  type="file"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`
                  w-full px-4 py-8 bg-white/[0.02] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all
                  ${selectedFile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 group-hover:border-white/20'}
                `}>
                  {selectedFile ? (
                    <>
                      <FileIcon className="w-10 h-10 text-indigo-400 mb-2" />
                      <p className="text-sm text-white font-medium text-center truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">Cliquez ou glissez un fichier</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Projet</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 appearance-none text-sm"
                >
                  <option value="">Aucun</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Dossier</label>
                <select
                  value={folderId}
                  onChange={e => setFolderId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 appearance-none text-sm"
                >
                  <option value="">Racine</option>
                  {driveFolders.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              disabled={loading || !selectedFile}
              className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lancer l\'upload'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
