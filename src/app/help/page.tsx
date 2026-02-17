'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  PlayCircle,
  FileText,
  LifeBuoy,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const helpTopics = [
  {
    icon: PlayCircle,
    title: "Tutoriels Vidéo",
    desc: "Apprenez visuellement avec nos guides étape par étape.",
    link: "Voir les vidéos"
  },
  {
    icon: FileText,
    title: "Guides d'utilisation",
    desc: "Documentation détaillée sur chaque fonctionnalité.",
    link: "Lire les guides"
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & Facturation",
    desc: "Gérez votre abonnement et vos paramètres de sécurité.",
    link: "Gérer mon compte"
  }
];

const faqs = [
  {
    q: "Comment puis-je inviter mon équipe ?",
    a: "Vous pouvez inviter des membres depuis les paramètres de votre espace de travail en saisissant leur adresse e-mail."
  },
  {
    q: "Quels sont les modes de paiement acceptés ?",
    a: "Nous acceptons toutes les cartes de crédit majeures, PayPal et les virements bancaires pour les forfaits Entreprise."
  },
  {
    q: "Mes données sont-elles sauvegardées ?",
    a: "Oui, nous effectuons des sauvegardes automatiques toutes les 6 heures avec une redondance multi-régions."
  },
  {
    q: "Puis-je exporter mes projets ?",
    a: "Absolument. Vous pouvez exporter vos données au format JSON, CSV ou PDF à tout moment."
  }
];

export default function HelpPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest mb-8"
            >
              <LifeBuoy className="w-3 h-3" /> HELP CENTER
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-medium tracking-tight mb-8"
            >
              Comment pouvons-nous <br/>
              <span className="text-zinc-500">vous aider ?</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-12"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Décrivez votre problème ou posez une question..." 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-[#00FFB2]/50 transition-colors placeholder:text-zinc-600"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Support Options */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {helpTopics.map((topic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:bg-[#00FFB2]/10 group-hover:border-[#00FFB2]/20 transition-all">
                  <topic.icon className="w-6 h-6 text-zinc-400 group-hover:text-[#00FFB2] transition-colors" />
                </div>
                <h3 className="text-xl font-medium mb-3">{topic.title}</h3>
                <p className="text-zinc-500 font-light mb-6 leading-relaxed">
                  {topic.desc}
                </p>
                <div className="flex items-center text-[#00FFB2] text-sm font-medium group-hover:gap-2 transition-all">
                  {topic.link} <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-medium mb-12 text-center">Foire aux questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
              >
                <h4 className="text-lg font-medium mb-4 flex items-center gap-3">
                  <span className="text-[#00FFB2]">Q:</span> {faq.q}
                </h4>
                <p className="text-zinc-500 font-light pl-7">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="#" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              Voir toutes les questions <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 flex flex-col items-center text-center">
              <MessageSquare className="w-12 h-12 text-[#00FFB2] mb-6" />
              <h3 className="text-2xl font-medium mb-4">Chat en direct</h3>
              <p className="text-zinc-500 mb-8 font-light">Discutez avec un expert en moins de 2 minutes.</p>
              <button className="w-full py-4 bg-white text-black rounded-full font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
                LANCER LE CHAT
              </button>
            </div>
            <div className="p-10 rounded-[40px] bg-gradient-to-br from-[#00FFB2]/5 to-transparent border border-white/5 flex flex-col items-center text-center">
              <Mail className="w-12 h-12 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-medium mb-4">Ticket de support</h3>
              <p className="text-zinc-500 mb-8 font-light">Envoyez-nous un e-mail détaillé pour les problèmes complexes.</p>
              <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all">
                ENVOYER UN E-MAIL
              </button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
