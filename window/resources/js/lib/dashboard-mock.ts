export type RequestStatus =
    | 'new'
    | 'awaiting_confirmation'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export type ClientRequest = {
    id: string;
    createdAt: string;
    city: string;
    district: string;
    address: string;
    installationDate: string;
    width: number;
    height: number;
    service: string;
    extras: string[];
    comment: string;
    status: RequestStatus;
    company: string | null;
    estimatedPrice: string;
    history: Array<{
        label: string;
        timestamp: string;
        note: string;
    }>;
};

export type VendorLead = {
    id: string;
    createdAt: string;
    district: string;
    city: string;
    installationDate: string;
    width: number;
    height: number;
    service: string;
    extras: string[];
    comment: string;
    estimatedPrice: string;
    status: RequestStatus;
};

export type VendorService = {
    id: string;
    name: string;
    basePrice: string;
    pricingType: 'fixed' | 'sqm';
    description: string;
    isActive: boolean;
};

export type VendorProfile = {
    companyName: string;
    description: string;
    phone: string;
    email: string;
    city: string;
    districts: string[];
    moderationStatus: 'pending' | 'approved' | 'rejected';
    moderationNote: string;
    logo: string;
    gallery: string[];
};

export type AdminCompanyModeration = {
    id: string;
    companyName: string;
    city: string;
    contactName: string;
    phone: string;
    status: VendorProfile['moderationStatus'];
    submittedAt: string;
    note: string;
};

export const clientRequests: ClientRequest[] = [
    {
        id: 'REQ-1042',
        createdAt: '14 июня, 09:20',
        city: 'Волгоград',
        district: 'Центральный',
        address: 'ул. Пархоменко, 18',
        installationDate: '17 июня',
        width: 140,
        height: 150,
        service: 'Замена стеклопакета',
        extras: ['Демонтаж старого окна', 'Доставка и подъем'],
        comment: 'Квартира на 6 этаже, лифт работает.',
        status: 'awaiting_confirmation',
        company: 'ОкнаПрофи',
        estimatedPrice: '18 400 - 24 900 ₽',
        history: [
            {
                label: 'Заявка создана',
                timestamp: '14 июня, 09:20',
                note: 'Параметры сохранены в кабинете клиента.',
            },
            {
                label: 'Компания выбрана',
                timestamp: '14 июня, 09:36',
                note: 'ОкнаПрофи получила контакт для подтверждения даты.',
            },
        ],
    },
    {
        id: 'REQ-1031',
        createdAt: '11 июня, 15:45',
        city: 'Волгоград',
        district: 'Дзержинский',
        address: 'ул. Космонавтов, 44',
        installationDate: '12 июня',
        width: 120,
        height: 140,
        service: 'Регулировка и ремонт',
        extras: ['Срочный выезд'],
        comment: 'Сильно дует из створки, нужна диагностика.',
        status: 'completed',
        company: 'МонтажСервис',
        estimatedPrice: '4 800 - 7 200 ₽',
        history: [
            {
                label: 'Заявка создана',
                timestamp: '11 июня, 15:45',
                note: 'Клиент отправил параметры ремонта.',
            },
            {
                label: 'В работе',
                timestamp: '12 июня, 10:00',
                note: 'Мастер выехал на адрес.',
            },
            {
                label: 'Выполнена',
                timestamp: '12 июня, 14:30',
                note: 'Гарантия на работы доступна в карточке заказа.',
            },
        ],
    },
];

export const vendorLeads: VendorLead[] = [
    {
        id: 'REQ-1042',
        createdAt: '14 июня, 09:20',
        district: 'Центральный',
        city: 'Волгоград',
        installationDate: '17 июня',
        width: 140,
        height: 150,
        service: 'Замена стеклопакета',
        extras: ['Демонтаж старого окна', 'Доставка и подъем'],
        comment: 'Квартира на 6 этаже, лифт работает.',
        estimatedPrice: '18 400 - 24 900 ₽',
        status: 'new',
    },
    {
        id: 'REQ-1041',
        createdAt: '14 июня, 08:10',
        district: 'Ворошиловский',
        city: 'Волгоград',
        installationDate: '16 июня',
        width: 160,
        height: 145,
        service: 'Установка окна',
        extras: ['Откосы и подоконник'],
        comment: 'Нужно заменить старый блок целиком.',
        estimatedPrice: '31 000 - 43 500 ₽',
        status: 'confirmed',
    },
    {
        id: 'REQ-1038',
        createdAt: '13 июня, 17:25',
        district: 'Дзержинский',
        city: 'Волгоград',
        installationDate: '15 июня',
        width: 118,
        height: 138,
        service: 'Регулировка и ремонт',
        extras: ['Срочный выезд'],
        comment: 'Створка цепляет раму, нужен быстрый выезд.',
        estimatedPrice: '5 000 - 7 000 ₽',
        status: 'in_progress',
    },
];

