# Study Planner · Лабораторна №9

Локальний планувальник на React 19, TypeScript, Vite та Tailwind CSS. Потрібен Node.js 22.22 або новіший.

```powershell
npm ci
npm run dev
npm run lint
npm run build
```

`TaskProvider` керує списком через `useReducer`. Зміни зберігаються в localStorage, а активний фільтр зберігає `useLocalStorage`. Завдання можна створювати, редагувати, фільтрувати й сортувати. Видалення одного завдання або групи виконаних можна скасувати протягом п’яти секунд. Після перезавантаження незавершене видалення скидається.

## Файли для захисту

- `src/context/TaskProvider.tsx` — dispatch, збереження, заголовок вкладки та таймер.
- `src/reducers/taskReducer.ts` — типізовані дії та чиста функція переходів.
- `src/hooks/useTaskContext.ts` і `src/hooks/useLocalStorage.ts` — власні hooks.
- `src/components/TaskForm.tsx` і `src/components/Toast.tsx` — форма та повідомлення.

Попередній етап доступний у гілці `feature/react-fundamentals`.
