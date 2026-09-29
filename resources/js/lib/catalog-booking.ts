export type CatalogDraftItem = {
    rate_id: number;
    quantity?: string | number | null;
    width_mm?: string | number | null;
    height_mm?: string | number | null;
    parameters: Record<string, string | null>;
};

export function queryItems(url: string): Record<string, string>[] {
    const items: Record<string, string>[] = [];

    for (const [key, value] of new URL(url, 'https://local.invalid')
        .searchParams) {
        const match = key.match(/^items\[(\d+)\]\[(\w+)\]$/);

        if (match && Number(match[1]) < 10) {
            (items[Number(match[1])] ??= {})[match[2]] = value;
        }
    }

    return items.filter(Boolean);
}

export type CatalogDraft = {
    items?: CatalogDraftItem[];
    address?: string | null;
    contact_name?: string | null;
    contact_phone?: string | null;
    arrival_from?: string | null;
    arrival_until?: string | null;
    rate_id: number;
    quantity?: string | number | null;
    width_mm?: string | number | null;
    height_mm?: string | number | null;
    city?: string | null;
    district?: string | null;
    installation_date?: string | null;
    comment?: string | null;
    parameters: Record<string, string | null>;
};

export function catalogBookingDefaults(
    url: string,
    vendorCity: string,
    dimensions: boolean,
    draft: CatalogDraft | null = null,
) {
    const query = new URL(url, 'https://local.invalid').searchParams;
    const field = (
        key: Exclude<keyof CatalogDraft, 'rate_id' | 'parameters' | 'items'>,
    ) => (draft ? draft[key] : query.get(key));
    const integer = (
        key: 'quantity' | 'width_mm' | 'height_mm',
        max: number,
        fallback = '',
    ) => {
        const value = Number(field(key));

        return Number.isInteger(value) && value >= 1 && value <= max
            ? String(value)
            : fallback;
    };

    return {
        address: String(field('address') || ''),
        contact_name: String(field('contact_name') || ''),
        contact_phone: String(field('contact_phone') || ''),
        arrival_from: String(field('arrival_from') || ''),
        arrival_until: String(field('arrival_until') || ''),
        quantity: integer('quantity', 1000, '1'),
        width_mm: dimensions ? integer('width_mm', 100000) : '',
        height_mm: dimensions ? integer('height_mm', 100000) : '',
        city: String(field('city') || vendorCity),
        district: String(field('district') || ''),
        installation_date: String(field('installation_date') || ''),
        comment: String(field('comment') || ''),
    };
}
