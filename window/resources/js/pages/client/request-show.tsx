import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    CircleAlert,
    Clock3,
    MessageSquareText,
    Pencil,
    Ruler,
    ShieldCheck,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    getStatusLabel,
    getStatusVariant,
    type ClientRequest,
} from '@/lib/dashboard-format';
import type { Auth } from '@/types';
import type { FormEvent } from 'react';

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
        `/client/requests/${requestId}/cancel`,
        {},
        {
            preserveScroll: true,
        },
    );
}

function repeatClientRequest(requestId: string) {
    router.post(
        `/client/requests/${requestId}/repeat`,
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
    const {
        auth,
        requestId,
        request,
    } = usePage<PageProps>().props;
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

        editForm.patch(`/client/requests/${request.id}`, {
            preserveScroll: true,
        });
    }

    if (!request) {
        return (
            <>
                <Head title="Заявка не найдена" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Заявка не найдена</CardTitle>
                            <CardDescription>
                                Заявка с номером {requestId} не найдена или
                                недоступна текущему пользователю.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/client/dashboard">
                                    <ArrowLeft
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Назад в кабинет
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
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
            value: request.company ?? 'Компания пока не выбрана',
            icon: BadgeCheck,
        },
    ];

    return (
        <>
            <Head title={`Заявка ${request.id}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                    <CardHeader className="gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/client/dashboard">
                                        <ArrowLeft
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        К списку заявок
                                    </Link>
                                </Button>
                                <Badge
                                    variant={getStatusVariant(request.status)}
                                >
                                    {getStatusLabel(request.status)}
                                </Badge>
                                <Badge variant="outline">
                                    Готовность {requestProgress}%
                                </Badge>
                            </div>

                            <div>
                                <CardTitle className="text-2xl">
                                    Заявка {request.id} уже читается как живая
                                    карточка заказа, а не как просто набор полей
                                </CardTitle>
                                <CardDescription className="mt-2 max-w-3xl">
                                    Здесь видны статус, история, исполнитель и
                                    следующие шаги клиента по выбранной заявке.
                                </CardDescription>
                            </div>
                        </div>

                        <div className="text-left xl:text-right">
                            <p className="text-sm text-muted-foreground">
                                Предварительная цена
                            </p>
                            <p className="mt-2 text-2xl font-semibold">
                                {request.estimatedPrice}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Создана {request.createdAt} • клиент{' '}
                                {auth.user.name}
                            </p>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statusDetails.map((item) => (
                        <Card
                            className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border"
                            key={item.label}
                        >
                            <CardContent className="flex min-h-28 items-start justify-between gap-4 p-5">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {item.value}
                                    </p>
                                </div>
                                <item.icon
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Прогресс заявки</CardTitle>
                                <CardDescription>
                                    Понятная шкала для клиента: где он сейчас
                                    находится по сценарию.
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

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Параметры заявки</CardTitle>
                                <CardDescription>
                                    Основные данные заказа в одном блоке без
                                    лишнего блуждания по кабинету.
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
                                        {request.company ??
                                            'Компания пока не выбрана'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-4 md:col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Дополнительные работы
                                    </p>
                                    <p className="mt-2 font-medium">
                                        {request.extras.join(', ')}
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
                                className="border-sidebar-border/70 shadow-none dark:border-sidebar-border"
                            >
                                <CardHeader>
                                    <CardTitle>Изменить заявку</CardTitle>
                                    <CardDescription>
                                        Редактирование доступно, пока заявка еще
                                        не ушла в работу.
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

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>История статуса</CardTitle>
                                <CardDescription>
                                    Лента показывает ключевые события по заявке.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {request.history.map((item) => (
                                    <div
                                        className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
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
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Следующие шаги</CardTitle>
                                <CardDescription>
                                    Что клиент может сделать прямо сейчас.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    disabled={
                                        !canEditRequest(request.status)
                                    }
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
                                        Повторить расчет
                                    </>
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="ghost"
                                    disabled={!canCancelRequest(request.status)}
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
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
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
            </div>
        </>
    );
}

ClientRequestShow.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет клиента',
            href: '/client/dashboard',
        },
        {
            title: 'Заявка',
            href: '#',
        },
    ],
};
