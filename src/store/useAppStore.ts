import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Project, Task, Routine, Workspace, Objective, DriveFile, DriveFolder, Idea } from '@/types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Workspace
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  
  // Projects
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Routines
  routines: Routine[];
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;

  // Objectives
  objectives: Objective[];
  setObjectives: (objectives: Objective[]) => void;
  addObjective: (objective: Objective) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;

  // Drive
  driveFiles: DriveFile[];
  driveFolders: DriveFolder[];
  setDriveFiles: (files: DriveFile[]) => void;
  setDriveFolders: (folders: DriveFolder[]) => void;
  addDriveFile: (file: DriveFile) => void;
  updateDriveFile: (id: string, updates: Partial<DriveFile>) => void;
  deleteDriveFile: (id: string) => void;
  addDriveFolder: (folder: DriveFolder) => void;
  updateDriveFolder: (id: string, updates: Partial<DriveFolder>) => void;
  deleteDriveFolder: (id: string) => void;

  // Ideas
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  
  // UI State
  sidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  activeView: 'dashboard' | 'calendar' | 'tasks' | 'projects' | 'routines' | 'objectives' | 'ideas' | 'ids' | 'drive';
  setActiveView: (view: AppState['activeView']) => void;
  
  // Modals
  isProjectModalOpen: boolean;
  isTaskModalOpen: boolean;
  isRoutineModalOpen: boolean;
  isObjectiveModalOpen: boolean;
  isUploadModalOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isIdeaModalOpen: boolean;
  setProjectModalOpen: (open: boolean) => void;
  setTaskModalOpen: (open: boolean) => void;
  setRoutineModalOpen: (open: boolean) => void;
  setObjectiveModalOpen: (open: boolean) => void;
  setUploadModalOpen: (open: boolean) => void;
  setCreateFolderModalOpen: (open: boolean) => void;
  setIdeaModalOpen: (open: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Workspace
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      
      // Projects
      projects: [],
      currentProject: null,
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p._id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p._id !== id)
      })),
      
      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t._id === id ? { ...t, ...updates } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id)
      })),
      
      // Routines
      routines: [],
      setRoutines: (routines) => set({ routines }),
      addRoutine: (routine) => set((state) => ({ routines: [...state.routines, routine] })),
      updateRoutine: (id, updates) => set((state) => ({
        routines: state.routines.map((r) => r._id === id ? { ...r, ...updates } : r)
      })),
      deleteRoutine: (id) => set((state) => ({
        routines: state.routines.filter((r) => r._id !== id)
      })),

      // Objectives
      objectives: [],
      setObjectives: (objectives) => set({ objectives }),
      addObjective: (objective) => set((state) => ({ objectives: [...state.objectives, objective] })),
      updateObjective: (id, updates) => set((state) => ({
        objectives: state.objectives.map((o) => o._id === id ? { ...o, ...updates } : o)
      })),
      deleteObjective: (id) => set((state) => ({
        objectives: state.objectives.filter((o) => o._id !== id)
      })),

      // Drive
      driveFiles: [],
      driveFolders: [],
      setDriveFiles: (files) => set({ driveFiles: files }),
      setDriveFolders: (folders) => set({ driveFolders: folders }),
      addDriveFile: (file) => set((state) => ({ driveFiles: [...state.driveFiles, file] })),
      updateDriveFile: (id, updates) => set((state) => ({
        driveFiles: state.driveFiles.map((f) => f._id === id ? { ...f, ...updates } : f)
      })),
      deleteDriveFile: (id) => set((state) => ({
        driveFiles: state.driveFiles.filter((f) => f._id !== id)
      })),
      addDriveFolder: (folder) => set((state) => ({ driveFolders: [...state.driveFolders, folder] })),
      updateDriveFolder: (id, updates) => set((state) => ({
        driveFolders: state.driveFolders.map((f) => f._id === id ? { ...f, ...updates } : f)
      })),
      deleteDriveFolder: (id) => set((state) => ({
        driveFolders: state.driveFolders.filter((f) => f._id !== id)
      })),

      // Ideas
      ideas: [],
      setIdeas: (ideas) => set({ ideas }),
      addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map((i) => i._id === id ? { ...i, ...updates } : i)
      })),
      deleteIdea: (id) => set((state) => ({
        ideas: state.ideas.filter((i) => i._id !== id)
      })),
      
      // UI State
      sidebarCollapsed: false,
      isMobileMenuOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),
      
      // Modals
      isProjectModalOpen: false,
      isTaskModalOpen: false,
      isRoutineModalOpen: false,
      isObjectiveModalOpen: false,
      isUploadModalOpen: false,
      isCreateFolderModalOpen: false,
      isIdeaModalOpen: false,
      setProjectModalOpen: (open) => set({ isProjectModalOpen: open }),
      setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),
      setRoutineModalOpen: (open) => set({ isRoutineModalOpen: open }),
      setObjectiveModalOpen: (open) => set({ isObjectiveModalOpen: open }),
      setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      setCreateFolderModalOpen: (open) => set({ isCreateFolderModalOpen: open }),
      setIdeaModalOpen: (open) => set({ isIdeaModalOpen: open }),
      
      // Loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'project-hub-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
        projects: state.projects,
        tasks: state.tasks,
        routines: state.routines,
        objectives: state.objectives,
        driveFiles: state.driveFiles,
        driveFolders: state.driveFolders,
        ideas: state.ideas,
      }),
    }
  )
);
