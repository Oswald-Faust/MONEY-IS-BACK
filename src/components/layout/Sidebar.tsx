'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useAuthStore } from '@/store';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  RotateCcw,
  Target,
  Lightbulb,
  Key,
  HardDrive,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  User,
  X,
  MessageCircle,
} from 'lucide-react';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', view: 'dashboard' as const },
  { icon: FolderKanban, label: 'Projets', href: '/projects', view: 'projects' as const },
  { icon: CheckSquare, label: 'To Do Global', href: '/tasks', view: 'tasks' as const },
  { icon: Calendar, label: 'Calendrier', href: '/calendar', view: 'calendar' as const },
  { icon: RotateCcw, label: 'Routines', href: '/routines', view: 'routines' as const },
  { icon: MessageCircle, label: 'Messagerie', href: '/messages', view: 'messages' as const },
];

const secondaryNavItems = [
  { icon: Target, label: 'Objectifs', href: '/objectives', view: 'objectives' as const },
  { icon: Lightbulb, label: 'Idées', href: '/ideas', view: 'ideas' as const },
  { icon: Key, label: 'IDs Sécurisés', href: '/secure-ids', view: 'ids' as const },
  { icon: HardDrive, label: 'Drive', href: '/drive', view: 'drive' as const },
];

import { ThemeToggle } from '@/components/ThemeToggle';

import Image from 'next/image';

interface PartialProject {
  _id: string;
  name: string;
  color: string;
  href?: string;
}

// Demo data for fallback
const demoProjects: PartialProject[] = [
  { _id: '1', name: 'FINEA', color: '#22c55e' },
  { _id: '2', name: 'BUISPACE', color: '#f97316' },
  { _id: '3', name: 'AFFI', color: '#ef4444' },
  { _id: '4', name: 'MATHIAS', color: '#94a3b8' },
  { _id: '5', name: 'AGBK', color: '#8b5cf6' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, projects, setProjectModalOpen, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
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
        className={`fixed left-0 top-0 h-screen bg-secondary border-r border-glass-border flex flex-col z-[70] ${
          isMobile ? 'shadow-2xl' : ''
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-glass-border">
          <AnimatePresence mode="wait">
            {(!sidebarCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MB</span>
                </div>
                <div>
                  <h1 className="font-semibold text-main text-sm">MONEY IS BACK</h1>
                  <p className="text-xs text-dim">Workspace</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center gap-1">
            {!isMobile && !sidebarCollapsed && <ThemeToggle />}
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-glass-bg border border-glass-border rounded-2xl text-main placeholder-dim focus:bg-glass-hover focus:border-indigo-500/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {/* Main Items */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
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
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-dim hover:bg-glass-hover hover:text-main'}
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
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

        {/* Projects Section */}
        {(!sidebarCollapsed || isMobile) && (
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projets
              </span>
              <button
                onClick={() => setProjectModalOpen(true)}
                className="p-1 rounded-md hover:bg-glass-hover text-dim hover:text-main transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {(projects.length > 0 ? projects : demoProjects).map((project) => (
                <Link key={project._id} href={`/projects/${project._id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-dim hover:bg-glass-hover hover:text-main transition-all duration-200 cursor-pointer"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Navigation */}
{/* Secondary Navigation */}
          <div className="mt-6">
            {(!sidebarCollapsed || isMobile) && (
              <div className="px-3 mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outils
                </span>
              </div>
            )}
            <div className="space-y-1">
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl
                        transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'text-dim hover:bg-glass-hover hover:text-main'}
                      `}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
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
          </div>
      </nav>

      {/* Footer - User */}
      <div className="p-3 border-t border-glass-border">
        <div className={`
          flex items-center gap-3 px-3 py-2 rounded-xl
          hover:bg-glass-hover transition-all duration-200 group
        `}>
          <Link href="/settings" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all">
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
                  <p className="text-sm font-medium text-main truncate group-hover:text-indigo-400 transition-colors">
                    {user ? `${user.firstName} ${user.lastName}` : 'Mathias MERCIER'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'admin@moneyisback.com'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex items-center gap-1">
              <Link href="/settings">
                <button className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-dim hover:text-indigo-400 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-dim hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
    </AnimatePresence>
  );
}
