'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Menu,
  X,
  ChevronRight,
  Layout,
  MessageSquare,
  Target,
  FileText,
  Zap,
  Users,
  Bell,
  Search,
  Settings,
  Calendar,
  BarChart3,
  List,
  Kanban,
  CreditCard,
  Globe,
  Smartphone,
  Shield,
  ArrowRight,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Briefcase,
  Cpu,
  Lock,
  Box
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

// --- Components ---

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    
    const [isMobile, setIsMobile] = useState(false);
    
    // Mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointers-events-none"
            >
                <motion.div 
                    layout
                    initial={{ width: "100%", maxWidth: "64rem", borderRadius: "9999px" }}
                    animate={{ 
                        width: isMobile ? "100%" : (scrolled ? "auto" : "100%"), 
                        maxWidth: isMobile ? "100%" : (scrolled ? "800px" : "1024px"),
                        y: isMobile ? 0 : (scrolled ? 10 : 0)
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 350, 
                        damping: 30,
                        layout: { duration: 0.3 }
                    }}
                    style={{
                        padding: isMobile ? "12px 16px" : (scrolled ? "8px 24px" : "12px 32px"),
                    }}
                    className="bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto"
                >
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-[#00FFB2]/50 transition-colors">
                            <span className="text-white font-bold text-xs">M</span>
                        </div>
                        <AnimatePresence mode="popLayout" initial={false}>
                            {!scrolled && (
                                <motion.span 
                                    initial={{ opacity: 0, width: 0, x: -10 }}
                                    animate={{ opacity: 1, width: "auto", x: 0 }}
                                    exit={{ opacity: 0, width: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-lg font-bold text-white tracking-tight hidden sm:block whitespace-nowrap overflow-hidden origin-left"
                                >
                                    MONEY IS BACK
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400 mx-4">
                        <Link href="#features" className="hover:text-white transition-colors">Produit</Link>
                        <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
                        <Link href="#pricing" className="hover:text-white transition-colors">Tarifs</Link>
                        <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
                    </div>

                    {/* Auth / Mobile Toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                        {isAuthenticated ? (
                             <>
                                <Link 
                                    href="/dashboard"
                                    className="hidden md:flex px-4 py-2 rounded-full bg-white/5 text-white text-xs font-bold hover:bg-white/10 border border-white/10 transition-all items-center gap-2"
                                >   
                                    <Layout className="w-3 h-3" />
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {!scrolled && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0, x: -10 }}
                                                animate={{ opacity: 1, width: "auto", x: 0 }}
                                                exit={{ opacity: 0, width: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden whitespace-nowrap"
                                            >
                                                Dashboard
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                                <button onClick={() => logout()} className="hidden md:flex w-8 h-8 rounded-full bg-red-500/10 text-red-400 items-center justify-center hover:bg-red-500/20 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </button>
                             </>
                        ) : (
                            <motion.div 
                                layout
                                className={`hidden md:flex items-center gap-3 ${!scrolled ? "pl-4 border-l border-white/10" : ""}`}
                            >
                                <Link href="/login" className="text-white text-sm font-medium hover:text-[#00FFB2] transition-colors">
                                    Connexion
                                </Link>
                                <Link 
                                    href="/register" 
                                    className="bg-[#00FFB2] text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-[#00e6a0] transition-colors hover:shadow-[0_0_20px_rgba(0,255,178,0.3)]"
                                >
                                    Commencer
                                </Link>
                            </motion.div>
                        )}

                        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>
            </motion.nav>

             {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-40 flex flex-col pt-32 px-6 gap-8 md:hidden"
                    >
                        <div className="flex flex-col gap-6 items-center text-center">
                            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Produit</Link>
                            <Link href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Solutions</Link>
                            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Tarifs</Link>
                            <hr className="w-20 border-white/10" />
                            {isAuthenticated ? (
                                <Link href="/dashboard" className="text-xl font-bold text-[#00FFB2]">Accéder au Dashboard</Link>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl text-zinc-400">Connexion</Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-[#00FFB2]">Commencer</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

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
        <section className="py-24 border-t border-white/5 bg-[#050505] overflow-hidden">
             <div className="text-center mb-16 px-6">
                <h2 className="text-3xl font-bold text-white mb-4">Remplacez-les tous</h2>
                <p className="text-zinc-500 max-w-xl mx-auto">
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
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
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
        <span className="block h-[1.2em] overflow-hidden text-zinc-500">
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
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest uppercase mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse shadow-[0_0_10px_#00FFB2]" />
                    V2.0 Mainnet Live
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight text-white mb-8 leading-[0.9]"
                >
                    Une seule app <br/>
                    <AnimatedText />
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light"
                >
                    Retrouvez vos Tâches, Docs, Chat, Objectifs, et bien plus encore sur une seule plateforme unifiée. L'OS de votre réussite.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link 
                        href="/register" 
                        className="px-10 py-4 rounded-full bg-[#00FFB2] text-black font-bold text-sm tracking-wide hover:shadow-[0_0_40px_rgba(0,255,178,0.4)] transition-all hover:scale-105"
                    >
                        COMMENCER GRATUITEMENT
                    </Link>
                    <button className="px-10 py-4 rounded-full border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors flex items-center gap-2 group">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <span className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
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
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-[#0A0A0F]/80 backdrop-blur-xl">
                    {/* Fake Browser UI */}
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-black/40">
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
                         <div className="col-span-2 hidden md:flex flex-col gap-4 border-r border-white/5 pr-4">
                             <div className="h-8 w-8 bg-[#00FFB2] rounded-lg mb-6" />
                             {[...Array(6)].map((_, i) => (
                                 <div key={i} className="h-2 w-2/3 bg-white/10 rounded-full" />
                             ))}
                             <div className="mt-auto h-20 bg-white/5 rounded-xl border border-white/5" />
                         </div>
                         {/* Main */}
                         <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
                             {/* Header */}
                             <div className="flex justify-between items-center">
                                 <div className="space-y-2">
                                     <div className="h-8 w-64 bg-white/10 rounded-lg" />
                                     <div className="h-4 w-96 bg-white/5 rounded-lg" />
                                 </div>
                                 <div className="flex gap-2">
                                     <div className="h-8 w-24 bg-[#00FFB2]/20 rounded-lg border border-[#00FFB2]/30" />
                                     <div className="h-8 w-8 bg-white/10 rounded-lg" />
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


const FeatureCard = ({ title, desc, icon: Icon, delay = 0 }: { title: string, desc: string, icon: React.ElementType, delay?: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#00FFB2]/30 hover:bg-white/[0.04] transition-all duration-300"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFB2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-3xl" />
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-zinc-400 group-hover:text-[#00FFB2] transition-colors" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm font-light">{desc}</p>
        </div>
    </motion.div>
);

const BentoGrid = () => {
    return (
        <section id="features" className="py-32 px-6 bg-[#050505] relative z-20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-medium text-white mb-6">Tout ce dont vous avez besoin.</h2>
                    <p className="text-zinc-400 font-light">
                        Nous avons déconstruit le chaos du travail moderne pour en faire un système fluide et intégré.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <div className="md:col-span-2 relative h-[400px] rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                         <img src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=2670&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" alt="Feature" />
                         <div className="absolute bottom-0 left-0 p-10 z-20 max-w-lg">
                             <div className="text-[#00FFB2] font-mono text-xs mb-2">INTELLIGENCE</div>
                             <h3 className="text-3xl font-medium text-white mb-2">Automatisations Natives</h3>
                             <p className="text-zinc-400 font-light">Créez des workflows complexes sans une seule ligne de code. Si X alors Y, instantanément.</p>
                         </div>
                    </div>

                    {/* Tall Card */}
                    <div className="md:row-span-2 rounded-3xl bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center text-center group hover:border-[#00FFB2]/20 transition-colors">
                        <div className="w-full h-48 bg-gradient-to-tr from-[#00FFB2]/20 to-purple-500/20 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-grid-white/[0.05]" />
                             <Cpu className="w-16 h-16 text-white relative z-10" />
                        </div>
                        <h3 className="text-2xl font-medium text-white mb-4">Moteur Rapide</h3>
                        <p className="text-zinc-500 font-light text-sm">Construit sur une architecture Rust pour une latence proche de zéro. Vos clics sont instantanés.</p>
                    </div>

                    {/* Small Cards */}
                    <FeatureCard 
                        title="Temps Réel" 
                        desc="Collaboration multijoueur sur tous les documents et tâches." 
                        icon={Users}
                        delay={0.1}
                    />
                    <FeatureCard 
                        title="Sécurité Bank-Grade" 
                        desc="Chiffrement AES-256 et conformité SOC2 Type II." 
                        icon={Shield}
                        delay={0.2}
                    />
                </div>
            </div>
        </section>
    );
};

const Pricing = () => {
    return (
        <section id="pricing" className="py-32 px-6 bg-[#050505] relative border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-medium text-white mb-4">Plans Flexibles</h2>
                    <p className="text-zinc-400">Commencez petit, grandissez vite.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Basic */}
                    <div className="p-10 rounded-3xl border border-white/5 bg-transparent hover:bg-white/[0.02] transition-colors">
                        <h3 className="text-xl font-medium text-white mb-2">Starter</h3>
                        <div className="text-4xl font-medium text-white mb-6">$0<span className="text-zinc-500 text-lg">/mo</span></div>
                        <p className="text-zinc-400 text-sm mb-8">Pour les individus et side-projects.</p>
                        <button className="w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium">Commencer</button>
                        <div className="mt-8 space-y-4">
                            {['Projets illimités', '100MB Stockage', 'Support communautaire'].map(f => (
                                <div key={f} className="flex items-center gap-3 text-zinc-500 text-sm"><CheckCircle2 className="w-4 h-4 text-zinc-600"/> {f}</div>
                            ))}
                        </div>
                    </div>

                    {/* Pro */}
                    <div className="relative p-10 rounded-3xl border border-[#00FFB2]/20 bg-white/[0.02] shadow-[0_0_50px_rgba(0,255,178,0.05)] transform md:-translate-y-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#00FFB2] text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Populaire</div>
                        <h3 className="text-xl font-medium text-white mb-2">Pro</h3>
                        <div className="text-4xl font-medium text-white mb-6">$12<span className="text-zinc-500 text-lg">/mo</span></div>
                        <p className="text-zinc-400 text-sm mb-8">Pour les équipes en croissance.</p>
                        <button className="w-full py-3 rounded-xl bg-[#00FFB2] text-black hover:bg-[#00e6a0] transition-colors text-sm font-bold">Essayer Pro</button>
                        <div className="mt-8 space-y-4">
                            {['Tout du plan Starter', 'Stockage Illimité', 'Analytiques Avancées', 'Support Prioritaire'].map(f => (
                                <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-4 h-4 text-[#00FFB2]"/> {f}</div>
                            ))}
                        </div>
                    </div>

                    {/* Enterprise */}
                    <div className="p-10 rounded-3xl border border-white/5 bg-transparent hover:bg-white/[0.02] transition-colors">
                        <h3 className="text-xl font-medium text-white mb-2">Enterprise</h3>
                        <div className="text-4xl font-medium text-white mb-6">Custom</div>
                        <p className="text-zinc-400 text-sm mb-8">Sécurité et contrôle total.</p>
                        <button className="w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium">Contacter</button>
                        <div className="mt-8 space-y-4">
                            {['SSO SAML', 'Audit Logs', 'Manager Dédié', 'SLA 99.99%'].map(f => (
                                <div key={f} className="flex items-center gap-3 text-zinc-500 text-sm"><CheckCircle2 className="w-4 h-4 text-zinc-600"/> {f}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="py-20 px-6 border-t border-white/5 bg-[#050505] text-zinc-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">M</span>
                    </div>
                    <span className="text-white font-bold">MONEY IS BACK</span>
                </div>
                <p className="max-w-xs">Le futur du travail est ici. Rejoignez le mouvement.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                    <h4 className="text-white font-medium mb-4">Produit</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-[#00FFB2]">Features</a></li>
                        <li><a href="#" className="hover:text-[#00FFB2]">Changelog</a></li>
                        <li><a href="#" className="hover:text-[#00FFB2]">Docs</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-medium mb-4">Société</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-[#00FFB2]">À propos</a></li>
                        <li><a href="#" className="hover:text-[#00FFB2]">Carrières</a></li>
                        <li><a href="#" className="hover:text-[#00FFB2]">Légal</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
);

export default function HomePage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
        <Navbar />
        <Hero />
        <ReplaceAllSection />
        <BentoGrid />
        <Pricing />
        <Footer />
    </main>
  );
}
