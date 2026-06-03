import { Head } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarClock,
    Check,
    Grid2X2,
    MapPin,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type LeadField = {
    icon: LucideIcon;
    label: string;
    value: string;
};

type Company = {
    name: string;
    description: string;
    initials: string;
    logoClass: string;
    rating: string;
    tag: string;
    price: string;
    details: string[];
};

const metrics = [
    { value: '120+', label: 'проверенных компаний' },
    { value: '4.8', label: 'средний рейтинг' },
    { value: '-18%', label: 'экономия на заказе' },
];

const leadFields: LeadField[] = [
    { icon: MapPin, label: 'Город', value: 'Волгоград' },
    { icon: Grid2X2, label: 'Тип работ', value: 'Замер + монтаж' },
    { icon: Wallet, label: 'Бюджет', value: 'до 150 000 ₽' },
    { icon: CalendarClock, label: 'Срок', value: 'на этой неделе' },
];

const serviceOptions = [
    {
        label: 'Замена стеклопакета',
        baseMin: 8000,
        baseMax: 12000,
    },
    {
        label: 'Установка окна',
        baseMin: 18000,
        baseMax: 30000,
    },
    {
        label: 'Балконный блок',
        baseMin: 25000,
        baseMax: 45000,
    },
    {
        label: 'Замер',
        baseMin: 0,
        baseMax: 1500,
    },
    {
        label: 'Ремонт/регулировка',
        baseMin: 2500,
        baseMax: 7000,
    },
];

const leadValueOptions: Record<string, string[]> = {
    Город: ['Волгоград', 'Волжский', 'Краснооктябрьский район'],
    'Тип работ': ['Замер + монтаж', 'Только замер', 'Ремонт/регулировка'],
    Бюджет: ['до 30 000 ₽', 'до 65 000 ₽', 'до 150 000 ₽'],
    Срок: ['сегодня/завтра', 'до 3 дней', 'на этой неделе'],
};

const sortOptions = ['Самые дешевые', 'Высокий рейтинг', 'Быстрый монтаж'];

const filters = {
    rating: [
        { label: 'от 4.7 и выше', checked: true },
        { label: 'много отзывов', checked: false },
        { label: 'есть фото работ', checked: true },
    ],
    timing: [
        { label: 'сегодня/завтра', checked: false },
        { label: 'до 3 дней', checked: true },
        { label: 'на этой неделе', checked: false },
    ],
};

const companies: Company[] = [
    {
        name: 'ОкнаПрофи',
        description: 'Пластиковые окна и балконы',
        initials: 'ОП',
        logoClass: 'bg-[#eaf2ff] text-[#175cd3]',
        rating: '4.9 / 231 отзывов',
        tag: 'лучшие цены',
        price: '18 900 ₽',
        details: [
            'Срок: 2-3 дня',
            'Гарантия: 5 лет',
            'Работников: 14',
            'Выезд замерщика: бесплатно',
        ],
    },
    {
        name: 'ТеплоДом',
        description: 'Остекление квартир и домов',
        initials: 'ТД',
        logoClass: 'bg-[#eafbf2] text-[#027a48]',
        rating: '4.8 / 184 отзывов',
        tag: 'быстрый замер',
        price: '20 400 ₽',
        details: [
            'Срок: 3 дня',
            'Гарантия: 7 лет',
            'Работников: 9',
            'Выезд замерщика: бесплатно',
        ],
    },
    {
        name: 'GlassCity',
        description: 'Премиальные профили и монтаж',
        initials: 'GC',
        logoClass: 'bg-[#f1edff] text-[#7a5af8]',
        rating: '4.7 / 96 отзывов',
        tag: 'премиум',
        price: '24 700 ₽',
        details: [
            'Срок: 4-5 дней',
            'Гарантия: 10 лет',
            'Работников: 6',
            'Выезд замерщика: 1 000 ₽',
        ],
    },
];

