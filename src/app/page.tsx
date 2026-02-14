'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Plus,
  Search,
  Settings,
  Calendar,
  BarChart3,
  List,
  Kanban,
  CreditCard,
  HelpCircle,
  Globe,
  Smartphone,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// --- Mock Components for UI Visualization ---

const MockSidebar = () => (
  <div className="w-60 bg-bg-card/50 border-r border-glass-border flex flex-col p-4 gap-4 hidden md:flex h-full">
    <div className="flex items-center gap-2 px-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">MB</div>
      <div className="text-sm font-semibold text-main">Workspace</div>
    </div>
    
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm font-medium">
        <Layout className="w-4 h-4" />
        <span>Accueil</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-dim hover:text-main hover:bg-glass-hover transition-colors text-sm">
        <Bell className="w-4 h-4" />
        <span>Notifications</span>
      </div>
    </div>
  </div>
);

const MockTopBar = () => (
  <div className="h-14 border-b border-glass-border flex items-center justify-between px-6 bg-bg-card/30">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-dim text-sm">
        <span className="text-main font-medium">Marketing</span>
        <ChevronRight className="w-4 h-4" />
        <span>Campagne Q1</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
         {[1,2,3].map(i => (
           <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-card bg-gray-700 flex items-center justify-center text-[10px] text-white">
             U{i}
           </div>
         ))}
      </div>
    </div>
  </div>
);

const MockTask = ({ title, status, assignee, priority }: { title: string, status: string, assignee: string, priority: string }) => (
  <div className="flex items-center gap-4 p-3 bg-bg-card border border-glass-border rounded-xl hover:border-indigo-500/30 transition-colors cursor-pointer group">
    <div className={`w-4 h-4 rounded-full border-2 ${status === 'Done' ? 'bg-green-500 border-green-500' : 'border-gray-600 group-hover:border-indigo-500'}`} />
    <span className="text-sm text-main flex-1">{title}</span>
    <div className={`text-[10px] px-2 py-0.5 rounded ${
      priority === 'High' ? 'bg-red-500/10 text-red-500' : 
      priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 
      'bg-blue-500/10 text-blue-500'
    }`}>
      {priority}
    </div>
  </div>
);

