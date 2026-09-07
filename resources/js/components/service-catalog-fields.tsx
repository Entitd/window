import type { ReactNode } from 'react';

export type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    sort_order: number;
    is_active: boolean;
};
export type ServiceOption = {
    id: number | null;
    name: string;
    input_type: 'selection' | 'dimensions';
    pricing_type: 'fixed' | 'unit' | 'sqm' | 'quote';
    is_active: boolean;
};
export type Parameter = {
    id: number | null;
    key: string;
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    unit: string;
    is_required: boolean;
    min_value: string | number | null;
    max_value: string | number | null;
    choices: string[];
    is_active: boolean;
};
export type CatalogService = {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    options: ServiceOption[];
    parameters: Parameter[];
};
export type Rate = {
    id: number;
    service_option_id: number;
    price: string | null;
    is_default: boolean;
    option: ServiceOption;
};
export type Offering = {
    id: number;
    service_id: number | null;
    service_name: string;
    description: string | null;
    is_active: boolean;
    rates: Rate[];
};

export const fieldClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
export const pricingLabels = {
    fixed: 'Фиксированная за работу',
    unit: 'За штуку',
    sqm: 'За м²',
    quote: 'После замера',
};
export const inputLabels = {
    selection: 'Простой выбор',
    dimensions: 'Ширина и высота (мм)',
};

export function Field({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <label className="grid gap-1.5 text-sm">
            <span className="font-medium">{title}</span>
            {children}
        </label>
    );
}

export function Errors({ errors }: { errors: Record<string, string> }) {
    return (
        Object.keys(errors).length > 0 && (
            <div
                role="alert"
                className="grid gap-1 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
                {Object.entries(errors).map(([key, value]) => (
                    <p key={key}>{value}</p>
                ))}
            </div>
        )
    );
}

export function categoryPath(
    category: Category,
    categories: Category[],
): string {
    const parts = [category.name];
    const seen = new Set([category.id]);
    let parent = categories.find((c) => c.id === category.parent_id);

    while (parent && !seen.has(parent.id)) {
        parts.unshift(parent.name);
        seen.add(parent.id);
        parent = categories.find((c) => c.id === parent?.parent_id);
    }

    return parts.join(' / ');
}

export function CategoryOptions({ categories }: { categories: Category[] }) {
    return categories.map((c) => (
        <option value={c.id} key={c.id}>
            {categoryPath(c, categories)}
            {!c.is_active ? ' (архив)' : ''}
        </option>
    ));
}

export function isWithinCategory(
    categoryId: number,
    selectedId: string,
    categories: Category[],
): boolean {
    if (!selectedId) {
        return true;
    }

    const seen = new Set<number>();
    let current = categories.find((c) => c.id === categoryId);

    while (current && !seen.has(current.id)) {
        if (current.id === Number(selectedId)) {
            return true;
        }

        seen.add(current.id);
        current = categories.find((c) => c.id === current?.parent_id);
    }

    return false;
}
