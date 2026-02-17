'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Task } from '@/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { CheckCircle, Clock, MoreHorizontal, Calendar, MessageSquare, Send } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onComplete?: (taskId: string) => void;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onComplete, onClick }: TaskCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const priorityConfig = {
    important: {
      label: t.common.priority.important,
      bgColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      dotColor: '#ef4444',
    },
    less_important: {
      label: t.common.priority.lessImportant,
      bgColor: 'rgba(59, 130, 246, 0.1)',
      color: '#3b82f6',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      dotColor: '#3b82f6',
    },
    waiting: {
      label: t.common.priority.waiting,
      bgColor: 'rgba(148, 163, 184, 0.1)',
      color: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.3)',
      dotColor: '#94a3b8',
    },
  };

  const priority = priorityConfig[task.priority];
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const isCompleted = task.status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative"
      onClick={() => onClick ? onClick(task) : router.push(`/tasks/${task._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className={`
          glass-card relative overflow-hidden p-6
          border-t-2 transition-all duration-300
          ${isCompleted ? 'opacity-50' : ''}
        `}
        style={{
          borderTopColor: task.projectColor || priority.color,
          boxShadow: `0 10px 40px -20px ${(task.projectColor || priority.color)}40`,
        }}
      >
        {/* Hover Glow Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-[inherit] pointer-events-none"
          style={{ backgroundColor: task.projectColor || priority.color }}
        />

        <div className="flex items-start gap-5">
          {/* Checkbox - Clean and larger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete?.(task._id);
            }}
            className={`
              mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 
              flex items-center justify-center
              transition-all duration-300
              ${isCompleted
                ? 'bg-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'border-glass-border hover:border-main group-hover:scale-110'
              }
            `}
            style={{
                borderColor: !isCompleted ? (task.projectColor || priority.color) : undefined
            }}
          >
            {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Project Tag - More visible */}
            <div className="flex items-center gap-2 mb-2">
                {task.projectName && (
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${task.projectColor || priority.color}15`, color: task.projectColor || priority.color }}
                  >
                    {task.projectName}
                  </span>
                )}
            </div>

            {/* Title - Better typography */}
            <h4
              className={`
                text-base font-semibold text-main leading-tight mb-3
                ${isCompleted ? 'line-through text-dim/50' : ''}
              `}
            >
              {task.title}
            </h4>

            {/* Meta Info - Well spaced */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-dim">
              {/* Assignees Avatars */}
              {((task.assignees?.length ?? 0) > 0 || task.assignee) && (
                <div className="flex -space-x-2 mr-2">
                   {/* Normalizing assignees array */}
                   {(() => {
                      let users: any[] = [];
                      if (task.assignees && task.assignees.length > 0) {
                          users = task.assignees;
                      } else if (task.assignee) {
                          users = [task.assignee];
                      }
                      
                      return users.slice(0, 3).map((u, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-[#12121a] overflow-hidden" title={`${u.firstName} ${u.lastName}`}>
                            {u.avatar ? (
                                <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-[8px] text-indigo-300 font-bold">
                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                            )}
                        </div>
                      )).concat(users.length > 3 ? [
                        <div key="more" className="w-6 h-6 rounded-full border-2 border-[#12121a] bg-glass-hover flex items-center justify-center text-[8px] text-dim">
                            +{users.length - 3}
                        </div>
                      ] : []);
                   })()}
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-1.5 py-1 px-2 bg-glass-bg rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
              
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400/70" />
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
              )}

              {task.comments?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}

              {task.estimatedTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(task.estimatedTime / 60)}h</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/messages?shareType=task&shareId=${task._id}&shareName=${encodeURIComponent(task.title)}`);
              }}
              className="
                opacity-0 group-hover:opacity-100
                p-2 rounded-xl hover:bg-glass-hover text-indigo-400
                transition-all duration-200
              "
              title={t.common.shareTask}
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              className="
                opacity-0 group-hover:opacity-100
                p-2 rounded-xl hover:bg-glass-hover text-dim
                transition-all duration-200
              "
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
