import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DashboardPageProps = {
    children: ReactNode;
    className?: string;
};

type DashboardHeroProps = {
    title: ReactNode;
    description: ReactNode;
    actions?: ReactNode;
    badge?: ReactNode;
    icon?: LucideIcon;
    className?: string;
};

type DashboardMetricProps = {
    label: string;
    value: ReactNode;
    description?: ReactNode;
    icon: LucideIcon;
    className?: string;
};

type DashboardEmptyStateProps = {
    title: string;
    description: ReactNode;
    icon: LucideIcon;
    action?: ReactNode;
    className?: string;
};

export function DashboardPage({ children, className }: DashboardPageProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 flex-1 flex-col gap-5 overflow-x-hidden bg-transparent p-3 sm:p-5 lg:p-6',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function DashboardHero({
    title,
    description,
    actions,
    badge,
    icon: Icon,
    className,
}: DashboardHeroProps) {
    return (
        <section
            className={cn(
                'relative isolate overflow-hidden rounded-2xl border border-white/65 bg-white/65 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7 dark:border-white/10 dark:bg-slate-950/35 dark:shadow-black/25',
                className,
            )}
        >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    {Icon && (
                        <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/15 sm:flex dark:bg-blue-500">
                            <Icon className="size-6" aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0 space-y-3">
                        {badge && (
                            <div className="flex flex-wrap gap-2">{badge}</div>
                        )}
                        <div className="space-y-2">
                            <h1 className="max-w-3xl text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                {actions && (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}

export function DashboardMetric({
    label,
    value,
    description,
    icon: Icon,
    className,
}: DashboardMetricProps) {
    return (
        <Card
            className={cn(
                'group overflow-hidden border-slate-200/80 bg-white/90 py-0 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/45 dark:hover:border-blue-900/70',
                className,
            )}
        >
            <CardContent className="flex min-h-32 flex-col justify-between gap-5 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                            {value}
                        </p>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/45 dark:text-blue-300 dark:group-hover:bg-blue-500">
                        <Icon className="size-5" aria-hidden="true" />
                    </span>
                </div>
                {description && (
                    <p className="text-sm leading-5 text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function DashboardEmptyState({
    title,
    description,
    icon: Icon,
    action,
    className,
}: DashboardEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center sm:p-8 dark:border-slate-700 dark:bg-slate-950/35',
                className,
            )}
        >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/45 dark:text-blue-300">
                <Icon className="size-6" aria-hidden="true" />
            </span>
            <div className="max-w-md space-y-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}
