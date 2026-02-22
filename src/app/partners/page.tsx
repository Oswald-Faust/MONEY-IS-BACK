'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Handshake, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Layers,
  BarChart3
} from 'lucide-react';

const benefits = [
  {
    icon: ShieldCheck,
    title: "Eco-système Sécurisé",
    desc: "Intégrez vos solutions dans un environnement ultra-sécurisé utilisé par des milliers d'entreprises."
  },
  {
    icon: Zap,
    title: "API Puissante",
    desc: "Des endpoints RESTful bien documentés pour une intégration fluide et rapide."
  },
  {
    icon: Layers,
    title: "Co-Marketing",
    desc: "Bénéficiez de notre visibilité pour propulser votre solution auprès de notre base d'utilisateurs."
  }
];

export default function PartnersPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-10"
          >
            <Handshake className="w-10 h-10 text-[#00FFB2]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-medium tracking-tight mb-8"
          >
            Grandissons <br/> <span className="text-[#00FFB2]">ensemble.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 font-light mb-12"
          >
            Rejoignez notre programme de partenariat et créez de la valeur pour vos clients avec l'infrastructure Edwin.
          </motion.p>

          <div className="flex justify-center gap-6">
             <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-[#00FFB2] transition-colors">
               DEVENIR PARTENAIRE
             </button>
             <button className="px-8 py-4 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
               VOIR L'API
             </button>
          </div>
        </div>
      </section>

      {/* Stats/Logo Cloud Placeholder */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <p className="text-center text-zinc-500 text-sm font-mono uppercase tracking-[0.3em] mb-12">Ils nous font confiance</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 opacity-30 grayscale items-center">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="h-12 bg-white/20 rounded-lg animate-pulse" />
               ))}
            </div>
         </div>
      </section>

      {/* Benefits */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-medium mb-4">Pourquoi s'associer ?</h2>
              <p className="text-zinc-500 font-light">Une relation gagnant-gagnant basée sur l'innovation.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((b, i) => (
                <div key={i} className="group p-10 rounded-[40px] border border-white/5 bg-[#0A0A0F] hover:border-[#00FFB2]/30 transition-all">
                   <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-[#00FFB2]/10 transition-colors">
                      <b.icon className="w-7 h-7 text-[#00FFB2]" />
                   </div>
                   <h3 className="text-2xl font-medium mb-4">{b.title}</h3>
                   <p className="text-zinc-500 leading-relaxed font-light">{b.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Integration Types */}
      <section className="py-32 px-6 bg-zinc-950/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <div>
              <h2 className="text-4xl font-medium mb-8">Types de Partenariats</h2>
              <div className="space-y-6">
                 {[
                   { title: "App Partners", text: "Créez des applications qui s'intègrent directement dans le dashboard." },
                   { title: "Service Partners", text: "Proposez vos services d'onboarding et de consulting à nos clients." },
                   { title: "Strategic Partners", text: "Alliances technologiques profondes pour transformer le marché." }
                 ].map((p, i) => (
                   <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/[0.04] transition-all">
                      <div>
                        <h4 className="text-xl font-medium mb-1 group-hover:text-[#00FFB2] transition-colors">{p.title}</h4>
                        <p className="text-zinc-500 text-sm font-light">{p.text}</p>
                      </div>
                      <ArrowUpRight className="w-6 h-6 text-zinc-600 group-hover:text-[#00FFB2] transition-all" />
                   </div>
                 ))}
              </div>
           </div>
           <div className="relative aspect-square">
              <div className="absolute inset-0 bg-[#00FFB2]/5 blur-[100px] rounded-full animate-pulse" />
              <div className="relative border border-white/10 rounded-[48px] h-full flex items-center justify-center bg-[#050505]">
                 <BarChart3 className="w-48 h-48 text-[#00FFB2]/20" />
              </div>
           </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
