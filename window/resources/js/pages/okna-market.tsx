import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    CalendarClock,
    Camera,
    Check,
    ChevronDown,
    Grid2X2,
    Home,
    MapPin,
    Ruler,
    ShieldCheck,
    Star,
    Wallet,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { agreement, privacy } from '@/routes';

type ServiceKey =
    | 'glass_replacement'
    | 'window_installation'
    | 'balcony_block'
    | 'measurement'
    | 'repair';

type Service = {
    key: ServiceKey;
    title: string;
    description: string;
    baseMin: number;
    baseMax: number;
    icon: LucideIcon;
};

type LeadField = {
    icon: LucideIcon;
    label: string;
    value: string;
};

type Company = {
    name: string;
    rating: string;
    orders: number;
    multiplier: number;
    nextDate: string;
    guarantee: string;
    districts: string;
    review: string;
    badge: string;
};

type SectionHeaderProps = {
    eyebrow: string;
    title: string;
    text?: string;
};

const services: Service[] = [
    {
        key: 'glass_replacement',
        title: 'Замена стеклопакета',
        description:
            'Когда рама целая, но стеклопакет треснул, запотевает или плохо держит тепло.',
        baseMin: 6500,
        baseMax: 14500,
        icon: Home,
    },
    {
        key: 'window_installation',
        title: 'Установка окна',
        description: 'Полная установка нового окна с демонтажом старого.',
        baseMin: 18000,
        baseMax: 36000,
        icon: Building2,
    },
    {
        key: 'balcony_block',
        title: 'Балконный блок',
        description: 'Замена или установка окна и двери на балкон.',
        baseMin: 38000,
        baseMax: 76000,
        icon: CalendarClock,
    },
    {
        key: 'measurement',
        title: 'Замер',
        description:
            'Выезд замерщика, проверка проёма и уточнение точной сметы.',
        baseMin: 0,
        baseMax: 1500,
        icon: Ruler,
    },
    {
        key: 'repair',
        title: 'Ремонт и регулировка',
        description:
            'Если окно плохо закрывается, продувает или нужна настройка.',
        baseMin: 2500,
        baseMax: 8500,
        icon: Wrench,
    },
];

const leadFields: LeadField[] = [
    { icon: MapPin, label: 'Город', value: 'Волгоград' },
    { icon: Grid2X2, label: 'Тип работ', value: 'Замер + монтаж' },
    { icon: Wallet, label: 'Бюджет', value: 'до 65 000 ₽' },
    { icon: CalendarClock, label: 'Срок', value: 'на этой неделе' },
];

const leadValueOptions: Record<string, string[]> = {
    Город: ['Волгоград', 'Волжский', 'Краснооктябрьский район'],
    'Тип работ': ['Замер + монтаж', 'Только замер', 'Ремонт/регулировка'],
    Бюджет: ['до 30 000 ₽', 'до 65 000 ₽', 'до 150 000 ₽'],
    Срок: ['на этой неделе', 'сегодня/завтра', 'до 3 дней'],
};

const previewStats = [
    { value: '4 параметра', label: 'достаточно для подбора' },
    { value: '3 ответа', label: 'компании могут дать по дате' },
    { value: '1 заявка', label: 'вместо ручного обзвона' },
];

const companies: Company[] = [
    {
        name: 'ОкнаПрофи',
        rating: '4.8',
        orders: 231,
        multiplier: 1,
        nextDate: 'завтра, 14:00-18:00',
        guarantee: '1 год',
        districts: 'Центр, Дзержинский, Ворошиловский',
        review: 'Приехали в согласованное время, после замера цена почти не изменилась.',
        badge: 'Быстрый замер',
    },
    {
        name: 'ТеплоДом',
        rating: '4.8',
        orders: 184,
        multiplier: 1.08,
        nextDate: '13 июня',
        guarantee: '7 лет',
        districts: 'Краснооктябрьский, Тракторозаводский',
        review: 'Подробно объяснили, что входит в гарантию, и предложили удобное время.',
        badge: 'Длинная гарантия',
    },
    {
        name: 'GlassCity',
        rating: '4.7',
        orders: 96,
        multiplier: 1.16,
        nextDate: '15 июня',
        guarantee: '10 лет',
        districts: 'Волгоград и Волжский',
        review: 'Понравилось, что до визита показали понятный диапазон цены.',
        badge: 'Есть фото работ',
    },
];

