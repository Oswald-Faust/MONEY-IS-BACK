'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ChevronDown,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';

// --- Types ---
type BillingInterval = 'monthly' | 'yearly';

// --- Data ---
const plans = [
    {
      name: "Gratuit",
      tagline: "Idéal pour débuter",
      price: { monthly: 0, yearly: 0 },
      originalPrice: { monthly: 0, yearly: 0 },
      cta: "Commencer gratuitement",
      ctaVariant: "dark",
      highlight: false,
      features: [
        "1 Utilisateur maximum",
        "1 Projet maximum",
        "1 Go de stockage Drive",
        "7 Tâches max par projet",
        "Routines limitées"
      ]
    },
    {
      name: "Pro",
      tagline: "Idéal pour les indépendants et petites équipes",
      price: { monthly: 9.99, yearly: 8.99 },
      originalPrice: { monthly: 15, yearly: 12 },
      cta: "Essayer Pro",
      ctaVariant: "light",
      highlight: false,
      features: [
        "3 Utilisateurs inclus",
        "€6.99/user supplémentaire",
        "3 Projets inclus",
        "€4.99/projet supplémentaire",
        "10 Go de stockage Drive",
        "Tâches & Routines illimitées"
      ]
    },
    {
      name: "Team",
      tagline: "Le choix ultime pour les équipes structurées",
      price: { monthly: 29.99, yearly: 24.99 },
      originalPrice: { monthly: 39, yearly: 29 },
      cta: "Choisir Team",
      ctaVariant: "gradient",
      highlight: true,
      features: [
        "10 Utilisateurs inclus",
        "€4.99/user supplémentaire",
        "5 Projets inclus",
        "€4.99/projet supplémentaire",
        "Stockage illimité",
        "Dashboard personnalisés",
        "Mindmaps & Timelines"
      ]
    },
    {
      name: "Enterprise",
      tagline: "Sécurité et contrôle pour les grandes organisations",
      price: { monthly: null, yearly: null },
      cta: "Contacter les ventes",
      ctaVariant: "light",
      highlight: false,
      features: [
        "Utilisateurs illimités",
        "White Label complet",
        "Logs d'Audit & Sécurité",
        "SAML SSO / Okta",
        "API illimitée",
        "Success Manager dédié"
      ]
    }
  ];

const faqs = [
    {
        question: "Can I upgrade myself or do I have to upgrade my entire Workspace?",
        answer: "Vous devez mettre à niveau l'ensemble de votre espace de travail. Avec Edwin, les forfaits sont appliqués à l'espace de travail dans son ensemble pour garantir que tout le monde ait accès aux mêmes outils de collaboration."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express, etc). For Enterprise orders meeting a minimum, we can also accept bank transfers."
    },
    {
        question: "What is your refund policy?",
        answer: "Nous offrons une garantie satisfait ou remboursé de 30 jours sur tous nos forfaits payants. Si vous n'êtes pas satisfait, contactez-nous simplement pour un remboursement complet."
    },
    {
        question: "Do you offer discounts for non-profits or students?",
        answer: "Yes! We offer special discounts for non-profit organizations, students, and educators. Please contact our sales team with proof of status to apply."
    }
];

// --- Components ---



