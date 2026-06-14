import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    MessageSquareText,
    Plus,
    RefreshCw,
    Ruler,
    Star,
    XCircle,
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
    clientRequests,
    getStatusLabel,
    getStatusVariant,
    type ClientRequest,
} from '@/lib/dashboard-mock';
import { dashboard as appDashboard, home } from '@/routes';
import { dashboard as clientDashboard } from '@/routes/client';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
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

function formatWindowSize(request: ClientRequest) {
    return `${request.width} x ${request.height} см`;
}

function RequestSummaryCard({
    request,
    isFeatured = false,
}: {
    request: ClientRequest;
    isFeatured?: boolean;
}) {
    return (
        <article className="rounded-xl border border-sidebar-border/70 bg-background p-4 dark:border-sidebar-border">
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

                <div className="text-sm font-semibold lg:text-right">
                    {request.estimatedPrice}
                </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3">
                    <dt className="text-muted-foreground">Создана</dt>
                    <dd className="mt-1 font-medium">{request.createdAt}</dd>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                    <dt className="text-muted-foreground">Дата работ</dt>
                    <dd className="mt-1 font-medium">
                        {request.installationDate}
                    </dd>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                    <dt className="text-muted-foreground">Размер</dt>
                    <dd className="mt-1 font-medium">
                        {formatWindowSize(request)}
                    </dd>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                    <dt className="text-muted-foreground">Компания</dt>
                    <dd className="mt-1 font-medium">
                        {request.company ?? 'Компания не выбрана'}
                    </dd>
                </div>
            </dl>

            {isFeatured && (
                <div className="mt-5 rounded-lg border border-dashed border-sidebar-border/70 p-3 text-sm text-muted-foreground dark:border-sidebar-border">
                    <span className="font-medium text-foreground">
                        Комментарий:
                    </span>{' '}
                    {request.comment}
                </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button variant="outline" size="sm" type="button" disabled>
                    Посмотреть заявку
                </Button>
                <Button variant="secondary" size="sm" asChild>
                    <Link href={home()} prefetch>
                        <RefreshCw className="size-4" aria-hidden="true" />
                        Повторить заявку
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    disabled={!isActiveRequest(request)}
                >
                    <XCircle className="size-4" aria-hidden="true" />
                    Отменить заявку
                </Button>
            </div>
        </article>
    );
}

function EmptyRequestsState() {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-sidebar-border/70 p-8 text-center dark:border-sidebar-border">
            <div className="rounded-full bg-muted p-3">
                <Plus className="size-6" aria-hidden="true" />
            </div>
            <div className="max-w-md space-y-2">
                <h2 className="text-lg font-semibold">У вас пока нет заявок</h2>
                <p className="text-sm text-muted-foreground">
                    Создайте первую заявку, чтобы получить расчет, выбрать
                    компанию и видеть историю заказа в кабинете.
                </p>
            </div>
            <Button asChild>
                <Link href={home()} prefetch>
                    <Plus className="size-4" aria-hidden="true" />
                    Создать заявку
                </Link>
            </Button>
        </div>
    );
}

export default function ClientDashboard() {
    const { auth } = usePage<PageProps>().props;

    // Mock data: frontend-only until client requests are connected to backend.
    const requests = clientRequests;
    const activeRequests = requests.filter(isActiveRequest);
    const completedRequests = requests.filter(
        (request) => request.status === 'completed',
    );
    const selectedRequest = activeRequests[0] ?? requests[0] ?? null;
    const lastCompletedRequest = completedRequests[0] ?? null;

    return (
        <>
            <Head title="Кабинет клиента" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border">
                        <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Активные заявки
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {activeRequests.length}
                                    </p>
                                </div>
                                <Clock3
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Заявки, по которым компания еще работает или
                                подтверждает детали.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border">
                        <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Ближайшая дата
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold">
                                        {selectedRequest?.installationDate ??
                                            'Не выбрана'}
                                    </p>
                                </div>
                                <CalendarDays
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Дата из последней активной заявки клиента.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border">
                        <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Завершенные работы
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {completedRequests.length}
                                    </p>
                                </div>
                                <CheckCircle2
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                После завершения здесь появится возможность
                                оставить отзыв.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-xl">
                                        {auth.user.name}, ваш кабинет
                                    </CardTitle>
                                    <CardDescription>
                                        Здесь собраны заявки, выбранные
                                        компании, сроки работ и история
                                        изменений по заказам.
                                    </CardDescription>
                                </div>
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href={home()} prefetch>
                                        <Plus
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Новая заявка
                                    </Link>
                                </Button>
                            </CardHeader>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Текущая заявка</CardTitle>
                                <CardDescription>
                                    Самый важный заказ сейчас: статус, компания,
                                    цена и параметры окна.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedRequest ? (
                                    <RequestSummaryCard
                                        request={selectedRequest}
                                        isFeatured
                                    />
                                ) : (
                                    <EmptyRequestsState />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Мои заявки</CardTitle>
                                <CardDescription>
                                    Список заказов клиента с быстрыми
                                    действиями.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {requests.length > 0 ? (
                                    <div className="grid gap-3">
                                        {requests.map((request) => (
                                            <RequestSummaryCard
                                                key={request.id}
                                                request={request}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyRequestsState />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="flex flex-col gap-4">
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
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
                                        История появится после создания первой
                                        заявки.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Следующие шаги</CardTitle>
                                <CardDescription>
                                    Что клиент ожидает от сервиса после выбора
                                    компании.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                                    <MessageSquareText
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Переписка с компанией
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Пока заглушка: позже здесь будут
                                            сообщения по выбранной заявке.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                                    <Ruler
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Уточнение замера
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Компания сможет предложить новую
                                            дату или уточнить параметры заказа.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
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

                        {lastCompletedRequest && (
                            <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle>Отзыв о работе</CardTitle>
                                    <CardDescription>
                                        Блок для оценки завершенной услуги.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        {[1, 2, 3, 4, 5].map((item) => (
                                            <Star
                                                className="size-5"
                                                key={item}
                                                aria-hidden="true"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {lastCompletedRequest.id} завершена.
                                        После подключения backend здесь можно
                                        будет оставить оценку компании{' '}
                                        {lastCompletedRequest.company}.
                                    </p>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        disabled
                                    >
                                        Оставить отзыв
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </aside>
                </div>
            </div>
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
