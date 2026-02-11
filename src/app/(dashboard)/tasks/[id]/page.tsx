'use client';

import React, { useState, useEffect } from 'react';

import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Paperclip,
  Clock,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Edit,
  Circle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'important' | 'less_important' | 'waiting';
  project?: {
    _id: string;
    name: string;
    color: string;
  };
  assignee?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  dueDate?: string;
  createdAt: string;
  tags: string[];
  attachments?: string[];
}

const statusConfig = {
  todo: { label: 'À faire', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Circle },
  in_progress: { label: 'En cours', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  done: { label: 'Terminé', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
};

const priorityConfig = {
  important: { label: 'Important', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  less_important: { label: 'Moins important', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  waiting: { label: 'En attente', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tasks?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setTask(data.data);
        } else {
          toast.error(data.error || 'Tâche non trouvée');
          router.push('/tasks');
        }
      } catch {
        toast.error('Erreur lors du chargement de la tâche');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id, token, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) return null;

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
                {task.project && (
                  <Link href={`/projects/${task.project._id}`}>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={{ 
                        backgroundColor: `${task.project.color}10`,
                        color: task.project.color,
                        borderColor: `${task.project.color}20` 
                      }}
                    >
                      {task.project.name}
                    </span>
                  </Link>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityConfig[task.priority].color}`}>
                  {priorityConfig[task.priority].label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${statusConfig[task.status].color}`}>
                  {statusConfig[task.status].label}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">{task.title}</h1>
            </div>

            <button className="p-2 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {task.creator?.avatar ? (
                  <img src={task.creator.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  task.creator?.firstName?.[0] || '?'
                )}
              </div>
              <span>Créé par {task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : 'Utilisateur inconnu'}</span>
            </div>
            {task.assignee && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {task.assignee.avatar ? (
                    <img src={task.assignee.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    task.assignee.firstName[0]
                  )}
                </div>
                <span>Assigné à {task.assignee.firstName} {task.assignee.lastName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Créé le {new Date(task.createdAt).toLocaleDateString()}</span>
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
                {task.description || 'Aucune description fournie.'}
              </p>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                {task.tags.map((tag, i) => (
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
          {/* Due Date */}
          {task.dueDate && (
             <div className="glass-card p-6 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-xs font-bold text-dim uppercase tracking-wider">Date d&apos;échéance</p>
                <p className="text-xl font-bold text-white">
                  {format(new Date(task.dueDate), 'd MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-sm text-dim">
                  {format(new Date(task.dueDate), 'EEEE', { locale: fr })}
                </p>
             </div>
          )}

          {/* Actions */}
          <div className="glass-card p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors text-sm font-medium">
              <Edit className="w-4 h-4" />
              Modifier la tâche
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
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((file, i) => (
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
