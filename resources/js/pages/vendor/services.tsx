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
        form.patch(`/vendor/services/${service.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <article className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {service.description || 'Описание пока не заполнено.'}
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
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                        className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                            toggleForm.patch(
                                `/vendor/services/${service.id}/toggle`,
                                {
                                    preserveScroll: true,
                                },
                            )
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
                            deleteForm.delete(`/vendor/services/${service.id}`, {
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
        form.post('/vendor/services', {
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
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    id="price_type"
                    onChange={(event) =>
                        form.setData('price_type', event.target.value as PricingType)
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
                    className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
    const sqmServices = services.filter((service) => service.pricingType === 'sqm');
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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                    <CardHeader className="gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                    {activeServices.length} активных услуг
                                </Badge>
                                <Badge variant="outline">
                                    {sqmServices.length} с ценой за м²
                                </Badge>
                            </div>

                            <div>
                                <CardTitle className="text-2xl">
                                    Услуги и цены компании
                                </CardTitle>
                                <CardDescription className="mt-2 max-w-3xl">
                                    Эти позиции используются в выдаче для клиентов.
                                    Активные услуги помогают понять, по каким заявкам
                                    компанию можно показывать.
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                            <Button asChild>
                                <Link href="/vendor/requests">Смотреть заявки</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/vendor/profile">Профиль компании</Link>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {serviceStats.map((item) => (
                        <Card
                            className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border"
                            key={item.label}
                        >
                            <CardContent className="flex min-h-32 flex-col justify-between gap-4 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-xl font-semibold">
                                            {item.value}
                                        </p>
                                    </div>
                                    <item.icon
                                        className="size-5 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
                    <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Каталог услуг компании</CardTitle>
                            <CardDescription>
                                Здесь можно обновлять цены, описания и доступность услуг.
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
                                <div className="rounded-xl border border-dashed border-sidebar-border/70 p-6 text-sm text-muted-foreground dark:border-sidebar-border">
                                    Услуг пока нет. Добавьте хотя бы одну активную
                                    позицию, иначе компания не будет нормально
                                    матчиться с заявками в выдаче.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Добавить услугу</CardTitle>
                                <CardDescription>
                                    Новая услуга сразу сохраняется в `vendor_services`.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateServiceForm />
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
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
                                                    item.done ? 'default' : 'outline'
                                                }
                                            >
                                                {item.done ? 'OK' : 'Проверить'}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {item.note}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
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
                                        В выдаче учитываются только активные услуги.
                                        Отключённые позиции остаются в кабинете, но не
                                        помогают компании попасть в подбор.
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                                    <BadgeDollarSign
                                        className="mt-0.5 size-4"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        Минимальная цена влияет на примерный диапазон в
                                        карточке компании. Это пока простая формула, без
                                        большого калькулятора.
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

VendorServicesPage.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет компании',
            href: '/vendor/dashboard',
        },
        {
            title: 'Услуги и цены',
            href: '/vendor/services',
        },
    ],
};
