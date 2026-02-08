'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
import type { Task } from '@/types';

// Demo tasks
const demoTasks: Task[] = [
  {
    _id: '1',
    title: 'Meeting FINEA',
    project: '1',
    projectName: 'FINEA',
    projectColor: '#22c55e',
    creator: '1',
    priority: 'important',
    status: 'todo',
    dueDate: new Date().toISOString(),
    tags: [],
    subtasks: [],
    attachments: [],
    comments: [],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Review BUISPACE',
    project: '2',
    projectName: 'BUISPACE',
    projectColor: '#f97316',
    creator: '1',
    priority: 'less_important',
    status: 'todo',
    dueDate: addDays(new Date(), 2).toISOString(),
    tags: [],
    subtasks: [],
    attachments: [],
    comments: [],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'Call avec Gabriel',
    project: '2',
    projectName: 'BUISPACE',
    projectColor: '#f97316',
    creator: '1',
    priority: 'important',
    status: 'todo',
    dueDate: addDays(new Date(), 5).toISOString(),
    tags: [],
    subtasks: [],
    attachments: [],
    comments: [],
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return demoTasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  // Days of week header (starting Monday)
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

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
            <CalendarIcon className="w-8 h-8 text-indigo-400" />
            Calendrier Global
          </h1>
          <p className="text-gray-500 mt-1">
            Vue d'ensemble de toutes vos tâches
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            px-4 py-2.5 rounded-xl flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white font-medium text-sm
            hover:from-indigo-500 hover:to-purple-500
            transition-all duration-200
          "
        >
          <Plus className="w-4 h-4" />
          Ajouter un événement
        </motion.button>
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
                  className="py-3 text-center text-sm font-medium text-gray-500"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
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
                      ${!isCurrentMonth ? 'text-gray-600' : isSelected ? 'text-indigo-400' : isToday(dayDate) ? 'text-indigo-400' : 'text-gray-300'}
                    `}>
                      {format(dayDate, 'd')}
                    </span>
                    
                    {/* Task indicators */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task._id}
                          className="text-xs truncate px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${task.projectColor}25`,
                            color: task.projectColor,
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayTasks.length - 3} autres
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
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedDate
                ? format(selectedDate, 'EEEE d MMMM', { locale: fr })
                : "Sélectionnez une date"}
            </h3>

            {selectedDate && (
              <>
                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-3 rounded-xl border"
                        style={{
                          backgroundColor: `${task.projectColor}10`,
                          borderColor: `${task.projectColor}30`,
                        }}
                      >
                        <p className="text-sm font-medium text-white mb-1">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.projectColor }}
                          />
                          <span className="text-xs text-gray-500">
                            {task.projectName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Aucune tâche prévue
                    </p>
                    <button className="mt-3 text-sm text-indigo-400 hover:text-indigo-300">
                      + Ajouter une tâche
                    </button>
                  </div>
                )}
              </>
            )}

            {!selectedDate && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
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