const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-indigo-600 transition-colors group"
            >
                <span className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">{question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-600 leading-relaxed max-w-3xl">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly');
  const [employeeCount, setEmployeeCount] = useState([50]);

  const calculateSavings = (employees: number) => {
    // Arbitrary calculation based on "Edwin can save a 500 person company $282,000 per year"
    // ($282,000 / 500) = $564 per person/year approximately
    return (employees * 564).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-20">
      
      {/* 1. Header/Hero Section */}
      <section className="text-center pt-16 pb-12 px-4 max-w-7xl mx-auto relative">
         <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-white -z-10" />
         
         <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6">
            La meilleure solution,<br />
            au meilleur prix.
         </h1>
         
         <div className="flex items-center justify-center gap-2 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 fill-green-700 text-white" />
                Garantie de remboursement à 100%
            </span>
         </div>

         {/* Toggle */}
         <div className="flex flex-col items-center gap-3">
             <span className="text-indigo-500 font-bold text-sm tracking-wide">
                 Économisez jusqu&apos;à 45% avec l&apos;annuel
             </span>
             <div className="flex items-center gap-4 text-sm font-bold">
                 <span className={`${billingInterval === 'monthly' ? 'text-gray-900' : 'text-gray-500'} cursor-pointer`} onClick={() => setBillingInterval('monthly')}>Mensuel</span>
                 <Switch.Root 
                    checked={billingInterval === 'yearly'}
                    onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
                    className="w-14 h-8 bg-indigo-600 rounded-full relative shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                    <Switch.Thumb className="block w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-100 translate-x-1 data-[state=checked]:translate-x-7 will-change-transform" />
                 </Switch.Root>
                 <span className={`${billingInterval === 'yearly' ? 'text-gray-900' : 'text-gray-500'} cursor-pointer`} onClick={() => setBillingInterval('yearly')}>Annuel</span>
             </div>
         </div>
      </section>

      {/* 2. Pricing Cards Container */}
      <section className="px-4 max-w-7xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
              {plans.map((plan) => (
                  <div 
                    key={plan.name}
                    className={`
                        relative flex flex-col rounded-2xl p-6 h-full transition-all duration-300
                        ${plan.highlight 
                            ? 'bg-slate-900 text-white shadow-2xl scale-105 border-2 border-indigo-500 z-10' 
                            : 'bg-white border border-gray-200 text-gray-900 hover:shadow-xl hover:-translate-y-1'
                        }
                    `}
                  >
                      {plan.highlight && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                              Populaire
                          </div>
                      )}

                      <div className="mb-6">
                          <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                          <p className={`text-xs mb-4 ${plan.name === 'Team' ? 'text-gray-300' : 'text-gray-500'}`}>
                              {plan.tagline}
                          </p>
                          
                          <div className="flex items-baseline gap-2 h-12 overflow-visible flex-wrap">
                              {plan.price.monthly === null ? (
                                  <span className="text-2xl font-bold">Sur devis</span>
                              ) : (
                                  <>
                                      {/* Original Price (Crossed out) */}
                                      {plan.originalPrice && (
                                         <div className="text-gray-400 line-through text-lg font-medium self-center w-full">
                                             €{billingInterval === 'yearly' ? plan.originalPrice.yearly : plan.originalPrice.monthly}
                                         </div>
                                      )}

                                      <div className="flex items-baseline">
                                          {plan.price.monthly === 0 ? (
                                              <span className="text-4xl font-bold">FREE</span>
                                          ) : (
                                              <>
                                                  <span className="text-4xl font-bold flex">
                                                      €
                                                      <AnimatePresence mode="wait">
                                                          <motion.span
                                                              key={billingInterval}
                                                              initial={{ y: 20, opacity: 0 }}
                                                              animate={{ y: 0, opacity: 1 }}
                                                              exit={{ y: -20, opacity: 0 }}
                                                              transition={{ duration: 0.2, ease: "easeOut" }}
                                                              className="block"
                                                          >
                                                              {billingInterval === 'yearly' ? plan.price.yearly : plan.price.monthly}
                                                          </motion.span>
                                                      </AnimatePresence>
                                                  </span>
                                              </>
                                          )}
                                          
                                          {plan.price.monthly !== 0 && (
                                              <span className={`text-sm ml-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                                                  {(plan.name === 'Team' || plan.name === 'Pro') ? '/mois' : '/user/mois'}
                                              </span>
                                          )}
                                      </div>
                                  </>
                              )}
                          </div>
                      </div>

                      <button className={`
                          w-full py-3 rounded-lg font-bold text-sm mb-8 transition-all duration-200
                          ${plan.ctaVariant === 'dark' 
                              ? 'bg-gray-900 text-white hover:bg-black' 
                              : plan.ctaVariant === 'light'
                                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                  : 'bg-white text-indigo-600 hover:bg-gray-100' // Business/Highlight plan button
                          }
                      `}>
                          {plan.cta}
                      </button>

                      <div className="space-y-4 flex-1">
                          <p className={`text-xs font-bold uppercase tracking-wider ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                               {plan.name === 'Starter' ? 'Le plan inclut :' : `Tout dans ${plans[plans.findIndex(p => p.name === plan.name) - 1]?.name || 'le plan précédent'} +`}
                          </p>
                          <ul className="space-y-3">
                              {plan.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm">
                                      <div className={`mt-0.5 ${plan.highlight ? 'opacity-100' : 'opacity-100'}`}>
                                         {plan.highlight ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                      </div>
                                      <span className={plan.highlight ? 'text-gray-200' : 'text-gray-600'}>
                                          {feature}
                                      </span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="text-center mt-12">
              <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
                  Voir la comparaison complète des fonctionnalités <ChevronDown className="w-4 h-4" />
              </button>
          </div>
      </section>

      {/* 3. Trusted By Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by 2 million+ teams</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Globe className="w-6 h-6"/> GlobalCorp</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Zap className="w-6 h-6"/> FlashInc</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Shield className="w-6 h-6"/> SecureNet</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Target className="w-6 h-6"/> AimHigh</div>
                  <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><Smartphone className="w-6 h-6"/> TechGiant</div>
              </div>
          </div>
      </section>

      {/* 4. ROI Calculator */}
      <div className="max-w-5xl mx-auto px-4 py-24">
         <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-16 text-white text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                 <h2 className="text-3xl md:text-5xl font-black mb-4">
                     Edwin peut faire économiser à une entreprise de {employeeCount[0]} personnes<br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                         ${calculateSavings(employeeCount[0])} par an
                     </span>
                 </h2>
                 <p className="text-indigo-200 mb-12 text-lg">
                     Récupérez plus de 20% de temps pour chaque employé.
                 </p>
                 
                 <div className="max-w-xl mx-auto mb-8">
                     <p className="text-sm font-bold mb-4 uppercase tracking-wider text-indigo-300">How many people work at your company?</p>
                     <Slider.Root 
                        className="relative flex items-center select-none touch-none w-full h-5" 
                        value={employeeCount} 
                        onValueChange={setEmployeeCount}
                        max={1000} 
                        step={10}
                        min={10}
                     >
                        <Slider.Track className="bg-white/20 relative grow rounded-full h-[3px]">
                            <Slider.Range className="absolute bg-white rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-8 h-8 bg-white border-4 border-indigo-600 shadow-xl rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-transform" />
                     </Slider.Root>
                     <div className="flex justify-between text-xs font-bold text-indigo-300 mt-2">
                         <span>10 employees</span>
                         <span>1000+ employees</span>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* 5. FAQ Section */}
      <section className="py-24 px-4 max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16 text-gray-900">Questions Fréquemment Posées</h2>
          <div className="space-y-2">
              {faqs.map((faq, index) => (
                  <FaqItem key={index} question={faq.question} answer={faq.answer} />
              ))}
          </div>
      </section>

      {/* 6. Footer CTA */}
      <section className="py-24 bg-indigo-50 px-4 text-center">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-indigo-950 mb-8">
                  Une seule app pour les remplacer toutes.
              </h2>
              <p className="text-xl text-indigo-900/60 mb-10 max-w-2xl mx-auto">
                  Arrêtez de jongler entre les applications. Remettez votre équipe sur les rails avec Edwin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register" className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1">
                      Commencer gratuitement
                  </Link>
                  <Link href="/contact" className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-xl text-lg border border-indigo-100 hover:bg-indigo-50 transition-all">
                      Contacter les ventes
                  </Link>
              </div>
              <p className="mt-6 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Gratuit à vie &bull; Aucune carte de crédit requise
              </p>
          </div>
      </section>
      
    </div>
  );
}
