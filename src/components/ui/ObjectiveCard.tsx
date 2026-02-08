'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react';
import type { Objective } from '@/types';
import { useAppStore } from '@/store';

interface ObjectiveCardProps {
  objective: Objective;
}

export default function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const { updateObjective } = useAppStore();

  const toggleCheckpoint = (checkpointId: string) => {
    const updatedCheckpoints = objective.checkpoints.map(cp => 
      cp.id === checkpointId ? { ...cp, completed: !cp.completed } : cp
    );
    
    // Calculate new progress
    const completedCount = updatedCheckpoints.filter(cp => cp.completed).length;
    const progress = Math.round((completedCount / updatedCheckpoints.length) * 100);
    
    updateObjective(objective._id, { 
      checkpoints: updatedCheckpoints,
      progress 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 flex flex-col gap-6 group relative overflow-hidden"
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
          <h3 className="text-xl font-bold text-white mt-2">{objective.title}</h3>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Checkpoints */}
      <div className="space-y-3 flex-1">
        {objective.checkpoints.map((checkpoint) => (
          <button
            key={checkpoint.id}
            onClick={() => toggleCheckpoint(checkpoint.id)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/item"
          >
            <span className={`text-sm font-medium transition-colors ${checkpoint.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
              {checkpoint.title}
            </span>
            {checkpoint.completed ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-600 group-hover/item:text-gray-400 transition-colors" />
            )}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-gray-500">Progression</span>
          <span className="text-white">{objective.progress}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
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
