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
import type { Task as AppTask, Attachment as AppAttachment, Comment as AppComment } from '@/types';

interface UserPreview {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profileColor?: string;
}

interface ProjectPreview {
  _id: string;
  name: string;
  color: string;
}

interface ObjectivePreview {
  _id: string;
  title: string;
}

interface AttachmentPreview {
  id?: string;
  name?: string;
  url?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'important' | 'less_important' | 'waiting';
  workspace?: string;
  project?: string | ProjectPreview | null;
  objective?: string | ObjectivePreview;
  objectiveTitle?: string;
  source?: 'manual' | 'objective_checkpoint';
  assignee?: string | UserPreview;
  creator: string | UserPreview;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  subtasks?: { id: string, title: string, completed: boolean }[];
  attachments?: AttachmentPreview[];
  order?: number;
  comments?: {
    id: string;
    user: string | UserPreview;
    content: string;
    createdAt: string;
  }[];
  estimatedTime?: number;
}

type TaskComment = NonNullable<Task['comments']>[number];

const statusConfig = {
  todo: { label: 'À faire', color: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20', icon: Circle },
  in_progress: { label: 'En cours', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Clock },
  review: { label: 'En revue', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Clock },
  done: { label: 'Terminé', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
};

const priorityConfig = {
  important: { label: 'Important', color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' },
  less_important: { label: 'Moins important', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  waiting: { label: 'En attente', color: 'text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

function getUserPreview(user?: string | UserPreview | null): UserPreview | null {
  return user && typeof user === 'object' ? user : null;
}

function toAttachmentRecord(attachment: AttachmentPreview, index: number, fallbackDate: string): AppAttachment {
  return {
    id: attachment.id || `attachment-${index}`,
    name: attachment.name || `Document ${index + 1}`,
    url: attachment.url || '',
    type: attachment.type || '',
    size: attachment.size || 0,
    uploadedAt: attachment.uploadedAt || fallbackDate,
  };
}

function toCommentRecord(comment: TaskComment, index: number): AppComment {
  return {
    id: comment.id || `comment-${index}`,
    user: typeof comment.user === 'object' ? comment.user._id : comment.user,
    content: comment.content,
    createdAt: comment.createdAt,
  };
}

function toEditTask(task: Task): AppTask {
  const creator = getUserPreview(task.creator);
  const assignee = getUserPreview(task.assignee);

  return {
    _id: task._id,
    title: task.title,
    description: task.description,
    workspace: task.workspace,
    project: typeof task.project === 'object' ? task.project._id : task.project,
    objective: typeof task.objective === 'object' ? task.objective._id : task.objective,
    objectiveTitle: task.objectiveTitle,
    source: task.source,
    assignee: typeof task.assignee === 'string' ? task.assignee : assignee?._id,
    assignees: assignee ? [assignee._id] : undefined,
    creator: typeof task.creator === 'string' ? task.creator : creator?._id || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    tags: task.tags || [],
    subtasks: task.subtasks || [],
    attachments: (task.attachments || []).map((attachment, index) =>
      toAttachmentRecord(attachment, index, task.updatedAt || task.createdAt)
    ),
    comments: (task.comments || []).map((comment, index) => toCommentRecord(comment, index)),
    order: task.order || 0,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    estimatedTime: task.estimatedTime,
  };
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user: currentUser } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteTask, updateTask: updateStoreTask } = useAppStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const creator = getUserPreview(task?.creator);
  const assignee = getUserPreview(task?.assignee);
  const project = task?.project && typeof task.project === 'object' ? task.project : null;
  const objectiveId = typeof task?.objective === 'object' ? task.objective._id : task?.objective;

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

  const handleUpdateTask = (updatedTask: AppTask) => {
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
          className="p-2 rounded-xl bg-bg-tertiary hover:bg-glass-hover text-text-dim hover:text-text-main transition-all mt-1 border border-glass-border"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {project && (
                  <Link href={`/projects/${project._id}`}>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={{ 
                        backgroundColor: `${project.color}10`,
                        color: project.color,
                        borderColor: `${project.color}20` 
                      }}
                    >
                      {project.name}
                    </span>
                  </Link>
                )}
                {task.objectiveTitle && objectiveId && (
                  <Link href={`/objectives/${objectiveId}`}>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                      Liée à {task.objectiveTitle}
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
              <h1 className="text-3xl font-bold text-text-main leading-tight">{task.title}</h1>
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
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-secondary border border-glass-border shadow-xl z-20 overflow-hidden py-1">
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
                        if (task.source !== 'objective_checkpoint') {
                          handleDeleteTask();
                        }
                        setIsMenuOpen(false);
                      }}
                      disabled={task.source === 'objective_checkpoint'}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {task.source === 'objective_checkpoint' ? 'Suppression via objectif' : 'Supprimer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
            {creator ? (
              <UserHoverCard user={creator}>
                <div className="flex items-center gap-2 group/creator cursor-pointer">
                  <Avatar 
                    src={creator.avatar} 
                    fallback={creator.firstName} 
                    color={creator.profileColor}
                    size="xs"
                  />
                  <span className="group-hover/creator:text-accent-primary transition-colors">
                    Créé par {creator.firstName} {creator.lastName}
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
            {assignee && (
              <UserHoverCard user={assignee}>
                <div className="flex items-center gap-2 group/assignee cursor-pointer">
                  <Avatar 
                    src={assignee.avatar} 
                    fallback={assignee.firstName} 
                    color={assignee.profileColor}
                    size="xs"
                  />
                  <span className="group-hover/assignee:text-accent-primary transition-colors">
                    Assigné à {assignee.firstName} {assignee.lastName}
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
              <p className="whitespace-pre-wrap text-text-dim leading-relaxed text-lg">
                {task.description || 'Aucune description fournie.'}
              </p>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-glass-border">
                {task.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-glass-border text-xs text-text-muted">
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-dim uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Commentaires
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-bg-tertiary border border-glass-border text-xs font-medium text-text-dim">
                  {task.comments?.length || 0}
                </span>
             </div>

             {/* Add Comment Form */}
             <div className="glass-card p-4 space-y-3">
               <textarea
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Ajouter un commentaire..."
                 className="w-full bg-transparent border-0 focus:ring-0 p-0 text-text-main placeholder-text-muted resize-none min-h-[80px]"
               />
               <div className="flex justify-end pt-2 border-t border-glass-border">
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
                           {getUserPreview(comment.user) ? (
                             <UserHoverCard user={getUserPreview(comment.user)!}>
                               <div className="flex items-center gap-3 group/user cursor-pointer">
                                 {(() => {
                                   const commentUser = getUserPreview(comment.user)!;
                                   return (
                                     <>
                                 <Avatar 
                                   src={commentUser.avatar} 
                                   fallback={commentUser.firstName || '?'} 
                                   color={commentUser.profileColor}
                                   size="sm"
                                 />
                                 <div>
                                   <p className="text-sm font-medium text-text-main group-hover/user:text-accent-primary transition-colors">
                                     {`${commentUser.firstName} ${commentUser.lastName}`}
                                   </p>
                                   <p className="text-xs text-text-muted">
                                     {format(new Date(comment.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
                                   </p>
                                 </div>
                                     </>
                                   );
                                 })()}
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
	                        {currentUser && getUserPreview(comment.user)?._id === currentUser._id && (
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
                        <p className="text-sm text-text-dim whitespace-pre-wrap leading-relaxed">
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
                <p className="text-xs font-bold text-text-dim uppercase tracking-wider">Date d&apos;échéance</p>
                <p className="text-xl font-bold text-text-main">
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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg-tertiary/50 hover:bg-glass-hover text-text-dim hover:text-text-main transition-colors text-sm font-medium border border-transparent hover:border-glass-border"
            >
              <Edit className="w-4 h-4 text-text-muted" />
              Modifier la tâche
            </button>
            <button 
              onClick={() => {
                if (task.source !== 'objective_checkpoint') {
                  handleDeleteTask();
                }
              }}
              disabled={task.source === 'objective_checkpoint'}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors text-sm font-medium border border-transparent hover:border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {task.source === 'objective_checkpoint' ? 'Supprimer depuis l\'objectif' : 'Supprimer'}
            </button>
          </div>

          {task.source === 'objective_checkpoint' && (
            <div className="glass-card p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Synchronisation active</p>
              <p className="text-sm text-text-muted">
                Cette tâche est générée par un checkpoint d&apos;objectif. Le titre, la priorité, l&apos;échéance,
                les assignés et le statut restent synchronisés.
              </p>
            </div>
          )}

          {/* Attachments */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-accent-primary" />
              Pièces jointes
            </h3>
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary border border-glass-border hover:bg-glass-hover transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                      <Paperclip className="w-4 h-4 text-accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main truncate">Document {i + 1}</p>
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
        task={task ? toEditTask(task) : null}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
}
