'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, MoreHorizontal, Send } from 'lucide-react';
import type { Objective } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

interface ObjectiveCardProps {
  objective: Objective;
}

export default function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const { updateObjective } = useAppStore();
  const { token } = useAuthStore();
  const router = useRouter();

  const toggleCheckpoint = async (checkpointId: string) => {
    if (!token) return;

    const updatedCheckpoints = objective.checkpoints.map(cp => 
      cp.id === checkpointId ? { ...cp, completed: !cp.completed } : cp
    );
    
    // Calculate new progress locally for optimistic update
    const completedCount = updatedCheckpoints.filter(cp => cp.completed).length;
    const progress = Math.round((completedCount / updatedCheckpoints.length) * 100);
    
    // Optimistic update
    updateObjective(objective._id, { 
      checkpoints: updatedCheckpoints,
      progress 
    });

    try {
      await fetch(`/api/objectives?id=${objective._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          checkpoints: updatedCheckpoints,
          progress
        }),
      });
    } catch {
      // Revert on error (optional, but good practice)
      console.error('Failed to update objective');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/objectives/${objective._id}`)}
      className="glass-card p-6 flex flex-col gap-6 group relative overflow-hidden cursor-pointer"
    >
      {/* Background Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 blur-3xl rounded-full opacity-20 transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: objective.projectColor || '#8b5cf6' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            {objective.projectName && (
              <span 
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${objective.projectColor}20`, color: objective.projectColor }}
              >
                {objective.projectName}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-main mt-2">{objective.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/messages?shareType=objective&shareId=${objective._id}&shareName=${encodeURIComponent(objective.title)}`);
            }}
            className="p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
            title="Partager en messagerie"
          >
            <Send className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-glass-hover text-dim hover:text-main transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Checkpoints */}
      <div className="space-y-3 flex-1">
        {objective.checkpoints.map((checkpoint) => (
          <button
            key={checkpoint.id}
            onClick={(e) => {
              e.stopPropagation();
              toggleCheckpoint(checkpoint.id);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover transition-all group/item"
          >
            <span className={`text-sm font-medium transition-colors ${checkpoint.completed ? 'text-dim line-through opacity-50' : 'text-main'}`}>
              {checkpoint.title}
            </span>
            {checkpoint.completed ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            ) : (
              <Circle className="w-5 h-5 text-dim/30 group-hover/item:text-dim transition-colors" />
            )}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-3 pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-dim">Progression</span>
          <span className="text-main">{objective.progress}%</span>
        </div>
        <div className="h-2 w-full bg-glass-bg rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${objective.progress}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
