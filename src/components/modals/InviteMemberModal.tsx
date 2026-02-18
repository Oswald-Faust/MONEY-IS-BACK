
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Crown, User, Shield, Loader2, FolderKanban, Check, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useAppStore } from '@/store';
import { useTranslation } from '@/lib/i18n';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export default function InviteMemberModal({ isOpen, onClose, workspaceId, onSuccess }: InviteMemberModalProps) {
  const { token } = useAuthStore();
  const { projects } = useAppStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'visitor'>('editor');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string; token: string } | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState(false);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (isOpen) {
      setSuccessData(null);
      setEmail('');
      setRole('editor');
      setSelectedProjectIds([]);
      setAllProjects(false);
    }
  }, [isOpen]);

  const toggleProject = (projectId: string) => {
    if (allProjects) {
      setAllProjects(false);
      setSelectedProjectIds([projectId]);
    } else {
      setSelectedProjectIds(prev =>
        prev.includes(projectId)
          ? prev.filter(id => id !== projectId)
          : [...prev, projectId]
      );
    }
  };

  const toggleAllProjects = () => {
    setAllProjects(prev => !prev);
    setSelectedProjectIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const projectIds = allProjects ? projects.map(p => p._id) : selectedProjectIds;

      const response = await fetch('/api/workspaces/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId, email, role, projectIds })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessData({
          email,
          token: data.invitation?.token || ''
        });
        setEmail('');
        setRole('editor');
        setSelectedProjectIds([]);
        setAllProjects(false);
        onSuccess();
      } else {
        toast.error(data.error || t.inviteModal.toasts.error);
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error(t.inviteModal.toasts.error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const roleOptions = [
    { value: 'admin', label: t.inviteModal.roles.admin, icon: Crown, desc: t.inviteModal.roles.adminDesc },
    { value: 'editor', label: t.inviteModal.roles.editor, icon: User, desc: t.inviteModal.roles.editorDesc },
    { value: 'visitor', label: t.inviteModal.roles.visitor, icon: Shield, desc: t.inviteModal.roles.visitorDesc },
  ];

  const selectedCount = allProjects ? projects.length : selectedProjectIds.length;

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
          className="relative w-full max-w-lg bg-bg-secondary border border-glass-border rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-bg-tertiary">
            <h2 className="text-xl font-bold text-text-main">{t.inviteModal.title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-glass-hover text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successData ? (
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2 ring-1 ring-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-main">{t.inviteModal.successTitle}</h3>
                  <p className="text-text-dim mt-1">
                    {t.inviteModal.successDesc} <span className="text-text-main font-medium">{successData.email}</span>.
                  </p>
                </div>
              </div>

              <div className="bg-bg-tertiary border border-glass-border rounded-2xl p-4 space-y-3">
                <p className="text-sm text-text-dim">
                  {t.inviteModal.copyLinkDesc}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-input-bg border border-glass-border rounded-lg px-3 py-2 text-xs text-text-main break-all font-mono">
                    {typeof window !== 'undefined' ? `${window.location.origin}/join/${successData.token}` : ''}
                  </code>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/join/${successData.token}`;
                      navigator.clipboard.writeText(link);
                      toast.success(t.inviteModal.linkCopied);
                    }}
                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                    title="Copier"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-bg-tertiary text-text-main font-bold hover:bg-glass-hover transition-all border border-glass-border"
              >
                {t.inviteModal.done}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim ml-1">{t.inviteModal.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.inviteModal.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-input-bg border border-input-border rounded-2xl text-text-main outline-none focus:border-indigo-500/50 transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-dim ml-1">{t.inviteModal.roleLabel}</label>
                <div className="grid grid-cols-1 gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value as 'admin' | 'editor' | 'visitor')}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                        ${role === option.value
                          ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/20'
                          : 'bg-bg-tertiary border-glass-border hover:bg-glass-hover'}
                      `}
                    >
                      <div className={`p-2 rounded-lg ${role === option.value ? 'bg-indigo-500/20 text-indigo-400' : 'bg-bg-secondary text-text-muted'}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`font-bold ${role === option.value ? 'text-indigo-600 dark:text-text-main' : 'text-text-main'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-text-dim">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Access */}
              {projects.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-dim ml-1 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" />
                      {t.inviteModal.projectAccess}
                    </label>
                    {selectedCount > 0 && (
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {allProjects 
                          ? `(${projects.length})` 
                          : selectedCount === 1 
                            ? t.inviteModal.oneProjectSelected 
                            : t.inviteModal.soManyProjectsSelected.replace('{count}', selectedCount.toString())}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 bg-bg-tertiary rounded-2xl border border-glass-border overflow-hidden">
                    {/* All Projects option */}
                    <button
                      type="button"
                      onClick={toggleAllProjects}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-glass-border ${
                        allProjects
                          ? 'bg-indigo-500/10'
                          : 'hover:bg-glass-hover'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        allProjects
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-glass-border bg-bg-secondary'
                      }`}>
                        {allProjects && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text-main text-sm">{t.inviteModal.allProjects}</div>
                        <div className="text-xs text-text-muted">
                            {projects.length > 1 
                                ? t.inviteModal.projectsAvailablePlural.replace('{count}', projects.length.toString()) 
                                : t.inviteModal.projectsAvailable.replace('{count}', projects.length.toString())}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    </button>

                    {/* Individual projects */}
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                      {projects.map((project) => {
                        const isSelected = allProjects || selectedProjectIds.includes(project._id);
                        return (
                          <button
                            key={project._id}
                            type="button"
                            onClick={() => toggleProject(project._id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                              isSelected && !allProjects
                                ? 'bg-indigo-500/5'
                                : 'hover:bg-glass-hover'
                            } ${allProjects ? 'opacity-60 cursor-default' : ''}`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-glass-border bg-bg-secondary'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="text-sm text-text-main font-medium truncate">{project.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted ml-1">
                    {t.inviteModal.noProjectSelected}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.inviteModal.sendInvitation}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
