'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, Send, Paperclip, X, Check, CheckCheck, User, LayoutDashboard, Target, File, Folder } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import { Contact, Message, MessageAttachment, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

// Simplified components for now, will move to separate files later
const ContactList = ({ 
  contacts, 
  selectedContact, 
  onSelectContact 
}: { 
  contacts: Contact[], 
  selectedContact: Contact | null, 
  onSelectContact: (contact: Contact) => void 
}) => {
  return (
    <div className="flex flex-col h-full bg-secondary border-r border-glass-border w-80">
      <div className="p-4 border-b border-glass-border">
        <h2 className="text-xl font-bold text-main mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            className="w-full pl-10 pr-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-sm text-main placeholder-dim focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
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
                {contact.lastMessage?.content || 'Aucun message'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

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
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const addAttachment = (type: MessageAttachment['type'], id: string, name: string) => {
    if (attachments.some(a => a.id === id)) return;
    setAttachments(prev => [...prev, { type, id, name }]);
    setShowAttachmentMenu(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <ContactList 
        contacts={contacts} 
        selectedContact={selectedContact} 
        onSelectContact={setSelectedContact} 
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
                  <p className="text-[10px] text-green-500">En ligne</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-dim hover:text-main transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-dim hover:text-main transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-dim">
                  <div className="w-16 h-16 rounded-full bg-glass-bg flex items-center justify-center mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <p>Aucun message. Commencez la discussion !</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.sender === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                        <div className={`p-3 rounded-2xl ${
                          isOwn 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-glass-bg border border-glass-border text-main rounded-tl-none'
                        }`}>
                          {msg.content && <p className="text-sm">{msg.content}</p>}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att) => (
                                <div key={att.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs bg-black/10`}>
                                  {att.type === 'task' && <Check className="w-3 h-3" />}
                                  {att.type === 'objective' && <Target className="w-3 h-3" />}
                                  {att.type === 'file' && <File className="w-3 h-3" />}
                                  {att.type === 'folder' && <Folder className="w-3 h-3" />}
                                  <span className="font-medium truncate">{att.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className={`flex items-center justify-end gap-1 mt-1`}>
                            <span className={`text-[9px] ${isOwn ? 'text-white/60' : 'text-dim'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              msg.read ? <CheckCheck className="w-3 h-3 text-indigo-200" /> : <Check className="w-3 h-3 text-indigo-200" />
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
            <div className="p-4 border-t border-glass-border bg-secondary/30">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                      {att.type === 'task' && <Check className="w-3 h-3" />}
                      <span className="font-medium">{att.name}</span>
                      <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}>
                        <X className="w-3 h-3 hover:text-indigo-300" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-2 rounded-full bg-glass-bg border border-glass-border text-dim hover:text-main transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showAttachmentMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-2 w-48 bg-secondary border border-glass-border rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-2 space-y-1">
                          <button 
                            type="button"
                            onClick={() => addAttachment('task', 'dummy-task', 'Tâche: Ma super tâche')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dim hover:bg-glass-hover hover:text-main rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Tâche
                          </button>
                          <button 
                            type="button"
                            onClick={() => addAttachment('objective', 'dummy-obj', 'Objectif: Croissance')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dim hover:bg-glass-hover hover:text-main rounded-lg transition-colors"
                          >
                            <Target className="w-4 h-4" /> Objectif
                          </button>
                          <button 
                            type="button"
                            onClick={() => addAttachment('file', 'dummy-file', 'budget.pdf')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dim hover:bg-glass-hover hover:text-main rounded-lg transition-colors"
                          >
                            <File className="w-4 h-4" /> Fichier Drive
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-glass-bg border border-glass-border text-main placeholder-dim rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
                  className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-dim space-y-4">
            <div className="w-24 h-24 rounded-full bg-glass-bg flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-indigo-500/50" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-main">Bienvenue dans votre messagerie</h2>
              <p className="max-w-xs mx-auto mt-2">Sélectionnez un contact pour commencer à discuter ou partager des ressources.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { MessageCircle } from 'lucide-react';
