'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  ArrowRight,
  Github
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const stats = [
  { label: "Membres actifs", value: "50k+" },
  { label: "Pays représentés", value: "120+" },
  { label: "Apps créées", value: "15k+" },
  { label: "Events par mois", value: "12" }
];

const socialPlatforms = [
  {
    name: "Discord",
    icon: MessageCircle,
    color: "bg-[#5865F2]",
    description: "Discutez en temps réel avec des milliers de bâtisseurs.",
    members: "25,432 membres"
  },
  {
    name: "Forum Officiel",
    icon: Users,
    color: "bg-[#00FFB2]",
    textColor: "text-black",
    description: "Partagez vos astuces, demandez de l'aide et votez pour les features.",
    members: "12,180 inscrits"
  },
  {
    name: "Événements",
    icon: Calendar,
    color: "bg-indigo-600",
    description: "Rejoignez nos meetups, webinaires et hackathons mensuels.",
    members: "À venir : Hackathon Build'26"
  }
];

export default function CommunityPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest mb-8"
          >
            COMMUNAUTÉ
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-medium tracking-tight mb-8"
          >
            Plus qu&apos;un outil, <br/>
            <span className="text-zinc-500">un mouvement.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Rejoignez une communauté mondiale de visionnaires, de développeurs et d&apos;entrepreneurs qui redéfinissent le futur du travail.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-12 mt-20">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-mono text-[#00FFB2] tracking-wider uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Cards */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {socialPlatforms.map((platform, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl ${platform.color} flex items-center justify-center mb-8 shadow-lg`}>
                  <platform.icon className={`w-7 h-7 ${platform.textColor || 'text-white'}`} />
                </div>
                <h3 className="text-2xl font-medium mb-4">{platform.name}</h3>
                <p className="text-zinc-500 font-light mb-8 leading-relaxed">
                  {platform.description}
                </p>
                <div className="text-[#00FFB2] text-sm font-mono mb-8 opacity-70">
                  {platform.members}
                </div>
                <Link 
                  href="#" 
                  className="inline-flex items-center gap-2 text-white font-medium group/btn"
                >
                  REJOINDRE MAINTENANT
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contributors Wall */}
      <section className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-medium mb-8">Les Ambassadeurs</h2>
              <p className="text-xl text-zinc-400 font-light mb-12 leading-relaxed">
                Nos ambassadeurs contribuent activement à l&apos;écosystème en créant des plugins, des templates et en aidant les nouveaux utilisateurs.
              </p>
              <div className="space-y-6">
                {[
                  { name: "Sarah @DesignLoop", role: "Interface Designer", avatar: "S" },
                  { name: "Alex @CodeFlow", role: "Fullstack Dev", avatar: "A" },
                  { name: "Julia @ProductFirst", role: "Product Manager", avatar: "J" }
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFB2] to-indigo-500 flex items-center justify-center font-bold text-black">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-zinc-500">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full" />
              <div className="relative grid grid-cols-2 gap-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`aspect-square rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 border border-white/10 ${i % 2 === 0 ? 'mt-8' : ''} relative`}>
                    <Image 
                      src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=600`}
                      alt="Community Member"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-medium mb-8">Prêt à construire avec nous ?</h2>
            <p className="text-xl text-zinc-400 mb-12 font-light">
                Rejoignez notre Github pour contribuer au projet ou notre Discord pour poser vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
                <Github className="w-5 h-5" />
                CONTRIBUER SUR GITHUB
              </button>
              <button className="flex items-center justify-center gap-3 px-10 py-5 bg-[#5865F2] text-white rounded-full font-bold hover:shadow-[0_0_40px_rgba(88,101,242,0.3)] transition-all">
                <MessageCircle className="w-5 h-5" />
                REJOINDRE DISCORD
              </button>
            </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
