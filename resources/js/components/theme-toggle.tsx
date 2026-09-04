import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const label = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';

    return (
        <button
            aria-label={label}
            className="theme-toggle fixed bottom-4 left-4 z-40 grid size-12 place-items-center rounded-full border border-white/65 bg-white/70 text-blue-700 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-500/25 focus-visible:outline-none sm:bottom-6 sm:left-6 dark:border-white/10 dark:bg-slate-950/70 dark:text-blue-300 dark:hover:border-blue-700"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            title={label}
            type="button"
        >
            {isDark ? (
                <Sun aria-hidden="true" className="size-5" />
            ) : (
                <Moon aria-hidden="true" className="size-5" />
            )}
        </button>
    );
}