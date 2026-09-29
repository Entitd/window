import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col bg-[linear-gradient(135deg,#eaf2ff_0%,#f7fbff_42%,#fff3e8_100%)] text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#1e293b_100%)] dark:text-slate-50">
                {children}
            </div>
        );
    }

    return (
        <SidebarProvider
            defaultOpen={isOpen}
            className="bg-[linear-gradient(135deg,#eaf2ff_0%,#f7fbff_42%,#fff3e8_100%)] text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#1e293b_100%)] dark:text-slate-50"
        >
            {children}
        </SidebarProvider>
    );
}
