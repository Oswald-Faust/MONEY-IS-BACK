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
import { useState, useEffect } from 'react';
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

            {/* Dashboard Mockup - Floating & Glass */}
            <motion.div 
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.8, type: "spring" }}
                style={{ perspective: "1000px" }}
                className="mt-20 relative w-full max-w-6xl mx-auto"
            >
                <div className="relative rounded-xl overflow-hidden border border-glass-border shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-bg-secondary/80 backdrop-blur-xl">
                    {/* Fake Browser UI */}
                    <div className="h-10 border-b border-glass-border flex items-center px-4 gap-2 bg-black/40">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500 border border-transparent" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 text-yellow-500 border border-transparent" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-500 border border-transparent" />
                        </div>
                        <div className="mx-auto w-[40%] h-5 bg-white/5 rounded-md text-[10px] flex items-center justify-center text-zinc-600">
                            moneyisback.app
                        </div>
                    </div>
                    {/* Content Preview */}
                    <div className="p-8 grid grid-cols-12 gap-8 h-[500px] md:h-[600px] overflow-hidden relative">
                         {/* Sidebar */}
                         <div className="col-span-2 hidden md:flex flex-col gap-4 border-r border-glass-border pr-4">
                             <div className="h-8 w-8 bg-[#00FFB2] rounded-lg mb-6" />
                             {[...Array(6)].map((_, i) => (
                                 <div key={i} className="h-2 w-2/3 bg-text-main/10 rounded-full" />
                             ))}
                             <div className="mt-auto h-20 bg-glass-bg rounded-xl border border-glass-border" />
                         </div>
                         {/* Main */}
                         <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
                             {/* Header */}
                             <div className="flex justify-between items-center">
                                 <div className="space-y-2">
                                     <div className="h-8 w-64 bg-text-main/10 rounded-lg" />
                                     <div className="h-4 w-96 bg-text-main/5 rounded-lg" />
                                 </div>
                                 <div className="flex gap-2">
                                     <div className="h-8 w-24 bg-[#00FFB2]/20 rounded-lg border border-[#00FFB2]/30" />
                                     <div className="h-8 w-8 bg-text-main/10 rounded-lg" />
                                 </div>
                             </div>
                             {/* Cards Grid */}
                             <div className="grid grid-cols-3 gap-6">
                                 {[...Array(3)].map((_, i) => (
                                     <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5 p-4 space-y-3 relative overflow-hidden group">
                                         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                         <div className="h-8 w-8 bg-white/10 rounded-full" />
                                         <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                                         <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                                     </div>
                                 ))}
                             </div>
                             {/* List */}
                             <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-6 space-y-4">
                                  {[...Array(5)].map((_, i) => (
                                     <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                                         <div className="w-4 h-4 rounded border border-white/20" />
                                         <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                                         <div className="ml-auto h-4 w-16 bg-[#00FFB2]/20 text-[#00FFB2] rounded-full text-[10px] flex items-center justify-center font-mono">
                                             ACTIVE
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                         
                         {/* Floating Elements */}
                         <motion.div 
                             animate={{ y: [0, -20, 0] }} 
                             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                             className="absolute top-20 right-20 w-64 p-4 bg-[#050505] border border-white/10 rounded-xl shadow-2xl z-20 pointer-events-none"
                         >
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                     <CheckCircle2 className="w-5 h-5 text-green-500" />
                                 </div>
                                 <div>
                                     <div className="text-white text-sm font-bold">{t.mockup.taskCompleted}</div>
                                     <div className="text-zinc-500 text-xs">{t.mockup.timeAgo}</div>
                                 </div>
                             </div>
                         </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};


const FeatureCard = ({ title, desc, icon: Icon, delay = 0, image }: { title: string, desc: string, icon: React.ElementType, delay?: number, image?: string }) => (
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
                        image="https://images.unsplash.com/photo-1577563908411-5077b6ac7624?q=80&w=2670&auto=format&fit=crop"
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
                                    <span className="text-text-muted ml-1">{plan === 'Team' ? t.common.perMonth : t.common.perUserMonth}</span>
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
                    <button className="px-6 py-2 rounded-full border border-glass-border text-text-main text-sm font-medium hover:bg-glass-hover transition-colors">
                        {t.common.contactSupport}
                    </button>
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
