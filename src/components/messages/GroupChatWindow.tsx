import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Send, MoreVertical, Search, Users,
  LayoutDashboard, Target, File, Folder, X, ChevronLeft, Lightbulb, Trash2,
  UserPlus, LogOut, Settings
} from 'lucide-react';
import { Conversation, Message, MessageAttachment, User } from '@/types';

interface GroupChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  newMessage: string;
  onNewMessageChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
  isLoading: boolean;
  attachments: MessageAttachment[];
  onRemoveAttachment: (id: string) => void;
  onOpenResourcePicker: () => void;
  onBack?: () => void;
  onDeleteMessage: () => void;
  token: string;
  onLeaveGroup?: () => void;
}

export default function GroupChatWindow({
  conversation,
  messages,
  currentUserId,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  isSending,
  isLoading,
  attachments,
  onRemoveAttachment,
  onOpenResourcePicker,
  onBack,
  onDeleteMessage,
  token,
  onLeaveGroup,
}: GroupChatWindowProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Delete State
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  const handleDeleteMessage = async (deleteForEveryone: boolean) => {
    if (!messageToDelete) return;

    try {
      const response = await fetch(`/api/messages/${messageToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ deleteForEveryone }),
      });

      if (response.ok) {
        onDeleteMessage();
      }
    } catch (e) {
      console.error(e);
    }

    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const newMatches: { msgId: string; index: number }[] = [];
    messages.forEach((msg, idx) => {
      if (msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        newMatches.push({ msgId: msg._id || `msg-${idx}`, index: idx });
      }
    });
    return newMatches;
  }, [searchQuery, messages]);

  useEffect(() => {
    if (!isSearchOpen && !searchQuery) {
      scrollToBottom();
    }
  }, [messages, attachments, isSearchOpen, searchQuery]);

  const [prevMatches, setPrevMatches] = useState(matches);
  if (matches !== prevMatches) {
    setPrevMatches(matches);
    setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : 0);
  }

  useEffect(() => {
    if (matches.length > 0 && matches[currentMatchIndex]) {
      const msgId = matches[currentMatchIndex].msgId;
      const element = document.getElementById(`msg-${msgId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, matches]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const renderMessageContent = (content: string) => {
    if (!searchQuery.trim()) return content;

    const parts = content.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={i} className="bg-yellow-500/30 text-amber-900 dark:text-amber-200 font-bold px-0.5 rounded border border-amber-500/20">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Get sender info from conversation members
  const getSenderInfo = (senderId: string | User): { firstName: string; lastName: string; avatar?: string; profileColor?: string } => {
    if (typeof senderId === 'object' && senderId !== null) {
      return senderId as User;
    }
    const member = conversation.members.find(m => {
      const userId = typeof m.user === 'object' ? (m.user as User)._id : m.user;
      return userId === senderId;
    });
    if (member && typeof member.user === 'object') {
      return member.user as User;
    }
    return { firstName: '?', lastName: '' };
  };

  const memberCount = conversation.members.length;

  return (
    <div className="flex-1 flex flex-col bg-bg-primary relative overflow-hidden h-full">
      {/* Header */}
      <div className="h-20 px-4 md:px-6 flex items-center justify-between bg-bg-secondary/50 backdrop-blur-md z-10 border-b border-glass-border">
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans la discussion..."
                className="w-full bg-bg-tertiary border border-glass-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                autoFocus
              />
              {matches.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  {currentMatchIndex + 1} / {matches.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMatch}
                disabled={matches.length === 0}
                className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-glass-hover disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 rotate-90" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={matches.length === 0}
                className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-glass-hover disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 -rotate-90" />
              </button>
            </div>

            <button
              onClick={closeSearch}
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-glass-hover transition-colors"
            >
              <span className="text-sm font-medium">Annuler</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={onBack}
                className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                  <Users className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-text-main text-lg tracking-tight">
                  {conversation.name}
                </h3>
                <button
                  onClick={() => setShowMembersPanel(!showMembersPanel)}
                  className="text-accent-primary text-xs font-medium hover:underline transition-colors"
                >
                  {memberCount} membre{memberCount > 1 ? 's' : ''}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-glass-hover transition-colors"
                title="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMembersPanel(!showMembersPanel)}
                className="p-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-glass-hover transition-colors"
                title="Membres"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/grid.svg')] bg-repeat opacity-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-3xl bg-accent-primary/10 flex items-center justify-center mb-2 ring-1 ring-accent-primary/20">
                <Users className="w-10 h-10 text-accent-primary" />
              </div>
              <div>
                <h4 className="text-text-main font-bold text-xl mb-2">Groupe créé !</h4>
                <p className="text-text-muted max-w-xs mx-auto">
                  Envoyez un message pour démarrer la conversation de groupe.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const senderId = typeof msg.sender === 'object' ? (msg.sender as User)._id : msg.sender;
              const isOwn = senderId === currentUserId;
              const senderInfo = getSenderInfo(msg.sender);
              const isHighlighted = matches[currentMatchIndex]?.msgId === (msg._id || `msg-${index}`);

              // Show sender name if different from previous message
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const prevSenderId = prevMsg
                ? typeof prevMsg.sender === 'object' ? (prevMsg.sender as User)._id : prevMsg.sender
                : null;
              const showSenderName = !isOwn && senderId !== prevSenderId;

              return (
                <motion.div
                  id={`msg-${msg._id || `msg-${index}`}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={msg._id || index}
                  className={`flex w-full group/msg ${isOwn ? 'justify-end' : 'justify-start'} ${isHighlighted ? 'bg-accent-primary/10 -mx-4 px-4 py-2 rounded-lg transition-colors duration-500' : ''}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for other users */}
                    {!isOwn && showSenderName && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-5 overflow-hidden">
                        {senderInfo.avatar ? (
                          <img src={senderInfo.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{senderInfo.firstName[0]}{senderInfo.lastName[0]}</span>
                        )}
                      </div>
                    )}
                    {!isOwn && !showSenderName && <div className="w-8 flex-shrink-0" />}

                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {/* Sender name */}
                      {showSenderName && (
                        <span className="text-xs text-accent-primary font-medium mb-1 px-1">
                          {senderInfo.firstName} {senderInfo.lastName}
                        </span>
                      )}

                      <div
                        className={`relative px-5 py-3.5 shadow-sm space-y-1 group ${
                          isOwn
                            ? 'bg-accent-primary text-white rounded-2xl rounded-tr-sm shadow-md'
                            : 'bg-bg-secondary border border-glass-border text-text-main rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        {!msg.deletedForEveryone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageToDelete(msg);
                              setShowDeleteModal(true);
                            }}
                            className={`absolute -top-2 ${isOwn ? '-left-2' : '-right-2'} p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 hover:scale-100 z-10`}
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        {msg.deletedForEveryone ? (
                          <p className="text-[13px] italic opacity-60 flex items-center gap-2 py-1">
                            <Trash2 className="w-3 h-3" />
                            Ce message a été supprimé
                          </p>
                        ) : (
                          <>
                            {msg.content && (
                              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                {renderMessageContent(msg.content)}
                              </p>
                            )}

                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className={`${msg.content ? `mt-3 pt-3 border-t ${isOwn ? 'border-white/20' : 'border-white/5'}` : ''} space-y-2`}>
                                {msg.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    onClick={() => {
                                      switch (att.type) {
                                        case 'task': return router.push(`/tasks/${att.id}`);
                                        case 'objective': return router.push(`/objectives/${att.id}`);
                                        case 'idea': return router.push(`/ideas/${att.id}`);
                                        case 'folder': return router.push(`/drive?folderId=${att.id}`);
                                      }
                                    }}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors group/att ${
                                      isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isOwn ? 'bg-white/20' : 'bg-accent-primary/10 text-accent-primary'
                                    }`}>
                                      {att.type === 'task' && <LayoutDashboard className="w-4 h-4" />}
                                      {att.type === 'objective' && <Target className="w-4 h-4" />}
                                      {att.type === 'idea' && <Lightbulb className="w-4 h-4" />}
                                      {att.type === 'file' && <File className="w-4 h-4" />}
                                      {att.type === 'folder' && <Folder className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs truncate">{att.name}</p>
                                      <p className="text-[10px] opacity-70 uppercase font-medium">{att.type}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        <div className={`flex items-center justify-end gap-1.5 pt-1 ${isOwn ? 'text-white/70' : 'text-text-muted'}`}>
                          <span className="text-[10px] font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Members Panel */}
        <AnimatePresence>
          {showMembersPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-glass-border bg-bg-secondary overflow-hidden flex-shrink-0"
            >
              <div className="w-[280px] h-full flex flex-col">
                <div className="p-4 border-b border-glass-border flex items-center justify-between">
                  <h3 className="font-bold text-text-main text-sm">Membres ({memberCount})</h3>
                  <button
                    onClick={() => setShowMembersPanel(false)}
                    className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-glass-hover transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {conversation.members.map((member) => {
                    const memberUser = typeof member.user === 'object' ? member.user as User : null;
                    if (!memberUser) return null;

                    return (
                      <div
                        key={memberUser._id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-glass-hover transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                          {memberUser.avatar ? (
                            <img src={memberUser.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{memberUser.firstName?.[0]}{memberUser.lastName?.[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-main font-medium truncate">
                            {memberUser.firstName} {memberUser.lastName}
                            {memberUser._id === currentUserId && (
                              <span className="text-accent-primary text-xs ml-1">(vous)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-text-muted uppercase font-medium">{member.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Leave group button */}
                {conversation.creator !== currentUserId && onLeaveGroup && (
                  <div className="p-3 border-t border-glass-border">
                    <button
                      onClick={onLeaveGroup}
                      className="w-full py-2 px-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Quitter le groupe
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-5 bg-bg-secondary/80 backdrop-blur-xl border-t border-glass-border">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-2 mb-3 overflow-hidden"
            >
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-accent-primary/10 text-accent-primary rounded-lg text-xs border border-accent-primary/20"
                >
                  <span className="font-medium">{att.name}</span>
                  <button
                    onClick={() => onRemoveAttachment(att.id)}
                    className="p-0.5 hover:bg-indigo-500/20 rounded-md transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpenResourcePicker}
              className="p-3.5 rounded-2xl bg-accent-primary/10 text-accent-primary hover:text-accent-primary hover:bg-accent-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 bg-bg-tertiary rounded-2xl p-1 focus-within:ring-2 focus-within:ring-accent-primary/30 transition-all border border-glass-border">
            <textarea
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(e);
                }
              }}
              placeholder="Écrivez votre message..."
              className="w-full bg-transparent text-text-main placeholder-text-muted px-4 py-2.5 min-h-[46px] max-h-32 focus:outline-none resize-none custom-scrollbar"
              rows={1}
            />
          </div>

          <button
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
            className="p-3.5 rounded-2xl bg-accent-primary text-white hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-accent-primary/20 active:scale-95 flex-shrink-0"
          >
            <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-bg-secondary rounded-2xl p-6 border border-glass-border shadow-xl"
            >
              <h3 className="text-lg font-bold text-text-main mb-2">Supprimer le message ?</h3>
              <p className="text-text-muted text-sm mb-6">Cette action est irréversible.</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteMessage(false)}
                  className="w-full py-3 rounded-xl bg-bg-tertiary hover:bg-glass-hover text-text-main font-medium transition-colors"
                >
                  Supprimer pour moi
                </button>
                {messageToDelete && (typeof messageToDelete.sender === 'object'
                  ? (messageToDelete.sender as User)._id === currentUserId
                  : messageToDelete.sender === currentUserId) && (
                  <button
                    onClick={() => handleDeleteMessage(true)}
                    className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors"
                  >
                    Supprimer pour tout le monde
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-2 text-text-muted hover:text-text-main text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
