'use client';

import AdminSidebar from '@/components/layout/AdminSidebar';
import { Toaster } from 'react-hot-toast';
import { useAppStore, useAuthStore } from '@/store';
import { motion } from 'framer-motion';
import React from 'react';
import { Menu, ShieldAlert } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    sidebarCollapsed,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore();

  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { user } = useAuthStore();

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-primary" />
    );
  }

  // Double check admin role
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-main mb-2">Accès Restreint</h1>
        <p className="text-dim text-center mb-8 max-w-md">
          Désolé, cette zone est réservée aux créateurs du produit. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez le support.
        </p>
        <Link href="/dashboard">
          <button className="px-8 py-3 rounded-2xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all">
            Retour au Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-bg-primary transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
            },
          }}
        />
        
        <AdminSidebar />
        
        {/* Mobile Header */}
        {isMobile && !isMobileMenuOpen && (
          <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-bg-primary/80 backdrop-blur-md border-b border-glass-border z-40">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-dim hover:text-main transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AD</span>
                </div>
                <span className="font-semibold text-main text-sm uppercase tracking-wider">Admin</span>
              </div>
            </div>
          </div>
        )}
        
        <motion.main
          initial={false}
          animate={{
            paddingLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 280),
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ paddingTop: isMobile ? 64 : 0 }}
          className="min-h-screen w-full overflow-x-hidden"
        >
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </AuthGuard>
  );
}
