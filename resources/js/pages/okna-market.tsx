import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    FaqAccordion,
    homepageFaqItems,
} from '@/components/okna-market/faq-accordion';
import { MarketShell } from '@/components/okna-market/market-shell';
import { searchResults } from '@/routes';
import '../../css/okna-market.css';

type ServiceKey =
    | 'glass_replacement'
    | 'window_installation'
    | 'balcony_block'
    | 'measurement'
    | 'repair';

type WindowTypeKey = 'single' | 'double' | 'triple' | 'balcony';
type UrgencyKey = 'flexible' | 'week' | 'urgent';
type SortKey = 'price' | 'rating' | 'date';
type FilterKey = 'highRating' | 'manyReviews' | 'hasPhotos' | 'fastDate';
type CatalogDemoFocus = 'price' | 'rating' | 'deadline' | 'sort' | 'company';

type Service = {
    key: ServiceKey;
    title: string;
    description: string;
    baseMin: number;
    baseMax: number;
};

type WindowType = {
    key: WindowTypeKey;
    title: string;
    factor: number;
};

type Urgency = {
    key: UrgencyKey;
    title: string;
    factor: number;
};

type Company = {
    initials: string;
    tone: 'blue' | 'green' | 'violet';
    name: string;
    description: string;
    rating: number;
    reviews: number;
    orders: number;
    multiplier: number;
    nextDate: string;
    nextDateRank: number;
    guarantee: string;
    districts: string;
    badge: string;
    feature: string;
    hasPhotos: boolean;
};

type CatalogDemoStep = {
    key: string;
    text: string;
    focus: CatalogDemoFocus;
    filters: Record<FilterKey, boolean>;
    priceFill: [number, number];
    priceScale: number;
    selectedCompany: string;
    sortKey: SortKey;
    touchedFilter?: FilterKey | 'urgent' | 'week';
    urgencyKey: UrgencyKey;
};

const services: Service[] = [
    {
        key: 'glass_replacement',
        title: 'Замена стеклопакета',
        description: 'Трещины, запотевание или потеря тепла без замены рамы.',
        baseMin: 6500,
        baseMax: 14500,
    },
    {
        key: 'window_installation',
        title: 'Установка окна',
        description: 'Новое окно, демонтаж старого блока и монтаж.',
        baseMin: 18000,
        baseMax: 36000,
    },
    {
        key: 'balcony_block',
        title: 'Балконный блок',
        description: 'Окно и дверь на балкон с подготовкой проема.',
        baseMin: 38000,
        baseMax: 76000,
    },
    {
        key: 'measurement',
        title: 'Замер',
        description: 'Выезд замерщика и уточнение точной сметы.',
        baseMin: 0,
        baseMax: 1500,
    },
    {
        key: 'repair',
        title: 'Ремонт/регулировка',
        description: 'Настройка фурнитуры, продувания и закрывания.',
        baseMin: 2500,
        baseMax: 8500,
    },
];

const windowTypes: WindowType[] = [
    { key: 'single', title: 'Одностворчатое', factor: 0.9 },
    { key: 'double', title: 'Двухстворчатое', factor: 1 },
    { key: 'triple', title: 'Трехстворчатое', factor: 1.18 },
    { key: 'balcony', title: 'Балконный блок', factor: 1.42 },
];

const urgencyOptions: Urgency[] = [
    { key: 'flexible', title: 'Гибкая дата', factor: 0.96 },
    { key: 'week', title: 'На этой неделе', factor: 1 },
    { key: 'urgent', title: 'Сегодня/завтра', factor: 1.15 },
];

