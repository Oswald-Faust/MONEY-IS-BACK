'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Search, 
  Zap, 
  Shield, 
  Users, 
  ChevronRight,
  Code,
  Layout,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: "Mise en route",
    icon: Zap,
    description: "Tout ce dont vous avez besoin pour démarrer rapidement avec Edwin.",
    links: ["Installation", "Configuration initiale", "Guide de démarrage rapide", "Concepts clés"]
  },
  {
    title: "Gestion de Projets",
    icon: Layout,
    description: "Apprenez à structurer vos projets, tâches et workflows efficacement.",
    links: ["Tableaux Kanban", "Diagrammes de Gantt", "Automatisation", "Modèles de projet"]
  },
  {
    title: "Collaboration",
    icon: Users,
    description: "Gérez vos équipes, les permissions et la communication en temps réel.",
    links: ["Rôles et permissions", "Commentaires et mentions", "Inviter des membres", "Partage de fichiers"]
  },
  {
    title: "Sécurité & Données",
    icon: Shield,
    description: "Comment nous protégeons vos données et gérons la conformité.",
    links: ["Chiffrement", "Authentification 2FA", "Sauvegardes", "RGPD & Confidentialité"]
  },
  {
    title: "API & Intégrations",
    icon: Code,
    description: "Étendez la plateforme avec nos API et connectez vos outils favoris.",
    links: ["Documentation API", "Webhooks", "SDKs", "Marketplace d'apps"]
  },
  {
    title: "Support & Aide",
    icon: MessageSquare,
    description: "Trouvez des réponses à vos questions techniques ou d'utilisation.",
    links: ["FAQ", "Contact support", "Base de connaissances", "Webinaires"]
  }
];

export default function DocsPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-[#00FFB2]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest mb-8"
          >
            DOCUMENTATION
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-medium tracking-tight mb-8"
          >
            Centre de <span className="text-zinc-500">Connaissances.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Tout ce que vous devez savoir pour maîtriser Edwin et booster votre productivité.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher un guide, un composant, une API..." 
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-[#00FFB2]/50 transition-colors placeholder:text-zinc-600"
            />
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#00FFB2]/30 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <category.icon className="w-7 h-7 text-[#00FFB2]" />
                </div>
                <h3 className="text-2xl font-medium mb-4">{category.title}</h3>
                <p className="text-zinc-500 font-light mb-8 group-hover:text-zinc-400 transition-colors">
                  {category.description}
                </p>
                <ul className="space-y-4">
                  {category.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        href="#" 
                        className="flex items-center text-sm text-zinc-400 hover:text-[#00FFB2] transition-colors group/link"
                      >
                        <ChevronRight className="w-4 h-4 mr-2 text-zinc-600 group-hover/link:translate-x-1 transition-transform" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-medium mb-4">Articles Populaires</h2>
              <p className="text-zinc-500 font-light">Les guides les plus consultés par nos utilisateurs.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Comment configurer les webhooks",
              "Guide complet sur le chiffrement de bout en bout",
              "Migration depuis Notion ou ClickUp",
              "Optimiser les workflows d'automatisation"
            ].map((article, i) => (
              <Link 
                key={i} 
                href="#"
                className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#00FFB2]" />
                  <span className="text-zinc-300 group-hover:text-white transition-colors">{article}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#00FFB2] transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-[40px] bg-gradient-to-br from-[#00FFB2]/20 to-indigo-500/20 border border-white/10 overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[#050505]/40 backdrop-blur-3xl -z-10" />
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Vous ne trouvez pas ce que vous cherchez ?</h2>
            <p className="text-lg text-zinc-400 mb-10 font-light">Notre équipe de support est disponible 24/7 pour vous aider.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-[#00FFB2] text-black rounded-full font-bold hover:shadow-[0_0_40px_rgba(0,255,178,0.3)] transition-all">
                CONTACTER LE SUPPORT
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all">
                POSER UNE QUESTION À LA COMMUNAUTÉ
              </button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
