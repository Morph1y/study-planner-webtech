import { PRIORITY_CONFIG, type Task, type TaskFilter, type TaskSort } from '../types/task';

export function selectTasks(tasks: Task[], filter: TaskFilter, search: string, sort: TaskSort) {
  const term = search.trim().toLowerCase();
  const visible = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    return [task.title, task.description, task.category].some(value => value.toLowerCase().includes(term));
  });

  if (sort === 'title') return visible.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
  if (sort === 'priority-asc' || sort === 'priority-desc') {
    const direction = sort === 'priority-asc' ? 1 : -1;
    return visible.sort((a, b) => direction * (PRIORITY_CONFIG[a.priority].weight - PRIORITY_CONFIG[b.priority].weight));
  }
  return visible;
}
