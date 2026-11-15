import type { ToastMessage } from '../hooks/useToast';

export function Toast({ message }: { message: ToastMessage }) {
  return (
    <div role={message.error ? 'alert' : 'status'} className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      {message.text}
    </div>
  );
}
