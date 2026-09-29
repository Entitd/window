import { useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, fieldClass } from '@/components/service-catalog-fields';
import { queryItems } from '@/lib/catalog-booking';
import { searchResults } from '@/routes';

export type SearchService = {
    id: number;
    name: string;
    description: string | null;
    options: {
        id: number | null;
        name: string;
        input_type: 'selection' | 'dimensions';
    }[];
};

export function FindCompanyForm({ services }: { services: SearchService[] }) {
    const { url } = usePage();
    const query = new URL(url, 'https://local.invalid').searchParams;
    const [search, setSearch] = useState('');
    const initialItems = queryItems(url);

    if (!initialItems.length && query.get('service_id')) {
        initialItems.push(
            Object.fromEntries(
                ['service_id', 'option_id', 'quantity', 'width', 'height'].map(
                    (key) => [key, query.get(key) ?? ''],
                ),
            ),
        );
    }

    const form = useForm({
        items: initialItems
            .filter((item) =>
                services.some(
                    (service) => service.id === Number(item.service_id),
                ),
            )
            .map((item) => ({
                service_id: item.service_id ?? '',
                option_id: item.option_id ?? '',
                quantity: item.quantity || '1',
                width: item.width ?? '',
                height: item.height ?? '',
            })),
        city: query.get('city') ?? '',
        installationDate: query.get('installationDate') ?? '',
        comment: query.get('comment') ?? '',
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
    const visibleServices = services.filter((item) =>
        `${item.name} ${item.description ?? ''}`
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()),
    );

    return (
        <form
            className="request-card hero-request-card"
            onSubmit={(event) => {
                event.preventDefault();

                if (!form.data.items.length) {
                    return;
                }

                form.transform((data) => ({
                    ...data,
                    items: data.items.map((item) => {
                        const service = services.find(
                            (service) => service.id === Number(item.service_id),
                        );
                        const option = service?.options.find(
                            (option) => option.id === Number(item.option_id),
                        );
                        const dimensions = option
                            ? option.input_type === 'dimensions'
                            : service?.options.some(
                                  (option) =>
                                      option.input_type === 'dimensions',
                              );

                        return {
                            ...item,
                            width: dimensions ? item.width : '',
                            height: dimensions ? item.height : '',
                        };
                    }),
                }));
                form.get(searchResults.url(), {
                    preserveState: false,
                    queryStringArrayFormat: 'indices',
                });
            }}
        >
            <div className="mb-5">
                <h2>Что нужно сделать?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Отметьте одну или несколько работ. Найдём компанию, которая
                    выполнит всё.
                </p>
            </div>
            <fieldset className="grid min-w-0 gap-3">
                <legend className="sr-only">Нужные услуги</legend>
                {services.length > 6 && (
                    <label className="relative block">
                        <Search
                            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <input
                            className={`${fieldClass} pl-10`}
                            aria-label="Найти услугу"
                            placeholder="Например, ремонт или москитная сетка"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                    {visibleServices.map((service) => {
                        const selected = form.data.items.some(
                            (item) => Number(item.service_id) === service.id,
                        );

                        return (
                            <label
                                key={service.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary ${selected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}
                            >
                                <input
                                    className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                                    type="checkbox"
                                    checked={selected}
                                    disabled={
                                        !selected &&
                                        form.data.items.length >= 10
                                    }
                                    onChange={() => {
                                        form.setData(
                                            'items',
                                            selected
                                                ? form.data.items.filter(
                                                      (item) =>
                                                          Number(
                                                              item.service_id,
                                                          ) !== service.id,
                                                  )
                                                : [
                                                      ...form.data.items,
                                                      {
                                                          service_id: String(
                                                              service.id,
                                                          ),
                                                          option_id: '',
                                                          quantity: '1',
                                                          width: '',
                                                          height: '',
                                                      },
                                                  ],
                                        );
                                        form.clearErrors();
                                    }}
                                />
                                <span className="grid gap-1">
                                    <span className="text-sm font-semibold">
                                        {service.name}
                                    </span>
                                    {service.description && (
                                        <span className="text-xs leading-relaxed text-muted-foreground">
                                            {service.description}
                                        </span>
                                    )}
                                </span>
                            </label>
                        );
                    })}
                </div>
                {!visibleServices.length && (
                    <p role="status" className="text-sm text-muted-foreground">
                        {services.length
                            ? 'Такая услуга не найдена. Попробуйте другое название.'
                            : 'Пока нет доступных услуг.'}
                    </p>
                )}
            </fieldset>
            {!!form.data.items.length && (
                <div className="mt-5 grid gap-4 border-t pt-5">
                    <h3 className="font-semibold">
                        В заявке: {form.data.items.length} услуг
                    </h3>
                    <Field title="Город или район для всех работ">
                        <input
                            className={fieldClass}
                            autoComplete="address-level2"
                            required
                            maxLength={255}
                            placeholder="Например, Волгоград"
                            value={form.data.city}
                            onChange={(event) =>
                                form.setData('city', event.target.value)
                            }
                        />
                    </Field>
                    {form.data.items.map((item, index) => {
                        const service = services.find(
                            (service) => service.id === Number(item.service_id),
                        );

                        if (!service) {
                            return null;
                        }

                        const option = service.options.find(
                            (option) => option.id === Number(item.option_id),
                        );
                        const dimensions = option
                            ? option.input_type === 'dimensions'
                            : service.options.some(
                                  (option) =>
                                      option.input_type === 'dimensions',
                              );

                        return (
                            <fieldset
                                key={item.service_id}
                                className="grid gap-3 rounded-xl border bg-background p-4"
                            >
                                <legend className="px-2 text-sm font-semibold">
                                    {service.name}
                                </legend>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="text-xs text-muted-foreground underline"
                                        onClick={() =>
                                            form.setData(
                                                'items',
                                                form.data.items.filter(
                                                    (_, itemIndex) =>
                                                        itemIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        Убрать из заявки
                                    </button>
                                </div>
                                {service.options.length > 1 && (
                                    <Field title="Какой вариант нужен?">
                                        <select
                                            className={fieldClass}
                                            value={item.option_id}
                                            onChange={(event) =>
                                                updateItem(index, {
                                                    option_id:
                                                        event.target.value,
                                                    width: '',
                                                    height: '',
                                                })
                                            }
                                        >
                                            <option value="">
                                                Пока не знаю — нужна помощь
                                            </option>
                                            {service.options.map((option) => (
                                                <option
                                                    key={option.id}
                                                    value={option.id ?? ''}
                                                >
                                                    {option.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                )}
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
                                {dimensions && (
                                    <details>
                                        <summary className="cursor-pointer text-sm">
                                            Указать размеры для расчёта —
                                            необязательно
                                            {item.width && item.height
                                                ? ` (${item.width} × ${item.height} см)`
                                                : ''}
                                        </summary>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            <Field title="Ширина, см">
                                                <input
                                                    className={fieldClass}
                                                    type="number"
                                                    min={0.1}
                                                    max={10000}
                                                    step={0.1}
                                                    value={item.width}
                                                    onChange={(event) =>
                                                        updateItem(index, {
                                                            width: event.target
                                                                .value,
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
                                                    value={item.height}
                                                    onChange={(event) =>
                                                        updateItem(index, {
                                                            height: event.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </Field>
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Размеры неизвестны? Компания уточнит
                                            их при замере.
                                        </p>
                                    </details>
                                )}
                            </fieldset>
                        );
                    })}
                    <Field title="Пожелания ко всей заявке — необязательно">
                        <textarea
                            className={fieldClass}
                            rows={2}
                            maxLength={2000}
                            placeholder="Например: все работы в одной квартире"
                            value={form.data.comment}
                            onChange={(event) =>
                                form.setData('comment', event.target.value)
                            }
                        />
                    </Field>
                </div>
            )}
            <div className="mt-5 grid gap-3">
                <Errors errors={form.errors} />
                <button
                    className="btn btn-accent w-full"
                    disabled={!form.data.items.length || form.processing}
                    type="submit"
                >
                    {form.processing
                        ? 'Подбираем компании…'
                        : 'Найти компанию для всех работ'}{' '}
                    <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <p className="text-center text-xs text-muted-foreground">
                    Одна заявка, одна компания, общая стоимость. До 10 услуг.
                </p>
            </div>
        </form>
    );
}
