'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Loader2, ArrowRight, ShieldCheck, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function JoinPage() {
  const params = useParams();
  const token = params?.token as string;

  const { user, token: authToken } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/validate?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setInvitationData(data.data);
        } else {
          setError(data.error || 'Invitation invalide');
        }
      } catch {
        setError('Erreur lors de la vérification');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkInvitation();
    }
  }, [token]);

  const handleJoin = async () => {
    if (!authToken) {
      // Should redirect to login with callbackUrl
      router.push(`/login?callbackUrl=/join/${token}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Maybe fetch the new workspace or just redirect to dashboard
        // Ideally we should switch context to this workspace
        // But dashboard will load it.
        router.push('/dashboard');
      } else {
        toast.error(data.error);
      }
    } catch {
        toast.error('Erreur lors de la validation');
    } finally {
        setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Invitation invalide</h1>
            <p className="text-dim">{error}</p>
            <Link href="/" className="btn-primary inline-flex">
                Retour à l&apos;accueil
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

      <div className="glass-card max-w-lg w-full p-8 space-y-8 relative z-10 border-indigo-500/20">
        <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3">
                <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
                Invitation Reçue
            </h1>
            <div className="space-y-1">
                <p className="text-dim">
                    <span className="text-white font-semibold">{invitationData.inviter?.firstName} {invitationData.inviter?.lastName}</span> vous invite à rejoindre le workspace
                </p>
                <div className="text-xl font-bold text-indigo-400 bg-indigo-500/10 py-2 px-4 rounded-xl inline-block mt-2 border border-indigo-500/20">
                    {invitationData.workspace?.name}
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                     <span className="text-dim">Votre email invité</span>
                     <span className="text-white font-mono">{invitationData.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                     <span className="text-dim">Rôle proposé</span>
                     <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-bold uppercase text-white">{invitationData.role}</span>
                </div>
            </div>

            {!user ? (
                 <div className="space-y-3">
                    <Link 
                        href={`/register?email=${encodeURIComponent(invitationData.email)}&callbackUrl=/join/${token}`}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 group"
                    >
                        Créer un compte
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                        href={`/login?email=${encodeURIComponent(invitationData.email)}&callbackUrl=/join/${token}`}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-white/10"
                    >
                        <LogIn className="w-5 h-5" />
                        J&apos;ai déjà un compte
                    </Link>
                 </div>
            ) : (
                <div className="space-y-4">
                     <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <span className="font-bold text-indigo-400">{user.firstName?.[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">Connecté en tant que</p>
                            <p className="text-sm text-dim truncate">{user.email}</p>
                        </div>
                     </div>

                     <button
                        onClick={handleJoin}
                        disabled={processing}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                     >
                        {processing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Rejoindre le Workspace
                                <UserPlus className="w-5 h-5" />
                            </>
                        )}
                     </button>
                     
                     <p className="text-xs text-center text-dim">
                        En rejoignant, vous acceptez d&apos;être membre de ce workspace.
                     </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
