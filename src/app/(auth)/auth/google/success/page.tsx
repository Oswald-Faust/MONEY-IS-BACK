'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

function sanitizeNextPath(path: string | null): string {
  if (!path) return '/dashboard';
  if (!path.startsWith('/')) return '/dashboard';
  if (path.startsWith('//')) return '/dashboard';
  return path;
}

export default function GoogleSuccessPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const finalizeGoogleAuth = async () => {
      try {
        const response = await fetch('/api/auth/google/session', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (!data.success) {
          toast.error(data.error || 'Connexion Google impossible');
          router.replace('/login');
          return;
        }

        setAuth(data.data.user, data.data.token);
        toast.success('Connexion Google réussie');

        const urlParams = new URLSearchParams(window.location.search);
        const nextPath = sanitizeNextPath(urlParams.get('next'));
        window.location.replace(nextPath);
      } catch {
        toast.error('Erreur de finalisation Google');
        router.replace('/login');
      }
    };

    void finalizeGoogleAuth();
  }, [router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <div className="glass-card p-8 flex items-center gap-3 text-text-main">
        <Loader2 className="w-5 h-5 animate-spin" />
        Connexion Google en cours...
      </div>
    </div>
  );
}
