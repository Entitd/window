import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    compact?: boolean;
};

export function OknaMarketLogo({ className, compact = false }: Props) {
    return (
        <span className={cn('inline-flex items-center gap-3', className)}>
            <span
                className={cn(
                    'grid place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/20',
                    compact ? 'size-10 text-base' : 'size-11 text-lg',
                )}
                aria-hidden="true"
            >
                О
            </span>
            <span
                className={cn(
                    'font-bold text-slate-950 dark:text-white',
                    compact ? 'text-sm' : 'text-base',
                )}
            >
                ОКНА<span className="text-blue-400">МАРКЕТ</span>
            </span>
        </span>
    );
}
