import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    CircleCheckBig,
    Clock3,
    FileStack,
    MessageSquareText,
    Settings2,
    ShieldCheck,
} from 'lucide-react';
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
    type RequestStatus,
    type VendorLead,
    type VendorProfile,
    type VendorService,
} from '@/lib/dashboard-format';
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
        {
            label: 'Добавлена галерея работ',
            done: vendorProfile.gallery.length > 0,
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
            description: 'Те, которые стоит разобрать в первую очередь.',
            icon: FileStack,
        },
        {
            title: 'В работе',
            value: activeLeads,
            description: 'Принятые и уже двигающиеся заявки.',
            icon: Clock3,
        },
        {
            title: 'Активные услуги',
            value: activeServices.length,
            description: 'То, что сейчас реально видно клиенту в каталоге.',
            icon: Settings2,
        },
        {
            title: 'Завершено',
            value: completedLeads,
            description: 'Закрытые заявки по реальным данным компании.',
            icon: CheckCircle2,
        },
    ];

    return (
        <>
            <Head title="Кабинет компании" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                    <CardHeader className="gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={getModerationVariant(
                                        vendorProfile.moderationStatus,
                                    )}
                                >
                                    {getModerationLabel(
                                        vendorProfile.moderationStatus,
                                    )}
                                </Badge>
                                <Badge variant="outline">
                                    Профиль готов на {profileReadyPercent}%
                                </Badge>
                            </div>

                            <div>
                                <CardTitle className="text-2xl">
                                    {vendorProfile.companyName}, здесь собраны
                                    заявки, профиль и статус публикации
                                </CardTitle>
                                <CardDescription className="mt-2 max-w-3xl">
                                    Привет, {auth.user.name}. Экран уже работает
                                    как центральная точка для компании: видно
                                    приоритетные заявки, готовность профиля и
                                    что нужно дожать следующим шагом.
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                            <Button asChild>
                                <Link href="/vendor/requests">
                                    Открыть все заявки
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/vendor/profile">
                                    <BriefcaseBusiness
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Профиль компании
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <Card
                            className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border"
                            key={item.title}
                        >
                            <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold">
                                            {item.value}
                                        </p>
                                    </div>
                                    <item.icon
                                        className="size-5 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle className="text-xl">
                                        Приоритетные заявки
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Верхняя часть очереди: сюда вынесены
                                        новые и самые горячие лиды, чтобы
                                        менеджер не рылся по всему списку.
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/vendor/requests">
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
                                            className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
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

                                            <div className="mt-4 rounded-xl border border-dashed border-sidebar-border/70 p-3 text-sm text-muted-foreground dark:border-sidebar-border">
                                                {lead.comment}
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link href="/vendor/requests">
                                                        Открыть очередь
                                                    </Link>
                                                </Button>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-sidebar-border/70 p-8 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                        У компании пока нет назначенных заявок.
                                        Когда клиент выберет компанию, заявка
                                        появится здесь и в общей очереди.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    Срез по статусам
                                </CardTitle>
                                <CardDescription>
                                    Быстрый борд по заявкам: видно, где очередь
                                    пухнет, а где всё уже под контролем.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                                {statusBoard.map((column) => (
                                    <div
                                        className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
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
                                                    Пока пусто
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Готовность профиля</CardTitle>
                                <CardDescription>
                                    Блок показывает, насколько карточка компании
                                    уже собрана под публикацию и работу с
                                    лидами.
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
                                            className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3"
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
                                                    : 'Нужно проверить'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Модерация и публикация</CardTitle>
                                <CardDescription>
                                    Статус карточки и то, что сейчас видит
                                    сервис.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
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

                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
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
                                            {vendorServices.length} доступны
                                            клиенту.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                                    <MessageSquareText
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            Галерея и доверие
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            В профиле{' '}
                                            {vendorProfile.gallery.length}{' '}
                                            позиции в галерее. Это уже неплохо,
                                            но дальше можно будет привязать
                                            реальные фото.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Быстрые переходы</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <Link href="/vendor/profile">
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
                                    <Link href="/vendor/services">
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
                                    <Link href="/vendor/requests">
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
                                    <Link href="/vendors">
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
            </div>
        </>
    );
}

VendorDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет компании',
            href: '/vendor/dashboard',
        },
    ],
};
