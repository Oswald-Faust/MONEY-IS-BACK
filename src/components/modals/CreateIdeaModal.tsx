'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Loader2, Plus, Paperclip, Image as ImageIcon, File as FileIcon, Trash2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import type { Idea, Attachment } from '@/types';
import UserSelector from '@/components/ui/UserSelector';

import { useSearchParams } from 'next/navigation';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // Idea type
  workspaceId?: string;
}

export default function CreateIdeaModal({ isOpen, onClose, initialData, workspaceId }: CreateIdeaModalProps) {
  const { projects, addIdea, updateIdea } = useAppStore();
  const { token: authToken } = useAuthStore();
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get('project');
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project: '', 
    status: 'raw' as 'raw' | 'standby' | 'in_progress' | 'implemented' | 'archived',
    tags: [] as string[],
    assignees: [] as string[]
  });

  // Pre-select project or populate from initialData
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Handle assignees: try to get list, fallback to single assignee
        let loadedAssignees: string[] = [];
        if (initialData.assignees && Array.isArray(initialData.assignees)) {
            loadedAssignees = initialData.assignees.map((u: any) => typeof u === 'object' ? u._id : u);
        } else if (initialData.assignee) {
            loadedAssignees = [typeof initialData.assignee === 'object' ? initialData.assignee._id : initialData.assignee];
        }

        setFormData({
            title: initialData.title,
            content: initialData.content,
            project: typeof initialData.project === 'object' ? initialData.project._id : initialData.project || '',
            status: initialData.status,
            tags: initialData.tags || [],
            assignees: loadedAssignees
        });
        // We might want to handle existing attachments here too, but skipped for simplicity
      } else if (defaultProjectId) {
        setFormData(prev => ({ ...prev, project: defaultProjectId }));
      }
    }
  }, [isOpen, defaultProjectId, initialData]);

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
      if (!authToken) {
        toast.error('Vous devez être connecté');
        return;
      }

      // Create attachment objects
      const processedAttachments: Attachment[] = attachments.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: '', // No real upload yet
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));

      // Adjust existing attachments if editing (we just append new ones for now)
      // Ideally we should merge with existing ones, but for now let's just handle new ones
      
      const url = initialData ? `/api/ideas?id=${initialData._id}` : '/api/ideas';
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          project: formData.project,
          workspace: workspaceId,
          status: formData.status,
          tags: formData.tags,
          attachments: processedAttachments, // Note: this overwrites if PATCH, strictly one needs to merge.
          assignees: formData.assignees
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (initialData) {
            updateIdea(data.data._id, data.data);
            toast.success('Idée mise à jour avec succès');
        } else {
            addIdea(data.data);
            toast.success('Idée ajoutée avec succès');
        }
        onClose();
        setFormData({
          title: '',
          content: '',
          project: '',
          status: 'raw',
          tags: [],
          assignees: [],
        });
        setAttachments([]);
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
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
          className="relative w-full max-w-lg bg-bg-secondary border border-glass-border rounded-3xl shadow-2xl overflow-hidden hover:!bg-bg-secondary"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-text-main">Nouvelle Idée</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Titre de l&apos;idée</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Refonte du tunnel de vente"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Projet</label>
                <select
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-amber-500/50 appearance-none"
                >
                  <option value="" className="bg-bg-secondary text-text-muted">Idée Libre</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id} className="bg-bg-secondary text-text-main">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Contenu / Description</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez votre idée en quelques mots..."
                  rows={4}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-amber-500/50 resize-none transition-all"
                />
              </div>

              {/* Assignee */}
              <div>
                <UserSelector 
                  value={formData.assignees}
                  onChange={(userIds) => setFormData({ ...formData, assignees: userIds })}
                  multiple={true}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 rounded-lg bg-bg-tertiary border border-glass-border text-[10px] font-bold text-text-muted flex items-center gap-1"
                    >
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3 hover:text-text-main" />
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
                    className="flex-1 px-4 py-2 bg-bg-tertiary border border-glass-border rounded-xl text-sm text-text-main focus:border-amber-500/30 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-2 rounded-xl bg-bg-tertiary border border-glass-border text-text-muted hover:text-text-main hover:bg-glass-hover"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-bg-tertiary border border-glass-border rounded-2xl text-text-main outline-none focus:border-amber-500/50 appearance-none"
                >
                  <option value="raw" className="bg-bg-secondary text-text-main">Premier degré (Idée brute)</option>
                  <option value="standby" className="bg-bg-secondary text-text-main">Standby (Mise de côté)</option>
                  <option value="in_progress" className="bg-bg-secondary text-text-main">En cours (Mise en place)</option>
                  <option value="implemented" className="bg-bg-secondary text-text-main">Terminé (Mis en place)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Pièces Jointes</label>
                <div className="grid grid-cols-1 gap-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-tertiary/50 border border-glass-border rounded-xl group/file">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-amber-500" />
                        ) : (
                          <FileIcon className="w-4 h-4 text-text-muted" />
                        )}
                        <span className="text-xs text-text-dim truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(idx)}
                        className="p-1 rounded-md hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="relative flex flex-col items-center justify-center p-4 py-6 bg-bg-tertiary/20 border-2 border-dashed border-glass-border rounded-2xl hover:bg-glass-hover hover:border-amber-500/30 transition-all cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Paperclip className="w-6 h-6 text-text-muted group-hover:text-amber-500 transition-colors mb-2" />
                    <span className="text-xs text-text-muted group-hover:text-text-dim">Ajouter des photos ou documents</span>
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
