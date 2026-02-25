import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mail,
  Trash2,
  Crown,
  UserPlus,
  Search,
  ChevronDown,
  Check,
  Shield,
  User,
  Copy,
  FolderKanban,
  RefreshCw
} from 'lucide-react';
import ManageMemberProjectsModal from '@/components/modals/ManageMemberProjectsModal';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore, useAppStore } from '@/store';
import toast from 'react-hot-toast';
import InviteMemberModal from '@/components/modals/InviteMemberModal';
import { useTranslation } from '@/lib/i18n';

interface Member {
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    role: string;
}

// Sub-component for Role Selector to manage its own state
const RoleSelector = ({
    member,
    onUpdate
}: {
    member: Member,
    onUpdate: (userId: string, role: string) => void
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roles = [
        { value: 'admin', label: t.workspaceMembers.roles.admin, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { value: 'editor', label: t.workspaceMembers.roles.editor, icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { value: 'visitor', label: t.workspaceMembers.roles.visitor, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    ];

    const currentRole = roles.find(r => r.value === member.role) || roles[1];

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border flex items-center gap-2 transition-all hover:bg-glass-hover ${currentRole.bg} ${currentRole.color} ${currentRole.border}`}
            >
                {currentRole.label}
                <ChevronDown className="w-3 h-3 opacity-50" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-glass-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {roles.map((role) => (
                            <button
                                key={role.value}
                                onClick={() => {
                                    onUpdate(member.user._id, role.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${member.role === role.value ? 'bg-white/[0.02]' : ''}`}
                            >
                                <div className={`p-1.5 rounded-lg ${role.bg} ${role.color}`}>
                                    <role.icon className="w-4 h-4" />
                                </div>
                                <span className={`text-sm font-medium ${member.role === role.value ? 'text-text-main' : 'text-text-dim'}`}>
                                    {role.label}
                                </span>
                                {member.role === role.value && (
                                    <Check className="w-3 h-3 ml-auto text-indigo-400" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function WorkspaceMembers() {
  const { token, user } = useAuthStore();
  const { currentWorkspace } = useAppStore();
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<{ _id: string; email: string; role: string; token: string; inviter?: { firstName: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [managingMember, setManagingMember] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace || !token) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/members?workspaceId=${currentWorkspace._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setMembers(data.data.members || []);
        setInvitations(data.data.invitations || []);
      } else {
        toast.error(data.error || t.workspaceMembers.toasts.loadError);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.workspaceMembers.toasts.loadError);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, token, t]);

  useEffect(() => {
    fetchMembers();
  }, [currentWorkspace, token, fetchMembers]);

  const removeMember = async (userId: string) => {
    if (!confirm(t.workspaceMembers.confirmRemoveMember)) return;

    try {
      const response = await fetch('/api/workspaces/members', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId: currentWorkspace?._id, userId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(t.workspaceMembers.toasts.memberRemoved);
        fetchMembers();
      } else {
        toast.error(data.error);
      }
    } catch {
       toast.error(t.workspaceMembers.toasts.removeError);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch('/api/workspaces/members', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId: currentWorkspace?._id, invitationId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(t.workspaceMembers.toasts.invitationCancelled);
        fetchMembers();
      } else {
        toast.error(data.error);
      }
    } catch {
       toast.error(t.workspaceMembers.toasts.cancelError);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    if (!currentWorkspace?._id || !token) return;

    try {
      setResendingInvitationId(invitationId);
      const response = await fetch('/api/workspaces/members', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId: currentWorkspace._id, invitationId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(t.workspaceMembers.toasts.invitationResent);
      } else {
        toast.error(data.error || t.workspaceMembers.toasts.resendError);
      }
    } catch {
      toast.error(t.workspaceMembers.toasts.resendError);
    } finally {
      setResendingInvitationId(null);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
        // Optimistic update
        setMembers(prev => prev.map(m => m.user._id === userId ? { ...m, role: newRole } : m));

        const response = await fetch('/api/workspaces/members', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                workspaceId: currentWorkspace?._id,
                userId,
                role: newRole
            })
        });

        const data = await response.json();

        if (data.success) {
            toast.success(t.workspaceMembers.toasts.roleUpdated);
        } else {
            toast.error(data.error);
            fetchMembers(); // Revert on error
        }
    } catch {
        toast.error(t.workspaceMembers.toasts.roleUpdateError);
        fetchMembers();
    }
  };

  // Filter logic
  const filteredMembers = members.filter(m =>
    m.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvitations = invitations.filter(i =>
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ownerId = currentWorkspace?.owner as string | undefined;

  // Check if current user is owner or admin
  const isOwner = ownerId === user?._id;

  // Find current user in members list to check role (if not owner)
  const currentUserMember = members.find((m: Member) => m.user._id === user?._id);
  const isAdmin = isOwner || (currentUserMember && currentUserMember.role === 'admin');

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return t.workspaceMembers.roles.admin;
    if (role === 'editor') return t.workspaceMembers.roles.editor;
    return t.workspaceMembers.roles.visitor;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            {t.workspaceMembers.title}
          </h2>
          <p className="text-sm text-text-dim">{t.workspaceMembers.subtitle}</p>
        </div>

        {isAdmin && (
            <button
                onClick={() => setInviteModalOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
                <UserPlus className="w-4 h-4" />
                {t.workspaceMembers.invitePeople}
            </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
            type="text"
            placeholder={t.workspaceMembers.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-bg border border-input-border rounded-xl pl-10 pr-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </div>

      {/* Lists */}
      <div className="space-y-8">
         {/* Pending Invitations */}
         {filteredInvitations.length > 0 && (
            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {t.workspaceMembers.pending} ({filteredInvitations.length})
                </h3>
                <div className="space-y-2">
                    {filteredInvitations.map((invitation) => (
                        <div key={invitation._id} className="p-4 flex items-center justify-between bg-bg-tertiary border border-glass-border rounded-2xl hover:bg-glass-hover transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-dim">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-text-main font-medium">{invitation.email}</div>
                                    <div className="text-xs text-text-dim flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-text-muted">{invitation.role}</span>
                                            <span className="hidden md:inline text-text-muted">{t.workspaceMembers.invitedBy} {invitation.inviter?.firstName || 'Admin'}</span>
                                        </div>
                                        <div className="font-mono text-[10px] text-indigo-400/80 truncate max-w-[200px] md:max-w-xs cursor-pointer hover:text-indigo-400 transition-colors" title="Cliquez pour copier" onClick={() => {
                                                const link = `${window.location.origin}/join/${invitation.token}`;
                                                navigator.clipboard.writeText(link);
                                                toast.success(t.inviteModal.linkCopied);
                                        }}>
                                            {typeof window !== 'undefined' ? `${window.location.origin}/join/${invitation.token}` : `/join/${invitation.token}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => resendInvitation(invitation._id)}
                                            disabled={resendingInvitationId === invitation._id}
                                            className="p-2 hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={t.workspaceMembers.resendInvitationTitle}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${resendingInvitationId === invitation._id ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/join/${invitation.token}`;
                                                navigator.clipboard.writeText(link);
                                                toast.success(t.inviteModal.linkCopied);
                                            }}
                                            className="p-2 hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 rounded-lg transition-colors"
                                            title="Copier le lien"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => cancelInvitation(invitation._id)}
                                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                                            title={t.workspaceMembers.cancelInvitationTitle}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}

         {/* Active Members */}
         <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Users className="w-4 h-4" /> {t.workspaceMembers.members} ({filteredMembers.length})
            </h3>
            <div className="space-y-2">
                {filteredMembers.map((member) => (
                    <div key={member.user._id} className="p-4 flex items-center justify-between bg-bg-tertiary border border-glass-border rounded-2xl hover:bg-glass-hover transition-colors">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={member.user.avatar}
                                fallback={member.user.firstName}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <div className="text-text-main font-medium flex items-center gap-2">
                                    {member.user.firstName} {member.user.lastName}
                                    {member.user._id === ownerId && (
                                        <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border border-amber-500/20 flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> {t.workspaceMembers.roles.owner}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-text-dim">{member.user.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAdmin && member.user._id !== ownerId && member.user._id !== user?._id ? (
                                <RoleSelector member={member} onUpdate={updateRole} />
                            ) : (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border ${
                                    member.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : member.role === 'editor'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                    {getRoleLabel(member.role)}
                                </span>
                            )}


                            
                            {isAdmin && member.user._id !== ownerId && (
                                <button
                                    onClick={() => setManagingMember({
                                        id: member.user._id, 
                                        name: `${member.user.firstName} ${member.user.lastName}`
                                    })}
                                    className="p-2 hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 rounded-lg transition-colors"
                                    title={t.inviteModal.manageProjectsTitle}
                                >
                                    <FolderKanban className="w-4 h-4" />
                                </button>
                            )}

                            {isAdmin && member.user._id !== ownerId && member.user._id !== user?._id && (
                                <button
                                    onClick={() => removeMember(member.user._id)}
                                    className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                                    title={t.workspaceMembers.removeFromWorkspaceTitle}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {filteredMembers.length === 0 && !loading && (
                 <div className="p-8 text-center text-text-dim border border-glass-border rounded-2xl border-dashed">
                     {t.workspaceMembers.noMembersFound}
                 </div>
             )}
         </div>
      </div>

      {currentWorkspace && (
          <InviteMemberModal
            isOpen={isInviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            workspaceId={currentWorkspace._id}
            onSuccess={fetchMembers}
          />
      )}
      
      {currentWorkspace && managingMember && (
        <ManageMemberProjectsModal 
            isOpen={!!managingMember}
            onClose={() => setManagingMember(null)}
            memberId={managingMember.id}
            memberName={managingMember.name}
            workspaceId={currentWorkspace._id}
        />
      )}
    </div>
  );
}
