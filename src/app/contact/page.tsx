'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Phone,
  Send,
  ArrowRight
} from 'lucide-react';

const contactInfo = [
  { icon: Mail, title: "Email", value: "hello@moneyisback.app", label: "Écrivez-nous" },
  { icon: MessageSquare, title: "Chat", value: "Live Agent", label: "24/7 disponible" },
  { icon: MapPin, title: "Bureau", value: "Rue de Paix, Paris", label: "Nous rendre visite" }
];

export default function ContactPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
             <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest uppercase mb-8"
                >
                  CONTACT
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl md:text-8xl font-medium tracking-tight mb-8"
                >
                  Parlons de <br/> <span className="text-zinc-500">votre projet.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-zinc-400 font-light mb-12 leading-relaxed"
                >
                  Que vous ayez une question, une proposition de partenariat ou simplement envie de dire bonjour, nous sommes à votre écoute.
                </motion.p>

                <div className="grid md:grid-cols-2 gap-8">
                   {contactInfo.map((info, i) => (
                     <motion.div
                       key={i}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.3 + i * 0.1 }}
                       className="p-6 rounded-3xl bg-white/[0.02] border border-white/5"
                     >
                       <info.icon className="w-6 h-6 text-[#00FFB2] mb-4" />
                       <p className="text-sm text-zinc-500 mb-1">{info.title}</p>
                       <p className="font-medium">{info.value}</p>
                       <p className="text-xs text-zinc-600 mt-2">{info.label}</p>
                     </motion.div>
                   ))}
                </div>
             </div>

             {/* Form */}
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="p-8 md:p-12 rounded-[48px] bg-[#0A0A0F] border border-white/10 shadow-2xl relative"
             >
                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Nom Complet</label>
                        <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#00FFB2]/50 transition-all focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Email</label>
                        <input type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#00FFB2]/50 transition-all focus:outline-none" />
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 ml-1">Sujet</label>
                     <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#00FFB2]/50 transition-all focus:outline-none appearance-none">
                       <option>Support Technique</option>
                       <option>Ventes / Tarification</option>
                       <option>Partenariat</option>
                       <option>Autre</option>
                     </select>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 ml-1">Message</label>
                     <textarea rows={5} placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#00FFB2]/50 transition-all focus:outline-none resize-none"></textarea>
                   </div>

                   <button className="w-full py-5 bg-[#00FFB2] text-black rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_rgba(0,255,178,0.3)] transition-all flex items-center justify-center gap-3">
                      ENVOYER LE MESSAGE <Send className="w-5 h-5" />
                   </button>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-950/20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div>
               <h3 className="text-2xl font-medium mb-2">Suivez notre évolution</h3>
               <p className="text-zinc-500 font-light">Rejoignez notre communauté sur les réseaux sociaux.</p>
            </div>
            <div className="flex gap-8">
               {["Twitter", "LinkedIn", "Instagram", "GitHub"].map((link, i) => (
                 <a key={i} href="#" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                    {link} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                 </a>
               ))}
            </div>
         </div>
      </section>

      <LandingFooter />
    </main>
  );
}
