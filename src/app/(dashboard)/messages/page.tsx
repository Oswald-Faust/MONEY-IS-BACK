'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Send, Paperclip, X, Check, CheckCheck, LayoutDashboard, Target, File, Folder, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Contact, Message, MessageAttachment, ApiResponse } from '@/types';
import toast from 'react-hot-toast';
import ResourcePicker from '@/components/messages/ResourcePicker';
import { useSearchParams } from 'next/navigation';

// Simplified components for now, will move to separate files later
const ContactList = ({ 
  contacts, 
  selectedContact, 
  onSelectContact,
  searchQuery,
  onSearchChange
}: { 
  contacts: Contact[], 
  selectedContact: Contact | null, 
  onSelectContact: (contact: Contact) => void,
  searchQuery: string,
  onSearchChange: (query: string) => void
}) => {
  return (
    <div className="flex flex-col h-full bg-secondary border-r border-glass-border w-80">
      <div className="p-4 border-b border-glass-border">
        <h2 className="text-xl font-bold text-main mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-sm text-main placeholder-dim focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-dim text-sm italic">
            Aucun utilisateur trouvé
          </div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact._id}
              onClick={() => onSelectContact(contact)}
              className={`w-full p-4 flex items-center gap-3 transition-colors hover:bg-glass-hover ${
                selectedContact?._id === contact._id ? 'bg-indigo-500/10' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{contact.firstName[0]}{contact.lastName[0]}</span>
                  )}
                </div>
                {contact.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-secondary font-bold">
                    {contact.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-main truncate">
                    {contact.firstName} {contact.lastName}
                  </span>
                  {contact.lastMessage && (
                    <span className="text-[10px] text-dim">
                      {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-dim truncate">
                  {contact.lastMessage?.content || 'Nouvelle conversation'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const addAttachment = React.useCallback((type: MessageAttachment['type'], id: string, name: string) => {
    setAttachments(prev => {
      if (prev.some(a => a.id === id)) return prev;
      return [...prev, { type, id, name }];
    });
  }, []);

  // Handle shared resources from other pages
  useEffect(() => {
    const shareType = searchParams.get('shareType') as MessageAttachment['type'];
    const shareId = searchParams.get('shareId');
    const shareName = searchParams.get('shareName');

    if (shareType && shareId && shareName) {
      addAttachment(shareType, shareId, shareName);
      // Clear URL params without reloading
      window.history.replaceState({}, '', '/messages');
    }
  }, [searchParams, addAttachment]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/messages/contacts');
      const data: ApiResponse<Contact[]> = await response.json();
      if (data.success && data.data) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages?userId=${contactId}`);
      const data: ApiResponse<Message[]> = await response.json();
      if (data.success && data.data) {
        setMessages(data.data);
        // Mark as read
        await fetch('/api/messages/read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: contactId }),
        });
        // Update contact unread count locally
        setContacts(prev => prev.map(c => c._id === contactId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 10000); // Poll for new contacts/unread
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    }
  }, [selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !selectedContact || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedContact._id,
          content: newMessage,
          attachments,
        }),
      });
      const data: ApiResponse<Message> = await response.json();
      if (data.success && data.data) {
        setMessages(prev => [...prev, data.data!]);
        setNewMessage('');
        setAttachments([]);
        fetchContacts(); // Update last message in sidebar
      }
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <ContactList 
        contacts={filteredContacts} 
        selectedContact={selectedContact} 
        onSelectContact={setSelectedContact} 
        searchQuery={contactSearch}
        onSearchChange={setContactSearch}
      />

      <div className="flex-1 flex flex-col bg-primary">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-glass-border flex items-center justify-between bg-secondary/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedContact.firstName[0]}{selectedContact.lastName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-main">{selectedContact.firstName} {selectedContact.lastName}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <p className="text-[10px] text-dim font-medium uppercase tracking-wider">En ligne</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl bg-glass-bg border border-glass-border text-dim hover:text-main hover:bg-glass-hover transition-all">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl bg-glass-bg border border-glass-border text-dim hover:text-main hover:bg-glass-hover transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-dim">
                  <div className="w-20 h-20 rounded-3xl bg-glass-bg border border-glass-border flex items-center justify-center mb-4 text-indigo-500/30">
                    <Send className="w-10 h-10" />
                  </div>
                  <h4 className="text-main font-semibold">Pas encore de messages</h4>
                  <p className="text-sm">Envoyez le premier message à {selectedContact.firstName} !</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                            : 'bg-secondary border border-glass-border text-main rounded-tl-none'
                        }`}>
                          {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                          
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`${msg.content ? 'mt-3 pt-3 border-t border-white/10' : ''} space-y-2`}>
                              {msg.attachments.map((att) => (
                                <div 
                                  key={att.id} 
                                  className={`flex items-center gap-3 p-3 rounded-xl text-xs transition-colors cursor-pointer group/att ${
                                    isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-glass-bg hover:bg-glass-hover'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isOwn ? 'bg-white/20' : 'bg-indigo-500/10 text-indigo-400'
                                  }`}>
                                    {att.type === 'task' && <LayoutDashboard className="w-4 h-4" />}
                                    {att.type === 'objective' && <Target className="w-4 h-4" />}
                                    {att.type === 'file' && <File className="w-4 h-4" />}
                                    {att.type === 'folder' && <Folder className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{att.name}</p>
                                    <p className={`text-[10px] opacity-60 uppercase font-medium mt-0.5`}>{att.type}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className={`flex items-center justify-end gap-1.5 mt-2`}>
                            <span className={`text-[10px] font-medium ${isOwn ? 'text-white/60' : 'text-dim'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-indigo-200/60" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-secondary/30 backdrop-blur-xl border-t border-glass-border">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {attachments.map((att) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={att.id} 
                      className="flex items-center gap-2.5 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-2xl text-xs border border-indigo-500/20 group/tag"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="font-bold">{att.name}</span>
                      <button 
                        onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                        className="p-1 hover:bg-indigo-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setShowResourcePicker(true)}
                  className="p-3.5 rounded-2xl bg-glass-bg border border-glass-border text-dim hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex-shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-glass-bg border border-glass-border text-main placeholder-dim rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                />
                
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
                  className="p-3.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:grayscale transition-all shadow-[0_8px_20px_rgba(79,70,229,0.3)] flex-shrink-0"
                >
                  <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-dim bg-[radial-gradient(circle_at_center,_var(--glass-bg)_0%,_transparent_70%)]">
            <div className="w-28 h-28 rounded-[2rem] bg-glass-bg border border-glass-border flex items-center justify-center mb-6 shadow-2xl animate-bounce-slow">
              <MessageCircle className="w-14 h-14 text-indigo-500/40" />
            </div>
            <div className="text-center px-6">
              <h2 className="text-2xl font-bold text-main mb-2">Messagerie Interne</h2>
              <p className="max-w-sm text-dim leading-relaxed">
                Collaborez en temps réel, partagez vos objectifs, tâches et ressources Drive en un clic.
              </p>
              <div className="mt-8 flex gap-3">
                <div className="px-4 py-2 rounded-xl bg-glass-bg border border-glass-border text-xs font-medium">✨ Ultra Rapide</div>
                <div className="px-4 py-2 rounded-xl bg-glass-bg border border-glass-border text-xs font-medium">🔒 Sécurisé</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ResourcePicker 
        isOpen={showResourcePicker}
        onClose={() => setShowResourcePicker(false)}
        onSelect={addAttachment}
      />
    </div>
  );
}
