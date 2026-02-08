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
import type { Task, Routine } from '@/types';

interface CustomCalendarProps {
  tasks?: Task[];
  routines?: Routine[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

export default function CustomCalendar({
  tasks = [],
  routines = [],
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

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
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
          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <motion.h2
          key={currentMonth.toString()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-white capitalize"
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

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {orderedDays.map((dayName) => (
          <div
            key={dayName}
            className="py-2 text-center text-xs font-medium text-gray-500 uppercase"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="wait">
          {days.map((dayDate, index) => {
            const dayTasks = getTasksForDate(dayDate);
            const isCurrentMonth = isSameMonth(dayDate, currentMonth);
            const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
            const hasTasks = dayTasks.length > 0;

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
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-indigo-500 text-white' : ''}
                  ${isToday(dayDate) && !isSelected ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50' : ''}
                  ${!isSelected && isCurrentMonth ? 'hover:bg-[rgba(255,255,255,0.05)]' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${!isCurrentMonth ? 'text-gray-600' : isSelected ? 'text-white' : isToday(dayDate) ? 'text-indigo-400' : 'text-gray-300'}
                `}>
                  {format(dayDate, 'd')}
                </span>
                
                {/* Task indicators */}
                {hasTasks && (
                  <div className="flex gap-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((task, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: task.projectColor || '#6366f1' }}
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
      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Tâches</span>
        </div>
      </div>
    </div>
  );
}
