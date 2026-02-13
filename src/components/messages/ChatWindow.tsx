import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Send, MoreVertical, Search, Check, CheckCheck, 
  LayoutDashboard, Target, File, Folder, X, ChevronLeft, Lightbulb
} from 'lucide-react';
import { Contact, Message, MessageAttachment } from '@/types';

interface ChatWindowProps {
  selectedContact: Contact;
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
}

export default function ChatWindow({
  selectedContact,
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
}: ChatWindowProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const newMatches: {msgId: string, index: number}[] = [];
    messages.forEach((msg, idx) => {
      // Use case-insensitive search
      if (msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        newMatches.push({ msgId: msg._id || `msg-${idx}`, index: idx });
      }
    });
    return newMatches;
  }, [searchQuery, messages]);

  // Adjust scroll when not searching
  useEffect(() => {
    if (!isSearchOpen && !searchQuery) {
        scrollToBottom();
    }
  }, [messages, attachments, isSearchOpen, searchQuery]);

  // Handle Search Navigation Reset (Derived State Pattern)
  const [prevMatches, setPrevMatches] = useState(matches);
  // We compare references. matches from useMemo changes only when query/messages change.
  if (matches !== prevMatches) {
    setPrevMatches(matches);
    setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : 0);
  }

  // Scroll to match when index changes
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

  // Helper to highlight text
  const renderMessageContent = (content: string) => {
    if (!searchQuery.trim()) return content;
    
    const parts = content.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={i} className="bg-yellow-500/50 text-white font-bold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };


  return (
    <div className="flex-1 flex flex-col bg-[#0f1115] relative overflow-hidden h-full">
      {/* Header */}
      <div className="h-20 px-4 md:px-6 flex items-center justify-between bg-[#0f1115]/50 backdrop-blur-md z-10 border-b border-white/5">
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans la discussion..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                  title="Précédent"
                >
                    <ChevronLeft className="w-5 h-5 rotate-90" />
                </button>
                <button 
                  onClick={handleNextMatch}
                  disabled={matches.length === 0}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                  title="Suivant"
                >
                    <ChevronLeft className="w-5 h-5 -rotate-90" />
                </button>
             </div>

             <button 
               onClick={closeSearch}
               className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
             >
                <span className="text-sm font-medium">Annuler</span>
             </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 md:gap-4">
              {/* Back Button for Mobile */}
              <button 
                onClick={onBack}
                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-lg shadow-indigo-500/20">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedContact.firstName[0]}{selectedContact.lastName[0]}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0f1115] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h3>
                <p className="text-indigo-400 text-xs font-medium">En ligne</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/grid.svg')] bg-repeat opacity-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-2 ring-1 ring-indigo-500/20">
              <Send className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xl mb-2">Démarrez la conversation</h4>
              <p className="text-gray-500 max-w-xs mx-auto">
                Envoyez un message pour commencer à discuter avec {selectedContact.firstName}.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender === currentUserId;
            // Highlight if this message is the current search result target
            const isHighlighted = matches[currentMatchIndex]?.msgId === (msg._id || `msg-${index}`);
            
            return (
              <motion.div 
                id={`msg-${msg._id || `msg-${index}`}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                key={msg._id || index} 
                className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} ${isHighlighted ? 'bg-indigo-500/10 -mx-4 px-4 py-2 rounded-lg transition-colors duration-500' : ''}`}
              >
                <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`relative px-5 py-3.5 shadow-sm space-y-1 ${
                      isOwn 
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)]' 
                        : 'bg-[#1c1c1e] border border-white/10 text-gray-100 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.content && (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {renderMessageContent(msg.content)}
                      </p>
                    )}
                    
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                       <div className={`${msg.content ? `mt-3 pt-3 border-t ${isOwn ? 'border-white/20' : 'border-white/5'}` : ''} space-y-2`}>
                        {msg.attachments.map((att) => (
                          <div 
                            key={att.id} 
                            onClick={() => {
                              switch(att.type) {
                                case 'task': return router.push(`/projects?taskId=${att.id}`);
                                case 'objective': return router.push(`/objectives?objectiveId=${att.id}`);
                                case 'idea': return router.push(`/ideas?ideaId=${att.id}`);
                                // File/Folder navigation can be added later or just opened
                                case 'folder': return router.push(`/drive?folderId=${att.id}`);
                              }
                            }}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors group/att ${
                              isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isOwn ? 'bg-white/20' : 'bg-indigo-500/20 text-indigo-400'
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

                    <div className={`flex items-center justify-end gap-1.5 pt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                      <span className="text-[10px] font-medium">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && (
                         msg.read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-[#0f1115]/80 backdrop-blur-xl">
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
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs border border-indigo-500/20"
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
              className="p-3.5 rounded-2xl bg-indigo-600/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 bg-white/5 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all border border-white/5 hover:border-white/10">
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
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-2.5 min-h-[46px] max-h-32 focus:outline-none resize-none custom-scrollbar"
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
            className="p-3.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex-shrink-0"
          >
             <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
}
