'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { User as UserIcon, Check, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
}

interface UserSelectorProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  className?: string;
  multiple?: boolean;
  projectId?: string;
}

export default function UserSelector({ value, onChange, label = "Assigné à", className = "", multiple = false, projectId }: UserSelectorProps) {
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
        let url = '/api/users';
        if (projectId) {
          url = `/api/projects/members?projectId=${projectId}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          if (projectId) {
            // Transform project members to User structure
            const owner = data.data.owner ? {
              _id: data.data.owner._id,
              firstName: data.data.owner.firstName,
              lastName: data.data.owner.lastName,
              avatar: data.data.owner.avatar,
              email: data.data.owner.email,
            } : null;

            const members = (data.data.members || []).map((m: { user: User }) => {
              if (!m.user) return null;
              return {
                _id: m.user._id,
                firstName: m.user.firstName,
                lastName: m.user.lastName,
                avatar: m.user.avatar,
                email: m.user.email,
              };
            }).filter(Boolean) as User[];

            // Combine owner and members, removing duplicates
            const allUsers = owner ? [owner, ...members] : members;
            const uniqueUsersMap = new Map<string, User>();
            allUsers.forEach((u: User) => {
              uniqueUsersMap.set(u._id, u);
            });
            const uniqueUsers = Array.from(uniqueUsersMap.values());
            setUsers(uniqueUsers);
          } else {
            setUsers(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token, projectId]);

  // Helper to check if a user is selected
  const isSelected = (userId: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(userId);
    }
    return value === userId;
  };

  // Helper to handle selection
  const handleSelect = (userId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      let newValues;
      if (currentValues.includes(userId)) {
        newValues = currentValues.filter(id => id !== userId);
      } else {
        newValues = [...currentValues, userId];
      }
      onChange(newValues);
    } else {
      onChange(userId);
      setIsOpen(false);
    }
  };

  const selectedUsers = users.filter(u => isSelected(u._id));
  
  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${isOpen ? 'z-[70]' : 'z-10'} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-dim mb-2 flex items-center gap-2">
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
            bg-glass-bg border border-glass-border rounded-xl
            text-main hover:bg-glass-hover transition-all
            ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500/60 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]' : ''}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedUsers.length > 0 ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex -space-x-2 overflow-hidden p-1">
                  {selectedUsers.slice(0, 5).map((user) => (
                    <div key={user._id} className="relative w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-[#12121a]">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.firstName} fill className="object-cover" />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName[0]}</span>
                      )}
                    </div>
                  ))}
                  {selectedUsers.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-glass-border flex items-center justify-center text-xs font-bold text-text-muted">
                      +{selectedUsers.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium truncate">
                  {multiple 
                    ? `${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? 's' : ''}`
                    : `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}`
                  }
                </span>
              </div>
            ) : (
              <span className="text-text-muted text-sm italic">Sélectionner {multiple ? 'des utilisateurs' : 'un utilisateur'}</span>
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
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute top-full left-0 right-0 mt-2 p-2 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-white/5 z-[80] max-h-72 overflow-y-auto custom-scrollbar"
              >
                <div className="px-2 pb-2 bg-[var(--bg-secondary)]/95 backdrop-blur-xl sticky top-0 z-10">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-indigo-500/50"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="space-y-1">
                  {!multiple && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange('');
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-hover transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full border border-dashed border-input-border flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-text-muted" />
                      </div>
                      <span className="text-sm text-text-dim">Non assigné</span>
                      {!value && <Check className="w-4 h-4 text-indigo-400 ml-auto" />}
                    </button>
                  )}

                  {filteredUsers.map((user) => {
                    const active = isSelected(user._id);
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelect(user._id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group ${active ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-glass-hover border border-transparent'}`}
                      >
                        <div className="relative">
                          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.firstName} fill className="object-cover" />
                            ) : (
                              <span>{user.firstName[0]}{user.lastName[0]}</span>
                            )}
                          </div>
                          {active && multiple && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-[#12121a] flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-text-main group-hover:text-indigo-500'}`}>
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-text-muted truncate max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                        {active && !multiple && <Check className="w-4 h-4 text-indigo-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
