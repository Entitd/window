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
    { icon: CalendarClock, label: 'Срок', value: '01.02.26-18.02.26' },
];

const serviceOptions = [
    {
        label: 'Пластиковые окна',
        baseMin: 18000,
        baseMax: 30000,
    },
    {
        label: 'Балкон',
        baseMin: 25000,
        baseMax: 45000,
    },
    {
        label: 'Остекление дома',
        baseMin: 32000,
        baseMax: 70000,
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
    Срок: ['01.02.26-18.02.26', 'сегодня/завтра', 'до 3 дней'],
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
            className={`h-9 rounded-full border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
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
            className="flex h-[72px] min-w-0 items-center gap-3 rounded-[16px] border border-[#dfe5ee] bg-white px-4 text-left transition hover:border-[#c9d6ea] hover:shadow-[0_10px_26px_rgba(16,24,40,0.06)]"
            onClick={onClick}
            type="button"
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#eaf2ff] text-[#247cff]">
                <Icon size={16} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
                <span className="block text-xs font-medium text-[#667085]">
                    {field.label}
                </span>
                <span className="mt-1 block truncate text-lg leading-tight font-extrabold text-[#101828]">
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
    const [showCatalog, setShowCatalog] = useState(false);

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

    const scrollToSection = (
        sectionId: string,
        block: ScrollLogicalPosition,
    ) => {
        window.setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({
                behavior: 'smooth',
                block,
            });
        }, 0);
    };

    const scrollToLead = () => {
        scrollToSection('lead-form', 'center');
    };

    const scrollToCompanies = () => {
        setShowCatalog(true);
        scrollToSection('companies', 'start');
    };

    const scrollToInfo = (sectionId: string) => {
        setShowCatalog(false);
        scrollToSection(sectionId, 'start');
    };

    const markCriteriaEntered = () => {
        setShowCatalog(true);
    };

    return (
        <>
            <Head title="ОкнаМаркет" />
            <main className="relative min-h-screen overflow-x-clip bg-[#f4f7fb] font-sans text-[#101828]">
                <div className="relative mx-auto w-full max-w-[1280px] px-5 pt-5 sm:px-8 lg:px-0">
                    <header className="flex h-12 items-center justify-between gap-5 lg:px-6">
                        <div className="flex items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#247cff] text-xl font-extrabold text-white">
                                О
                            </div>
                            <strong className="text-[22px] leading-none font-extrabold">
                                ОКНА
                            </strong>
                            <span className="ml-2 hidden h-9 items-center rounded-full bg-[#eaf2ff] px-8 text-xs font-semibold text-[#124fc4] sm:inline-flex lg:ml-10">
                                Волгоград
                            </span>
                        </div>
                        <nav className="hidden items-center gap-7 text-sm font-medium text-[#344054] lg:flex">
                            <button onClick={scrollToCompanies} type="button">
                                Компании
                            </button>
                            <button
                                onClick={() => scrollToInfo('how')}
                                type="button"
                            >
                                Как работает
                            </button>
                            <button
                                onClick={() => scrollToInfo('contractors')}
                                type="button"
                            >
                                Для компаний
                            </button>
                        </nav>
                        <button
                            className="hidden h-12 rounded-[16px] bg-[#247cff] px-8 text-sm font-bold text-white shadow-[0_18px_28px_rgba(16,24,40,0.22)] transition hover:bg-[#1768e6] sm:block"
                            onClick={scrollToLead}
                            type="button"
                        >
                            Оставить заявку
                        </button>
                    </header>

                    <section className="flex min-h-[calc(78svh-68px)] flex-col justify-center py-8 sm:py-10 lg:py-6">
                        <div className="lg:px-12">
                            <h1 className="max-w-[1120px] text-left text-[30px] leading-[1.12] font-extrabold tracking-normal text-[#111827] sm:text-[36px] lg:text-[36px]">
                                Рассчитайте стоимость установки стеклопакета за
                                1 минуту
                            </h1>
                        </div>

                        <section
                            className="relative mx-auto mt-12 max-w-[1280px] rounded-[28px] border border-[#dfe5ee] bg-white px-6 py-7 sm:px-8 lg:mt-14"
                            id="lead-form"
                        >
                            <div>
                                <h2 className="text-[22px] leading-none font-extrabold">
                                    Что нужно установить?
                                </h2>
                            </div>
                            <div className="mt-5 flex flex-wrap justify-start gap-3">
                                {serviceOptions.map((service) => (
                                    <Chip
                                        active={
                                            service.label ===
                                            activeService.label
                                        }
                                        key={service.label}
                                        onClick={() => {
                                            setActiveService(service);
                                            markCriteriaEntered();
                                        }}
                                    >
                                        {service.label}
                                    </Chip>
                                ))}
                            </div>
                            <div className="mt-3 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-[190px_248px_230px_248px_minmax(220px,1fr)]">
                                {leadFields.map((field) => (
                                    <LeadFieldCard
                                        field={field}
                                        key={field.label}
                                        onClick={() => {
                                            setLeadValues((currentValues) => ({
                                                ...currentValues,
                                                [field.label]: getNextOption(
                                                    leadValueOptions[
                                                        field.label
                                                    ],
                                                    currentValues[field.label],
                                                ),
                                            }));
                                            markCriteriaEntered();
                                        }}
                                        value={leadValues[field.label]}
                                    />
                                ))}
                                <button
                                    className="relative h-[72px] overflow-hidden rounded-[16px] bg-[#247cff] px-6 text-lg font-bold text-white shadow-[0_10px_20px_rgba(36,124,255,0.2)] transition hover:bg-[#1768e6]"
                                    onClick={scrollToCompanies}
                                    type="button"
                                >
                                    Найти компании
                                </button>
                            </div>
                        </section>

                        <div className="mx-auto mt-7 grid max-w-[650px] gap-5 sm:grid-cols-3">
                            {metrics.map((metric) => (
                                <div
                                    className="min-h-[88px] rounded-[18px] border border-[#dfe5ee] bg-white px-5 py-4 text-left"
                                    key={metric.label}
                                >
                                    <strong className="block text-[32px] leading-none font-extrabold">
                                        {metric.value}
                                    </strong>
                                    <span className="mt-2 block text-sm font-medium text-[#667085]">
                                        {metric.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                    </section>

                    {showCatalog ? (
                        <>
                            <section
                                className="mt-8 grid min-w-0 items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]"
                                id="companies"
                            >
                                <aside className="rounded-[28px] border border-[#eaecf0] bg-white p-7 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
                                    <h2 className="text-2xl font-bold">
                                        Фильтры
                                    </h2>
                                    <div className="mt-7">
                                        <h3 className="font-bold">Цена</h3>
                                        <div className="mt-3 rounded-2xl border border-[#eaecf0] bg-[#f4f7fb] px-4 py-4 text-base font-semibold text-[#344054]">
                                            {formatRoubles(estimatedRange[0])}-
                                            {formatRoubles(estimatedRange[1])} ₽
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="font-bold">
                                            Рейтинг компании
                                        </h3>
                                        <div className="mt-4 space-y-4">
                                            {filters.rating.map((item) => (
                                                <FilterCheck
                                                    checked={Boolean(
                                                        ratingFilters[
                                                            item.label
                                                        ],
                                                    )}
                                                    key={item.label}
                                                    label={item.label}
                                                    onClick={() =>
                                                        setRatingFilters(
                                                            (current) => ({
                                                                ...current,
                                                                [item.label]:
                                                                    !current[
                                                                        item
                                                                            .label
                                                                    ],
                                                            }),
                                                        )
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
                                                        timingFilters[
                                                            item.label
                                                        ],
                                                    )}
                                                    key={item.label}
                                                    label={item.label}
                                                    onClick={() =>
                                                        setTimingFilters(
                                                            (current) => ({
                                                                ...current,
                                                                [item.label]:
                                                                    !current[
                                                                        item
                                                                            .label
                                                                    ],
                                                            }),
                                                        )
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
                                                onClick={() =>
                                                    setSortMode(option)
                                                }
                                            >
                                                {option}
                                            </Chip>
                                        ))}
                                    </div>
                                    {visibleCompanies.map((company) => (
                                        <CompanyCard
                                            company={company}
                                            detailsOpen={
                                                openCompanyDetails ===
                                                company.name
                                            }
                                            key={company.name}
                                            onChoose={() => {
                                                setSelectedCompany(
                                                    company.name,
                                                );
                                                setRequestCreated(false);
                                            }}
                                            onToggleDetails={() =>
                                                setOpenCompanyDetails(
                                                    (currentName) =>
                                                        currentName ===
                                                        company.name
                                                            ? null
                                                            : company.name,
                                                )
                                            }
                                            priceRange={[
                                                estimatedRange[0],
                                                estimatedRange[1],
                                            ]}
                                            selected={
                                                selectedCompany === company.name
                                            }
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
                                                {selectedCompanyData.name}{' '}
                                                получит заявку на{' '}
                                                {activeService.label.toLowerCase()}
                                            </h2>
                                            <p className="mt-2 text-base font-medium text-[#667085]">
                                                {leadValues['Тип работ']},
                                                город: {leadValues.Город}, срок:{' '}
                                                {leadValues.Срок}.
                                                Предварительно от{' '}
                                                {formatRoubles(
                                                    estimatedRange[0],
                                                )}{' '}
                                                до{' '}
                                                {formatRoubles(
                                                    estimatedRange[1],
                                                )}{' '}
                                                ₽.
                                            </p>
                                        </div>
                                        <button
                                            className={`min-h-12 rounded-2xl px-6 text-base font-semibold transition ${
                                                requestCreated
                                                    ? 'bg-[#eafbf2] text-[#027a48]'
                                                    : 'bg-[#247cff] text-white shadow-[0_10px_24px_rgba(36,124,255,0.28)] hover:bg-[#1768e6]'
                                            }`}
                                            onClick={() =>
                                                setRequestCreated(true)
                                            }
                                            type="button"
                                        >
                                            {requestCreated
                                                ? 'Ожидает подтверждения'
                                                : 'Оставить заявку'}
                                        </button>
                                    </div>
                                </section>
                            )}
                        </>
                    ) : (
                        <>
                            <section
                                className="mt-8 rounded-[28px] border border-[#eaecf0] bg-white p-6 shadow-[0_14px_34px_rgba(16,24,40,0.05)] sm:p-9"
                                id="contractors"
                            >
                                <h2 className="text-[30px] leading-tight font-extrabold sm:text-[34px]">
                                    Для компаний
                                </h2>
                                <p className="mt-4 max-w-[760px] text-lg leading-[1.45] font-medium text-[#667085]">
                                    Принимайте входящие заявки, подтверждайте
                                    желаемую дату, предлагайте другое время и
                                    меняйте статус заказа без сложной CRM.
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
                                                ★ {worker.rating} ·{' '}
                                                {worker.price}
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

                            <section className="mt-8 pb-14" id="how">
                                <h2 className="text-[30px] leading-tight font-extrabold sm:text-[34px]">
                                    Как работает
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
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
