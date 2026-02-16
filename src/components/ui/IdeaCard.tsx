'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Share2, MessageSquare, Paperclip } from 'lucide-react';
import type { Idea } from '@/types';
import { useAuthStore, useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const { deleteIdea, projects } = useAppStore();
  const { token } = useAuthStore();
  const router = useRouter();
  const project = projects.find(p => p._id === idea.project);

  const statusConfig = {
    raw: { label: 'Premier Degré', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    standby: { label: 'Standby', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    in_progress: { label: 'En Cours', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    implemented: { label: 'Terminé', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    archived: { label: 'Archivé', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const statusInfo = statusConfig[idea.status as keyof typeof statusConfig] || statusConfig.raw;

  const handleDelete = async () => {
    if (!confirm('Supprimer cette idée ?')) return;
    
    try {
      if (!token) {
        // Fallback for local dev if no token (shouldn't happen in authenticated app)
        deleteIdea(idea._id);
        return;
      }

      const response = await fetch(`/api/ideas?id=${idea._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        deleteIdea(idea._id);
        toast.success('Idée supprimée');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/ideas/${idea._id}`)}
      className="glass-card group p-5 flex flex-col gap-4 relative overflow-hidden h-full cursor-pointer"
    >
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:opacity-30`} style={{ backgroundColor: project?.color || '#f59e0b' }} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {project && (
              <span 
                className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border"
                style={{ 
                  backgroundColor: `${project.color}10`,
                  borderColor: `${project.color}30`,
                  color: project.color 
                }}
              >
                {project.name}
              </span>
            )}
            <span 
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-main group-hover:text-amber-500 transition-colors tracking-tight leading-tight">
            {idea.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-2 rounded-xl hover:bg-red-500/10 text-dim hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-sm text-dim line-clamp-3 leading-relaxed">
          {idea.content}
        </p>
      </div>

      {/* Attachments Preview */}
      {idea.attachments && idea.attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {idea.attachments.slice(0, 4).map((attachment, idx) => (
            <div key={attachment.id} className="relative aspect-video rounded-lg overflow-hidden bg-glass-bg border border-glass-border group/item">
              {attachment.type.startsWith('image/') ? (
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="w-full h-full object-cover transition-transform group-hover/item:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 group-hover/item:bg-glass-hover transition-colors">
                  <Paperclip className="w-4 h-4 text-dim mb-1" />
                  <span className="text-[8px] text-dim text-center truncate w-full px-1">{attachment.name}</span>
                </div>
              )}
              {idx === 3 && idea.attachments.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-xs font-bold text-white">+{idea.attachments.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 relative z-10">
          {idea.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-lg bg-glass-bg border border-glass-border text-[9px] font-medium text-dim italic">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer / Stats */}
      <div className="pt-4 border-t border-glass-border flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
           {/* Assignees Avatars */}
           {(idea.assignees?.length > 0 || idea.assignee) && (
                <div className="flex -space-x-2 mr-2">
                   {/* Normalizing assignees array */}
                   {(() => {
                      let users: any[] = [];
                      if (idea.assignees && idea.assignees.length > 0) {
                          users = idea.assignees;
                      } else if (idea.assignee) {
                          users = [idea.assignee];
                      }
                      
                      return users.slice(0, 3).map((u, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-[#12121a] overflow-hidden" title={`${u.firstName} ${u.lastName}`}>
                            {u.avatar ? (
                                <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-amber-500/20 flex items-center justify-center text-[7px] text-amber-500 font-bold">
                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                            )}
                        </div>
                      )).concat(users.length > 3 ? [
                        <div key="more" className="w-5 h-5 rounded-full border-2 border-[#12121a] bg-glass-hover flex items-center justify-center text-[7px] text-dim">
                            +{users.length - 3}
                        </div>
                      ] : []);
                   })()}
                </div>
            )}
            
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-dim uppercase tracking-widest">
            <Paperclip className="w-3 h-3" /> {idea.attachments?.length || 0}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-dim uppercase tracking-widest">
            <MessageSquare className="w-3 h-3" /> {idea.comments?.length || 0}
          </div>
        </div>
        <button className="flex items-center gap-1 text-[10px] font-bold text-amber-500/60 hover:text-amber-500 uppercase tracking-widest transition-colors">
          Détails <Share2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
