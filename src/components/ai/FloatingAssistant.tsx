'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import AIWorkspacePanel from './AIWorkspacePanel';

export default function FloatingAssistant() {
  const {
    isAiAssistantOpen, setAiAssistantOpen,
    isProjectModalOpen, isTaskModalOpen, isRoutineModalOpen,
    isObjectiveModalOpen, isIdeaModalOpen, isWorkspaceModalOpen,
    isUploadModalOpen, isCreateFolderModalOpen, isSearchModalOpen,
    isCreateUserModalOpen,
  } = useAppStore();

  const isAnyModalOpen =
    isProjectModalOpen || isTaskModalOpen || isRoutineModalOpen ||
    isObjectiveModalOpen || isIdeaModalOpen || isWorkspaceModalOpen ||
    isUploadModalOpen || isCreateFolderModalOpen || isSearchModalOpen ||
    isCreateUserModalOpen;

  return (
    <>
      <AnimatePresence>
        {isAiAssistantOpen && !isAnyModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <AIWorkspacePanel
              variant="floating"
              onClose={() => setAiAssistantOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isAnyModalOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setAiAssistantOpen(!isAiAssistantOpen)}
            className="fixed bottom-6 right-6 z-[94] flex items-center gap-3 rounded-full border border-white/10 bg-bg-secondary/90 px-4 py-3 text-text-main shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)] backdrop-blur-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
              {isAiAssistantOpen ? <MessageSquareText className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Edwin</p>
              <p className="text-sm font-semibold text-text-main">AI Assistant</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
