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
import Avatar from '@/components/ui/Avatar';
import UserHoverCard from '@/components/ui/UserHoverCard';
import { EditTaskModal } from '@/components/modals';
import { useAppStore } from '@/store';

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
  comments?: {
    id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }[];
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
  const { token, user: currentUser } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteTask, updateTask: updateStoreTask } = useAppStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleDeleteTask = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;

    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        deleteTask(id as string);
        toast.success('Tâche supprimée');
        router.push('/tasks');
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUpdateTask = (updatedTask: any) => {
    setTask(updatedTask);
    updateStoreTask(updatedTask._id, updatedTask);
  };

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const postComment = async () => {
    if (!newComment.trim() || !task) return;

    try {
      setIsSubmittingComment(true);
      const response = await fetch('/api/tasks/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: task._id,
          content: newComment
        })
      });
      const data = await response.json();

      if (data.success) {
        setTask(data.data);
        setNewComment('');
        toast.success('Commentaire ajouté');
      } else {
        toast.error(data.error || 'Erreur lors de l\'ajout du commentaire');
      }
    } catch {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    try {
      const response = await fetch('/api/tasks/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: task?._id,
          commentId
        })
      });
      const data = await response.json();
      if (data.success) {
        setTask(data.data);
        toast.success('Commentaire supprimé');
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

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

            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1A1A1A] border border-white/10 shadow-xl z-20 overflow-hidden py-1">
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dim hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteTask();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
            {task.creator && typeof task.creator === 'object' && 'firstName' in task.creator ? (
              <UserHoverCard user={task.creator as any}>
                <div className="flex items-center gap-2 group/creator cursor-pointer">
                  <Avatar 
                    src={task.creator.avatar} 
                    fallback={task.creator.firstName} 
                    color={(task.creator as any).profileColor}
                    size="xs"
                  />
                  <span className="group-hover/creator:text-indigo-400 transition-colors">
                    Créé par {task.creator.firstName} {task.creator.lastName}
                  </span>
                </div>
              </UserHoverCard>
            ) : (
              <div className="flex items-center gap-2 opacity-60">
                <Avatar 
                  fallback="?" 
                  size="xs"
                />
                <span>Créé par Utilisateur inconnu</span>
              </div>
            )}
            {task.assignee && (
              <UserHoverCard user={task.assignee as any}>
                <div className="flex items-center gap-2 group/assignee cursor-pointer">
                  <Avatar 
                    src={task.assignee.avatar} 
                    fallback={task.assignee.firstName} 
                    color={(task.assignee as any).profileColor}
                    size="xs"
                  />
                  <span className="group-hover/assignee:text-indigo-400 transition-colors">
                    Assigné à {task.assignee.firstName} {task.assignee.lastName}
                  </span>
                </div>
              </UserHoverCard>
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

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-dim uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Commentaires
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-dim">
                  {task.comments?.length || 0}
                </span>
             </div>

             {/* Add Comment Form */}
             <div className="glass-card p-4 space-y-3">
               <textarea
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Ajouter un commentaire..."
                 className="w-full bg-transparent border-0 focus:ring-0 p-0 text-white placeholder-dim resize-none min-h-[80px]"
               />
               <div className="flex justify-end pt-2 border-t border-white/5">
                 <button
                   onClick={postComment}
                   disabled={!newComment.trim() || isSubmittingComment}
                   className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   {isSubmittingComment ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                       Envoi...
                     </>
                   ) : (
                     <>Envoyer</>
                   )}
                 </button>
               </div>
             </div>

             {/* Comments List */}
             <div className="space-y-4">
               {task.comments && task.comments.length > 0 ? (
                 task.comments.map((comment) => (
                   <div key={comment.id} className="glass-card p-4 space-y-3 group">
                     {/* Comment Header */}
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           {/* Avatar user */}
                           {comment.user ? (
                             <UserHoverCard user={comment.user}>
                               <div className="flex items-center gap-3 group/user cursor-pointer">
                                 <Avatar 
                                   src={comment.user?.avatar} 
                                   fallback={comment.user?.firstName || '?'} 
                                   color={(comment.user as any)?.profileColor}
                                   size="sm"
                                 />
                                 <div>
                                   <p className="text-sm font-medium text-white group-hover/user:text-indigo-400 transition-colors">
                                     {`${comment.user.firstName} ${comment.user.lastName}`}
                                   </p>
                                   <p className="text-xs text-dim">
                                     {format(new Date(comment.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
                                   </p>
                                 </div>
                               </div>
                             </UserHoverCard>
                           ) : (
                             <>
                               <Avatar 
                                 fallback="?" 
                                 size="sm"
                               />
                               <div>
                                 <p className="text-sm font-medium text-white">Utilisateur inconnu</p>
                                 <p className="text-xs text-dim">
                                   {format(new Date(comment.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
                                 </p>
                               </div>
                             </>
                           )}
                        </div>
                        {/* Delete button (if current user is author) */}
                        {currentUser && currentUser._id === comment.user?._id && (
                           <button
                             onClick={() => deleteComment(comment.id)}
                             className="p-1.5 rounded-lg hover:bg-red-500/10 text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        )}
                     </div>
                     {/* Comment Content */}
                     <div className="pl-11">
                       <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                         {comment.content}
                       </p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-8 text-dim text-sm italic">
                   Aucun commentaire pour le moment.
                 </div>
               )}
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
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Modifier la tâche
            </button>
            <button 
              onClick={handleDeleteTask}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
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

      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
}