const workers = [
    {
        name: 'Алексей',
        role: 'Монтажник',
        rating: '4.9',
        price: 'от 6 500 ₽',
        initials: 'А',
        color: 'bg-[#247cff]',
    },
    {
        name: 'Марат',
        role: 'Замерщик',
        rating: '4.8',
        price: 'от 0 ₽',
        initials: 'М',
        color: 'bg-[#12b76a]',
    },
    {
        name: 'Ирина',
        role: 'Менеджер',
        rating: '4.9',
        price: 'от 0 ₽',
        initials: 'И',
        color: 'bg-[#7a5af8]',
    },
    {
        name: 'Сергей',
        role: 'Бригадир',
        rating: '4.7',
        price: 'от 8 000 ₽',
        initials: 'С',
        color: 'bg-[#f79009]',
    },
];

const steps = [
    {
        title: 'Укажите задачу',
        text: 'Город, тип окон, бюджет и желаемый срок.',
    },
    {
        title: 'Сравните варианты',
        text: 'Цена, рейтинг, гарантия, бригады и отзывы в одном списке.',
    },
    {
        title: 'Выберите исполнителя',
        text: 'Оставьте заявку и договоритесь о замере без лишних звонков.',
    },
];

function formatRoubles(value: number) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value));
}

function getNextOption(options: string[], currentValue: string) {
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
            className={`h-8 rounded-full border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
                active
                    ? 'border-[#247cff] bg-[#247cff] text-white shadow-[0_10px_24px_rgba(36,124,255,0.2)]'
                    : 'border-[#eaecf0] bg-white text-[#344054] hover:border-[#c9d6ea]'
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
            className="flex min-h-18 items-center gap-3 rounded-[18px] border border-[#eaecf0] bg-white p-4 text-left transition hover:border-[#c9d6ea] hover:shadow-[0_10px_26px_rgba(16,24,40,0.06)]"
            onClick={onClick}
            type="button"
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#eaf2ff] text-[#247cff]">
                <Icon size={16} strokeWidth={2.4} />
            </span>
            <span>
                <span className="block text-xs font-medium text-[#667085]">
                    {field.label}
                </span>
                <span className="mt-1 block text-base font-semibold text-[#101828]">
                    {value}
                </span>
            </span>
        </button>
    );
}

function FilterCheck({
    label,
    checked,
    onClick,
}: {
    label: string;
    checked: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className="flex cursor-pointer items-center gap-3 text-left text-[15px] font-medium text-[#344054]"
            onClick={onClick}
            type="button"
        >
            <span
                className={`flex size-5 items-center justify-center rounded-md border ${
                    checked
                        ? 'border-[#247cff] bg-[#247cff] text-white'
                        : 'border-[#d0d5dd] bg-white'
                }`}
            >
                {checked && <Check size={14} strokeWidth={3} />}
            </span>
            {label}
        </button>
    );
}

function CompanyCard({
    company,
    selected,
    detailsOpen,
    priceRange,
    onChoose,
    onToggleDetails,
}: {
    company: Company;
    selected: boolean;
    detailsOpen: boolean;
    priceRange: [number, number];
    onChoose: () => void;
    onToggleDetails: () => void;
}) {
    return (
        <article
            className={`rounded-[26px] border bg-white p-5 shadow-[0_12px_30px_rgba(16,24,40,0.06)] ${
                selected
                    ? 'border-[#247cff] ring-2 ring-[#247cff]/20'
                    : 'border-[#eaecf0]'
            }`}
        >
            <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                <div className="flex gap-4">
                    <div
                        className={`flex size-[72px] shrink-0 items-center justify-center rounded-[20px] text-2xl font-extrabold ${company.logoClass}`}
                    >
                        {company.initials}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-2xl leading-tight font-bold text-[#101828]">
                            {company.name}
                        </h3>
                        <p className="mt-1 text-[15px] font-medium text-[#667085]">
                            {company.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <span className="rounded-full bg-[#fff4e5] px-4 py-2 text-sm font-semibold text-[#b54708]">
                                ★ {company.rating}
                            </span>
                            <span className="rounded-full bg-[#eafbf2] px-4 py-2 text-sm font-semibold text-[#027a48]">
                                {company.tag}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-start justify-between gap-4 lg:min-w-[190px] lg:flex-col lg:items-end">
                    <div className="lg:text-right">
                        <span className="block text-sm font-medium text-[#667085]">
                            предварительно
                        </span>
                        <strong className="block text-3xl leading-tight font-extrabold text-[#101828]">
                            {formatRoubles(priceRange[0])}-
                            {formatRoubles(priceRange[1])} ₽
                        </strong>
                    </div>
                    <button
                        className={`h-12 rounded-2xl px-6 text-base font-semibold shadow-[0_10px_24px_rgba(36,124,255,0.28)] transition ${
                            selected
                                ? 'bg-[#eafbf2] text-[#027a48]'
                                : 'bg-[#247cff] text-white hover:bg-[#1768e6]'
                        }`}
                        onClick={onChoose}
                        type="button"
                    >
                        {selected ? 'Выбрана' : 'Выбрать'}
                    </button>
                </div>
            </div>
            <div className="my-5 h-px bg-[#eaecf0]" />
            <div className="grid gap-3 text-[15px] font-semibold text-[#344054] sm:grid-cols-2 lg:grid-cols-4">
                {company.details.map((detail) => (
                    <span key={detail}>{detail}</span>
                ))}
            </div>
            <button
                className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#175cd3]"
                onClick={onToggleDetails}
                type="button"
            >
                {detailsOpen ? 'Скрыть условия' : 'Смотреть условия'}
                <ArrowUpRight size={16} />
            </button>
            {detailsOpen && (
                <div className="mt-5 rounded-2xl bg-[#f4f7fb] p-4 text-sm leading-6 font-medium text-[#344054]">
                    Компания подтвердит желаемую дату или предложит другое
                    время. Точная цена фиксируется после замера.
                </div>
            )}
        </article>
    );
}

export default function OknaMarket() {
    const [activeService, setActiveService] = useState(serviceOptions[0]);
    const [leadValues, setLeadValues] = useState(
        Object.fromEntries(
            leadFields.map((field) => [field.label, field.value]),
        ) as Record<string, string>,
    );
    const [ratingFilters, setRatingFilters] = useState(
        Object.fromEntries(
            filters.rating.map((item) => [item.label, item.checked]),
        ),
    );
    const [timingFilters, setTimingFilters] = useState(
        Object.fromEntries(
            filters.timing.map((item) => [item.label, item.checked]),
        ),
    );
    const [sortMode, setSortMode] = useState(sortOptions[0]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [openCompanyDetails, setOpenCompanyDetails] = useState<string | null>(
        null,
    );
    const [requestCreated, setRequestCreated] = useState(false);
    const [activeWorker, setActiveWorker] = useState<string | null>(null);

    const estimatedRange = useMemo<[number, number]>(() => {
        const budgetFactor = leadValues.Бюджет === 'до 150 000 ₽' ? 1.12 : 1;
        const urgencyFactor = leadValues.Срок === 'сегодня/завтра' ? 1.15 : 1;

        return [
            activeService.baseMin * budgetFactor * urgencyFactor,
            activeService.baseMax * budgetFactor * urgencyFactor,
        ];
    }, [activeService, leadValues]);

    const visibleCompanies = useMemo(() => {
        const filteredCompanies = companies.filter((company) => {
            if (
                ratingFilters['от 4.7 и выше'] &&
                !company.rating.startsWith('4.')
            ) {
                return false;
            }

            if (
                ratingFilters['много отзывов'] &&
                !company.rating.includes('1')
            ) {
                return false;
            }

            if (
                timingFilters['до 3 дней'] &&
                !company.details[0].includes('3')
            ) {
                return false;
            }

            return true;
        });

        return filteredCompanies.sort((firstCompany, secondCompany) => {
            if (sortMode === 'Высокий рейтинг') {
                return secondCompany.rating.localeCompare(firstCompany.rating);
            }

            if (sortMode === 'Быстрый монтаж') {
                return firstCompany.details[0].localeCompare(
                    secondCompany.details[0],
                );
            }

            return firstCompany.price.localeCompare(secondCompany.price);
        });
    }, [ratingFilters, sortMode, timingFilters]);

    const selectedCompanyData = companies.find(
        (company) => company.name === selectedCompany,
    );

    const scrollToLead = () => {
        document.getElementById('lead-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };

    const scrollToCompanies = () => {
        document.getElementById('companies')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <Head title="ОкнаМаркет" />
            <main className="relative min-h-screen overflow-x-clip bg-[#f4f7fb] font-sans text-[#101828]">
                <div className="pointer-events-none absolute top-48 left-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#c7ddff] opacity-70 blur-[80px]" />
                <div className="pointer-events-none absolute top-20 right-0 h-[320px] w-[320px] translate-x-1/3 rounded-full bg-[#d9f9e8] opacity-90 blur-[80px]" />

                <div className="relative mx-auto w-full max-w-[1280px] px-5 py-5 sm:px-8 lg:px-10">
                    <header className="flex items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#247cff] text-xl font-extrabold text-white">
                                О
                            </div>
                            <strong className="text-[22px] leading-none font-extrabold">
                                ОКНА
                            </strong>
                            <span className="hidden rounded-full bg-[#eaf2ff] px-5 py-2 text-sm font-semibold text-[#124fc4] sm:inline-flex">
                                Волгоград
                            </span>
                        </div>
                        <nav className="hidden items-center gap-9 text-base font-medium text-[#344054] lg:flex">
                            <a href="#companies">Компании</a>
                            <a href="#how">Как работает</a>
                            <a href="#contractors">Для компаний</a>
                        </nav>
                        <button
                            className="hidden h-11 rounded-2xl bg-[#247cff] px-6 text-base font-semibold text-white shadow-[0_10px_24px_rgba(36,124,255,0.28)] transition hover:bg-[#1768e6] sm:block"
                            onClick={scrollToLead}
                            type="button"
                        >
                            Оставить заявку
                        </button>
                    </header>

                    <section className="pt-14 text-center sm:pt-20">
                        <span className="inline-flex rounded-full border border-[#eaf2ff] bg-[#eaf2ff] px-4 py-2 text-sm font-semibold text-[#175cd3]">
                            Сравнение оконных компаний за 2 минуты
                        </span>
                        <h1 className="mx-auto mt-7 max-w-[1090px] text-[38px] leading-[1.06] font-extrabold tracking-normal sm:text-[52px] lg:text-[58px]">
                            Найдите лучшую оконную компанию без обзвона десятков
                            сайтов
                        </h1>
                        <div className="mx-auto mt-7 grid max-w-[650px] gap-4 sm:grid-cols-3">
                            {metrics.map((metric) => (
                                <div
                                    className="rounded-[20px] border border-[#eaecf0] bg-white px-5 py-4 text-left"
                                    key={metric.label}
                                >
                                    <strong className="block text-3xl leading-none font-extrabold">
                                        {metric.value}
                                    </strong>
                                    <span className="mt-2 block text-sm font-medium text-[#667085]">
                                        {metric.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        className="relative mx-auto mt-10 max-w-[1060px] rounded-[24px] border border-[#eaecf0] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,0.04)] sm:p-8"
                        id="lead-form"
                    >
                        <div className="text-center">
                            <h2 className="text-[24px] font-bold">
                                Что нужно установить?
                            </h2>
                            <p className="mt-2 text-base font-medium text-[#667085]">
                                Выберите услугу и примерные параметры для
                                предварительного диапазона цены.
                            </p>
                        </div>
                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                            {serviceOptions.map((service) => (
                                <Chip
                                    active={
                                        service.label === activeService.label
                                    }
                                    key={service.label}
                                    onClick={() => setActiveService(service)}
                                >
                                    {service.label}
                                </Chip>
                            ))}
                        </div>
                        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))]">
                            {leadFields.map((field) => (
                                <LeadFieldCard
                                    field={field}
                                    key={field.label}
                                    onClick={() =>
                                        setLeadValues((currentValues) => ({
                                            ...currentValues,
                                            [field.label]: getNextOption(
                                                leadValueOptions[field.label],
                                                currentValues[field.label],
                                            ),
                                        }))
                                    }
                                    value={leadValues[field.label]}
                                />
                            ))}
                            <button
                                className="relative min-h-18 overflow-hidden rounded-2xl bg-[#247cff] px-6 text-base font-semibold text-white shadow-[0_12px_30px_rgba(36,124,255,0.28)] transition hover:bg-[#1768e6]"
                                onClick={scrollToCompanies}
                                type="button"
                            >
                                Найти компании
                            </button>
                        </div>
                        <div className="mt-5 rounded-2xl bg-[#f4f7fb] p-4 text-center">
                            <span className="block text-sm font-medium text-[#667085]">
                                Предварительно
                            </span>
                            <strong className="mt-1 block text-2xl font-extrabold">
                                от {formatRoubles(estimatedRange[0])} до{' '}
                                {formatRoubles(estimatedRange[1])} ₽
                            </strong>
                            <span className="mt-1 block text-sm font-medium text-[#667085]">
                                Точная цена после замера.
                            </span>
                        </div>
                    </section>

                    <section
                        className="mt-20 grid min-w-0 items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]"
                        id="companies"
                    >
                        <aside className="rounded-[28px] border border-[#eaecf0] bg-white p-7 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
                            <h2 className="text-2xl font-bold">Фильтры</h2>
                            <div className="mt-7">
                                <h3 className="font-bold">Цена</h3>
                                <div className="mt-3 rounded-2xl border border-[#eaecf0] bg-[#f4f7fb] px-4 py-4 text-base font-semibold text-[#344054]">
                                    {formatRoubles(estimatedRange[0])}-
                                    {formatRoubles(estimatedRange[1])} ₽
                                </div>
                            </div>
                            <div className="mt-8">
                                <h3 className="font-bold">Рейтинг компании</h3>
                                <div className="mt-4 space-y-4">
                                    {filters.rating.map((item) => (
                                        <FilterCheck
                                            checked={Boolean(
                                                ratingFilters[item.label],
                                            )}
                                            key={item.label}
                                            label={item.label}
                                            onClick={() =>
                                                setRatingFilters((current) => ({
                                                    ...current,
                                                    [item.label]:
                                                        !current[item.label],
                                                }))
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8">
                                <h3 className="font-bold">Сроки</h3>
                                <div className="mt-4 space-y-4">
                                    {filters.timing.map((item) => (
                                        <FilterCheck
                                            checked={Boolean(
                                                timingFilters[item.label],
                                            )}
                                            key={item.label}
                                            label={item.label}
                                            onClick={() =>
                                                setTimingFilters((current) => ({
                                                    ...current,
                                                    [item.label]:
                                                        !current[item.label],
                                                }))
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                className="mt-8 h-12 w-full rounded-2xl bg-[#247cff] text-base font-semibold text-white shadow-[0_10px_24px_rgba(36,124,255,0.28)] transition hover:bg-[#1768e6]"
                                onClick={scrollToCompanies}
                                type="button"
                            >
                                Применить
                            </button>
                        </aside>

                        <div className="min-w-0 space-y-6">
                            <div className="flex flex-wrap items-center gap-3 rounded-[22px] border border-[#eaecf0] bg-white p-5">
                                <span className="mr-1 text-base font-medium text-[#667085]">
                                    Сортировать:
                                </span>
                                {sortOptions.map((option) => (
                                    <Chip
                                        active={option === sortMode}
                                        key={option}
                                        onClick={() => setSortMode(option)}
                                    >
                                        {option}
                                    </Chip>
                                ))}
                            </div>
                            {visibleCompanies.map((company) => (
                                <CompanyCard
                                    company={company}
                                    key={company.name}
                                    detailsOpen={
                                        openCompanyDetails === company.name
                                    }
                                    onChoose={() => {
                                        setSelectedCompany(company.name);
                                        setRequestCreated(false);
                                    }}
                                    onToggleDetails={() =>
                                        setOpenCompanyDetails((currentName) =>
                                            currentName === company.name
                                                ? null
                                                : company.name,
                                        )
                                    }
                                    priceRange={[
                                        estimatedRange[0],
                                        estimatedRange[1],
                                    ]}
                                    selected={selectedCompany === company.name}
                                />
                            ))}
                        </div>
                    </section>

                    {selectedCompanyData && (
                        <section className="mx-auto mt-10 max-w-[1060px] rounded-[24px] border border-[#eaecf0] bg-white p-6 shadow-[0_14px_34px_rgba(16,24,40,0.06)]">
                            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                                <div>
                                    <span className="rounded-full bg-[#eaf2ff] px-4 py-2 text-sm font-semibold text-[#175cd3]">
                                        {requestCreated
                                            ? 'Заявка создана'
                                            : 'Компания выбрана'}
                                    </span>
                                    <h2 className="mt-4 text-2xl font-extrabold">
                                        {selectedCompanyData.name} получит
                                        заявку на{' '}
                                        {activeService.label.toLowerCase()}
                                    </h2>
                                    <p className="mt-2 text-base font-medium text-[#667085]">
                                        {leadValues['Тип работ']}, город:{' '}
                                        {leadValues.Город}, срок:{' '}
                                        {leadValues.Срок}. Предварительно от{' '}
                                        {formatRoubles(estimatedRange[0])} до{' '}
                                        {formatRoubles(estimatedRange[1])} ₽.
                                    </p>
                                </div>
                                <button
                                    className={`min-h-12 rounded-2xl px-6 text-base font-semibold transition ${
                                        requestCreated
                                            ? 'bg-[#eafbf2] text-[#027a48]'
                                            : 'bg-[#247cff] text-white shadow-[0_10px_24px_rgba(36,124,255,0.28)] hover:bg-[#1768e6]'
                                    }`}
                                    onClick={() => setRequestCreated(true)}
                                    type="button"
                                >
                                    {requestCreated
                                        ? 'Ожидает подтверждения'
                                        : 'Оставить заявку'}
                                </button>
                            </div>
                        </section>
                    )}

                    <section
                        className="mt-28 rounded-[34px] border border-[#eaecf0] bg-white p-6 shadow-[0_14px_34px_rgba(16,24,40,0.06)] sm:p-9"
                        id="contractors"
                    >
                        <h2 className="max-w-[760px] text-[30px] leading-tight font-extrabold sm:text-[34px]">
                            Для компаний: заявки, даты и статусы без сложной CRM
                        </h2>
                        <p className="mt-4 max-w-[720px] text-lg leading-[1.45] font-medium text-[#667085]">
                            В MVP компания видит входящие заявки, подтверждает
                            дату, предлагает другой слот и меняет статус заказа.
                        </p>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {workers.map((worker) => (
                                <article
                                    className="rounded-3xl border border-[#eaecf0] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.05)]"
                                    key={worker.name}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex size-14 items-center justify-center rounded-[18px] text-lg font-extrabold text-white ${worker.color}`}
                                        >
                                            {worker.initials}
                                        </div>
                                        <div>
                                            <h3 className="text-[17px] leading-tight font-bold">
                                                {worker.name}
                                            </h3>
                                            <p className="mt-1 text-sm font-medium text-[#667085]">
                                                {worker.role}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-5 text-[15px] font-semibold text-[#344054]">
                                        ★ {worker.rating} · {worker.price}
                                    </p>
                                    <button
                                        className={`mt-4 h-9 w-full rounded-2xl text-base font-semibold ${
                                            activeWorker === worker.name
                                                ? 'bg-[#247cff] text-white'
                                                : 'bg-[#eaf2ff] text-[#175cd3]'
                                        }`}
                                        onClick={() =>
                                            setActiveWorker(worker.name)
                                        }
                                        type="button"
                                    >
                                        {activeWorker === worker.name
                                            ? 'Выбрано'
                                            : 'Показать роль'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-20 pb-20" id="how">
                        <h2 className="text-4xl font-extrabold">
                            Как это работает
                        </h2>
                        <div className="mt-8 grid gap-6 lg:grid-cols-3">
                            {steps.map((step, index) => (
                                <article
                                    className="flex min-h-[170px] gap-5 rounded-[28px] border border-[#eaecf0] bg-white p-7 shadow-[0_10px_24px_rgba(16,24,40,0.05)]"
                                    key={step.title}
                                >
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2ff] text-xl font-extrabold text-[#175cd3]">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl leading-tight font-bold">
                                            {step.title}
                                        </h3>
                                        <p className="mt-3 text-base leading-6 font-medium text-[#667085]">
                                            {step.text}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
