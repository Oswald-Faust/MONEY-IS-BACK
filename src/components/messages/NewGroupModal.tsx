import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, Loader2, Check } from 'lucide-react';
import { Contact, ApiResponse } from '@/types';
import { useAuthStore } from '@/store';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: string) => void;
  workspaceId: string;
}

export default function NewGroupModal({ isOpen, onClose, onGroupCreated, workspaceId }: NewGroupModalProps) {
  const { token } = useAuthStore();
  const [step, setStep] = useState<'members' | 'name'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Contact[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('members');
      setSearchQuery('');
      setSelectedUsers([]);
      setGroupName('');
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
      const endpoint = query
        ? `/api/users?q=${encodeURIComponent(query)}`
        : `/api/users`;

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
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

  const toggleUser = (user: Contact) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === user._id);
      if (exists) {
        return prev.filter(u => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const handleNext = () => {
    if (selectedUsers.length < 1) return;
    // Auto-generate group name from members
    if (!groupName) {
      const names = selectedUsers.map(u => u.firstName).slice(0, 3);
      setGroupName(names.join(', ') + (selectedUsers.length > 3 ? '...' : ''));
    }
    setStep('name');
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 1 || isCreating) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName.trim(),
          workspaceId,
          memberIds: selectedUsers.map(u => u._id),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onGroupCreated(data.data._id);
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
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
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step === 'name' && (
                  <button
                    onClick={() => setStep('members')}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4 rotate-45" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {step === 'members' ? 'Nouveau groupe' : 'Nom du groupe'}
                  </h2>
                  {step === 'members' && selectedUsers.length > 0 && (
                    <p className="text-xs text-indigo-400">{selectedUsers.length} membre{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'members' ? (
              <>
                {/* Selected members pills */}
                {selectedUsers.length > 0 && (
                  <div className="px-4 pt-3 flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <button
                        key={user._id}
                        onClick={() => toggleUser(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                      >
                        <span>{user.firstName} {user.lastName}</span>
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher des membres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* User list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[200px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-8">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500 text-sm">Aucun utilisateur trouvé</p>
                    </div>
                  ) : (
                    users.map((user) => {
                      const isSelected = selectedUsers.some(u => u._id === user._id);
                      return (
                        <button
                          key={user._id}
                          onClick={() => toggleUser(user)}
                          className={`w-full p-3 flex items-center gap-3 rounded-xl transition-colors group text-left ${
                            isSelected ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-white/20 group-hover:border-white/40'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Next button */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={handleNext}
                    disabled={selectedUsers.length < 1}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    Suivant
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Group name step */}
                <div className="p-6 space-y-6">
                  {/* Group icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Name input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nom du groupe
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Ex: Équipe Marketing"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      autoFocus
                      maxLength={100}
                    />
                  </div>

                  {/* Member count */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{selectedUsers.length + 1} membres (vous inclus)</span>
                  </div>

                  {/* Members preview */}
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user._id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] text-white font-bold overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          )}
                        </div>
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create button */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || isCreating}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Créer le groupe
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