const companies: Company[] = [
    {
        initials: 'ОП',
        tone: 'blue',
        name: 'ОкнаПрофи',
        description: 'Стеклопакеты, окна и балконные блоки',
        rating: 4.9,
        reviews: 231,
        orders: 231,
        multiplier: 1,
        nextDate: 'завтра',
        nextDateRank: 1,
        guarantee: '5 лет',
        districts: 'Центр, Дзержинский, Ворошиловский',
        badge: 'дешевле рынка',
        feature: 'Выезд замерщика: бесплатно',
        hasPhotos: true,
    },
    {
        initials: 'ТД',
        tone: 'green',
        name: 'ТеплоДом',
        description: 'Пластиковые окна и регулировка',
        rating: 4.8,
        reviews: 184,
        orders: 184,
        multiplier: 1.08,
        nextDate: '13 июня',
        nextDateRank: 2,
        guarantee: '7 лет',
        districts: 'Краснооктябрьский, Тракторозаводский',
        badge: 'быстрый замер',
        feature: 'Подтверждение даты: до 2 часов',
        hasPhotos: true,
    },
    {
        initials: 'GC',
        tone: 'violet',
        name: 'GlassCity',
        description: 'Премиальные профили и монтаж',
        rating: 4.7,
        reviews: 96,
        orders: 96,
        multiplier: 1.16,
        nextDate: '15 июня',
        nextDateRank: 4,
        guarantee: '10 лет',
        districts: 'Волгоград и Волжский',
        badge: 'есть фото работ',
        feature: 'Выезд замерщика: 1000 ₽',
        hasPhotos: true,
    },
];

const problems = [
    {
        icon: '☎',
        problem: 'Оставил заявку - звонят 10 компаний.',
        solution:
            'Предложения остаются в сервисе. Телефон получает только выбранная компания.',
    },
    {
        icon: '≋',
        problem: 'Одна цена без откосов, другая с монтажом, третья примерная.',
        solution:
            'Карточки сравниваются по одной логике: цена, дата, гарантия и район.',
    },
    {
        icon: '₽',
        problem: 'Непонятно, почему цена выросла после замера.',
        solution:
            'Сервис сразу показывает диапазон и предупреждает, что точная цена после замера.',
    },
    {
        icon: '★',
        problem: 'Сложно понять, кому можно доверять.',
        solution:
            'Видны рейтинг, отзывы, выполненные заказы, фото работ и гарантия.',
    },
];

const trustItems = [
    {
        number: '01',
        title: 'Профиль компании проходит проверку',
        text: 'В подбор попадают компании, которые прошли модерацию и заполнили услуги, районы работы и контакты.',
    },
    {
        number: '02',
        title: 'Цена остается предварительной',
        text: 'Сервис показывает понятный диапазон, а не обещает финальную смету. Точная стоимость фиксируется после замера и согласования работ.',
    },
    {
        number: '03',
        title: 'Телефон не уходит всем подряд',
        text: 'Контакт получает только выбранная компания после заявки. Остальные предложения можно спокойно сравнить без массовых звонков.',
    },
    {
        number: '04',
        title: 'Гарантия привязана к заявке',
        text: 'Документы по выполненной работе хранятся рядом с заявкой, чтобы условия и контакты компании не потерялись.',
    },
];

const steps = [
    {
        title: 'Укажите задачу',
        text: 'Выберите услугу, примерные размеры и оставьте телефон для связи.',
    },
    {
        title: 'Сравните варианты',
        text: 'Цена, рейтинг, дата, район работы и гарантия в одном списке.',
    },
    {
        title: 'Выберите компанию',
        text: 'Оставьте заявку и дождитесь подтверждения или другого времени.',
    },
];

const priceFactors = [
    {
        icon: '↔',
        title: 'Размер и количество створок',
        text: 'Чем больше окно и больше створок, тем больше материалов и сложнее работа.',
    },
    {
        icon: '▣',
        title: 'Профиль и стеклопакет',
        text: 'Тепло- и шумоизоляция влияют на предварительную стоимость.',
    },
    {
        icon: '⚙',
        title: 'Фурнитура',
        text: 'Тип и состояние фурнитуры уточняются при осмотре.',
    },
    {
        icon: '⌂',
        title: 'Демонтаж старого окна',
        text: 'Сложность демонтажа может изменить итоговую смету.',
    },
    {
        icon: '▤',
        title: 'Откосы и подоконники',
        text: 'Отделка и дополнительные элементы считаются отдельно.',
    },
    {
        icon: '↑',
        title: 'Доставка и подъем',
        text: 'Удаленность и подъем без лифта могут повлиять на цену.',
    },
    {
        icon: '⌖',
        title: 'Район и удаленность',
        text: 'Компания учитывает логистику и ближайшее свободное время.',
    },
];

