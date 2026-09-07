import { pricingLabels } from '@/components/service-catalog-fields';

export type CatalogRequestItem = {
    id: number;
    service_name: string;
    option_name: string;
    pricing_type: keyof typeof pricingLabels;
    quantity: number;
    width_mm: number | null;
    height_mm: number | null;
    unit_price: string | null;
    total_price: string | null;
    values: {
        id: number;
        name: string;
        type: string;
        unit: string | null;
        text_value: string | null;
        number_value: string | null;
        boolean_value: boolean | null;
    }[];
};
export function RequestCatalogItems({
    items = [],
}: {
    items?: CatalogRequestItem[];
}) {
    return (
        items.length > 0 && (
            <section className="grid gap-3 rounded-xl border bg-card p-4">
                <h3 className="font-semibold">Услуга и параметры заявки</h3>
                {items.map((item) => (
                    <div className="grid gap-2 text-sm" key={item.id}>
                        <p className="font-medium">
                            {item.service_name} · {item.option_name}
                        </p>
                        <p>
                            {pricingLabels[item.pricing_type]} · Количество:{' '}
                            {item.quantity}
                        </p>
                        {item.width_mm !== null && (
                            <p>
                                Размеры: {item.width_mm} × {item.height_mm} мм
                            </p>
                        )}
                        {item.values.map((v) => (
                            <p key={v.id}>
                                {v.name}:{' '}
                                {v.type === 'boolean'
                                    ? v.boolean_value
                                        ? 'Да'
                                        : 'Нет'
                                    : v.number_value !== null
                                      ? Number(v.number_value)
                                      : v.text_value}{' '}
                                {v.unit}
                            </p>
                        ))}
                        <p>
                            Тариф:{' '}
                            {item.unit_price === null
                                ? 'после замера'
                                : `${Number(item.unit_price).toLocaleString('ru-RU')} ₽`}
                            . Сумма:{' '}
                            {item.total_price === null
                                ? 'после замера'
                                : `${Number(item.total_price).toLocaleString('ru-RU')} ₽`}
                        </p>
                    </div>
                ))}
            </section>
        )
    );
}
