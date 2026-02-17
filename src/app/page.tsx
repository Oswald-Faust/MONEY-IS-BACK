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

// --- Components ---

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';

const ReplaceAllSection = () => {
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
                <h2 className="text-3xl font-bold text-text-main mb-4">Remplacez-les tous</h2>
                <p className="text-text-dim max-w-xl mx-auto">
                    Ne perdez plus de contexte entre vos outils.
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
    const words = ["remplacer.", "contrôler.", "créer."];
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
                    pour tout {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

const Hero = () => {
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
                    V2.0 Mainnet Live
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight text-text-main mb-8 leading-[0.9]"
                >
                    Une seule app <br/>
                    <AnimatedText />
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-text-dim max-w-2xl mx-auto mb-12 font-light"
                >
                    Retrouvez vos Tâches, Docs, Chat, Objectifs, et bien plus encore sur une seule plateforme unifiée. L&apos;OS de votre réussite.
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
                        COMMENCER GRATUITEMENT
                    </Link>
                    <button className="px-10 py-4 rounded-full border border-glass-border text-text-main font-medium text-sm hover:bg-glass-hover transition-colors flex items-center gap-2 group">
                        <span className="w-8 h-8 rounded-full bg-glass-bg flex items-center justify-center group-hover:bg-glass-hover transition-colors">
                            <span className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-text-main border-b-[5px] border-b-transparent ml-0.5" />
                        </span>
                        Voir la démo
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
                                     <div className="text-white text-sm font-bold">Tâche terminée</div>
                                     <div className="text-zinc-500 text-xs">Il y a 2 min</div>
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
    return (
        <section id="features" className="py-32 px-6 bg-bg-deep relative z-20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-medium text-text-main mb-6">Tout ce dont vous avez besoin.</h2>
                    <p className="text-text-dim font-light">
                        Nous avons déconstruit le chaos du travail moderne pour en faire un système fluide et intégré.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <div className="md:col-span-2 relative h-[400px] rounded-3xl bg-glass-bg border border-glass-border overflow-hidden group">
                         <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg-secondary to-transparent z-10" />
                         <Image src="/secure-drive.png" fill className="object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" alt="Drive Storage" />
                         <div className="absolute bottom-0 left-0 p-10 z-20 max-w-lg">
                             <div className="text-accent-primary font-mono text-xs mb-2">DRIVE</div>
                             <h3 className="text-3xl font-medium text-text-main mb-2">Stockage & Partage Sécurisé</h3>
                             <p className="text-text-dim font-light">Un espace centralisé pour tous vos fichiers. Partagez des documents avec des liens sécurisés et gérez les permissions d&apos;accès.</p>
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
                            <h3 className="text-2xl font-medium text-text-main mb-4">Tableaux de Bord Dynamiques</h3>
                            <p className="text-text-dim font-light text-sm">Visualisez l&apos;avancement de vos projets, suivez vos budgets et analysez la performance de vos équipes en un coup d&apos;œil.</p>
                        </div>
                    </div>

                    {/* Small Cards */}
                    <FeatureCard 
                        title="Collaboration en Temps Réel" 
                        desc="Travaillez ensemble sur les mêmes documents et tâches sans conflit." 
                        icon={Users}
                        delay={0.1}
                        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"
                    />
                    <FeatureCard 
                        title="Messagerie Intégrée" 
                        desc="Discutez avec votre équipe directement dans le contexte de vos projets." 
                        icon={MessageSquare}
                        delay={0.2}
                        image="https://images.unsplash.com/photo-1577563908411-5077b6ac7624?q=80&w=2670&auto=format&fit=crop"
                    />

                    {/* New Content */}
                    <FeatureCard 
                        title="Gestion de Tâches Avancée" 
                        desc="Organisez votre travail avec des listes, des tableaux kanban et des calendriers." 
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
                             <h3 className="text-2xl font-medium text-text-main mb-3">Contrôle d&apos;Accès Sécurisé</h3>
                             <p className="text-text-dim font-light max-w-md">Définissez précisément qui peut voir et modifier quoi. Protégez vos informations sensibles avec des rôles et des permissions granulaires.</p>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TAB_CONTENT = [
    {
        id: 'docs',
        title: 'Documents',
        desc: 'Créez des documents magnifiques, des wikis et des bases de connaissances connectés à vos tâches.',
        icon: FileText,
        gradient: 'from-[#00FFB2]/20 to-emerald-500/20',
        image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=2670' // Updated Image
    },
    {
        id: 'dashboards',
        title: 'Tableaux de bord',
        desc: 'Obtenez une vue d’ensemble complète avec des graphiques en temps réel et des rapports personnalisables.',
        icon: Layout,
        gradient: 'from-blue-500/20 to-cyan-500/20',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2670' 
    },
    {
        id: 'chat',
        title: 'Discussion',
        desc: 'Communiquez en temps réel avec votre équipe, partagez des fichiers et restez connectés.',
        icon: MessageSquare,
        gradient: 'from-purple-500/20 to-pink-500/20',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2670'
    },
    {
        id: 'goals',
        title: 'Objectifs',
        desc: 'Définissez des objectifs stratégiques, suivez la progression et alignez votre équipe.',
        icon: Target,
        gradient: 'from-red-500/20 to-orange-500/20',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426'
    },
    {
        id: 'whiteboards',
        title: 'Routines',
        desc: 'Automatisez vos processus récurrents et maintenez la cohérence de vos opérations.',
        icon: Zap,
        gradient: 'from-yellow-400/20 to-amber-500/20',
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=2670'
    }
];

const Services = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { isAuthenticated } = useAuthStore();

    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="bg-bg-deep rounded-[48px] p-8 md:p-16 border border-glass-border flex flex-col md:flex-row gap-16 min-h-[600px]">
                {/* Left: Tabs */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="text-[#D7FE03] font-bold uppercase tracking-widest mb-8">Services</div>
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
                                    Explore Feature
                                </Link>
                            </div>
                        </motion.div>
                     </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({ plan, price, highlight = false, billingCycle, originalPrice, features }: { plan: string; price: string | null; highlight?: boolean; billingCycle: 'monthly' | 'yearly'; originalPrice?: string; features: string[] }) => (
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
                    <span className="text-4xl font-medium text-text-main">Sur devis</span>
                ) : (
                    <div className="flex flex-col">
                        {originalPrice && (
                            <div className="text-text-muted line-through text-lg font-medium">
                                ${originalPrice}
                            </div>
                        )}
                        <div className="flex items-baseline">
                            {price === '0' || price === 'FREE' || price === 'GRATUIT' ? (
                                <span className="text-5xl font-medium text-text-main uppercase tracking-tight">Gratuit</span>
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
                                <span className="text-text-muted ml-1">{plan === 'Team' ? '/mois' : '/user/mois'}</span>
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
                Commencer
            </button>
        </Link>
    </div>
);

const SimplePricing = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            plan: "Gratuit",
            price: "GRATUIT",
            originalPrice: "0",
            features: [
                "1 Utilisateur maximum",
                "1 Projet maximum",
                "1 Go de stockage Drive",
                "7 Tâches max par projet",
                "Routines limitées"
            ],
            highlight: false
        },
        {
            plan: "Pro",
            price: billingCycle === 'monthly' ? "9.99" : "8.99",
            originalPrice: billingCycle === 'monthly' ? "15" : "12",
            features: [
                "3 Utilisateurs inclus",
                "€6.99/user supplémentaire",
                "3 Projets inclus",
                "€4.99/projet supplémentaire",
                "10 Go de stockage Drive",
                "Tâches & Routines illimitées"
            ],
            highlight: true
        },
        {
            plan: "Team",
            price: billingCycle === 'monthly' ? "29.99" : "24.99",
            originalPrice: billingCycle === 'monthly' ? "39" : "29",
            features: [
                "10 Utilisateurs inclus",
                "€4.99/user supplémentaire",
                "5 Projets inclus",
                "€4.99/projet supplémentaire",
                "Stockage illimité",
                "Dashboard personnalisés",
                "Mindmaps & Timelines"
            ],
            highlight: false
        },
        {
            plan: "Enterprise",
            price: null,
            features: [
                "Utilisateurs illimités",
                "White Label complet",
                "Logs d'Audit & Sécurité",
                "SAML SSO / Okta",
                "API illimitée",
                "Success Manager dédié"
            ],
            highlight: false
        }
    ];

    return (
        <section id="pricing" className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-[60px] text-text-main font-medium mb-6">Tarifs Simples</h2>
                
                {/* Toggle */}
                <div className="inline-flex items-center p-1 bg-bg-tertiary rounded-full border border-glass-border">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${billingCycle === 'monthly' ? 'bg-bg-secondary text-text-main shadow-lg' : 'text-text-muted hover:text-text-dim'}`}
                    >
                        Mensuel
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${billingCycle === 'yearly' ? 'bg-bg-secondary text-text-main shadow-lg' : 'text-text-muted hover:text-text-dim'}`}
                    >
                        Annuel (-25%)
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

    const faqs = [
        {
            question: "Qu'est-ce que MONEY IS BACK ?",
            answer: "MONEY IS BACK est une plateforme de gestion de projet révolutionnaire qui centralise vos tâches, vos documents, votre stockage drive, vos objectifs et votre communication d'équipe dans une interface unique et ultra-rapide."
        },
        {
            question: "Mes données sont-elles en sécurité ?",
            answer: "Absolument. Nous utilisons un chiffrement de bout en bout de niveau bancaire (AES-256) pour tous vos fichiers et bases de données. Vos documents sensibles sont protégés par des protocoles d'accès granulaires et une infrastructure sécurisée."
        },
        {
            question: "Puis-je inviter mon équipe ?",
            answer: "Oui, la plateforme est conçue pour la collaboration. Selon votre plan, vous pouvez inviter un nombre variable de collaborateurs avec des rôles et des permissions spécifiques (Admin, Membre, Invité)."
        },
        {
            question: "Le stockage Drive est-il illimité ?",
            answer: "Le stockage dépend de votre abonnement. Le plan Gratuit inclut 1 Go, le plan Pro 10 Go, et le plan Team offre un stockage illimité pour accompagner la croissance de votre entreprise sans contraintes."
        },
        {
            question: "Comment fonctionne la transition vers MONEY IS BACK ?",
            answer: "Nous proposons des outils d'importation fluides pour Trello, Asana et Notion. Vous pouvez migrer vos tâches et votre historique en quelques clics pour ne rien perdre de votre progression."
        },
        {
            question: "Puis-je annuler mon abonnement à tout moment ?",
            answer: "Oui, nos abonnements sont sans engagement de durée pour les formats mensuels. Vous pouvez passer d'un plan à un autre ou résilier directement depuis vos paramètres sans frais cachés."
        }
    ];

    return (
        <section id="faq" className="py-32 px-6 bg-bg-deep relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-medium text-text-main mb-6">Questions Fréquentes</h2>
                    <p className="text-text-dim font-light max-w-xl mx-auto">
                        Tout ce que vous devez savoir sur la plateforme pour booster votre productivité.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
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
                    <h3 className="text-text-main font-medium mb-2">Vous n&apos;avez pas trouvé votre réponse ?</h3>
                    <p className="text-text-dim text-sm mb-6">Notre équipe est disponible 24/7 pour vous aider.</p>
                    <button className="px-6 py-2 rounded-full border border-glass-border text-text-main text-sm font-medium hover:bg-glass-hover transition-colors">
                        Contacter le Support
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
