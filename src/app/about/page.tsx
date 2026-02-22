'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Users, 
  Target, 
  Shield, 
  Zap, 
  Globe, 
  Heart 
} from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Target,
    title: "Notre Mission",
    desc: "Simplifier la complexité du travail moderne en centralisant tout ce qui compte au même endroit.",
    color: "text-[#00FFB2]"
  },
  {
    icon: Shield,
    title: "Confidentialité",
    desc: "La sécurité de vos données est notre priorité absolue. Nous utilisons des protocoles de chiffrement de pointe.",
    color: "text-blue-400"
  },
  {
    icon: Zap,
    title: "Vitesse",
    desc: "Une interface ultra-rapide conçue pour l'efficacité. Pas de temps de chargement, pas de friction.",
    color: "text-orange-400"
  }
];

export default function AboutPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest mb-8"
          >
            NOTRE HISTOIRE
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-medium tracking-tight mb-8"
          >
            Bâtir l'avenir du <br/> 
            <span className="text-zinc-500">travail collaboratif.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Nous avons créé Edwin pour résoudre un problème simple : la fragmentation des outils. 
            Une seule plateforme, une source unique de vérité.
          </motion.p>
        </div>

        {/* Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-12 rounded-[40px] overflow-hidden border border-white/5 aspect-[21/9] relative"
        >
          <Image 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" 
            fill 
            className="object-cover grayscale" 
            alt="Office" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <f.icon className={`w-10 h-10 mb-6 ${f.color}`} />
                <h3 className="text-2xl font-medium mb-4">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-medium mb-8">Nos Valeurs</h2>
              <div className="space-y-8">
                {[
                  { title: "Transparence totale", text: "Nous croyons en une communication ouverte, tant en interne qu'avec nos utilisateurs." },
                  { title: "Innovation continue", text: "Nous ne nous reposons jamais sur nos lauriers. On itère, on s'améliore, on innove." },
                  { title: "Design d'abord", text: "L'esthétique et l'utilisabilité sont au cœur de chaque pixel que nous créons." }
                ].map((v, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex shrink-0 items-center justify-center">
                      <Heart className="w-6 h-6 text-[#00FFB2]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-2">{v.title}</h4>
                      <p className="text-zinc-500 font-light">{v.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/5">
              <Image 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                fill 
                className="object-cover" 
                alt="Team" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-32 px-6 bg-gradient-to-b from-[#050505] to-indigo-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-medium mb-8">Rejoignez l'aventure</h2>
          <p className="text-xl text-zinc-400 mb-12 font-light">
            Nous sommes toujours à la recherche de talents passionnés pour rejoindre notre équipe.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#00FFB2] text-black rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(0,255,178,0.3)] transition-all"
          >
            VOIR LES POSTES OUVERTS
          </motion.button>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
