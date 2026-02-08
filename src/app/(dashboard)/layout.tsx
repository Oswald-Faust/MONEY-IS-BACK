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
  CreateIdeaModal
} from '@/components/modals';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    sidebarCollapsed,
    isProjectModalOpen,
    isTaskModalOpen,
    isRoutineModalOpen,
    isObjectiveModalOpen,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isIdeaModalOpen,
    setProjectModalOpen,
    setTaskModalOpen,
    setRoutineModalOpen,
    setObjectiveModalOpen,
    setUploadModalOpen,
    setCreateFolderModalOpen,
    setIdeaModalOpen
  } = useAppStore();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]" />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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
      
      <motion.main
        initial={false}
        animate={{
          paddingLeft: sidebarCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen w-full"
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
      />
      <CreateRoutineModal 
        isOpen={isRoutineModalOpen} 
        onClose={() => setRoutineModalOpen(false)} 
      />
      <CreateObjectiveModal 
        isOpen={isObjectiveModalOpen} 
        onClose={() => setObjectiveModalOpen(false)} 
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
    </div>
  );
}
