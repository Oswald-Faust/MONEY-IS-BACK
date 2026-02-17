'use client';

import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { 
  Code2, 
  Braces,
  Copy,
  ChevronRight,
  ExternalLink,
  Webhook,
  Zap,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const endpoints = [
  { method: "GET", path: "/v1/workspaces", desc: "Liste tous vos espaces de travail." },
  { method: "POST", path: "/v1/projects", desc: "Créer un nouveau projet dans un espace." },
  { method: "GET", path: "/v1/tasks/{id}", desc: "Récupérer les détails d'une tâche." },
  { method: "PATCH", path: "/v1/users/me", desc: "Mettre à jour votre profil utilisateur." }
];

export default function ApiPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('curl -X GET "https://api.moneyisback.com/v1/user" -H "Authorization: Bearer YOUR_API_KEY"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#00FFB2] selection:text-black">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00FFB2]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-[#00FFB2] tracking-widest mb-8"
              >
                <Code2 className="w-3 h-3" /> API DE RÉFÉRENCE
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-medium tracking-tight mb-8"
              >
                Intégrez tout, <br/>
                <span className="text-zinc-500">automatisez tout.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-zinc-400 mb-12 font-light leading-relaxed"
              >
                Une API REST puissante, documentée et conçue pour les développeurs. Connectez vos outils et créez vos propres workflows.
              </motion.p>
              
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-[#00FFB2] text-black rounded-full font-bold hover:shadow-[0_0_40px_rgba(0,255,178,0.3)] transition-all">
                  OBTENIR MA CLÉ API
                </button>
                <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                  EXPLORER NOTRE SDK <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00FFB2]/20 to-indigo-500/20 blur-3xl opacity-50" />
              <div className="relative rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-xs font-mono text-zinc-500">terminal — zsh</div>
                </div>
                <div className="p-8 font-mono text-sm">
                  <div className="flex gap-4 mb-4">
                    <span className="text-[#00FFB2]">$</span>
                    <span className="text-zinc-300">curl -X GET &quot;https://api.moneyisback.com/v1/user&quot; \</span>
                  </div>
                  <div className="pl-6 text-zinc-300 mb-8">
                    -H &quot;Authorization: Bearer YOUR_API_KEY&quot;
                  </div>
                  <div className="text-zinc-500 mb-2">{/* Response 200 OK */}</div>
                  <div className="text-[#00FFB2]">
                    {`{`} <br/>
                    &nbsp;&nbsp;{`&quot;id&quot;: &quot;usr_9421&quot;,`} <br/>
                    &nbsp;&nbsp;{`&quot;name&quot;: &quot;Oswald Faust&quot;,`} <br/>
                    &nbsp;&nbsp;{`&quot;role&quot;: &quot;admin&quot;,`} <br/>
                    &nbsp;&nbsp;{`&quot;status&quot;: &quot;online&quot;`} <br/>
                    {`}`}
                  </div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#00FFB2]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Sections */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Braces, title: "Auth & Sécurité", desc: "Authentification via OAuth2 ou clés API Bearer." },
              { icon: Webhook, title: "Webhooks", desc: "Recevez des notifications en temps réel lors d'événements." },
              { icon: Zap, title: "Rate Limiting", desc: "Des limites généreuses pour les applications intensives." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <feature.icon className="w-8 h-8 text-[#00FFB2] mb-6" />
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints Table */}
      <section className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-medium mb-12">Endpoints Populaires</h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <div key={i} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-[#00FFB2]/30 transition-all">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono ${
                    ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 
                    ep.method === 'POST' ? 'bg-[#00FFB2]/10 text-[#00FFB2]' : 
                    'bg-orange-500/10 text-orange-400'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-zinc-300 font-mono text-sm">{ep.path}</code>
                </div>
                <div className="text-zinc-500 text-sm font-light flex items-center gap-4">
                  {ep.desc}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center text-zinc-500 text-sm">
            Voir la <Link href="#" className="text-white hover:text-[#00FFB2] underline decoration-zinc-800">documentation complète</Link> pour plus de détails.
          </div>
        </div>
      </section>

      {/* Community / SDKs */}
      <section className="py-32 px-6 bg-[#00FFB2]/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-12">Développez dans votre langage favori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 grayscale opacity-50">
             {['Node.js', 'Python', 'Go', 'PHP', 'Ruby', 'Java'].map((lang, i) => (
               <div key={i} className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="font-mono text-xs">{lang}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
