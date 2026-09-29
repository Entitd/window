import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    index,
    store,
    update,
    storeCategory,
    updateCategory,
} from '@/actions/App/Http/Controllers/AdminServiceCatalogController';
import {
    CategoryOptions,
    Errors,
    Field,
    categoryPath,
    fieldClass,
    inputLabels,
    pricingLabels,
} from '@/components/service-catalog-fields';
import type {
    Category,
    CatalogService,
    Parameter,
    ServiceOption,
} from '@/components/service-catalog-fields';
import { Button } from '@/components/ui/button';

const newOption = (): ServiceOption => ({
    id: null,
    name: '',
    input_type: 'selection',
    pricing_type: 'fixed',
    is_active: true,
});
const newParameter = (): Parameter => ({
    id: null,
    key: '',
    name: '',
    type: 'text',
    unit: '',
    is_required: false,
    min_value: '',
    max_value: '',
    choices: [],
    is_active: true,
});

function CategoryEditor({
    category,
    categories,
}: {
    category?: Category;
    categories: Category[];
}) {
    const form = useForm({
        name: category?.name ?? '',
        parent_id: String(category?.parent_id ?? ''),
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
    });

    return (
        <form
            className="grid gap-3 rounded-lg border p-4"
            onSubmit={(e) => {
                e.preventDefault();

                if (category) {
                    form.patch(updateCategory.url(category.id), {
                        preserveScroll: true,
                    });
                } else {
                    form.post(storeCategory.url(), {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }
            }}
        >
            <h3 className="font-semibold">
                {category ? 'Редактирование категории' : 'Новая категория'}
            </h3>
            <Field title="Название">
                <input
                    className={fieldClass}
                    required
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                />
            </Field>
            <Field title="Родительская категория">
                <select
                    className={fieldClass}
                    value={form.data.parent_id}
                    onChange={(e) => form.setData('parent_id', e.target.value)}
                >
                    <option value="">Корневая категория</option>
                    <CategoryOptions
                        categories={categories.filter(
                            (c) => c.id !== category?.id,
                        )}
                    />
                </select>
            </Field>
            <Field title="Порядок">
                <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    value={form.data.sort_order}
                    onChange={(e) =>
                        form.setData('sort_order', Number(e.target.value))
                    }
                />
            </Field>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(e) =>
                        form.setData('is_active', e.target.checked)
                    }
                />
                Активна (архив скрывает и вложенные услуги)
            </label>
            <Errors errors={form.errors} />
            <Button disabled={form.processing}>Сохранить категорию</Button>
        </form>
    );
}

function ServiceEditor({
    service,
    categories,
}: {
    service?: CatalogService;
    categories: Category[];
}) {
    const form = useForm({
        name: service?.name ?? '',
        description: service?.description ?? '',
        category_id: String(service?.category_id ?? ''),
        sort_order: service?.sort_order ?? 0,
        is_active: service?.is_active ?? true,
        options: service?.options.map(
            ({ id, name, input_type, pricing_type, is_active }) => ({
                id,
                name,
                input_type,
                pricing_type,
                is_active,
            }),
        ) ?? [newOption()],
        parameters:
            service?.parameters.map(
                ({
                    id,
                    key,
                    name,
                    type,
                    unit,
                    is_required,
                    min_value,
                    max_value,
                    choices,
                    is_active,
                }) => ({
                    id,
                    key,
                    name,
                    type,
                    unit: unit ?? '',
                    is_required,
                    min_value: min_value ?? '',
                    max_value: max_value ?? '',
                    choices: choices ?? [],
                    is_active,
                }),
            ) ?? ([] as Parameter[]),
    });
    function option(i: number, change: Partial<ServiceOption>) {
        form.setData(
            'options',
            form.data.options.map((o, j) =>
                j === i ? { ...o, ...change } : o,
            ),
        );
    }
    function parameter(i: number, change: Partial<Parameter>) {
        form.setData(
            'parameters',
            form.data.parameters.map((p, j) =>
                j === i ? { ...p, ...change } : p,
            ),
        );
    }

    return (
        <form
            className="grid gap-5 rounded-xl border bg-card p-5"
            onSubmit={(e) => {
                e.preventDefault();

                if (service) {
                    form.patch(update.url(service.id), {
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
            <h2 className="text-xl font-semibold">
                {service ? `Услуга: ${service.name}` : 'Новая услуга'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field title="Название услуги">
                    <input
                        className={fieldClass}
                        required
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                </Field>
                <Field title="Категория">
                    <select
                        required
                        className={fieldClass}
                        value={form.data.category_id}
                        onChange={(e) =>
                            form.setData('category_id', e.target.value)
                        }
                    >
                        <option value="">Выберите категорию</option>
                        <CategoryOptions categories={categories} />
                    </select>
                </Field>
                <Field title="Описание">
                    <textarea
                        className={fieldClass}
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                </Field>
                <Field title="Порядок">
                    <input
                        className={fieldClass}
                        type="number"
                        min="0"
                        value={form.data.sort_order}
                        onChange={(e) =>
                            form.setData('sort_order', Number(e.target.value))
                        }
                    />
                </Field>
            </div>
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(e) =>
                        form.setData('is_active', e.target.checked)
                    }
                />
                Услуга активна
            </label>
            <section className="grid gap-3">
                <h3 className="font-semibold">
                    Допустимые варианты ввода и расчёта
                </h3>
                <p className="text-sm text-muted-foreground">
                    Вендор выберет один или несколько вариантов и установит
                    тарифы. Фиксированная цена относится ко всей работе, цена за
                    штуку умножается на количество.
                </p>
                {form.data.options.map((o, i) => (
                    <div
                        className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                        key={o.id ?? `new-${i}`}
                    >
                        <Field title="Название варианта">
                            <input
                                className={fieldClass}
                                required
                                value={o.name}
                                onChange={(e) =>
                                    option(i, { name: e.target.value })
                                }
                            />
                        </Field>
                        <Field title="Ввод">
                            <select
                                className={fieldClass}
                                value={o.input_type}
                                onChange={(e) =>
                                    option(i, {
                                        input_type: e.target
                                            .value as ServiceOption['input_type'],
                                    })
                                }
                            >
                                {Object.entries(inputLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </Field>
                        <Field title="Расчёт">
                            <select
                                className={fieldClass}
                                value={o.pricing_type}
                                onChange={(e) =>
                                    option(i, {
                                        pricing_type: e.target
                                            .value as ServiceOption['pricing_type'],
                                        ...(e.target.value === 'sqm'
                                            ? {
                                                  input_type:
                                                      'dimensions' as const,
                                              }
                                            : {}),
                                    })
                                }
                            >
                                {Object.entries(pricingLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </Field>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={o.is_active}
                                onChange={(e) =>
                                    option(i, { is_active: e.target.checked })
                                }
                            />
                            Вариант активен
                        </label>
                        {!o.id && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    form.setData(
                                        'options',
                                        form.data.options.filter(
                                            (_, j) => j !== i,
                                        ),
                                    )
                                }
                            >
                                Убрать вариант
                            </Button>
                        )}
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        form.setData('options', [
                            ...form.data.options,
                            newOption(),
                        ])
                    }
                >
                    Добавить вариант
                </Button>
            </section>
            <section className="grid gap-3">
                <h3 className="font-semibold">
                    Дополнительные параметры клиента
                </h3>
                <p className="text-sm text-muted-foreground">
                    Размеры в миллиметрах и количество уже предусмотрены. Здесь
                    можно добавить цвет, материал и другие характеристики.
                </p>
                {form.data.parameters.map((p, i) => (
                    <div
                        className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                        key={p.id ?? `new-${i}`}
                    >
                        <Field title="Название">
                            <input
                                className={fieldClass}
                                required
                                value={p.name}
                                onChange={(e) =>
                                    parameter(i, { name: e.target.value })
                                }
                            />
                        </Field>
                        <Field title="Ключ латиницей (например, color)">
                            <input
                                className={fieldClass}
                                required
                                disabled={p.id !== null}
                                value={p.key}
                                onChange={(e) =>
                                    parameter(i, { key: e.target.value })
                                }
                            />
                        </Field>
                        <Field title="Тип значения">
                            <select
                                disabled={p.id !== null}
                                className={fieldClass}
                                value={p.type}
                                onChange={(e) =>
                                    parameter(i, {
                                        type: e.target
                                            .value as Parameter['type'],
                                    })
                                }
                            >
                                <option value="text">Текст</option>
                                <option value="number">Число</option>
                                <option value="boolean">Да / нет</option>
                                <option value="select">Выбор из списка</option>
                            </select>
                        </Field>
                        <Field title="Единица измерения">
                            <input
                                className={fieldClass}
                                value={p.unit}
                                onChange={(e) =>
                                    parameter(i, { unit: e.target.value })
                                }
                            />
                        </Field>
                        {p.type === 'number' && (
                            <>
                                <Field title="Минимум">
                                    <input
                                        type="number"
                                        step="any"
                                        className={fieldClass}
                                        value={p.min_value ?? ''}
                                        onChange={(e) =>
                                            parameter(i, {
                                                min_value: e.target.value,
                                            })
                                        }
                                    />
                                </Field>
                                <Field title="Максимум">
                                    <input
                                        type="number"
                                        step="any"
                                        className={fieldClass}
                                        value={p.max_value ?? ''}
                                        onChange={(e) =>
                                            parameter(i, {
                                                max_value: e.target.value,
                                            })
                                        }
                                    />
                                </Field>
                            </>
                        )}
                        {p.type === 'select' && (
                            <Field title="Варианты (каждый с новой строки)">
                                <textarea
                                    className={fieldClass}
                                    value={p.choices.join('\n')}
                                    onChange={(e) =>
                                        parameter(i, {
                                            choices: e.target.value.split('\n'),
                                        })
                                    }
                                />
                            </Field>
                        )}
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={p.is_required}
                                onChange={(e) =>
                                    parameter(i, {
                                        is_required: e.target.checked,
                                    })
                                }
                            />
                            Обязательный
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={p.is_active}
                                onChange={(e) =>
                                    parameter(i, {
                                        is_active: e.target.checked,
                                    })
                                }
                            />
                            Параметр активен
                        </label>
                        {!p.id && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    form.setData(
                                        'parameters',
                                        form.data.parameters.filter(
                                            (_, j) => j !== i,
                                        ),
                                    )
                                }
                            >
                                Убрать параметр
                            </Button>
                        )}
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        form.setData('parameters', [
                            ...form.data.parameters,
                            newParameter(),
                        ])
                    }
                >
                    Добавить параметр
                </Button>
            </section>
            <Errors errors={form.errors} />
            <Button disabled={form.processing || categories.length === 0}>
                Сохранить услугу
            </Button>
            {form.recentlySuccessful && (
                <p role="status" className="text-sm">
                    Сохранено
                </p>
            )}
        </form>
    );
}

export default function AdminServices({
    categories,
    services,
}: {
    categories: Category[];
    services: CatalogService[];
}) {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <>
            <Head title="Каталог услуг" />
            <main className="grid gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Каталог услуг</h1>
                    <p className="mt-2 text-muted-foreground">
                        Категории, параметры и способы оценки работы.
                        Архивирование сохраняет историю заявок.
                    </p>
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
                    <aside className="grid gap-4">
                        <CategoryEditor categories={categories} />
                        {categories.map((c) => (
                            <details
                                key={c.id}
                                className="rounded-lg border p-3"
                            >
                                <summary className="cursor-pointer text-sm">
                                    {categoryPath(c, categories)}
                                    {!c.is_active && ' · архив'}
                                </summary>
                                <CategoryEditor
                                    key={JSON.stringify(c)}
                                    category={c}
                                    categories={categories}
                                />
                            </details>
                        ))}
                    </aside>
                    <div className="grid gap-4">
                        <Field title="Редактировать услугу">
                            <select
                                className={fieldClass}
                                value={selected ?? ''}
                                onChange={(e) =>
                                    setSelected(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            >
                                <option value="">Создать новую услугу</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                        {!s.is_active && ' · архив'}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <ServiceEditor
                            key={
                                JSON.stringify(
                                    services.find((s) => s.id === selected),
                                ) ?? 'new'
                            }
                            service={services.find((s) => s.id === selected)}
                            categories={categories}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}
AdminServices.layout = {
    breadcrumbs: [{ title: 'Каталог услуг', href: index() }],
};
