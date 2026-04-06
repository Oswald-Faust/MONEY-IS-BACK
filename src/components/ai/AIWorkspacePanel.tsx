'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import {
  AIChatMessage,
  AIConversation,
  AIExecutedAction,
  AISuggestedAction,
  ApiResponse,
} from '@/types';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

interface AIWorkspacePanelProps {
  variant?: 'page' | 'floating';
  onClose?: () => void;
}

function formatConversationDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function derivePageContext(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return {
    route: pathname,
    projectId: segments[0] === 'projects' && segments[1] ? segments[1] : undefined,
    objectiveId: segments[0] === 'objectives' && segments[1] ? segments[1] : undefined,
    taskId: segments[0] === 'tasks' && segments[1] ? segments[1] : undefined,
    ideaId: segments[0] === 'ideas' && segments[1] ? segments[1] : undefined,
  };
}

function getQuickSuggestions(pathname: string, t: ReturnType<typeof useTranslation>['t']) {
  if (pathname.startsWith('/projects')) return [t.aiPage.suggestions.projects, t.aiPage.suggestions.objectives];
  if (pathname.startsWith('/tasks')) return [t.aiPage.suggestions.tasks, t.aiPage.suggestions.objectives];
  if (pathname.startsWith('/objectives')) return [t.aiPage.suggestions.objectives, t.aiPage.suggestions.tasks];
  return [t.aiPage.suggestions.default, t.aiPage.suggestions.projects];
}

function getSuggestedActions(message: AIChatMessage): AISuggestedAction[] {
  const metadata = message.metadata as { suggestedActions?: AISuggestedAction[] } | undefined;
  return metadata?.suggestedActions || [];
}

function getExecutedAction(message: AIChatMessage): AIExecutedAction | undefined {
  const metadata = message.metadata as { executedAction?: AIExecutedAction } | undefined;
  return metadata?.executedAction;
}

