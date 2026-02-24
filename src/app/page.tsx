'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Layout,
  MessageSquare,
  Target,
  FileText,
  Zap,
  Users,
  ArrowRight,
  Check,
  BarChart3,
  Shield,
  List,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, type ElementType } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';

// --- Components ---

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';

const ReplaceAllSection = () => {
    const { t } = useTranslation();
    const tools = [
        { name: 'Trello', icon: Layout },
        { name: 'Asana', icon: List },
        { name: 'Monday', icon: Calendar },
        { name: 'Notion', icon: FileText },
        { name: 'Slack', icon: MessageSquare },
        { name: 'Jira', icon: BarChart3 },
    ];

    return (
        <section className="py-24 border-t border-glass-border bg-bg-deep overflow-hidden">
             <div className="text-center mb-16 px-6">
                <h2 className="text-3xl font-bold text-text-main mb-4">{t.replaceAll.title}</h2>
                <p className="text-text-dim max-w-xl mx-auto">
                    {t.replaceAll.subtitle}
                </p>
            </div>
            
            <div className="relative flex overflow-hidden">
                {/* Marquee Container */}
                <div className="flex gap-16 items-center">
                    <motion.div 
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{ 
                            duration: 30, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatType: "loop"
                        }}
                        className="flex gap-16 items-center flex-nowrap pr-16"
                    >
                        {/* Render items multiple times to ensure seamless loop */}
                        {[...tools, ...tools, ...tools, ...tools].map((tool, index) => (
                            <div key={index} className="flex items-center gap-4 text-2xl font-bold text-zinc-600 opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap">
                                <tool.icon className="w-8 h-8" />
                                <span>{tool.name}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
                
                 {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-deep to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-deep to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
};

const AnimatedText = () => {
    const { t } = useTranslation();
    const words = t.hero.animatedWords;
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className="block h-[1.2em] overflow-hidden text-text-muted">
             <AnimatePresence mode="popLayout" initial={false}>
                <motion.span 
                    key={index}
                    initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: "-100%", opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="block text-center whitespace-nowrap"
                >
                    {t.hero.animatedPrefix} {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

const Hero = () => {
    const { t } = useTranslation();
    const [mockupTab, setMockupTab] = React.useState('dashboard');

    const sidebarItems = [
        { id: 'dashboard', icon: Layout, label: 'Tableau de bord' },
        { id: 'tasks', icon: List, label: 'Mes Tâches' },
        { id: 'goals', icon: Target, label: 'Mes Objectifs' },
        { id: 'calendar', icon: Calendar, label: 'Calendrier' },
        { id: 'routines', icon: Zap, label: 'Routines' },
        { id: 'team', icon: Users, label: 'Équipe' },
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
        { id: 'analytics', icon: BarChart3, label: 'Analyses' }
    ];

    return (
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-[#00FFB2] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass-bg text-[10px] font-mono text-[#00FFB2] tracking-widest uppercase mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse shadow-[0_0_10px_#00FFB2]" />
                    {t.hero.badgeText}
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight text-text-main mb-8 leading-[0.9]"
                >
                    {t.hero.title} <br/>
                    <AnimatedText />
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-text-dim max-w-2xl mx-auto mb-12 font-light"
                >
                    {t.hero.subtitle}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link 
                        href="#pricing" 
                        className="px-10 py-4 rounded-full bg-accent-primary text-white font-bold text-sm tracking-wide hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
                    >
                        {t.common.getStartedFree}
                    </Link>
                    <button className="px-10 py-4 rounded-full border border-glass-border text-text-main font-medium text-sm hover:bg-glass-hover transition-colors flex items-center gap-2 group">
                        <span className="w-8 h-8 rounded-full bg-glass-bg flex items-center justify-center group-hover:bg-glass-hover transition-colors">
                            <span className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-text-main border-b-[5px] border-b-transparent ml-0.5" />
                        </span>
                        {t.common.viewDemo}
                    </button>
                </motion.div>
            </div>

            {/* Interactive Dashboard Mockup */}
            <motion.div 
                initial={{ opacity: 0, y: 100, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1.2, delay: 0.8, type: "spring", bounce: 0.3 }}
                style={{ perspective: "2000px" }}
                className="mt-20 relative w-full max-w-6xl mx-auto px-4"
            >
                <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-[#0A0A0F]/90 backdrop-blur-2xl">
                    {/* Fake Browser UI */}
                    <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3 bg-white/[0.02]">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/20" />
                        </div>
                        <div className="mx-auto flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-[10px] text-zinc-500 font-mono translate-x-[-24px]">
                            <Shield className="w-3 h-3 text-[#00FFB2]" />
                            edwinhub.com/dashboard/{mockupTab}
                        </div>
                    </div>

                    <div className="flex h-[550px] md:h-[700px] overflow-hidden">
                         {/* Sidebar */}
                         <div className="w-20 md:w-64 flex flex-col gap-8 border-r border-white/5 p-4 md:p-6 bg-white/[0.01]">
                             <div className="flex items-center gap-3 mb-4 px-2">
                                 <div className="w-10 h-10 bg-gradient-to-br from-[#00FFB2] to-emerald-600 rounded-xl shadow-[0_0_20px_rgba(0,255,178,0.3)] flex items-center justify-center shrink-0">
                                     <Layout className="w-6 h-6 text-black" />
                                 </div>
                                 <span className="font-bold text-white hidden md:block">Edwin</span>
                             </div>
                             
                             <div className="space-y-2">
                                 {sidebarItems.map((item) => (
                                     <button 
                                        key={item.id} 
                                        onClick={() => setMockupTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                                            mockupTab === item.id 
                                            ? 'bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/20 shadow-[0_0_15px_rgba(0,255,178,0.1)]' 
                                            : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                     >
                                         <item.icon className={`w-5 h-5 shrink-0 ${mockupTab === item.id ? 'drop-shadow-[0_0_8px_rgba(0,255,178,0.5)]' : ''}`} />
                                         <span className="text-sm font-medium hidden md:block">{item.label}</span>
                                     </button>
                                 ))}
                             </div>

                             <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 hidden md:block">
                                 <div className="text-[10px] font-mono text-indigo-400 mb-1 tracking-widest uppercase">Espace Equipe</div>
                                 <div className="text-xs text-white font-medium mb-3">Product Launch 2026</div>
                                 <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border border-black bg-zinc-800" />
                                    ))}
                                 </div>
                             </div>
                         </div>

                         {/* Dynamic Content */}
                         <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F]">
                             <AnimatePresence mode="wait">
                                 <motion.div
                                     key={mockupTab}
                                     initial={{ opacity: 0, y: 10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     exit={{ opacity: 0, y: -10 }}
                                     transition={{ duration: 0.2 }}
                                     className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar"
                                 >
                                     {mockupTab === 'dashboard' && (
                                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                 <div className="space-y-1">
                                                     <h2 className="text-2xl font-bold text-white">Salut, Mathias 👋</h2>
                                                     <p className="text-sm text-zinc-500">Voici ce qui se passe dans vos projets aujourd&apos;hui.</p>
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                     <div className="flex -space-x-2">
                                                         {[1,2,3].map(i => (
                                                             <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0F] bg-zinc-800 overflow-hidden">
                                                                 <Image src={`https://i.pravatar.cc/150?u=${i+10}`} width={32} height={32} alt="Avatar" />
                                                             </div>
                                                         ))}
                                                     </div>
                                                     <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white transition-colors">Inviter</button>
                                                 </div>
                                             </div>
                                             
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                 {[
                                                     { label: "Productivité", value: "92%", color: "#00FFB2", icon: Zap, trend: "+12%" },
                                                     { label: "Objectifs Q1", value: "8/12", color: "#6366F1", icon: Target, trend: "+2" },
                                                     { label: "Points d&apos;équipe", value: "1,240", color: "#F59E0B", icon: Users, trend: "+150" }
                                                 ].map((card, i) => (
                                                     <motion.div 
                                                        key={i} 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group"
                                                     >
                                                         <div className="flex justify-between items-start mb-4">
                                                             <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform"><card.icon className="w-4 h-4 text-zinc-400" /></div>
                                                             <span className="text-[10px] font-mono text-[#00FFB2] bg-[#00FFB2]/10 px-2 py-0.5 rounded-full">{card.trend}</span>
                                                         </div>
                                                         <div className="text-xs text-zinc-500 mb-1">{card.label}</div>
                                                         <div className="text-2xl font-bold text-white">{card.value}</div>
                                                     </motion.div>
                                                 ))}
                                             </div>

                                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                 <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#00FFB2]/10 via-transparent to-transparent border border-[#00FFB2]/10 relative overflow-hidden group">
                                                     <div className="relative z-10">
                                                         <div className="text-[10px] font-mono text-[#00FFB2] mb-4 tracking-[0.2em] uppercase">ROUTINE ACTIVE</div>
                                                         <h3 className="text-xl font-bold text-white mb-2">Analyse SEO Hebdomadaire</h3>
                                                         <p className="text-zinc-500 text-sm mb-6 max-w-[240px]">Optimisez la visibilité de vos 12 projets en un clic.</p>
                                                         <button className="px-6 py-2.5 bg-[#00FFB2] text-black font-bold text-xs rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,178,0.3)]">Lancer la routine</button>
                                                     </div>
                                                     <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                                         <Zap className="w-48 h-48 text-[#00FFB2]" />
                                                     </div>
                                                 </div>

                                                 <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                                                     <div className="flex justify-between items-center mb-6">
                                                         <h3 className="text-sm font-bold text-white uppercase tracking-widest">Activité Récente</h3>
                                                         <BarChart3 className="w-4 h-4 text-zinc-600" />
                                                     </div>
                                                     <div className="space-y-4">
                                                         {[
                                                             { user: "Sarah", action: "a terminé la refonte", time: "Il y a 2m" },
                                                             { user: "Marc", action: "a ajouté un objectif", time: "Il y a 15m" },
                                                             { user: "Julie", action: "a rejoint le projet", time: "Il y a 1h" }
                                                         ].map((item, i) => (
                                                             <div key={i} className="flex items-center gap-3">
                                                                 <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                                                                 <div className="flex-1 min-w-0">
                                                                     <p className="text-xs text-zinc-300 truncate"><span className="text-white font-medium">{item.user}</span> {item.action}</p>
                                                                     <p className="text-[10px] text-zinc-600 uppercase font-mono">{item.time}</p>
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     )}

                                     {mockupTab === 'tasks' && (
                                         <div className="space-y-6">
                                             <h2 className="text-2xl font-bold text-white mb-8">Mes Tâches</h2>
                                             {[
                                                 { title: "Finaliser UI Dashboard", status: "In Progress", due: "Aujourd'hui", priority: "High" },
                                                 { title: "Meeting avec l'équipe Core", status: "Upcoming", due: "14:00", priority: "Medium" },
                                                 { title: "Review du contrat SEO", status: "Awaiting", due: "Demain", priority: "High" },
                                                 { title: "Mise à jour node.config", status: "Done", due: "Terminé", priority: "Low" }
                                             ].map((task, i) => (
                                                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                                     <div className={`w-5 h-5 rounded border ${task.status === 'Done' ? 'bg-[#00FFB2] border-[#00FFB2]' : 'border-white/10'}`} />
                                                     <div className="flex-1">
                                                         <div className={`text-sm font-medium ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</div>
                                                         <div className="text-[10px] text-zinc-500">{task.due}</div>
                                                     </div>
                                                     <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${task.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-zinc-500'}`}>{task.priority}</span>
                                                 </div>
                                             ))}
                                         </div>
                                     )}

                                     {mockupTab === 'goals' && (
                                         <div className="space-y-10">
                                             <h2 className="text-2xl font-bold text-white">Mes Objectifs Q1</h2>
                                             <div className="grid gap-8">
                                                 {[
                                                     { title: "Lancement Edwin v2", progress: 85, color: "#00FFB2" },
                                                     { title: "Objectif 1000 Clients", progress: 42, color: "#6366F1" },
                                                     { title: "Refonte Branding", progress: 100, color: "#F59E0B" }
                                                 ].map((goal, i) => (
                                                     <div key={i} className="space-y-3">
                                                         <div className="flex justify-between items-end">
                                                             <h4 className="text-white font-medium">{goal.title}</h4>
                                                             <span className="text-xs text-zinc-500">{goal.progress}%</span>
                                                         </div>
                                                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                             <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${goal.progress}%` }}
                                                                className="h-full" 
                                                                style={{ backgroundColor: goal.color }} 
                                                             />
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     )}

                                     {mockupTab === 'calendar' && (
                                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                             <div className="flex items-center justify-between">
                                                 <h2 className="text-2xl font-bold text-white">Février 2026</h2>
                                                 <div className="flex gap-2">
                                                     <button className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-white"><ArrowRight className="w-4 h-4 rotate-180" /></button>
                                                     <button className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-white"><ArrowRight className="w-4 h-4" /></button>
                                                 </div>
                                             </div>
                                             <div className="flex-1 grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                                                 {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                                     <div key={day} className="bg-[#0A0A0F] p-4 text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest">{day}</div>
                                                 ))}
                                                 {Array.from({ length: 31 }).map((_, i) => {
                                                     const day = i + 1;
                                                     const hasEvent = [4, 12, 18, 24].includes(day);
                                                     const isToday = day === 24;
                                                     return (
                                                         <div key={i} className="bg-[#0A0A0F] p-2 md:p-4 min-h-[60px] md:min-h-[100px] border-t border-white/5 relative group hover:bg-white/[0.02] transition-colors">
                                                             <span className={`text-xs ${isToday ? 'text-[#00FFB2] font-bold' : 'text-zinc-500'}`}>{day}</span>
                                                             {hasEvent && (
                                                                 <motion.div 
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="mt-2 p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hidden md:block"
                                                                 >
                                                                     <div className="text-[9px] text-indigo-400 truncate font-medium">Réunion Team</div>
                                                                 </motion.div>
                                                             )}
                                                             {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#00FFB2] shadow-[0_0_10px_#00FFB2]" />}
                                                         </div>
                                                     );
                                                 })}
                                             </div>
                                         </div>
                                     )}

                                     {mockupTab === 'routines' && (
                                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                             <div className="flex justify-between items-end mb-8">
                                                 <div>
                                                     <h2 className="text-2xl font-bold text-white">Vos Routines</h2>
                                                     <p className="text-sm text-zinc-500">Automatisez votre succès au quotidien.</p>
                                                 </div>
                                                 <button className="px-4 py-2 bg-[#00FFB2] text-black font-bold text-xs rounded-xl hover:scale-105 transition-transform">+ Créer</button>
                                             </div>
                                             <div className="grid gap-4">
                                                 {[
                                                     { title: "Boost Matinal", time: "08:30", status: "Terminé", active: true, color: "#00FFB2" },
                                                     { title: "Review LinkedIn", time: "11:00", status: "En cours", active: true, color: "#6366F1" },
                                                     { title: "Analyse SEO", time: "14:00", status: "À venir", active: false, color: "#F59E0B" },
                                                     { title: "Backup Projets", time: "18:00", status: "Programmé", active: true, color: "#10B981" }
                                                 ].map((routine, i) => (
                                                     <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                                                         <div className="flex items-center gap-4">
                                                             <div className={`w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent`} style={{ color: routine.color }}>
                                                                 <Zap className="w-6 h-6" />
                                                             </div>
                                                             <div>
                                                                 <h4 className="text-white font-medium">{routine.title}</h4>
                                                                 <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                                     <Calendar className="w-3 h-3" />
                                                                     <span>Tous les jours à {routine.time}</span>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                         <div className="flex items-center gap-6">
                                                             <div className="hidden md:block">
                                                                 <span className={`text-[10px] font-mono px-2 py-1 rounded-full border border-white/5 ${routine.status === 'Terminé' ? 'text-green-500 bg-green-500/10' : 'text-zinc-500 bg-white/5'}`}>
                                                                     {routine.status}
                                                                 </span>
                                                             </div>
                                                             <div className={`w-12 h-6 rounded-full relative transition-colors ${routine.active ? 'bg-[#00FFB2]/20' : 'bg-zinc-800'}`}>
                                                                 <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${routine.active ? 'right-1 bg-[#00FFB2]' : 'left-1 bg-zinc-600'}`} />
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     )}

                                     {mockupTab === 'team' && (
                                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                             <div className="flex items-center justify-between mb-8">
                                                 <h2 className="text-2xl font-bold text-white">Équipe Edwin</h2>
                                                 <div className="flex -space-x-3">
                                                     {[1,2,3,4,5].map(i => (
                                                         <div key={i} className="w-10 h-10 rounded-full border-4 border-[#0A0A0F] bg-zinc-800 overflow-hidden">
                                                             <Image src={`https://i.pravatar.cc/150?u=${i+20}`} width={40} height={40} alt="Avatar" />
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                             <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                                                 <div className="grid grid-cols-4 p-6 border-b border-white/5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                                     <div className="col-span-2">Membre</div>
                                                     <div>Rôle</div>
                                                     <div>Status</div>
                                                 </div>
                                                 <div className="divide-y divide-white/5">
                                                     {[
                                                         { name: "Mathias R.", role: "Admin", status: "En ligne", avatar: 1 },
                                                         { name: "Sophie V.", role: "Design", status: "Occupée", avatar: 2 },
                                                         { name: "Kevin L.", role: "Dev", status: "Absent", avatar: 3 },
                                                         { name: "Clara M.", role: "Marketing", status: "En ligne", avatar: 4 }
                                                     ].map((member, i) => (
                                                         <div key={i} className="grid grid-cols-4 p-6 items-center hover:bg-white/[0.02] transition-colors">
                                                             <div className="col-span-2 flex items-center gap-3">
                                                                 <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                                                                     <Image src={`https://i.pravatar.cc/150?u=${member.avatar+30}`} width={40} height={40} alt="Avatar" />
                                                                 </div>
                                                                 <span className="text-white font-medium">{member.name}</span>
                                                             </div>
                                                             <div className="text-xs text-zinc-500">{member.role}</div>
                                                             <div className="flex items-center gap-2">
                                                                 <div className={`w-2 h-2 rounded-full ${member.status === 'En ligne' ? 'bg-[#00FFB2] shadow-[0_0_10px_#00FFB2]' : 'bg-zinc-600'}`} />
                                                                 <span className="text-[10px] text-zinc-400 font-medium">{member.status}</span>
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>
                                     )}

                                     {mockupTab === 'messages' && (
                                         <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                                 <div className="flex items-center gap-4">
                                                     <div className="w-10 h-10 rounded-full bg-zinc-800" />
                                                     <div>
                                                         <h3 className="text-white font-bold">Groupe Edwin Core</h3>
                                                         <p className="text-[10px] text-[#00FFB2] font-mono">4 MEMBRES ACTIFS</p>
                                                     </div>
                                                 </div>
                                                 <div className="flex gap-2">
                                                     <button className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-zinc-500"><Users className="w-4 h-4" /></button>
                                                     <button className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-zinc-500"><MessageSquare className="w-4 h-4" /></button>
                                                 </div>
                                             </div>
                                             <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                                                 {[
                                                     { user: "Sarah", msg: "J&apos;ai terminé l&apos;intégration des nouveaux graphiques !", time: "10:24", own: false },
                                                     { user: "Moi", msg: "Super boulot, le rendu est impressionnant. 🚀", time: "10:25", own: true },
                                                     { user: "Marc", msg: "On déploie ça cet après-midi ?", time: "10:28", own: false },
                                                     { user: "Sarah", msg: "Absolument, tout est prêt pour le push.", time: "10:30", own: false }
                                                 ].map((chat, i) => (
                                                     <div key={i} className={`flex flex-col ${chat.own ? 'items-end' : 'items-start'}`}>
                                                         {!chat.own && <span className="text-[10px] text-zinc-600 mb-1 ml-4">{chat.user}</span>}
                                                         <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${chat.own ? 'bg-[#00FFB2] text-black font-medium' : 'bg-white/[0.03] border border-white/5 text-zinc-300'}`}>
                                                             {chat.msg}
                                                         </div>
                                                         <span className="text-[9px] text-zinc-700 mt-1 uppercase font-mono">{chat.time}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                             <div className="p-6 bg-white/[0.01] border-t border-white/5">
                                                 <div className="flex gap-3">
                                                     <input className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFB2]/50" placeholder="Votre message..." />
                                                     <button className="p-2 bg-[#00FFB2] text-black rounded-xl"><ArrowRight className="w-5 h-5" /></button>
                                                 </div>
                                             </div>
                                         </div>
                                     )}

                                     {mockupTab === 'analytics' && (
                                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                             <div className="flex items-center justify-between">
                                                 <h2 className="text-2xl font-bold text-white">Analyses Edwin</h2>
                                                 <div className="flex gap-2">
                                                     <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-zinc-400">Derniers 30 jours</div>
                                                 </div>
                                             </div>
                                             <div className="flex-1 min-h-[300px] relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden group">
                                                 {/* Custom SVG Line Chart Mockup */}
                                                 <svg viewBox="0 0 800 300" className="w-full h-full stroke-[#00FFB2] fill-none stroke-[3] drop-shadow-[0_0_15px_rgba(0,255,178,0.5)]">
                                                     <motion.path 
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 2, ease: "easeInOut" }}
                                                        d="M0,250 C100,220 150,280 200,200 C250,120 300,180 350,100 C400,20 450,150 500,120 C550,90 600,180 650,140 C700,100 750,50 800,20" 
                                                     />
                                                     <motion.path 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 0.1 }}
                                                        transition={{ delay: 1 }}
                                                        d="M0,250 C100,220 150,280 200,200 C250,120 300,180 350,100 C400,20 450,150 500,120 C550,90 600,180 650,140 C700,100 750,50 800,20 V300 H0 Z" 
                                                        fill="#00FFB2"
                                                        stroke="none"
                                                     />
                                                 </svg>
                                                 <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                                                     <div className="flex justify-between text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                                                         <span>$45.0k</span>
                                                         <span>$30.0k</span>
                                                         <span>$15.0k</span>
                                                         <span>$0</span>
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                 {[
                                                     { label: "Visites", val: "12,402", trend: "+24%" },
                                                     { label: "Conversion", val: "4.8%", trend: "+0.5%" },
                                                     { label: "Revenue", val: "€8,240", trend: "+12%" },
                                                     { label: "DAU", val: "850", trend: "+5%" }
                                                 ].map((stat, i) => (
                                                     <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                         <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">{stat.label}</div>
                                                         <div className="text-xl font-bold text-white mb-1">{stat.val}</div>
                                                         <div className="text-[10px] text-[#00FFB2]">{stat.trend}</div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     )}
                                 </motion.div>
                             </AnimatePresence>
                         </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -right-10 w-64 p-5 bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-2xl z-30 pointer-events-none hidden lg:block"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00FFB2]/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-[#00FFB2]" />
                        </div>
                        <div>
                            <div className="text-white text-sm font-bold">Système Prêt</div>
                            <div className="text-[#00FFB2] text-[10px] font-mono">TOUS LES INDICATEURS SONT AU VERT</div>
                        </div>
                    </div>
                </motion.div>

                {/* Light reflection effect */}
                <div className="absolute -inset-10 bg-gradient-to-tr from-[#00FFB2]/5 via-transparent to-indigo-500/10 opacity-30 blur-[100px] pointer-events-none" />
            </motion.div>
        </section>
    );
};


const FeatureCard = ({ title, desc, icon: Icon, delay = 0, image }: { title: string, desc: string, icon: ElementType, delay?: number, image?: string }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#00FFB2]/30 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
    >
        {image && (
            <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                <Image src={image} fill className="object-cover opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110" alt={title} />
            </>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFB2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-3xl" />
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-text-dim group-hover:text-[#00FFB2] transition-colors" />
            </div>
            <h3 className="text-xl font-medium text-text-main mb-3">{title}</h3>
            <p className="text-text-dim leading-relaxed text-sm font-light">{desc}</p>
        </div>
    </motion.div>
);

const BentoGrid = () => {
    const { t } = useTranslation();
    return (
        <section id="features" className="py-32 px-6 bg-bg-deep relative z-20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-medium text-text-main mb-6">{t.features.sectionTitle}</h2>
                    <p className="text-text-dim font-light">
                        {t.features.sectionSubtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <div className="md:col-span-2 relative h-[400px] rounded-3xl bg-glass-bg border border-glass-border overflow-hidden group">
                         <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg-secondary to-transparent z-10" />
                         <Image src="/secure-drive.png" fill className="object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" alt="Drive Storage" />
                         <div className="absolute bottom-0 left-0 p-10 z-20 max-w-lg">
                             <div className="text-accent-primary font-mono text-xs mb-2">{t.features.driveLabel}</div>
                             <h3 className="text-3xl font-medium text-text-main mb-2">{t.features.driveTitle}</h3>
                             <p className="text-text-dim font-light">{t.features.driveDesc}</p>
                         </div>
                    </div>

                    {/* Tall Card */}
                    <div className="md:row-span-2 rounded-3xl bg-glass-bg border border-glass-border p-8 flex flex-col items-center text-center group hover:border-accent-primary/20 transition-colors relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-secondary to-transparent z-10" />
                        <Image src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" fill className="object-cover opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110" alt="Dashboards" />
                        
                        <div className="relative z-20 flex flex-col items-center">
                            <div className="w-full h-48 bg-gradient-to-tr from-accent-primary/20 to-blue-500/20 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-grid-white/[0.05]" />
                                 <BarChart3 className="w-16 h-16 text-accent-primary relative z-10" />
                            </div>
                            <h3 className="text-2xl font-medium text-text-main mb-4">{t.features.dashboardTitle}</h3>
                            <p className="text-text-dim font-light text-sm">{t.features.dashboardDesc}</p>
                        </div>
                    </div>

                    {/* Small Cards */}
                    <FeatureCard 
                        title={t.features.collaborationTitle} 
                        desc={t.features.collaborationDesc} 
                        icon={Users}
                        delay={0.1}
                        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"
                    />
                    <FeatureCard 
                        title={t.features.messagingTitle} 
                        desc={t.features.messagingDesc} 
                        icon={MessageSquare}
                        delay={0.2}
                        image="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2670&auto=format&fit=crop"
                    />

                    {/* New Content */}
                    <FeatureCard 
                        title={t.features.taskTitle} 
                        desc={t.features.taskDesc} 
                        icon={List}
                        delay={0.3}
                        image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2670&auto=format&fit=crop"
                    />
                    
                     <div className="md:col-span-2 relative h-[320px] rounded-3xl bg-glass-bg border border-glass-border overflow-hidden group p-10 flex flex-col justify-between hover:border-accent-primary/20 transition-colors">
                         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-secondary to-transparent z-10" />
                         <Image src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" fill className="object-cover opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" alt="Security" />
                         <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:opacity-20 transition-opacity z-20">
                             <Shield className="w-64 h-64 text-accent-primary" />
                         </div>
                         <div className="relative z-20">
                             <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center mb-6">
                                 <Shield className="w-6 h-6 text-accent-primary" />
                             </div>
                             <h3 className="text-2xl font-medium text-text-main mb-3">{t.features.securityTitle}</h3>
                             <p className="text-text-dim font-light max-w-md">{t.features.securityDesc}</p>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Services = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { isAuthenticated } = useAuthStore();
    const { t } = useTranslation();

    const TAB_CONTENT = [
        {
            id: 'docs',
            title: t.tabContent.documents.title,
            desc: t.tabContent.documents.desc,
            icon: FileText,
            gradient: 'from-[#00FFB2]/20 to-emerald-500/20',
            image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=2670'
        },
        {
            id: 'dashboards',
            title: t.tabContent.dashboards.title,
            desc: t.tabContent.dashboards.desc,
            icon: Layout,
            gradient: 'from-blue-500/20 to-cyan-500/20',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2670' 
        },
        {
            id: 'chat',
            title: t.tabContent.chat.title,
            desc: t.tabContent.chat.desc,
            icon: MessageSquare,
            gradient: 'from-purple-500/20 to-pink-500/20',
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2670'
        },
        {
            id: 'goals',
            title: t.tabContent.goals.title,
            desc: t.tabContent.goals.desc,
            icon: Target,
            gradient: 'from-red-500/20 to-orange-500/20',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426'
        },
        {
            id: 'whiteboards',
            title: t.tabContent.routines.title,
            desc: t.tabContent.routines.desc,
            icon: Zap,
            gradient: 'from-yellow-400/20 to-amber-500/20',
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=2670'
        }
    ];

    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="bg-bg-deep rounded-[48px] p-8 md:p-16 border border-glass-border flex flex-col md:flex-row gap-16 min-h-[600px]">
                {/* Left: Tabs */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="text-[#D7FE03] font-bold uppercase tracking-widest mb-8">{t.common.services}</div>
                    <div className="space-y-4">
                        {TAB_CONTENT.map((tab, i) => (
                            <button 
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center justify-between group ${
                                    activeTab === i 
                                    ? 'bg-bg-tertiary border-glass-border text-text-main' 
                                    : 'bg-transparent border-transparent text-text-muted hover:bg-glass-hover'
                                }`}
                            >
                                <span className={`text-xl font-medium ${activeTab === i ? 'text-text-main' : 'group-hover:text-text-dim'}`}>
                                    {tab.title}
                                </span>
                                {activeTab === i && (
                                    <div className="w-8 h-8 bg-[#D7FE03] rounded-full flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4 text-black" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-2/3 relative rounded-[32px] overflow-hidden bg-bg-tertiary border border-glass-border">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 p-12 flex flex-col"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0 opacity-40">
                                <Image src={TAB_CONTENT[activeTab].image} alt={TAB_CONTENT[activeTab].title} fill className="object-cover grayscale mix-blend-overlay" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${TAB_CONTENT[activeTab].gradient} mix-blend-soft-light`} />
                            </div>

                            <div className="relative z-10 mt-auto">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl text-white font-medium mb-4">{TAB_CONTENT[activeTab].title}</h3>
                                <p className="text-zinc-100 text-lg max-w-md mb-8">{TAB_CONTENT[activeTab].desc}</p>
                                <Link 
                                    href={isAuthenticated ? "/dashboard" : "/login"}
                                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#D7FE03] transition-colors inline-block"
                                >
                                    {t.common.exploreFeature}
                                </Link>
                            </div>
                        </motion.div>
                     </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({ plan, price, highlight = false, billingCycle, originalPrice, features }: { plan: string; price: string | null; highlight?: boolean; billingCycle: 'monthly' | 'yearly'; originalPrice?: string; features: string[] }) => {
    const { t } = useTranslation();
    return (
        <div className={`
            p-10 rounded-[40px] border flex flex-col h-full transition-all duration-300
            ${highlight 
                ? 'bg-bg-tertiary border-[#00FFB2]/50 shadow-[0_0_40px_rgba(0,255,178,0.1)]' 
                : 'bg-bg-secondary border-glass-border hover:border-text-muted/30'
            }
        `}>
            <div className="mb-8">
                <h3 className="text-2xl text-text-main font-medium mb-2">{plan}</h3>
                <div className="flex items-baseline gap-2 h-20 overflow-visible flex-wrap">
                    {price === null ? (
                        <span className="text-4xl font-medium text-text-main">{t.common.onQuote}</span>
                    ) : (
                        <div className="flex flex-col">
                            {originalPrice && (
                                <div className="text-text-muted line-through text-lg font-medium">
                                    ${originalPrice}
                                </div>
                            )}
                            <div className="flex items-baseline">
                                {price === '0' || price === 'FREE' || price === 'GRATUIT' ? (
                                    <span className="text-5xl font-medium text-text-main uppercase tracking-tight">{t.common.free}</span>
                                ) : (
                                    <span className="text-5xl font-medium text-text-main flex">
                                        €
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={billingCycle + price}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="block"
                                            >
                                                {price}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                )}
                                {(price !== '0' && price !== 'FREE' && price !== 'GRATUIT') && (
                                    <span className="text-text-muted ml-1">{(plan === 'Team' || plan === 'Pro' || plan === 'Business') ? t.common.perMonth : t.common.perUserMonth}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-text-dim">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-[#D7FE03] text-black' : 'bg-[#242424] text-white'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        {f}
                    </div>
                ))}
            </div>

            <Link href={`/register?plan=${plan.toLowerCase()}&billing=${billingCycle}`} className="block w-full">
                <button className={`
                    w-full py-4 rounded-[20px] font-bold text-lg transition-all shadow-lg
                    ${highlight 
                        ? 'bg-accent-primary text-white hover:opacity-90 shadow-accent-primary/20' 
                        : 'bg-glass-bg text-text-main border border-glass-border hover:bg-accent-primary hover:text-white hover:border-accent-primary'
                    }
                `}>
                    {t.common.getStarted}
                </button>
            </Link>
        </div>
    );
};

const SimplePricing = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { t } = useTranslation();

    const plans = [
        {
            plan: t.pricing.plans.free.name,
            price: "GRATUIT",
            originalPrice: "0",
            features: t.pricing.plans.free.features,
            highlight: false
        },
        {
            plan: t.pricing.plans.pro.name,
            price: billingCycle === 'monthly' ? "9.99" : "8.99",
            originalPrice: billingCycle === 'monthly' ? "15" : "12",
            features: t.pricing.plans.pro.features,
            highlight: true
        },
        {
            plan: t.pricing.plans.team.name,
            price: billingCycle === 'monthly' ? "29.99" : "24.99",
            originalPrice: billingCycle === 'monthly' ? "39" : "29",
            features: t.pricing.plans.team.features,
            highlight: false
        },
        {
            plan: t.pricing.plans.enterprise.name,
            price: null,
            features: t.pricing.plans.enterprise.features,
            highlight: false
        }
    ];

    return (
        <section id="pricing" className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-[60px] text-text-main font-medium mb-6">{t.pricing.title}</h2>
                
                {/* Toggle */}
                <div className="inline-flex items-center p-1 bg-bg-tertiary rounded-full border border-glass-border">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${billingCycle === 'monthly' ? 'bg-bg-secondary text-text-main shadow-lg' : 'text-text-muted hover:text-text-dim'}`}
                    >
                        {t.common.monthly}
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${billingCycle === 'yearly' ? 'bg-bg-secondary text-text-main shadow-lg' : 'text-text-muted hover:text-text-dim'}`}
                    >
                        {t.common.yearly}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {plans.map((p, i) => (
                    <PricingCard 
                        key={i}
                        plan={p.plan} 
                        price={p.price} 
                        originalPrice={p.originalPrice} 
                        billingCycle={billingCycle} 
                        features={p.features}
                        highlight={p.highlight}
                    />
                ))}
            </div>
        </section>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const { t } = useTranslation();

    return (
        <section id="faq" className="py-32 px-6 bg-bg-deep relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-medium text-text-main mb-6">{t.faq.title}</h2>
                    <p className="text-text-dim font-light max-w-xl mx-auto">
                        {t.faq.subtitle}
                    </p>
                </div>

                <div className="space-y-4">
                    {t.faq.items.map((faq, i) => (
                        <div 
                            key={i}
                            className={`rounded-3xl border transition-all duration-300 ${
                                openIndex === i 
                                ? 'bg-glass-bg border-glass-border shadow-sm' 
                                : 'bg-transparent border-glass-border hover:border-text-muted/30'
                            }`}
                        >
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4"
                            >
                                <span className={`text-lg md:text-xl font-medium transition-colors ${openIndex === i ? 'text-accent-primary' : 'text-text-dim'}`}>
                                    {faq.question}
                                </span>
                                <div className={`shrink-0 w-8 h-8 rounded-full border border-glass-border flex items-center justify-center transition-transform duration-300 ${openIndex === i ? 'rotate-180 bg-accent-primary/10 border-accent-primary/20' : ''}`}>
                                    <ArrowRight className={`w-4 h-4 transition-colors ${openIndex === i ? 'text-accent-primary rotate-90' : 'text-text-muted'}`} />
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 md:px-8 pb-8 text-text-dim font-light leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Support CTA */}
                <div className="mt-20 p-8 rounded-[32px] bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-glass-border text-center">
                    <h3 className="text-text-main font-medium mb-2">{t.faq.noAnswer}</h3>
                    <p className="text-text-dim text-sm mb-6">{t.faq.teamAvailable}</p>
                    <Link 
                        href="/contact" 
                        className="px-8 py-3 rounded-full border border-glass-border text-text-main text-sm font-medium hover:bg-glass-hover transition-colors inline-block"
                    >
                        {t.common.contactSupport}
                    </Link>
                </div>
            </div>
        </section>
    );
};


export default function HomePage() {
  return (
    <main className="bg-bg-primary min-h-screen text-text-main font-sans selection:bg-[#00FFB2] selection:text-black">
        <LandingNavbar />
        <Hero />
        <ReplaceAllSection />
        <BentoGrid />
        <Services />
        <SimplePricing />
        <FAQSection />
        <LandingFooter />
    </main>
  );
}
