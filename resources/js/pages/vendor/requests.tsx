import { Head, router, useForm } from '@inertiajs/react';
import {
    BadgeDollarSign,
    CalendarDays,
    ClipboardList,
    MapPinned,
    MessageSquareText,
    Pencil,
    Ruler,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
    DashboardEmptyState,
    DashboardHero,
    DashboardMetric,
    DashboardPage,
} from '@/components/dashboard/dashboard-ui';
import { RequestCatalogItems } from '@/components/request-catalog-items';
import type { CatalogRequestItem } from '@/components/request-catalog-items';
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
import { RequestClientChatDialog } from '@/components/vendor/request-client-chat-dialog';
import type { RequestClientChatLead } from '@/components/vendor/request-client-chat-dialog';
import { getStatusLabel, getStatusVariant } from '@/lib/dashboard-format';
import type { RequestStatus } from '@/lib/dashboard-format';
import {
    dashboard as vendorDashboard,
    requests as vendorRequestsPage,
} from '@/routes/vendor';
import {
    accept as acceptRequest,
    complete as completeRequest,
    reject as rejectRequest,
    start as startRequest,
    update as updateRequest,
} from '@/routes/vendor/requests';
import {
    accept as acceptAmendment,
    reject as rejectAmendment,
} from '@/routes/vendor/requests/amendments';

type VendorLead = RequestClientChatLead & {
    items?: CatalogRequestItem[];
    dimensionUnit?: string;
    createdAt: string;
    extras: string[];
    districtValue?: string | null;
    installationDateValue?: string | null;
    commentValue?: string | null;
    pendingAmendment: {
        id: string;
        proposedByRole: 'client' | 'vendor' | 'admin';
        proposedByName: string;
        clientAccepted: boolean | null;
        vendorAccepted: boolean | null;
        changes: Array<{ label: string; value: string }>;
    } | null;
};

type VendorRequestEditForm = {
    city: string;
    district: string;
    installation_date: string;
    window_width: number;
    window_height: number;
    additional_services: string;
    comment: string;
};

type VendorRequestsPageProps = {
    requests: VendorLead[];
    selectedStatus: RequestStatus | null;
};

const filters: Array<{ key: 'all' | RequestStatus; label: string }> = [
    { key: 'all', label: 'Все' },
    { key: 'new', label: 'Новые' },
    { key: 'awaiting_confirmation', label: 'Ждут подтверждения' },
    { key: 'confirmed', label: 'Принятые' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'completed', label: 'Завершенные' },
    { key: 'rejected', label: 'Отклоненные' },
    { key: 'cancelled', label: 'Отмененные' },
];

const statusSummaries: Array<{
    status: RequestStatus;
    title: string;
    note: string;
}> = [
    {
        status: 'new',
        title: 'Новые лиды',
        note: 'Нужны быстрый ответ и первичная оценка.',
    },
    {
        status: 'confirmed',
        title: 'Подтвержденные',
        note: 'Клиент уже ждёт следующий шаг компании.',
    },
    {
        status: 'in_progress',
        title: 'В работе',
        note: 'Идёт исполнение или согласование деталей.',
    },
    {
        status: 'completed',
        title: 'Завершенные',
        note: 'Можно использовать как базу для кейсов и доверия.',
    },
    {
        status: 'rejected',
        title: 'Отклоненные',
        note: 'Заявки, которые компания не взяла в работу.',
    },
];