const benefits = [
    {
        title: 'Предварительная цена',
        text: 'Сразу видите примерный диапазон стоимости до вызова мастера.',
        icon: Wallet,
    },
    {
        title: 'Проверенные компании',
        text: 'Выбираете исполнителя по рейтингу, отзывам, цене и гарантии.',
        icon: BadgeCheck,
    },
    {
        title: 'Удобная дата',
        text: 'Указываете желаемое время, а компания подтверждает выезд.',
        icon: CalendarClock,
    },
    {
        title: 'Гарантия на работу',
        text: 'После выполнения заказа данные о гарантии остаются в личном кабинете.',
        icon: ShieldCheck,
    },
];

const steps = [
    {
        title: 'Укажите параметры окна',
        text: 'Выберите услугу, дату и примерные размеры.',
    },
    {
        title: 'Получите предварительную цену',
        text: 'Сервис покажет примерный диапазон стоимости.',
    },
    {
        title: 'Выберите компанию',
        text: 'Сравните исполнителей по цене, рейтингу, срокам и гарантии.',
    },
    {
        title: 'Ожидайте подтверждения',
        text: 'Компания подтвердит заявку или предложит другое время.',
    },
];

const trustItems = [
    'Компании проходят проверку перед публикацией.',
    'Пользователь видит условия, цену и гарантию до подтверждения заявки.',
    'Точная цена фиксируется только после замера.',
];

const heroFacts = [
    'одна заявка вместо обзвона',
    'диапазон цены до замера',
    'выбор по рейтингу и гарантии',
];

const comparisonItems = [
    {
        title: 'Обычно',
        items: [
            'искать компании вручную',
            'звонить каждой отдельно',
            'объяснять размеры и услугу',
            'ждать расчёт',
            'не понимать, есть ли гарантия',
        ],
    },
    {
        title: 'Через сервис',
        items: [
            'одна заявка',
            'несколько предложений',
            'примерная цена сразу',
            'выбор по рейтингу и срокам',
            'гарантия в личном кабинете',
        ],
    },
];

const faqItems = [
    {
        question: 'Почему цена предварительная?',
        answer: 'Точная цена зависит от состояния проёма, фурнитуры, профиля и фактических размеров. Поэтому на главной показывается диапазон, а окончательная смета фиксируется после замера.',
    },
    {
        question: 'Можно ли подать заявку без точных размеров?',
        answer: 'Да. Достаточно примерной ширины, высоты, типа окна и, если есть возможность, фотографии. Эти данные нужны только для первичного расчёта.',
    },
    {
        question: 'Что происходит после выбора компании?',
        answer: 'Заявка получает статус ожидания подтверждения. Компания может принять дату, отклонить заявку или предложить другое время.',
    },
    {
        question: 'Когда появляется гарантия?',
        answer: 'После статуса “выполнена” сервис показывает гарантию: компанию, связанную заявку, дату начала, дату окончания и условия.',
    },
];

function formatRoubles(value: number): string {
    const roundedValue = Math.round(value / 100) * 100;

    return new Intl.NumberFormat('ru-RU').format(roundedValue);
}

function SectionHeader({ eyebrow, title, text }: SectionHeaderProps) {
    return (
        <div className="max-w-3xl">
            <p className="text-sm font-bold text-[#0f766e] uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl leading-tight font-extrabold text-[#152033] md:text-4xl">
                {title}
            </h2>
            {text && (
                <p className="mt-4 text-base leading-7 font-medium text-[#5d6b82]">
                    {text}
                </p>
            )}
        </div>
    );
}

function getNextOption(options: string[], currentValue: string): string {
    const currentIndex = options.indexOf(currentValue);

    return options[currentIndex === options.length - 1 ? 0 : currentIndex + 1];
}

