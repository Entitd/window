import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    CircleCheckBig,
    Clock3,
    FileStack,
    Settings2,
    ShieldCheck,
} from 'lucide-react';
import {
    DashboardEmptyState,
    DashboardHero,
    DashboardMetric,
    DashboardPage,
} from '@/components/dashboard/dashboard-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    getModerationLabel,
    getModerationVariant,
    getStatusLabel,
    getStatusVariant,
} from '@/lib/dashboard-format';
import type {
    RequestStatus,
    VendorLead,
    VendorProfile,
    VendorService,
} from '@/lib/dashboard-format';
import { vendors } from '@/routes';
import {
    dashboard as vendorDashboard,
    profile as vendorProfilePage,
    requests as vendorRequestsPage,
    services as vendorServicesPage,
} from '@/routes/vendor';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    vendorProfile: VendorProfile;
    vendorServices: VendorService[];
    vendorRequests: VendorLead[];
};

const leadStatusesToShow: RequestStatus[] = [
    'new',
    'confirmed',
    'in_progress',
    'completed',
    'rejected',
    'cancelled',
];

function getLeadCount(leads: VendorLead[], status: RequestStatus) {
    return leads.filter((item) => item.status === status).length;
}

function getPriorityScore(status: RequestStatus) {
    switch (status) {
        case 'new':
            return 3;
        case 'confirmed':
            return 2;
        case 'in_progress':
            return 1;
        default:
            return 0;
    }
}

