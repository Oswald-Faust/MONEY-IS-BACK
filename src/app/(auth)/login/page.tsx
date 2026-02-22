'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  
  // Check for email in search params for prefill
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const emailPrefill = searchParams ? searchParams.get('email') : '';

  const [email, setEmail] = useState(emailPrefill || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleAuth = () => {
    setIsGoogleSubmitting(true);
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl');
    const next = callbackUrl
      ? `/api/auth/google/start?mode=login&callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/api/auth/google/start?mode=login';

    window.location.assign(next);
  };

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
    } catch {
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
          <p className="text-text-dim">Connectez-vous à Edwin</p>
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isGoogleSubmitting}
            onClick={handleGoogleAuth}
            className="
              w-full mt-4 py-3.5 px-6 rounded-xl
              bg-white text-gray-800 border border-gray-200
              font-semibold text-sm
              hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-3
            "
          >
            {isGoogleSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.207 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.959 3.041l5.657-5.657C34.053 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.959 3.041l5.657-5.657C34.053 6.053 29.277 4 24 4c-7.682 0-14.636 4.337-17.694 10.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.715 36 24 36c-5.186 0-9.623-3.328-11.283-7.946l-6.522 5.025C9.204 39.556 16.584 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571.001-.001 6.19 5.238 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Continuer avec Google
              </>
            )}
          </motion.button>

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
