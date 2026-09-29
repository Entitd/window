export type AgreedTerms = {
    final_price?: string | null;
    work_scope?: string | null;
};

export function AgreedTermsSummary({ data }: { data: AgreedTerms }) {
    return (
        <section className="grid gap-2 rounded-xl bg-muted/50 p-4 text-sm">
            <h3 className="font-semibold">Согласованные условия</h3>
            <p>
                Итоговая стоимость:{' '}
                {data.final_price != null
                    ? `${data.final_price} ₽`
                    : 'Ожидает предложения компании и подтверждения клиента'}
            </p>
            {data.work_scope && (
                <p className="whitespace-pre-wrap">
                    Состав работ: {data.work_scope}
                </p>
            )}
        </section>
    );
}

export function AgreedTermsFields({
    data,
    errors,
    onChange,
}: {
    data: AgreedTerms;
    errors: Partial<Record<keyof AgreedTerms, string>>;
    onChange: (field: keyof AgreedTerms, value: string) => void;
}) {
    return (
        <fieldset className="grid gap-3 rounded-xl border p-4">
            <legend className="px-2 font-medium">
                Предложить итоговую стоимость
            </legend>
            <p className="text-sm text-muted-foreground">
                Укажите сумму и полный состав работ. Условия вступят в силу
                после подтверждения клиента.
            </p>
            <label className="grid gap-2 text-sm">
                Итоговая стоимость, ₽
                <input
                    className="rounded-md border bg-background px-3 py-2"
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    value={data.final_price ?? ''}
                    onChange={(e) => onChange('final_price', e.target.value)}
                />
                {errors.final_price && (
                    <span className="text-destructive">
                        {errors.final_price}
                    </span>
                )}
            </label>
            <label className="grid gap-2 text-sm">
                Полный состав работ
                <textarea
                    className="rounded-md border bg-background px-3 py-2"
                    rows={4}
                    maxLength={5000}
                    value={data.work_scope ?? ''}
                    onChange={(e) => onChange('work_scope', e.target.value)}
                />
                {errors.work_scope && (
                    <span className="text-destructive">
                        {errors.work_scope}
                    </span>
                )}
            </label>
        </fieldset>
    );
}
