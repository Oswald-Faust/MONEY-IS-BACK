'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Lock, 
  Target, 
  Link as LinkIcon, 
  Lightbulb,
  ArrowLeft,
  LucideIcon,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store';
import CustomCalendar from '@/components/ui/CustomCalendar';

interface MenuItem {
  label: string;
  icon: LucideIcon | null;
  color: string;
  href: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { projects, tasks, setTaskModalOpen } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const project = useMemo(() => projects.find(p => p._id === id), [projects, id]);
  const projectTasks = useMemo(() => tasks.filter(t => t.project === id), [tasks, id]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-dim">Projet non trouvé ou chargement...</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au dashboard
        </button>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { label: 'TO DO LIST', icon: CheckSquare, color: '#3b82f6', href: `/tasks?project=${id}` },
    { label: 'PRIVÉ', icon: Lock, color: '#f97316', href: `/secure-ids?project=${id}` },
    { label: 'OBJECTIFS', icon: Target, color: '#ef4444', href: `/objectives?project=${id}` },
    { label: 'DONNÉES', icon: LinkIcon, color: '#94a3b8', href: `/drive?project=${id}` },
    { label: 'IDÉES', icon: Lightbulb, color: '#eab308', href: `/ideas?project=${id}` },
    { label: '', icon: null, color: '', href: '#' },
  ];

  return (
    <div className="page-fade space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-dim hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-bold text-dim uppercase tracking-widest mb-1">Détails du projet</p>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full shadow-[0_0_10px_currentcolor]" 
                style={{ backgroundColor: project.color, color: project.color }} 
              />
              {project.name}
            </h1>
          </div>
        </div>

        <button
          onClick={() => setTaskModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          NOUVEAU
        </button>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return item.label ? (
            <Link key={index} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.98 }}
                className="glass-card flex items-center justify-center gap-4 py-8 group transition-all"
              >
                {Icon && <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: item.color }} />}
                <span className="text-lg font-bold text-white tracking-wide">{item.label}</span>
              </motion.div>
            </Link>
          ) : (
            <div key={index} className="glass-card opacity-20 border-dashed border-2" />
          );
        })}
      </div>

      {/* Project Calendar */}
      <section className="space-y-6 pt-6">
        <h2 className="section-title !mb-0 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-indigo-400" />
          Calendrier du projet
        </h2>
        
        <div className="glass-card">
          <CustomCalendar
            tasks={projectTasks}
            selectedDate={selectedDate}
            onDateClick={setSelectedDate}
          />
        </div>
      </section>
    </div>
  );
}
