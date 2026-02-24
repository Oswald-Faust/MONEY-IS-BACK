
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] min-w-[280px]" 
            >
              {/* Invisible bridge to handle gap if any, though bottom-full + mb-2 creates gap. 
                  We can make the div taller or just rely on timeout. Timeout is safer. */}
                  
              <div 
                className="glass-card p-5 shadow-2xl border border-glass-border bg-bg-secondary relative backdrop-blur-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Arrow - Centered at Top */}
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-bg-secondary border-l border-t border-glass-border rotate-45 z-0 shadow-lg" />
                
                <div className="relative z-10">
                    {!showQuickMessage ? (
                        <>
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar 
                                    src={user.avatar} 
                                    fallback={user.firstName} 
                                    color={user.profileColor}
                                    size="md"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-text-main truncate">
                                    {user.firstName} {user.lastName}
                                    </h4>
                                    <p className="text-xs text-text-dim break-all mt-0.5">
                                    {user.email || 'Membre du projet'}
                                    </p>
                                    <p className="text-[10px] text-accent-primary mt-1 uppercase tracking-widest font-bold">
                                        {user.role === 'admin' ? 'Administrateur' : 'Membre'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowQuickMessage(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-bg-tertiary hover:bg-glass-hover text-text-main text-xs font-semibold transition-colors border border-glass-border"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Message
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent-primary hover:opacity-90 text-white text-xs font-semibold transition-all shadow-lg shadow-accent-primary/20"
                                >
                                    Discussion
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleQuickSend} className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-glass-border">
                                <span className="text-xs font-bold text-text-main flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-accent-primary" />
                                    Message à {user.firstName}
                                </span>
                                <button 
                                    type="button"
                                    onClick={() => setShowQuickMessage(false)}
                                    className="text-text-muted hover:text-text-main transition-colors p-1.5 hover:bg-glass-hover rounded-lg"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <textarea
                                autoFocus
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Votre message..."
                                rows={2}
                                className="w-full bg-bg-tertiary border border-glass-border rounded-lg p-2.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 resize-none transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleQuickSend(e);
                                    }
                                    e.stopPropagation(); 
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
