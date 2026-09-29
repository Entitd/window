import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export function MarketThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const label = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';

    return (
        <button
            aria-label={label}
            className="market-theme-toggle"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            title={label}
            type="button"
        >
            {isDark ? (
                <Sun aria-hidden="true" size={20} />
            ) : (
                <Moon aria-hidden="true" size={20} />
            )}
        </button>
    );
}
