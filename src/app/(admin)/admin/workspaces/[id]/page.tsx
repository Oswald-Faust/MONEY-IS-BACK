'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, Calendar, CheckCircle2, FolderKanban, Save, Users } from 'lucide-react';
import { useAuthStore } from '@/store';

type WorkspaceDetailResponse = {
  workspace: any;
  projects: any[];
  stats: {
    totalMembers: number;
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
  };
};

export default function AdminWorkspaceDetailPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<WorkspaceDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    subscriptionPlan: 'starter',
    subscriptionStatus: 'inactive',
    subscriptionInterval: '',
    subscriptionEnd: '',
  });

  const toInputDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const fetchWorkspace = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Impossible de charger le workspace');
        return;
      }

      setData(json.data);
      setForm({
        subscriptionPlan: json.data.workspace.subscriptionPlan || 'starter',
        subscriptionStatus: json.data.workspace.subscriptionStatus || 'inactive',
        subscriptionInterval: json.data.workspace.subscriptionInterval || '',
        subscriptionEnd: toInputDate(json.data.workspace.subscriptionEnd),
      });
    } catch (_error) {
      toast.error('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) fetchWorkspace();
  }, [token, id]);

  const completionRate = useMemo(() => {
    if (!data?.stats.totalTasks) return 0;
    return Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100);
  }, [data]);

  const onSaveSubscription = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/workspaces', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: id,
          subscriptionPlan: form.subscriptionPlan,
          subscriptionStatus: form.subscriptionStatus,
          subscriptionInterval: form.subscriptionInterval || null,
          subscriptionEnd: form.subscriptionEnd || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Mise à jour impossible');
        return;
      }

      toast.success('Abonnement mis à jour');
      await fetchWorkspace();
    } catch (_error) {
      toast.error('Erreur serveur');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { workspace, projects, stats } = data;

  return (
    <div className="space-y-8 pb-20 page-fade">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-glass-border hover:bg-glass-hover text-dim hover:text-main transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-dim uppercase tracking-widest font-bold">Workspace Detail</p>
            <h1 className="text-2xl font-bold text-main">{workspace.name}</h1>
          </div>
        </div>
        <Link href="/admin/workspaces" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
          Retour aux workspaces
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-main">{workspace.name}</h2>
                <p className="text-xs text-dim uppercase tracking-widest">{workspace.useCase || 'other'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-dim uppercase tracking-widest">Créé le</p>
              <p className="text-sm text-main">{new Date(workspace.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Membres" value={stats.totalMembers} icon={<Users className="w-4 h-4 text-blue-400" />} />
            <StatCard label="Projets" value={stats.totalProjects} icon={<FolderKanban className="w-4 h-4 text-indigo-400" />} />
            <StatCard label="Projets actifs" value={stats.activeProjects} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} />
            <StatCard label="Complétion tâches" value={`${completionRate}%`} icon={<Calendar className="w-4 h-4 text-purple-400" />} />
          </div>

          <div className="border-t border-glass-border pt-6">
            <h3 className="text-sm font-bold text-main uppercase tracking-widest mb-4">Propriétaire</h3>
            <div className="flex items-center justify-between bg-bg-deep/40 border border-glass-border rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-bg-secondary border border-glass-border overflow-hidden">
                  {workspace.owner?.avatar ? (
                    <Image src={workspace.owner.avatar} alt="" width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-dim">
                      {workspace.owner?.firstName?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-main font-semibold">{workspace.owner?.firstName} {workspace.owner?.lastName}</p>
                  <p className="text-xs text-dim">{workspace.owner?.email}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-dim">{workspace.owner?.role || 'user'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card space-y-4">
          <h3 className="text-sm font-bold text-main uppercase tracking-widest">Gérer l’abonnement</h3>

          <Field label="Plan">
            <select
              value={form.subscriptionPlan}
              onChange={(e) => setForm((prev) => ({ ...prev, subscriptionPlan: e.target.value }))}
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-sm text-main focus:outline-none"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="team">Team</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </Field>

          <Field label="Statut">
            <select
              value={form.subscriptionStatus}
              onChange={(e) => setForm((prev) => ({ ...prev, subscriptionStatus: e.target.value }))}
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-sm text-main focus:outline-none"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="trialing">trialing</option>
              <option value="past_due">past_due</option>
              <option value="canceled">canceled</option>
              <option value="unpaid">unpaid</option>
            </select>
          </Field>

          <Field label="Intervalle">
            <select
              value={form.subscriptionInterval}
              onChange={(e) => setForm((prev) => ({ ...prev, subscriptionInterval: e.target.value }))}
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-sm text-main focus:outline-none"
            >
              <option value="">Aucun</option>
              <option value="month">Mensuel</option>
              <option value="year">Annuel</option>
            </select>
          </Field>

          <Field label="Date de fin">
            <input
              type="date"
              value={form.subscriptionEnd}
              onChange={(e) => setForm((prev) => ({ ...prev, subscriptionEnd: e.target.value }))}
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-sm text-main focus:outline-none"
            />
          </Field>

          <button
            onClick={onSaveSubscription}
            disabled={isSaving}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-bold text-main uppercase tracking-widest mb-4">Projets du workspace</h3>
        {projects.length === 0 ? (
          <p className="text-sm text-dim">Aucun projet pour ce workspace.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="py-3 text-xs uppercase tracking-widest text-dim">Nom</th>
                  <th className="py-3 text-xs uppercase tracking-widest text-dim">Statut</th>
                  <th className="py-3 text-xs uppercase tracking-widest text-dim">Membres</th>
                  <th className="py-3 text-xs uppercase tracking-widest text-dim">Tâches</th>
                  <th className="py-3 text-xs uppercase tracking-widest text-dim">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="border-b border-glass-border/60 last:border-b-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color || '#6366f1' }} />
                        <span className="text-sm text-main font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-dim">{project.status}</td>
                    <td className="py-3 text-sm text-main">{project.members?.length || 0}</td>
                    <td className="py-3 text-sm text-main">{project.completedTasksCount || 0}/{project.tasksCount || 0}</td>
                    <td className="py-3 text-sm text-dim">{new Date(project.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] text-dim font-bold uppercase tracking-widest">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-bg-deep/50 border border-glass-border rounded-xl p-3">
      <p className="text-[10px] text-dim uppercase tracking-widest font-bold mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-lg font-bold text-main">{value}</span>
      </div>
    </div>
  );
}
