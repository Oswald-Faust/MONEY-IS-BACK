'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { Contact, Message, MessageAttachment, ApiResponse, Conversation } from '@/types';
import toast from 'react-hot-toast';
import ResourcePicker from '@/components/messages/ResourcePicker';
import ContactList from '@/components/messages/ContactList';
import ChatWindow from '@/components/messages/ChatWindow';
import GroupChatWindow from '@/components/messages/GroupChatWindow';
import NewChatModal from '@/components/messages/NewChatModal';
import NewGroupModal from '@/components/messages/NewGroupModal';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send, Users } from 'lucide-react';

export default function MessagesPage() {
  const { user, token } = useAuthStore();
  const { currentWorkspace } = useAppStore();
  const searchParams = useSearchParams();

  // State - Direct Messages
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

  // State - Group Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

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
      window.history.replaceState({}, '', '/messages');
    }
  }, [searchParams, addAttachment]);

  // ── Direct Messages ──

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/messages/contacts', {
        headers: { 'Authorization': `Bearer ${token}` },
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) return;
      const data: ApiResponse<Message[]> = await response.json();
      if (data.success && data.data) {
        setMessages(data.data);
        await fetch('/api/messages/read', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId: contactId }),
        });
        setContacts(prev => prev.map(c => c._id === contactId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // ── Group Conversations ──

  const fetchConversations = async () => {
    try {
      const url = currentWorkspace
        ? `/api/conversations?workspaceId=${currentWorkspace._id}`
        : '/api/conversations';
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) return;
      const data: ApiResponse<Conversation[]> = await response.json();
      if (data.success && data.data) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchGroupMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) return;
      const data: ApiResponse<Message[]> = await response.json();
      if (data.success && data.data) {
        setGroupMessages(data.data);
        setConversations(prev =>
          prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // ── Polling & Effects ──

  useEffect(() => {
    fetchContacts();
    fetchConversations();
    const interval = setInterval(() => {
      fetchContacts();
      fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentWorkspace]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedConversation) {
      fetchGroupMessages(selectedConversation._id);
    } else {
      setGroupMessages([]);
    }
  }, [selectedConversation]);

  // ── Send Handlers ──

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
        fetchContacts();
      }
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage,
          attachments,
        }),
      });
      const data: ApiResponse<Message> = await response.json();
      if (data.success && data.data) {
        setGroupMessages(prev => [...prev, data.data!]);
        setNewMessage('');
        setAttachments([]);
        fetchConversations();
      }
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  // ── Selection Handlers ──

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setSelectedConversation(null);
    setNewMessage('');
    setAttachments([]);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedContact(null);
    setNewMessage('');
    setAttachments([]);
  };

  const handleBack = () => {
    setSelectedContact(null);
    setSelectedConversation(null);
  };

  const handleGroupCreated = async (conversationId: string) => {
    await fetchConversations();
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        handleSelectConversation(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedConversation || !user) return;
    try {
      const response = await fetch(`/api/conversations/${selectedConversation._id}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ memberId: user._id }),
      });
      if (response.ok) {
        setSelectedConversation(null);
        fetchConversations();
        toast.success('Vous avez quitté le groupe');
      }
    } catch {
      toast.error('Erreur lors de la sortie du groupe');
    }
  };

  // Handle userId from URL to start chat with specific user
  useEffect(() => {
    const userId = searchParams.get('userId');

    if (userId && token) {
      if (selectedContact?._id === userId) return;

      const existingContact = contacts.find(c => c._id === userId);

      if (existingContact) {
        handleSelectContact(existingContact);
      } else {
        const fetchUser = async () => {
          try {
            const res = await fetch(`/api/users/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success && data.data) {
              const newContact = {
                ...data.data,
                unreadCount: 0
              };

              setContacts(prev => {
                if (prev.find(c => c._id === userId)) return prev;
                return [newContact, ...prev];
              });
              handleSelectContact(newContact);
            }
          } catch (err) {
            console.error("Failed to fetch user for chat", err);
            toast.error("Impossible de charger l'utilisateur");
          }
        };
        fetchUser();
      }
    }
  }, [searchParams, contacts, selectedContact, token]);

  // Filter contacts to show in sidebar
  const activeContacts = contacts.filter(c =>
    c.lastMessage || (selectedContact && c._id === selectedContact._id)
  );

  const filteredContacts = activeContacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleNewChatSelect = (userContact: Contact) => {
    handleSelectContact(userContact);
  };

  const hasSelection = selectedContact || selectedConversation;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-bg-primary shadow-2xl rounded-tl-3xl border-t border-l border-glass-border relative">
      <ContactList
        className={`w-full md:w-80 shrink-0 border-r border-glass-border ${hasSelection ? 'hidden md:flex' : 'flex'}`}
        contacts={filteredContacts}
        conversations={conversations}
        selectedContact={selectedContact}
        selectedConversation={selectedConversation}
        onSelectContact={handleSelectContact}
        onSelectConversation={handleSelectConversation}
        onOpenNewChat={() => setShowNewChatModal(true)}
        onOpenNewGroup={() => setShowNewGroupModal(true)}
        searchQuery={contactSearch}
        onSearchChange={setContactSearch}
      />

      <div className={`flex-1 flex flex-col min-w-0 ${hasSelection ? 'flex' : 'hidden md:flex'}`}>
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
            onBack={handleBack}
            token={token || ''}
            onDeleteMessage={() => fetchMessages(selectedContact._id)}
          />
        ) : selectedConversation ? (
          <GroupChatWindow
            conversation={selectedConversation}
            messages={groupMessages}
            currentUserId={user?._id || ''}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendGroupMessage}
            isSending={isSending}
            isLoading={isLoadingMessages}
            attachments={attachments}
            onRemoveAttachment={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}
            onOpenResourcePicker={() => setShowResourcePicker(true)}
            onBack={handleBack}
            token={token || ''}
            onDeleteMessage={() => fetchGroupMessages(selectedConversation._id)}
            onLeaveGroup={handleLeaveGroup}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted bg-bg-secondary relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none" />

             <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-accent-primary/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(79,70,229,0.1)] relative z-10">
                <MessageCircle className="w-12 h-12 text-accent-primary" />
              </div>
            <div className="text-center px-6 relative z-10">
              <h2 className="text-3xl font-bold text-text-main mb-3 tracking-tight">Messagerie Interne</h2>
              <p className="max-w-sm text-text-dim leading-relaxed font-light mx-auto">
                Sélectionnez une conversation ou démarrez-en une nouvelle pour collaborer.
              </p>
              <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-8 py-3.5 bg-accent-primary text-white font-bold rounded-full hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 active:scale-95 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Nouvelle discussion
                </button>
                <button
                  onClick={() => setShowNewGroupModal(true)}
                  className="px-6 py-3.5 bg-bg-tertiary text-text-main font-bold rounded-full hover:bg-glass-hover transition-all border border-glass-border active:scale-95 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Nouveau groupe
                </button>
              </div>
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

      {/* New Group Modal */}
      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        onGroupCreated={handleGroupCreated}
        workspaceId={currentWorkspace?._id || ''}
      />

      <ResourcePicker
        isOpen={showResourcePicker}
        onClose={() => setShowResourcePicker(false)}
        onSelect={addAttachment}
      />
    </div>
  );
}
