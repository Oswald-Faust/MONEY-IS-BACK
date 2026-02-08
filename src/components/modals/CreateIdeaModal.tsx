'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Loader2, Plus, Paperclip, Image as ImageIcon, File as FileIcon, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import toast from 'react-hot-toast';
import type { Attachment } from '@/types';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateIdeaModal({ isOpen, onClose }: CreateIdeaModalProps) {
  const { projects, addIdea } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project: '',
    status: 'active' as const,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Le titre est requis');
    
    setLoading(true);
    try {
      // Create attachment objects
      const processedAttachments: Attachment[] = attachments.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file), // Local preview URL
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));

      const newIdea = {
        _id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        content: formData.content,
        project: formData.project || undefined,
        creator: '1',
        attachments: processedAttachments,
        tags: formData.tags,
        status: formData.status,
        votes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addIdea(newIdea);
      toast.success('Idée ajoutée avec succès');
      onClose();
      setFormData({
        title: '',
        content: '',
        project: '',
        status: 'active',
        tags: [],
      });
      setAttachments([]);
    } catch {
      toast.error('Erreur lors de l\'ajout de l\'idée');
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
          className="relative w-full max-w-lg bg-[#12121a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Nouvelle Idée</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Titre de l&apos;idée</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Refonte du tunnel de vente"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Projet</label>
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 appearance-none"
                >
                  <option value="">Idée Libre</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Contenu / Description</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez votre idée en quelques mots..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 flex items-center gap-1"
                    >
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3 hover:text-white" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-amber-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Pièces Jointes</label>
                <div className="grid grid-cols-1 gap-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-xl group/file">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-amber-500" />
                        ) : (
                          <FileIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-300 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(idx)}
                        className="p-1 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="relative flex flex-col items-center justify-center p-4 py-6 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-amber-500/30 transition-all cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Paperclip className="w-6 h-6 text-gray-600 group-hover:text-amber-500 transition-colors mb-2" />
                    <span className="text-xs text-gray-500 group-hover:text-gray-400">Ajouter des photos ou documents</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer l\'Idée'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