const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'price', label: 'Самые дешевые' },
    { key: 'rating', label: 'Высокий рейтинг' },
    { key: 'date', label: 'Быстрый монтаж' },
];

const filterOptions: { key: FilterKey; label: string }[] = [
    { key: 'highRating', label: 'от 4.7 и выше' },
    { key: 'manyReviews', label: 'много отзывов' },
    { key: 'hasPhotos', label: 'есть фото работ' },
    { key: 'fastDate', label: 'до 3 дней' },
];

const catalogDemoSteps: CatalogDemoStep[] = [
    {
        key: 'price-range',
        text: 'клиент сужает диапазон цены и видит более компактную выдачу.',
        focus: 'price',
        filters: {
            highRating: true,
            manyReviews: false,
            hasPhotos: true,
            fastDate: true,
        },
        priceFill: [12, 58],
        priceScale: 0.92,
        selectedCompany: 'ОкнаПрофи',
        sortKey: 'price',
        urgencyKey: 'week',
    },
    {
        key: 'deadline-urgent',
        text: 'затем включает срочный выезд сегодня или завтра.',
        focus: 'deadline',
        filters: {
            highRating: true,
            manyReviews: false,
            hasPhotos: true,
            fastDate: true,
        },
        priceFill: [28, 82],
        priceScale: 1.12,
        selectedCompany: 'ТеплоДом',
        sortKey: 'date',
        touchedFilter: 'urgent',
        urgencyKey: 'urgent',
    },
    {
        key: 'deadline-week',
        text: 'после этого меняет сроки на монтаж в течение недели.',
        focus: 'deadline',
        filters: {
            highRating: true,
            manyReviews: false,
            hasPhotos: true,
            fastDate: false,
        },
        priceFill: [18, 72],
        priceScale: 1,
        selectedCompany: 'ОкнаПрофи',
        sortKey: 'price',
        touchedFilter: 'week',
        urgencyKey: 'week',
    },
    {
        key: 'rating-filter',
        text: 'дальше оставляет только компании с высоким рейтингом и отзывами.',
        focus: 'rating',
        filters: {
            highRating: true,
            manyReviews: true,
            hasPhotos: true,
            fastDate: false,
        },
        priceFill: [20, 76],
        priceScale: 1.04,
        selectedCompany: 'ТеплоДом',
        sortKey: 'rating',
        touchedFilter: 'manyReviews',
        urgencyKey: 'week',
    },
    {
        key: 'sort-rating',
        text: 'потом сортирует предложения по рейтингу.',
        focus: 'sort',
        filters: {
            highRating: true,
            manyReviews: false,
            hasPhotos: true,
            fastDate: false,
        },
        priceFill: [20, 76],
        priceScale: 1.04,
        selectedCompany: 'ОкнаПрофи',
        sortKey: 'rating',
        urgencyKey: 'week',
    },
    {
        key: 'sort-date',
        text: 'и сравнивает, кто сможет приехать быстрее.',
        focus: 'sort',
        filters: {
            highRating: true,
            manyReviews: false,
            hasPhotos: true,
            fastDate: true,
        },
        priceFill: [24, 80],
        priceScale: 1.08,
        selectedCompany: 'ОкнаПрофи',
        sortKey: 'date',
        urgencyKey: 'urgent',
    },
    {
        key: 'company-choice',
        text: 'в финале подсвечивается выбранная карточка компании.',
        focus: 'company',
        filters: {
            highRating: true,
            manyReviews: false,
            hasPhotos: true,
            fastDate: true,
        },
        priceFill: [16, 66],
        priceScale: 1,
        selectedCompany: 'ОкнаПрофи',
        sortKey: 'price',
        urgencyKey: 'week',
    },
];

function formatRoubles(value: number): string {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value / 100) * 100);
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function getServiceByKey(serviceKey: ServiceKey): Service {
    return (
        services.find((service) => service.key === serviceKey) ?? services[0]
    );
}

function getWindowTypeByKey(windowTypeKey: WindowTypeKey): WindowType {
    return (
        windowTypes.find((windowType) => windowType.key === windowTypeKey) ??
        windowTypes[1]
    );
}

