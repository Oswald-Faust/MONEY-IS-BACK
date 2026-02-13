'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Target, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  Trash2,
  Edit,
  TrendingUp,
  Circle,
  Check
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore, useAppStore } from '@/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateObjectiveModal from '@/components/modals/CreateObjectiveModal';

interface Checkpoint {
  _id: string;
  title: string;
  completed: boolean;
}

interface Objective {
  _id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  checkpoints: Checkpoint[];
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
  targetDate?: string;
  createdAt: string;
  assignee?: string | { _id: string; firstName: string; lastName: string; avatar?: string };
}

const statusConfig = {
  not_started: { label: 'Pas commencé', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Circle },
  in_progress: { label: 'En cours', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  completed: { label: 'Terminé', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
};

const priorityConfig = {
  high: { label: 'Haute', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  medium: { label: 'Moyenne', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  low: { label: 'Basse', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

export default function ObjectiveDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { deleteObjective: deleteStoreObjective } = useAppStore();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchObjective = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/objectives?id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setObjective(data.data);
        } else {
          toast.error(data.error || 'Objectif non trouvé');
          router.push('/objectives');
        }
      } catch {
        toast.error('Erreur lors du chargement de l\'objectif');
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjective();
  }, [id, token, router]);

  const handleDelete = async () => {
    if (!token || !objective) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
        try {
            const response = await fetch(`/api/objectives?id=${objective._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                deleteStoreObjective(objective._id);
                toast.success('Objectif supprimé');
                router.back();
            } else {
                toast.error(data.error || 'Erreur lors de la suppression');
            }
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!objective) return null;

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
                {objective.project && (
                  <Link href={`/projects/${objective.project._id}`}>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={{ 
                        backgroundColor: `${objective.project.color}10`,
                        color: objective.project.color,
                        borderColor: `${objective.project.color}20` 
                      }}
                    >
                      {objective.project.name}
                    </span>
                  </Link>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityConfig[objective.priority].color}`}>
                  {priorityConfig[objective.priority].label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${statusConfig[objective.status].color}`}>
                  {statusConfig[objective.status].label}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">{objective.title}</h1>
            </div>

            <button className="p-2 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                {objective.creator?.avatar ? (
                  <img src={objective.creator.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  objective.creator?.firstName?.[0] || '?'
                )}
              </div>
              <span>
                {objective.creator && typeof objective.creator === 'object' && 'firstName' in objective.creator
                  ? `Défini par ${objective.creator.firstName} ${objective.creator.lastName}`
                  : 'Défini par Utilisateur inconnu'}
              </span>
            </div>
            {objective.targetDate && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Objectif pour le {format(new Date(objective.targetDate), 'd MMMM yyyy', { locale: fr })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Progression
                  </h3>
                  <span className="text-2xl font-bold text-indigo-400">{objective.progress}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${objective.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                  />
              </div>
            </div>

          {/* Description Card */}
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-dim uppercase tracking-wider">Description</h3>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
                {objective.description || 'Aucune description fournie.'}
              </p>
            </div>
          </div>

          {/* Checkpoints */}
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-dim uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Étapes clés ({objective.checkpoints.filter(c => c.completed).length}/{objective.checkpoints.length})
            </h3>
            
            <div className="space-y-3">
              {objective.checkpoints.length > 0 ? (
                objective.checkpoints.map((checkpoint) => (
                  <div 
                    key={checkpoint._id} 
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-all
                      ${checkpoint.completed 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : 'bg-white/5 border-white/5'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center border transition-all
                      ${checkpoint.completed
                        ? 'bg-green-500 border-green-500 text-black'
                        : 'border-white/20 text-transparent'}
                    `}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={checkpoint.completed ? 'text-gray-400 line-through' : 'text-white'}>
                      {checkpoint.title}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-dim italic">Aucune étape définie</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="glass-card p-4 space-y-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-dim hover:text-white transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Modifier l&apos;objectif
            </button>
            <button 
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
          
            {/* Create Activity Logs Placeholder */}
           <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Activité
            </h3>
             <p className="text-sm text-dim italic">Bientôt disponible</p>
          </div>

        </div>
      </div>
      <CreateObjectiveModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
            setIsEditModalOpen(false);
            // Refresh data on close if needed, but optimally update via store or just reload page part
            // For simplicity, we can reload the page data:
            if (!isEditModalOpen) return; // Prevent loop
             fetch(`/api/objectives?id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              .then(res => res.json())
              .then(data => {
                  if (data.success) setObjective(data.data);
              });
        }} 
        initialData={objective as any} 
      />
    </div>
  );
}
