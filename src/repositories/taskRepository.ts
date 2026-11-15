import { httpRequest } from '../api/httpClient';
import type { Task, TaskFormData } from '../types/task';

interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

interface TodosResponse {
  todos: ApiTodo[];
  total: number;
  skip: number;
  limit: number;
}

function toTask(todo: ApiTodo): Task {
  return {
    id: Number(todo.id),
    title: todo.todo,
    completed: todo.completed,
    description: '',
    category: 'Загальне',
    priority: 'medium',
  };
}

function jsonBody(method: 'POST' | 'PATCH', data: object): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

export const taskRepository = {
  async getAll(limit: number, skip: number, signal: AbortSignal) {
    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
    const result = await httpRequest<TodosResponse>(`todos?${params}`, { signal });
    return { tasks: result.todos.map(toTask), total: result.total };
  },

  async getById(id: number, signal: AbortSignal) {
    return toTask(await httpRequest<ApiTodo>(`todos/${id}`, { signal }));
  },

  async create(data: TaskFormData) {
    const result = await httpRequest<ApiTodo>('todos/add', jsonBody('POST', {
      todo: data.title, completed: false, userId: 1,
    }));
    return { ...data, id: Number(result.id), title: result.todo, completed: result.completed };
  },

  async update(task: Task) {
    const result = await httpRequest<ApiTodo>(`todos/${task.id}`, jsonBody('PATCH', {
      todo: task.title, completed: task.completed,
    }));
    return { ...task, title: result.todo, completed: result.completed };
  },

  async delete(id: number) {
    await httpRequest<ApiTodo>(`todos/${id}`, { method: 'DELETE' });
  },
};
