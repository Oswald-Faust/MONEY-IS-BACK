'use client';

import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store';
import { motion } from 'framer-motion';
import {
  CreateProjectModal,
  CreateTaskModal,
  CreateRoutineModal,
  CreateObjectiveModal,
  CreateFolderModal,
  UploadFileModal,
  CreateIdeaModal,
  CreateUserModal
} from '@/components/modals';
import React from 'react';
import { Menu } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    sidebarCollapsed,
    isMobileMenuOpen,
    setMobileMenuOpen,
    isProjectModalOpen,
    isTaskModalOpen,
    isRoutineModalOpen,
    isObjectiveModalOpen,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isIdeaModalOpen,
    taskProjectId,
    objectiveProjectId,
    setProjectModalOpen,
    setTaskModalOpen,
    setRoutineModalOpen,
    setObjectiveModalOpen,
    setUploadModalOpen,
    setCreateFolderModalOpen,
    setIdeaModalOpen
  } = useAppStore();

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-primary" />
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-primary transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a24',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
          }}
        />
        
        <Sidebar />
        
        {/* Mobile Header */}
        {isMobile && !isMobileMenuOpen && (
          <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-primary/80 backdrop-blur-md border-b border-glass-border z-40">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-dim hover:text-main transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MB</span>
                </div>
                <span className="font-semibold text-main text-sm">MONEY IS BACK</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* ThemeToggle removed */}
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
          <div className="dashboard-container">
            {children}
          </div>
        </motion.main>

        {/* Modals */}
        <CreateProjectModal 
          isOpen={isProjectModalOpen} 
          onClose={() => setProjectModalOpen(false)} 
        />
        <CreateTaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setTaskModalOpen(false)} 
          defaultProjectId={taskProjectId}
        />
        <CreateRoutineModal 
          isOpen={isRoutineModalOpen} 
          onClose={() => setRoutineModalOpen(false)} 
        />
        <CreateObjectiveModal 
          isOpen={isObjectiveModalOpen} 
          onClose={() => setObjectiveModalOpen(false)} 
          defaultProjectId={objectiveProjectId}
        />
        <CreateFolderModal 
          isOpen={isCreateFolderModalOpen} 
          onClose={() => setCreateFolderModalOpen(false)} 
        />
        <UploadFileModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setUploadModalOpen(false)} 
        />
        <CreateIdeaModal 
          isOpen={isIdeaModalOpen} 
          onClose={() => setIdeaModalOpen(false)} 
        />
        <CreateUserModal />
      </div>
    </AuthGuard>
  );
}
