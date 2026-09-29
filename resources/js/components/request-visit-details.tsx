export type VisitDetails = {
    address?: string | null;
    contact_name?: string | null;
    contact_phone?: string | null;
    arrival_from?: string | null;
    arrival_until?: string | null;
};

const fields = [
    ['address', 'Точный адрес', 'text'],
    ['contact_name', 'Контактное лицо', 'text'],
    ['contact_phone', 'Телефон для связи', 'tel'],
    ['arrival_from', 'Время с', 'time'],
    ['arrival_until', 'Время до', 'time'],
] as const;

export function VisitFields({
    data,
    onChange,
    errors = {},
}: {
    data: VisitDetails;
    errors?: Partial<Record<keyof VisitDetails, string>>;
    onChange: (field: keyof VisitDetails, value: string) => void;
}) {
    return (
        <>
            {fields.map(([key, label, type]) => (
                <label key={key} className="grid gap-2 text-sm">
                    {label}
                    <input
                        className="w-full rounded-md border bg-background px-3 py-2"
                        type={type}
                        value={data[key] ?? ''}
                        maxLength={
                            key === 'address'
                                ? 500
                                : key === 'contact_phone'
                                  ? 40
                                  : 255
                        }
                        onChange={(e) => onChange(key, e.target.value)}
                    />
                    {errors[key] && (
                        <span className="text-destructive">{errors[key]}</span>
                    )}
                </label>
            ))}
        </>
    );
}

export function VisitSummary({ data }: { data: VisitDetails }) {
    return (
        <div className="grid gap-1 rounded-xl bg-muted/50 p-4 text-sm">
            <p>Адрес: {data.address || 'Уточняется'}</p>
            <p>
                Контакт: {data.contact_name || 'Не указан'} ·{' '}
                {data.contact_phone || 'Телефон не указан'}
            </p>
            <p>
                Интервал выезда:{' '}
                {data.arrival_from && data.arrival_until
                    ? `${data.arrival_from}–${data.arrival_until}`
                    : 'Уточняется'}
            </p>
        </div>
    );
}
