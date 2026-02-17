'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setLoading } = useAuthStore();
  
  // Check for email in search params for prefill
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const emailPrefill = searchParams ? searchParams.get('email') : '';

  const [email, setEmail] = useState(emailPrefill || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setAuth(data.data.user, data.data.token);
        toast.success('Connexion réussie !');
        // Check for callbackUrl
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
        
        window.location.replace(callbackUrl);
      } else {
        toast.error(data.error || 'Erreur de connexion');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-primary">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20"
          >
            <span className="text-2xl font-bold text-white">MB</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-text-main mb-2">Bon retour !</h1>
          <p className="text-text-dim">Connectez-vous à MONEY IS BACK</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-dim mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="
                    w-full pl-12 pr-4 py-3.5 text-sm
                    bg-glass-bg border border-glass-border
                    rounded-xl text-text-main placeholder-text-muted
                    focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-dim mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="
                    w-full pl-12 pr-12 py-3.5 text-sm
                    bg-glass-bg border border-glass-border
                    rounded-xl text-text-main placeholder-text-muted
                    focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-3.5 px-6 rounded-xl
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white font-semibold text-sm
                hover:from-indigo-500 hover:to-purple-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-text-muted bg-bg-secondary">ou</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-text-dim">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );

}
