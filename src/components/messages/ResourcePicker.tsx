import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Target, File, Folder, LayoutDashboard, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/store';
import { Task, Objective, DriveFile, DriveFolder, MessageAttachment } from '@/types';

interface ResourcePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: MessageAttachment['type'], id: string, name: string) => void;
}

export default function ResourcePicker({ isOpen, onClose, onSelect }: ResourcePickerProps) {
  const { tasks, objectives, ideas, driveFiles, driveFolders } = useAppStore();
  const [activeTab, setActiveTab] = useState<MessageAttachment['type']>('task');
  const [searchQuery, setSearchQuery] = useState('');

  // No longer returning null early to allow AnimatePresence to work efficiently from parent if needed, 
  // but here we use it interally for the conditional rendering of the motion div.
  
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'task':
        return tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
      case 'objective':
        return objectives.filter(o => o.title.toLowerCase().includes(searchQuery.toLowerCase()));
      case 'idea':
        return ideas.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-24 z-50 w-full md:w-[500px] h-[500px] bg-bg-secondary border border-glass-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-glass-border flex items-center justify-between bg-bg-secondary/50 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4" />
                </span>
                Partager une ressource
            </h2>
            <button 
                onClick={onClose} 
                className="p-2 text-text-muted hover:text-text-main hover:bg-glass-hover rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-glass-border overflow-x-auto bg-bg-secondary">
            {[
              { id: 'task', label: 'Tâches', icon: LayoutDashboard },
              { id: 'objective', label: 'Objectifs', icon: Target },
              { id: 'idea', label: 'Idées', icon: Lightbulb },
              { id: 'file', label: 'Fichiers', icon: File },
              { id: 'folder', label: 'Dossiers', icon: Folder },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MessageAttachment['type'])}
                className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-accent-primary text-accent-primary bg-accent-primary/5' 
                    : 'border-transparent text-text-muted hover:text-text-main hover:bg-glass-hover'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search & List */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden bg-bg-primary">
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher un(e) ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary border border-glass-border rounded-xl text-sm text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-3">
                    <Search className="w-8 h-8 opacity-20" />
                  <p className="text-sm italic">Aucun résultat trouvé</p>
                </div>
              ) : (
                filteredItems.map((item: any) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      onSelect(activeTab, item._id, item.title || item.name);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent-primary/10 hover:border-accent-primary/20 border border-transparent transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-bg-tertiary border border-glass-border flex items-center justify-center text-text-muted group-hover:text-accent-primary group-hover:border-accent-primary/30 transition-colors`}>
                      {activeTab === 'task' && <LayoutDashboard className="w-5 h-5" />}
                      {activeTab === 'objective' && <Target className="w-5 h-5" />}
                      {activeTab === 'idea' && <Lightbulb className="w-5 h-5" />}
                      {activeTab === 'file' && <File className="w-5 h-5" />}
                      {activeTab === 'folder' && <Folder className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-dim group-hover:text-text-main truncate transition-colors">{item.title || item.name}</p>
                      {item.projectName && <p className="text-[11px] text-text-muted">{item.projectName}</p>}
                    </div>
                    <div className="w-8 h-8 rounded-full border border-glass-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                         <Check className="w-4 h-4 text-accent-primary" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
