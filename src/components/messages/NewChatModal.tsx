import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User as UserIcon, Loader2 } from 'lucide-react';
import { Contact, ApiResponse } from '@/types';

import { useAuthStore } from '@/store';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: Contact) => void;
}

export default function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
  const { token } = useAuthStore();
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
            className="w-full max-w-md bg-[#1c1c1e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nouvelle discussion</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-white/10 bg-[#1c1c1e]/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  {searchQuery ? (
                     <div className="text-gray-500 text-sm">
                         Aucun utilisateur trouvé pour &quot;{searchQuery}&quot;
                     </div>
                  ) : (
                    <div className="text-gray-500 text-sm max-w-[200px]">
                      Aucun autre utilisateur disponible.
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
                    className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
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
