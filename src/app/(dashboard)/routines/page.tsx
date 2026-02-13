'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, RotateCcw, Trash2, CheckCircle2, Circle } from 'lucide-react';
import RoutineCalendar from '@/components/ui/RoutineCalendar';
import { useAppStore, useAuthStore } from '@/store';
import type { Routine } from '@/types';
import toast from 'react-hot-toast';
import CreateRoutineModal from '@/components/modals/CreateRoutineModal';

export default function RoutinesPage() {
  const { routines, setRoutines, deleteRoutine, updateRoutine } = useAppStore();
  const { token } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/routines', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setRoutines(data.data);
        } else {
          toast.error(data.error || 'Erreur lors du chargement des routines');
        }
      } catch {
        toast.error('Erreur lors du chargement des routines');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchRoutines();
    }
  }, [token, setRoutines]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    updateRoutine(id, { isActive: !currentStatus });

    try {
      const response = await fetch(`/api/routines?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        // Revert on error
        updateRoutine(id, { isActive: currentStatus });
        toast.error('Erreur lors de la mise à jour');
      }
    } catch {
      updateRoutine(id, { isActive: currentStatus });
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette routine ?')) return;

    // Optimistic update
    deleteRoutine(id);

    try {
      const response = await fetch(`/api/routines?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Routine supprimée');
      } else {
        // Fetch again to revert or handle error properly
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleRoutineClick = async (routine: Routine, date: Date) => {
      // Optimistic update would be complex here because we need to parse dates
      // Let's rely on fast API response or simple toggle locally if possible
      // For now, just call API
      
      try {
        const response = await fetch('/api/routines?id=' + routine._id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ toggleDate: date.toISOString() }),
        });

        const data = await response.json();
        
        if (data.success) {
           // Update local state by replacing the routine
           const updatedRoutines = routines.map(r => r._id === routine._id ? data.data : r);
           setRoutines(updatedRoutines);
           toast.success('Statut mis à jour');
        } else {
           toast.error('Erreur lors de la mise à jour');
        }
      } catch {
        toast.error('Erreur de connexion');
      }
  };

  const activeRoutines = routines.filter(r => r.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-indigo-400" />
            Routines
          </h1>
          <p className="text-gray-500 mt-1">
            {activeRoutines.length} routines actives
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="
            px-4 py-2.5 rounded-xl flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white font-medium text-sm
            hover:from-indigo-500 hover:to-purple-500
            transition-all duration-200 shadow-lg shadow-indigo-500/20
          "
        >
          <Plus className="w-4 h-4" />
          Nouvelle routine
        </motion.button>
      </motion.div>

      {/* Routine Calendar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <RoutineCalendar routines={activeRoutines} onRoutineClick={handleRoutineClick} />
      </motion.section>

      {/* List of Routines */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Toutes les routines</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine, index) => (
            <motion.div
              key={routine._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-5 group relative border-l-4 ${!routine.isActive ? 'opacity-75 grayscale-[0.5]' : ''}`}
              style={{ borderLeftColor: routine.color }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium mb-1">{routine.title}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                        onClick={() => handleToggleStatus(routine._id, routine.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${routine.isActive ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-400 hover:bg-gray-400/10'}`}
                        title={routine.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {routine.isActive ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(routine._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {routine.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{routine.description}</p>
                  )}
                  
                  {/* Days */}
                  <div className="flex gap-1.5 mb-3">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                      const isActive = routine.days[dayKeys[i] as keyof typeof routine.days];
                      
                      return (
                        <span
                          key={i}
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium border
                            ${isActive 
                              ? 'text-white border-transparent' 
                              : 'bg-transparent border-white/5 text-gray-700'}
                          `}
                          style={isActive ? { backgroundColor: `${routine.color}40`, color: routine.color } : {}}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>

                  {/* Time & Status */}
                  <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                    {routine.time && (
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                        🕐 {routine.time}
                      </span>
                    )}
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                      ${routine.isActive 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-gray-500/10 text-gray-500'}
                    `}>
                      {routine.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && routines.length === 0 && (
          <div className="glass-card p-12 text-center mt-8 border-dashed border-2 border-white/5">
            <RotateCcw className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-medium mb-2">Aucune routine</h3>
            <p className="text-gray-500 text-sm mb-4">
              Créez des routines récurrentes pour automatiser vos tâches
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                px-4 py-2 rounded-xl
                bg-white/5 border border-white/10
                text-white font-medium text-sm
                hover:bg-white/10
                transition-all
              "
            >
              Créer une routine
            </button>
          </div>
        )}
      </motion.section>
      
      <CreateRoutineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
