import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/types';
import { MoreHorizontal, Users, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const progress = project.tasksCount > 0 
    ? Math.round((project.completedTasksCount / project.tasksCount) * 100) 
    : 0;

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="relative h-full">
      <Link href={`/projects/${project._id}`}>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group cursor-pointer h-full"
        >
          <div
            className="
              glass-card group relative h-full flex flex-col p-6
              border-t-2 transition-all duration-300
            "
            style={{
              borderTopColor: project.color,
              boxShadow: `0 10px 40px -20px ${project.color}40`,
            }}
          >
            {/* Hover Glow Effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-[inherit] pointer-events-none"
              style={{ backgroundColor: project.color }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-8 gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* Project Icon with Color */}
                <div
                  className="
                    w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                  "
                  style={{
                    backgroundColor: `${project.color}15`,
                    border: `1px solid ${project.color}40`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: project.color,
                      boxShadow: `0 0 15px ${project.color}`
                    }}
                  />
                </div>

                {/* Project Name & Description */}
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-main group-hover:text-main truncate transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-dim mt-0.5 line-clamp-1 group-hover:text-main transition-colors">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className={`
                    p-2 rounded-xl transition-all flex-shrink-0
                    ${showMenu ? 'bg-glass-hover text-main' : 'bg-glass-bg text-dim hover:bg-glass-hover'}
                  `}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-48 z-50 overflow-hidden rounded-2xl bg-[#1a1a24] border border-white/10 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="p-1.5 space-y-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            onEdit?.(project);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-200 hover:text-white hover:bg-glass-hover rounded-xl transition-all group/item"
                        >
                          <Edit3 className="w-4 h-4 text-dim group-hover/item:text-indigo-400 transition-colors" />
                          {t.common.edit}
                        </button>
                        <div className="h-px bg-glass-bg mx-2" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            onDelete?.(project);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group/item"
                        >
                          <Trash2 className="w-4 h-4 text-red-500/50 group-hover/item:text-red-400 transition-colors" />
                          {t.common.delete}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-auto">
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2 group/stat">
                  <div className="p-1.5 rounded-lg bg-glass-bg group-hover/stat:bg-glass-hover transition-colors">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-bold">{t.common.tasks}</span>
                    <span className="font-semibold text-main leading-tight">
                      {project.completedTasksCount} <span className="text-dim">/ {project.tasksCount}</span>
                    </span>
                  </div>
                </div>
                
                {project.members && project.members.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-glass-bg">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted font-bold">{t.common.team}</span>
                      <span className="font-semibold text-main leading-tight">{project.members.length}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar Container */}
              <div className="relative pt-2">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted font-bold uppercase tracking-widest">{t.common.progress}</span>
                  <span className="font-black text-main px-2 py-0.5 rounded-md bg-glass-bg" style={{ color: project.color }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-glass-bg rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${project.color} 0%, ${project.color}80 100%)`,
                      boxShadow: `0 0 20px ${project.color}40`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