function getLeadPriority(status: RequestStatus) {
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

function canAcceptRequest(status: RequestStatus) {
    return status === 'new';
}

function canRejectRequest(status: RequestStatus) {
    return ['new', 'confirmed'].includes(status);
}

function canStartRequest(status: RequestStatus) {
    return status === 'confirmed';
}

function canCompleteRequest(status: RequestStatus) {
    return status === 'in_progress';
}

function canProposeAmendment(lead: VendorLead) {
    return (
        ['new', 'awaiting_confirmation', 'confirmed'].includes(lead.status) &&
        !lead.pendingAmendment
    );
}

function patchRequestStatus(
    requestId: string,
    action: 'accept' | 'reject' | 'start' | 'complete',
) {
    const actionUrl = {
        accept: acceptRequest.url(Number(requestId)),
        reject: rejectRequest.url(Number(requestId)),
        start: startRequest.url(Number(requestId)),
        complete: completeRequest.url(Number(requestId)),
    }[action];

    router.patch(
        actionUrl,
        {},
        {
            preserveScroll: true,
        },
    );
}

function decideVendorAmendment(
    requestId: string,
    amendmentId: string,
    decision: 'accept' | 'reject',
) {
    const action = {
        accept: acceptAmendment,
        reject: rejectAmendment,
    }[decision];

    router.patch(
        action.url([Number(requestId), Number(amendmentId)]),
        {},
        {
            preserveScroll: true,
        },
    );
}

export default function VendorRequestsPage({
    requests,
    selectedStatus,
}: VendorRequestsPageProps) {
    const activeFilter = selectedStatus ?? 'all';

    const sortedLeads = useMemo(
        () =>
            [...requests].sort(
                (firstLead, secondLead) =>
                    getLeadPriority(secondLead.status) -
                    getLeadPriority(firstLead.status),
            ),
        [requests],
    );

    const [selectedLeadId, setSelectedLeadId] = useState<string>(
        sortedLeads[0]?.id ?? requests[0]?.id ?? '',
    );
    const [chatLeadId, setChatLeadId] = useState<string | null>(null);

    const selectedLead =
        sortedLeads.find((lead) => lead.id === selectedLeadId) ??
        sortedLeads[0] ??
        null;
    const chatLead = chatLeadId
        ? (requests.find((lead) => lead.id === chatLeadId) ?? null)
        : null;
    const editForm = useForm<VendorRequestEditForm>({
        city: '',
        district: '',
        installation_date: '',
        window_width: 1,
        window_height: 1,
        additional_services: '',
        comment: '',
    });
    const editFormRef = useRef(editForm);

    editFormRef.current = editForm;

    useEffect(() => {
        if (!selectedLead) {
            return;
        }

        editFormRef.current.setData({
            city: selectedLead.city,
            district: selectedLead.districtValue ?? '',
            installation_date: selectedLead.installationDateValue ?? '',
            window_width: selectedLead.width,
            window_height: selectedLead.height,
            additional_services: selectedLead.extras.join(', '),
            comment: selectedLead.commentValue ?? '',
        });
        editFormRef.current.clearErrors();
    }, [selectedLead?.id]);

    const leadStats = [
        {
            label: 'Всего в списке',
            value: sortedLeads.length,
            icon: ClipboardList,
        },
        {
            label: 'Новые',
            value: requests.filter((lead) => lead.status === 'new').length,
            icon: ShieldCheck,
        },
        {
            label: 'В работе',
            value: requests.filter((lead) =>
                ['confirmed', 'in_progress'].includes(lead.status),
            ).length,
            icon: CalendarDays,
        },
    ];

    const openChatForLead = (leadId: string) => {
        setSelectedLeadId(leadId);
        setChatLeadId(leadId);
    };

    const submitAmendment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedLead || !canProposeAmendment(selectedLead)) {
            return;
        }

        editForm.patch(updateRequest.url(Number(selectedLead.id)), {
            preserveScroll: true,
        });
    };

    const selectFilter = (status: 'all' | RequestStatus) => {
        router.get(
            vendorRequestsPage.url({
                query: status === 'all' ? {} : { status },
            }),
            {},
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Заявки компании" />

            <DashboardPage>
                <DashboardHero
                    icon={ClipboardList}
                    badge={
                        <>
                            <Badge variant="outline">
                                {sortedLeads.length} заявок в текущем фильтре
                            </Badge>
                            <Badge variant="secondary">
                                {
                                    requests.filter(
                                        (lead) => lead.status === 'new',
                                    ).length
                                }{' '}
                                требуют ответа
                            </Badge>
                        </>
                    }
                    title="Заявки компании"
                    description="Фильтруйте очередь, открывайте детали заказа и меняйте статус без перехода на отдельный экран."
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {leadStats.map((item) => (
                        <DashboardMetric
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Фильтры и очередь</CardTitle>
                                <CardDescription>
                                    Можно быстро переключать статусы и выбирать
                                    нужную заявку без отдельного экрана.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {filters.map((filter) => (
                                        <Button
                                            key={filter.key}
                                            variant={
                                                activeFilter === filter.key
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            type="button"
                                            onClick={() =>
                                                selectFilter(filter.key)
                                            }
                                        >
                                            {filter.label}
                                        </Button>
                                    ))}
                                </div>

                                <div className="grid gap-4">
                                    {sortedLeads.map((lead) => {
                                        const isSelected =
                                            lead.id === selectedLeadId;

                                        return (
                                            <div
                                                className={`rounded-2xl border bg-card p-4 text-left shadow-xs transition-[border-color,box-shadow] sm:p-5 ${
                                                    isSelected
                                                        ? 'border-primary/50 ring-2 ring-primary/10'
                                                        : 'border-border/70 hover:border-primary/30 hover:shadow-sm'
                                                }`}
                                                key={lead.id}
                                            >
                                                <button
                                                    className="w-full text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedLeadId(
                                                            lead.id,
                                                        )
                                                    }
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
                                                                    {
                                                                        lead.service
                                                                    }
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {lead.city},{' '}
                                                                    {
                                                                        lead.district
                                                                    }{' '}
                                                                    район
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm lg:text-right">
                                                            <p className="font-semibold">
                                                                {
                                                                    lead.estimatedPrice
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-muted-foreground">
                                                                {lead.createdAt}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <p className="text-muted-foreground">
                                                            Дата работ
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {
                                                                lead.installationDate
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <p className="text-muted-foreground">
                                                            Размер
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {lead.width
                                                                ? `${lead.width} × ${lead.height} ${lead.dimensionUnit ?? 'см'}`
                                                                : 'Не требуются'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <p className="text-muted-foreground">
                                                            Доп. работы
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {lead.extras.length}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        className="h-full min-h-[4.25rem] rounded-lg bg-muted/40 px-3 text-left whitespace-normal"
                                                        size="sm"
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openChatForLead(
                                                                lead.id,
                                                            )
                                                        }
                                                    >
                                                        <span className="flex min-w-0 flex-col items-start gap-1">
                                                            <span className="flex items-center gap-2 font-medium">
                                                                <MessageSquareText
                                                                    className="size-4"
                                                                    aria-hidden="true"
                                                                />
                                                                Показать чат
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                с клиентом
                                                            </span>
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {sortedLeads.length === 0 && (
                                        <DashboardEmptyState
                                            className="min-h-52"
                                            icon={ClipboardList}
                                            title="Заявок с таким статусом нет"
                                            description="Выберите другой фильтр или вернитесь к общему списку."
                                            action={
                                                activeFilter !== 'all' ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            selectFilter('all')
                                                        }
                                                    >
                                                        Показать все
                                                    </Button>
                                                ) : undefined
                                            }
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Сводка по статусам</CardTitle>
                                <CardDescription>
                                    Распределение заказов по этапам работы.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {statusSummaries.map((item) => {
                                    const count = requests.filter(
                                        (lead) => lead.status === item.status,
                                    ).length;

                                    return (
                                        <div
                                            className="rounded-2xl border border-border/70 bg-muted/15 p-4"
                                            key={item.status}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <Badge
                                                    variant={getStatusVariant(
                                                        item.status,
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        item.status,
                                                    )}
                                                </Badge>
                                                <span className="text-sm font-semibold">
                                                    {count}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm font-medium">
                                                {item.title}
                                            </p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {item.note}
                                            </p>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm xl:sticky xl:top-5">
                            <CardHeader>
                                <CardTitle>Фокус по заявке</CardTitle>
                                <CardDescription>
                                    Параметры заказа и доступные действия.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedLead ? (
                                    <>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {selectedLead.id}
                                            </span>
                                            <Badge
                                                variant={getStatusVariant(
                                                    selectedLead.status,
                                                )}
                                            >
                                                {getStatusLabel(
                                                    selectedLead.status,
                                                )}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {selectedLead.service}
                                            </h3>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {selectedLead.comment}
                                            </p>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                                <MapPinned
                                                    className="mt-0.5 size-4 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Адрес зоны работ
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {selectedLead.city},{' '}
                                                        {selectedLead.district}{' '}
                                                        район
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
                                                        Дата работ
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {
                                                            selectedLead.installationDate
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <RequestCatalogItems
                                                items={selectedLead.items}
                                            />
                                            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                                <Ruler
                                                    className="mt-0.5 size-4 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Размер
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {selectedLead.width
                                                            ? `${selectedLead.width} × ${selectedLead.height} ${selectedLead.dimensionUnit ?? 'см'}`
                                                            : 'Не требуются'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                                <BadgeDollarSign
                                                    className="mt-0.5 size-4 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Предварительная цена
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {
                                                            selectedLead.estimatedPrice
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                                <MessageSquareText
                                                    className="mt-0.5 size-4 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Доп. работы
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {selectedLead.extras
                                                            .length > 0
                                                            ? selectedLead.extras.join(
                                                                  ', ',
                                                              )
                                                            : 'Не указаны'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                                                <ClipboardList
                                                    className="mt-0.5 size-4 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Клиент
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {
                                                            selectedLead.clientName
                                                        }
                                                    </p>
                                                    {(selectedLead.clientPhone ||
                                                        selectedLead.clientEmail) && (
                                                        <p className="mt-1 text-muted-foreground">
                                                            {[
                                                                selectedLead.clientPhone,
                                                                selectedLead.clientEmail,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedLead.pendingAmendment && (
                                            <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                                                <div>
                                                    <p className="font-medium">
                                                        Правки ожидают
                                                        подтверждения
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {selectedLead
                                                            .pendingAmendment
                                                            .proposedByRole ===
                                                        'vendor'
                                                            ? 'Правки отправлены клиенту. Параметры заявки обновятся после его подтверждения.'
                                                            : `${selectedLead.pendingAmendment.proposedByName} предложил(а) изменить заявку.`}
                                                    </p>
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {selectedLead.pendingAmendment.changes.map(
                                                        (change) => (
                                                            <div
                                                                className="rounded-xl bg-background/80 p-3"
                                                                key={
                                                                    change.label
                                                                }
                                                            >
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        change.label
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-sm font-medium">
                                                                    {
                                                                        change.value
                                                                    }
                                                                </p>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                {selectedLead.pendingAmendment
                                                    .proposedByRole !==
                                                    'vendor' &&
                                                    !selectedLead
                                                        .pendingAmendment
                                                        .vendorAccepted && (
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    decideVendorAmendment(
                                                                        selectedLead.id,
                                                                        selectedLead
                                                                            .pendingAmendment!
                                                                            .id,
                                                                        'accept',
                                                                    )
                                                                }
                                                            >
                                                                Подтвердить
                                                                правки
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    decideVendorAmendment(
                                                                        selectedLead.id,
                                                                        selectedLead
                                                                            .pendingAmendment!
                                                                            .id,
                                                                        'reject',
                                                                    )
                                                                }
                                                            >
                                                                Отклонить
                                                            </Button>
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        {canProposeAmendment(selectedLead) && (
                                            <form
                                                className="grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2"
                                                onSubmit={submitAmendment}
                                            >
                                                <div className="sm:col-span-2">
                                                    <p className="font-medium">
                                                        Предложить правки
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Клиент должен
                                                        подтвердить изменения до
                                                        их применения.
                                                    </p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="vendor-request-city">
                                                        Город
                                                    </Label>
                                                    <Input
                                                        id="vendor-request-city"
                                                        value={
                                                            editForm.data.city
                                                        }
                                                        onChange={(event) =>
                                                            editForm.setData(
                                                                'city',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="vendor-request-district">
                                                        Район
                                                    </Label>
                                                    <Input
                                                        id="vendor-request-district"
                                                        value={
                                                            editForm.data
                                                                .district
                                                        }
                                                        onChange={(event) =>
                                                            editForm.setData(
                                                                'district',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="vendor-request-date">
                                                        Дата работ
                                                    </Label>
                                                    <Input
                                                        id="vendor-request-date"
                                                        type="date"
                                                        value={
                                                            editForm.data
                                                                .installation_date
                                                        }
                                                        onChange={(event) =>
                                                            editForm.setData(
                                                                'installation_date',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="vendor-request-extras">
                                                        Доп. работы
                                                    </Label>
                                                    <Input
                                                        id="vendor-request-extras"
                                                        placeholder="Через запятую"
                                                        value={
                                                            editForm.data
                                                                .additional_services
                                                        }
                                                        onChange={(event) =>
                                                            editForm.setData(
                                                                'additional_services',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                {!selectedLead.items
                                                    ?.length && (
                                                    <>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="vendor-request-width">
                                                                Ширина, см
                                                            </Label>
                                                            <Input
                                                                id="vendor-request-width"
                                                                min={1}
                                                                type="number"
                                                                value={
                                                                    editForm
                                                                        .data
                                                                        .window_width
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    editForm.setData(
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
                                                            <Label htmlFor="vendor-request-height">
                                                                Высота, см
                                                            </Label>
                                                            <Input
                                                                id="vendor-request-height"
                                                                min={1}
                                                                type="number"
                                                                value={
                                                                    editForm
                                                                        .data
                                                                        .window_height
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    editForm.setData(
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
                                                    <Label htmlFor="vendor-request-comment">
                                                        Комментарий
                                                    </Label>
                                                    <textarea
                                                        className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                        id="vendor-request-comment"
                                                        value={
                                                            editForm.data
                                                                .comment
                                                        }
                                                        onChange={(event) =>
                                                            editForm.setData(
                                                                'comment',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                {(
                                                    editForm.errors as Record<
                                                        string,
                                                        string
                                                    >
                                                ).request && (
                                                    <p className="text-sm text-destructive sm:col-span-2">
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
                                                <div className="sm:col-span-2">
                                                    <Button
                                                        disabled={
                                                            editForm.processing
                                                        }
                                                        type="submit"
                                                    >
                                                        <Pencil
                                                            aria-hidden="true"
                                                            className="size-4"
                                                        />
                                                        Отправить правки
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        {(canAcceptRequest(
                                            selectedLead.status,
                                        ) ||
                                            canRejectRequest(
                                                selectedLead.status,
                                            ) ||
                                            canStartRequest(
                                                selectedLead.status,
                                            ) ||
                                            canCompleteRequest(
                                                selectedLead.status,
                                            )) && (
                                            <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
                                                {canAcceptRequest(
                                                    selectedLead.status,
                                                ) && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() =>
                                                            patchRequestStatus(
                                                                selectedLead.id,
                                                                'accept',
                                                            )
                                                        }
                                                    >
                                                        Принять
                                                    </Button>
                                                )}
                                                {canRejectRequest(
                                                    selectedLead.status,
                                                ) && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            patchRequestStatus(
                                                                selectedLead.id,
                                                                'reject',
                                                            )
                                                        }
                                                    >
                                                        Отклонить
                                                    </Button>
                                                )}
                                                {selectedLead.status ===
                                                    'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={
                                                            !canStartRequest(
                                                                selectedLead.status,
                                                            )
                                                        }
                                                        onClick={() =>
                                                            patchRequestStatus(
                                                                selectedLead.id,
                                                                'start',
                                                            )
                                                        }
                                                    >
                                                        Взять в работу
                                                    </Button>
                                                )}
                                                {selectedLead.status ===
                                                    'in_progress' && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={
                                                            !canCompleteRequest(
                                                                selectedLead.status,
                                                            )
                                                        }
                                                        onClick={() =>
                                                            patchRequestStatus(
                                                                selectedLead.id,
                                                                'complete',
                                                            )
                                                        }
                                                    >
                                                        Завершить
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-sidebar-border/70 p-6 text-sm text-muted-foreground dark:border-sidebar-border">
                                        Выберите заявку слева, чтобы увидеть
                                        детали.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardPage>

            <RequestClientChatDialog
                lead={chatLead}
                open={chatLead !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setChatLeadId(null);
                    }
                }}
            />
        </>
    );
}

VendorRequestsPage.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет компании',
            href: vendorDashboard(),
        },
        {
            title: 'Заявки',
            href: vendorRequestsPage(),
        },
    ],
};
