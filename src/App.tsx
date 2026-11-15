import { useCallback, useRef, useState } from 'react';
import { PlannerLayout } from './components/PlannerLayout';
import { PlannerDialog } from './components/PlannerDialog';
import { TaskStats } from './components/TaskStats';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskItem } from './components/TaskItem';
import { TaskDetails } from './components/TaskDetails';
import { Toast } from './components/Toast';
import { useApiQuery } from './hooks/useApiQuery';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import { taskRepository } from './repositories/taskRepository';
import { selectTasks } from './tasks/taskView';
import { isTaskFilter, type Task, type TaskSort } from './types/task';

const PAGE_SIZE = 10;
type TaskChanges = Partial<Record<number, Task | null>>;
type Selection = { type: 'details' | 'delete'; task: Task };

export default function App() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useLocalStorage('study-planner.filter', 'all', isTaskFilter);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TaskSort>('none');
  const [editing, setEditing] = useState<Task>();
  const [selection, setSelection] = useState<Selection>();
  const [changes, setChanges] = useState<TaskChanges>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  const mutationLock = useRef(false);
  const clientId = useRef(0);

  const load = useCallback((signal: AbortSignal) =>
    taskRepository.getAll(PAGE_SIZE, (page - 1) * PAGE_SIZE, signal), [page]);
  const { result, lastSuccess, retry } = useApiQuery(load);
  const pageCount = Math.max(1, Math.ceil((lastSuccess?.total ?? 0) / PAGE_SIZE));

  const tasks = result.status === 'success'
    ? result.data.tasks.flatMap(task => {
        const change = changes[task.id];
        if (change === null) return [];
        return [change ?? task];
      })
    : [];
  if (result.status === 'success' && page === 1) {
    const created = Object.values(changes).filter((task): task is Task => !!task && task.id < 0).reverse();
    tasks.unshift(...created);
  }
  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;

  async function runMutation(operation: () => Promise<void>, success: string) {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    try {
      await operation();
      setToast({ text: success });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Невідома помилка.';
      setToast({ text: `Не вдалося зберегти зміни. ${message}`, error: true });
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }

  async function saveUpdate(task: Task) {
    // DummyJSON's simulated POST returns an ID without creating a GET/PATCH/DELETE resource.
    const saved = task.id < 0 ? task : await taskRepository.update(task);
    setChanges(previous => ({ ...previous, [task.id]: saved }));
  }

  function navigate(next: number) {
    setEditing(undefined);
    setPage(next);
  }

  return (
    <PlannerLayout lab={10}>
      <TaskForm key={editing?.id ?? 'new'} task={editing} busy={busy}
        onCancel={() => setEditing(undefined)}
        onSave={data => {
          if (editing) return runMutation(async () => {
            await saveUpdate({ ...editing, ...data });
            setEditing(undefined);
          }, 'Зміни збережено.');

          return runMutation(async () => {
            const created = await taskRepository.create(data);
            const id = --clientId.current;
            setChanges(previous => ({ ...previous, [id]: { ...created, id } }));
            setFilter('all');
            setSearch('');
            if (page === 1 && result.status === 'error') retry();
            navigate(1);
          }, 'Завдання додано.');
        }} />
      <section aria-label="Список завдань" aria-busy={result.status === 'loading'} className="space-y-4">
        <nav aria-label="Сторінки завдань" className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button type="button" disabled={page === 1 || busy} onClick={() => navigate(page - 1)} className="underline disabled:opacity-40">Назад</button>
          <span>Сторінка {page} з {pageCount}</span>
          <button type="button" disabled={page >= pageCount || busy} onClick={() => navigate(page + 1)} className="underline disabled:opacity-40">Далі</button>
        </nav>
        {result.status === 'loading' && <p role="status" className="py-8 text-center">Завантаження завдань…</p>}
        {result.status === 'error' && (
          <div role="alert" className="rounded-xl border border-rose-400 p-4">
            <p>Помилка завантаження. {result.message}</p>
            <button type="button" onClick={retry} className="mt-2 font-semibold underline">Спробувати ще</button>
          </div>
        )}
        {result.status === 'success' && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">Фільтри, пошук і статистика діють на поточній сторінці.</p>
            <TaskStats total={tasks.length} completed={completed} active={active} />
            <TaskFilters currentFilter={filter} onFilterChange={setFilter}
              counts={{ all: tasks.length, completed, active }} searchTerm={search} onSearchChange={setSearch}
              sortBy={sort} onSortChange={setSort} />
            <TaskList tasks={selectTasks(tasks, filter, search, sort)} totalTasksCount={tasks.length}
              renderTask={task => (
                <TaskItem key={task.id} task={task} busy={busy}
                  onDetails={() => setSelection({ type: 'details', task })}
                  onToggle={() => void runMutation(() => saveUpdate({ ...task, completed: !task.completed }), 'Статус оновлено.')}
                  onDelete={() => setSelection({ type: 'delete', task })}
                  onEdit={() => {
                    setEditing(task);
                    document.getElementById('task-editor')?.scrollIntoView({ block: 'start' });
                  }} />
              )} />
          </>
        )}
      </section>
      {selection?.type === 'details' && <TaskDetails key={selection.task.id}
        task={selection.task} change={changes[selection.task.id] ?? undefined} onClose={() => setSelection(undefined)} />}
      {selection?.type === 'delete' && (
        <PlannerDialog title="Видалити завдання?" onClose={() => { if (!busy) setSelection(undefined); }}>
          <p className="text-sm">{selection.task.title}</p>
          <button type="button" disabled={busy} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm text-white disabled:opacity-60"
            onClick={() => void runMutation(async () => {
              const { id } = selection.task;
              if (id >= 0) await taskRepository.delete(id);
              setChanges(previous => ({ ...previous, [id]: null }));
              if (editing?.id === id) setEditing(undefined);
              setSelection(undefined);
            }, 'Завдання видалено.')}>{busy ? 'Зачекайте…' : 'Підтвердити видалення'}</button>
          {toast?.error && <div className="mt-3"><Toast message={toast} /></div>}
        </PlannerDialog>
      )}
      {toast && !(selection?.type === 'delete' && toast.error) && (
        <div className="fixed inset-x-4 bottom-4 z-20 ml-auto max-w-md"><Toast message={toast} /></div>
      )}
    </PlannerLayout>
  );
}
