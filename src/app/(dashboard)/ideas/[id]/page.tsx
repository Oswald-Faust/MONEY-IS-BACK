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
  Edit
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
        toast.error('Erreur lors du chargement de l\'idée');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [id, token, router]);

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
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-dim hover:text-white transition-all mt-1"
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
              <h1 className="text-3xl font-bold text-white leading-tight">{idea.title}</h1>
            </div>

            <button className="p-2 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
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
              <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
                {idea.content}
              </p>
            </div>

            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                {idea.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-dim">
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity / Comments Placeholder */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-dim uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Commentaires
            </h3>
            <div className="glass-card p-8 text-center space-y-2">
              <p className="text-dim">La section commentaires sera bientôt disponible.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="glass-card p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors text-sm font-medium">
              <Edit className="w-4 h-4" />
              Modifier l&apos;idée
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>

          {/* Attachments */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-indigo-400" />
              Pièces jointes
            </h3>
            {idea.attachments && idea.attachments.length > 0 ? (
              <div className="space-y-2">
                {idea.attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Paperclip className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Document {i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dim italic">Aucune pièce jointe</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
