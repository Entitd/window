import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { index, store } from '@/actions/App/Http/Controllers/CatalogController';
import { MarketShell } from '@/components/okna-market/market-shell';
import {
    CategoryOptions,
    isWithinCategory,
    Errors,
    Field,
    fieldClass,
    pricingLabels,
} from '@/components/service-catalog-fields';
import type {
    CatalogService,
    Category,
    Offering,
    Rate,
} from '@/components/service-catalog-fields';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import type { Auth } from '@/types';

type PublicOffering = Offering & {
    vendor: {
        company_name: string;
        city: string;
        districts: { id: number; name: string }[];
    };
};
function BookingForm({
    service,
    offering,
    rate,
}: {
    service: CatalogService;
    offering: PublicOffering;
    rate: Rate;
}) {
    const { auth } = usePage<{ auth: { user: Auth['user'] | null } }>().props;
    const form = useForm({
        rate_id: rate.id,
        quantity: '1',
        width_mm: '',
        height_mm: '',
        city: offering.vendor.city,
        district: '',
        installation_date: '',
        comment: '',
        parameters: Object.fromEntries(
            service.parameters.map((p) => [
                p.key,
                p.type === 'boolean' ? '' : '',
            ]),
        ) as Record<string, string>,
    });
    const dimensions = rate.option.input_type === 'dimensions';
    const total =
        rate.price === null
            ? null
            : Number(rate.price) *
              (rate.option.pricing_type === 'fixed'
                  ? 1
                  : Number(form.data.quantity)) *
              (rate.option.pricing_type === 'sqm'
                  ? (Number(form.data.width_mm) * Number(form.data.height_mm)) /
                    1000000
                  : 1);
    const priceReady =
        !dimensions ||
        (Number(form.data.width_mm) > 0 && Number(form.data.height_mm) > 0);

    return (
        <form
            className="grid gap-4 rounded-xl border bg-card p-5"
            onSubmit={(e) => {
                e.preventDefault();
                form.post(store.url());
            }}
        >
            <h2 className="text-xl font-semibold">
                {service.name} — {offering.vendor.company_name}
            </h2>
            <p>
                {rate.option.name} · {pricingLabels[rate.option.pricing_type]}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field title="Количество">
                    <input
                        className={fieldClass}
                        type="number"
                        required
                        min="1"
                        max="1000"
                        value={form.data.quantity}
                        onChange={(e) =>
                            form.setData('quantity', e.target.value)
                        }
                    />
                </Field>
                {dimensions && (
                    <>
                        <Field title="Ширина, мм">
                            <input
                                className={fieldClass}
                                type="number"
                                min="1"
                                max="100000"
                                required
                                value={form.data.width_mm}
                                onChange={(e) =>
                                    form.setData('width_mm', e.target.value)
                                }
                            />
                        </Field>
                        <Field title="Высота, мм">
                            <input
                                className={fieldClass}
                                type="number"
                                min="1"
                                max="100000"
                                required
                                value={form.data.height_mm}
                                onChange={(e) =>
                                    form.setData('height_mm', e.target.value)
                                }
                            />
                        </Field>
                    </>
                )}
                {service.parameters.map((p) => (
                    <Field
                        key={p.id}
                        title={`${p.name}${p.unit ? `, ${p.unit}` : ''}${p.is_required ? ' *' : ''}`}
                    >
                        {p.type === 'select' || p.type === 'boolean' ? (
                            <select
                                className={fieldClass}
                                required={p.is_required}
                                value={form.data.parameters[p.key]}
                                onChange={(e) =>
                                    form.setData('parameters', {
                                        ...form.data.parameters,
                                        [p.key]: e.target.value,
                                    })
                                }
                            >
                                <option value="">Не выбрано</option>
                                {(p.type === 'boolean'
                                    ? [
                                          { value: '1', name: 'Да' },
                                          { value: '0', name: 'Нет' },
                                      ]
                                    : p.choices.map((value) => ({
                                          value,
                                          name: value,
                                      }))
                                ).map((c) => (
                                    <option value={c.value} key={c.value}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                className={fieldClass}
                                type={p.type === 'number' ? 'number' : 'text'}
                                step={
                                    p.type === 'number' ? '0.0001' : undefined
                                }
                                min={p.min_value ?? undefined}
                                max={p.max_value ?? undefined}
                                required={p.is_required}
                                value={form.data.parameters[p.key]}
                                onChange={(e) =>
                                    form.setData('parameters', {
                                        ...form.data.parameters,
                                        [p.key]: e.target.value,
                                    })
                                }
                            />
                        )}
                    </Field>
                ))}
                <Field title="Город">
                    <input
                        className={fieldClass}
                        required
                        value={form.data.city}
                        onChange={(e) => form.setData('city', e.target.value)}
                    />
                </Field>
                <Field title="Район">
                    <select
                        className={fieldClass}
                        value={form.data.district}
                        onChange={(e) =>
                            form.setData('district', e.target.value)
                        }
                    >
                        <option value="">Уточнить позже</option>
                        {offering.vendor.districts.map((d) => (
                            <option key={d.id} value={d.name}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field title="Желаемая дата">
                    <input
                        className={fieldClass}
                        type="date"
                        value={form.data.installation_date}
                        onChange={(e) =>
                            form.setData('installation_date', e.target.value)
                        }
                    />
                </Field>
            </div>
            <Field title="Комментарий">
                <textarea
                    className={fieldClass}
                    maxLength={2000}
                    value={form.data.comment}
                    onChange={(e) => form.setData('comment', e.target.value)}
                />
            </Field>
            <p className="text-lg font-semibold">
                {total === null
                    ? 'Стоимость после замера'
                    : !priceReady
                      ? 'Введите размеры для расчёта'
                      : `Примерная стоимость: ${total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`}
            </p>
            <p className="text-sm text-muted-foreground">
                Окончательная стоимость и дата согласовываются с компанией.
            </p>
            <Errors errors={form.errors} />
            {!auth.user ? (
                <Button asChild>
                    <Link href={login()}>Войти для отправки заявки</Link>
                </Button>
            ) : auth.user.role === 'client' ? (
                <Button disabled={form.processing}>
                    Отправить заявку компании
                </Button>
            ) : (
                <p>Для отправки заявки нужен кабинет клиента.</p>
            )}
        </form>
    );
}

export default function Catalog({
    categories,
    services,
    offerings,
}: {
    categories: Category[];
    services: CatalogService[];
    offerings: PublicOffering[];
}) {
    const [categoryId, setCategoryId] = useState('');
    const { url } = usePage();
    const [serviceId, setServiceId] = useState(
        () =>
            new URL(url, 'https://local.invalid').searchParams.get(
                'service_id',
            ) ?? '',
    );
    const [city, setCity] = useState('');
    const [rateId, setRateId] = useState<number | null>(
        () =>
            Number(
                new URL(url, 'https://local.invalid').searchParams.get(
                    'rate_id',
                ),
            ) || null,
    );
    const service = services.find((s) => s.id === Number(serviceId));
    const available = offerings.filter(
        (o) =>
            o.service_id === service?.id &&
            (!city ||
                o.vendor.city
                    .toLocaleLowerCase()
                    .includes(city.toLocaleLowerCase())),
    );
    const offering = available.find((o) =>
        o.rates.some((r) => r.id === rateId),
    );
    const rate = offering?.rates.find((r) => r.id === rateId);

    return (
        <>
            <Head title="Выбрать услугу" />
            <MarketShell
                activePage="catalog"
                ctaHref={index.url()}
                ctaLabel="Выбрать услугу"
            >
                <main className="container grid gap-6 py-10">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            Выберите услугу и способ расчёта
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            Укажите нужную работу, сравните тарифы компаний и
                            отправьте заявку.
                        </p>
                    </div>
                    <div className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-3">
                        <Field title="Категория">
                            <select
                                className={fieldClass}
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setServiceId('');
                                    setRateId(null);
                                }}
                            >
                                <option value="">Все категории</option>
                                <CategoryOptions categories={categories} />
                            </select>
                        </Field>
                        <Field title="Услуга">
                            <select
                                className={fieldClass}
                                value={serviceId}
                                onChange={(e) => {
                                    setServiceId(e.target.value);
                                    setRateId(null);
                                }}
                            >
                                <option value="">Выберите услугу</option>
                                {services
                                    .filter((s) =>
                                        isWithinCategory(
                                            s.category_id,
                                            categoryId,
                                            categories,
                                        ),
                                    )
                                    .map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                            </select>
                        </Field>
                        <Field title="Город компании">
                            <input
                                className={fieldClass}
                                placeholder="Все города"
                                value={city}
                                onChange={(e) => {
                                    setCity(e.target.value);
                                    setRateId(null);
                                }}
                            />
                        </Field>
                    </div>
                    {!services.length && <p>Пока нет доступных услуг.</p>}
                    {service && (
                        <>
                            <p>{service.description}</p>
                            {!available.length && (
                                <p>
                                    Пока нет компаний с этой услугой в выбранном
                                    городе.
                                </p>
                            )}
                            <div className="grid gap-4 md:grid-cols-2">
                                {available.map((o) => (
                                    <article
                                        key={o.id}
                                        className="grid content-start gap-3 rounded-xl border bg-card p-5"
                                    >
                                        <h2 className="text-lg font-semibold">
                                            {o.vendor.company_name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {o.vendor.city} · {o.description}
                                        </p>
                                        {o.rates.map((r) => (
                                            <Button
                                                key={r.id}
                                                type="button"
                                                variant={
                                                    rateId === r.id
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className="h-auto justify-start text-left whitespace-normal"
                                                onClick={() => setRateId(r.id)}
                                            >
                                                {r.option.name}:{' '}
                                                {r.price === null
                                                    ? 'после замера'
                                                    : `${Number(r.price).toLocaleString('ru-RU')} ₽ · ${pricingLabels[r.option.pricing_type]}`}
                                                {r.is_default
                                                    ? ' · основной'
                                                    : ''}
                                            </Button>
                                        ))}
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                    {service && offering && rate && (
                        <BookingForm
                            key={rate.id}
                            service={service}
                            offering={offering}
                            rate={rate}
                        />
                    )}
                </main>
            </MarketShell>
        </>
    );
}
