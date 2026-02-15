
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Crown, User, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export default function InviteMemberModal({ isOpen, onClose, workspaceId, onSuccess }: InviteMemberModalProps) {
  const { token } = useAuthStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'visitor'>('editor');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (isOpen) {
        setSuccessData(null);
        setEmail('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/workspaces/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId, email, role })
      });

      const data = await response.json();

      if (data.success) {
        // Don't close immediately, show success state with link
        setSuccessData({
            email,
            token: data.invitation?.token || ''
        });
        
        // Reset form but keep modal open
        setEmail('');
        setRole('editor');
        onSuccess();
        // onClose(); // Removed auto close
      } else {
        toast.error(data.error || 'Erreur lors de l\'invitation');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error('Erreur lors de l\'invitation');
    } finally {
      setLoading(false);
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
          className="relative w-full max-w-md bg-[#12121a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">Inviter un membre</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
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
                    <h3 className="text-xl font-bold text-white">Invitation envoyée !</h3>
                    <p className="text-gray-400 mt-1">
                        Un email a été envoyé à <span className="text-white font-medium">{successData.email}</span>.
                    </p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                 <p className="text-sm text-dim">
                    Vous pouvez aussi copier ce lien d'invitation et l'envoyer directement :
                 </p> 
                 <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-300 break-all font-mono">
                         {typeof window !== 'undefined' ? `${window.location.origin}/join/${successData.token}` : ''}
                    </code>
                    <button 
                        onClick={() => {
                            const link = `${window.location.origin}/join/${successData.token}`;
                            navigator.clipboard.writeText(link);
                            toast.success('Lien copié !');
                        }}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                        title="Copier"
                    >
                        <Shield className="w-4 h-4" /> {/* Using Shield as Copy icon as fallback or import Copy from lucide */}
                    </button>
                 </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5"
              >
                Terminer
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborateur@exemple.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-400 ml-1">Rôle</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'admin', label: 'Administrateur', icon: Crown, desc: 'Accès complet au workspace' },
                  { value: 'editor', label: 'Éditeur', icon: User, desc: 'Peut créer et modifier des contenus' },
                  { value: 'visitor', label: 'Visiteur', icon: Shield, desc: 'Lecture seule (commentaires possibles)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as any)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${role === option.value 
                        ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}
                    `}
                  >
                    <div className={`p-2 rounded-lg ${role === option.value ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-bold ${role === option.value ? 'text-white' : 'text-gray-300'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer l\'invitation'}
            </button>
          </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
