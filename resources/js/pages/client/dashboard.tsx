import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Plus,
    RefreshCw,
    XCircle,
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
import { getStatusLabel, getStatusVariant } from '@/lib/dashboard-format';
import type { ClientRequest } from '@/lib/dashboard-format';
import { dashboard as appDashboard, home } from '@/routes';
import { dashboard as clientDashboard } from '@/routes/client';
import {
    cancel as cancelRequest,
    repeat as repeatRequest,
    show as showRequest,
} from '@/routes/client/requests';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    requests: ClientRequest[];
};

const activeStatuses = [
    'new',
    'awaiting_confirmation',
    'confirmed',
    'in_progress',
];

function isActiveRequest(request: ClientRequest) {
    return activeStatuses.includes(request.status);
}

function canCancelClientRequest(request: ClientRequest) {
    return ['new', 'awaiting_confirmation', 'confirmed'].includes(
        request.status,
    );
}

function cancelClientRequest(requestId: string) {
    router.patch(
        cancelRequest.url(Number(requestId)),
        {},
        {
            preserveScroll: true,
        },
    );
}

function repeatClientRequest(requestId: string) {
    router.post(
        repeatRequest.url(Number(requestId)),
        {},
        {
            preserveScroll: true,
        },
    );
}

function formatWindowSize(request: ClientRequest) {
    return `${request.width} x ${request.height} см`;
}

function getNextStep(request: ClientRequest) {
    switch (request.status) {
        case 'new':
            return {
                title: 'Проверьте параметры заявки',
                description:
                    'До подтверждения вы можете изменить дату, район и детали заказа.',
            };
        case 'awaiting_confirmation':
            return {
                title: 'Ожидайте ответа компании',
                description:
                    'Исполнитель проверяет детали и подтвердит возможность выполнить работу.',
            };
        case 'confirmed':
            return {
                title: 'Подготовьтесь к согласованной дате',
                description:
                    'Компания приняла заявку. Все параметры заказа сохранены в карточке.',
            };
        case 'in_progress':
            return {
                title: 'Работы выполняются',
                description:
                    'Следите за обновлениями статуса в истории заявки.',
            };
        case 'completed':
            return {
                title: 'Работа завершена',
                description:
                    'Карточка заказа и вся история остаются доступными в кабинете.',
            };
        case 'rejected':
            return {
                title: 'Создайте новую заявку',
                description:
                    'Можно повторить заказ с теми же параметрами и выбрать другую компанию.',
            };
        case 'cancelled':
            return {
                title: 'Заявка отменена',
                description:
                    'При необходимости повторите её — параметры заполнятся автоматически.',
            };
    }
}

function RequestSummaryCard({
    request,
    isFeatured = false,
    canCancel = false,
    canRepeat = false,
}: {
    request: ClientRequest;
    isFeatured?: boolean;
    canCancel?: boolean;
    canRepeat?: boolean;
}) {
    return (
        <article
            className={`rounded-2xl border bg-card p-4 shadow-xs transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-sm sm:p-5 ${
                isFeatured
                    ? 'border-primary/25 ring-1 ring-primary/10'
                    : 'border-border/70'
            }`}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                            {request.id}
                        </span>
                        <Badge variant={getStatusVariant(request.status)}>
                            {getStatusLabel(request.status)}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">
                            {request.service}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {request.city}, {request.district} район
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-primary/8 px-3 py-2 text-sm font-semibold text-primary lg:text-right">
                    {request.estimatedPrice}
                </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-muted/60 p-3">
                    <dt className="text-muted-foreground">Создана</dt>
                    <dd className="mt-1 font-medium">{request.createdAt}</dd>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                    <dt className="text-muted-foreground">Дата работ</dt>
                    <dd className="mt-1 font-medium">
                        {request.installationDate}
                    </dd>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                    <dt className="text-muted-foreground">Размер</dt>
                    <dd className="mt-1 font-medium">
                        {formatWindowSize(request)}
                    </dd>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                    <dt className="text-muted-foreground">Компания</dt>
                    <dd className="mt-1 font-medium">
                        {request.company ?? 'Компания не выбрана'}
                    </dd>
                </div>
            </dl>

            {isFeatured && (
                <div className="mt-5 rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                        Комментарий:
                    </span>{' '}
                    {request.comment}
                </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                    variant={isFeatured ? 'default' : 'outline'}
                    size="sm"
                    asChild
                >
                    <Link href={showRequest(request.id)} prefetch>
                        Посмотреть заявку
                    </Link>
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    disabled={!canRepeat}
                    onClick={() => repeatClientRequest(request.id)}
                >
                    <>
                        <RefreshCw className="size-4" aria-hidden="true" />
                        Повторить заявку
                    </>
                </Button>
                {canCancel && canCancelClientRequest(request) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => cancelClientRequest(request.id)}
                    >
                        <XCircle className="size-4" aria-hidden="true" />
                        Отменить заявку
                    </Button>
                )}
            </div>
        </article>
    );
}

