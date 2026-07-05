import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    ClipboardList,
    FolderGit2,
    LayoutGrid,
    ShieldCheck,
    UserRound,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userRole = String(auth.user.role ?? '');
    const roleItems =
        userRole === 'admin'
            ? adminNavItems
            : userRole === 'vendor'
              ? vendorNavItems
              : userRole === 'client'
                ? clientNavItems
                : [];

    return (
        <Sidebar collapsible="icon" variant="inset">
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
                <NavMain items={mainNavItems} />
                {roleItems.length > 0 && <NavMain items={roleItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
