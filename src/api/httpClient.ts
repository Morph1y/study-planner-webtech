export async function httpRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL?.trim();
  if (!baseUrl) throw new Error('Вкажіть VITE_API_URL у файлі .env і перезапустіть Vite.');

  const response = await fetch(new URL(path, `${baseUrl.replace(/\/+$/, '')}/`), options);
  if (!response.ok) throw new Error(`Помилка сервера (HTTP ${response.status}).`);
  return response.json() as Promise<T>;
}
