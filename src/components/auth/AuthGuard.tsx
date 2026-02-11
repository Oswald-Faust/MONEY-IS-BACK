'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'admin';
}

export default function AuthGuard({ 
  children, 
  requireAuth = true,
  requiredRole 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoading) return;

    // Si l'authentification est requise et l'utilisateur n'est pas authentifié
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si un rôle spécifique est requis
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard'); // Redirection vers le dashboard si le rôle ne correspond pas
      return;
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requiredRole, router]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise et l'utilisateur n'est pas authentifié, ne rien afficher
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si un rôle est requis et ne correspond pas, ne rien afficher
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
