'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Share2, MessageSquare, Paperclip } from 'lucide-react';
import type { Idea } from '@/types';
import { useAppStore } from '@/store';

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const { deleteIdea, projects } = useAppStore();
  const project = projects.find(p => p._id === idea.project);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="glass-card group p-5 flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:opacity-30`} style={{ backgroundColor: project?.color || '#f59e0b' }} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
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
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
              {new Date(idea.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight leading-tight">
            {idea.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              if (confirm('Supprimer cette idée ?')) {
                deleteIdea(idea._id);
              }
            }}
            className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
          {idea.content}
        </p>
      </div>

      {/* Attachments Preview */}
      {idea.attachments && idea.attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {idea.attachments.slice(0, 4).map((attachment, idx) => (
            <div key={attachment.id} className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 group/item">
              {attachment.type.startsWith('image/') ? (
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="w-full h-full object-cover transition-transform group-hover/item:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 group-hover/item:bg-white/5 transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-500 mb-1" />
                  <span className="text-[8px] text-gray-600 text-center truncate w-full px-1">{attachment.name}</span>
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
            <span key={tag} className="px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/10 text-[9px] font-medium text-gray-500 italic">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer / Stats */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Paperclip className="w-3 h-3" /> {idea.attachments?.length || 0}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
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