function getUrgencyByKey(urgencyKey: UrgencyKey): Urgency {
    return (
        urgencyOptions.find((urgency) => urgency.key === urgencyKey) ??
        urgencyOptions[1]
    );
}

export default function OknaMarket() {
    const [serviceKey, setServiceKey] =
        useState<ServiceKey>('glass_replacement');
    const [windowTypeKey, setWindowTypeKey] = useState<WindowTypeKey>('double');
    const urgencyKey: UrgencyKey = 'week';
    const [width, setWidth] = useState(130);
    const [height, setHeight] = useState(140);
    const activeDemoStep = catalogDemoSteps[0];
    const filters = activeDemoStep.filters;
    const sortKey = activeDemoStep.sortKey;
    const selectedCompany = activeDemoStep.selectedCompany;

    const activeService = getServiceByKey(serviceKey);
    const activeWindowType = getWindowTypeByKey(windowTypeKey);
    const activeUrgency = getUrgencyByKey(urgencyKey);
    const estimatedRange = useMemo<[number, number]>(() => {
        const area = clamp(width, 40, 320) * clamp(height, 40, 260);
        const areaFactor = clamp(area / (130 * 140), 0.72, 1.75);
        const factor =
            areaFactor * activeWindowType.factor * activeUrgency.factor;

        return [activeService.baseMin * factor, activeService.baseMax * factor];
    }, [activeService, activeUrgency, activeWindowType, height, width]);

    const visibleCompanies = useMemo(() => {
        return companies
            .filter((company) => {
                if (filters.highRating && company.rating < 4.7) {
                    return false;
                }

                if (filters.manyReviews && company.reviews < 150) {
                    return false;
                }

                if (filters.hasPhotos && !company.hasPhotos) {
                    return false;
                }

                if (filters.fastDate && company.nextDateRank > 3) {
                    return false;
                }

                return true;
            })
            .sort((firstCompany, secondCompany) => {
                if (sortKey === 'rating') {
                    return secondCompany.rating - firstCompany.rating;
                }

                if (sortKey === 'date') {
                    return (
                        firstCompany.nextDateRank - secondCompany.nextDateRank
                    );
                }

                return firstCompany.multiplier - secondCompany.multiplier;
            });
    }, [filters, sortKey]);

    const selectedCompanyData =
        companies.find((company) => company.name === selectedCompany) ??
        companies[0];

    const catalogEstimatedRange: [number, number] = [6500, 14500];

    const submitSearchRequest = () => {
        router.get(searchResults.url(), {
            city: 'Волгоград',
            width: String(width),
            height: String(height),
            serviceKey,
            extraWorks: 'dismantling',
        });
    };

    return (
        <>
            <Head>
                <title>ОкнаМаркет — сравнение оконных компаний</title>
                <meta
                    content="Сервис подбора компаний для установки, замены и ремонта стеклопакетов с предварительным расчетом цены, выбором компании, статусом заявки и гарантией."
                    name="description"
                />
            </Head>

            <MarketShell activePage="home">
                <section className="hero" id="request">
                    <div className="hero-inner container">
                        <div className="hero-copy">
                            <span className="eyebrow">
                                Сравнение оконных компаний за 2 минуты
                            </span>
                            <h1>
                                Сравните предложения на окна по одной заявке{' '}
                                <span>- без спама и лишних звонков</span>
                            </h1>
                        </div>

                        <form
                            action="#"
                            className="request-card"
                            method="get"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitSearchRequest();
                            }}
                        >
                            <div className="request-heading">
                                <div>
                                    <h2>Что нужно установить?</h2>
                                    <p>
                                        Предварительно: от{' '}
                                        {formatRoubles(estimatedRange[0])} до{' '}
                                        {formatRoubles(estimatedRange[1])} ₽
                                    </p>
                                </div>
                                <span>Точная цена после замера.</span>
                            </div>

                            <div
                                aria-label="Тип услуги"
                                className="service-chips"
                                role="list"
                            >
                                {services.map((service) => {
                                    const isActive = service.key === serviceKey;

                                    return (
                                        <button
                                            aria-pressed={isActive}
                                            className={`chip ${isActive ? 'active' : ''}`}
                                            key={service.key}
                                            onClick={() => {
                                                setServiceKey(service.key);
                                            }}
                                            type="button"
                                        >
                                            {service.title}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="form-grid form-grid-mvp">
                                <label className="field-card">
                                    <span className="field-icon">⌖</span>
                                    <span className="field-label">Город</span>
                                    <input
                                        name="city"
                                        readOnly
                                        value="Волгоград"
                                    />
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">▣</span>
                                    <span className="field-label">
                                        Тип окна
                                    </span>
                                    <select
                                        name="window_type"
                                        onChange={(event) => {
                                            setWindowTypeKey(
                                                event.target
                                                    .value as WindowTypeKey,
                                            );
                                        }}
                                        value={windowTypeKey}
                                    >
                                        {windowTypes.map((windowType) => (
                                            <option
                                                key={windowType.key}
                                                value={windowType.key}
                                            >
                                                {windowType.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">↔</span>
                                    <span className="field-label">
                                        Ширина, см
                                    </span>
                                    <input
                                        max={320}
                                        min={40}
                                        name="width"
                                        onChange={(event) => {
                                            setWidth(
                                                Number(event.target.value),
                                            );
                                        }}
                                        type="number"
                                        value={width}
                                    />
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">↕</span>
                                    <span className="field-label">
                                        Высота, см
                                    </span>
                                    <input
                                        max={260}
                                        min={40}
                                        name="height"
                                        onChange={(event) => {
                                            setHeight(
                                                Number(event.target.value),
                                            );
                                        }}
                                        type="number"
                                        value={height}
                                    />
                                </label>

                                <button
                                    className="btn btn-accent"
                                    type="submit"
                                >
                                    Найти компании
                                </button>
                            </div>
                        </form>

                        <div
                            aria-label="Возможности сервиса"
                            className="metrics"
                        >
                            <div className="metric-card">
                                <strong>1</strong>
                                <span>заявка вместо обзвона</span>
                            </div>
                            <div className="metric-card">
                                <strong>5</strong>
                                <span>основных видов услуг</span>
                            </div>
                            <div className="metric-card">
                                <strong>Весь путь</strong>
                                <span>сохраняется в кабинете</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="problems-section">
                    <div className="container">
                        <div className="problems-header">
                            <h2>
                                Типичные сложности с окнами - и как сервис их
                                убирает
                            </h2>
                            <p>
                                Вместо хаотичных звонков и разных условий вы
                                сразу видите подходящие услуги, районы работы и
                                предварительную цену.
                            </p>
                        </div>

                        <div className="problem-grid">
                            {problems.map((item, index) => (
                                <article
                                    className="problem-card"
                                    key={item.problem}
                                >
                                    <div className="problem-card-top">
                                        <div
                                            aria-hidden="true"
                                            className="problem-icon"
                                        >
                                            {item.icon}
                                        </div>
                                        <span className="problem-number">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <div className="problem-copy">
                                        <span className="card-label">
                                            Проблема
                                        </span>
                                        <h3>{item.problem}</h3>
                                    </div>

                                    <div className="solution-copy">
                                        <span className="card-label">
                                            Решение
                                        </span>
                                        <p>{item.solution}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="trust-section">
                    <div className="container">
                        <div className="problems-header">
                            <h2>Почему сервису можно доверять</h2>
                            <p>
                                Важные условия показываются до заявки:
                                пользователь понимает, что цена предварительная,
                                контакт получает выбранная компания, а история
                                обращения сохраняется в кабинете.
                            </p>
                        </div>

                        <div className="trust-grid">
                            {trustItems.map((item) => (
                                <article
                                    className="trust-card"
                                    key={item.title}
                                >
                                    <span>{item.number}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="catalog-section" id="companies">
                    <div className="container">
                        <div className="problems-header">
                            <span className="eyebrow">Как выглядит подбор</span>
                            <h2>
                                Компании сравниваются по одинаковым параметрам
                            </h2>
                            <p>
                                Один фиксированный сценарий показывает, как
                                клиент увидит цену, срок, районы и условия
                                разных компаний. Он не меняет параметры формы
                                выше.
                            </p>
                        </div>

                        <div
                            className={`catalog-layout catalog-demo-layout demo-step-${activeDemoStep.key}`}
                        >
                            <aside
                                aria-label="Фильтры компаний"
                                className="filters-card"
                            >
                                <h3>Параметры подбора</h3>
                                <p className="filters-caption">
                                    Замена стеклопакета · Волгоград · на этой
                                    неделе
                                </p>

                                <div
                                    className={`filter-group ${
                                        activeDemoStep.focus === 'price'
                                            ? 'demo-focus'
                                            : ''
                                    }`}
                                >
                                    <h4>Цена</h4>
                                    <div
                                        className={`price-range demo-price-range ${
                                            activeDemoStep.focus === 'price'
                                                ? 'demo-touched'
                                                : ''
                                        }`}
                                    >
                                        <span className="price-range-value">
                                            <small>от</small>
                                            <strong>
                                                {formatRoubles(
                                                    catalogEstimatedRange[0],
                                                )}{' '}
                                                ₽
                                            </strong>
                                        </span>
                                        <span className="price-range-line">
                                            <i
                                                style={{
                                                    left: `${activeDemoStep.priceFill[0]}%`,
                                                    width: `${
                                                        activeDemoStep
                                                            .priceFill[1] -
                                                        activeDemoStep
                                                            .priceFill[0]
                                                    }%`,
                                                }}
                                            />
                                        </span>
                                        <span className="price-range-value">
                                            <small>до</small>
                                            <strong>
                                                {formatRoubles(
                                                    catalogEstimatedRange[1],
                                                )}{' '}
                                                ₽
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={`filter-group ${
                                        activeDemoStep.focus === 'rating'
                                            ? 'demo-focus'
                                            : ''
                                    }`}
                                >
                                    <h4>Рейтинг компании</h4>
                                    {filterOptions.slice(0, 3).map((filter) => (
                                        <label
                                            className={`checkbox-row ${
                                                activeDemoStep.touchedFilter ===
                                                filter.key
                                                    ? 'demo-touched'
                                                    : ''
                                            }`}
                                            key={filter.key}
                                        >
                                            <input
                                                checked={filters[filter.key]}
                                                readOnly
                                                type="checkbox"
                                            />
                                            {filter.label}
                                        </label>
                                    ))}
                                </div>

                                <div
                                    className={`filter-group ${
                                        activeDemoStep.focus === 'deadline'
                                            ? 'demo-focus'
                                            : ''
                                    }`}
                                >
                                    <h4>Сроки</h4>
                                    <label
                                        className={`checkbox-row ${
                                            activeDemoStep.touchedFilter ===
                                            'urgent'
                                                ? 'demo-touched'
                                                : ''
                                        }`}
                                    >
                                        <input
                                            checked={
                                                activeDemoStep.urgencyKey ===
                                                'urgent'
                                            }
                                            readOnly
                                            type="checkbox"
                                        />
                                        сегодня/завтра
                                    </label>
                                    <label
                                        className={`checkbox-row ${
                                            activeDemoStep.touchedFilter ===
                                            'fastDate'
                                                ? 'demo-touched'
                                                : ''
                                        }`}
                                    >
                                        <input
                                            checked={filters.fastDate}
                                            readOnly
                                            type="checkbox"
                                        />
                                        до 3 дней
                                    </label>
                                    <label
                                        className={`checkbox-row ${
                                            activeDemoStep.touchedFilter ===
                                            'week'
                                                ? 'demo-touched'
                                                : ''
                                        }`}
                                    >
                                        <input
                                            checked={
                                                activeDemoStep.urgencyKey ===
                                                'week'
                                            }
                                            readOnly
                                            type="checkbox"
                                        />
                                        на этой неделе
                                    </label>
                                </div>

                                <p className="filters-caption">
                                    Фильтры зафиксированы, чтобы результат было
                                    удобно рассмотреть.
                                </p>
                            </aside>

                            <div className="catalog-content">
                                <div
                                    className={`sort-panel ${
                                        activeDemoStep.focus === 'sort'
                                            ? 'demo-focus'
                                            : ''
                                    }`}
                                >
                                    <span>Сортировать:</span>
                                    {sortOptions.map((option) => (
                                        <span
                                            className={`sort-chip ${
                                                sortKey === option.key
                                                    ? 'active'
                                                    : ''
                                            } ${
                                                activeDemoStep.focus ===
                                                    'sort' &&
                                                sortKey === option.key
                                                    ? 'demo-touched'
                                                    : ''
                                            }`}
                                            key={option.key}
                                        >
                                            {option.label}
                                        </span>
                                    ))}
                                </div>

                                {visibleCompanies.map((company) => {
                                    const priceMin =
                                        catalogEstimatedRange[0] *
                                        company.multiplier;
                                    const priceMax =
                                        catalogEstimatedRange[1] *
                                        company.multiplier;
                                    const isSelected =
                                        selectedCompany === company.name;
                                    const companyCardClass = [
                                        'company-card',
                                        isSelected ? 'selected' : '',
                                        activeDemoStep.focus === 'company' &&
                                        isSelected
                                            ? 'demo-focus-card'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ');

                                    return (
                                        <article
                                            className={companyCardClass}
                                            key={company.name}
                                        >
                                            <div
                                                className={`company-logo ${company.tone}`}
                                            >
                                                {company.initials}
                                            </div>
                                            <div className="company-info">
                                                <h3>{company.name}</h3>
                                                <p>{company.description}</p>
                                                <div className="company-tags">
                                                    <span className="rating-tag">
                                                        ★{' '}
                                                        {company.rating.toFixed(
                                                            1,
                                                        )}{' '}
                                                        / {company.reviews}{' '}
                                                        отзывов
                                                    </span>
                                                    <span className="green-tag">
                                                        {company.badge}
                                                    </span>
                                                </div>
                                                <ul className="company-features">
                                                    <li>
                                                        Дата: {company.nextDate}
                                                    </li>
                                                    <li>
                                                        Гарантия:{' '}
                                                        {company.guarantee}
                                                    </li>
                                                    <li>
                                                        Заказов:{' '}
                                                        {company.orders}
                                                    </li>
                                                    <li>{company.feature}</li>
                                                </ul>
                                                <p className="details-line">
                                                    {company.districts}
                                                </p>
                                            </div>
                                            <div className="company-action">
                                                <span>Ориентир по заявке</span>
                                                <strong>
                                                    {formatRoubles(priceMin)}-
                                                    {formatRoubles(priceMax)} ₽
                                                </strong>
                                                <span
                                                    className={`selection-label ${
                                                        isSelected
                                                            ? 'is-selected'
                                                            : ''
                                                    }`}
                                                >
                                                    {isSelected
                                                        ? 'Выбор клиента'
                                                        : 'Подходит по условиям'}
                                                </span>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="steps-section" id="how-it-works">
                    <div className="steps-grid container">
                        {steps.map((step, index) => (
                            <article
                                className="step-card problem-card"
                                key={step.title}
                            >
                                <span>{index + 1}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="price-section">
                    <div className="container">
                        <h2>Почему цена на окна может отличаться</h2>

                        <div className="price-grid">
                            {priceFactors.map((factor) => (
                                <article
                                    className="price-card"
                                    key={factor.title}
                                >
                                    <div className="price-icon">
                                        {factor.icon}
                                    </div>
                                    <h3>{factor.title}</h3>
                                    <p>{factor.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="guarantee-section">
                    <div className="guarantee-box container">
                        <div>
                            <span className="faq-kicker">
                                Гарантия после выполнения
                            </span>
                            <h2>
                                Гарантия появляется в кабинете, когда заказ
                                выполнен
                            </h2>
                            <p>
                                После статуса "выполнена" сервис показывает
                                связанную заявку, компанию, дату начала, дату
                                окончания и условия гарантийных работ.
                            </p>
                        </div>
                        <div className="guarantee-card">
                            <strong>Гарантийный талон</strong>
                            <span>Компания: {selectedCompanyData.name}</span>
                            <span>Срок: {selectedCompanyData.guarantee}</span>
                            <span>Условия фиксируются после работ</span>
                        </div>
                    </div>
                </section>

                <section className="faq-section" id="faq">
                    <div className="narrow container">
                        <span className="faq-kicker">FAQ</span>
                        <h2>Часто задаваемые вопросы</h2>
                        <FaqAccordion items={homepageFaqItems} />
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
