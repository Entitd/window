import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    index,
    store,
    update,
    toggle,
    destroy,
} from '@/actions/App/Http/Controllers/VendorServiceController';
import {
    CategoryOptions,
    isWithinCategory,
    Errors,
    Field,
    categoryPath,
    fieldClass,
    inputLabels,
    pricingLabels,
} from '@/components/service-catalog-fields';
import type {
    CatalogService,
    Category,
    Offering,
} from '@/components/service-catalog-fields';
import { Button } from '@/components/ui/button';

type RateInput = {
    service_option_id: number;
    price: string;
    is_default: boolean;
};
function OfferingEditor({
    offering,
    catalog,
    categories,
}: {
    offering?: Offering;
    catalog: CatalogService[];
    categories: Category[];
}) {
    const [categoryId, setCategoryId] = useState('');
    const form = useForm({
        service_id: String(offering?.service_id ?? ''),
        description: offering?.description ?? '',
        is_active: offering?.is_active ?? true,
        rates:
            offering?.rates.map((r) => ({
                service_option_id: r.service_option_id,
                price: r.price ?? '',
                is_default: r.is_default,
            })) ?? ([] as RateInput[]),
    });
    const action = useForm({});
    const service = catalog.find((s) => s.id === Number(form.data.service_id));
    const unavailable =
        offering &&
        (!service ||
            form.data.rates.some(
                (r) =>
                    !service.options.some((o) => o.id === r.service_option_id),
            ));
    const visible = catalog.filter((s) =>
        isWithinCategory(s.category_id, categoryId, categories),
    );

    return (
        <form
            className="grid gap-4 rounded-xl border bg-card p-5"
            onSubmit={(e) => {
                e.preventDefault();

                if (offering) {
                    form.patch(update.url(offering.id), {
                        preserveScroll: true,
                    });
                } else {
                    form.post(store.url(), {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }
            }}
        >
            <h2 className="text-lg font-semibold">
                {offering?.service_name ?? 'Добавить услугу из каталога'}
            </h2>
            {offering?.service_id === null && (
                <p className="text-sm text-amber-700">
                    Это прежняя запись со свободным названием. Выберите
                    соответствующую услугу каталога и тарифы, чтобы привязать
                    её.
                </p>
            )}
            {unavailable && (
                <p className="text-sm text-amber-700">
                    Услуга или один из вариантов недоступен. Выберите
                    действующие настройки перед сохранением.
                </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
                <Field title="Категория">
                    <select
                        className={fieldClass}
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Все категории</option>
                        <CategoryOptions categories={categories} />
                    </select>
                </Field>
                <Field title="Услуга">
                    <select
                        className={fieldClass}
                        required
                        value={form.data.service_id}
                        onChange={(e) => {
                            const selected = catalog.find(
                                (s) => s.id === Number(e.target.value),
                            );
                            form.setData({
                                ...form.data,
                                service_id: e.target.value,
                                rates: selected?.options[0]?.id
                                    ? [
                                          {
                                              service_option_id:
                                                  selected.options[0].id,
                                              price: '',
                                              is_default: true,
                                          },
                                      ]
                                    : [],
                            });
                        }}
                    >
                        <option value="">Выберите услугу</option>
                        {!service && form.data.service_id && (
                            <option value={form.data.service_id}>
                                Архивная услуга
                            </option>
                        )}
                        {catalog
                            .filter(
                                (s) =>
                                    visible.includes(s) ||
                                    s.id === Number(form.data.service_id),
                            )
                            .map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                    </select>
                </Field>
            </div>
            {service && (
                <>
                    <p className="text-sm text-muted-foreground">
                        {service.description}
                    </p>
                    <p className="text-sm">
                        Отметьте способы оценки и задайте тариф для каждого.
                        Один вариант должен быть выбран по умолчанию.
                    </p>
                    {service.options.map((option) => {
                        const rate = form.data.rates.find(
                            (r) => r.service_option_id === option.id,
                        );

                        return (
                            <div
                                key={option.id}
                                className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                            >
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={!!rate}
                                        onChange={(e) => {
                                            const rates = e.target.checked
                                                ? [
                                                      ...form.data.rates,
                                                      {
                                                          service_option_id:
                                                              option.id!,
                                                          price: '',
                                                          is_default:
                                                              form.data.rates
                                                                  .length === 0,
                                                      },
                                                  ]
                                                : form.data.rates.filter(
                                                      (r) =>
                                                          r.service_option_id !==
                                                          option.id,
                                                  );

                                            if (
                                                rates.length &&
                                                !rates.some((r) => r.is_default)
                                            ) {
                                                rates[0] = {
                                                    ...rates[0],
                                                    is_default: true,
                                                };
                                            }

                                            form.setData('rates', rates);
                                        }}
                                    />
                                    {option.name}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    {inputLabels[option.input_type]} ·{' '}
                                    {pricingLabels[option.pricing_type]}
                                </p>
                                {rate && (
                                    <>
                                        <Field
                                            title={
                                                option.pricing_type === 'quote'
                                                    ? 'Цена определяется после замера'
                                                    : 'Тариф, ₽'
                                            }
                                        >
                                            <input
                                                className={fieldClass}
                                                disabled={
                                                    option.pricing_type ===
                                                    'quote'
                                                }
                                                type="number"
                                                min="0"
                                                max="9999999"
                                                step="0.01"
                                                required={
                                                    option.pricing_type !==
                                                    'quote'
                                                }
                                                value={rate.price}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'rates',
                                                        form.data.rates.map(
                                                            (r) =>
                                                                r.service_option_id ===
                                                                option.id
                                                                    ? {
                                                                          ...r,
                                                                          price: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : r,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Field>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name={`default-${offering?.id ?? 'new'}`}
                                                checked={rate.is_default}
                                                onChange={() =>
                                                    form.setData(
                                                        'rates',
                                                        form.data.rates.map(
                                                            (r) => ({
                                                                ...r,
                                                                is_default:
                                                                    r.service_option_id ===
                                                                    option.id,
                                                            }),
                                                        ),
                                                    )
                                                }
                                            />
                                            По умолчанию
                                        </label>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {form.data.rates.some(
                        (r) =>
                            !service.options.some(
                                (o) => o.id === r.service_option_id,
                            ),
                    ) && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                form.setData(
                                    'rates',
                                    form.data.rates.filter((r) =>
                                        service.options.some(
                                            (o) => o.id === r.service_option_id,
                                        ),
                                    ),
                                )
                            }
                        >
                            Убрать архивные варианты
                        </Button>
                    )}
                </>
            )}
            <Field title="Комментарий компании">
                <textarea
                    className={fieldClass}
                    value={form.data.description}
                    onChange={(e) =>
                        form.setData('description', e.target.value)
                    }
                />
            </Field>
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(e) =>
                        form.setData('is_active', e.target.checked)
                    }
                />
                Оказываем эту услугу
            </label>
            <Errors errors={{ ...form.errors, ...action.errors }} />
            <div className="flex flex-wrap gap-2">
                <Button disabled={form.processing || !service}>
                    Сохранить
                </Button>
                {offering && (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={action.processing}
                            onClick={() =>
                                action.patch(toggle.url(offering.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            {offering.is_active
                                ? 'Приостановить'
                                : 'Возобновить'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={action.processing}
                            onClick={() =>
                                action.delete(destroy.url(offering.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Убрать из моих услуг
                        </Button>
                    </>
                )}
            </div>
            {form.recentlySuccessful && <p role="status">Сохранено</p>}
        </form>
    );
}

export default function VendorServices({
    services,
    catalog,
    categories,
}: {
    services: Offering[];
    catalog: CatalogService[];
    categories: Category[];
}) {
    return (
        <>
            <Head title="Услуги и тарифы" />
            <main className="grid gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Услуги и тарифы</h1>
                    <p className="mt-2 text-muted-foreground">
                        Выбирайте услуги администратора и удобные вам способы
                        оценки работы.
                    </p>
                </div>
                {!catalog.length && (
                    <p className="rounded-lg border p-4">
                        В каталоге пока нет доступных услуг. Администратору
                        нужно заполнить категории и варианты расчёта.
                    </p>
                )}
                <OfferingEditor
                    catalog={catalog.filter(
                        (s) => !services.some((o) => o.service_id === s.id),
                    )}
                    categories={categories}
                />
                <h2 className="text-xl font-semibold">Мои услуги</h2>
                {!services.length && (
                    <p className="text-muted-foreground">
                        Вы пока не выбрали услуги.
                    </p>
                )}
                {services.map((offering) => (
                    <details
                        key={offering.id}
                        className="rounded-xl border p-4"
                    >
                        <summary className="cursor-pointer font-medium">
                            {offering.service_name} ·{' '}
                            {offering.is_active ? 'активна' : 'приостановлена'}
                            {offering.service_id &&
                                catalog.find(
                                    (s) => s.id === offering.service_id,
                                ) && (
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {categoryPath(
                                            categories.find(
                                                (c) =>
                                                    c.id ===
                                                    catalog.find(
                                                        (s) =>
                                                            s.id ===
                                                            offering.service_id,
                                                    )?.category_id,
                                            )!,
                                            categories,
                                        )}
                                    </span>
                                )}
                        </summary>
                        <div className="pt-4">
                            <OfferingEditor
                                key={JSON.stringify(offering)}
                                offering={offering}
                                catalog={catalog.filter(
                                    (s) =>
                                        s.id === offering.service_id ||
                                        !services.some(
                                            (o) => o.service_id === s.id,
                                        ),
                                )}
                                categories={categories}
                            />
                        </div>
                    </details>
                ))}
            </main>
        </>
    );
}
VendorServices.layout = {
    breadcrumbs: [{ title: 'Услуги и тарифы', href: index() }],
};
