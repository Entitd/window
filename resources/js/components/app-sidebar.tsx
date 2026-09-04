import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ClipboardList,
    LayoutGrid,
    MessageSquareText,
    ShieldCheck,
    UserRound,
    Wrench,
} from 'lucide-react';
import { index as chatsIndex } from '@/actions/App/Http/Controllers/ChatController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Панель',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Модерация компаний',
        href: '/admin/vendors/moderation',
        icon: ShieldCheck,
    },
];

const clientNavItems: NavItem[] = [
    {
        title: 'Мои заявки',
        href: '/client/dashboard',
        icon: ClipboardList,
    },
    {
        title: 'Чаты',
        href: chatsIndex(),
        icon: MessageSquareText,
    },
];

const vendorNavItems: NavItem[] = [
    {
        title: 'Кабинет компании',
        href: '/vendor/dashboard',
        icon: Building2,
    },
    {
        title: 'Заявки',
        href: '/vendor/requests',
        icon: ClipboardList,
    },
    {
        title: 'Чаты',
        href: chatsIndex(),
        icon: MessageSquareText,
    },
    {
        title: 'Услуги',
        href: '/vendor/services',
        icon: Wrench,
    },
    {
        title: 'Профиль',
        href: '/vendor/profile',
        icon: UserRound,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: Auth['user'] | null } }>().props;
    const userRole = String(auth.user?.role ?? '');
    const roleItems =
        userRole === 'admin'
            ? adminNavItems
            : userRole === 'vendor'
              ? vendorNavItems
              : userRole === 'client'
                ? clientNavItems
                : [];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-white/65 bg-white/35 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* <NavMain items={mainNavItems} /> */}
                {roleItems.length > 0 && <NavMain items={roleItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
