'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/types';
import {
  ArrowUpRight,
  CheckCircle,
  Edit3,
  MoreHorizontal,
  PauseCircle,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  variant?: 'compact' | 'expanded';
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  variant = 'compact',
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const progress = project.tasksCount > 0
    ? Math.round((project.completedTasksCount / project.tasksCount) * 100)
    : 0;
  const openTasks = Math.max(project.tasksCount - project.completedTasksCount, 0);
  const isExpanded = variant === 'expanded';

  const statusMeta = {
    active: {
      label: t.projectsPage.filters.active,
      icon: CheckCircle,
      className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    paused: {
      label: t.projectsPage.filters.paused,
      icon: PauseCircle,
      className: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    archived: {
      label: t.projectsPage.filters.archived,
      icon: Shield,
      className: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
    },
  } as const;

  const projectStatus = statusMeta[project.status];
  const StatusIcon = projectStatus.icon;

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
          whileHover={{ scale: 1.01, y: -4 }}
          whileTap={{ scale: 0.99 }}
          className="group cursor-pointer h-full"
        >
          <div
            className={`glass-card relative h-full overflow-hidden border-t-2 transition-all duration-300 ${
              isExpanded ? 'p-7 md:p-8 rounded-[30px]' : 'flex flex-col p-6'
            }`}
            style={{
              borderTopColor: project.color,
              boxShadow: `0 18px 50px -28px ${project.color}50`,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 rounded-[inherit] pointer-events-none"
              style={{ backgroundColor: project.color }}
            />
            <div
              className="absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: project.color }}
            />

            <div className={`relative flex items-start justify-between gap-4 ${isExpanded ? 'mb-7' : 'mb-8'}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${projectStatus.className}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {projectStatus.label}
                  </span>
                  {project.securePassword && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-dim">
                      <Shield className="w-3.5 h-3.5" />
                      {t.projectsPage.card.private}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 rounded-2xl transition-all duration-500 group-hover:scale-105 ${
                      isExpanded ? 'h-14 w-14' : 'h-12 w-12'
                    } flex items-center justify-center`}
                    style={{
                      backgroundColor: `${project.color}14`,
                      border: `1px solid ${project.color}45`,
                    }}
                  >
                    <div
                      className={isExpanded ? 'h-5 w-5 rounded-full' : 'h-4 w-4 rounded-full'}
                      style={{
                        backgroundColor: project.color,
                        boxShadow: `0 0 16px ${project.color}`,
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className={`${isExpanded ? 'text-2xl md:text-[1.85rem] leading-tight' : 'text-lg'} font-bold text-text-main transition-colors group-hover:text-accent-primary line-clamp-2`}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className={`${isExpanded ? 'mt-3 text-[15px] leading-7 line-clamp-3' : 'mt-0.5 text-sm line-clamp-2'} text-text-muted transition-colors group-hover:text-text-dim`}>
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className={`
                    p-2.5 rounded-xl transition-all
                    ${showMenu ? 'bg-glass-hover text-text-main' : 'bg-glass-bg text-text-muted hover:bg-glass-hover hover:text-text-main'}
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
                      className="absolute right-0 mt-2 w-48 z-50 overflow-hidden rounded-2xl bg-bg-card border border-glass-border shadow-2xl backdrop-blur-xl"
                    >
                      <div className="p-1.5 space-y-1">
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setShowMenu(false);
                            onEdit?.(project);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-main hover:bg-glass-hover rounded-xl transition-all group/item"
                        >
                          <Edit3 className="w-4 h-4 text-text-muted group-hover/item:text-accent-primary transition-colors" />
                          {t.common.edit}
                        </button>
                        <div className="h-px bg-glass-bg mx-2" />
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
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

            <div className={`relative mt-auto ${isExpanded ? 'space-y-6' : 'space-y-4'}`}>
              <div className={`grid ${isExpanded ? 'grid-cols-2 gap-3' : 'grid-cols-2 gap-4'}`}>
                <div className={`rounded-2xl border border-white/8 bg-white/[0.03] ${isExpanded ? 'p-4' : 'p-3.5'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.projectsPage.card.openTasks}
                  </p>
                  <p className={`${isExpanded ? 'mt-3 text-2xl' : 'mt-2 text-xl'} font-bold text-text-main`}>
                    {openTasks}
                  </p>
                </div>
                <div className={`rounded-2xl border border-white/8 bg-white/[0.03] ${isExpanded ? 'p-4' : 'p-3.5'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.projectsPage.card.completedTasks}
                  </p>
                  <p className={`${isExpanded ? 'mt-3 text-2xl' : 'mt-2 text-xl'} font-bold text-text-main`}>
                    {project.completedTasksCount}
                  </p>
                </div>
                <div className={`rounded-2xl border border-white/8 bg-white/[0.03] ${isExpanded ? 'p-4' : 'p-3.5'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.common.tasks}
                  </p>
                  <p className={`${isExpanded ? 'mt-3 text-2xl' : 'mt-2 text-xl'} font-bold text-text-main`}>
                    {project.tasksCount}
                  </p>
                </div>
                <div className={`rounded-2xl border border-white/8 bg-white/[0.03] ${isExpanded ? 'p-4' : 'p-3.5'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.projectsPage.card.members}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="rounded-xl bg-glass-bg p-1.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className={`${isExpanded ? 'text-2xl' : 'text-xl'} font-bold text-text-main`}>
                      {project.members.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-[24px] border border-white/8 bg-white/[0.03] ${isExpanded ? 'p-5' : 'p-4'}`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                      {t.common.progress}
                    </p>
                    <p className="mt-1 text-sm text-text-dim">
                      {project.completedTasksCount} / {project.tasksCount} {t.common.tasks.toLowerCase()}
                    </p>
                  </div>
                  <span
                    className="rounded-full border px-3 py-1 text-sm font-black"
                    style={{
                      color: project.color,
                      borderColor: `${project.color}30`,
                      backgroundColor: `${project.color}10`,
                    }}
                  >
                    {progress}%
                  </span>
                </div>

                <div className="h-2.5 w-full rounded-full bg-glass-bg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${project.color} 0%, ${project.color}85 100%)`,
                      boxShadow: `0 0 20px ${project.color}40`,
                    }}
                  />
                </div>

                {isExpanded && (
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-text-main">{t.projectsPage.card.openProject}</span>
                    <div
                      className="flex items-center gap-2 rounded-full border px-3 py-1 font-semibold"
                      style={{
                        borderColor: `${project.color}25`,
                        color: project.color,
                        backgroundColor: `${project.color}10`,
                      }}
                    >
                      <span>{t.common.dashboard}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
