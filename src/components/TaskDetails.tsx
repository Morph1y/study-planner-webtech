import { useCallback } from 'react';
import { PlannerDialog } from './PlannerDialog';
import { useApiQuery } from '../hooks/useApiQuery';
import { taskRepository } from '../repositories/taskRepository';
import { PRIORITY_CONFIG, type Task } from '../types/task';

function TaskFields({ task }: { task: Task }) {
  return (
    <dl className="grid gap-3 text-sm">
      <div><dt className="font-semibold">Назва</dt><dd>{task.title}</dd></div>
      <div><dt className="font-semibold">Опис</dt><dd>{task.description || 'Опис відсутній'}</dd></div>
      <div><dt className="font-semibold">Категорія</dt><dd>{task.category}</dd></div>
      <div><dt className="font-semibold">Пріоритет</dt><dd>{PRIORITY_CONFIG[task.priority].label}</dd></div>
      <div><dt className="font-semibold">Стан</dt><dd>{task.completed ? 'Виконано' : 'В роботі'}</dd></div>
    </dl>
  );
}

function RemoteDetails({ id, change }: { id: number; change?: Task }) {
  const load = useCallback((signal: AbortSignal) => taskRepository.getById(id, signal), [id]);
  const { result, retry } = useApiQuery(load);

  if (result.status === 'loading') return <p role="status">Завантаження деталей…</p>;
  if (result.status === 'error') {
    return <div role="alert"><p>{result.message}</p><button type="button" onClick={retry} className="mt-2 underline">Повторити запит деталей</button></div>;
  }
  return <TaskFields task={change ?? result.data} />;
}

export function TaskDetails({ task, change, onClose }: { task: Task; change?: Task; onClose: () => void }) {
  return (
    <PlannerDialog title="Деталі завдання" onClose={onClose}>
      {task.id < 0 ? <TaskFields task={task} /> : <RemoteDetails id={task.id} change={change} />}
    </PlannerDialog>
  );
}
