'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Clock, 
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const { token } = useAuthStore();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/logs?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, token]);

  const statusIcons: any = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />
  };

  const statusColors: any = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-8 page-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-main tracking-tight">Logs Système</h1>
            <p className="text-dim">Historique complet des actions sur la plateforme</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Détails</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-dim uppercase tracking-wider text-right uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dim font-sans">
                    Chargement des logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dim font-sans">
                    Aucun log enregistré
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-3">
                      <div className={`p-1.5 rounded-lg border w-fit ${statusColors[log.status]}`}>
                        {statusIcons[log.status]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-main font-bold uppercase">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="text-main font-semibold">{log.user.firstName} {log.user.lastName}</span>
                          <span className="text-dim text-[10px]">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-dim italic">Système</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-dim truncate max-w-[300px]" title={log.details}>{log.details}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-dim">
                        <span>{new Date(log.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString('fr-FR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-dim">
                      {log.ip || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-dim font-sans">
              Page <span className="text-main font-bold">{page}</span> sur <span className="text-main font-bold">{pagination.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-dim disabled:opacity-30 hover:text-main hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-dim disabled:opacity-30 hover:text-main hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
