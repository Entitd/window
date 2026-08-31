import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    CircleAlert,
    ClipboardList,
    Clock3,
    MessageSquareText,
    Pencil,
    Ruler,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { ReviewFormCard } from '@/components/client/review-form-card';
import {
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStatusLabel, getStatusVariant } from '@/lib/dashboard-format';
import type { ClientRequest } from '@/lib/dashboard-format';
import { dashboard as clientDashboard } from '@/routes/client';
import {
    cancel as cancelRequest,
    repeat as repeatRequest,
    update as updateRequest,
} from '@/routes/client/requests';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    requestId: string;
    request?: ClientRequest;
};

type ClientRequestEditForm = {
    city: string;
    district: string;
    installation_date: string;
    window_width: number;
    window_height: number;
    additional_services: string;
    comment: string;
};

const requestSteps = [
    {
        key: 'created',
        title: 'Заявка создана',
        statuses: [
            'new',
            'awaiting_confirmation',
            'confirmed',
            'in_progress',
            'completed',
        ],
    },
    {
        key: 'company_selected',
        title: 'Компания выбрана',
        statuses: [
            'awaiting_confirmation',
            'confirmed',
            'in_progress',
            'completed',
        ],
    },
    {
        key: 'work_confirmed',
        title: 'Дата подтверждена',
        statuses: ['confirmed', 'in_progress', 'completed'],
    },
    {
        key: 'work_done',
        title: 'Работа завершена',
        statuses: ['completed'],
    },
];

function canEditRequest(status: string) {
    return ['new', 'awaiting_confirmation'].includes(status);
}