function Chip({
    children,
    active = false,
    onClick,
}: {
    children: ReactNode;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`h-10 rounded-full border px-4 text-sm font-bold transition hover:-translate-y-0.5 ${
                active
                    ? 'border-[#0f766e] bg-[#0f766e] text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)]'
                    : 'border-[#dbe3ee] bg-white text-[#344054] hover:border-[#0f766e]/40'
            }`}
            onClick={onClick}
            type="button"
        >
            {children}
        </button>
    );
}

function LeadFieldCard({
    field,
    value,
    onClick,
}: {
    field: LeadField;
    value: string;
    onClick: () => void;
}) {
    const Icon = field.icon;

    return (
        <button
            className="flex h-[74px] min-w-0 items-center gap-3 rounded-[16px] border border-[#dbe3ee] bg-white px-4 text-left transition hover:border-[#0f766e]/45 hover:shadow-[0_10px_26px_rgba(16,24,40,0.06)]"
            onClick={onClick}
            type="button"
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#ecfdf8] text-[#0f766e]">
                <Icon size={17} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
                <span className="block text-xs font-semibold text-[#667085]">
                    {field.label}
                </span>
                <span className="mt-1 block truncate text-lg leading-tight font-extrabold text-[#152033]">
                    {value}
                </span>
            </span>
        </button>
    );
}

function getServiceByKey(serviceKey: ServiceKey): Service {
    return (
        services.find((service) => service.key === serviceKey) ?? services[0]
    );
}

