'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Check, 
  ChevronRight,
  GraduationCap, 
  Layout, 
  Loader2, 
  Rocket, 
  Users,
  Zap,
  Palette,
  Image as ImageIcon,
  Plus,
  X,
  Link as LinkIcon,
  Copy,
  Upload,
  Heart,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

// --- Types ---

type Step = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  workspaceName: string;
  useCase: string;
  themeColor: string;
  icon: string;
  image?: string;
  invitedEmails: string[];
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', // Office
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80', // Gradient
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Building
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', // Abstract
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', // Team
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80', // Dark Gradient
];

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
  
  // Local state for Step 3 (Personalization mode)
  const [personalizationMode, setPersonalizationMode] = useState<'color' | 'image'>('color');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Local state for Step 4 (Invitations)
  const [emailInput, setEmailInput] = useState('');

  const [data, setData] = useState<OnboardingData>({
    workspaceName: '',
    useCase: 'other',
    themeColor: '#6366f1',
    icon: 'Briefcase',
    invitedEmails: []
  });

  const [inviteLink] = useState(() => `https://moneyisback.com/invite/ws-${Math.random().toString(36).substr(2, 6)}`);

  useEffect(() => {
     // Check if user already has workspaces (e.g. invited user)
     const checkWorkspaces = async () => {
         if (!token) return;
         try {
             const response = await fetch('/api/workspaces', {
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             const data = await response.json();
             if (data.success && data.data.length > 0) {
                 // User already has workspaces, skip onboarding
                 toast('Vous avez déjà rejoint un workspace !', { icon: '👋' });
                 router.replace('/dashboard');
             }
         } catch (e) {
             console.error('Error checking workspaces', e);
         }
     };

     checkWorkspaces();
  }, [token, router]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5) as Step);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as Step);

  const updateData = (key: keyof OnboardingData, value: string | string[] | undefined) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@') && !data.invitedEmails.includes(emailInput)) {
      updateData('invitedEmails', [...data.invitedEmails, emailInput]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    updateData('invitedEmails', data.invitedEmails.filter(e => e !== email));
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Lien copié dans le presse-papier !');
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for icon)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 5 Mo)');
      return;
    }

    setIsUploadingIcon(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload?type=workspace-icon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const resData = await response.json();
      if (resData.success) {
        updateData('image', resData.url);
        toast.success('Icône importée !');
      } else {
        toast.error(resData.error || 'Erreur lors de l\'importation');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleSubmit = async () => {
    if (!data.workspaceName.trim()) {
      toast.error('Veuillez donner un nom à votre workspace');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = urlParams.get('plan') || 'starter';
    const billingCycle = urlParams.get('billing') || 'monthly';

    try {
      console.log('Creating workspace with data:', data);
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
          theme: 'dark',
          defaultProjectColor: data.themeColor,
          image: data.image,
          icon: data.icon,
          invitedEmails: data.invitedEmails,
          subscriptionPlan: selectedPlan // Passing the selected plan
        }),
      });

      const resData = await response.json();
      console.log('Workspace creation response:', resData);

      if (resData.success) {
        toast.success('Workspace configuré avec succès !');
        
        const workspaceId = resData.data._id;
        
        // Redirect to Stripe Checkout
        try {
          console.log('Initiating checkout for workspace:', workspaceId, 'plan:', selectedPlan);
          const checkoutResponse = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              workspaceId,
              planId: selectedPlan,
              billingCycle
            })
          });

          const checkoutData = await checkoutResponse.json();
          console.log('Checkout response:', checkoutData);

          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          } else {
            console.error('No checkout URL returned:', checkoutData);
            toast.error(checkoutData.error || 'Erreur lors de la redirection vers le paiement');
          }
        } catch (checkoutError) {
          console.error('Checkout error:', checkoutError);
          toast.error('Impossible de contacter Stripe');
        }

        // Fallback if checkout fails
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast.error(resData.error || 'Erreur lors de la création');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
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
            <StepIndicator currentStep={step} totalSteps={5} />
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
            
            {/* STEP 1: Name */}
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

            {/* STEP 2: Use Case */}
            {step === 2 && (
              <motion.div key="step2" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Quel est votre usage ?</h2>
                  <p className="text-gray-400 text-sm">Nous adapterons l&apos;expérience en fonction de vos besoins.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'work', label: 'Entreprise', icon: Briefcase, desc: 'Gestion d\'équipe' },
                    { id: 'freelance', label: 'Freelance', icon: Zap, desc: 'Indépendant & Clients' },
                    { id: 'agency', label: 'Agence', icon: Users, desc: 'Multi-projets & Clients' },
                    { id: 'startup', label: 'Startup', icon: Rocket, desc: 'Croissance & Agilité' },
                    { id: 'creative', label: 'Créatif', icon: Palette, desc: 'Design & Médias' },
                    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, desc: 'Ventes & Produits' },
                    { id: 'school', label: 'Études', icon: GraduationCap, desc: 'Organisation académique' },
                    { id: 'nonprofit', label: 'Association', icon: Heart, desc: 'Social & Caritatif' },
                    { id: 'personal', label: 'Personnel', icon: Sparkles, desc: 'Vie quotidienne' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateData('useCase', item.id)}
                      className={`
                        relative p-3 rounded-xl border text-left transition-all duration-200 group
                        ${data.useCase === item.id 
                          ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                      `}
                    >
                      <item.icon className={`w-5 h-5 mb-2 ${data.useCase === item.id ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                      <div className="font-semibold text-xs mb-0.5">{item.label}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</div>
                      
                      {data.useCase === item.id && (
                        <motion.div layoutId="check-badge" className="absolute top-2 right-2">
                          <div className="bg-indigo-500 rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Personalization */}
            {step === 3 && (
              <motion.div key="step3" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Personnalisation</h2>
                  <p className="text-gray-400 text-sm">Donnez une identité visuelle à votre espace.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                  <button
                    onClick={() => setPersonalizationMode('color')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${personalizationMode === 'color' ? 'bg-[#14141d] text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Palette className="w-4 h-4" /> Couleur
                  </button>
                  <button
                    onClick={() => setPersonalizationMode('image')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${personalizationMode === 'image' ? 'bg-[#14141d] text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    <ImageIcon className="w-4 h-4" /> Image
                  </button>
                </div>

                {/* Color Mode */}
                {personalizationMode === 'color' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                       {PRESET_COLORS.map((color) => (
                         <button
                            key={color}
                            onClick={() => { updateData('themeColor', color); updateData('image', undefined); }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${data.themeColor === color && !data.image ? 'ring-2 ring-offset-2 ring-offset-[#14141d] ring-white scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                         >
                           {data.themeColor === color && !data.image && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                         </button>
                       ))}
                    </div>
                    
                    <div className="relative">
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">Code Couleur (Hex)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: data.themeColor }}></div>
                        <input 
                          type="text" 
                          value={data.themeColor}
                          onChange={(e) => { updateData('themeColor', e.target.value); updateData('image', undefined); }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Image Mode */}
                {personalizationMode === 'image' && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PRESET_IMAGES.map((img) => (
                        <button
                          key={img}
                          onClick={() => updateData('image', img)}
                          className={`relative aspect-video rounded-xl overflow-hidden group border-2 transition-all ${data.image === img ? 'border-indigo-500' : 'border-transparent hover:border-white/20'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Workspace cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          {data.image === img && (
                            <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center backdrop-blur-[1px]">
                              <div className="bg-indigo-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}

                      {/* Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingIcon}
                        className={`
                          relative aspect-video rounded-xl overflow-hidden group border-2 transition-all flex flex-col items-center justify-center gap-2
                          ${!PRESET_IMAGES.includes(data.image || '') && data.image 
                            ? 'border-indigo-500 bg-indigo-500/5' 
                            : 'border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-white/10 bg-white/5'}
                          ${isUploadingIcon ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {isUploadingIcon ? (
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        ) : !PRESET_IMAGES.includes(data.image || '') && data.image ? (
                          <>
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={data.image} alt="Uploaded icon" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500" />
                             <div className="relative z-10 flex flex-col items-center gap-1">
                                <div className="bg-indigo-500 rounded-full p-1 shadow-lg shadow-indigo-500/50">
                                   <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">Perso</span>
                             </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Importer</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleIconUpload} 
                          className="hidden" 
                          accept="image/*" 
                        />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Preview */}
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 relative overflow-hidden">
                  {/* Optional Background for Preview */}
                  {data.image && (
                     <div className="absolute inset-0 opacity-20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.image} alt="bg-preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#14141d] to-transparent"></div>
                     </div>
                  )}
                  
                  <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden flex-shrink-0 z-10`} 
                       style={{ backgroundColor: data.image ? 'transparent' : data.themeColor }}>
                    {data.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={data.image} alt="logo-preview" className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-6 h-6" />
                    )}
                  </div>
                  <div className="z-10">
                    <h4 className="font-bold text-white text-lg">{data.workspaceName || 'Mon Workspace'}</h4>
                    <p className="text-xs text-gray-400">Aperçu de votre identité visuelle</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Invitations */}
            {step === 4 && (
              <motion.div key="step4" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Invitez votre équipe</h2>
                  <p className="text-gray-400 text-sm">Le travail est meilleur ensemble. Ajoutez vos amis dès maintenant.</p>
                </div>

                {/* Copy Link Section */}
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                       <LinkIcon className="w-4 h-4" /> Lien d&apos;invitation unique
                     </span>
                  </div>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                      {inviteLink || 'Génération du lien...'}
                    </code>
                    <button 
                      onClick={copyInviteLink}
                      className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 p-2 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                      placeholder="exemple@email.com"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                    />
                    <button 
                      onClick={handleAddEmail}
                      disabled={!emailInput || !emailInput.includes('@')}
                      className="bg-white text-black px-4 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* List of invited */}
                  {data.invitedEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {data.invitedEmails.map((email) => (
                        <span key={email} className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm border border-white/5 animate-in fade-in zoom-in duration-200">
                          {email}
                          <button onClick={() => removeEmail(email)} className="hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {data.invitedEmails.length === 0 && (
                    <div className="text-center py-8 text-gray-600 italic">
                      Aucune invitation pour le moment
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Final Review */}
            {step === 5 && (
              <motion.div key="step5" className="space-y-6 text-center">
                 <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 relative">
                    <Rocket className="w-12 h-12 text-white" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-t-2 border-r-2 border-white/30 rounded-full" 
                    />
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white mb-2">Tout est prêt !</h2>
                 <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                   Votre espace de travail <strong>{data.workspaceName}</strong> a été configuré avec succès.
                 </p>

                 <div className="bg-white/5 rounded-2xl p-6 text-left max-w-sm mx-auto space-y-4 border border-white/5 relative overflow-hidden">
                    {/* Background hint */}
                    {data.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={data.image} alt="bg-decoration" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                    )}

                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Nom</span>
                        <span className="font-medium">{data.workspaceName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usage</span>
                        <span className="font-medium capitalize">{data.useCase}</span>
                      </div>
                       <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Plan</span>
                        <span className="font-medium text-emerald-400 capitalize">{new URLSearchParams(window.location.search).get('plan') || 'Starter'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Style</span>
                        <div className="flex items-center gap-2">
                           {data.image ? <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Image</span> : null}
                           <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: data.themeColor }} />
                        </div>
                      </div>
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

            {step < 5 ? (
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
                {step === 4 ? 'Ignorer / Continuer' : 'Continuer'}
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
