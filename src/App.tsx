import { useState } from 'react';
import { PlannerLayout } from './components/PlannerLayout';
import { TaskStats } from './components/TaskStats';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskItem } from './components/TaskItem';
import { Toast, UndoToast } from './components/Toast';
import { useTaskContext } from './hooks/useTaskContext';
import { selectTasks } from './tasks/taskView';
import type { TaskSort } from './types/task';

export default function App() {
  const { tasks, filter, setFilter, addTask, updateTask, toggleTask, requestDelete,
    clearCompleted, undoDelete, resetTasks, pending, toast } = useTaskContext();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TaskSort>('none');
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = tasks.find(task => task.id === editingId);
  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;

  return (
    <PlannerLayout lab={9}>
      <TaskStats total={tasks.length} completed={completed} active={active} />
      <TaskForm key={editing?.id ?? 'new'} task={editing} onCancel={() => setEditingId(null)}
        onSave={data => {
          if (!editing) return addTask(data);
          const saved = updateTask(editing.id, data);
          if (saved) setEditingId(null);
          return saved;
        }} />
      <TaskFilters currentFilter={filter} onFilterChange={setFilter}
        counts={{ all: tasks.length, active, completed }} searchTerm={search}
        onSearchChange={setSearch} sortBy={sort} onSortChange={setSort} onClearCompleted={clearCompleted} />
      <button type="button" className="underline text-sm" onClick={() => {
        if (!window.confirm('Повернути початкові завдання і скинути поточні зміни?')) return;
        setEditingId(null);
        setSearch('');
        setSort('none');
        resetTasks();
      }}>Скинути дані</button>
      <TaskList tasks={selectTasks(tasks, filter, search, sort)} totalTasksCount={tasks.length}
        renderTask={task => (
          <TaskItem key={task.id} task={task} pending={pending?.ids.includes(task.id)}
            onToggle={toggleTask} onDelete={requestDelete}
            onEdit={() => {
              setEditingId(task.id);
              document.getElementById('task-editor')?.scrollIntoView({ block: 'start' });
            }} />
        )} />
      <div className="fixed inset-x-4 bottom-4 z-20 ml-auto grid max-w-md gap-2">
        {toast && <Toast message={toast} />}
        {pending && <UndoToast key={pending.deadline} count={pending.ids.length} deadline={pending.deadline} onUndo={undoDelete} />}
      </div>
    </PlannerLayout>
  );
}