function EmptyRequestsState() {
    return (
        <DashboardEmptyState
            icon={ClipboardList}
            title="Заявок ещё нет"
            description="Создайте заявку, сравните подходящие компании и следите за заказом в одном месте."
            action={
                <Button asChild>
                    <Link href={home()} prefetch>
                        <Plus className="size-4" aria-hidden="true" />
                        Создать заявку
                    </Link>
                </Button>
            }
        />
    );
}

export default function ClientDashboard() {
    const { auth, requests = [] } = usePage<PageProps>().props;

    const activeRequests = requests.filter(isActiveRequest);
    const completedRequests = requests.filter(
        (request) => request.status === 'completed',
    );
    const selectedRequest = activeRequests[0] ?? requests[0] ?? null;
    const otherRequests = selectedRequest
        ? requests.filter((request) => request.id !== selectedRequest.id)
        : [];
    const nextStep = selectedRequest ? getNextStep(selectedRequest) : null;

    return (
        <>
            <Head title="Кабинет клиента" />

            <DashboardPage>
                <DashboardHero
                    icon={ClipboardList}
                    badge={
                        <>
                            <Badge variant="secondary">Личный кабинет</Badge>
                            {selectedRequest && (
                                <Badge
                                    variant={getStatusVariant(
                                        selectedRequest.status,
                                    )}
                                >
                                    {getStatusLabel(selectedRequest.status)}
                                </Badge>
                            )}
                        </>
                    }
                    title={`Здравствуйте, ${auth.user.name}`}
                    description="Здесь собраны ваши заявки, сроки работ и история общения с выбранными компаниями."
                    actions={
                        <Button asChild size="lg">
                            <Link href={home()} prefetch>
                                <Plus className="size-4" aria-hidden="true" />
                                Новая заявка
                            </Link>
                        </Button>
                    }
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <DashboardMetric
                        icon={Clock3}
                        label="Активные заявки"
                        value={activeRequests.length}
                        description="Заказы на согласовании или в работе."
                    />
                    <DashboardMetric
                        icon={CalendarDays}
                        label="Ближайшая дата"
                        value={
                            selectedRequest?.installationDate ?? 'Не выбрана'
                        }
                        description="Дата работ по актуальной заявке."
                    />
                    <DashboardMetric
                        icon={CheckCircle2}
                        label="Завершённые работы"
                        value={completedRequests.length}
                        description="История выполненных заказов."
                    />
                </div>

                <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Текущая заявка</CardTitle>
                                <CardDescription>
                                    Статус, исполнитель, дата и основные
                                    параметры заказа.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedRequest ? (
                                    <RequestSummaryCard
                                        request={selectedRequest}
                                        isFeatured
                                        canCancel
                                        canRepeat
                                    />
                                ) : (
                                    <EmptyRequestsState />
                                )}
                            </CardContent>
                        </Card>

                        {otherRequests.length > 0 && (
                            <Card className="border-border/70 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Остальные заявки</CardTitle>
                                    <CardDescription>
                                        Архив и другие активные заказы.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {otherRequests.map((request) => (
                                            <RequestSummaryCard
                                                key={request.id}
                                                request={request}
                                                canCancel
                                                canRepeat
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <aside className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Статус заказа</CardTitle>
                                <CardDescription>
                                    История изменений по выбранной заявке.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedRequest ? (
                                    <ol className="grid gap-4">
                                        {selectedRequest.history.map(
                                            (event, index) => (
                                                <li
                                                    className="grid grid-cols-[auto_1fr] gap-3"
                                                    key={`${event.label}-${event.timestamp}`}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span className="mt-1 size-2.5 rounded-full bg-foreground" />
                                                        {index <
                                                            selectedRequest
                                                                .history
                                                                .length -
                                                                1 && (
                                                            <span className="mt-2 h-full w-px bg-border" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 pb-1">
                                                        <div className="text-sm font-medium">
                                                            {event.label}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {event.timestamp}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {event.note}
                                                        </p>
                                                    </div>
                                                </li>
                                            ),
                                        )}
                                    </ol>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Создайте заявку, чтобы видеть её
                                        историю.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {nextStep && selectedRequest && (
                            <Card className="overflow-hidden border-primary/15 bg-primary/5 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Что делать дальше</CardTitle>
                                    <CardDescription>
                                        Рекомендация по текущей заявке.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="space-y-2">
                                        <p className="font-semibold">
                                            {nextStep.title}
                                        </p>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {nextStep.description}
                                        </p>
                                    </div>
                                    <Button asChild className="w-full">
                                        <Link
                                            href={showRequest(
                                                selectedRequest.id,
                                            )}
                                        >
                                            Открыть заявку
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Профиль клиента</CardTitle>
                                <CardDescription>
                                    Контакты, к которым будут привязаны заявки.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Имя
                                    </span>
                                    <span className="font-medium">
                                        {auth.user.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Email
                                    </span>
                                    <span className="text-right font-medium break-all">
                                        {auth.user.email}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </DashboardPage>
        </>
    );
}

ClientDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: appDashboard(),
        },
        {
            title: 'Кабинет клиента',
            href: clientDashboard(),
        },
    ],
};