export default function OknaMarket() {
    const [serviceKey, setServiceKey] =
        useState<ServiceKey>('glass_replacement');
    const [leadValues, setLeadValues] = useState(
        Object.fromEntries(
            leadFields.map((field) => [field.label, field.value]),
        ) as Record<string, string>,
    );
    const [selectedCompany, setSelectedCompany] = useState(companies[0].name);
    const [requestCreated, setRequestCreated] = useState(false);

    const activeService = getServiceByKey(serviceKey);

    const estimatedRange = useMemo<[number, number]>(() => {
        const budgetFactor =
            leadValues.Бюджет === 'до 150 000 ₽'
                ? 1.12
                : leadValues.Бюджет === 'до 30 000 ₽'
                  ? 0.88
                  : 1;
        const urgencyFactor = leadValues.Срок === 'сегодня/завтра' ? 1.15 : 1;

        return [
            activeService.baseMin * budgetFactor * urgencyFactor,
            activeService.baseMax * budgetFactor * urgencyFactor,
        ];
    }, [activeService, leadValues]);

    const selectedCompanyData =
        companies.find((company) => company.name === selectedCompany) ??
        companies[0];

    const selectedCompanyPrice = useMemo<[number, number]>(
        () => [
            estimatedRange[0] * selectedCompanyData.multiplier,
            estimatedRange[1] * selectedCompanyData.multiplier,
        ],
        [estimatedRange, selectedCompanyData],
    );

    const scrollTo = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <Head>
                <title>ОкнаМаркет</title>
                <meta
                    content="Сервис подбора компаний для замены стеклопакета, установки окон, замера и ремонта с предварительным расчётом цены."
                    name="description"
                />
            </Head>

            <main className="min-h-screen overflow-x-clip bg-[#f4f7fb] font-sans text-[#152033]">
                <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
                    <button
                        className="flex items-center gap-3 text-left"
                        onClick={() => scrollTo('top')}
                        type="button"
                    >
                        <span className="flex size-10 items-center justify-center rounded-lg bg-[#0f766e] text-lg font-extrabold text-white">
                            О
                        </span>
                        <span>
                            <span className="block text-lg leading-none font-extrabold">
                                ОкнаМаркет
                            </span>
                            <span className="mt-1 block text-xs font-bold text-[#667085]">
                                заявка, цена, компания, гарантия
                            </span>
                        </span>
                    </button>

                    <nav className="hidden items-center gap-6 text-sm font-bold text-[#475467] lg:flex">
                        <button onClick={() => scrollTo('how')} type="button">
                            Как работает
                        </button>
                        <button
                            onClick={() => scrollTo('services')}
                            type="button"
                        >
                            Услуги
                        </button>
                        <button onClick={() => scrollTo('offer')} type="button">
                            Компании
                        </button>
                        <button onClick={() => scrollTo('faq')} type="button">
                            FAQ
                        </button>
                    </nav>

                    <button
                        className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#152033] px-4 text-sm font-bold text-white transition hover:bg-[#0f172a]"
                        onClick={() => scrollTo('lead-form')}
                        type="button"
                    >
                        Подобрать
                        <ArrowRight size={16} />
                    </button>
                </header>

                <section
                    className="mx-auto w-full max-w-[1280px] px-5 pt-5 pb-12 sm:px-8 lg:pt-10"
                    id="top"
                >
                    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
                        <div className="min-w-0">
                            <p className="inline-flex items-center gap-2 rounded-md border border-[#b7e4dd] bg-[#ecfdf8] px-3 py-2 text-sm font-bold text-[#0f766e]">
                                <Check size={16} />
                                Подбор компаний по установке и замене
                                стеклопакетов
                            </p>
                            <h1 className="mt-6 max-w-4xl text-4xl leading-tight font-extrabold text-[#101828] md:text-5xl lg:text-6xl">
                                Установка и замена стеклопакетов без долгого
                                поиска подрядчиков
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 font-medium text-[#5d6b82]">
                                Укажите параметры окна, выберите удобную дату и
                                получите предложения от проверенных компаний с
                                предварительной ценой и гарантией.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                {heroFacts.map((item) => (
                                    <div
                                        className="rounded-[18px] border border-[#dbe3ee] bg-white px-4 py-4 text-sm font-bold text-[#475467]"
                                        key={item}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[#dbe3ee] bg-white p-5 shadow-[0_14px_34px_rgba(16,24,40,0.06)]">
                            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                                {previewStats.map((item) => (
                                    <div
                                        className="rounded-[18px] bg-[#f4f7fb] px-5 py-4"
                                        key={item.label}
                                    >
                                        <strong className="block text-[26px] leading-none font-extrabold text-[#152033]">
                                            {item.value}
                                        </strong>
                                        <span className="mt-2 block text-sm font-semibold text-[#667085]">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 rounded-[20px] bg-[#152033] p-5 text-white">
                                <p className="text-sm font-bold text-[#5eead4] uppercase">
                                    Сценарий сервиса
                                </p>
                                <p className="mt-3 text-2xl leading-tight font-extrabold">
                                    заявка → примерная цена → список компаний →
                                    выбор → подтверждение → гарантия
                                </p>
                            </div>
                        </div>
                    </div>

                    <section
                        className="mt-8 rounded-[28px] border border-[#dbe3ee] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,0.1)] sm:p-7"
                        id="lead-form"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-[#0f766e] uppercase">
                                    Быстрый подбор
                                </p>
                                <h2 className="mt-2 text-[28px] leading-tight font-extrabold">
                                    Укажите задачу
                                </h2>
                            </div>
                            <span className="rounded-full bg-[#fff7ed] px-4 py-2 text-sm font-bold text-[#b45309]">
                                цена после замера
                            </span>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {services.map((service) => (
                                <Chip
                                    active={service.key === serviceKey}
                                    key={service.key}
                                    onClick={() => {
                                        setServiceKey(service.key);
                                        setRequestCreated(false);
                                    }}
                                >
                                    {service.title}
                                </Chip>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {leadFields.map((field) => (
                                <LeadFieldCard
                                    field={field}
                                    key={field.label}
                                    onClick={() => {
                                        setLeadValues((current) => ({
                                            ...current,
                                            [field.label]: getNextOption(
                                                leadValueOptions[field.label],
                                                current[field.label],
                                            ),
                                        }));
                                        setRequestCreated(false);
                                    }}
                                    value={leadValues[field.label]}
                                />
                            ))}
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-[#e4e9f2] pt-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                            <div className="rounded-[22px] border border-[#b7e4dd] bg-[#ecfdf8] p-5">
                                <span className="block text-sm font-bold text-[#0f766e]">
                                    Предварительно:
                                </span>
                                <strong className="mt-2 block text-[30px] leading-tight font-extrabold text-[#152033]">
                                    от {formatRoubles(estimatedRange[0])} до{' '}
                                    {formatRoubles(estimatedRange[1])} ₽
                                </strong>
                                <p className="mt-2 text-sm leading-6 font-semibold text-[#475467]">
                                    Точная цена после замера. Компания
                                    подтвердит дату или предложит другое время.
                                </p>
                            </div>

                            <button
                                className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0f766e] px-5 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(15,118,110,0.28)] transition hover:bg-[#115e59]"
                                onClick={() => scrollTo('offer')}
                                type="button"
                            >
                                Подобрать компании
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </section>
                </section>

                <section className="bg-white py-14">
                    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
                        <SectionHeader
                            eyebrow="Главные выгоды"
                            title="Цена, поиск, время и гарантия становятся понятнее"
                            text="Сервис закрывает главные вопросы до заявки: сколько примерно стоит работа, кто её выполнит, когда возможен выезд и где потом найти гарантию."
                        />
                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit) => {
                                const Icon = benefit.icon;

                                return (
                                    <article
                                        className="rounded-[24px] border border-[#e4e9f2] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.05)]"
                                        key={benefit.title}
                                    >
                                        <span className="flex size-10 items-center justify-center rounded-md bg-[#e0f2fe] text-[#0369a1]">
                                            <Icon size={20} />
                                        </span>
                                        <h3 className="mt-5 text-lg leading-tight font-extrabold">
                                            {benefit.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 font-medium text-[#667085]">
                                            {benefit.text}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section
                    className="mx-auto w-full max-w-[1280px] px-5 py-14 sm:px-8"
                    id="how"
                >
                    <SectionHeader
                        eyebrow="Как работает сервис"
                        title="Путь заявки от первого расчёта до гарантии"
                    />
                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        {steps.map((step, index) => (
                            <article
                                className="rounded-[24px] border border-[#dbe3ee] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.05)]"
                                key={step.title}
                            >
                                <span className="flex size-9 items-center justify-center rounded-md bg-[#152033] text-sm font-extrabold text-white">
                                    {index + 1}
                                </span>
                                <h3 className="mt-5 text-xl leading-tight font-extrabold text-[#152033]">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-base leading-7 font-bold text-[#344054]">
                                    {step.text}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-white py-14" id="services">
                    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
                        <SectionHeader
                            eyebrow="Какие услуги можно заказать"
                            title="Пять сценариев для первой версии сервиса"
                            text="Главная показывает разные задачи, но не перегружает пользователя сложным конфигуратором."
                        />

                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            {services.map((service) => {
                                const Icon = service.icon;
                                const isActive = service.key === serviceKey;

                                return (
                                    <button
                                        className={`rounded-[24px] border p-5 text-left transition ${
                                            isActive
                                                ? 'border-[#0f766e] bg-[#ecfdf8] shadow-[0_12px_30px_rgba(15,118,110,0.12)]'
                                                : 'border-[#e4e9f2] bg-white hover:border-[#94a3b8]'
                                        }`}
                                        key={service.key}
                                        onClick={() => {
                                            setServiceKey(service.key);
                                            scrollTo('lead-form');
                                        }}
                                        type="button"
                                    >
                                        <span
                                            className={`flex size-10 items-center justify-center rounded-md ${
                                                isActive
                                                    ? 'bg-[#0f766e] text-white'
                                                    : 'bg-[#f1f5f9] text-[#475467]'
                                            }`}
                                        >
                                            <Icon size={20} />
                                        </span>
                                        <h3 className="mt-5 text-lg leading-tight font-extrabold">
                                            {service.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 font-medium text-[#667085]">
                                            {service.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section
                    className="mx-auto grid w-full max-w-[1280px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px]"
                    id="offer"
                >
                    <div className="min-w-0">
                        <SectionHeader
                            eyebrow="Пример результата"
                            title="Что пользователь увидит после расчёта"
                            text="Даже на моковых данных этот блок объясняет главный результат: несколько предложений с ценой, сроком, рейтингом и гарантией."
                        />
                        <button
                            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#152033] px-5 text-sm font-extrabold text-white transition hover:bg-[#0f172a]"
                            onClick={() => scrollTo('offer')}
                            type="button"
                        >
                            Посмотреть предложения
                            <ArrowRight size={17} />
                        </button>

                        <div className="mt-8 grid gap-4">
                            {companies.map((company) => {
                                const isSelected =
                                    company.name === selectedCompany;
                                const companyRange: [number, number] = [
                                    estimatedRange[0] * company.multiplier,
                                    estimatedRange[1] * company.multiplier,
                                ];

                                return (
                                    <article
                                        className={`rounded-[24px] border bg-white p-5 transition ${
                                            isSelected
                                                ? 'border-[#0f766e] shadow-[0_16px_36px_rgba(15,118,110,0.13)]'
                                                : 'border-[#dbe3ee]'
                                        }`}
                                        key={company.name}
                                    >
                                        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-2xl leading-tight font-extrabold">
                                                        {company.name}
                                                    </h3>
                                                    <span className="rounded-md bg-[#fff7ed] px-3 py-1.5 text-sm font-bold text-[#b45309]">
                                                        {company.badge}
                                                    </span>
                                                </div>
                                                <div className="mt-4 grid gap-3 text-sm font-bold text-[#475467] sm:grid-cols-2 lg:grid-cols-4">
                                                    <span className="flex items-center gap-2">
                                                        <Star
                                                            className="text-[#f59e0b]"
                                                            size={16}
                                                        />
                                                        {company.rating} /{' '}
                                                        {company.orders} заказов
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <CalendarClock
                                                            size={16}
                                                        />
                                                        {company.nextDate}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <ShieldCheck
                                                            size={16}
                                                        />
                                                        {company.guarantee}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <MapPin size={16} />
                                                        {company.districts}
                                                    </span>
                                                </div>
                                                <p className="mt-4 text-sm leading-6 font-medium text-[#667085]">
                                                    “{company.review}”
                                                </p>
                                            </div>

                                            <div className="md:min-w-[220px] md:text-right">
                                                <span className="block text-sm font-bold text-[#667085]">
                                                    Предварительно
                                                </span>
                                                <strong className="mt-1 block text-2xl leading-tight font-extrabold">
                                                    {formatRoubles(
                                                        companyRange[0],
                                                    )}
                                                    –
                                                    {formatRoubles(
                                                        companyRange[1],
                                                    )}{' '}
                                                    ₽
                                                </strong>
                                                <button
                                                    className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-extrabold transition md:w-auto ${
                                                        isSelected
                                                            ? 'bg-[#ecfdf8] text-[#0f766e]'
                                                            : 'bg-[#152033] text-white hover:bg-[#0f172a]'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedCompany(
                                                            company.name,
                                                        );
                                                        setRequestCreated(
                                                            false,
                                                        );
                                                    }}
                                                    type="button"
                                                >
                                                    {isSelected
                                                        ? 'Выбрана'
                                                        : 'Выбрать'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                            {[
                                                'Фото работ',
                                                'Отзывы',
                                                'Условия гарантии',
                                            ].map((label) => (
                                                <span
                                                    className="flex min-h-10 items-center gap-2 rounded-md bg-[#f8fafc] px-3 text-sm font-bold text-[#475467]"
                                                    key={label}
                                                >
                                                    <Camera size={16} />
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>

                    <aside className="rounded-[24px] border border-[#dbe3ee] bg-white p-5 shadow-[0_12px_30px_rgba(16,24,40,0.05)] lg:sticky lg:top-5 lg:h-fit">
                        <p className="text-sm font-bold text-[#0f766e] uppercase">
                            Черновик заявки
                        </p>
                        <h3 className="mt-2 text-2xl leading-tight font-extrabold">
                            {activeService.title}
                        </h3>
                        <div className="mt-5 space-y-3 text-sm font-bold text-[#475467]">
                            {leadFields.map((field) => (
                                <p
                                    className="flex items-center justify-between gap-3"
                                    key={field.label}
                                >
                                    <span>{field.label}</span>
                                    <span className="text-right text-[#152033]">
                                        {leadValues[field.label]}
                                    </span>
                                </p>
                            ))}
                        </div>

                        <div className="mt-5 rounded-[18px] bg-[#f8fafc] p-4">
                            <span className="text-sm font-bold text-[#667085]">
                                {selectedCompanyData.name}
                            </span>
                            <strong className="mt-1 block text-2xl leading-tight font-extrabold">
                                от {formatRoubles(selectedCompanyPrice[0])} до{' '}
                                {formatRoubles(selectedCompanyPrice[1])} ₽
                            </strong>
                            <p className="mt-2 text-sm leading-6 font-semibold text-[#667085]">
                                Точная цена после замера. Ближайшая дата:{' '}
                                {selectedCompanyData.nextDate}.
                            </p>
                        </div>

                        <button
                            className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-base font-extrabold transition ${
                                requestCreated
                                    ? 'bg-[#ecfdf8] text-[#0f766e]'
                                    : 'bg-[#0f766e] text-white hover:bg-[#115e59]'
                            }`}
                            onClick={() => setRequestCreated(true)}
                            type="button"
                        >
                            {requestCreated
                                ? 'Ожидает подтверждения'
                                : 'Оставить заявку'}
                        </button>

                        <div className="mt-5 space-y-3 border-t border-[#e4e9f2] pt-5">
                            {[
                                'создана',
                                'ожидает подтверждения компании',
                                'подтверждена',
                                'гарантия активна после выполнения',
                            ].map((status, index) => (
                                <div
                                    className="flex items-center gap-3 text-sm font-bold text-[#475467]"
                                    key={status}
                                >
                                    <span
                                        className={`flex size-6 items-center justify-center rounded-full text-xs ${
                                            requestCreated || index === 0
                                                ? 'bg-[#0f766e] text-white'
                                                : 'bg-[#e4e9f2] text-[#667085]'
                                        }`}
                                    >
                                        {index + 1}
                                    </span>
                                    {status}
                                </div>
                            ))}
                        </div>
                    </aside>
                </section>

                <section className="bg-white py-14">
                    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
                        <SectionHeader
                            eyebrow="Почему не искать самому"
                            title="Одна заявка вместо ручного обзвона"
                            text="Главная прямо показывает разницу между обычным путём и сценарием сервиса."
                        />
                        <div className="mt-8 grid gap-4 lg:grid-cols-2">
                            {comparisonItems.map((column) => (
                                <article
                                    className="rounded-[24px] border border-[#e4e9f2] bg-white p-6 shadow-[0_10px_24px_rgba(16,24,40,0.05)]"
                                    key={column.title}
                                >
                                    <h3 className="text-2xl font-extrabold">
                                        {column.title}
                                    </h3>
                                    <ul className="mt-5 space-y-3">
                                        {column.items.map((item) => (
                                            <li
                                                className="flex items-start gap-3 text-base font-bold text-[#475467]"
                                                key={item}
                                            >
                                                <Check
                                                    className="mt-0.5 shrink-0 text-[#0f766e]"
                                                    size={18}
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-[1280px] px-5 py-14 sm:px-8">
                    <div className="grid gap-8 rounded-[28px] border border-[#dbe3ee] bg-[#152033] p-6 text-white md:grid-cols-[1fr_420px] md:p-8">
                        <div>
                            <p className="text-sm font-bold text-[#5eead4] uppercase">
                                Надёжность
                            </p>
                            <h2 className="mt-3 text-3xl leading-tight font-extrabold md:text-4xl">
                                Мы помогаем выбрать исполнителя понятнее и
                                безопаснее
                            </h2>
                            <p className="mt-4 max-w-2xl text-base leading-7 font-medium text-white/75">
                                Компании проходят проверку перед публикацией.
                                Пользователь видит условия, цену и гарантию до
                                подтверждения заявки.
                            </p>
                            <div className="mt-8 grid gap-3 md:grid-cols-3">
                                {trustItems.map((item) => (
                                    <div
                                        className="rounded-[18px] bg-white/8 p-4 text-sm leading-6 font-bold text-white/78"
                                        key={item}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] bg-white p-5 text-[#152033]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-[#0f766e]">
                                        Гарантия
                                    </p>
                                    <h3 className="mt-2 text-2xl font-extrabold">
                                        появится после выполнения
                                    </h3>
                                </div>
                                <ShieldCheck className="text-[#0f766e]" />
                            </div>
                            <div className="mt-5 space-y-3 text-sm font-bold text-[#475467]">
                                <p className="flex justify-between gap-3">
                                    <span>Заявка</span>
                                    <span className="text-[#152033]">
                                        № 2481
                                    </span>
                                </p>
                                <p className="flex justify-between gap-3">
                                    <span>Компания</span>
                                    <span className="text-[#152033]">
                                        {selectedCompanyData.name}
                                    </span>
                                </p>
                                <p className="flex justify-between gap-3">
                                    <span>Срок</span>
                                    <span className="text-[#152033]">
                                        {selectedCompanyData.guarantee}
                                    </span>
                                </p>
                            </div>
                            <p className="mt-5 rounded-lg bg-[#ecfdf8] p-4 text-sm leading-6 font-semibold text-[#0f766e]">
                                Условия гарантии фиксируются после завершения
                                заказа: дата начала, дата окончания и описание
                                работ.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-14" id="faq">
                    <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-5 sm:px-8 lg:grid-cols-[380px_minmax(0,1fr)]">
                        <SectionHeader
                            eyebrow="Мини-FAQ"
                            title="Коротко о цене, размерах, дате и гарантии"
                        />
                        <div className="space-y-3">
                            {faqItems.map((item) => (
                                <details
                                    className="group rounded-[24px] border border-[#e4e9f2] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.04)]"
                                    key={item.question}
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold">
                                        {item.question}
                                        <ChevronDown
                                            className="shrink-0 transition group-open:rotate-180"
                                            size={20}
                                        />
                                    </summary>
                                    <p className="mt-4 text-base leading-7 font-medium text-[#667085]">
                                        {item.answer}
                                    </p>
                                </details>
                            ))}
                            <button
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-5 text-sm font-extrabold text-[#152033] transition hover:border-[#0f766e] hover:text-[#0f766e]"
                                onClick={() => scrollTo('faq')}
                                type="button"
                            >
                                Смотреть все вопросы
                                <ArrowRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-[1280px] px-5 py-14 sm:px-8">
                    <div className="grid gap-6 rounded-[28px] border border-[#b7e4dd] bg-[#ecfdf8] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
                        <div>
                            <p className="text-sm font-bold text-[#0f766e] uppercase">
                                Начните подбор
                            </p>
                            <h2 className="mt-3 text-3xl leading-tight font-extrabold">
                                Готовы узнать примерную стоимость?
                            </h2>
                            <p className="mt-3 text-base leading-7 font-medium text-[#475467]">
                                Укажите параметры окна и получите предложения от
                                компаний.
                            </p>
                        </div>
                        <button
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-6 text-base font-extrabold text-white transition hover:bg-[#115e59]"
                            onClick={() => scrollTo('lead-form')}
                            type="button"
                        >
                            Подобрать компании
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </section>

                <footer className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 border-t border-[#dbe3ee] px-5 py-8 text-sm font-bold text-[#667085] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <span>ОкнаМаркет, 2026</span>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            className="transition hover:text-[#0f766e]"
                            href={privacy()}
                            prefetch
                        >
                            Политика конфиденциальности
                        </Link>
                        <Link
                            className="transition hover:text-[#0f766e]"
                            href={agreement()}
                            prefetch
                        >
                            Пользовательское соглашение
                        </Link>
                    </div>
                </footer>
            </main>
        </>
    );
}