export default function AIWorkspacePanel({ variant = 'page', onClose }: AIWorkspacePanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();
  const { currentWorkspace, projects, addProject, setObjectiveModalOpen, setTaskModalOpen } = useAppStore();
  const { t } = useTranslation();

  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [composer, setComposer] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);
  // Mobile : 'conversations' = liste sidebar | 'chat' = vue messages
  const [mobilePaneView, setMobilePaneView] = useState<'conversations' | 'chat'>('conversations');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );
  const quickSuggestions = getQuickSuggestions(pathname, t);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [composer]);

  const fetchConversations = React.useCallback(async () => {
    if (!token || !currentWorkspace) return;
    setIsLoadingConversations(true);
    try {
      const res = await fetch(`/api/ai/conversations?workspaceId=${currentWorkspace._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiResponse<AIConversation[]> = await res.json();
      if (data.success && data.data) {
        setConversations(data.data);
        if (!selectedConversationId && data.data.length > 0) {
          setSelectedConversationId(data.data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [token, currentWorkspace, selectedConversationId]);

  const loadMessages = React.useCallback(async (conversationId: string) => {
    if (!token) return;
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiResponse<AIChatMessage[]> = await res.json();
      if (data.success && data.data) setMessages(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [token]);

  const createConversation = React.useCallback(async (seedTitle?: string) => {
    if (!token || !currentWorkspace) return null;
    const res = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        workspaceId: currentWorkspace._id,
        title: seedTitle || t.aiPage.newConversation,
        source: variant === 'floating' ? 'panel' : 'page',
        context: derivePageContext(pathname),
      }),
    });
    const data: ApiResponse<AIConversation> = await res.json();
    if (!data.success || !data.data) throw new Error(data.error || 'Erreur création conversation IA');
    setConversations((prev) => [data.data!, ...prev]);
    return data.data;
  }, [currentWorkspace, pathname, t.aiPage.newConversation, token, variant]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) loadMessages(selectedConversationId);
    else setMessages([]);
  }, [loadMessages, selectedConversationId]);

  const handleNewConversation = async () => {
    try {
      const conv = await createConversation();
      if (conv) {
        setSelectedConversationId(conv._id);
        setMessages([]);
        setMobilePaneView('chat');
      }
    } catch {
      toast.error('Impossible de créer une nouvelle conversation IA');
    }
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    setMobilePaneView('chat');
  };

  const handleSuggestedAction = (action: AISuggestedAction) => {
    const ctx = derivePageContext(pathname);
    const pid = action.projectId || ctx.projectId;
    switch (action.kind) {
      case 'open_objective_generator': setObjectiveModalOpen(true, pid); break;
      case 'open_task_modal': setTaskModalOpen(true, pid); break;
      case 'open_objectives': router.push('/objectives'); break;
      case 'open_tasks': router.push('/tasks'); break;
      case 'open_projects': router.push('/projects'); break;
      case 'open_project': router.push(pid ? `/projects/${pid}` : '/projects'); break;
    }
  };

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!composer.trim() || !token || !currentWorkspace || isSending) return;

    setIsSending(true);
    try {
      let conv = selectedConversation;
      if (!conv) {
        conv = await createConversation(composer.trim().slice(0, 60));
        if (conv) setSelectedConversationId(conv._id);
      }
      if (!conv) throw new Error('Conversation introuvable');

      const res = await fetch(`/api/ai/conversations/${conv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: composer.trim(), pageContext: derivePageContext(pathname) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur envoi message IA');

      const executed = getExecutedAction(data.data.assistantMessage);
      if (
        executed?.kind === 'create_project' &&
        executed.status !== 'failed' &&
        executed.project &&
        !projects.some((p) => p._id === executed.project!._id)
      ) {
        addProject(executed.project);
        router.refresh();
      }

      setMessages((prev) => [...prev, data.data.userMessage, data.data.assistantMessage]);
      setComposer('');
      await fetchConversations();
    } catch {
      toast.error("Impossible d'obtenir une réponse IA");
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRename = (conv: AIConversation) => {
    setEditingConvId(conv._id);
    setEditingTitle(conv.title);
  };

  const handleConfirmRename = async (convId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed || !token) { setEditingConvId(null); return; }
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.map((c) => c._id === convId ? { ...c, title: trimmed } : c));
        toast.success('Conversation renommée');
      } else {
        toast.error(data.error || 'Erreur lors du renommage');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setEditingConvId(null);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!token) return;
    setDeletingConvId(convId);
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (selectedConversationId === convId) {
          const remaining = conversations.filter((c) => c._id !== convId);
          setSelectedConversationId(remaining.length > 0 ? remaining[0]._id : null);
          setMessages([]);
        }
        toast.success('Conversation supprimée');
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setDeletingConvId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Layout ────────────────────────────────────────────────────────────────
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-24 right-6 z-[95] w-[min(420px,calc(100vw-2rem))] rounded-[28px] border border-glass-border bg-bg-secondary/95 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.75)] backdrop-blur-2xl flex flex-col max-h-[600px]">
        {/* Floating header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-main leading-none">{t.aiPage.floatingTitle}</p>
              <p className="text-xs text-text-muted mt-0.5">{t.aiPage.floatingSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/ai')}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-text-main transition-colors hover:bg-glass-hover"
            >
              {t.aiPage.openFullPage}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-glass-hover hover:text-text-main">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick suggestions */}
        {messages.length === 0 && (
          <div className="px-4 py-3 border-b border-glass-border flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setComposer(s)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-text-dim transition-colors hover:bg-glass-hover"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-3 min-h-0">
          <FloatingMessages
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            handleSuggestedAction={handleSuggestedAction}
            t={t}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Composer */}
        <div className="px-4 py-3 border-t border-glass-border flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={t.aiPage.composerPlaceholder}
              className="flex-1 resize-none rounded-2xl border border-glass-border bg-bg-tertiary px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none focus:ring-4 focus:ring-accent-primary/5 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!composer.trim() || isSending}
              className="h-[44px] w-[44px] flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-primary text-white shadow-lg shadow-accent-primary/20 transition-all hover:opacity-90 disabled:opacity-40"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <button
            onClick={() => router.push('/ai')}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            {t.aiPage.openFullPage}
          </button>
        </div>
      </div>
    );
  }

  // ─── Page variant ──────────────────────────────────────────────────────────
  // Rendu de la liste de conversations (partagé mobile + desktop)
  const ConversationsList = (
    <>
      {isLoadingConversations ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-accent-primary" />
        </div>
      ) : conversations.length > 0 ? (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`relative rounded-xl transition-all group ${
                selectedConversationId === conv._id
                  ? 'bg-accent-primary/10 border border-accent-primary/25'
                  : 'border border-transparent hover:bg-white/[0.04] hover:border-glass-border'
              }`}
            >
              {editingConvId !== conv._id && (
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartRename(conv); }}
                    title="Renommer"
                    className="w-6 h-6 flex items-center justify-center rounded-md text-text-muted hover:text-text-main hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv._id); }}
                    disabled={deletingConvId === conv._id}
                    title="Supprimer"
                    className="w-6 h-6 flex items-center justify-center rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  >
                    {deletingConvId === conv._id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                  </button>
                </div>
              )}
              <button
                onClick={() => editingConvId !== conv._id && handleSelectConversation(conv._id)}
                className="w-full px-3 py-3 text-left"
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${selectedConversationId === conv._id ? 'text-accent-primary' : 'text-text-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      {editingConvId === conv._id ? (
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleConfirmRename(conv._id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleConfirmRename(conv._id); }
                            if (e.key === 'Escape') setEditingConvId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          maxLength={140}
                          className="flex-1 bg-transparent border-b border-accent-primary/60 text-sm font-semibold text-text-main outline-none pb-0.5 leading-tight pr-2"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-text-main truncate leading-tight pr-14">{conv.title}</p>
                      )}
                      {editingConvId !== conv._id && (
                        <span className="text-[10px] text-text-muted flex-shrink-0">
                          {formatConversationDate(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                      )}
                    </div>
                    {editingConvId !== conv._id && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                        {conv.lastMessage?.content || t.aiPage.emptyDescription}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-center px-4">
          <MessageSquare className="w-8 h-8 text-text-muted opacity-30 mb-3" />
          <p className="text-sm font-medium text-text-main">{t.aiPage.emptyTitle}</p>
          <p className="text-xs text-text-muted mt-1">{t.aiPage.emptyDescription}</p>
        </div>
      )}
    </>
  );

  // Rendu du chat (partagé mobile + desktop)
  const ChatPane = (
    <div className="flex flex-col h-full min-h-0">
      {/* Header chat */}
      <div className="flex items-center justify-between px-4 py-3 xl:px-6 xl:py-4 border-b border-glass-border flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Bouton retour mobile */}
          <button
            onClick={() => setMobilePaneView('conversations')}
            className="xl:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 xl:w-5 xl:h-5 text-indigo-300" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-bg-secondary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm xl:text-base font-bold text-text-main leading-tight truncate">{t.aiPage.floatingTitle}</p>
            <p className="text-xs text-emerald-400 font-medium hidden sm:block">En ligne · {t.aiPage.floatingSubtitle}</p>
          </div>
        </div>
        <button
          onClick={handleNewConversation}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 xl:px-3 text-xs font-semibold text-text-main transition-colors hover:bg-glass-hover flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouvelle</span>
        </button>
      </div>

      {/* Messages scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 xl:px-6 xl:py-6 custom-scrollbar min-h-0">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-accent-primary" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState t={t} suggestions={quickSuggestions} onSuggestion={(s) => { setComposer(s); textareaRef.current?.focus(); }} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const actions = isAssistant ? getSuggestedActions(msg) : [];
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 xl:gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-300" />
                      </div>
                    )}
                    <div className={`max-w-[82%] xl:max-w-[78%] space-y-2 ${isAssistant ? '' : 'items-end flex flex-col'}`}>
                      <div
                        className={`rounded-[18px] px-3.5 py-2.5 xl:px-4 xl:py-3 text-sm leading-relaxed ${
                          isAssistant
                            ? 'bg-white/[0.05] border border-white/[0.08] text-text-main rounded-tl-sm'
                            : 'bg-accent-primary/15 border border-accent-primary/20 text-text-main rounded-tr-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {isAssistant && msg.provider && (
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                            via {msg.provider}
                          </p>
                        )}
                      </div>
                      {actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {actions.map((action) => (
                            <button
                              key={`${msg._id}-${action.kind}-${action.label}`}
                              onClick={() => handleSuggestedAction(action)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-text-main transition-colors hover:bg-glass-hover"
                            >
                              {action.label}
                              <ChevronRight className="w-3 h-3 text-text-muted" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 xl:gap-3 justify-start"
              >
                <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-300" />
                </div>
                <div className="rounded-[18px] rounded-tl-sm bg-white/[0.05] border border-white/[0.08] px-3.5 py-2.5 xl:px-4 xl:py-3">
                  <span className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer fixe en bas */}
      <div className="flex-shrink-0 border-t border-glass-border px-3 py-3 xl:px-6 xl:py-4">
        <form onSubmit={handleSend} className="flex items-end gap-2 xl:gap-3">
          <textarea
            ref={textareaRef}
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={t.aiPage.composerPlaceholder}
            className="flex-1 resize-none rounded-2xl border border-glass-border bg-bg-tertiary px-4 py-3 xl:py-3.5 text-sm text-text-main placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none focus:ring-4 focus:ring-accent-primary/5 min-h-[46px] xl:min-h-[52px] max-h-[120px]"
          />
          <button
            type="submit"
            disabled={!composer.trim() || isSending}
            className="h-[46px] w-[46px] xl:h-[52px] xl:w-[52px] flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-primary text-white shadow-lg shadow-accent-primary/20 transition-all hover:opacity-90 disabled:opacity-40"
          >
            {isSending ? <Loader2 className="w-4 h-4 xl:w-5 xl:h-5 animate-spin" /> : <Send className="w-4 h-4 xl:w-5 xl:h-5" />}
          </button>
        </form>
        <p className="mt-1 text-[10px] text-text-muted text-right hidden xl:block">⌘ + Entrée pour envoyer</p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100dvh-6rem)] overflow-hidden rounded-[28px] border border-glass-border bg-bg-secondary/60 flex">

      {/* ── Sidebar — plein écran sur mobile si mobilePaneView=conversations, cachée sinon ── */}
      <aside
        className={`flex-col min-h-0 border-r border-glass-border w-full xl:w-[280px] xl:flex xl:flex-shrink-0 ${
          mobilePaneView === 'conversations' ? 'flex' : 'hidden xl:flex'
        }`}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-glass-border flex-shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted mb-0.5">Conversations</p>
            <p className="text-sm font-semibold text-text-main">{currentWorkspace?.name || 'Edwin'}</p>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-text-muted transition-colors hover:bg-glass-hover hover:text-text-main"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Liste scrollable */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0">
          {ConversationsList}
        </div>

        {/* Footer suggestions */}
        <div className="p-3 border-t border-glass-border flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-2 px-1">Suggestions rapides</p>
          <div className="space-y-1">
            {quickSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setComposer(s);
                  setMobilePaneView('chat');
                  textareaRef.current?.focus();
                }}
                className="w-full rounded-lg border border-transparent px-3 py-2 text-left text-xs text-text-dim transition-colors hover:bg-glass-hover hover:border-glass-border flex items-center gap-2"
              >
                <Zap className="w-3 h-3 text-accent-primary flex-shrink-0" />
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Chat pane — plein écran sur mobile si mobilePaneView=chat ── */}
      <div
        className={`flex-1 min-w-0 ${
          mobilePaneView === 'chat' ? 'flex' : 'hidden xl:flex'
        } flex-col`}
      >
        {ChatPane}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyState({
  t,
  suggestions,
  onSuggestion,
}: {
  t: ReturnType<typeof useTranslation>['t'];
  suggestions: string[];
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-cyan-500/15 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-indigo-400" />
        </div>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-bg-secondary flex items-center justify-center">
          <Zap className="w-2.5 h-2.5 text-white" />
        </span>
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">{t.aiPage.emptyTitle.replace('Aucune conversation IA', 'Edwin AI est prêt')}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-8 leading-relaxed">{t.aiPage.noMessages}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm text-text-dim transition-all hover:bg-white/[0.06] hover:border-white/[0.14] hover:text-text-main group"
          >
            <span className="text-accent-primary mr-2 group-hover:mr-3 transition-all">→</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function FloatingMessages({
  messages,
  isLoadingMessages,
  isSending,
  handleSuggestedAction,
  t,
  messagesEndRef,
}: {
  messages: AIChatMessage[];
  isLoadingMessages: boolean;
  isSending: boolean;
  handleSuggestedAction: (a: AISuggestedAction) => void;
  t: ReturnType<typeof useTranslation>['t'];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (isLoadingMessages) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-accent-primary" /></div>;
  }
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Sparkles className="w-8 h-8 text-indigo-400 mb-3 opacity-60" />
        <p className="text-sm font-medium text-text-main mb-1">{t.aiPage.floatingTitle}</p>
        <p className="text-xs text-text-muted">{t.aiPage.noMessages}</p>
      </div>
    );
  }
  return (
    <>
      {messages.map((msg) => {
        const isAssistant = msg.role === 'assistant';
        const actions = isAssistant ? getSuggestedActions(msg) : [];
        return (
          <div key={msg._id} className={`flex gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              isAssistant
                ? 'bg-white/[0.05] border border-white/[0.08] text-text-main rounded-tl-sm'
                : 'bg-accent-primary/15 border border-accent-primary/20 text-text-main rounded-tr-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {isAssistant && msg.provider && (
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">{msg.provider}</p>
              )}
              {actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {actions.map((a) => (
                    <button
                      key={`${msg._id}-${a.kind}`}
                      onClick={() => handleSuggestedAction(a)}
                      className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-xs font-semibold text-text-main hover:bg-glass-hover"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {isSending && (
        <div className="flex gap-2 justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/[0.08] px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
              {t.aiPage.generating}
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
}
