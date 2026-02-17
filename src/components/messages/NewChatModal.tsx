import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User as UserIcon, Loader2 } from 'lucide-react';
import { Contact, ApiResponse } from '@/types';
import { useTranslation } from '@/lib/i18n';

import { useAuthStore } from '@/store';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: Contact) => void;
}

export default function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
  const { token } = useAuthStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial fetch and search
  useEffect(() => {
    if (!isOpen) { 
        setSearchQuery('');
        return; 
    }

    const timer = setTimeout(() => {
        fetchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const fetchUsers = async (query: string) => {
    setIsLoading(true);
    try {
      // Use query param if searching, otherwise simple fetch
      const endpoint = query 
        ? `/api/users?q=${encodeURIComponent(query)}` 
        : `/api/users`;
      
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data: ApiResponse<Contact[]> = await res.json();
      
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-bg-secondary rounded-2xl shadow-2xl border border-glass-border overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-glass-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-main">{t.modals.chat.newDiscussion}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
                title={t.modals.chat.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-glass-border bg-bg-tertiary/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder={t.modals.chat.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-glass-border rounded-xl text-sm text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-text-muted" />
                  </div>
                  {searchQuery ? (
                     <div className="text-text-muted text-sm">
                         {t.modals.chat.noUserFound} &quot;{searchQuery}&quot;
                     </div>
                  ) : (
                    <div className="text-text-muted text-sm max-w-[200px]">
                      {t.modals.chat.noUsersAvailable}
                    </div>
                  )}
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-glass-hover transition-colors group text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-main truncate group-hover:text-accent-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