const MockDashboard = ({ viewType = 'list' }: { viewType?: 'list' | 'board' | 'gantt' }) => (
  <div className="w-full h-full bg-bg-primary rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/20 border border-glass-border">
    <MockTopBar />
    <div className="flex-1 p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-main">Tâches actives</h3>
        <div className="flex gap-2">
            <div className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-dim'}`}><List className="w-4 h-4" /></div>
            <div className={`p-2 rounded-lg ${viewType === 'board' ? 'bg-indigo-500/20 text-indigo-400' : 'text-dim'}`}><Kanban className="w-4 h-4" /></div>
            <div className={`p-2 rounded-lg ${viewType === 'gantt' ? 'bg-indigo-500/20 text-indigo-400' : 'text-dim'}`}><Calendar className="w-4 h-4" /></div>
        </div>
      </div>
      
      {viewType === 'list' && (
        <div className="space-y-3">
            <MockTask title="Refonte de la landing page" status="In Progress" assignee="JD" priority="High" />
            <MockTask title="Intégration API Stripe" status="Todo" assignee="AL" priority="High" />
            <MockTask title="Review design system" status="Done" assignee="MS" priority="Medium" />
            <MockTask title="Optimisation SEO" status="Todo" assignee="JD" priority="Low" />
        </div>
      )}

      {viewType === 'board' && (
        <div className="flex gap-4 h-full">
            {[
                { title: 'To Do', color: 'border-gray-500' },
                { title: 'In Progress', color: 'border-blue-500' },
                { title: 'Done', color: 'border-green-500' }
            ].map(col => (
                <div key={col.title} className="flex-1 bg-bg-card/30 rounded-lg p-3 border border-glass-border flex flex-col gap-3">
                    <div className={`text-xs font-bold text-dim uppercase flex items-center gap-2 mb-2 before:content-[''] before:w-2 before:h-2 before:rounded-full before:${col.color.replace('border-', 'bg-')}`}>
                        {col.title}
                    </div>
                    {[1,2].map(i => (
                        <div key={i} className="bg-bg-card p-3 rounded-lg border border-glass-border shadow-sm text-xs">Tâche {i}</div>
                    ))}
                </div>
            ))}
        </div>
      )}

      {viewType === 'gantt' && (
          <div className="space-y-4">
              {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-4">
                      <div className="w-32 text-xs text-dim">Tâche {i}</div>
                      <div className="flex-1 bg-bg-card/30 h-8 rounded-lg relative overflow-hidden">
                          <div 
                            className="absolute top-1 bottom-1 bg-indigo-500/40 rounded border border-indigo-500/50" 
                            style={{ left: `${i * 10}%`, width: `${20 + i * 5}%` }}
                          />
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Floating Elements for "Pop" effect */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-8 bg-bg-card border border-glass-border p-4 rounded-xl shadow-xl max-w-[200px]"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-bold text-main">Projet terminé !</span>
        </div>
        <div className="text-xs text-dim">La refonte est en ligne 🚀</div>
      </motion.div>
    </div>
  </div>
);

// --- New Sections Components ---

const PricingCard = ({ 
    plan, 
    price, 
    description, 
    features, 
    recommended = false,
    cta = "Commencer gratuitement"
}: { 
    plan: string, 
    price: string, 
    description: string, 
    features: string[], 
    recommended?: boolean,
    cta?: string
}) => (
    <div className={`
        relative p-8 rounded-2xl border flex flex-col h-full transition-transform hover:-translate-y-2
        ${recommended 
            ? 'bg-gradient-to-b from-indigo-900/20 to-bg-card border-indigo-500/50 shadow-2xl shadow-indigo-500/10' 
            : 'bg-glass-card border-glass-border hover:border-glass-hover'
        }
    `}>
        {recommended && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                Recommandé
            </div>
        )}
        <h3 className="text-xl font-bold text-main mb-2">{plan}</h3>
        <div className="mb-4">
            <span className="text-4xl font-black text-white">{price}</span>
            {price !== 'Gratuit' && <span className="text-dim text-sm"> /membre/mois</span>}
        </div>
        <p className="text-dim text-sm mb-8 h-10">{description}</p>
        
        <button className={`
            w-full py-3 rounded-xl font-bold text-sm mb-8 transition-all
            ${recommended 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }
        `}>
            {cta}
        </button>

        <div className="space-y-3 flex-1">
            {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-dim">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                </div>
            ))}
        </div>
    </div>
);

const IntegrationsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-70">
        {['Slack', 'GitHub', 'GitLab', 'Discord', 'Figma', 'Notion', 'Google Drive', 'Sentry', 'Zoom', 'Intercom', 'Zendesk', 'HubSpot'].map((tool) => (
            <div key={tool} className="flex items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium text-dim">{tool}</span>
            </div>
        ))}
    </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-glass-border">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-indigo-400 transition-colors"
            >
                <span className="text-lg font-medium text-main">{question}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-dim leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Page Component ---

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [email, setEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = {
    tasks: {
      title: "Gestion de tâches",
      desc: "Des listes à faire aux projets complexes, gérez tout avec précision.",
      icon: Layout,
      content: <MockDashboard viewType="list" />
    },
    docs: {
      title: "Documents",
      desc: "Wikis, notes de réunion et docs de spécification, tout au même endroit.",
      icon: FileText,
      content: (
        <div className="w-full h-full bg-bg-primary p-8 rounded-xl border border-glass-border shadow-2xl relative overflow-hidden">
             <div className="max-w-2xl mx-auto space-y-6">
                <div className="h-8 w-3/4 bg-gray-800 rounded-lg animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-800/50 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-800/50 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-800/50 rounded animate-pulse" />
                </div>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-2">
                        <Zap className="w-4 h-4" />
                        <span>Suggestion AI</span>
                    </div>
                </div>
             </div>
        </div>
      )
    },
    chat: {
      title: "Chat",
      desc: "Remplacez Slack. Discutez directement dans le contexte de vos tâches.",
      icon: MessageSquare,
      content: <MockDashboard viewType="board" />
    },
    views: {
        title: "Vues multiples",
        desc: "Kanban, Gantt, Calendrier. Visualisez le travail à votre façon.",
        icon: Kanban,
        content: <MockDashboard viewType="gantt" />
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary selection:bg-indigo-500/30 selection:text-white font-sans text-main">
      
      {/* --- Navbar --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-glass-border py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">MB</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all">MONEY IS BACK</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-dim">
              <Link href="#features" className="hover:text-white transition-colors">Produit</Link>
              <Link href="#integrations" className="hover:text-white transition-colors">Intégrations</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Tarifs</Link>
              <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105"
                >
                  S&apos;inscrire
                </Link>
             </div>
             <button 
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
                {mobileMenuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-bg-card border-b border-glass-border overflow-hidden"
                >
                    <div className="px-6 py-4 flex flex-col gap-4">
                        <Link href="#features" className="text-dim hover:text-white">Produit</Link>
                        <Link href="#pricing" className="text-dim hover:text-white">Tarifs</Link>
                        <hr className="border-glass-border" />
                        <Link href="/login" className="text-white font-semibold">Connexion</Link>
                        <Link href="/register" className="text-indigo-400 font-bold">S&apos;inscrire pour tester</Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* --- Legend Hero Section --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 opacity-50" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wide mb-8 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
                <Kanban className="w-3 h-3" />
                V2.0 est maintenant disponible
                <ChevronRight className="w-3 h-3" />
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 leading-[1.1]"
            >
                Une seule app<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    pour tout remplacer
                </span>
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-2xl text-dim max-w-3xl mx-auto mb-10 leading-relaxed font-light"
            >
                Retrouvez vos Tâches, Docs, Chat, Objectifs, et bien plus encore sur une seule plateforme unifiée. MONEY IS BACK est <span className="text-white font-medium">l&apos;OS de votre réussite</span>.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16"
            >
                <div className="flex-1 w-full relative">
                    <input 
                        type="email" 
                        placeholder="Votre email professionnel" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 pl-5 pr-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 text-lg shadow-xl"
                    />
                </div>
                <button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all text-nowrap">
                    C&apos;est parti
                </button>
            </motion.div>
            
            <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5, duration: 1 }}
                 className="flex flex-col items-center justify-center gap-4 py-8"
            >   
                <p className="text-xs uppercase tracking-widest text-dim font-bold">Ils nous font confiance</p>
                <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder logos - replace with real SVGs if available */}
                    <div className="flex items-center gap-2 font-bold text-lg"><Globe className="w-5 h-5"/> GlobalCorp</div>
                    <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5"/> FlashInc</div>
                    <div className="flex items-center gap-2 font-bold text-lg"><Shield className="w-5 h-5"/> SecureNet</div>
                    <div className="flex items-center gap-2 font-bold text-lg"><Target className="w-5 h-5"/> AimHigh</div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* --- Marquee Section (App Replacement) --- */}
      <section id="integrations" className="py-12 border-y border-glass-border bg-bg-card/30 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 text-center mb-10">
             <h2 className="text-2xl font-bold text-main">Remplacez-les tous</h2>
             <p className="text-dim">Ne perdez plus de contexte entre vos outils.</p>
         </div>
         <div className="relative flex overflow-x-hidden group">
            <motion.div 
                animate={{ x: "-50%" }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="flex gap-12 whitespace-nowrap py-4 px-6 group-hover:[animation-play-state:paused]"
            >
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-12 text-2xl font-bold text-dim items-center">
                        <span className="flex items-center gap-2"><Layout className="w-6 h-6"/> Trello</span>
                        <span className="flex items-center gap-2"><List className="w-6 h-6"/> Asana</span>
                        <span className="flex items-center gap-2"><Calendar className="w-6 h-6"/> Monday</span>
                        <span className="flex items-center gap-2"><FileText className="w-6 h-6"/> Notion</span>
                        <span className="flex items-center gap-2"><MessageSquare className="w-6 h-6"/> Slack</span>
                        <span className="flex items-center gap-2"><BarChart3 className="w-6 h-6"/> Jira</span>
                         <span className="flex items-center gap-2"><Layout className="w-6 h-6"/> Trello</span>
                        <span className="flex items-center gap-2"><List className="w-6 h-6"/> Asana</span>
                        <span className="flex items-center gap-2"><Calendar className="w-6 h-6"/> Monday</span>
                        <span className="flex items-center gap-2"><FileText className="w-6 h-6"/> Notion</span>
                        <span className="flex items-center gap-2"><MessageSquare className="w-6 h-6"/> Slack</span>
                        <span className="flex items-center gap-2"><BarChart3 className="w-6 h-6"/> Jira</span>
                    </div>
                ))}
            </motion.div>
         </div>
      </section>

      {/* --- Feature Tabs (Core Product) --- */}
      <section id="features" className="py-24 px-6 relative z-10">
         <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-bold mb-4">Tout votre travail en un seul endroit</h2>
                 <p className="text-xl text-dim">Pourquoi payer pour 5 outils quand une seule plateforme suffit ?</p>
             </div>

             <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                 {/* Left: Navigation Tabs */}
                 <div className="w-full lg:w-1/3 space-y-4">
                     {Object.entries(features).map(([key, feature]) => {
                         const isActive = activeTab === key;
                         const Icon = feature.icon;
                         return (
                            <div 
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`
                                    group p-6 rounded-2xl cursor-pointer transition-all duration-300 border
                                    ${isActive 
                                        ? 'bg-glass-hover border-indigo-500/30 shadow-lg shadow-indigo-500/5' 
                                        : 'bg-transparent border-transparent hover:bg-glass-hover/50 hover:border-glass-border'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                        ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-bg-card border border-glass-border text-dim'}
                                    `}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-dim'}`}>
                                        {feature.title}
                                    </h3>
                                </div>
                                <p className={`text-dim leading-relaxed ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                    {feature.desc}
                                </p>
                            </div>
                         );
                     })}
                 </div>

                 {/* Right: Visual Display */}
                 <div className="w-full lg:w-2/3 h-[500px] md:h-[600px] relative">
                     <AnimatePresence mode='wait'>
                         <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                         >
                            <div className="w-full h-full rounded-2xl border border-glass-border bg-gradient-to-br from-bg-card to-bg-secondary p-4 md:p-8 shadow-2xl overflow-hidden flex items-center justify-center">
                                {(features as any)[activeTab].content}
                            </div>
                         </motion.div>
                     </AnimatePresence>
                 </div>
             </div>
         </div>
      </section>

      {/* --- Bento Grid Benefits --- */}
      <section className="py-24 px-6 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
                <div className="md:col-span-2 glass-card p-12 relative overflow-hidden group">
                     {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />
                    
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[300px]">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/30">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-3xl font-bold text-main mb-4">Automatisez 80% de votre routine</h3>
                            <p className="text-xl text-dim max-w-md">Moins de clics, plus d'impact. Laissez MONEY IS BACK gérer les tâches répétitives.</p>
                        </div>
                         <div className="mt-8 flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-mono border border-glass-border">IF Status is Done</div>
                            <div className="w-8 h-[2px] bg-gray-600" />
                            <div className="px-4 py-2 bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-mono">THEN Close Task</div>
                         </div>
                    </div>
                </div>

                <div className="md:col-span-1 glass-card p-8 flex flex-col justify-center text-center">
                    <div className="w-full h-40 bg-bg-primary rounded-xl border border-glass-border mb-6 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                        <Clock className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-main mb-2">Suivi du temps</h3>
                    <p className="text-dim text-sm">Intégré nativement. Plus besoin d'outil tiers.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section id="pricing" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Un prix simple pour tout le monde</h2>
                  <p className="text-xl text-dim">Commencez gratuitement, évoluez quand vous voulez.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PricingCard 
                    plan="Free Forever" 
                    price="Gratuit" 
                    description="Pour usage personnel et hobbies." 
                    cta="C'est parti"
                    features={['100MB Stockage', 'Tâches illimitées', 'Membres illimités', 'Auth 2FA']}
                />
                 <PricingCard 
                    plan="Unlimited" 
                    price="7€" 
                    description="Pour les petites équipes agiles." 
                    cta="Essayer gratuitement"
                    features={['Stockage illimité', 'Intégrations illimitées', 'Dashboards', 'Invités', 'Champs personnalisés']}
                />
                 <PricingCard 
                    plan="Business" 
                    price="12€" 
                    description="Pour les équipes en croissance." 
                    recommended={true}
                    cta="Essayer gratuitement"
                    features={['Tout de Unlimited', 'Google SSO', 'Equipes privées', 'Export personnalisé', 'Automatisations avancées']}
                />
                 <PricingCard 
                    plan="Enterprise" 
                    price="Sur mesure" 
                    description="Sécurité et contrôle total." 
                    cta="Contacter"
                    features={['Single Sign-On (SSO)', 'Contrat entreprise', 'Manager dédié', 'Formation sur site']}
                />
              </div>
          </div>
      </section>

      {/* --- FAQ Section --- */}
      <section id="faq" className="py-24 px-6 bg-glass-card/50">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
              <div className="space-y-4">
                  <FaqItem question="Est-ce vraiment gratuit ?" answer="Oui ! Notre plan Free Forever est réellement gratuit pour toujours. Il inclut des tâches illimitées et des membres illimités, avec une limite de stockage de 100MB." />
                  <FaqItem question="Puis-je importer mes données ?" answer="Absolument. Nous proposons un importateur universel qui fonctionne avec Trello, Asana, Monday, Jira, et bien d'autres fichiers CSV." />
                  <FaqItem question="Est-ce sécurisé ?" answer="La sécurité est notre priorité. Toutes vos données sont chiffrées en transit et au repos. Nous sommes conformes GDPR et SOC2." />
                  <FaqItem question="Puis-je changer de plan plus tard ?" answer="Bien sûr. Vous pouvez upgrader ou downgrader votre plan à tout moment depuis vos paramètres d'administration." />
              </div>
          </div>
      </section>

      {/* --- Final CTA Footer --- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
            <div className="relative glass-card p-16 md:p-24 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">
                    Prêt à reprendre le contrôle ?
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    <Link href="/register" className="px-10 py-5 rounded-2xl bg-white text-indigo-900 font-bold text-xl hover:bg-gray-100 transition-colors shadow-xl">
                        Commencer gratuitement
                    </Link>
                </div>
                <div className="mt-8 flex justify-center gap-6 text-sm text-dim relative z-10">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Pas de carte requise</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Support 24/7</span>
                </div>
            </div>
        </div>
      </section>

      {/* --- Footer Links --- */}
      <footer className="border-t border-glass-border bg-bg-secondary pt-20 pb-10 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
              <div className="col-span-2 lg:col-span-1">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">MB</div>
                    <span className="text-lg font-bold text-white">MONEY IS BACK</span>
                 </div>
                 <p className="text-dim text-sm mb-6">
                    L'alternative tout-en-un à Jira, Trello et Slack.
                 </p>
                 <div className="flex gap-4">
                     <Link href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Globe className="w-4 h-4 text-white"/></Link>
                     <Link href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Smartphone className="w-4 h-4 text-white"/></Link>
                 </div>
              </div>
              
              <div>
                  <h4 className="font-bold text-white mb-6">Produit</h4>
                  <ul className="space-y-3 text-dim text-sm">
                      <li><a href="#" className="hover:text-indigo-400">Fonctionnalités</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Intégrations</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Pour les startups</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Pour les entreprises</a></li>
                  </ul>
              </div>
               <div>
                  <h4 className="font-bold text-white mb-6">Ressources</h4>
                  <ul className="space-y-3 text-dim text-sm">
                      <li><a href="#" className="hover:text-indigo-400">Blog</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Communauté</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Centre d&apos;aide</a></li>
                      <li><a href="#" className="hover:text-indigo-400">API</a></li>
                  </ul>
              </div>
               <div>
                  <h4 className="font-bold text-white mb-6">Comparer</h4>
                  <ul className="space-y-3 text-dim text-sm">
                      <li><a href="#" className="hover:text-indigo-400">Versus Trello</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Versus Asana</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Versus Monday</a></li>
                      <li><a href="#" className="hover:text-indigo-400">Versus Jira</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-glass-border pt-8 flex flex-col md:flex-row items-center justify-between text-dim text-xs">
              <p>&copy; 2026 Money Is Back Inc. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white">Confidentialité</a>
                  <a href="#" className="hover:text-white">Conditions</a>
                  <a href="#" className="hover:text-white">Sécurité</a>
              </div>
          </div>
      </footer>

    </div>
  );
}
