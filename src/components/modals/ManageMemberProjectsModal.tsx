
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FolderKanban, Check, Loader2 } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

interface ManageMemberProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  workspaceId: string;
}

export default function ManageMemberProjectsModal({
  isOpen,
  onClose,
  memberId,
  memberName,
  workspaceId
}: ManageMemberProjectsModalProps) {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const { projects, setProjects } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize selection based on current project memberships
  useEffect(() => {
    if (isOpen && projects.length > 0) {
      const currentProjectIds = projects
        .filter(project => {
            return project.members.some(m => {
                const id = typeof m.user === 'string' ? m.user : m.user._id;
                return id === memberId;
            });
        })
        .map(p => p._id);
      
      setSelectedIds(currentProjectIds);
    }
  }, [isOpen, projects, memberId]);

  const toggleProject = (projectId: string) => {
    setSelectedIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/workspaces/members/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            userId: memberId,
            workspaceId,
            projectIds: selectedIds
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t.inviteModal.accessUpdated);
        // Refresh projects to update member lists in store
        try {
            const projectsRes = await fetch(`/api/projects?workspace=${workspaceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const projectsData = await projectsRes.json();
            if (projectsData.success) {
                setProjects(projectsData.data);
            }
        } catch (err) {
            console.error('Failed to refresh projects', err);
        }
        onClose();
      } else {
        toast.error(data.error || 'echec');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-bg-secondary border border-glass-border rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-bg-tertiary">
            <div>
                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-indigo-400" />
                    {t.inviteModal.manageProjectsTitle}
                </h2>
                <p className="text-sm text-text-dim mt-1">
                    Pour <span className="font-bold text-text-main">{memberName}</span>
                </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <p className="text-sm text-text-dim">
                {t.inviteModal.manageProjectsSubtitle}
            </p>

            <div className="space-y-2">
                {projects.map(project => {
                    const isSelected = selectedIds.includes(project._id);
                    return (
                        <button
                            key={project._id}
                            onClick={() => toggleProject(project._id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                                isSelected 
                                    ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                                    : 'bg-bg-tertiary border-glass-border hover:bg-glass-hover'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-indigo-500 text-white' : 'bg-bg-secondary border border-glass-border group-hover:border-text-muted'
                            }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            
                            <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: project.color }}
                            />
                            
                            <div className="flex-1 min-w-0">
                                <span className={`font-medium truncate ${isSelected ? 'text-indigo-400' : 'text-text-main'}`}>
                                    {project.name}
                                </span>
                            </div>
                        </button>
                    );
                })}

                {projects.length === 0 && (
                    <div className="text-center py-8 text-text-dim border border-dashed border-glass-border rounded-xl">
                        Aucun projet disponible
                    </div>
                )}
            </div>
          </div>

          <div className="p-6 border-t border-glass-border bg-bg-tertiary flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-text-dim hover:text-text-main hover:bg-glass-hover transition-colors font-medium"
            >
                {t.common.cancel}
            </button>
            <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.inviteModal.updateAccess}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
