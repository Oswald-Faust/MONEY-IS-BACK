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
  UserPlus,
  Sparkles,
  Zap,
  Star,
  ShieldCheck,
  Rocket,
  Command,
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
  { icon: UserPlus, label: 'Inviter', href: '/invite', view: 'invite' as const },
  { icon: Sparkles, label: 'Mettre à niveau', href: '/upgrade', view: 'upgrade' as const },
];

import Image from 'next/image';

const PlanBadge = ({ plan }: { plan?: string }) => {
  const getPlanStyles = (planId: string = 'starter') => {
    const normalizedPlan = planId?.toString().toLowerCase() || 'starter';
    switch (normalizedPlan) {
      case 'pro':
        return { label: 'PRO', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', icon: Zap };
      case 'team':
      case 'business':
        return { label: 'TEAM', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: Star };
      case 'enterprise':
        return { label: 'ENT', bg: 'bg-[#00FFB2]/10', border: 'border-[#00FFB2]/20', text: 'text-[#00FFB2]', icon: ShieldCheck };
      case 'admin':
        return { label: 'ADMIN', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: ShieldCheck };
      default:
        return { label: 'FREE', bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-500', icon: Rocket };
    }
  };

  const config = getPlanStyles(plan);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${config.bg} ${config.border} ${config.text}`}>
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-bold tracking-wider">{config.label}</span>
    </div>
  );
};



export default function Sidebar() {
  const pathname = usePathname();
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    projects, 
    setProjectModalOpen, 
    isMobileMenuOpen, 
    setMobileMenuOpen, 
    currentWorkspace,
    setCurrentWorkspace,
    setSearchModalOpen,
    setWorkspaceModalOpen,
    workspaces
  } = useAppStore();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [projectsExpanded, setProjectsExpanded] = React.useState(true);

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
        className={`fixed left-0 top-0 h-screen bg-secondary flex flex-col z-[70] ${
          isMobile ? 'shadow-2xl' : 'border-r border-indigo-500/30'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 pr-2">
                <div className="relative group/ws">
                  <button 
                    onClick={() => {
                      const dropdown = document.getElementById('ws-dropdown');
                      if (dropdown) dropdown.classList.toggle('hidden');
                    }}
                    className="w-full flex items-center gap-3 p-1 rounded-xl hover:bg-white/5 transition-all text-left"
                  >
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
                      style={{ 
                        backgroundColor: currentWorkspace?.settings?.image ? 'transparent' : (currentWorkspace?.settings?.defaultProjectColor || '#6366f1')
                      }}
                    >
                      {currentWorkspace?.settings?.image ? (
                        <Image 
                          src={currentWorkspace.settings.image} 
                          alt="" 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {currentWorkspace?.name ? currentWorkspace.name.substring(0, 2).toUpperCase() : 'MB'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-semibold text-main text-sm truncate">
                        {currentWorkspace?.name || 'MONEY IS BACK'}
                      </h1>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-dim font-bold uppercase tracking-wider">Workspace</p>
                        <ChevronRight className="w-3 h-3 text-dim group-hover/ws:rotate-90 transition-transform" />
                      </div>
                    </div>
                  </button>

                  {/* Workspace Dropdown */}
                  <div id="ws-dropdown" className="hidden absolute top-full left-0 w-64 mt-2 py-2 bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl z-[100] backdrop-blur-xl">
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                      <p className="text-[10px] font-black text-dim uppercase tracking-widest">Vos Espaces de Travail</p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto px-2 space-y-1 custom-scrollbar">
                      {useAppStore.getState().workspaces.map((ws) => (
                        <button
                          key={ws._id}
                          onClick={() => {
                            setCurrentWorkspace(ws);
                            document.getElementById('ws-dropdown')?.classList.add('hidden');
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                            currentWorkspace?._id === ws._id ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                            style={{ 
                              backgroundColor: ws.settings?.image ? 'transparent' : (ws.settings?.defaultProjectColor || '#6366f1')
                            }}
                          >
                            {ws.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`text-sm font-medium truncate ${currentWorkspace?._id === ws._id ? 'text-indigo-400' : 'text-main'}`}>
                              {ws.name}
                            </p>
                            <p className="text-[10px] text-dim">{ws.subscriptionPlan.toUpperCase()}</p>
                          </div>
                          
                          {currentWorkspace?._id === ws._id && (
                            <Link 
                                href="/settings" 
                                onClick={(e) => {
                                    // Prevents triggering the workspace switch if already on it
                                    e.stopPropagation();
                                    // We might want to set a specific active tab in store if we had that, 
                                    // but for now going to settings is fine.
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-dim hover:text-white transition-all mr-1"
                            >
                                <Settings className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {currentWorkspace?._id === ws._id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        </button>
                      ))}
                    </div>

                    <div className="px-2 mt-2 pt-2 border-t border-white/5">
                      {workspaces.some(ws => ['team', 'enterprise'].includes(ws.subscriptionPlan)) || user?.role === 'admin' || workspaces.length < 1 ? (
                        <button
                          onClick={() => {
                            setWorkspaceModalOpen(true);
                            document.getElementById('ws-dropdown')?.classList.add('hidden');
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-xl text-dim hover:bg-white/5 hover:text-main transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all">
                            <Plus className="w-4 h-4 group-hover:text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium">Créer un workspace</span>
                        </button>
                      ) : (
                        <Link
                          href="/upgrade"
                          onClick={() => document.getElementById('ws-dropdown')?.classList.add('hidden')}
                          className="w-full flex items-center gap-3 p-2 rounded-xl text-dim hover:bg-white/5 hover:text-indigo-400 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all">
                            <Star className="w-4 h-4 group-hover:text-indigo-400" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">Créer un workspace</span>
                            <span className="text-[10px] text-indigo-400/70 font-bold">REQUIS : PLAN TEAM</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-dim uppercase tracking-widest flex items-center gap-2">
              <Search className="w-3 h-3" />
              Quick search
            </span>
            <PlanBadge plan={currentWorkspace?.subscriptionPlan} />
          </div>
          <button 
            onClick={() => setSearchModalOpen(true)}
            className="relative group w-full flex items-center"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors duration-200" />
            <div className="w-full pl-11 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-dim text-left group-hover:bg-glass-hover group-hover:border-indigo-500/40 transition-all duration-300 shadow-inner flex items-center justify-between">
              <span>Rechercher...</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-500">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </div>
          </button>
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

          {/* Admin Switcher */}
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer group"
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <AnimatePresence mode="wait">
                  {(!sidebarCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-bold whitespace-nowrap uppercase tracking-wider"
                    >
                      Mode Créateur
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )}
        </div>

        {/* Projects Section */}
        {(!sidebarCollapsed || isMobile) && projects.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="flex items-center gap-1 group/header"
              >
                <div className={`
                  p-0.5 rounded transition-colors duration-200 
                  text-gray-500 group-hover/header:text-main
                `}>
                  <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${projectsExpanded ? 'rotate-90' : ''}`} />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover/header:text-main transition-colors">
                  Projets
                </span>
              </button>
              <button
                onClick={() => setProjectModalOpen(true)}
                className="p-1 rounded-md hover:bg-glass-hover text-dim hover:text-main transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <AnimatePresence>
              {projectsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    {projects.map((project) => (
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
                </motion.div>
              )}
            </AnimatePresence>
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
              {secondaryNavItems.filter(item => {
                if (item.label === 'Mettre à niveau' && user?.role === 'admin') return false;
                return true;
              }).map((item) => {
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
      <div className="p-3">
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
