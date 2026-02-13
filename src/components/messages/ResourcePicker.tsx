'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Target, File, Folder, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/store';
import { Task, Objective, DriveFile, DriveFolder, MessageAttachment } from '@/types';

interface ResourcePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: MessageAttachment['type'], id: string, name: string) => void;
}

export default function ResourcePicker({ isOpen, onClose, onSelect }: ResourcePickerProps) {
  const { tasks, objectives, driveFiles, driveFolders } = useAppStore();
  const [activeTab, setActiveTab] = useState<MessageAttachment['type']>('task');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'task':
        return tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
      case 'objective':
        return objectives.filter(o => o.title.toLowerCase().includes(searchQuery.toLowerCase()));
      case 'file':
        return driveFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
      case 'folder':
        return driveFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
      default:
        return [];
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-secondary border border-glass-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-glass-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-main">Partager une ressource</h2>
          <button onClick={onClose} className="p-2 text-dim hover:text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-glass-border">
          {[
            { id: 'task', label: 'Tâches', icon: LayoutDashboard },
            { id: 'objective', label: 'Objectifs', icon: Target },
            { id: 'file', label: 'Fichiers', icon: File },
            { id: 'folder', label: 'Dossiers', icon: Folder },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MessageAttachment['type'])}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-dim hover:text-main hover:bg-glass-hover'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher un(e) ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-sm text-main placeholder-dim focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-dim text-sm italic">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredItems.map((item: any) => (
                <button
                  key={item._id}
                  onClick={() => {
                    onSelect(activeTab, item._id, item.title || item.name);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-glass-hover transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400`}>
                    {activeTab === 'task' && <LayoutDashboard className="w-4 h-4" />}
                    {activeTab === 'objective' && <Target className="w-4 h-4" />}
                    {activeTab === 'file' && <File className="w-4 h-4" />}
                    {activeTab === 'folder' && <Folder className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-main truncate">{item.title || item.name}</p>
                    {item.projectName && <p className="text-[10px] text-dim">{item.projectName}</p>}
                  </div>
                  <Check className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100" />
                </button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
