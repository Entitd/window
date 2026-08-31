import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Building2,
    CircleAlert,
    Globe,
    MapPinned,
    Phone,
    ShieldCheck,
} from 'lucide-react';
import type { FormEvent } from 'react';
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
import {
    getModerationLabel,
    getModerationVariant,
} from '@/lib/dashboard-format';
import type { VendorProfile, VendorService } from '@/lib/dashboard-format';
import {
    dashboard as vendorDashboard,
    profile as vendorProfilePage,
    services as vendorServicesPage,
} from '@/routes/vendor';
import { update as updateProfile } from '@/routes/vendor/profile';

type PageProps = {
    vendorProfile: VendorProfile;
    vendorServices: VendorService[];
};

function ErrorText({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-sm text-destructive">{message}</p>;
}

export default function VendorProfilePage() {
    const { vendorProfile, vendorServices } = usePage<PageProps>().props;

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            company_name: vendorProfile.companyName,
            city: vendorProfile.city,
            phone: vendorProfile.phone,
            email: vendorProfile.email,
            districts: vendorProfile.districts.join(', '),
            description: vendorProfile.description,
            logo: vendorProfile.logo,
        });

    const districts = data.districts
        .split(',')
        .map((district) => district.trim())
        .filter(Boolean);
    const activeServices = vendorServices.filter((service) => service.isActive);

    const profileChecklist = [
        {
            title: 'Контакты компании',
            done: Boolean(data.phone && data.email),
            note: 'Телефон и email заполнены.',
        },
        {
            title: 'Описание специализации',
            done: data.description.trim().length > 60,
            note: 'Есть понятное описание услуг и позиционирования.',
        },
        {
            title: 'Районы работы',
            done: districts.length > 0,
            note: 'Указан географический охват компании.',
        },
        {
            title: 'Активные услуги',
            done: activeServices.length > 0,
            note: 'Хотя бы одна услуга уже опубликована.',
        },
        {
            title: 'Обозначение компании',
            done: data.logo.trim().length > 0,
            note: 'Указаны инициалы для аватара компании.',
        },
    ];

    const completedChecklist = profileChecklist.filter(
        (item) => item.done,
    ).length;
    const profileCompletion = Math.round(
        (completedChecklist / profileChecklist.length) * 100,
    );

    const profileSignals = [
        {
            label: 'Город',
            value: data.city || 'Не указан',
            icon: Globe,
        },
        {
            label: 'Районы',
            value: `${districts.length} указано`,
            icon: MapPinned,
        },
        {
            label: 'Активные услуги',
            value: `${activeServices.length} активных`,
            icon: BriefcaseBusiness,
        },
        {
            label: 'Обозначение',
            value: data.logo || 'Не указан',
            icon: Building2,
        },
    ];

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        patch(updateProfile.url(), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Профиль компании" />

            <DashboardPage>
                <DashboardHero
                    icon={Building2}
                    badge={
                        <>
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
                                Профиль готов на {profileCompletion}%
                            </Badge>
                            {recentlySuccessful && (
                                <Badge variant="default">Сохранено</Badge>
                            )}
                        </>
                    }
                    title={data.company_name || 'Профиль компании'}
                    description="Заполните контакты, районы работы и описание. После изменений подтверждённый профиль проходит повторную проверку."
                    actions={
                        <>
                            <Button asChild>
                                <Link href={vendorServicesPage()} prefetch>
                                    Услуги и цены
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={vendorDashboard()} prefetch>
                                    Назад в кабинет
                                </Link>
                            </Button>
                        </>
                    }
                />

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {profileSignals.map((item) => (
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
                            <CardTitle>Редактирование профиля</CardTitle>
                            <CardDescription>
                                Эти данные формируют карточку компании и
                                помогают клиенту принять решение.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-6" onSubmit={submit}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="company_name">
                                            Название компании
                                        </Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(event) =>
                                                setData(
                                                    'company_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <ErrorText
                                            message={errors.company_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">Город</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(event) =>
                                                setData(
                                                    'city',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <ErrorText message={errors.city} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Телефон</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(event) =>
                                                setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <ErrorText message={errors.phone} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <ErrorText message={errors.email} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="districts">
                                        Районы работы
                                    </Label>
                                    <Input
                                        id="districts"
                                        value={data.districts}
                                        onChange={(event) =>
                                            setData(
                                                'districts',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Центральный, Дзержинский"
                                    />
                                    <ErrorText message={errors.districts} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Описание компании
                                    </Label>
                                    <textarea
                                        id="description"
                                        className="min-h-36 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <ErrorText message={errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="logo">
                                        Инициалы компании
                                    </Label>
                                    <Input
                                        id="logo"
                                        value={data.logo}
                                        onChange={(event) =>
                                            setData('logo', event.target.value)
                                        }
                                        placeholder="ОК"
                                    />
                                    <ErrorText message={errors.logo} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Сохраняем...'
                                        : 'Сохранить изменения'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle>Готовность к публикации</CardTitle>
                                <CardDescription>
                                    Основные данные для карточки компании.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Общая готовность
                                        </span>
                                        <span className="font-medium">
                                            {profileCompletion}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${profileCompletion}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {profileChecklist.map((item) => (
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
                                <CardTitle>Модерация</CardTitle>
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
                                    <Phone
                                        className="mt-0.5 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            Контакт для клиента
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {data.phone} - {data.email}
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
                                            После изменения профиля
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Если карточка была подтверждена,
                                            сохранение отправит ее на повторную
                                            модерацию.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-primary/15 bg-primary/5 shadow-sm">
                            <CardHeader>
                                <CardTitle>Предпросмотр компании</CardTitle>
                                <CardDescription>
                                    Основные данные карточки в компактном виде.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
                                        {data.logo ||
                                            data.company_name.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {data.company_name ||
                                                'Название компании'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {data.city || 'Город не указан'}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                                    {districts.length > 0
                                        ? `Работает в районах: ${districts.join(', ')}`
                                        : 'Районы работы не указаны'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardPage>
        </>
    );
}

VendorProfilePage.layout = {
    breadcrumbs: [
        {
            title: 'Кабинет компании',
            href: vendorDashboard(),
        },
        {
            title: 'Профиль',
            href: vendorProfilePage(),
        },
    ],
};
