'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';
import RoutineCalendar from '@/components/ui/RoutineCalendar';
import type { Routine } from '@/types';

const demoRoutines: Routine[] = [
  {
    _id: '1',
    title: 'Post Instagram',
    description: 'Publication quotidienne Instagram',
    project: '4',
    projectColor: '#ef4444',
    creator: '1',
    days: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
    time: '10:00',
    isActive: true,
    color: '#ef4444',
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Story Instagram',
    description: 'Stories journalières',
    project: '4',
    projectColor: '#8b5cf6',
    creator: '1',
    days: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
    time: '18:00',
    isActive: true,
    color: '#8b5cf6',
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'Newsletter',
    description: 'Envoi newsletter hebdomadaire',
    project: '2',
    projectColor: '#3b82f6',
    creator: '1',
    days: { monday: false, tuesday: false, wednesday: false, thursday: true, friday: false, saturday: false, sunday: false },
    time: '09:00',
    isActive: true,
    color: '#3b82f6',
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    title: 'Revue projets',
    description: 'Revue hebdomadaire des projets',
    project: '1',
    projectColor: '#22c55e',
    creator: '1',
    days: { monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
    time: '08:00',
    isActive: true,
    color: '#22c55e',
    completedDates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function RoutinesPage() {
  const [routines] = useState<Routine[]>(demoRoutines);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeRoutines = routines.filter(r => r.isActive);
  const inactiveRoutines = routines.filter(r => !r.isActive);

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
            transition-all duration-200
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
        <RoutineCalendar routines={activeRoutines} />
      </motion.section>

      {/* List of Routines */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Toutes les routines</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRoutines.map((routine, index) => (
            <motion.div
              key={routine._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: routine.color }}
                />
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{routine.title}</h3>
                  {routine.description && (
                    <p className="text-gray-500 text-sm mb-3">{routine.description}</p>
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
                            w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium
                            ${isActive 
                              ? 'text-white' 
                              : 'bg-[rgba(255,255,255,0.03)] text-gray-600'}
                          `}
                          style={isActive ? { backgroundColor: routine.color } : {}}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>

                  {/* Time & Status */}
                  <div className="flex items-center justify-between">
                    {routine.time && (
                      <span className="text-xs text-gray-500">
                        🕐 {routine.time}
                      </span>
                    )}
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${routine.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'}
                    `}>
                      {routine.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {activeRoutines.length === 0 && (
          <div className="glass-card p-12 text-center">
            <RotateCcw className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Aucune routine</h3>
            <p className="text-gray-500 text-sm mb-4">
              Créez des routines récurrentes pour automatiser vos tâches
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                px-4 py-2 rounded-xl
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white font-medium text-sm
              "
            >
              Créer une routine
            </button>
          </div>
        )}
      </motion.section>
    </div>
  );
}
