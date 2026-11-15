import { useEffect, useState, type ReactNode } from 'react';
import { Header } from './Header';

export function PlannerLayout({ children, lab }: { children: ReactNode; lab: number }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    return () => document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header lab={lab} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(prev => !prev)} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">{children}</main>
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        Study Planner · Лабораторна робота №{lab} · React + TypeScript + Vite
      </footer>
    </div>
  );
}
