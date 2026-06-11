export const MARKETPLACE_PATHS = {
    home: '/',
    searchResults: '/search-results',
    vendors: '/vendors',
    faq: '/faq',
    contacts: '/contacts',
} as const;

export type ServiceKey =
    | 'glass_replacement'
    | 'window_installation'
    | 'balcony_block'
    | 'measurement'
    | 'repair';

export type ExtraWorkKey =
    | 'dismantling'
    | 'slopes'
    | 'delivery'
    | 'mosquito'
    | 'urgent';

export type SortKey = 'price' | 'rating' | 'date';
export type PriceFilterKey = 'all' | '20000' | '35000' | '50000';

export type RequestFormState = {
    city: string;
    installationDate: string;
    width: string;
    height: string;
    serviceKey: ServiceKey;
    extraWorks: ExtraWorkKey[];
    name: string;
    phone: string;
};

export type ServiceOption = {
    key: ServiceKey;
    title: string;
    description: string;
    baseMin: number;
    baseMax: number;
};

export type ExtraWorkOption = {
    key: ExtraWorkKey;
    label: string;
    price: number;
};

export type MarketplaceCompany = {
    initials: string;
    tone: 'blue' | 'green' | 'violet';
    name: string;
    description: string;
    rating: number;
    reviews: number;
    priceMultiplier: number;
    nextAvailableDate: string;
    nextAvailableRank: number;
    districts: string[];
    guarantee: string;
    badge: string;
    feature: string;
    serviceKeys: ServiceKey[];
};

export const serviceOptions: ServiceOption[] = [
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
        title: 'Ремонт и регулировка',
        description: 'Настройка фурнитуры, продувания и закрывания.',
        baseMin: 2500,
        baseMax: 8500,
    },
];

export const extraWorkOptions: ExtraWorkOption[] = [
    { key: 'dismantling', label: 'Демонтаж старого окна', price: 3500 },
    { key: 'slopes', label: 'Откосы и подоконник', price: 6200 },
    { key: 'delivery', label: 'Доставка и подъем', price: 2800 },
    { key: 'mosquito', label: 'Москитная сетка', price: 1800 },
    { key: 'urgent', label: 'Срочный выезд', price: 4200 },
];

export const defaultRequestForm: RequestFormState = {
    city: 'Волгоград, Центральный район',
    installationDate: '',
    width: '140',
    height: '150',
    serviceKey: 'glass_replacement',
    extraWorks: ['dismantling'],
    name: '',
    phone: '',
};

// Mock data until backend search and catalog APIs are ready.
export const marketplaceCompanies: MarketplaceCompany[] = [
    {
        initials: 'ОП',
        tone: 'blue',
        name: 'ОкнаПрофи',
        description: 'Замена стеклопакетов, окна под ключ и замер в тот же день.',
        rating: 4.9,
        reviews: 231,
        priceMultiplier: 1,
        nextAvailableDate: 'сегодня после 18:00',
        nextAvailableRank: 1,
        districts: ['Центральный', 'Дзержинский', 'Ворошиловский'],
        guarantee: '5 лет',
        badge: 'дешевле рынка',
        feature: 'Бесплатный замер и фотоотчет после монтажа',
        serviceKeys: ['glass_replacement', 'window_installation', 'repair'],
    },
    {
        initials: 'ТД',
        tone: 'green',
        name: 'ТеплоДом',
        description: 'Установка окон, балконных блоков и сервисное обслуживание.',
        rating: 4.8,
        reviews: 184,
        priceMultiplier: 1.08,
        nextAvailableDate: '13 июня',
        nextAvailableRank: 2,
        districts: ['Краснооктябрьский', 'Тракторозаводский', 'Центральный'],
        guarantee: '7 лет',
        badge: 'быстрый замер',
        feature: 'Подтверждение времени в течение 2 часов',
        serviceKeys: [
            'glass_replacement',
            'window_installation',
            'balcony_block',
            'measurement',
        ],
    },
    {
        initials: 'GC',
        tone: 'violet',
        name: 'GlassCity',
        description: 'Премиальные стеклопакеты и аккуратный монтаж для квартир и домов.',
        rating: 4.7,
        reviews: 96,
        priceMultiplier: 1.16,
        nextAvailableDate: '15 июня',
        nextAvailableRank: 4,
        districts: ['Советский', 'Кировский', 'Волжский'],
        guarantee: '10 лет',
        badge: 'премиальный профиль',
        feature: 'Подбор шумоизоляции и расширенная гарантия',
        serviceKeys: ['glass_replacement', 'window_installation', 'balcony_block'],
    },
    {
        initials: 'МС',
        tone: 'blue',
        name: 'МонтажСервис',
        description: 'Ремонт фурнитуры, регулировка и небольшие монтажные задачи.',
        rating: 4.6,
        reviews: 143,
        priceMultiplier: 0.94,
        nextAvailableDate: 'завтра',
        nextAvailableRank: 1,
        districts: ['Центральный', 'Советский', 'Красноармейский'],
        guarantee: '1 год',
        badge: 'лучше для ремонта',
        feature: 'Умеют работать без полной замены рамы',
        serviceKeys: ['repair', 'measurement', 'glass_replacement'],
    },
];

