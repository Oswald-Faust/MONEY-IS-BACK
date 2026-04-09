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
  variant?: 'compact' | 'expanded' | 'grid' | 'list';
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

  const progress =
    project.tasksCount > 0
      ? Math.round((project.completedTasksCount / project.tasksCount) * 100)
      : 0;
  const openTasks = Math.max(project.tasksCount - project.completedTasksCount, 0);

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
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const DropdownMenu = () => (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="absolute right-0 mt-1.5 w-44 z-50 overflow-hidden rounded-xl bg-bg-card border border-glass-border shadow-2xl backdrop-blur-xl"
        >
          <div className="p-1 space-y-0.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(false);
                onEdit?.(project);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-main hover:bg-glass-hover rounded-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-text-muted" />
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
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.common.delete}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── LIST variant ───────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <div className="relative">
        <Link href={`/projects/${project._id}`}>
          <motion.div
            whileHover={{ x: 3 }}
            className="group flex items-center gap-4 rounded-2xl border border-glass-border bg-bg-secondary/50 px-4 py-3.5 hover:bg-bg-tertiary/70 hover:border-white/10 transition-all duration-200 cursor-pointer"
          >
            {/* Color strip */}
            <div
              className="flex-shrink-0 w-1 self-stretch rounded-full min-h-[36px]"
              style={{ backgroundColor: project.color }}
            />

            {/* Icon */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${project.color}18`,
                border: `1px solid ${project.color}35`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: project.color,
                  boxShadow: `0 0 8px ${project.color}`,
                }}
              />
            </div>

            {/* Name + description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-main text-sm group-hover:text-accent-primary transition-colors truncate">
                  {project.name}
                </h3>
                {project.securePassword && (
                  <Shield className="w-3 h-3 text-text-muted flex-shrink-0" />
                )}
              </div>
              {project.description && (
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {project.description}
                </p>
              )}
            </div>

            {/* Status badge */}
            <span
              className={`flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${projectStatus.className}`}
            >
              <StatusIcon className="w-3 h-3" />
              {projectStatus.label}
            </span>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-5 flex-shrink-0">
              <div className="text-center">
                <p className="text-xs font-bold text-text-main">{openTasks}</p>
                <p className="text-[10px] text-text-muted leading-tight">
                  {t.projectsPage.card.openTasks}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-text-main">
                  {project.completedTasksCount}
                </p>
                <p className="text-[10px] text-text-muted leading-tight">
                  {t.projectsPage.card.completedTasks}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-text-muted" />
                <p className="text-xs font-bold text-text-main">
                  {project.members.length}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="hidden lg:flex flex-col gap-1.5 flex-shrink-0 w-28">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">
                  {t.common.progress}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: project.color }}
                >
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-glass-bg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: project.color }}
                />
              </div>
            </div>

            {/* Arrow */}
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors flex-shrink-0" />

            {/* Menu */}
            <div
              className="relative flex-shrink-0"
              ref={menuRef}
              onClick={(e) => e.preventDefault()}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className={`p-2 rounded-xl transition-all ${
                  showMenu
                    ? 'bg-glass-hover text-text-main'
                    : 'text-text-muted hover:bg-glass-hover hover:text-text-main'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <DropdownMenu />
            </div>
          </motion.div>
        </Link>
      </div>
    );
  }

  // ─── GRID variant (compact, 3 per row) ──────────────────────────────────────
  if (variant === 'grid' || variant === 'expanded') {
    return (
      <div className="relative h-full">
        <Link href={`/projects/${project._id}`}>
          <motion.div
            layout
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="group cursor-pointer h-full"
          >
            <div
              className="glass-card relative h-full overflow-hidden border-t-2 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300"
              style={{
                borderTopColor: project.color,
                boxShadow: `0 12px 40px -20px ${project.color}40`,
              }}
            >
              {/* BG effects */}
              <div
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                style={{ backgroundColor: project.color }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-[inherit] pointer-events-none"
                style={{ backgroundColor: project.color }}
              />

              {/* Header */}
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${project.color}15`,
                      border: `1px solid ${project.color}40`,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{
                        backgroundColor: project.color,
                        boxShadow: `0 0 10px ${project.color}`,
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-text-main text-sm leading-tight group-hover:text-accent-primary transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${projectStatus.className}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {projectStatus.label}
                      </span>
                      {project.securePassword && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-text-dim">
                          <Shield className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="relative flex-shrink-0"
                  ref={menuRef}
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      showMenu
                        ? 'bg-glass-hover text-text-main'
                        : 'text-text-muted hover:bg-glass-hover hover:text-text-main'
                    }`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <DropdownMenu />
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="relative text-xs text-text-muted line-clamp-2 leading-relaxed -mt-1">
                  {project.description}
                </p>
              )}

              {/* Stats row */}
              <div className="relative grid grid-cols-3 gap-2 mt-auto">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2.5 text-center">
                  <p className="text-sm font-bold text-text-main">{openTasks}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-text-muted mt-0.5 leading-tight">
                    {t.projectsPage.card.openTasks}
                  </p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2.5 text-center">
                  <p className="text-sm font-bold text-text-main">
                    {project.completedTasksCount}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-text-muted mt-0.5 leading-tight">
                    {t.projectsPage.card.completedTasks}
                  </p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-text-muted" />
                    <p className="text-sm font-bold text-text-main">
                      {project.members.length}
                    </p>
                  </div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-text-muted mt-0.5 leading-tight">
                    {t.projectsPage.card.members}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-text-muted">
                    {project.completedTasksCount}/{project.tasksCount}{' '}
                    {t.common.tasks.toLowerCase()}
                  </p>
                  <span
                    className="text-xs font-black"
                    style={{ color: project.color }}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-glass-bg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${project.color}, ${project.color}80)`,
                      boxShadow: `0 0 12px ${project.color}50`,
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="relative flex items-center justify-between pt-0.5">
                <span className="text-xs font-medium text-text-dim">
                  {t.projectsPage.card.openProject}
                </span>
                <div
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: project.color }}
                >
                  <span>{t.common.dashboard}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    );
  }

  // ─── COMPACT variant (used in dashboard) ────────────────────────────────────
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
            className="glass-card relative h-full overflow-hidden border-t-2 transition-all duration-300 flex flex-col p-6"
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

            <div className="relative flex items-start justify-between gap-4 mb-8">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${projectStatus.className}`}
                  >
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
                    className="flex-shrink-0 h-12 w-12 rounded-2xl transition-all duration-500 group-hover:scale-105 flex items-center justify-center"
                    style={{
                      backgroundColor: `${project.color}14`,
                      border: `1px solid ${project.color}45`,
                    }}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: project.color,
                        boxShadow: `0 0 16px ${project.color}`,
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-main transition-colors group-hover:text-accent-primary line-clamp-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-0.5 text-sm line-clamp-2 text-text-muted transition-colors group-hover:text-text-dim">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className={`p-2.5 rounded-xl transition-all ${
                    showMenu
                      ? 'bg-glass-hover text-text-main'
                      : 'bg-glass-bg text-text-muted hover:bg-glass-hover hover:text-text-main'
                  }`}
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            onEdit?.(project);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-main hover:bg-glass-hover rounded-xl transition-all"
                        >
                          <Edit3 className="w-4 h-4 text-text-muted" />
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
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500/50" />
                          {t.common.delete}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative mt-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.projectsPage.card.openTasks}
                  </p>
                  <p className="mt-2 text-xl font-bold text-text-main">{openTasks}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.projectsPage.card.completedTasks}
                  </p>
                  <p className="mt-2 text-xl font-bold text-text-main">
                    {project.completedTasksCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.common.tasks}
                  </p>
                  <p className="mt-2 text-xl font-bold text-text-main">
                    {project.tasksCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t.projectsPage.card.members}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="rounded-xl bg-glass-bg p-1.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-xl font-bold text-text-main">
                      {project.members.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                      {t.common.progress}
                    </p>
                    <p className="mt-1 text-sm text-text-dim">
                      {project.completedTasksCount} / {project.tasksCount}{' '}
                      {t.common.tasks.toLowerCase()}
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
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
