import { initialTasks } from '../data/initialTasks';
import type { Task, TaskFormData } from '../types/task';

export interface PendingDelete {
  ids: number[];
  deadline: number;
}

export interface TaskState {
  tasks: Task[];
  pending: PendingDelete | null;
}

export type TaskAction =
  | { type: 'add'; task: Task }
  | { type: 'toggle'; id: number }
  | { type: 'update'; id: number; data: TaskFormData }
  | { type: 'requestDelete' | 'clearCompleted'; pending: PendingDelete }
  | { type: 'confirmDelete'; pending: PendingDelete }
  | { type: 'undoDelete' | 'reset' };

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'toggle':
      return { ...state, tasks: state.tasks.map(task =>
        task.id === action.id ? { ...task, completed: !task.completed } : task
      ) };
    case 'update':
      return { ...state, tasks: state.tasks.map(task =>
        task.id === action.id ? { ...task, ...action.data } : task
      ) };
    case 'requestDelete':
    case 'clearCompleted':
      return state.pending ? state : { ...state, pending: action.pending };
    case 'confirmDelete':
      if (state.pending !== action.pending) return state;
      return { tasks: state.tasks.filter(task => !action.pending.ids.includes(task.id)), pending: null };
    case 'undoDelete':
      return { ...state, pending: null };
    case 'reset':
      return { tasks: initialTasks, pending: null };
  }
  return state;
}
