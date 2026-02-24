'use client';

import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';
import { useAppStore, useAuthStore } from '@/store';
import { motion } from 'framer-motion';
import {
  CreateProjectModal,
  CreateTaskModal,
  CreateRoutineModal,
  CreateObjectiveModal,
  CreateFolderModal,
  UploadFileModal,
  CreateIdeaModal,
  CreateUserModal,
  CreateWorkspaceModal
} from '@/components/modals';
import GlobalSearch from '@/components/search/GlobalSearch';
import React from 'react';
import { Menu } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { Workspace } from '@/types';


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
    setIdeaModalOpen,
    currentWorkspace, // Import currentWorkspace
    setCurrentWorkspace, // Import setCurrentWorkspace
    setWorkspaces // Import setWorkspaces
  } = useAppStore();

  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { token } = useAuthStore();
  const { setProjects } = useAppStore();

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch workspaces if not set
  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      if (token) {
        try {
          const response = await fetch(`/api/workspaces?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            const state = useAppStore.getState();
            setWorkspaces(data.data);
            
            const activeWs = state.currentWorkspace;
            const foundActiveWs = activeWs ? data.data.find((ws: Workspace) => ws._id === activeWs._id) : null;
            
            if (!foundActiveWs && data.data.length > 0) {
              // User no longer has access to this workspace or none set
              setCurrentWorkspace(data.data[0]);
            } else if (foundActiveWs) {
              // Update if changed
              if (
                foundActiveWs.subscriptionPlan !== activeWs?.subscriptionPlan || 
                foundActiveWs.subscriptionStatus !== activeWs?.subscriptionStatus ||
                foundActiveWs.name !== activeWs?.name
              ) {
                setCurrentWorkspace(foundActiveWs);
              }
            } else if (data.data.length === 0) {
              setCurrentWorkspace(null);
            }
          }
        } catch (error) {
          console.error('Failed to fetch workspaces', error);
        }
      }
    };
    
    if (mounted && token) {
      fetchWorkspaces();
    }
  }, [mounted, token, setCurrentWorkspace, setWorkspaces]);

  // Fetch projects when currentWorkspace changes
  React.useEffect(() => {
    const fetchProjects = async () => {
      if (currentWorkspace && token) {
        try {
          const response = await fetch(`/api/projects?workspace=${currentWorkspace._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setProjects(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch projects', error);
        }
      }
    };

    if (mounted && currentWorkspace && token) {
      fetchProjects();
    }
  }, [mounted, currentWorkspace, token, setProjects]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-primary" />
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
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        
        <Sidebar />
        
        {/* Mobile Header */}
        {isMobile && !isMobileMenuOpen && (
          <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-bg-primary/80 backdrop-blur-md border-b border-glass-border z-40">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-text-dim hover:text-text-main transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MB</span>
                </div>
                <span className="font-semibold text-text-main text-sm">Edwin</span>
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
        <CreateWorkspaceModal />
        <GlobalSearch />
      </div>
    </AuthGuard>
  );
}
