'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Globe,
  Coffee,
  Heart
} from 'lucide-react';
import Image from 'next/image';

const jobs = [
  {
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Paris / Remote",
    type: "Full-time"
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Paris",
    type: "Full-time"
  },
  {
    title: "Growth Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time"
  }
];

const perks = [
  { icon: Globe, title: "Remote Friendly", desc: "Travaillez d'où vous voulez, quand vous voulez." },
  { icon: TrendingUp, title: "BSPCE", desc: "Participez au succès financier de l'entreprise." },
  { icon: Coffee, title: "Équipement Premium", desc: "Le meilleur hardware pour donner le meilleur de vous-même." },
  { icon: Heart, title: "Bien-être", desc: "Assurance santé premium et forfaits sport." }
];

export default function CareersPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
           <Image 
             src="/careers_hero_rocket_v2.png" 
             fill 
             className="object-contain object-right-top" 
             alt="Rocket Growth" 
           />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00FFB2]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FFB2]/20 bg-[#00FFB2]/5 text-[#00FFB2] text-xs font-mono mb-8"
          >
            CARRIÈRES
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-medium tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
          >
            Inventons le <br/> futur ensemble.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12 font-light"
          >
            Nous recrutons des esprits curieux et des bâtisseurs passionnés pour transformer la manière dont le monde travaille.
          </motion.p>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-24 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <perk.icon className="w-6 h-6 text-[#00FFB2]" />
                </div>
                <h3 className="text-xl font-medium">{perk.title}</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-medium mb-16 text-center">Postes Ouverts</h2>
          
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 10 }}
                viewport={{ once: true }}
                className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#00FFB2]/30 hover:bg-[#00FFB2]/5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <h3 className="text-2xl font-medium mb-2 group-hover:text-[#00FFB2] transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.department}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.type}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#00FFB2] group-hover:border-transparent transition-all">
                  <ArrowRight className="w-5 h-5 group-hover:text-black" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-12 rounded-[48px] bg-zinc-900/50 border border-white/5 text-center">
             <h3 className="text-2xl font-medium mb-4">Candidature Spontanée</h3>
             <p className="text-zinc-500 mb-8 max-w-lg mx-auto">Vous ne trouvez pas le poste qui vous correspond mais vous pensez pouvoir nous aider ? N'hésitez pas à nous écrire.</p>
             <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all font-medium">
                NOUS ÉCRIRE
             </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
