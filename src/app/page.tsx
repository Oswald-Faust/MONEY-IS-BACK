'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Users, 
  FolderKanban,
  ListChecks,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  {
    icon: FolderKanban,
    title: 'Gestion de projets',
    description: 'Organisez et suivez tous vos projets collaboratifs en un seul endroit',
  },
  {
    icon: ListChecks,
    title: 'Todo-lists d\'équipe',
    description: 'Créez et assignez des tâches à vos collaborateurs en temps réel',
  },
  {
    icon: Users,
    title: 'Collaboration fluide',
    description: 'Travaillez ensemble efficacement avec vos équipes',
  },
  {
    icon: MessageSquare,
    title: 'Communication intégrée',
    description: 'Discutez et partagez directement dans vos projets',
  },
  {
    icon: Calendar,
    title: 'Calendrier unifié',
    description: 'Visualisez toutes vos échéances et événements d\'équipe',
  },
  {
    icon: TrendingUp,
    title: 'Suivi de progression',
    description: 'Analysez les performances et l\'avancement de vos projets',
  },
];

const benefits = [
  {
    title: 'Centralisez vos opérations',
    description: 'Toutes vos équipes, tous vos projets, une seule plateforme. Fini les outils éparpillés.',
    icon: FolderKanban,
  },
  {
    title: 'Boostez la productivité',
    description: 'Automatisez les tâches répétitives et concentrez-vous sur ce qui compte vraiment.',
    icon: Zap,
  },
  {
    title: 'Sécurité entreprise',
    description: 'Vos données sont chiffrées et protégées avec des standards de sécurité maximaux.',
    icon: Shield,
  },
];

const steps = [
  {
    step: '01',
    title: 'Créez votre espace',
    description: 'Configurez votre workspace en quelques secondes et invitez vos collaborateurs.',
  },
  {
    step: '02',
    title: 'Organisez vos projets',
    description: 'Structurez vos projets, créez des todo-lists et assignez les tâches à vos équipes.',
  },
  {
    step: '03',
    title: 'Collaborez en temps réel',
    description: 'Travaillez ensemble, suivez la progression et atteignez vos objectifs plus rapidement.',
  },
];

const testimonials = [
  {
    name: 'Marie Dubois',
    role: 'CEO, FINEA',
    content: 'MONEY IS BACK a transformé notre façon de travailler. Nos équipes sont 3x plus productives.',
    rating: 5,
  },
  {
    name: 'Thomas Martin',
    role: 'CTO, BUISPACE',
    content: 'La meilleure solution de gestion collaborative que nous ayons testée. Interface magnifique.',
    rating: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Responsable Projet, AFFI',
    content: 'Enfin une plateforme qui centralise tout ! Nos projets n\'ont jamais été aussi bien organisés.',
    rating: 5,
  },
];

const stats = [
  { value: '10K+', label: 'Utilisateurs actifs' },
  { value: '50K+', label: 'Projets créés' },
  { value: '99.9%', label: 'Disponibilité' },
  { value: '4.9/5', label: 'Satisfaction client' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only render auth-dependent UI after client-side hydration
  // This prevents hydration mismatch between server and client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] -translate-x-1/2" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-5 border-b border-glass-border backdrop-blur-xl bg-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold">MB</span>
            </div>
            <span className="text-main font-semibold text-lg">MONEY IS BACK</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isMounted ? (
              // Show default state during SSR to prevent hydration mismatch
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-dim hover:text-main transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Commencer gratuitement
                </Link>
              </>
            ) : isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <Clock className="w-4 h-4" />
              Rejoignez +10 000 équipes qui collaborent sur MONEY IS BACK
            </span>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-main mb-6 leading-tight">
              La plateforme qui transforme
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                votre façon de collaborer
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-dim max-w-3xl mx-auto mb-12 leading-relaxed">
              Gérez vos projets, organisez vos todo-lists d&apos;équipe et collaborez 
              en temps réel. Une solution tout-en-un pour booster la productivité de vos équipes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 shadow-2xl shadow-indigo-500/30 transition-all duration-200"
                >
                  Démarrer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-glass-bg border border-glass-border text-main font-medium text-lg hover:bg-glass-hover transition-all duration-200"
              >
                Voir une démo
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Aucune carte bancaire requise</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Installation en 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Support 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16 border-y border-glass-border bg-glass-bg/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-main mb-4">
              Tout ce dont votre équipe a besoin
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Des fonctionnalités puissantes pour gérer vos projets, vos tâches et votre équipe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-card p-8 group hover:border-indigo-500/30 transition-all duration-300 hover:scale-102"
              >
                <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-main mb-3">{feature.title}</h3>
                <p className="text-dim leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-24 bg-glass-bg/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-main mb-4">
              Pourquoi choisir MONEY IS BACK ?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une plateforme pensée pour maximiser l&apos;efficacité de vos équipes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="glass-card p-8 h-full">
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-main mb-4">{benefit.title}</h3>
                  <p className="text-dim text-lg leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-main mb-4">
              Commencez en 3 étapes simples
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Lancez votre espace collaboratif en quelques minutes
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="glass-card p-8 md:p-10 flex flex-col md:flex-row items-start gap-6 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/30">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-main mb-3">{step.title}</h3>
                  <p className="text-dim text-lg leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-24 bg-glass-bg/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-main mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Des milliers d&apos;équipes nous font confiance au quotidien
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-dim text-lg mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="border-t border-glass-border pt-4">
                  <p className="text-main font-semibold">{testimonial.name}</p>
                  <p className="text-dim text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-main mb-6">
                Prêt à transformer votre collaboration ?
              </h2>
              <p className="text-xl text-dim mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers d&apos;équipes qui ont déjà optimisé leur gestion de projets avec MONEY IS BACK
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-purple-500 shadow-2xl shadow-indigo-500/40 transition-all duration-200"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
              <p className="text-gray-500 text-sm mt-6">Aucune carte bancaire requise • Installation en 2 minutes</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-glass-border py-12 px-6 bg-primary/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">MB</span>
              </div>
              <span className="text-main font-semibold">MONEY IS BACK</span>
            </div>
            
            <div className="flex items-center gap-8 text-dim">
              <a href="#" className="hover:text-main transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-main transition-colors">Conditions</a>
              <a href="#" className="hover:text-main transition-colors">Contact</a>
              <a href="#" className="hover:text-main transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-glass-border text-center">
            <p className="text-dim text-sm">
              © 2026 MONEY IS BACK. Tous droits réservés. Fait avec ❤️ pour les équipes qui veulent performer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
