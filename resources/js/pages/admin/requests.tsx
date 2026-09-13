import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    ClipboardList,
    MapPinned,
    Pencil,
    Search,
    UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStatusLabel, getStatusVariant } from '@/lib/dashboard-format';
import type { RequestStatus } from '@/lib/dashboard-format';
import { requests as adminRequests } from '@/routes/admin';
import { update as updateRequest } from '@/routes/admin/requests';

type AdminRequest = {
    id: string;
    createdAt: string;
    status: RequestStatus;
    service: string;
    clientName: string;
    clientPhone: string | null;
    clientEmail: string | null;
    vendorName: string | null;
    vendorContactName: string | null;
    city: string;
    district: string | null;
    installationDate: string;
    installationDateValue: string | null;
    width: number;
    height: number;
    itemsCount: number;
    extras: string[];
    comment: string | null;
    estimatedPrice: string;
    pendingAmendment: {
        proposedByRole: 'client' | 'vendor' | 'admin';
        proposedByName: string;
        clientAccepted: boolean | null;
        vendorAccepted: boolean | null;
    } | null;
};

type PageProps = {
    requests: AdminRequest[];
    selectedStatus: RequestStatus | null;
};

type CorrectionForm = {
    city: string;
    district: string;
    installation_date: string;
    window_width: number;
    window_height: number;
    additional_services: string;
    comment: string;
    admin_note: string;
};

const filters: Array<{ key: 'all' | RequestStatus; label: string }> = [
    { key: 'all', label: 'Все' },
    { key: 'new', label: 'Новые' },
    { key: 'confirmed', label: 'Подтвержденные' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'completed', label: 'Завершенные' },
    { key: 'rejected', label: 'Отклоненные' },
    { key: 'cancelled', label: 'Отмененные' },
];

function amendmentProgress(amendment: AdminRequest['pendingAmendment']) {
    if (!amendment) {
        return null;
    }

    const client =
        amendment.clientAccepted === true ? 'подтвердил' : 'ожидается';
    const vendor =
        amendment.vendorAccepted === true ? 'подтвердил' : 'ожидается';

    return `Клиент: ${client} · Компания: ${vendor}`;
}

function canCorrectRequest(request: AdminRequest) {
    return (
        Boolean(request.vendorName) &&
        !request.pendingAmendment &&
        ['new', 'awaiting_confirmation', 'confirmed'].includes(request.status)
    );
}

