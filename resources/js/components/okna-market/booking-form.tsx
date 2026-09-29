import { useForm, usePage } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/CatalogController';
import CatalogDraftController from '@/actions/App/Http/Controllers/CatalogDraftController';
import { VisitFields } from '@/components/request-visit-details';
import {
    Errors,
    Field,
    fieldClass,
    pricingLabels,
} from '@/components/service-catalog-fields';
import type {
    CatalogService,
    Offering,
    Rate,
} from '@/components/service-catalog-fields';
import { Button } from '@/components/ui/button';
import { catalogBookingDefaults } from '@/lib/catalog-booking';
import type { CatalogDraft } from '@/lib/catalog-booking';
import type { Auth } from '@/types';

export type PublicOffering = Offering & {
    vendor_id: number;
    vendor: {
        company_name: string;
        city: string;
        districts: { id: number; name: string }[];
    };
};
export type BookingSelection = {
    service: CatalogService;
    offering: PublicOffering;
    rate: Rate;
    values: Record<string, string>;
};

export function BookingForm({
    selections,
}: {
    selections: BookingSelection[];
}) {
    const {
        url,
        props: { auth, draft },
    } = usePage<{
        auth: { user: Auth['user'] | null };
        draft: CatalogDraft | null;
    }>();
    const first = selections[0];
    const saved =
        draft &&
        Number(draft.items?.[0]?.rate_id ?? draft.rate_id) === first.rate.id
            ? draft
            : null;
    const defaults = catalogBookingDefaults(
        url,
        first.offering.vendor.city,
        false,
        saved,
    );
    const form = useForm({
        ...defaults,
        items: selections.map(({ rate, service, values }) => {
            const savedItem =
                saved?.items?.find(
                    (item) => Number(item.rate_id) === rate.id,
                ) ?? (saved?.rate_id === rate.id ? saved : null);
            const input = savedItem ?? values;

            return {
                rate_id: rate.id,
                quantity: String(input.quantity || '1'),
                width_mm:
                    rate.option.input_type === 'dimensions'
                        ? String(input.width_mm ?? '')
                        : '',
                height_mm:
                    rate.option.input_type === 'dimensions'
                        ? String(input.height_mm ?? '')
                        : '',
                parameters: Object.fromEntries(
                    service.parameters.map((parameter) => [
                        parameter.key,
                        savedItem?.parameters?.[parameter.key] ?? '',
                    ]),
                ) as Record<string, string>,
            };
        }),
    });
    function updateItem(
        index: number,
        changes: Partial<(typeof form.data.items)[number]>,
    ) {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...changes } : item,
            ),
        );
    }
    const totals = selections.map(({ rate }, index) => {
        const item = form.data.items[index];

        if (
            rate.price === null ||
            rate.option.pricing_type === 'quote' ||
            (rate.option.input_type === 'dimensions' &&
                (!Number(item.width_mm) || !Number(item.height_mm)))
        ) {
            return null;
        }

        const amount =
            Number(rate.price) *
            (rate.option.pricing_type === 'fixed' ? 1 : Number(item.quantity)) *
            (rate.option.pricing_type === 'sqm'
                ? (Number(item.width_mm) * Number(item.height_mm)) / 1000000
                : 1);

        return Math.round(amount * 100) / 100;
    });
    const total = totals.some((value) => value === null)
        ? null
        : totals.reduce<number>((sum, value) => sum + (value ?? 0), 0);

    return (
        <form
            className="grid gap-5 rounded-xl border bg-card p-5"
            onSubmit={(event) => {
                event.preventDefault();

                if (auth.user) {
                    form.post(store.url());
                } else {
                    form.post(CatalogDraftController.url());
                }
            }}
        >
            <div>
                <h2 className="text-xl font-semibold">
                    Одна заявка — {first.offering.vendor.company_name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Проверьте каждую работу. Адрес и время указываются один раз
                    для всей заявки.
                </p>
            </div>
            {selections.map(({ service, rate }, index) => {
                const item = form.data.items[index];

                return (
                    <fieldset
                        key={rate.id}
                        className="grid gap-3 rounded-xl border p-4"
                    >
                        <legend className="px-2 font-semibold">
                            {index + 1}. {service.name}
                        </legend>
                        <p className="text-sm text-muted-foreground">
                            {rate.option.name} ·{' '}
                            {pricingLabels[rate.option.pricing_type]}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field title="Количество, шт.">
                                <input
                                    className={fieldClass}
                                    type="number"
                                    min={1}
                                    max={1000}
                                    required
                                    value={item.quantity}
                                    onChange={(event) =>
                                        updateItem(index, {
                                            quantity: event.target.value,
                                        })
                                    }
                                />
                            </Field>
                            {rate.option.input_type === 'dimensions' && (
                                <>
                                    <Field title="Ширина, см">
                                        <input
                                            className={fieldClass}
                                            type="number"
                                            min={0.1}
                                            max={10000}
                                            step={0.1}
                                            value={
                                                item.width_mm === ''
                                                    ? ''
                                                    : Number(item.width_mm) / 10
                                            }
                                            onChange={(event) =>
                                                updateItem(index, {
                                                    width_mm:
                                                        event.target.value ===
                                                        ''
                                                            ? ''
                                                            : String(
                                                                  Math.round(
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ) * 10,
                                                                  ),
                                                              ),
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field title="Высота, см">
                                        <input
                                            className={fieldClass}
                                            type="number"
                                            min={0.1}
                                            max={10000}
                                            step={0.1}
                                            value={
                                                item.height_mm === ''
                                                    ? ''
                                                    : Number(item.height_mm) /
                                                      10
                                            }
                                            onChange={(event) =>
                                                updateItem(index, {
                                                    height_mm:
                                                        event.target.value ===
                                                        ''
                                                            ? ''
                                                            : String(
                                                                  Math.round(
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ) * 10,
                                                                  ),
                                                              ),
                                                })
                                            }
                                        />
                                    </Field>
                                </>
                            )}
                            {service.parameters.map((parameter) => (
                                <Field
                                    key={parameter.id}
                                    title={`${parameter.name}${parameter.unit ? `, ${parameter.unit}` : ''}${parameter.is_required ? ' *' : ''}`}
                                >
                                    {parameter.type === 'select' ||
                                    parameter.type === 'boolean' ? (
                                        <select
                                            className={fieldClass}
                                            required={parameter.is_required}
                                            value={
                                                item.parameters[parameter.key]
                                            }
                                            onChange={(event) =>
                                                updateItem(index, {
                                                    parameters: {
                                                        ...item.parameters,
                                                        [parameter.key]:
                                                            event.target.value,
                                                    },
                                                })
                                            }
                                        >
                                            <option value="">
                                                Уточнить позже
                                            </option>
                                            {(parameter.type === 'boolean'
                                                ? [
                                                      {
                                                          value: '1',
                                                          name: 'Да',
                                                      },
                                                      {
                                                          value: '0',
                                                          name: 'Нет',
                                                      },
                                                  ]
                                                : parameter.choices.map(
                                                      (value) => ({
                                                          value,
                                                          name: value,
                                                      }),
                                                  )
                                            ).map((choice) => (
                                                <option
                                                    key={choice.value}
                                                    value={choice.value}
                                                >
                                                    {choice.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            className={fieldClass}
                                            type={
                                                parameter.type === 'number'
                                                    ? 'number'
                                                    : 'text'
                                            }
                                            step={
                                                parameter.type === 'number'
                                                    ? '0.0001'
                                                    : undefined
                                            }
                                            min={
                                                parameter.min_value ?? undefined
                                            }
                                            max={
                                                parameter.max_value ?? undefined
                                            }
                                            required={parameter.is_required}
                                            value={
                                                item.parameters[parameter.key]
                                            }
                                            onChange={(event) =>
                                                updateItem(index, {
                                                    parameters: {
                                                        ...item.parameters,
                                                        [parameter.key]:
                                                            event.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    )}
                                </Field>
                            ))}
                        </div>
                        <p className="text-sm font-medium">
                            {totals[index] === null
                                ? 'Цена этой работы уточняется после замера'
                                : `За эту работу: ${totals[index]?.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`}
                        </p>
                        {rate.option.input_type === 'dimensions' && (
                            <p className="text-xs text-muted-foreground">
                                Если размеры неизвестны, оставьте оба поля
                                пустыми.
                            </p>
                        )}
                    </fieldset>
                );
            })}
            <div className="grid gap-3 sm:grid-cols-2">
                <Field title="Город">
                    <input
                        className={fieldClass}
                        required
                        value={form.data.city}
                        onChange={(event) =>
                            form.setData('city', event.target.value)
                        }
                    />
                </Field>
                <Field title="Район">
                    <select
                        className={fieldClass}
                        value={form.data.district}
                        onChange={(event) =>
                            form.setData('district', event.target.value)
                        }
                    >
                        <option value="">Уточнить позже</option>
                        {first.offering.vendor.districts.map((district) => (
                            <option key={district.id} value={district.name}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>
            <details
                className="rounded-xl border p-4"
                open={
                    [
                        'address',
                        'contact_name',
                        'contact_phone',
                        'arrival_from',
                        'arrival_until',
                        'installation_date',
                    ].some((key) => key in form.errors) || undefined
                }
            >
                <summary className="cursor-pointer font-medium">
                    Адрес, контакт и время для всех работ — можно уточнить позже
                </summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <VisitFields
                        data={form.data}
                        errors={form.errors}
                        onChange={(field, value) => form.setData(field, value)}
                    />
                    <Field title="Желаемая дата">
                        <input
                            className={fieldClass}
                            type="date"
                            value={form.data.installation_date}
                            onChange={(event) =>
                                form.setData(
                                    'installation_date',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </div>
            </details>
            <Field title="Пожелания ко всей заявке">
                <textarea
                    className={fieldClass}
                    maxLength={2000}
                    value={form.data.comment}
                    onChange={(event) =>
                        form.setData('comment', event.target.value)
                    }
                />
            </Field>
            <p className="text-lg font-semibold">
                {total === null
                    ? 'Общая стоимость после уточнения всех работ'
                    : `Предварительно за всё: ${total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`}
            </p>
            <p className="text-sm text-muted-foreground">
                Компания согласует с вами окончательную сумму и дату. Фотографии
                можно добавить после создания заявки.
            </p>
            <Errors errors={form.errors} />
            {!auth.user ? (
                <Button
                    type="button"
                    disabled={form.processing}
                    onClick={() => form.post(CatalogDraftController.url())}
                >
                    Войти и сохранить все выбранные работы
                </Button>
            ) : auth.user.role === 'client' ? (
                <Button disabled={form.processing}>
                    Отправить одну заявку на все работы
                </Button>
            ) : (
                <p>Для отправки заявки нужен кабинет клиента.</p>
            )}
        </form>
    );
}
