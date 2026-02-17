'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';

interface TeamSectionProps {
  workspaceId: string;
}

export default function TeamSection({ workspaceId }: TeamSectionProps) {
  const { token, user } = useAuthStore();
  const { t } = useTranslation();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId || !token) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspaces/members?workspaceId=${workspaceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
          setMembers(data.data.members || []);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId, token]);

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-4">
         {[1, 2, 3].map(i => (
             <div key={i} className="w-12 h-12 rounded-full bg-white/5" />
         ))}
      </div>
    );
  }

  // Filter out current user if desired? Usually "My Team" includes me or not. 
  // Let's include everyone but maybe highlight me or just list them.
  // The user asked for "Mon équipe".

  const displayedMembers = members.slice(0, 5); // Show first 5
  const remainingCount = members.length - 5;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Users className="w-4 h-4" />
            </div>
            {t.dashboard.team.title}
        </h2>
        <Link href="/invite" className="px-4 py-2 rounded-2xl text-sm font-semibold text-indigo-400 hover:text-main hover:bg-indigo-500/10 flex items-center gap-2 transition-all">
            <UserPlus className="w-4 h-4" />
            {t.dashboard.team.invite}
        </Link>
      </div>

      <div className="glass-card p-6">
        {members.length === 0 ? (
           <div className="text-center py-4 text-dim">
               {t.dashboard.team.empty}
           </div>
        ) : (
            <div className="flex items-center gap-4 flex-wrap">
                {displayedMembers.map((member) => (
                    <div key={member.user._id} className="flex flex-col items-center gap-2 group">
                        <Avatar 
                            src={member.user.avatar} 
                            fallback={member.user.firstName} 
                            className="w-12 h-12 rounded-full ring-2 ring-transparent group-hover:ring-indigo-500 transition-all"
                        />
                        <span className="text-xs font-medium text-dim group-hover:text-white transition-colors">
                            {member.user.firstName}
                        </span>
                    </div>
                ))}
                {remainingCount > 0 && (
                    <Link href="/invite" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-dim hover:bg-white/10 hover:text-white transition-colors border border-white/5 text-xs font-bold">
                        +{remainingCount}
                    </Link>
                )}
                
                <Link href="/invite" className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-dim hover:text-white hover:border-white/40 transition-all">
                    <UserPlus className="w-5 h-5" />
                </Link>
            </div>
        )}
      </div>
    </section>
  );
}