export default function AdminRequests({ requests, selectedStatus }: PageProps) {
    const [search, setSearch] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState(
        requests[0]?.id ?? '',
    );
    const activeFilter = selectedStatus ?? 'all';
    const visibleRequests = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

        if (!normalizedSearch) {
            return requests;
        }

        return requests.filter((request) =>
            [
                request.id,
                request.service,
                request.clientName,
                request.vendorName,
                request.city,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLocaleLowerCase('ru-RU')
                        .includes(normalizedSearch),
                ),
        );
    }, [requests, search]);
    const selectedRequest =
        visibleRequests.find((request) => request.id === selectedRequestId) ??
        visibleRequests[0] ??
        null;
    const correctionForm = useForm<CorrectionForm>({
        city: '',
        district: '',
        installation_date: '',
        window_width: 0,
        window_height: 0,
        additional_services: '',
        comment: '',
        admin_note: '',
    });
    const correctionFormRef = useRef(correctionForm);

    correctionFormRef.current = correctionForm;

    useEffect(() => {
        if (!selectedRequest) {
            return;
        }

        correctionFormRef.current.setData({
            city: selectedRequest.city,
            district: selectedRequest.district ?? '',
            installation_date: selectedRequest.installationDateValue ?? '',
            window_width: selectedRequest.width,
            window_height: selectedRequest.height,
            additional_services: selectedRequest.extras.join(', '),
            comment: selectedRequest.comment ?? '',
            admin_note: '',
        });
        correctionFormRef.current.clearErrors();
    }, [selectedRequest?.id]);

    const selectFilter = (status: 'all' | RequestStatus) => {
        router.get(
            adminRequests.url({
                query: status === 'all' ? {} : { status },
            }),
            {},
            { preserveScroll: true, replace: true },
        );
    };

    const submitCorrection = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedRequest || !canCorrectRequest(selectedRequest)) {
            return;
        }

        correctionForm.patch(updateRequest.url(Number(selectedRequest.id)), {
            preserveScroll: true,
        });
    };

    const stats = [
        { label: 'Всего заявок', value: requests.length, icon: ClipboardList },
        {
            label: 'Требуют ответа',
            value: requests.filter((request) => request.status === 'new')
                .length,
            icon: CalendarDays,
        },
        {
            label: 'В работе',
            value: requests.filter((request) =>
                ['confirmed', 'in_progress'].includes(request.status),
            ).length,
            icon: Building2,
        },
    ];

    return (
        <>
            <Head title="Все заявки" />

            <DashboardPage>
                <DashboardHero
                    badge={
                        <Badge variant="outline">Доступ ко всем заказам</Badge>
                    }
                    description="Проверяйте заявки всех компаний и предлагайте корректировки. Изменения применяются после подтверждения клиента и компании."
                    icon={ClipboardList}
                    title="Все заявки"
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {stats.map((item) => (
                        <DashboardMetric key={item.label} {...item} />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
                    <Card className="border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Очередь заявок</CardTitle>
                            <CardDescription>
                                Поиск работает по номеру, услуге, клиенту,
                                компании и городу.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative min-w-0 flex-1">
                                    <Search
                                        aria-hidden="true"
                                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                    />
                                    <Input
                                        className="pl-9"
                                        placeholder="Найти заявку"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.map((filter) => (
                                        <Button
                                            key={filter.key}
                                            size="sm"
                                            type="button"
                                            variant={
                                                activeFilter === filter.key
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                selectFilter(filter.key)
                                            }
                                        >
                                            {filter.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {visibleRequests.map((request) => (
                                    <button
                                        className={`rounded-2xl border p-4 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                            selectedRequest?.id === request.id
                                                ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/10'
                                                : 'border-border/70 bg-card hover:border-primary/30'
                                        }`}
                                        key={request.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedRequestId(request.id)
                                        }
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold">
                                                    №{request.id}
                                                </span>
                                                <Badge
                                                    variant={getStatusVariant(
                                                        request.status,
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        request.status,
                                                    )}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {request.createdAt}
                                            </span>
                                        </div>
                                        <p className="mt-3 font-medium">
                                            {request.service}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {request.clientName} ·{' '}
                                            {request.vendorName ??
                                                'Компания не выбрана'}
                                        </p>
                                    </button>
                                ))}

                                {visibleRequests.length === 0 && (
                                    <DashboardEmptyState
                                        className="min-h-52"
                                        description="Измените запрос или выберите другой статус."
                                        icon={Search}
                                        title="Заявки не найдены"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-sm xl:sticky xl:top-5 xl:self-start">
                        <CardHeader>
                            <CardTitle>Проверка заявки</CardTitle>
                            <CardDescription>
                                Детали заказа и корректировка параметров.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedRequest ? (
                                <div className="space-y-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold">
                                            №{selectedRequest.id}
                                        </span>
                                        <Badge
                                            variant={getStatusVariant(
                                                selectedRequest.status,
                                            )}
                                        >
                                            {getStatusLabel(
                                                selectedRequest.status,
                                            )}
                                        </Badge>
                                        <Badge variant="outline">
                                            {selectedRequest.estimatedPrice}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-3 text-sm">
                                        <div className="rounded-xl bg-muted/50 p-3">
                                            <p className="flex items-center gap-2 font-medium">
                                                <UserRound className="size-4" />
                                                Клиент
                                            </p>
                                            <p className="mt-1 text-muted-foreground">
                                                {selectedRequest.clientName}
                                                {selectedRequest.clientPhone &&
                                                    ` · ${selectedRequest.clientPhone}`}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-muted/50 p-3">
                                            <p className="flex items-center gap-2 font-medium">
                                                <Building2 className="size-4" />
                                                Компания
                                            </p>
                                            <p className="mt-1 text-muted-foreground">
                                                {selectedRequest.vendorName ??
                                                    'Не выбрана'}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-muted/50 p-3">
                                            <p className="flex items-center gap-2 font-medium">
                                                <MapPinned className="size-4" />
                                                Адрес и дата
                                            </p>
                                            <p className="mt-1 text-muted-foreground">
                                                {selectedRequest.city}
                                                {selectedRequest.district
                                                    ? `, ${selectedRequest.district}`
                                                    : ''}{' '}
                                                ·{' '}
                                                {
                                                    selectedRequest.installationDate
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {selectedRequest.pendingAmendment && (
                                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                                            <p className="font-medium">
                                                Уже есть правки от{' '}
                                                {
                                                    selectedRequest
                                                        .pendingAmendment
                                                        .proposedByName
                                                }
                                            </p>
                                            <p className="mt-1 text-muted-foreground">
                                                {amendmentProgress(
                                                    selectedRequest.pendingAmendment,
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {!selectedRequest.vendorName ? (
                                        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                            Для корректировки сначала должна
                                            быть выбрана компания: правки
                                            подтверждают и клиент, и вендор.
                                        </div>
                                    ) : !canCorrectRequest(selectedRequest) ? (
                                        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                            Правки доступны до начала работ и
                                            только когда нет другого предложения
                                            на подтверждении.
                                        </div>
                                    ) : (
                                        <form
                                            className="grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-2"
                                            onSubmit={submitCorrection}
                                        >
                                            <div className="sm:col-span-2">
                                                <p className="font-medium">
                                                    Предложить корректировку
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Заявка не изменится до
                                                    подтверждения обеих сторон.
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="admin-city">
                                                    Город
                                                </Label>
                                                <Input
                                                    id="admin-city"
                                                    value={
                                                        correctionForm.data.city
                                                    }
                                                    onChange={(event) =>
                                                        correctionForm.setData(
                                                            'city',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="admin-district">
                                                    Район
                                                </Label>
                                                <Input
                                                    id="admin-district"
                                                    value={
                                                        correctionForm.data
                                                            .district
                                                    }
                                                    onChange={(event) =>
                                                        correctionForm.setData(
                                                            'district',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="admin-date">
                                                    Дата работ
                                                </Label>
                                                <Input
                                                    id="admin-date"
                                                    type="date"
                                                    value={
                                                        correctionForm.data
                                                            .installation_date
                                                    }
                                                    onChange={(event) =>
                                                        correctionForm.setData(
                                                            'installation_date',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="admin-extras">
                                                    Доп. работы
                                                </Label>
                                                <Input
                                                    id="admin-extras"
                                                    placeholder="Через запятую"
                                                    value={
                                                        correctionForm.data
                                                            .additional_services
                                                    }
                                                    onChange={(event) =>
                                                        correctionForm.setData(
                                                            'additional_services',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            {selectedRequest.itemsCount ===
                                                0 && (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="admin-width">
                                                            Ширина, см
                                                        </Label>
                                                        <Input
                                                            id="admin-width"
                                                            min={1}
                                                            type="number"
                                                            value={
                                                                correctionForm
                                                                    .data
                                                                    .window_width
                                                            }
                                                            onChange={(event) =>
                                                                correctionForm.setData(
                                                                    'window_width',
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="admin-height">
                                                            Высота, см
                                                        </Label>
                                                        <Input
                                                            id="admin-height"
                                                            min={1}
                                                            type="number"
                                                            value={
                                                                correctionForm
                                                                    .data
                                                                    .window_height
                                                            }
                                                            onChange={(event) =>
                                                                correctionForm.setData(
                                                                    'window_height',
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div className="grid gap-2 sm:col-span-2">
                                                <Label htmlFor="admin-comment">
                                                    Комментарий к заявке
                                                </Label>
                                                <textarea
                                                    className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    id="admin-comment"
                                                    value={
                                                        correctionForm.data
                                                            .comment
                                                    }
                                                    onChange={(event) =>
                                                        correctionForm.setData(
                                                            'comment',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2 sm:col-span-2">
                                                <Label htmlFor="admin-note">
                                                    Причина корректировки
                                                </Label>
                                                <textarea
                                                    className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    id="admin-note"
                                                    placeholder="Необязательно, будет видно в истории заявки"
                                                    value={
                                                        correctionForm.data
                                                            .admin_note
                                                    }
                                                    onChange={(event) =>
                                                        correctionForm.setData(
                                                            'admin_note',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            {(
                                                correctionForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            ).request && (
                                                <p className="text-sm text-destructive sm:col-span-2">
                                                    {
                                                        (
                                                            correctionForm.errors as Record<
                                                                string,
                                                                string
                                                            >
                                                        ).request
                                                    }
                                                </p>
                                            )}
                                            <div className="sm:col-span-2">
                                                <Button
                                                    disabled={
                                                        correctionForm.processing
                                                    }
                                                    type="submit"
                                                >
                                                    <Pencil className="size-4" />
                                                    Отправить на подтверждение
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ) : (
                                <DashboardEmptyState
                                    description="Выберите заявку из списка."
                                    icon={ClipboardList}
                                    title="Заявка не выбрана"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DashboardPage>
        </>
    );
}

AdminRequests.layout = {
    breadcrumbs: [
        {
            title: 'Все заявки',
            href: '/admin/requests',
        },
    ],
};
