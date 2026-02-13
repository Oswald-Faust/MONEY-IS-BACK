'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { User as UserIcon, Check, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
}

interface UserSelectorProps {
  value?: string;
  onChange: (userId: string) => void;
  label?: string;
  className?: string;
}

export default function UserSelector({ value, onChange, label = "Assigné à", className = "" }: UserSelectorProps) {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const selectedUser = users.find(u => u._id === value);
  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-4 py-3 
            bg-white/5 border border-white/10 rounded-xl 
            text-white hover:bg-white/10 transition-all
            ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500/50' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            {selectedUser ? (
              <>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedUser.firstName[0]}{selectedUser.lastName[0]}</span>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">Sélectionner un utilisateur</span>
            )}
          </div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#1a1a24] border border-white/10 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar"
              >
                <div className="px-2 pb-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-400">Non assigné</span>
                    {!value && <Check className="w-4 h-4 text-indigo-400 ml-auto" />}
                  </button>

                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => {
                        onChange(user._id);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.firstName[0]}{user.lastName[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-dim truncate max-w-[150px]">
                          {user.email}
                        </span>
                      </div>
                      {value === user._id && <Check className="w-4 h-4 text-indigo-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
