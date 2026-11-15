import { useEffect, useState } from 'react';

export interface ToastMessage {
  text: string;
  error?: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return [toast, setToast] as const;
}
