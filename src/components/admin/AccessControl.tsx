'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Folder, 
  CheckCircle, 
  ChevronRight,
  Settings,
  Unlock,
  AlertTriangle,
  Info,
  HardDrive,
  X,
  Plus,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  driveAccess?: boolean;
}

interface ProjectData {
  _id: string;
  name: string;
  description: string;
  status: string;
  hasAccess: boolean;
  role: 'admin' | 'editor' | 'visitor' | 'owner' | null;
}

interface LogData {
  _id: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  action: string;
  details: string;
  status: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
}

interface VerificationItemProps {
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'info' | 'warning' | 'error' | 'success';
  date: string;
}

export default function AccessControl() {
  const { token } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'permissions' | 'projects' | 'drive' | 'verifications'>('permissions');
  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  
  const [globalPermissions, setGlobalPermissions] = useState({
    createProject: true,
    deleteProject: false,
    inviteMembers: true,
    viewAnalytics: false,
    manageBilling: false,
    exportData: true,
    driveAccess: true,
    allowedFileTypes: [] as string[]
  });

  const [newFileType, setNewFileType] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch users
      const usersRes = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      // Fetch global settings
      const settingsRes = await fetch('/api/admin/settings', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const settingsData = await settingsRes.json();

      if (usersData.success) {
        setUsers(usersData.data);
        if (usersData.data.length > 0 && !selectedUser) {
           setSelectedUser(usersData.data[0]._id);
        }
      }

      if (settingsData.success && settingsData.data?.permissions) {
        setGlobalPermissions(prev => ({
          ...prev,
          ...settingsData.data.permissions
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedUser]);

  const fetchLogs = useCallback(async () => {
      try {
          const logsRes = await fetch('/api/admin/logs', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const logsData = await logsRes.json();
          if (logsData.success) {
              setLogs(logsData.data);
          }
      } catch (error) {
          console.error('Error fetching logs:', error);
      }
  }, [token]);

  const fetchUserProjects = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
        setIsProjectsLoading(true);
        const projectsRes = await fetch(`/api/admin/projects/access?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
            setProjects(projectsData.data);
        }
    } catch (error) {
        console.error('Error fetching user projects:', error);
        toast.error('Erreur lors du chargement des projets');
    } finally {
        setIsProjectsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeSection === 'verifications') {
        fetchLogs();
    }
  }, [activeSection, fetchLogs]);

  useEffect(() => {
      if (activeSection === 'projects' && selectedUser) {
          fetchUserProjects(selectedUser);
      }
  }, [activeSection, selectedUser, fetchUserProjects]);

  const updateSettings = async (updates: Partial<typeof globalPermissions>) => {
    try {
        const response = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                permissions: { ...globalPermissions, ...updates }
            })
        });
        
        const data = await response.json();
        if (data.success) {
            setGlobalPermissions(prev => ({ ...prev, ...data.data.permissions }));
            toast.success('Paramètres mis à jour');
        } else {
            throw new Error(data.error);
        }
    } catch {
        toast.error('Erreur lors de la mise à jour');
    }
  };

  const handlePermissionToggle = async (key: keyof typeof globalPermissions) => {
    if (key === 'allowedFileTypes') return;
    const newValue = !globalPermissions[key];
    updateSettings({ [key]: newValue });
  };

  const handleFileTypeAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileType) return;
    
    let ext = newFileType.trim().toLowerCase();
    if (!ext.startsWith('.')) ext = '.' + ext;
    
    if ((globalPermissions.allowedFileTypes || []).includes(ext)) {
        toast.error('Cette extension est déjà autorisée');
        return;
    }
    
    const newTypes = [...(globalPermissions.allowedFileTypes || []), ext];
    updateSettings({ allowedFileTypes: newTypes });
    setNewFileType('');
  };

  const handleFileTypeRemove = (ext: string) => {
    const newTypes = (globalPermissions.allowedFileTypes || []).filter(t => t !== ext);
    updateSettings({ allowedFileTypes: newTypes });
  };

  const handleUserDriveAccessToggle = async (userId: string, currentAccess: boolean) => {
      try {
          const response = await fetch('/api/users', {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  id: userId,
                  driveAccess: !currentAccess
              })
          });
          
          const data = await response.json();
          if (data.success) {
              setUsers(prev => prev.map(u => u._id === userId ? { ...u, driveAccess: !currentAccess } : u));
              toast.success('Accès Drive mis à jour');
          } else {
              toast.error(data.error || 'Erreur lors de la mise à jour');
          }
      } catch {
          toast.error('Erreur de connexion');
      }
  };

  const handleProjectAccessToggle = async (projectId: string, hasAccess: boolean) => {
      if (!selectedUser) return;

      try {
          let response;
          if (hasAccess) {
              // Revoke access (DELETE)
             response = await fetch(`/api/admin/projects/access?userId=${selectedUser}&projectId=${projectId}`, {
                 method: 'DELETE',
                 headers: { 'Authorization': `Bearer ${token}` }
             });
          } else {
              // Grant access (POST)
              response = await fetch('/api/admin/projects/access', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                      userId: selectedUser,
                      projectId: projectId,
                      role: 'editor' // Default role
                  })
              });
          }

          const data = await response.json();
          if (data.success) {
              toast.success(hasAccess ? 'Accès révoqué' : 'Accès accordé');
              // Refresh project list
              fetchUserProjects(selectedUser);
          } else {
              toast.error(data.error || 'Une erreur est survenue');
          }
      } catch {
          toast.error('Erreur de connexion');
      }
  };

  const VerificationItem = ({ title, description, status, date }: VerificationItemProps) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-glass-border hover:bg-bg-tertiary transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          status === 'pending' || status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 
          status === 'approved' || status === 'success' ? 'bg-green-500/10 text-green-400' : 
          status === 'rejected' || status === 'error' ? 'bg-red-500/10 text-red-400' :
          'bg-blue-500/10 text-blue-400'
        }`}>
          {status === 'pending' || status === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
           status === 'approved' || status === 'success' ? <CheckCircle className="w-5 h-5" /> : 
           status === 'rejected' || status === 'error' ? <Lock className="w-5 h-5" /> :
           <Info className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-bold text-main text-sm">{title}</h4>
          <p className="text-xs text-dim">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
          status === 'pending' || status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 
          status === 'approved' || status === 'success' ? 'bg-green-500/10 text-green-400' : 
          status === 'rejected' || status === 'error' ? 'bg-red-500/10 text-red-400' :
          'bg-blue-500/10 text-blue-400'
        }`}>
          {status}
        </span>
        <p className="text-xs text-dim mt-1">{new Date(date).toLocaleString()}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-main">Accès & Vérifications</h3>
          <p className="text-sm text-dim">Gérez les permissions globales et les accès par projet.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-bg-secondary border border-glass-border w-fit">
        {['permissions', 'projects', 'drive', 'verifications'].map((tab) => (
             <button
             key={tab}
             onClick={() => setActiveSection(tab as 'permissions' | 'projects' | 'drive' | 'verifications')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
               activeSection === tab 
                 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                 : 'text-dim hover:text-main hover:bg-glass-hover'
             }`}
           >
             {tab === 'permissions' ? 'Permissions Globales' : 
              tab === 'projects' ? 'Accès Projets' : 
              tab === 'drive' ? 'Gestion Drive' : 'Journal & Vérifications'}
           </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeSection === 'permissions' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {Object.entries(globalPermissions).map(([key, value]) => (
              <div key={key} className="p-4 rounded-xl bg-bg-secondary border border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeof value === 'boolean' && value ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-dim'}`}>
                    {key === 'driveAccess' ? <HardDrive className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-main text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-xs text-dim">
                      {key === 'driveAccess' ? 'Désactiver le module Drive pour tous' : 
                       key === 'allowedFileTypes' ? 'Extensions de fichiers autorisées' : 
                       'Permission pour les utilisateurs standard'}
                    </p>
                  </div>
                </div>
                {typeof value === 'boolean' ? (
                  <button
                    onClick={() => handlePermissionToggle(key as keyof typeof globalPermissions)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-indigo-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                ) : (
                  <div className="text-xs font-bold text-indigo-400">
                    {Array.isArray(value) ? `${value.length} types` : ''}
                  </div>
                )}
              </div>
            ))}
            
            {/* File Types Manager */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-bg-secondary border border-glass-border mt-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-main leading-none mb-1">Extensions de fichiers autorisées</h4>
                  <p className="text-xs text-dim">Laissez vide pour tout autoriser</p>
                </div>
              </div>

              <div className="space-y-4">
                <form onSubmit={handleFileTypeAdd} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value)}
                    placeholder="ex: .pdf, .zip, .jpg"
                    className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-glass-border rounded-xl text-sm text-main focus:border-indigo-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-all font-bold"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {(globalPermissions.allowedFileTypes || []).map(ext => (
                    <div key={ext} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                      {ext}
                      <button 
                        onClick={() => handleFileTypeRemove(ext)}
                        className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(globalPermissions.allowedFileTypes || []).length === 0 && (
                    <p className="text-sm text-dim italic">Toutes les extensions sont actuellement autorisées.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'projects' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 h-[500px]"
          >
            {/* Users List */}
            <div className="w-full md:w-1/3 border-r border-glass-border pr-6 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Utilisateurs</h4>
              <div className="space-y-2">
                {users.map(user => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedUser === user._id 
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-main font-bold' 
                        : 'text-dim hover:bg-glass-hover border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 overflow-hidden relative shrink-0">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.firstName} fill className="object-cover" />
                      ) : (
                        user.firstName[0]
                      )}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-dim truncate">{user.email}</p>
                    </div>
                    {selectedUser === user._id && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Access */}
            <div className="flex-1 overflow-y-auto pl-2">
               <div className="flex items-center justify-between mb-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Accès aux Projets</h4>
                   {isProjectsLoading && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
               </div>
               
               {selectedUser ? (
                 <div className="space-y-3">
                   {projects.map(project => (
                     <div key={project._id} className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-glass-border hover:bg-bg-tertiary transition-colors">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project.hasAccess ? 'bg-purple-500/10 text-purple-400' : 'bg-bg-tertiary text-dim'}`}>
                           <Folder className="w-5 h-5" />
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                               <h4 className="font-bold text-main text-sm">{project.name}</h4>
                               {project.role === 'owner' && (
                                   <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Propriétaire</span>
                               )}
                               {project.role && project.role !== 'owner' && (
                                   <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{project.role}</span>
                               )}
                           </div>
                           <p className="text-xs text-dim truncate max-w-[200px]">{project.description || 'Aucune description'}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {project.role !== 'owner' && (
                            <button 
                                onClick={() => handleProjectAccessToggle(project._id, project.hasAccess)}
                                className={`p-2 rounded-lg transition-colors ${
                                    project.hasAccess 
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                }`}
                                title={project.hasAccess ? "Révoquer l'accès" : "Accorder l'accès"}
                            >
                                {project.hasAccess ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                         )}
                       </div>
                     </div>
                   ))}
                   {projects.length === 0 && !isProjectsLoading && (
                     <div className="text-center py-12 text-dim">
                       Aucun projet disponible
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="flex items-center justify-center h-full text-dim">
                   Sélectionnez un utilisateur
                 </div>
               )}
            </div>
          </motion.div>
        )}

        {activeSection === 'drive' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 h-[500px]"
          >
            {/* Users List */}
            <div className="w-full md:w-1/3 border-r border-glass-border pr-6 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Utilisateurs</h4>
              <div className="space-y-2">
                {users.map(user => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedUser === user._id 
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-main font-bold' 
                        : 'text-dim hover:bg-glass-hover border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 overflow-hidden relative shrink-0">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.firstName} fill className="object-cover" />
                      ) : (
                        user.firstName[0]
                      )}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-dim truncate">{user.email}</p>
                    </div>
                    {selectedUser === user._id && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Drive Access Control */}
            <div className="flex-1 overflow-y-auto pl-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-base font-bold text-main mb-1">Restrictions d&apos;Accès Drive</h4>
                        <p className="text-xs text-dim">Contrôlez la visibilité et l&apos;utilisation du Drive pour cet utilisateur.</p>
                    </div>
                </div>

                {selectedUser ? (
                    <div className="space-y-6">
                        {/* Global Drive Toggle for User */}
                        <div className="p-6 rounded-2xl bg-bg-secondary border border-glass-border hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${users.find(u => u._id === selectedUser)?.driveAccess !== false ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/10 text-red-400'}`}>
                                        <HardDrive className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-main">Accès au module Drive</h4>
                                        <p className="text-xs text-dim">Permettre à l&apos;utilisateur de voir le Drive et d&apos;uploader des fichiers.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const user = users.find(u => u._id === selectedUser);
                                        if (user) handleUserDriveAccessToggle(selectedUser, user.driveAccess !== false);
                                    }}
                                    className={`w-14 h-7 rounded-full transition-all relative ${users.find(u => u._id === selectedUser)?.driveAccess !== false ? 'bg-indigo-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${users.find(u => u._id === selectedUser)?.driveAccess !== false ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Informational Card */}
                        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                                <div className="space-y-2">
                                    <h5 className="text-sm font-bold text-main">Visibilité des fichiers</h5>
                                    <ul className="text-xs text-dim space-y-2 list-disc pl-4">
                                        <li>L&apos;utilisateur voit ses propres fichiers uploadés.</li>
                                        <li>Il voit les fichiers liés aux projets dont il est membre.</li>
                                        <li>Les fichiers restreints par type (extensions) ne seront pas visibles ni uploadables.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-dim gap-4 opacity-50">
                        <HardDrive className="w-12 h-12" />
                        <p>Sélectionnez un utilisateur pour gérer ses accès Drive</p>
                    </div>
                )}
            </div>
          </motion.div>
        )}

        {activeSection === 'verifications' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {logs.length > 0 ? (
                logs.map((log) => (
                    <VerificationItem 
                        key={log._id}
                        title={log.action} 
                        description={log.details} 
                        status={log.status} 
                        date={log.createdAt} 
                    />
                ))
            ) : (
                <div className="text-center py-12 text-dim">
                    Aucun historique disponible
                </div>
            )}
            
             <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mt-6">
              <h4 className="font-bold text-main text-sm mb-2">Statistiques Système</h4>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-tertiary p-3 rounded-lg">
                      <p className="text-xs text-dim">Total Actions</p>
                      <p className="text-xl font-bold text-main">{logs.length}</p>
                  </div>
                  <div className="bg-bg-tertiary p-3 rounded-lg">
                      <p className="text-xs text-dim">Dernière activité</p>
                      <p className="text-sm font-bold text-main">{logs.length > 0 ? new Date(logs[0].createdAt).toLocaleTimeString() : 'N/A'}</p>
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
