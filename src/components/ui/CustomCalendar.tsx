'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task, Routine, Objective } from '@/types';

interface CustomCalendarProps {
  tasks?: Task[];
  objectives?: Objective[];
  routines?: Routine[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

export default function CustomCalendar({
  tasks = [],
  objectives = [],
  onDateClick,
  selectedDate,
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate calendar days
  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });

    const dayObjectives = objectives.filter((obj) => {
      if (!obj.targetDate) return false;
      return isSameDay(new Date(obj.targetDate), date);
    });

    return [
      ...dayTasks.map(t => ({ ...t, type: 'task' as const })),
      ...dayObjectives.map(o => ({ ...o, type: 'objective' as const }))
    ];
  };

  // Days of week header
  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  // Reorder to start with Monday
  const orderedDays = [...daysOfWeek.slice(1), daysOfWeek[0]];

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <motion.h2
          key={currentMonth.toString()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-text-main capitalize"
        >
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </motion.h2>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {orderedDays.map((dayName) => (
          <div
            key={dayName}
            className="py-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="wait">
          {days.map((dayDate, index) => {
            const dayEvents = getEventsForDate(dayDate);
            const isCurrentMonth = isSameMonth(dayDate, currentMonth);
            const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
            const hasEvents = dayEvents.length > 0;

            return (
              <motion.button
                key={dayDate.toString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => onDateClick?.(dayDate)}
                className={`
                  relative aspect-square p-1 rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200 group
                  ${!isCurrentMonth ? 'opacity-20' : ''}
                  ${isSelected ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : ''}
                  ${isToday(dayDate) && !isSelected ? 'bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/50' : ''}
                  ${!isSelected && isCurrentMonth ? 'hover:bg-glass-hover' : ''}
                `}
              >
                <span className={`
                  text-sm font-bold
                  ${!isCurrentMonth ? 'text-text-muted' : isSelected ? 'text-white' : isToday(dayDate) ? 'text-accent-primary' : 'text-text-main'}
                `}>
                  {format(dayDate, 'd')}
                </span>
                
                {/* Event indicators */}
                {hasEvents && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${event.type === 'objective' ? 'ring-1 ring-offset-0 ring-current' : ''}`}
                        style={{ 
                          backgroundColor: event.type === 'task' ? (event.projectColor || '#6366f1') : 'transparent',
                          color: event.projectColor || '#ef4444'
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-primary" />
          <span>Aujourd&apos;hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Tâches</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full border border-red-500" />
          <span>Objectifs</span>
        </div>
      </div>
    </div>
  );
}
