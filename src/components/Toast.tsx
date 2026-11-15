import type { ToastMessage } from '../hooks/useToast';
import { useState } from 'react';

export function Toast({ message }: { message: ToastMessage }) {
  return (
    <div role={message.error ? 'alert' : 'status'} className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      {message.text}
    </div>
  );
}

export function UndoToast({ count, deadline, onUndo }: { count: number; deadline: number; onUndo: () => void }) {
  const [duration] = useState(() => Math.max(0, deadline - Date.now()));
  return (
    <div className="overflow-hidden rounded-xl bg-slate-900 text-sm text-white shadow-lg">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <span role="status">{count === 1 ? 'Завдання буде видалено.' : `Буде видалено завдань: ${count}.`}</span>
        <button type="button" onClick={onUndo} className="font-semibold text-indigo-200 underline">Скасувати</button>
      </div>
      <div className="h-1 bg-slate-700" aria-hidden="true">
        <div className="h-full origin-left bg-indigo-400" style={{ animation: `undo-countdown ${duration}ms linear forwards` }} />
      </div>
    </div>
  );
}
