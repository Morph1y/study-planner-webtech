import { useEffect, useId, useRef, type ReactNode } from 'react';

export function PlannerDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={ref} aria-labelledby={id} onCancel={event => { event.preventDefault(); onClose(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/60 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between gap-4">
        <h2 id={id} className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} className="text-sm underline">Закрити</button>
      </div>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
