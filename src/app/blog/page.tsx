'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Search, 
  ArrowRight,
  ChevronRight,
  Clock,
  User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const posts = [
  {
    category: "Productivité",
    title: "Comment centraliser 10 flux de travail en un seul",
    desc: "Découvrez nos techniques secrètes pour réduire la fatigue mentale et booster votre efficacité quotidienne.",
    author: "Marc Dupont",
    date: "12 Fév 2026",
    image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=2664&auto=format&fit=crop"
  },
  {
    category: "Ingénierie",
    title: "L'avenir de l'IA dans la gestion de projet",
    desc: "L'IA ne va pas remplacer les chefs de projet, mais elle va décupler leurs capacités de décision.",
    author: "Sara Ben",
    date: "10 Fév 2026",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop"
  },
  {
    category: "Culture",
    title: "Travailler en remote sans perdre la culture d'équipe",
    desc: "Le remote n'est pas qu'une question de bureau, c'est une philosophie de confiance et de résultats.",
    author: "Alice Morel",
    date: "05 Fév 2026",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#00FFB2]/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-medium tracking-tight mb-8"
            >
              Blog & <br/> <span className="text-[#00FFB2]">Insights.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-500 font-light"
            >
              Réflexions sur le futur du travail, la technologie et la productivité.
            </motion.p>
          </div>
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[#00FFB2] transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un article..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#00FFB2]/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative rounded-[48px] overflow-hidden border border-white/5 bg-zinc-900/40"
          >
            <div className="grid lg:grid-cols-2">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFB2]/10 text-[#00FFB2] text-xs font-mono mb-6 uppercase tracking-widest">
                   Featured
                 </div>
                 <h2 className="text-4xl md:text-5xl font-medium mb-6 group-hover:text-[#00FFB2] transition-colors">
                   Le manifeste pour un travail sans distractions
                 </h2>
                 <p className="text-zinc-400 text-lg mb-10 font-light leading-relaxed">
                   Pourquoi nous croyons que l'attention est la ressource la plus précieuse du 21e siècle et comment nous avons conçu Edwin pour la protéger.
                 </p>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-zinc-800" />
                   <div>
                     <p className="font-medium">Mathias Mercier</p>
                     <p className="text-sm text-zinc-500">Founder & CEO</p>
                   </div>
                 </div>
              </div>
              <div className="relative h-[400px] lg:h-auto overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2670&auto=format&fit=crop" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Featured" 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
           <div className="flex items-center justify-between mb-16">
             <h3 className="text-3xl font-medium">Articles Récents</h3>
             <div className="flex gap-4">
               {["Tous", "Produit", "Tech", "Culture"].map((cat, i) => (
                 <button key={i} className={`px-5 py-2 rounded-full border text-sm transition-all ${i === 0 ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/30'}`}>
                   {cat}
                 </button>
               ))}
             </div>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
             {posts.map((post, i) => (
               <motion.article
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="flex flex-col group cursor-pointer"
               >
                 <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6 border border-white/5">
                    <Image 
                      src={post.image} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      alt={post.title} 
                    />
                    <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-mono">
                      {post.category}
                    </div>
                 </div>
                 <h4 className="text-2xl font-medium mb-4 group-hover:text-[#00FFB2] transition-colors leading-tight">
                   {post.title}
                 </h4>
                 <p className="text-zinc-400 font-light mb-8 line-clamp-3">
                   {post.desc}
                 </p>
                 <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                       <Clock className="w-4 h-4" />
                       <span>5 min read</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#00FFB2] text-sm font-medium">
                       Lire <ArrowRight className="w-4 h-4" />
                    </div>
                 </div>
               </motion.article>
             ))}
           </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
