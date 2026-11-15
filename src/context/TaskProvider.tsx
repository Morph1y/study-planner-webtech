import { useEffect, useReducer, type ReactNode } from 'react';
import { initialTasks } from '../data/initialTasks';
import { readStored, useLocalStorage, writeStored } from '../hooks/useLocalStorage';
import { useToast } from '../hooks/useToast';
import { taskReducer } from '../reducers/taskReducer';
import type { Task, TaskFormData } from '../types/task';
import { isTaskFilter } from '../types/task';
import { TaskContext } from './TaskContext';

const TASKS_KEY = 'study-planner.tasks.v1';
const DELETE_DELAY = 5000;

function isTaskArray(value: unknown): value is Task[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<number>();

  for (const entry of value as unknown[]) {
    if (entry === null || typeof entry !== 'object') return false;
    const task = entry as Partial<Task>;
    if (typeof task.id !== 'number' || !Number.isSafeInteger(task.id) || ids.has(task.id) ||
        typeof task.title !== 'string' || typeof task.description !== 'string' ||
        typeof task.category !== 'string' || typeof task.completed !== 'boolean' ||
        (task.priority !== 'low' && task.priority !== 'medium' && task.priority !== 'high')) return false;
    ids.add(task.id);
  }
  return true;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [{ tasks, pending }, dispatch] = useReducer(taskReducer, undefined, () => ({
    tasks: readStored(TASKS_KEY, initialTasks, isTaskArray),
    pending: null,
  }));
  const [filter, setFilter] = useLocalStorage('study-planner.filter', 'all', isTaskFilter);
  const [toast, setToast] = useToast();
  const activeCount = tasks.filter(task => !task.completed).length;

  useEffect(() => { writeStored(TASKS_KEY, tasks); }, [tasks]);

  useEffect(() => {
    const original = document.title;
    document.title = `Study Planner · Активних завдань: ${activeCount}`;
    return () => { document.title = original; };
  }, [activeCount]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'confirmDelete', pending });
      setToast({ text: pending.ids.length === 1 ? 'Завдання видалено.' : 'Виконані завдання видалено.' });
    }, Math.max(0, pending.deadline - Date.now()));
    return () => window.clearTimeout(timer);
  }, [pending, setToast]);

  function addTask(data: TaskFormData) {
    const id = tasks.reduce((max, task) => Math.max(max, task.id), Date.now() - 1) + 1;
    dispatch({ type: 'add', task: { ...data, completed: false, id } });
    setToast({ text: 'Завдання додано.' });
    return true;
  }

  function updateTask(id: number, data: TaskFormData) {
    if (!tasks.some(task => task.id === id) || pending?.ids.includes(id)) {
      setToast({ text: 'Це завдання зараз недоступне для редагування.', error: true });
      return false;
    }
    dispatch({ type: 'update', id, data });
    setToast({ text: 'Зміни збережено.' });
    return true;
  }

  function scheduleDelete(type: 'requestDelete' | 'clearCompleted', ids: number[]) {
    if (pending) {
      setToast({ text: 'Спочатку завершіть або скасуйте поточне видалення.', error: true });
      return;
    }
    if (ids.length) dispatch({ type, pending: { ids, deadline: Date.now() + DELETE_DELAY } });
  }

  return (
    <TaskContext value={{
      tasks, filter, setFilter, addTask, updateTask,
      toggleTask: id => dispatch({ type: 'toggle', id }),
      requestDelete: id => scheduleDelete('requestDelete', tasks.filter(task => task.id === id).map(task => task.id)),
      clearCompleted: () => scheduleDelete('clearCompleted', tasks.filter(task => task.completed).map(task => task.id)),
      undoDelete: () => {
        dispatch({ type: 'undoDelete' });
        setToast({ text: 'Видалення скасовано.' });
      },
      resetTasks: () => {
        dispatch({ type: 'reset' });
        setFilter('all');
        setToast({ text: 'Початкові дані відновлено.' });
      },
      pending, toast,
    }}>
      {children}
    </TaskContext>
  );
}
