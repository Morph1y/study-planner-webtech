import { useEffect, useMemo, useState } from 'react';

type QueryResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function useApiQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const request = useMemo(() => ({ load, attempt }), [load, attempt]);
  const [settled, setSettled] = useState<{ request: typeof request; result: QueryResult<T>; lastSuccess?: T }>();

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        const data = await request.load(controller.signal);
        if (!controller.signal.aborted) setSettled({ request, result: { status: 'success', data }, lastSuccess: data });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Не вдалося отримати дані.';
        setSettled(previous => ({ request, result: { status: 'error', message }, lastSuccess: previous?.lastSuccess }));
      }
    }

    void run();
    return () => controller.abort();
  }, [request]);

  const result = settled?.request === request ? settled.result : { status: 'loading' as const };
  return { result, lastSuccess: settled?.lastSuccess, retry: () => setAttempt(previous => previous + 1) };
}
