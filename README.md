# Study Planner · Лабораторні №8–10

Навчальний планувальник на React 19, TypeScript, Vite і Tailwind CSS. Потрібен Node.js 22.22 або новіший.

| Гілка | Зміст |
|---|---|
| `feature/react-fundamentals` | №8. Компоненти, props, `useState`, події та рендеринг списку |
| `feature/state-effects` | №9. Context, reducer, редагування, localStorage, Toast, видалення з Undo |
| `feature/rest-api` | №10. DummyJSON, HTTP client, repository, CRUD, пагінація, деталі, скасування GET |

## Запуск поточної гілки

```powershell
npm ci
npm run dev
```

Залежності спільні для всіх трьох етапів. Перед перемиканням гілки зупини Vite через Ctrl+C. Перемкнись через `git switch feature/state-effects` або іншу назву з таблиці, після цього знову запусти `npm run dev`.

Для №10 потрібен файл `.env` з публічною адресою `VITE_API_URL=https://dummyjson.com`. Якщо файл відсутній, виконай `Copy-Item .env.example .env` перед запуском. `.env` ігнорується Git.

```powershell
npm run lint
npm run build
```

## Як працює №10

- API layer читає базову адресу і перевіряє HTTP-статус. Repository знає маршрути ресурсу `todos` і перетворює DTO на `Task`.
- Завдання надходять із сервера сторінками по десять записів. Фільтрація, пошук, сортування та статистика працюють на поточній сторінці. Невдалий GET можна повторити. Зміна сторінки чи закриття діалогу деталей скасовують відповідний попередній GET.
- DummyJSON симулює запис. Зміни з успішних POST, PATCH та DELETE показуються до перезавантаження. Після POST нові завдання мають клієнтські ID, а їхні наступні дії відбуваються локально. Для демонстрації GET за ID, PATCH та DELETE вибери завдання, отримане з API.
- `localStorage` цієї версії зберігає вибраний фільтр. Завдання з попередньої гілки використовуються, коли запускається №9.

[Документація DummyJSON Todos](https://dummyjson.com/docs/todos)
