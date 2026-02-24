
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageSquare } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Partial<User> & { firstName: string; lastName: string; _id: string };
}


export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const router = useRouter();

  const handleMessage = () => {
    router.push(`/messages?userId=${user._id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
          >
            <div className="glass-card overflow-hidden relative border-glass-border bg-bg-secondary">
              {/* Header / Cover */}
              <div className="h-24 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 relative">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-glass-bg text-text-muted hover:text-text-main hover:bg-glass-hover transition-all border border-glass-border"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar & Info */}
              <div className="px-6 pb-6 -mt-10 relative">
                <div className="flex flex-col items-center">
                  <div className="p-1 rounded-full bg-bg-secondary mb-4 ring-4 ring-bg-primary shadow-xl">
                    <Avatar 
                      src={user.avatar} 
                      fallback={user.firstName} 
                      color={user.profileColor} 
                      size="xl" 
                      className="w-24 h-24 text-2xl shadow-inner"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-text-main mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm font-bold text-accent-primary uppercase tracking-widest mb-6">
                    {user.role === 'admin' ? 'Administrateur' : 'Membre du projet'}
                  </p>

                  <div className="w-full space-y-4">
                     {user.email && (
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-tertiary border border-glass-border">
                           <Mail className="w-5 h-5 text-text-muted" />
                           <span className="text-sm text-text-dim break-all">{user.email}</span>
                        </div>
                     )}
                     
                     <button
                        onClick={handleMessage}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-primary hover:opacity-90 text-white font-bold transition-all shadow-lg shadow-accent-primary/20"
                     >
                        <MessageSquare className="w-5 h-5" />
                        Envoyer un message
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
