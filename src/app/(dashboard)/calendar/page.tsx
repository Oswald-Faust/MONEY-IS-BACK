'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Target, CheckSquare } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppStore, useAuthStore } from '@/store';
import type { Task, Objective } from '@/types';
import toast from 'react-hot-toast';

type CalendarEvent = 
  | (Task & { type: 'task' }) 
  | (Objective & { type: 'objective' });

export default function CalendarPage() {
  const { token } = useAuthStore();
  const { 
    tasks, 
    setTasks, 
    objectives, 
    setObjectives 
  } = useAppStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate calendar days
  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasksData = await tasksRes.json();
        if (tasksData.success) {
          setTasks(tasksData.data);
        }

        // Fetch objectives
        const objectivesRes = await fetch('/api/objectives', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const objectivesData = await objectivesRes.json();
        if (objectivesData.success) {
          setObjectives(objectivesData.data);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, setTasks, setObjectives]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    }).map(t => ({ ...t, type: 'task' as const }));

    const dayObjectives = objectives.filter((obj) => {
      if (!obj.targetDate) return false;
      return isSameDay(new Date(obj.targetDate), date);
    }).map(o => ({ ...o, type: 'objective' as const }));

    return [...dayTasks, ...dayObjectives];
  };

  // Days of week header (starting Monday)
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-indigo-400" />
            Calendrier Global
          </h1>
          <p className="text-text-dim mt-1">
            Vue d&apos;ensemble de vos tâches et objectifs
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm bg-glass-bg px-4 py-2 rounded-xl border border-glass-border">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-text-dim">Tâches</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-red-500" />
                <span className="text-text-dim">Objectifs</span>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="glass-card p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <motion.h2
                key={currentMonth.toString()}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-white capitalize"
              >
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </motion.h2>
              
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeek.map((dayName) => (
                <div
                  key={dayName}
                  className="py-3 text-center text-sm font-medium text-text-muted"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayDate, index) => {
                const dayEvents = getEventsForDate(dayDate);
                const isCurrentMonth = isSameMonth(dayDate, currentMonth);
                const isSelected = selectedDate && isSameDay(dayDate, selectedDate);

                return (
                  <motion.button
                    key={dayDate.toString()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.005 }}
                    onClick={() => setSelectedDate(dayDate)}
                    className={`
                      relative min-h-[100px] p-2 rounded-xl flex flex-col
                      transition-all duration-200 text-left
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      ${isSelected ? 'bg-indigo-500/20 ring-2 ring-indigo-500/50' : 'hover:bg-[rgba(255,255,255,0.05)]'}
                      ${isToday(dayDate) && !isSelected ? 'bg-indigo-500/10' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium mb-2
                      ${!isCurrentMonth ? 'text-text-muted opacity-50' : isSelected ? 'text-accent-primary' : isToday(dayDate) ? 'text-accent-primary' : 'text-text-dim'}
                    `}>
                      {format(dayDate, 'd')}
                    </span>
                    
                    {/* Event indicators */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event._id}
                          className={`
                            text-xs truncate px-1.5 py-0.5 rounded flex items-center gap-1
                            ${event.type === 'objective' ? 'border border-current bg-transparent' : ''}
                          `}
                          style={{
                            backgroundColor: event.type === 'task' ? `${event.projectColor || '#6366f1'}25` : 'transparent',
                            color: event.projectColor || (event.type === 'objective' ? '#ef4444' : '#6366f1'),
                            borderColor: event.type === 'objective' ? (event.projectColor || '#ef4444') : 'transparent'
                          }}
                        >
                          <span className={`w-1 h-1 rounded-full flex-shrink-0 ${event.type === 'objective' ? 'bg-current' : ''}`} style={{ backgroundColor: event.type === 'task' ? 'currentColor' : undefined }} />
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayEvents.length - 3} autres
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Selected Date Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-5 sticky top-6">
            <h3 className="text-lg font-semibold text-text-main mb-4">
              {selectedDate
                ? format(selectedDate, 'EEEE d MMMM', { locale: fr })
                : "Sélectionnez une date"}
            </h3>

            {isLoading ? (
               <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
               </div>
            ) : selectedDate && (
              <>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event._id}
                        className="p-3 rounded-xl border relative overflow-hidden group"
                        style={{
                          backgroundColor: `${event.projectColor || '#6366f1'}10`,
                          borderColor: `${event.projectColor || '#6366f1'}30`,
                        }}
                      >
                         <div className="flex items-start justify-between gap-2">
                             <div className="flex-1">
                                <p className="text-sm font-medium text-white mb-1">
                                    {event.title}
                                </p>
                                <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: event.projectColor || '#6366f1' }}
                                />
                                <span className="text-xs text-gray-500">
                                    {event.projectName || 'Sans projet'}
                                </span>
                                </div>
                             </div>
                             
                             {/* Icon showing type */}
                             {event.type === 'task' ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500/50" />
                             ) : (
                                <Target className="w-4 h-4 text-red-500/50" />
                             )}
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
                    <p className="text-text-dim text-sm">
                      Aucun événement prévu
                    </p>
                  </div>
                )}
              </>
            )}

            {!selectedDate && (
              <div className="text-center py-8">
                <p className="text-text-dim text-sm">
                  Cliquez sur une date pour voir les détails
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
