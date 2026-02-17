import { Search, Plus, Users } from 'lucide-react';
import { Contact, Conversation, User } from '@/types';
import { motion } from 'framer-motion';

type ChatItem =
  | { type: 'contact'; data: Contact }
  | { type: 'group'; data: Conversation };

interface ContactListProps {
  contacts: Contact[];
  conversations: Conversation[];
  selectedContact: Contact | null;
  selectedConversation: Conversation | null;
  onSelectContact: (contact: Contact) => void;
  onSelectConversation: (conversation: Conversation) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export default function ContactList({
  contacts,
  conversations,
  selectedContact,
  selectedConversation,
  onSelectContact,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
  searchQuery,
  onSearchChange,
  className = '',
}: ContactListProps) {

  // Merge contacts and conversations into a single sorted list
  const chatItems: ChatItem[] = [];

  contacts.forEach(c => chatItems.push({ type: 'contact', data: c }));
  conversations.forEach(c => chatItems.push({ type: 'group', data: c }));

  // Sort by last message date (most recent first), unread first
  chatItems.sort((a, b) => {
    const aUnread = a.type === 'contact' ? a.data.unreadCount : (a.data.unreadCount || 0);
    const bUnread = b.type === 'contact' ? b.data.unreadCount : (b.data.unreadCount || 0);

    if (aUnread !== bUnread) return bUnread - aUnread;

    const aDate = a.type === 'contact'
      ? (a.data.lastMessage ? new Date(a.data.lastMessage.createdAt).getTime() : 0)
      : (a.data.lastMessage ? new Date(a.data.lastMessage.createdAt).getTime() : new Date(a.data.createdAt).getTime());
    const bDate = b.type === 'contact'
      ? (b.data.lastMessage ? new Date(b.data.lastMessage.createdAt).getTime() : 0)
      : (b.data.lastMessage ? new Date(b.data.lastMessage.createdAt).getTime() : new Date(b.data.createdAt).getTime());

    return bDate - aDate;
  });

  // Filter by search
  const filtered = chatItems.filter(item => {
    if (item.type === 'contact') {
      const c = item.data;
      return `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return item.data.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <div className={`flex flex-col h-full bg-glass-bg border-r border-white/5 ${className}`}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewGroup}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95 group"
            title="Nouveau groupe"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
            title="Nouvelle conversation"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border-none rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">Aucune conversation trouvée.</p>
            <button
              onClick={onOpenNewChat}
              className="mt-2 text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors"
            >
              Démarrer une discussion
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            if (item.type === 'contact') {
              const contact = item.data;
              const isSelected = selectedContact?._id === contact._id && !selectedConversation;

              return (
                <motion.button
                  key={`contact-${contact._id}`}
                  layoutId={`contact-${contact._id}`}
                  onClick={() => onSelectContact(contact)}
                  className={`w-full p-3 flex items-center gap-3 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                      : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner overflow-hidden ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0f1115]' : ''
                    }`}>
                      {contact.avatar ? (
                        <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{contact.firstName[0]}{contact.lastName[0]}</span>
                      )}
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-[#0f1115] font-bold shadow-lg z-10">
                        {contact.unreadCount}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0f1115] rounded-full" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-semibold truncate text-sm ${
                        isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {contact.firstName} {contact.lastName}
                      </span>
                      {contact.lastMessage && (
                        <span className={`text-[10px] ${
                          contact.unreadCount > 0 ? 'text-indigo-400 font-bold' : 'text-gray-500'
                        }`}>
                          {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${
                      contact.unreadCount > 0
                        ? 'text-white font-medium'
                        : isSelected ? 'text-indigo-200/70' : 'text-gray-500 group-hover:text-gray-400'
                    }`}>
                      {contact.lastMessage
                        ? ((typeof contact.lastMessage.sender === 'string' ? contact.lastMessage.sender : (contact.lastMessage.sender as User)?._id) === contact._id ? '' : 'Vous: ') + contact.lastMessage.content
                        : <span className="italic text-indigo-400/60">Nouvelle discussion</span>}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                  )}
                </motion.button>
              );
            } else {
              // Group conversation
              const conv = item.data;
              const isSelected = selectedConversation?._id === conv._id;
              const unread = conv.unreadCount || 0;

              return (
                <motion.button
                  key={`group-${conv._id}`}
                  layoutId={`group-${conv._id}`}
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full p-3 flex items-center gap-3 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                      : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  {/* Group Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base bg-gradient-to-br from-emerald-500 to-teal-600 shadow-inner ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0f1115]' : ''
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    {unread > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-[#0f1115] font-bold shadow-lg z-10">
                        {unread}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-semibold truncate text-sm ${
                        isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {conv.name}
                      </span>
                      {conv.lastMessage && (
                        <span className={`text-[10px] ${
                          unread > 0 ? 'text-indigo-400 font-bold' : 'text-gray-500'
                        }`}>
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs truncate ${
                        unread > 0
                          ? 'text-white font-medium'
                          : isSelected ? 'text-indigo-200/70' : 'text-gray-500 group-hover:text-gray-400'
                      }`}>
                        {conv.lastMessage
                          ? conv.lastMessage.content
                          : <span className="italic text-indigo-400/60">Groupe créé</span>}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {conv.members.length} membre{conv.members.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                  )}
                </motion.button>
              );
            }
          })
        )}
      </div>
    </div>
  );
}
