'use client';

import React from 'react';
import WorkspaceMembers from '@/components/settings/WorkspaceMembers';
import { useTranslation } from '@/lib/i18n';

export default function InvitePage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 page-fade">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-main tracking-tight">{t.invitePage.title}</h1>
        <p className="text-text-dim">{t.invitePage.subtitle}</p>
      </div>

      <div className="glass-card p-8">
        <WorkspaceMembers />
      </div>
    </div>
  );
}
