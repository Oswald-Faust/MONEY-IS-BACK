'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  CheckCircle2, 
  Clock, 
  Server,
  Activity
} from 'lucide-react';

const services = [
  { name: "Application Web", status: "Opérationnel", uptime: "99.98%" },
  { name: "API (REST & WebSocket)", status: "Opérationnel", uptime: "99.99%" },
  { name: "Base de données PROD", status: "Opérationnel", uptime: "100%" },
  { name: "Stockage de fichiers (S3)", status: "Opérationnel", uptime: "99.99%" },
  { name: "Réseau de bord de mer (Edge)", status: "Opérationnel", uptime: "99.97%" }
];

const incidents = [
  {
    date: "14 Février 2026",
    title: "Maintenance planifiée de la base de données",
    status: "Terminé",
    desc: "Mise à niveau réussie de l'instance principale vers v16.4. Aucun impact utilisateur détecté."
  },
  {
    date: "10 Février 2026",
    title: "Degradation des performances API",
    status: "Résolu",
    desc: "Un pic de trafic inhabituel a causé des latences sur le cluster 'Europe-1'. Capacité augmentée."
  }
];

export default function StatusPage() {
  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero / Global Status */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 rounded-[40px] bg-zinc-900/50 border border-white/10 backdrop-blur-xl text-center mb-12"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-medium mb-4">Tous les systèmes sont opérationnels</h1>
            <p className="text-zinc-500 font-light">Dernière mise à jour : il y a quelques secondes</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              { label: "Uptime 30J", value: "99.98%" },
              { label: "Temps de réponse", value: "42ms" },
              { label: "Incidents (90j)", value: "2" },
              { label: "Régions", value: "24" }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-sm font-mono text-[#00FFB2] mb-1">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" /> État des Services
            </h2>
            <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Opérationnel
                </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-4">
                    <Server className="w-5 h-5 text-zinc-600" />
                    <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-zinc-600 font-mono">Uptime: {service.uptime}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {service.status}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium mb-12 flex items-center gap-3">
            <Clock className="w-5 h-5 text-zinc-500" /> Historique des Incidents
          </h2>
          <div className="space-y-12">
            {incidents.map((incident, i) => (
              <div key={i} className="relative pl-10 border-l border-white/10 pb-12 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-zinc-600" />
                <div className="text-sm font-mono text-zinc-600 mb-2 uppercase tracking-widest">{incident.date}</div>
                <h4 className="text-xl font-medium mb-3">{incident.title}</h4>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
                  {incident.status}
                </div>
                <p className="text-zinc-500 font-light leading-relaxed">
                  {incident.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