export default function VendorDashboard() {
    const {
        auth,
        vendorProfile,
        vendorServices = [],
        vendorRequests = [],
    } = usePage<PageProps>().props;

    const activeServices = vendorServices.filter((service) => service.isActive);
    const newLeads = getLeadCount(vendorRequests, 'new');
    const activeLeads =
        getLeadCount(vendorRequests, 'confirmed') +
        getLeadCount(vendorRequests, 'in_progress');
    const completedLeads = getLeadCount(vendorRequests, 'completed');

    const profileChecklist = [
        {
            label: 'Контакты заполнены',
            done: Boolean(vendorProfile.phone && vendorProfile.email),
        },
        {
            label: 'Описание компании есть',
            done: vendorProfile.description.trim().length > 40,
        },
        {
            label: 'Районы работы указаны',
            done: vendorProfile.districts.length > 0,
        },
        {
            label: 'Есть активные услуги',
            done: activeServices.length > 0,
        },
    ];

    const completedChecklist = profileChecklist.filter(
        (item) => item.done,
    ).length;
    const profileReadyPercent = Math.round(
        (completedChecklist / profileChecklist.length) * 100,
    );

    const priorityLeads = [...vendorRequests]
        .sort(
            (firstLead, secondLead) =>
                getPriorityScore(secondLead.status) -
                getPriorityScore(firstLead.status),
        )
        .slice(0, 3);

    const statusBoard = leadStatusesToShow.map((status) => ({
        status,
        count: getLeadCount(vendorRequests, status),
        leads: vendorRequests
            .filter((lead) => lead.status === status)
            .slice(0, 2),
    }));

    const stats = [
        {
            title: 'Новые заявки',
            value: newLeads,
            description: 'Требуют ответа компании.',
            icon: FileStack,
        },
        {
            title: 'В работе',
            value: activeLeads,
            description: 'Принятые заказы на согласовании и исполнении.',
            icon: Clock3,
        },
        {
            title: 'Активные услуги',
            value: activeServices.length,
            description: 'Включены в каталоге компании.',
            icon: Settings2,
        },
        {
            title: 'Завершено',
            value: completedLeads,
            description: 'Успешно закрытые заказы.',
            icon: CheckCircle2,
        },
    ];

    return (
        <>
            <Head title="Кабинет компании" />

            <DashboardPage>
                <DashboardHero
                    icon={BriefcaseBusiness}
                    badge={
                        <>
                            <Badge
                                variant={getModerationVariant(
                                    vendorProfile.moderationStatus,
                                )}
                            >
                                {getModerationLabel(
                                    vendorProfile.moderationStatus,
                                )}
                            </Badge>
                            <Badge variant="secondary">
                                Профиль заполнен на {profileReadyPercent}%
                            </Badge>
                        </>
                    }
                    title={vendorProfile.companyName}
                    description={`${auth.user.name}, управляйте заявками, услугами и публикацией компании из одного рабочего пространства.`}
                    actions={
                        <>
                            <Button asChild>
                                <Link href={vendorRequestsPage()} prefetch>
                                    Открыть все заявки
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={vendorProfilePage()} prefetch>
                                    <BriefcaseBusiness
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Профиль компании
                                </Link>
                            </Button>
                        </>
                    }
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <DashboardMetric
                            key={item.title}
                            icon={item.icon}
                            label={item.title}
                            value={item.value}
                            description={item.description}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle className="text-xl">
                                        Приоритетные заявки
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Новые заявки и заказы, которые требуют
                                        внимания в первую очередь.
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={vendorRequestsPage()} prefetch>
                                        Все заявки
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {priorityLeads.length > 0 ? (
                                    priorityLeads.map((lead) => (
                                        <article
                                            className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-sm sm:p-5"
                                            key={lead.id}
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold">
                                                            {lead.id}
                                                        </span>
                                                        <Badge
                                                            variant={getStatusVariant(
                                                                lead.status,
                                                            )}
                                                        >
                                                            {getStatusLabel(
                                                                lead.status,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {lead.service}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {lead.city},{' '}
                                                            {lead.district}{' '}
                                                            район
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-sm lg:text-right">
                                                    <p className="font-semibold">
                                                        {lead.estimatedPrice}
                                                    </p>
                                                    <p className="mt-1 text-muted-foreground">
                                                        {lead.createdAt}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-muted-foreground">
                                                        Дата работ
                                                    </p>
                                                    <p className="mt-1 font-medium">
                                                        {lead.installationDate}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-muted-foreground">
                                                        Размер
                                                    </p>
                                                    <p className="mt-1 font-medium">
                                                        {lead.width} x{' '}
                                                        {lead.height} см
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-muted-foreground">
                                                        Доп. работы
                                                    </p>
                                                    <p className="mt-1 font-medium">
                                                        {lead.extras.length > 0
                                                            ? lead.extras.join(
                                                                  ', ',
                                                              )
                                                            : 'Не указаны'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-2xl border border-dashed border-sidebar-border/70 p-3 text-sm text-muted-foreground dark:border-sidebar-border">
                                                {lead.comment}
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={vendorRequestsPage()}
                                                    >
                                                        Открыть очередь
                                                    </Link>
                                                </Button>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <DashboardEmptyState
                                        className="min-h-56"
                                        icon={FileStack}
                                        title="Новых заявок нет"
                                        description="Входящие заказы от клиентов отображаются в этой очереди."
                                        action={
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={vendorServicesPage()}
                                                >
                                                    Проверить услуги
                                                </Link>
                                            </Button>
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    Срез по статусам
                                </CardTitle>
                                <CardDescription>
                                    Количество заказов на каждом этапе работы.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                                {statusBoard.map((column) => (
                                    <div
                                        className="rounded-2xl border border-border/70 bg-muted/15 p-4"
                                        key={column.status}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <Badge
                                                variant={getStatusVariant(
                                                    column.status,
                                                )}
                                            >
                                                {getStatusLabel(column.status)}
                                            </Badge>
                                            <span className="text-sm font-semibold">
                                                {column.count}
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {column.leads.length > 0 ? (
                                                column.leads.map((lead) => (
                                                    <div
                                                        className="rounded-lg bg-muted/50 p-3 text-sm"
                                                        key={lead.id}
                                                    >
                                                        <p className="font-medium">
                                                            {lead.id}
                                                        </p>
                                                        <p className="mt-1 text-muted-foreground">
                                                            {lead.service}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                                                    Нет заявок
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Готовность профиля</CardTitle>
                                <CardDescription>
                                    Проверьте основные данные перед публикацией.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Общая готовность
                                        </span>
                                        <span className="font-medium">
                                            {profileReadyPercent}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${profileReadyPercent}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {profileChecklist.map((item) => (
                                        <div
                                            className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-3"
                                            key={item.label}
                                        >
                                            <span className="text-sm">
                                                {item.label}
                                            </span>
                                            <Badge
                                                variant={
                                                    item.done
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {item.done
                                                    ? 'Готово'
                                                    : 'Заполнить'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Модерация и публикация</CardTitle>
                                <CardDescription>
                                    Статус проверки и доступность услуг.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                    <ShieldCheck
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            {getModerationLabel(
                                                vendorProfile.moderationStatus,
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {vendorProfile.moderationNote}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                    <CalendarDays
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            Активных услуг
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {activeServices.length} из{' '}
                                            {vendorServices.length} включены в
                                            каталоге.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Быстрые переходы</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <Link href={vendorProfilePage()} prefetch>
                                        <BriefcaseBusiness
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Профиль компании
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <Link href={vendorServicesPage()} prefetch>
                                        <Settings2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Услуги и цены
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <Link href={vendorRequestsPage()} prefetch>
                                        <FileStack
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Все заявки
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <Link href={vendors()} prefetch>
                                        <CircleCheckBig
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Публичная страница для компаний
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardPage>
        </>
    );
}

VendorDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет компании',
            href: vendorDashboard(),
        },
    ],
};
