import { Head, Link, useForm } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BriefcaseBusiness,
    CircleOff,
    ListFilter,
    Sparkles,
    SquarePen,
    Trash2,
} from 'lucide-react';
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
import {
    dashboard as vendorDashboard,
    profile as vendorProfilePage,
    requests as vendorRequestsPage,
    services as vendorServicesPage,
} from '@/routes/vendor';
import {
    destroy as destroyService,
    store as storeService,
    toggle as toggleService,
    update as updateService,
} from '@/routes/vendor/services';

type PricingType = 'fixed' | 'sqm';

type VendorService = {
    id: number;
    name: string;
    basePrice: string;
    minPrice: number;
    pricingType: PricingType;
    description: string;
    isActive: boolean;
};

type PageProps = {
    services: VendorService[];
};

function getPricingTypeLabel(type: PricingType) {
    return type === 'sqm' ? 'За м²' : 'Фиксированная';
}

function ServiceEditor({ service }: { service: VendorService }) {
    const form = useForm({
        service_name: service.name,
        min_price: String(service.minPrice),
        price_type: service.pricingType,
        description: service.description,
    });
    const toggleForm = useForm({});
    const deleteForm = useForm({});

    function update(event: FormEvent) {
        event.preventDefault();
        form.patch(updateService.url(service.id), {
            preserveScroll: true,
        });
    }

    return (
        <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {service.description || 'Описание не заполнено.'}
                    </p>
                </div>
                <Badge variant={service.isActive ? 'default' : 'outline'}>
                    {service.isActive ? 'Активна' : 'Неактивна'}
                </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-lg bg-muted/50 px-3 py-3">
                    <p className="text-muted-foreground">Базовая цена</p>
                    <p className="mt-1 font-medium">{service.basePrice}</p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-3">
                    <p className="text-muted-foreground">Тип цены</p>
                    <p className="mt-1 font-medium">
                        {getPricingTypeLabel(service.pricingType)}
                    </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-3">
                    <p className="text-muted-foreground">Позиция</p>
                    <p className="mt-1 font-medium">#{service.id}</p>
                </div>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={update}>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_160px_170px]">
                    <div className="grid gap-2">
                        <Label htmlFor={`service-name-${service.id}`}>
                            Название
                        </Label>
                        <Input
                            id={`service-name-${service.id}`}
                            onChange={(event) =>
                                form.setData('service_name', event.target.value)
                            }
                            value={form.data.service_name}
                        />
                        {form.errors.service_name && (
                            <p className="text-sm text-destructive">
                                {form.errors.service_name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`service-price-${service.id}`}>
                            Цена от
                        </Label>
                        <Input
                            id={`service-price-${service.id}`}
                            min="0"
                            onChange={(event) =>
                                form.setData('min_price', event.target.value)
                            }
                            type="number"
                            value={form.data.min_price}
                        />
                        {form.errors.min_price && (
                            <p className="text-sm text-destructive">
                                {form.errors.min_price}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`service-price-type-${service.id}`}>
                            Тип цены
                        </Label>
                        <select
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            id={`service-price-type-${service.id}`}
                            onChange={(event) =>
                                form.setData(
                                    'price_type',
                                    event.target.value as PricingType,
                                )
                            }
                            value={form.data.price_type}
                        >
                            <option value="fixed">Фиксированная</option>
                            <option value="sqm">За м²</option>
                        </select>
                        {form.errors.price_type && (
                            <p className="text-sm text-destructive">
                                {form.errors.price_type}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`service-description-${service.id}`}>
                        Описание
                    </Label>
                    <textarea
                        className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        id={`service-description-${service.id}`}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        value={form.data.description}
                    />
                    {form.errors.description && (
                        <p className="text-sm text-destructive">
                            {form.errors.description}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button disabled={form.processing} size="sm" type="submit">
                        <SquarePen className="size-4" aria-hidden="true" />
                        Сохранить
                    </Button>
                    <Button
                        disabled={toggleForm.processing}
                        onClick={() =>
                            toggleForm.patch(toggleService.url(service.id), {
                                preserveScroll: true,
                            })
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        {service.isActive ? 'Отключить' : 'Включить'}
                    </Button>
                    <Button
                        disabled={deleteForm.processing}
                        onClick={() =>
                            deleteForm.delete(destroyService.url(service.id), {
                                preserveScroll: true,
                            })
                        }
                        size="sm"
                        type="button"
                        variant="ghost"
                    >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Удалить
                    </Button>
                </div>
            </form>
        </article>
    );
}

function CreateServiceForm() {
    const form = useForm({
        service_name: '',
        min_price: '',
        price_type: 'fixed' as PricingType,
        description: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(storeService.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('price_type', 'fixed');
            },
        });
    }

    return (
        <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-2">
                <Label htmlFor="service_name">Название услуги</Label>
                <Input
                    id="service_name"
                    onChange={(event) =>
                        form.setData('service_name', event.target.value)
                    }
                    placeholder="Например, замена стеклопакета"
                    value={form.data.service_name}
                />
                {form.errors.service_name && (
                    <p className="text-sm text-destructive">
                        {form.errors.service_name}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="min_price">Минимальная цена</Label>
                <Input
                    id="min_price"
                    min="0"
                    onChange={(event) =>
                        form.setData('min_price', event.target.value)
                    }
                    placeholder="6500"
                    type="number"
                    value={form.data.min_price}
                />
                {form.errors.min_price && (
                    <p className="text-sm text-destructive">
                        {form.errors.min_price}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="price_type">Тип цены</Label>
                <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    id="price_type"
                    onChange={(event) =>
                        form.setData(
                            'price_type',
                            event.target.value as PricingType,
                        )
                    }
                    value={form.data.price_type}
                >
                    <option value="fixed">Фиксированная</option>
                    <option value="sqm">За м²</option>
                </select>
                {form.errors.price_type && (
                    <p className="text-sm text-destructive">
                        {form.errors.price_type}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <textarea
                    className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    id="description"
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    placeholder="Коротко опишите услугу"
                    value={form.data.description}
                />
                {form.errors.description && (
                    <p className="text-sm text-destructive">
                        {form.errors.description}
                    </p>
                )}
            </div>

            <Button disabled={form.processing} type="submit">
                Добавить услугу
            </Button>
        </form>
    );
}

export default function VendorServicesPage({ services }: PageProps) {
    const activeServices = services.filter((service) => service.isActive);
    const inactiveServices = services.filter((service) => !service.isActive);
    const sqmServices = services.filter(
        (service) => service.pricingType === 'sqm',
    );
    const fixedServices = services.filter(
        (service) => service.pricingType === 'fixed',
    );

    const serviceStats = [
        {
            label: 'Всего услуг',
            value: services.length,
            icon: BriefcaseBusiness,
        },
        {
            label: 'Активные',
            value: activeServices.length,
            icon: Sparkles,
        },
        {
            label: 'Фиксированные',
            value: fixedServices.length,
            icon: BadgeDollarSign,
        },
        {
            label: 'Неактивные',
            value: inactiveServices.length,
            icon: CircleOff,
        },
    ];

    const serviceChecklist = [
        {
            title: 'Есть базовые услуги',
            done: services.length >= 3,
            note: 'Клиенту уже есть из чего выбирать.',
        },
        {
            title: 'Есть активные позиции',
            done: activeServices.length > 0,
            note: 'Карточка компании не пустая в каталоге.',
        },
        {
            title: 'Есть разные типы цены',
            done: sqmServices.length > 0 && fixedServices.length > 0,
            note: 'Можно покрывать и простые, и более гибкие сценарии.',
        },
    ];

    return (
        <>
            <Head title="Услуги и цены" />

            <DashboardPage>
                <DashboardHero
                    icon={BriefcaseBusiness}
                    badge={
                        <>
                            <Badge variant="outline">
                                {activeServices.length} активных услуг
                            </Badge>
                            <Badge variant="secondary">
                                {sqmServices.length} с ценой за м²
                            </Badge>
                        </>
                    }
                    title="Услуги и цены"
                    description="Управляйте каталогом компании: обновляйте стоимость, описание и доступность каждой услуги."
                    actions={
                        <>
                            <Button asChild>
                                <Link href={vendorRequestsPage()} prefetch>
                                    Смотреть заявки
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={vendorProfilePage()} prefetch>
                                    Профиль компании
                                </Link>
                            </Button>
                        </>
                    }
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {serviceStats.map((item) => (
                        <DashboardMetric
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                    <Card className="border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle>Каталог услуг компании</CardTitle>
                            <CardDescription>
                                Здесь можно обновлять цены, описания и
                                доступность услуг.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <ServiceEditor
                                        key={service.id}
                                        service={service}
                                    />
                                ))
                            ) : (
                                <DashboardEmptyState
                                    className="min-h-56"
                                    icon={BriefcaseBusiness}
                                    title="Каталог услуг пуст"
                                    description="Добавьте первую услугу и включите её, чтобы компания участвовала в подборе."
                                />
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm xl:sticky xl:top-5">
                            <CardHeader>
                                <CardTitle>Добавить услугу</CardTitle>
                                <CardDescription>
                                    Укажите понятное название, цену и короткое
                                    описание.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateServiceForm />
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Состояние каталога</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {serviceChecklist.map((item) => (
                                    <div
                                        className="rounded-xl bg-muted/50 p-3"
                                        key={item.title}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium">
                                                {item.title}
                                            </p>
                                            <Badge
                                                variant={
                                                    item.done
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {item.done
                                                    ? 'Готово'
                                                    : 'Проверить'}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {item.note}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Быстрые заметки</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                                    <ListFilter
                                        className="mt-0.5 size-4"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        В выдаче учитываются только активные
                                        услуги. Отключённые позиции остаются в
                                        кабинете, но не помогают компании
                                        попасть в подбор.
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                                    <BadgeDollarSign
                                        className="mt-0.5 size-4"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        Минимальная цена используется как
                                        ориентир в карточке компании и
                                        результатах подбора.
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

VendorServicesPage.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет компании',
            href: vendorDashboard(),
        },
        {
            title: 'Услуги и цены',
            href: vendorServicesPage(),
        },
    ],
};
