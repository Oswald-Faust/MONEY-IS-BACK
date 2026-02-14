'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Briefcase, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap, 
  Layout, 
  Loader2, 
  Rocket, 
  Users,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

// --- Types ---

type Step = 1 | 2 | 3 | 4;

interface OnboardingData {
  workspaceName: string;
  useCase: string;
  themeColor: string;
  icon: string;
}

// --- Components ---

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: i + 1 <= currentStep ? '#6366f1' : 'rgba(255,255,255,0.1)',
              scale: i + 1 === currentStep ? 1.1 : 1,
            }}
            className="w-2.5 h-2.5 rounded-full"
          />
          {i < totalSteps - 1 && (
            <div className={`w-8 h-0.5 ml-2 ${i + 1 < currentStep ? 'bg-indigo-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    workspaceName: '',
    useCase: 'other',
    themeColor: '#6366f1',
    icon: 'Briefcase'
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4) as Step);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as Step);

  const updateData = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!data.workspaceName.trim()) {
      toast.error('Veuillez donner un nom à votre workspace');
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.workspaceName,
          description: `Espace de travail pour ${data.useCase}`,
          useCase: data.useCase,
          theme: 'dark', // Force dark for now as requested by style guide
          icon: data.icon,
        }),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success('Workspace configuré avec succès !');
        // Add a small delay for effect
        setTimeout(() => {
          router.push('/messages'); // Direct to messages or dashboard
        }, 800);
      } else {
        toast.error(resData.error || 'Erreur lors de la création');
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error('Erreur de connexion au serveur');
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0f] text-white selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-2xl z-10">
        
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20"
          >
            <Rocket className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400 mb-2">
            Bienvenue, {user?.firstName || 'User'} !
          </h1>
          <p className="text-gray-400 max-w-md">
            Configurons votre espace de travail pour qu&apos;il soit parfait dès le départ.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card bg-[#14141d]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Progress */}
          <div className="flex justify-center mb-8">
            <StepIndicator currentStep={step} totalSteps={4} />
          </div>

          {/* Form Content */}
          <motion.div
            custom={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="min-h-[300px]"
          >
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Commençons par le nom</h2>
                  <p className="text-gray-400 text-sm">Comment souhaitez-vous appeler votre espace de travail ?</p>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Layout className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={data.workspaceName}
                    onChange={(e) => updateData('workspaceName', e.target.value)}
                    placeholder="Ex: Agence Acme, Projet X..."
                    className="w-full bg-white/5 border border-white/10 text-white text-lg rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner placeholder:text-gray-600"
                  />
                </div>
                
                <div className="flex gap-3 text-xs text-gray-500 justify-center mt-4">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500"/> Espaces illimités</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500"/> Invitez votre équipe</span>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Quel est votre usage ?</h2>
                  <p className="text-gray-400 text-sm">Nous adapterons l&apos;expérience en fonction de vos besoins.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'work', label: 'Travail', icon: Briefcase, desc: 'Gestion de projets & équipes' },
                    { id: 'school', label: 'Études', icon: GraduationCap, desc: 'Cours & emplois du temps' },
                    { id: 'personal', label: 'Personnel', icon: Zap, desc: 'Organisation quotidienne' },
                    { id: 'agency', label: 'Agence', icon: Users, desc: 'Clients & livrables' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateData('useCase', item.id)}
                      className={`
                        relative p-4 rounded-xl border text-left transition-all duration-200 group
                        ${data.useCase === item.id 
                          ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                      `}
                    >
                      <item.icon className={`w-6 h-6 mb-3 ${data.useCase === item.id ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                      <div className="font-semibold text-sm mb-1">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                      
                      {data.useCase === item.id && (
                        <motion.div layoutId="check" className="absolute top-3 right-3">
                          <div className="bg-indigo-500 rounded-full p-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Personnalisation</h2>
                  <p className="text-gray-400 text-sm">Choisissez la couleur de votre espace.</p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                   {[
                     '#6366f1', // Indigo
                     '#ec4899', // Pink
                     '#10b981', // Emerald
                     '#3b82f6', // Blue
                     '#f59e0b', // Amber
                     '#8b5cf6', // Violet
                   ].map((color) => (
                     <button
                        key={color}
                        onClick={() => updateData('themeColor', color)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${data.themeColor === color ? 'ring-4 ring-offset-2 ring-offset-[#14141d]' : 'opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40`, '--tw-ring-color': color } as React.CSSProperties}
                     >
                       {data.themeColor === color && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                     </button>
                   ))}
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} style={{ backgroundColor: data.themeColor }}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{data.workspaceName || 'Mon Workspace'}</h4>
                    <p className="text-xs text-gray-500">Aperçu de votre barre latérale</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" className="space-y-6 text-center">
                 <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <Rocket className="w-10 h-10 text-white" />
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white mb-2">Tout est prêt !</h2>
                 <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                   Votre espace de travail <strong>{data.workspaceName}</strong> a été configuré selon vos préférences.
                 </p>

                 <div className="bg-white/5 rounded-xl p-4 text-left max-w-sm mx-auto space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Nom</span>
                      <span className="font-medium">{data.workspaceName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Usage</span>
                      <span className="font-medium capitalize">{data.useCase}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Thème</span>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.themeColor }} />
                    </div>
                 </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>

          {/* User Controls */}
          <div className="flex justify-between mt-12 pt-6 border-t border-white/5">
            <button
              onClick={prevStep}
              className={`
                px-6 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${step === 1 ? 'invisible' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Retour
            </button>

            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !data.workspaceName}
                className="
                  px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm
                  hover:bg-gray-100 active:scale-95 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                Continuer
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="
                  px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 
                  text-white font-semibold text-sm shadow-lg shadow-indigo-500/25
                  hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all
                  disabled:opacity-70 disabled:cursor-wait
                  flex items-center gap-2
                "
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Lancer mon Workspace
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
