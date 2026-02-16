'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useAuthStore } from '@/store';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  X,
  ShieldCheck,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Vue d\'ensemble', href: '/admin/dashboard' },
  { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
  { icon: Building2, label: 'Workspaces', href: '/admin/workspaces' },
  { icon: CreditCard, label: 'Abonnements', href: '/admin/subscriptions' },
  { icon: Activity, label: 'Logs Système', href: '/admin/logs' },
  { icon: ShieldCheck, label: 'Contrôle d\'Accès', href: '/admin/access' },
  { icon: Settings, label: 'Configuration', href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {/* Backdrop for mobile */}
      {isMobile && isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        />
      )}

      <motion.aside
        initial={isMobile ? { x: -280 } : false}
        animate={isMobile 
          ? { x: isMobileMenuOpen ? 0 : -280, width: 280 } 
          : { x: 0, width: sidebarCollapsed ? 80 : 280 }
        }
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed left-0 top-0 h-screen bg-[#0f0f13] flex flex-col z-[70] ${
          isMobile ? 'shadow-2xl' : 'border-r border-red-500/20'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {(!sidebarCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-main text-sm tracking-tight">
                    ADMIN PANEL
                  </h1>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Creator Mode</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center gap-1">
            <button
              onClick={isMobile ? () => setMobileMenuOpen(false) : toggleSidebar}
              className="p-2 rounded-lg hover:bg-glass-hover text-dim hover:text-main transition-colors"
            >
              {isMobile ? (
                <X className="w-4 h-4" />
              ) : (
                sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        {(!sidebarCollapsed || isMobile) && (
          <div className="px-4 py-4">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-white/5 border border-white/10 rounded-2xl text-main placeholder-dim focus:bg-glass-hover focus:border-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm' 
                        : 'text-dim hover:bg-glass-hover hover:text-main'}
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-400' : ''}`} />
                    <AnimatePresence mode="wait">
                      {(!sidebarCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats Mini View */}
          {(!sidebarCollapsed || isMobile) && (
            <div className="mt-8 px-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                Performance Directe
              </span>
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dim">Revenus</span>
                    <span className="text-xs text-green-400 font-bold">+12%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[65%]" />
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dim">Serveur</span>
                    <span className="text-xs text-blue-400 font-bold">Stable</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[92%]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Switch back to App */}
        <div className="px-3 py-4">
          <Link href="/dashboard">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer border border-indigo-500/10"
            >
              <ArrowLeft className="w-5 h-5" />
              {(!sidebarCollapsed || isMobile) && (
                <span className="text-sm font-medium">Retour au Produit</span>
              )}
            </motion.div>
          </Link>
        </div>

        {/* Footer - Admin */}
        <div className="p-3 border-t border-white/5">
          <div className={`
            flex items-center gap-3 px-3 py-2 rounded-xl
            hover:bg-glass-hover transition-all duration-200 group
          `}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden ring-2 ring-transparent group-hover:ring-red-500/50 transition-all">
              {user?.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt="" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {(!sidebarCollapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-main truncate group-hover:text-red-400 transition-colors">
                    {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
                  </p>
                  <p className="text-[10px] text-red-500 font-bold uppercase">Super Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {(!sidebarCollapsed || isMobile) && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-dim hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
