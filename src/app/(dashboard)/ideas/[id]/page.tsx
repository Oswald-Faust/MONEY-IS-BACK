'use client';

import React, { useState, useEffect } from 'react';

import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Paperclip,
  MoreVertical,
  Trash2,
  Edit,
  Send,
  Loader2,
  Target
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import CreateIdeaModal from '@/components/modals/CreateIdeaModal';
import CreateObjectiveModal from '@/components/modals/CreateObjectiveModal';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface Idea {
  _id: string;
  title: string;
  content: string;
  status: 'raw' | 'standby' | 'in_progress' | 'implemented';
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  tags: string[];
  attachments?: string[];
  comments?: Comment[];
}

const statusConfig = {
  raw: { label: 'Premier degré', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  standby: { label: 'Mise de côté', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  in_progress: { label: 'En cours', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  implemented: { label: 'Terminé', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
};

export default function IdeaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/ideas?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setIdea(data.data);
        } else {
          toast.error(data.error || 'Idée non trouvée');
          router.push('/ideas');
        }
      } catch {
        toast.error("Erreur lors du chargement de l'idée");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [id, token, router]);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette idée ?')) return;
    try {
      const response = await fetch(`/api/ideas?id=${idea?._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Idée supprimée');
        router.push('/ideas');
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !idea) return;
    
    setIsSubmittingComment(true);
    try {
      const res = await fetch('/api/ideas/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ideaId: idea._id, content: newComment.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setIdea(data.data);
        setNewComment('');
        toast.success('Commentaire ajouté');
      } else {
        toast.error(data.error || "Erreur lors de l'ajout du commentaire");
      }
    } catch {
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!idea) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 page-fade space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-bg-tertiary hover:bg-glass-hover text-text-dim hover:text-text-main transition-all mt-1 border border-glass-border"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {idea.project && (
                  <Link href={`/projects/${idea.project._id}`}>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={{ 
                        backgroundColor: `${idea.project.color}10`,
                        color: idea.project.color,
                        borderColor: `${idea.project.color}20` 
                      }}
                    >
                      {idea.project.name}
                    </span>
                  </Link>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusConfig[idea.status].color}`}>
                  {statusConfig[idea.status].label}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-text-main leading-tight">{idea.title}</h1>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-bg-tertiary hover:bg-glass-hover text-text-dim hover:text-text-main transition-colors border border-glass-border"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-secondary border border-glass-border shadow-xl z-50 overflow-hidden">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-main hover:bg-glass-hover transition-colors"
                    >
                      <Edit className="w-4 h-4 text-text-muted" />
                      Modifier
                    </button>
                    <div className="h-[1px] bg-glass-border w-full" />
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleDelete();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-text-dim">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {idea.creator?.avatar ? (
                  <img src={idea.creator.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  idea.creator?.firstName?.[0] || '?'
                )}
              </div>
              <span>
                {idea.creator && typeof idea.creator === 'object' && 'firstName' in idea.creator
                  ? `${idea.creator.firstName} ${idea.creator.lastName}`
                  : 'Utilisateur inconnu'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Content Card */}
          <div className="glass-card p-8 space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-text-dim leading-relaxed text-lg">
                {idea.content}
              </p>
            </div>

            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-glass-border">
                {idea.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-glass-border text-xs text-text-muted">
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity / Comments */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-dim uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Commentaires ({idea.comments?.length || 0})
            </h3>
            
            <div className="glass-card p-6 space-y-6">
              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-tertiary flex-shrink-0 flex items-center justify-center text-xs font-bold text-text-muted border border-glass-border">
                  ME
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="w-full pl-4 pr-12 py-3 bg-bg-tertiary border border-glass-border rounded-xl text-text-main outline-none focus:border-amber-500/50 transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>

              {/* Comment List */}
              <div className="space-y-4 pt-4">
                {idea.comments && idea.comments.length > 0 ? (
                  idea.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {comment.user?.avatar ? (
                          <img src={comment.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          comment.user?.firstName?.[0] || '?'
                        )}
                      </div>
                      <div className="flex-1 bg-bg-tertiary rounded-xl p-4 border border-glass-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-text-main">
                            {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Utilisateur inconnu'}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(comment.createdAt).toLocaleDateString()} à {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-text-dim">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-text-muted text-sm">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="glass-card p-4 space-y-2">
            <button 
              onClick={() => setIsConvertModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-colors text-sm font-bold border border-accent-primary/20"
            >
              <Target className="w-4 h-4" />
              Transformer en objectif
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-glass-hover text-text-dim hover:text-text-main transition-colors text-sm font-medium border border-transparent hover:border-glass-border"
            >
              <Edit className="w-4 h-4" />
              Modifier l&apos;idée
            </button>
            <button 
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>

          {/* Attachments */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-amber-500" />
              Pièces jointes
            </h3>
            {idea.attachments && idea.attachments.length > 0 ? (
              <div className="space-y-2">
                {idea.attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary border border-glass-border hover:bg-glass-hover transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Paperclip className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main truncate">Document {i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">Aucune pièce jointe</p>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
      <CreateIdeaModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          // Refetch to get updated data
          if (token && id) {
             fetch(`/api/ideas?id=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json()).then(data => {
              if (data.success) setIdea(data.data);
            });
          }
        }}
        initialData={idea}
      />
      )}

      {isConvertModalOpen && idea && (
        <CreateObjectiveModal 
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          prefillData={{
             title: idea.title,
             description: idea.content,
             project: idea.project,
          }}
        />
      )}
    </div>
  );
}
