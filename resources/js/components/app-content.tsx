import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset
                {...props}
                className={cn(
                    'bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-900/92 dark:shadow-black/25',
                    props.className,
                )}
            >
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            {...props}
            className={cn(
                'mx-auto flex h-full w-full max-w-[1120px] flex-1 flex-col gap-4 rounded-2xl bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-slate-900/92 dark:shadow-black/25',
                props.className,
            )}
        >
            {children}
        </main>
    );
}
