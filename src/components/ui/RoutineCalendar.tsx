'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isSameDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Routine } from '@/types';

interface RoutineCalendarProps {
  routines?: Routine[];
  onRoutineClick?: (routine: Routine, date: Date) => void;
  onMarkComplete?: (routineId: string, date: Date) => void;
}

const dayMapping: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function RoutineCalendar({
  routines = [],
  onRoutineClick,
}: RoutineCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  // Generate week days
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  // Get routines for a specific day
  const getRoutinesForDay = (dayIndex: number) => {
    const dayKey = Object.keys(dayMapping).find((key) => dayMapping[key] === (dayIndex === 6 ? 0 : dayIndex + 1));
    if (!dayKey) return [];
    
    return routines.filter((routine) => routine.isActive && routine.days[dayKey as keyof typeof routine.days]);
  };

  // Check if routine is completed for a specific date
  const isRoutineCompleted = (routine: Routine, date: Date) => {
    return routine.completedDates?.some((completedDate) => 
      isSameDay(new Date(completedDate), date)
    );
  };

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-glass-bg">
        <button
          onClick={prevWeek}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-glass-hover text-dim hover:text-main transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Précédent</span>
        </button>
        
        <div className="text-center px-4 py-2 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Semaine actuelle</p>
          <motion.h3
            key={weekStart.toString()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs sm:text-sm font-bold text-main whitespace-nowrap"
          >
            {isMobile 
              ? `${format(weekStart, 'dd/MM')} — ${format(weekEnd, 'dd/MM')}`
              : `${format(weekStart, 'd MMMM', { locale: fr })} — ${format(weekEnd, 'd MMMM', { locale: fr })}`
            }
          </motion.h3>
        </div>
        
        <button
          onClick={nextWeek}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-glass-hover text-dim hover:text-main transition-all"
        >
          <span className="hidden sm:inline text-sm font-medium">Suivant</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Grid */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-7 md:divide-x divide-y md:divide-y-0 divide-glass-border/20">
          {weekDays.map((dayDate, dayIndex) => {
            const dayRoutines = getRoutinesForDay(dayIndex);
            const isToday = isSameDay(dayDate, new Date());
            
            return (
              <div key={dayIndex} className="min-h-[350px] flex flex-col">
                {/* Day Header */}
                <div className={`
                  p-5 text-center
                  ${isToday ? 'bg-indigo-500/5' : ''}
                `}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-indigo-400' : 'text-dim'}`}>
                    {dayNames[dayIndex]}
                  </p>
                  <p className={`
                    text-lg font-black
                    ${isToday ? 'text-main' : 'text-dim/70'}
                  `}>
                    {format(dayDate, 'd')}
                  </p>
                </div>

                {/* Routines Container */}
                <div className="p-4 flex-1 space-y-3 bg-glass-bg">
                  <AnimatePresence mode="popLayout">
                    {dayRoutines.map((routine) => {
                      const isCompleted = isRoutineCompleted(routine, dayDate);
                      const color = routine.color || routine.projectColor || '#6366f1';
                      
                      return (
                        <motion.div
                          key={routine._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                           whileHover={{ scale: 1.02, backgroundColor: 'var(--glass-hover)' }}
                          onClick={() => onRoutineClick?.(routine, dayDate)}
                           className={`
                             p-3 rounded-xl cursor-pointer
                             transition-all duration-300 shadow-sm
                             ${isCompleted ? 'opacity-30' : 'hover:shadow-lg'}
                           `}
                          style={{
                            backgroundColor: `${color}10`,
                            borderLeft: `4px solid ${color}`,
                          }}
                        >
                          <p className={`
                            text-xs font-bold text-main mb-1 leading-tight line-clamp-2
                            ${isCompleted ? 'line-through' : ''}
                          `}>
                            {routine.title}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-1">
                               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                               <span className="text-[10px] text-dim font-bold uppercase tracking-tighter">PH</span>
                             </div>
                             {routine.time && (
                               <span className="text-[10px] text-dim font-medium">{routine.time}</span>
                             )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {dayRoutines.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-10">
                      <Clock className="w-10 h-10 mb-2" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
