'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { Contact, Message, MessageAttachment, ApiResponse } from '@/types';
import toast from 'react-hot-toast';
import ResourcePicker from '@/components/messages/ResourcePicker';
import ContactList from '@/components/messages/ContactList';
import ChatWindow from '@/components/messages/ChatWindow';
import NewChatModal from '@/components/messages/NewChatModal';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send } from 'lucide-react';

export default function MessagesPage() {
  const { user, token } = useAuthStore();
  const searchParams = useSearchParams();
  
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Helper to add attachments
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
      const response = await fetch('/api/messages/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) return;
      const data: ApiResponse<Contact[]> = await response.json();
      if (data.success && data.data) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?userId=${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) return;
      const data: ApiResponse<Message[]> = await response.json();
      if (data.success && data.data) {
        setMessages(data.data);
        // Mark as read
        await fetch('/api/messages/read', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId: contactId }),
        });
        
        // Update contact unread count locally
        setContacts(prev => prev.map(c => c._id === contactId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 10000); // Poll for new contacts/unread
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !selectedContact || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

  // Filter contacts to show in sidebar:
  // 1. Must have lastMessage
  // OR 2. Must be the currently selected contact (even if no messages yet)
  const activeContacts = contacts.filter(c => 
    c.lastMessage || (selectedContact && c._id === selectedContact._id)
  );
  
  // Further filter by search query in sidebar
  const filteredContacts = activeContacts.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleNewChatSelect = (user: Contact) => {
    setSelectedContact(user);
    // The user will now appear in activeContacts because of the condition (selectedContact && c._id === selectedContact._id)
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0a0a0c] shadow-2xl rounded-tl-3xl border-t border-l border-white/5 relative">
      <ContactList 
        className={`w-full md:w-80 shrink-0 ${selectedContact ? 'hidden md:flex' : 'flex'}`}
        contacts={filteredContacts} 
        selectedContact={selectedContact} 
        onSelectContact={setSelectedContact} 
        onOpenNewChat={() => setShowNewChatModal(true)}
        searchQuery={contactSearch}
        onSearchChange={setContactSearch}
      />

      <div className={`flex-1 flex flex-col min-w-0 ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
        {selectedContact ? (
          <ChatWindow 
            selectedContact={selectedContact}
            messages={messages}
            currentUserId={user?._id || ''}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            isSending={isSending}
            isLoading={isLoadingMessages}
            attachments={attachments}
            onRemoveAttachment={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}
            onOpenResourcePicker={() => setShowResourcePicker(true)}
            onBack={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0f1115] relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
             
             <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(79,70,229,0.1)] relative z-10">
                <MessageCircle className="w-12 h-12 text-indigo-400" />
              </div>
            <div className="text-center px-6 relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Messagerie Interne</h2>
              <p className="max-w-sm text-gray-400 leading-relaxed font-light mx-auto">
                Sélectionnez une conversation ou démarrez-en une nouvelle pour collaborer.
              </p>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="mt-8 px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg shadow-white/10 active:scale-95 flex items-center gap-2 mx-auto"
              >
                <Send className="w-4 h-4" />
                Nouvelle discussion
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSelectUser={handleNewChatSelect}
      />

      <ResourcePicker 
        isOpen={showResourcePicker}
        onClose={() => setShowResourcePicker(false)}
        onSelect={addAttachment}
      />
    </div>
  );
}
