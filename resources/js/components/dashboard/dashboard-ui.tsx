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
                'flex min-w-0 flex-1 flex-col gap-5 overflow-x-hidden bg-muted/30 p-3 sm:p-5 lg:p-6',
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
                'relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/12 via-card to-card p-5 shadow-sm sm:p-7',
                className,
            )}
        >
            <div
                className="pointer-events-none absolute -top-24 -right-20 -z-10 size-64 rounded-full bg-primary/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    {Icon && (
                        <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:flex">
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
                'group overflow-hidden border-border/70 py-0 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md',
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
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
                'flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center sm:p-8',
                className,
            )}
        >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
