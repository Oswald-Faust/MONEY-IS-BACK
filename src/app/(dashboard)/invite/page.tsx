'use client';

import React from 'react';
import WorkspaceMembers from '@/components/settings/WorkspaceMembers';

export default function InvitePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 page-fade">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Inviter des utilisateurs</h1>
        <p className="text-dim">Gérez les membres de votre workspace et envoyez des invitations.</p>
      </div>

      <div className="glass-card p-8">
        <WorkspaceMembers />
      </div>
    </div>
  );
}
