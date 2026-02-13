
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfileModal } from '@/components/modals';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { User } from '@/types';

interface UserHoverCardProps {
  user: Partial<User> & { firstName: string; lastName: string; _id: string };
  children: React.ReactNode;
}

export default function UserHoverCard({ user, children }: UserHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { token } = useAuthStore();
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/messages?userId=${user._id}`);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // If sending, don't auto-close
    if (isSending) return;
    
    closeTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        // Reset state after closing
        setTimeout(() => setShowQuickMessage(false), 300);
    }, 300); // 300ms grace period
  };

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!message.trim() || isSending) return;

    if (!token) {
        toast.error("Vous devez être connecté");
        return;
    }

    try {
        setIsSending(true);
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipientId: user._id,
                content: message
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            toast.success("Message envoyé !");
            setMessage('');
            setShowQuickMessage(false);
            setIsHovered(false); 
        } else {
            toast.error("Erreur lors de l'envoi");
            setIsSending(false); // Keep open if error
        }
    } catch {
        toast.error("Erreur réseau");
        setIsSending(false);
    }
  };

  return (
    <>
      <div 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer"
        >
            {children}
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50 min-w-[280px]" 
            >
              {/* Invisible bridge to handle gap if any, though bottom-full + mb-2 creates gap. 
                  We can make the div taller or just rely on timeout. Timeout is safer. */}
                  
              <div 
                className="glass-card p-4 shadow-2xl border border-white/10 bg-[#0F0F0F] relative backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                 {/* Arrow */}
                <div className="absolute left-6 -bottom-1.5 w-3 h-3 bg-[#0F0F0F] border-r border-b border-white/10 rotate-45 z-0" />
                
                <div className="relative z-10">
                    {!showQuickMessage ? (
                        <>
                            <div className="flex items-start gap-3 mb-3">
                                <Avatar 
                                    src={user.avatar} 
                                    fallback={user.firstName} 
                                    color={user.profileColor}
                                    size="md"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate">
                                    {user.firstName} {user.lastName}
                                    </h4>
                                    <p className="text-xs text-dim truncate">
                                    {user.email || 'Membre'}
                                    </p>
                                    <p className="text-[10px] text-indigo-400 mt-0.5 uppercase tracking-wider font-bold">
                                        {user.role === 'admin' ? 'Admin' : 'Membre'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowQuickMessage(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors border border-white/5"
                                >
                                    <MessageSquare className="w-3 h-3" />
                                    Écrire
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                                >
                                    Discussion
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleQuickSend} className="space-y-2">
                            <div className="flex items-center justify-between pb-1 border-b border-white/5">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <MessageSquare className="w-3 h-3 text-indigo-400" />
                                    Message à {user.firstName}
                                </span>
                                <button 
                                    type="button"
                                    onClick={() => setShowQuickMessage(false)}
                                    className="text-dim hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            
                            <textarea
                                autoFocus
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Votre message..."
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-dim focus:outline-none focus:border-indigo-500/50 resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleQuickSend(e);
                                    }
                                    e.stopPropagation(); // Prevent event bubbling
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            
                            <button
                                type="submit"
                                disabled={!message.trim() || isSending}
                                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-3 h-3" />
                                        Envoyer
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UserProfileModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         user={user}
      />
    </>
  );
}