export const vendorServices: VendorService[] = [
    {
        id: 'SRV-1',
        name: 'Замена стеклопакета',
        basePrice: 'от 6 500 ₽',
        pricingType: 'fixed',
        description: 'Базовая цена без учета подъема и демонтажа.',
        isActive: true,
    },
    {
        id: 'SRV-2',
        name: 'Установка окна',
        basePrice: 'от 12 500 ₽ / м²',
        pricingType: 'sqm',
        description: 'Монтаж нового блока с выездом на замер.',
        isActive: true,
    },
    {
        id: 'SRV-3',
        name: 'Регулировка и ремонт',
        basePrice: 'от 2 500 ₽',
        pricingType: 'fixed',
        description: 'Настройка фурнитуры и устранение продуваний.',
        isActive: false,
    },
];

export const vendorProfile: VendorProfile = {
    companyName: 'ОкнаПрофи',
    description:
        'Установка окон, замена стеклопакетов и сервисное обслуживание квартир и частных домов.',
    phone: '+7 (8442) 45-10-10',
    email: 'partner@oknamarket.ru',
    city: 'Волгоград',
    districts: ['Центральный', 'Дзержинский', 'Ворошиловский'],
    moderationStatus: 'approved',
    moderationNote: 'Профиль подтвержден, карточка показывается клиентам.',
    logo: 'OK',
    gallery: ['Балконный блок', 'Кухонное окно', 'Панорамное остекление'],
};

export const adminModerationQueue: AdminCompanyModeration[] = [
    {
        id: 'CMP-19',
        companyName: 'ЮгСтеклоСервис',
        city: 'Волжский',
        contactName: 'Алексей Ковалев',
        phone: '+7 (927) 000-14-22',
        status: 'pending',
        submittedAt: '14 июня, 08:50',
        note: 'Нужно проверить портфолио и районы выезда.',
    },
    {
        id: 'CMP-18',
        companyName: 'ТеплоДом',
        city: 'Волгоград',
        contactName: 'Мария Белова',
        phone: '+7 (917) 210-77-40',
        status: 'approved',
        submittedAt: '13 июня, 16:30',
        note: 'Подтверждены документы и примеры работ.',
    },
    {
        id: 'CMP-17',
        companyName: 'ОкноМастер 34',
        city: 'Волгоград',
        contactName: 'Иван Рыбин',
        phone: '+7 (902) 311-08-16',
        status: 'rejected',
        submittedAt: '12 июня, 11:10',
        note: 'Не заполнен профиль услуг и отсутствуют фото работ.',
    },
];

export const adminOverview = {
    newRequests: 14,
    activeRequests: 37,
    companiesOnModeration: 5,
    totalClients: 128,
};

export function getStatusLabel(status: RequestStatus): string {
    switch (status) {
        case 'new':
            return 'Новая';
        case 'awaiting_confirmation':
            return 'Ждет подтверждения';
        case 'confirmed':
            return 'Подтверждена';
        case 'in_progress':
            return 'В работе';
        case 'completed':
            return 'Завершена';
        case 'cancelled':
            return 'Отменена';
    }
}

export function getStatusVariant(
    status: RequestStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
        case 'completed':
            return 'default';
        case 'confirmed':
        case 'in_progress':
            return 'secondary';
        case 'cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
}

export function getModerationLabel(
    status: VendorProfile['moderationStatus'],
): string {
    switch (status) {
        case 'approved':
            return 'Подтверждена';
        case 'rejected':
            return 'Отклонена';
        case 'pending':
            return 'На проверке';
    }
}

export function getModerationVariant(
    status: VendorProfile['moderationStatus'],
): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
        case 'approved':
            return 'default';
        case 'rejected':
            return 'destructive';
        case 'pending':
            return 'outline';
    }
}
