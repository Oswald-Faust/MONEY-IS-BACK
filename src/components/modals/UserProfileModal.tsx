
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
            <div className="glass-card overflow-hidden relative">
              {/* Header / Cover */}
              <div className="h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 relative">
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar & Info */}
              <div className="px-6 pb-6 -mt-10 relative">
                <div className="flex flex-col items-center">
                  <div className="p-1.5 rounded-full bg-[#1A1A1A] mb-3">
                    <Avatar 
                      src={user.avatar} 
                      fallback={user.firstName} 
                      color={user.profileColor} 
                      size="xl" 
                      className="w-20 h-20 text-2xl"
                    />
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-dim mb-4">{user.role || 'Membre'}</p>

                  <div className="w-full space-y-3">
                     {user.email && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                           <Mail className="w-4 h-4 text-dim" />
                           <span className="text-sm text-gray-300">{user.email}</span>
                        </div>
                     )}
                     
                     <button
                        onClick={handleMessage}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                     >
                        <MessageSquare className="w-4 h-4" />
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