function canCancelRequest(status: string) {
    return ['new', 'awaiting_confirmation', 'confirmed'].includes(status);
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

function getRequestProgress(status: string) {
    const completedSteps = requestSteps.filter((step) =>
        step.statuses.includes(status),
    ).length;

    return Math.round((completedSteps / requestSteps.length) * 100);
}

export default function ClientRequestShow() {
    const { auth, requestId, request } = usePage<PageProps>().props;
    const editForm = useForm<ClientRequestEditForm>({
        city: request?.city ?? '',
        district: request?.districtValue ?? '',
        installation_date: request?.installationDateValue ?? '',
        window_width: request?.width ?? 1,
        window_height: request?.height ?? 1,
        additional_services: request?.extras.join(', ') ?? '',
        comment: request?.commentValue ?? '',
    });

    function submitEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!request || !canEditRequest(request.status)) {
            return;
        }

        editForm.patch(updateRequest.url(Number(request.id)), {
            preserveScroll: true,
        });
    }

    if (!request) {
        return (
            <>
                <Head title="Заявка не найдена" />

                <DashboardPage>
                    <Card className="border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Заявка не найдена</CardTitle>
                            <CardDescription>
                                Заявка с номером {requestId} не найдена или
                                недоступна текущему пользователю.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href={clientDashboard()}>
                                    <ArrowLeft
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Назад в кабинет
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </DashboardPage>
            </>
        );
    }

    const requestProgress = getRequestProgress(request.status);
    const statusDetails = [
        {
            label: 'Статус',
            value: getStatusLabel(request.status),
            icon: ShieldCheck,
        },
        {
            label: 'Дата работ',
            value: request.installationDate,
            icon: CalendarDays,
        },
        {
            label: 'Размер окна',
            value: `${request.width} x ${request.height} см`,
            icon: Ruler,
        },
        {
            label: 'Исполнитель',
            value: request.company ?? 'Не назначена',
            icon: BadgeCheck,
        },
    ];

    return (
        <>
            <Head title={`Заявка ${request.id}`} />

            <DashboardPage>
                <DashboardHero
                    icon={ClipboardList}
                    badge={
                        <>
                            <Badge variant={getStatusVariant(request.status)}>
                                {getStatusLabel(request.status)}
                            </Badge>
                            <Badge variant="outline">
                                Готовность {requestProgress}%
                            </Badge>
                        </>
                    }
                    title={`Заявка №${request.id}`}
                    description={`Создана ${request.createdAt} · ${auth.user.name}. Статус, параметры и история заказа собраны на одной странице.`}
                    actions={
                        <>
                            <div className="min-w-48 rounded-xl border border-border/70 bg-background/80 px-4 py-3 shadow-xs">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Предварительная цена
                                </p>
                                <p className="mt-1 text-xl font-semibold">
                                    {request.estimatedPrice}
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={clientDashboard()} prefetch>
                                    <ArrowLeft
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Все заявки
                                </Link>
                            </Button>
                        </>
                    }
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statusDetails.map((item) => (
                        <DashboardMetric
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Прогресс заявки</CardTitle>
                                <CardDescription>
                                    Текущий этап выполнения заказа.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Общая готовность
                                        </span>
                                        <span className="font-medium">
                                            {requestProgress}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${requestProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    {requestSteps.map((step) => {
                                        const isDone = step.statuses.includes(
                                            request.status,
                                        );

                                        return (
                                            <div
                                                className="rounded-xl bg-muted/50 p-4"
                                                key={step.key}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-medium">
                                                        {step.title}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            isDone
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {isDone
                                                            ? 'Пройдено'
                                                            : 'Ожидает'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Параметры заявки</CardTitle>
                                <CardDescription>
                                    Проверьте услугу, адрес и дополнительные
                                    работы.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Город
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.city}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Район / адрес
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.district} район,{' '}
                                        {request.address}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Услуга
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.service}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Выбранная компания
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.company ?? 'Не назначена'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-4 md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Дополнительные работы
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.extras.join(', ') ||
                                            'Не указаны'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-4 md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Комментарий клиента
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.comment}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {canEditRequest(request.status) && (
                            <Card
                                id="edit-request"
                                className="border-border/70 shadow-sm"
                            >
                                <CardHeader>
                                    <CardTitle>Изменить заявку</CardTitle>
                                    <CardDescription>
                                        Параметры можно менять до передачи
                                        заявки в работу.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        className="grid gap-4 md:grid-cols-2"
                                        onSubmit={submitEdit}
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="request-city">
                                                Город
                                            </Label>
                                            <Input
                                                id="request-city"
                                                value={editForm.data.city}
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'city',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {editForm.errors.city && (
                                                <p className="text-sm text-destructive">
                                                    {editForm.errors.city}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="request-district">
                                                Район
                                            </Label>
                                            <Input
                                                id="request-district"
                                                value={editForm.data.district}
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'district',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {editForm.errors.district && (
                                                <p className="text-sm text-destructive">
                                                    {editForm.errors.district}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="request-date">
                                                Дата работ
                                            </Label>
                                            <Input
                                                id="request-date"
                                                type="date"
                                                value={
                                                    editForm.data
                                                        .installation_date
                                                }
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'installation_date',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {editForm.errors
                                                .installation_date && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        editForm.errors
                                                            .installation_date
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="request-width">
                                                Ширина, см
                                            </Label>
                                            <Input
                                                id="request-width"
                                                type="number"
                                                min={1}
                                                value={
                                                    editForm.data.window_width
                                                }
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'window_width',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            {editForm.errors.window_width && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        editForm.errors
                                                            .window_width
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="request-height">
                                                Высота, см
                                            </Label>
                                            <Input
                                                id="request-height"
                                                type="number"
                                                min={1}
                                                value={
                                                    editForm.data.window_height
                                                }
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'window_height',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            {editForm.errors.window_height && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        editForm.errors
                                                            .window_height
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="request-extras">
                                                Дополнительные работы
                                            </Label>
                                            <Input
                                                id="request-extras"
                                                value={
                                                    editForm.data
                                                        .additional_services
                                                }
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'additional_services',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Через запятую"
                                            />
                                            {editForm.errors
                                                .additional_services && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        editForm.errors
                                                            .additional_services
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="request-comment">
                                                Комментарий
                                            </Label>
                                            <textarea
                                                id="request-comment"
                                                className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                value={editForm.data.comment}
                                                onChange={(event) =>
                                                    editForm.setData(
                                                        'comment',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {editForm.errors.comment && (
                                                <p className="text-sm text-destructive">
                                                    {editForm.errors.comment}
                                                </p>
                                            )}
                                        </div>

                                        {(
                                            editForm.errors as Record<
                                                string,
                                                string
                                            >
                                        ).request && (
                                            <p className="text-sm text-destructive md:col-span-2">
                                                {
                                                    (
                                                        editForm.errors as Record<
                                                            string,
                                                            string
                                                        >
                                                    ).request
                                                }
                                            </p>
                                        )}

                                        <div className="flex justify-end md:col-span-2">
                                            <Button
                                                type="submit"
                                                disabled={editForm.processing}
                                            >
                                                <Pencil
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                Сохранить заявку
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {request.status === 'completed' && (
                            <ReviewFormCard
                                requestId={request.id}
                                service={request.service}
                                company={request.company}
                                existingReview={request.review}
                            />
                        )}

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>История статуса</CardTitle>
                                <CardDescription>
                                    Все изменения заказа в хронологическом
                                    порядке.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {request.history.map((item) => (
                                    <div
                                        className="rounded-xl border border-border/70 bg-muted/15 p-4"
                                        key={`${item.label}-${item.timestamp}`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-medium">
                                                {item.label}
                                            </p>
                                            <span className="text-sm text-muted-foreground">
                                                {item.timestamp}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {item.note}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Следующие шаги</CardTitle>
                                <CardDescription>
                                    Что клиент может сделать прямо сейчас.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {canEditRequest(request.status) && (
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() =>
                                            document
                                                .getElementById('edit-request')
                                                ?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'start',
                                                })
                                        }
                                    >
                                        <Pencil
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Изменить заявку
                                    </Button>
                                )}
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() =>
                                        repeatClientRequest(request.id)
                                    }
                                >
                                    <>
                                        <Ruler
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Дублировать заявку
                                    </>
                                </Button>
                                {canCancelRequest(request.status) && (
                                    <Button
                                        className="w-full justify-start"
                                        variant="ghost"
                                        onClick={() =>
                                            cancelClientRequest(request.id)
                                        }
                                    >
                                        <XCircle
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Отменить заявку
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Что происходит сейчас</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                                    <Clock3
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            Текущий этап
                                        </p>
                                        <p className="text-muted-foreground">
                                            {request.company
                                                ? 'Компания уже выбрана, дальше идёт подтверждение даты и деталей.'
                                                : 'Сервис ещё подбирает или ожидает выбор компании.'}
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
                                            Связь с исполнителем
                                        </p>
                                        <p className="text-muted-foreground">
                                            Контакт передаётся только выбранной
                                            компании, а не всем подряд.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                                    <CircleAlert
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            Важно помнить
                                        </p>
                                        <p className="text-muted-foreground">
                                            Цена остаётся предварительной до
                                            замера и финального согласования
                                            работ.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardPage>
        </>
    );
}

ClientRequestShow.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет клиента',
            href: clientDashboard(),
        },
        {
            title: 'Заявка',
            href: '#',
        },
    ],
};