export const homepageSteps = [
    {
        title: 'Заполните параметры',
        text: 'Укажите район, размеры окна, дату и нужную услугу без долгих звонков по компаниям.',
    },
    {
        title: 'Сравните предложения',
        text: 'Сервис показывает компании, сроки, рейтинг, диапазон цен и удобные районы работы.',
    },
    {
        title: 'Выберите исполнителя',
        text: 'Компания связывается уже по конкретной заявке, а история обращения остается в кабинете.',
    },
];

export const homepageBenefits = [
    'Не нужно обзванивать компании и объяснять одно и то же.',
    'Можно заранее увидеть примерный диапазон цены.',
    'Удобно выбрать желаемую дату монтажа или замера.',
    'Компании видно по рейтингу, районам и услугам.',
    'Заявки и статусы сохраняются в личном кабинете.',
];

export const vendorBenefits = [
    'Новые заявки без хаотичного лидогенератора и мусорных обращений.',
    'Управление районами работы, услугами, ценами и доступными датами.',
    'Личный кабинет для обработки заявок и контроля статусов.',
    'Прозрачная модерация компаний и понятный профиль для клиента.',
    'Возможность показать гарантию, фото работ и специализацию команды.',
    'Сценарий подходит и для установки, и для ремонта стеклопакетов.',
];

export const vendorSteps = [
    {
        title: 'Регистрация компании',
        text: 'Оставляете заявку на подключение и создаете профиль компании.',
    },
    {
        title: 'Заполнение услуг',
        text: 'Добавляете районы работы, базовые цены, описание и фото выполненных заказов.',
    },
    {
        title: 'Модерация',
        text: 'Сервис проверяет профиль и открывает прием заявок после подтверждения.',
    },
    {
        title: 'Работа с лидами',
        text: 'Новые заявки появляются в кабинете: можно принять, отклонить или предложить другое время.',
    },
];

export const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'price', label: 'Дешевле' },
    { key: 'date', label: 'Быстрее' },
    { key: 'rating', label: 'Выше рейтинг' },
];

export const priceFilterOptions: { key: PriceFilterKey; label: string }[] = [
    { key: 'all', label: 'Любая цена' },
    { key: '20000', label: 'до 20 000 ₽' },
    { key: '35000', label: 'до 35 000 ₽' },
    { key: '50000', label: 'до 50 000 ₽' },
];

export function formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ₽`;
}

export function getServiceByKey(serviceKey: ServiceKey): ServiceOption {
    return (
        serviceOptions.find((service) => service.key === serviceKey) ??
        serviceOptions[0]
    );
}

export function buildEstimate(form: RequestFormState): [number, number] {
    const width = clamp(Number(form.width) || 0, 50, 340);
    const height = clamp(Number(form.height) || 0, 50, 300);
    const service = getServiceByKey(form.serviceKey);
    const areaFactor = clamp((width * height) / (140 * 150), 0.7, 1.85);
    const extraCost = form.extraWorks.reduce((total, extraKey) => {
        return (
            total +
            (extraWorkOptions.find((extra) => extra.key === extraKey)?.price ?? 0)
        );
    }, 0);

    return [
        Math.round(service.baseMin * areaFactor + extraCost),
        Math.round(service.baseMax * areaFactor + extraCost),
    ];
}

export function getServiceLabel(serviceKey: ServiceKey): string {
    return getServiceByKey(serviceKey).title;
}

export function getExtraWorkLabels(extraWorks: ExtraWorkKey[]): string[] {
    return extraWorkOptions
        .filter((option) => extraWorks.includes(option.key))
        .map((option) => option.label);
}

export function buildSearchParams(form: RequestFormState): Record<string, string> {
    return {
        city: form.city,
        installationDate: form.installationDate,
        width: form.width,
        height: form.height,
        serviceKey: form.serviceKey,
        extraWorks: form.extraWorks.join(','),
        name: form.name,
        phone: form.phone,
    };
}

export function parseSearchState(url: string): RequestFormState {
    const search = new URL(url, 'https://oknamarket.local').searchParams;
    const serviceKey = search.get('serviceKey');

    return {
        city: search.get('city') || defaultRequestForm.city,
        installationDate:
            search.get('installationDate') || defaultRequestForm.installationDate,
        width: search.get('width') || defaultRequestForm.width,
        height: search.get('height') || defaultRequestForm.height,
        serviceKey: isServiceKey(serviceKey)
            ? serviceKey
            : defaultRequestForm.serviceKey,
        extraWorks: parseExtraWorks(search.get('extraWorks')),
        name: search.get('name') || defaultRequestForm.name,
        phone: search.get('phone') || defaultRequestForm.phone,
    };
}

function isServiceKey(value: string | null): value is ServiceKey {
    return serviceOptions.some((service) => service.key === value);
}

function parseExtraWorks(value: string | null): ExtraWorkKey[] {
    if (!value) {
        return defaultRequestForm.extraWorks;
    }

    return value
        .split(',')
        .filter((item): item is ExtraWorkKey =>
            extraWorkOptions.some((option) => option.key === item),
        );
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
