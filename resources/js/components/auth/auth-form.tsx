import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const authControlClassName =
    'h-11 rounded-lg border-slate-200 bg-white px-3.5 text-sm shadow-none transition-colors placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950/60 dark:placeholder:text-slate-500';

export const authTextareaClassName =
    'min-h-22 w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-5 shadow-none outline-none transition-colors placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/15 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:border-slate-700 dark:bg-slate-950/60 dark:placeholder:text-slate-500';

export const authButtonClassName =
    'h-11 w-full rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 hover:shadow-[0_12px_28px_rgba(37,99,235,0.24)] focus-visible:border-blue-500 focus-visible:ring-blue-500/25 dark:bg-blue-500 dark:hover:bg-blue-400';

export const authFormClassName = 'grid gap-4';

export const authFieldsGridClassName = 'grid gap-3 sm:grid-cols-2';

export const authRoleSwitchClassName =
    'flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/75 p-1.5 dark:border-blue-900/60 dark:bg-blue-950/30';

export const authRoleSwitchLabelClassName =
    'flex items-center gap-2 px-1 text-xs font-semibold text-blue-800 dark:text-blue-200';

export const authRoleSwitchIconClassName =
    'grid size-7 place-items-center rounded-lg bg-blue-600 text-white';

export const authRoleSwitchLinkClassName =
    'inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:bg-slate-900 dark:text-slate-200 dark:hover:text-blue-300';

export function AuthField({
    id,
    label,
    hint,
    error,
    children,
    className,
}: {
    id: string;
    label: string;
    hint?: ReactNode;
    error?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('grid gap-1.5', className)}>
            <div className="flex min-h-4 items-center justify-between gap-3">
                <Label
                    htmlFor={id}
                    className="text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                    {label}
                </Label>
                {hint && (
                    <span className="text-xs leading-none text-slate-500 dark:text-slate-400">
                        {hint}
                    </span>
                )}
            </div>
            {children}
            <InputError id={`${id}-error`} message={error} />
        </div>
    );
}

export function AuthSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <fieldset className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-950/35">
            <legend className="sr-only">{title}</legend>
            <div className="grid gap-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {title}
                </h2>
                {description && (
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </fieldset>
    );
}

export function AuthNotice({
    children,
    tone = 'info',
}: {
    children: ReactNode;
    tone?: 'info' | 'success' | 'error';
}) {
    const styles = {
        info: {
            className:
                'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/45 dark:text-blue-100',
            icon: Info,
        },
        success: {
            className:
                'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/45 dark:text-emerald-100',
            icon: CircleCheck,
        },
        error: {
            className:
                'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-100',
            icon: CircleAlert,
        },
    } as const;
    const Icon = styles[tone].icon;

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm leading-5',
                styles[tone].className,
            )}
            role={tone === 'error' ? 'alert' : 'status'}
        >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>{children}</div>
        </div>
    );
}

export function AuthFooter({ children }: { children: ReactNode }) {
    return (
        <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {children}
        </div>
    );
}
