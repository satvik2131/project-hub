import { create } from 'zustand';

export type ProjectStatus = 'todo' | 'ongoing' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  projectId: string;
  assignedTo?: string;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  maxCapacity: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  tasks: Task[];
}

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  teamMembers: TeamMember[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  addTask: (projectId: string, task: Omit<Task, 'id' | 'projectId' | 'order'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  reorderTasks: (projectId: string, taskIds: string[]) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete overhaul of company website',
      status: 'ongoing',
      progress: 65,
      tasks: [
        { id: '1-1', title: 'Create wireframes', description: 'Design initial wireframes for all pages', completed: true, projectId: '1', assignedTo: 'tm1', order: 0 },
        { id: '1-2', title: 'Design mockups', description: 'Create high-fidelity designs', completed: true, projectId: '1', assignedTo: 'tm2', order: 1 },
        { id: '1-3', title: 'Develop frontend', description: 'Implement responsive frontend', completed: false, projectId: '1', assignedTo: 'tm1', order: 2 },
        { id: '1-4', title: 'Backend integration', description: 'Connect to APIs and database', completed: false, projectId: '1', assignedTo: 'tm3', order: 3 },
      ],
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Build iOS and Android applications',
      status: 'todo',
      progress: 0,
      tasks: [
        { id: '2-1', title: 'Requirements gathering', description: 'Document all features and requirements', completed: false, projectId: '2', assignedTo: 'tm2', order: 0 },
        { id: '2-2', title: 'Tech stack selection', description: 'Choose development framework', completed: false, projectId: '2', assignedTo: 'tm1', order: 1 },
      ],
    },
    {
      id: '3',
      title: 'Marketing Campaign',
      description: 'Q4 product launch campaign',
      status: 'done',
      progress: 100,
      tasks: [
        { id: '3-1', title: 'Campaign strategy', description: 'Define target audience and channels', completed: true, projectId: '3', assignedTo: 'tm2', order: 0 },
        { id: '3-2', title: 'Content creation', description: 'Create all marketing materials', completed: true, projectId: '3', assignedTo: 'tm3', order: 1 },
        { id: '3-3', title: 'Launch campaign', description: 'Execute across all channels', completed: true, projectId: '3', assignedTo: 'tm2', order: 2 },
      ],
    },
  ],
  selectedProject: null,
  teamMembers: [
    { id: 'tm1', name: 'Sarah Johnson', email: 'sarah@projecthub.com', maxCapacity: 5 },
    { id: 'tm2', name: 'Mike Chen', email: 'mike@projecthub.com', maxCapacity: 6 },
    { id: 'tm3', name: 'Emily Davis', email: 'emily@projecthub.com', maxCapacity: 4 },
  ],

  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    })),

  selectProject: (id) =>
    set((state) => ({
      selectedProject: id ? state.projects.find((p) => p.id === id) || null : null,
    })),

  addTask: (projectId, task) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  ...task,
                  id: Math.random().toString(36).substr(2, 9),
                  projectId,
                  order: p.tasks.length,
                },
              ],
            }
          : p
      ),
    })),

  updateTask: (projectId, taskId, updates) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) => {
        if (p.id === projectId) {
          const updatedTasks = p.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          );
          const completedTasks = updatedTasks.filter((t) => t.completed).length;
          const progress = Math.round((completedTasks / updatedTasks.length) * 100);
          return { ...p, tasks: updatedTasks, progress };
        }
        return p;
      });
      
      return {
        projects: updatedProjects,
        selectedProject: state.selectedProject?.id === projectId
          ? updatedProjects.find((p) => p.id === projectId) || null
          : state.selectedProject,
      };
    }),

  deleteTask: (projectId, taskId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p
      ),
    })),

  reorderTasks: (projectId, taskIds) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const taskMap = new Map(p.tasks.map((t) => [t.id, t]));
          const reorderedTasks = taskIds
            .map((id, index) => {
              const task = taskMap.get(id);
              return task ? { ...task, order: index } : null;
            })
            .filter((t): t is Task => t !== null);
          return { ...p, tasks: reorderedTasks };
        }
        return p;
      }),
      selectedProject:
        state.selectedProject?.id === projectId
          ? state.projects.find((p) => p.id === projectId) || null
          : state.selectedProject,
    })),

  addTeamMember: (member) =>
    set((state) => ({
      teamMembers: [
        ...state.teamMembers,
        { ...member, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),

  updateTeamMember: (id, updates) =>
    set((state) => ({
      teamMembers: state.teamMembers.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  deleteTeamMember: (id) =>
    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== id),
    })),
}));
