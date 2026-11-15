import { createContext } from 'react';
import type { PendingDelete } from '../reducers/taskReducer';
import type { Task, TaskFilter, TaskFormData } from '../types/task';
import type { ToastMessage } from '../hooks/useToast';

export interface TaskContextValue {
  tasks: Task[];
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  addTask: (data: TaskFormData) => boolean;
  updateTask: (id: number, data: TaskFormData) => boolean;
  toggleTask: (id: number) => void;
  requestDelete: (id: number) => void;
  clearCompleted: () => void;
  undoDelete: () => void;
  resetTasks: () => void;
  pending: PendingDelete | null;
  toast: ToastMessage | null;
}

export const TaskContext = createContext<TaskContextValue | null>(null);
