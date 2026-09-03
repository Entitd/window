import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Clock3,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type VendorStatus = 'pending' | 'approved' | 'rejected';

type ModerationVendor = {
    id: number;
    companyName: string;
    description: string | null;
    city: string;
    phone: string;
    email: string;
    status: VendorStatus;
    moderationNote: string | null;
    submittedAt: string | null;
    moderatedAt: string | null;
    moderator: string | null;
    contactName: string | null;
    districts: string[];
    servicesCount: number;
    activeServicesCount: number;
    activeServices: Array<{
        name: string;
        price: number;
    }>;
};

type PageProps = {
    vendors: ModerationVendor[];
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
};

function getModerationLabel(status: VendorStatus) {
    switch (status) {
        case 'approved':
            return 'Подтверждена';
        case 'rejected':
            return 'Отклонена';
        case 'pending':
            return 'На проверке';
    }
}

function getModerationVariant(
    status: VendorStatus,
): 'default' | 'outline' | 'destructive' {
    switch (status) {
        case 'approved':
            return 'default';
        case 'rejected':
            return 'destructive';
        case 'pending':
            return 'outline';
    }
}

function VendorModerationCard({ vendor }: { vendor: ModerationVendor }) {
    const { data, setData, patch, processing, errors } = useForm({
        moderation_note: vendor.moderationNote ?? '',
    });
    const isVisibleInSearch =
        vendor.status === 'approved' && vendor.activeServicesCount > 0;

    function approve(event: FormEvent) {
        event.preventDefault();
        patch(`/admin/vendors/${vendor.id}/approve`, {
            preserveScroll: true,
        });
    }

    function reject(event: FormEvent) {
        event.preventDefault();
        patch(`/admin/vendors/${vendor.id}/reject`, {
            preserveScroll: true,
        });
    }

    return (
        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
            <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getModerationVariant(vendor.status)}>
                            {getModerationLabel(vendor.status)}
                        </Badge>
                        <Badge variant="outline">{vendor.city}</Badge>
                        <span className="text-sm text-muted-foreground">
                            Подана {vendor.submittedAt ?? 'дата не указана'}
                        </span>
                    </div>
                    <div>
                        <CardTitle className="text-xl">
                            {vendor.companyName}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Контакт: {vendor.contactName ?? 'не указан'} ·{' '}
                            {vendor.phone} · {vendor.email}
                        </CardDescription>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground lg:text-right">
                    {vendor.moderatedAt ? (
                        <>
                            <p>Проверена {vendor.moderatedAt}</p>
                            <p>{vendor.moderator ?? 'Администратор'}</p>
                        </>
                    ) : (
                        <p>Ждёт решения администратора</p>
                    )}
                </div>
            </CardHeader>

            <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                    <div className="rounded-2xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                            Описание
                        </p>
                        <p className="mt-2 text-sm leading-6">
                            {vendor.description ||
                                'Компания пока не добавила описание.'}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                            Районы работы
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {vendor.districts.length > 0 ? (
                                vendor.districts.map((district) => (
                                    <Badge key={district} variant="secondary">
                                        {district}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    Районы не указаны
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Публикация в поиске
                                </p>
                                <p className="mt-2 text-sm leading-6">
                                    {isVisibleInSearch
                                        ? 'Компания подтверждена и имеет активные услуги, поэтому может появляться в выдаче.'
                                        : vendor.status === 'approved'
                                          ? 'Компания подтверждена, но без активных услуг не появится в поиске.'
                                          : 'Компания появится в поиске только после подтверждения и добавления активной услуги.'}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    isVisibleInSearch ? 'default' : 'outline'
                                }
                            >
                                {isVisibleInSearch
                                    ? 'Видна клиентам'
                                    : 'Не в поиске'}
                            </Badge>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <div className="rounded-lg border border-sidebar-border/70 bg-background p-3 dark:border-sidebar-border">
                                <p className="text-muted-foreground">
                                    Всего услуг
                                </p>
                                <p className="mt-1 font-semibold">
                                    {vendor.servicesCount}
                                </p>
                            </div>
                            <div className="rounded-lg border border-sidebar-border/70 bg-background p-3 dark:border-sidebar-border">
                                <p className="text-muted-foreground">
                                    Активных услуг
                                </p>
                                <p className="mt-1 font-semibold">
                                    {vendor.activeServicesCount}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {vendor.activeServices.length > 0 ? (
                                vendor.activeServices.map((service) => (
                                    <Badge
                                        key={service.name}
                                        variant="secondary"
                                    >
                                        {service.name}
                                        {service.price > 0
                                            ? ` от ${new Intl.NumberFormat(
                                                  'ru-RU',
                                              ).format(service.price)} ₽`
                                            : ''}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    Активные услуги пока не добавлены
                                </span>
                            )}
                        </div>
                    </div>

                    {vendor.moderationNote && (
                        <div className="rounded-2xl border border-dashed border-sidebar-border/70 p-4 text-sm dark:border-sidebar-border">
                            <p className="font-medium">Комментарий модерации</p>
                            <p className="mt-2 text-muted-foreground">
                                {vendor.moderationNote}
                            </p>
                        </div>
                    )}
                </div>

                <form className="space-y-3">
                    <label
                        className="text-sm font-medium"
                        htmlFor={`moderation-note-${vendor.id}`}
                    >
                        Комментарий админа
                    </label>
                    <textarea
                        className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        id={`moderation-note-${vendor.id}`}
                        onChange={(event) =>
                            setData('moderation_note', event.target.value)
                        }
                        placeholder="Что проверили или почему отклоняем"
                        value={data.moderation_note}
                    />
                    {errors.moderation_note && (
                        <p className="text-sm text-destructive">
                            {errors.moderation_note}
                        </p>
                    )}

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <Button
                            disabled={processing}
                            onClick={approve}
                            type="submit"
                        >
                            <CheckCircle2
                                className="size-4"
                                aria-hidden="true"
                            />
                            Подтвердить
                        </Button>
                        <Button
                            disabled={processing}
                            onClick={reject}
                            type="submit"
                            variant="destructive"
                        >
                            <XCircle className="size-4" aria-hidden="true" />
                            Отклонить
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function AdminVendorModeration({ vendors, stats }: PageProps) {
    const pendingVendors = vendors.filter(
        (vendor) => vendor.status === 'pending',
    );
    const reviewedVendors = vendors.filter(
        (vendor) => vendor.status !== 'pending',
    );

    const statCards = [
        {
            label: 'На проверке',
            value: stats.pending,
            icon: Clock3,
        },
        {
            label: 'Подтверждены',
            value: stats.approved,
            icon: ShieldCheck,
        },
        {
            label: 'Отклонены',
            value: stats.rejected,
            icon: XCircle,
        },
        {
            label: 'Всего компаний',
            value: stats.total,
            icon: Building2,
        },
    ];

    return (
        <>
            <Head title="Модерация компаний" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-2xl p-4">
                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Модерация компаний
                        </CardTitle>
                        <CardDescription className="max-w-3xl">
                            Новые компании попадают сюда со статусом «На
                            проверке». После подтверждения карточку можно
                            показывать клиентам, после отклонения компания
                            остаётся в базе с причиной отказа.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((item) => (
                        <Card
                            className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border"
                            key={item.label}
                        >
                            <CardContent className="flex min-h-28 items-center justify-between gap-4 p-5">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
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

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Очередь на проверку
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Сначала разбираем эти карточки.
                        </p>
                    </div>

                    {pendingVendors.length > 0 ? (
                        pendingVendors.map((vendor) => (
                            <VendorModerationCard
                                key={vendor.id}
                                vendor={vendor}
                            />
                        ))
                    ) : (
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                Очередь пустая. Редкий момент, когда админка
                                выглядит почти оптимистично.
                            </CardContent>
                        </Card>
                    )}
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Уже обработанные
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            История подтверждений и отказов.
                        </p>
                    </div>

                    {reviewedVendors.length > 0 ? (
                        reviewedVendors.map((vendor) => (
                            <VendorModerationCard
                                key={vendor.id}
                                vendor={vendor}
                            />
                        ))
                    ) : (
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                Обработанных компаний пока нет.
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </>
    );
}

AdminVendorModeration.layout = {
    breadcrumbs: [
        {
            title: 'Модерация компаний',
            href: '/admin/vendors/moderation',
        },
    ],
};
