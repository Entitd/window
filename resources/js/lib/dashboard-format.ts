export type RequestStatus =
    | 'new'
    | 'awaiting_confirmation'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'rejected'
    | 'cancelled';

export type ClientRequest = {
    id: string;
    createdAt: string;
    city: string;
    district: string;
    districtValue?: string | null;
    address: string;
    installationDate: string;
    installationDateValue?: string | null;
    width: number;
    height: number;
    service: string;
    extras: string[];
    comment: string;
    commentValue?: string | null;
    status: RequestStatus;
    company: string | null;
    estimatedPrice: string;
    review: {
        id: string;
        stars: number;
        comment: string;
        tags: string[];
        isPublic: boolean;
        status: string;
        createdAt: string | null;
    } | null;
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
        case 'rejected':
            return 'Отклонена';
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
        case 'rejected':
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
