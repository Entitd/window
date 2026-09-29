import { Head, Link, usePage } from '@inertiajs/react';
import { index } from '@/actions/App/Http/Controllers/CatalogController';
import { BookingForm } from '@/components/okna-market/booking-form';
import type {
    PublicOffering,
    BookingSelection,
} from '@/components/okna-market/booking-form';
import { FindCompanyForm } from '@/components/okna-market/find-company-form';
import { MarketShell } from '@/components/okna-market/market-shell';
import type { CatalogService } from '@/components/service-catalog-fields';
import { queryItems } from '@/lib/catalog-booking';
import { searchResults } from '@/routes';

export default function Catalog({
    services,
    offerings,
}: {
    services: CatalogService[];
    offerings: PublicOffering[];
}) {
    const { url } = usePage();
    const query = new URL(url, 'https://local.invalid').searchParams;
    const rateId = Number(query.get('rate_id'));
    const requested = queryItems(url);

    if (!requested.length && rateId) {
        requested.push(Object.fromEntries(query.entries()));
    }

    const selections: BookingSelection[] = [];

    for (const values of requested) {
        const offering = offerings.find((item) =>
            item.rates.some((rate) => rate.id === Number(values.rate_id)),
        );
        const rate = offering?.rates.find(
            (item) => item.id === Number(values.rate_id),
        );
        const service = services.find(
            (item) => item.id === offering?.service_id,
        );

        if (service && offering && rate) {
            selections.push({ service, offering, rate, values });
        }
    }

    const booking =
        selections.length > 0 &&
        selections.length === requested.length &&
        selections.every(
            (selection) =>
                selection.offering.vendor_id ===
                selections[0].offering.vendor_id,
        );
    const searchQuery = {
        items: Object.fromEntries(
            selections.map(({ service, rate, values }, index) => [
                index,
                {
                    service_id: service.id,
                    option_id: rate.service_option_id,
                    quantity: values.quantity ?? '1',
                    width: values.width_mm
                        ? Number(values.width_mm) / 10
                        : undefined,
                    height: values.height_mm
                        ? Number(values.height_mm) / 10
                        : undefined,
                },
            ]),
        ),
        city: query.get('city') ?? selections[0]?.offering.vendor.city,
        comment: query.get('comment') ?? '',
        installationDate: query.get('installation_date') ?? '',
    };

    return (
        <>
            <Head title={booking ? 'Проверить заявку' : 'Выбрать услугу'} />
            <MarketShell activePage="catalog">
                <section className="container grid gap-6 py-10">
                    <div className="mx-auto grid w-full max-w-4xl gap-6">
                        <div>
                            <p className="mb-3 text-sm text-muted-foreground">
                                Услуга → Подбор компаний → Заявка
                            </p>
                            <h1 className="text-3xl font-semibold">
                                {booking
                                    ? 'Осталось проверить заявку'
                                    : 'Найдём того, кто поможет с окнами'}
                            </h1>
                            <p className="mt-3 text-muted-foreground">
                                {booking
                                    ? 'Компания получит ваши пожелания и согласует с вами итоговую стоимость и время работ.'
                                    : 'Установка, ремонт или замена деталей — начните с нужной работы.'}
                            </p>
                        </div>
                        {booking ? (
                            <>
                                <Link
                                    className="text-sm text-primary underline underline-offset-4"
                                    href={searchResults.url({
                                        query: searchQuery,
                                    })}
                                >
                                    ← Вернуться к выбору компании
                                </Link>
                                <BookingForm
                                    key={selections
                                        .map(({ rate }) => rate.id)
                                        .join('-')}
                                    selections={selections}
                                />
                            </>
                        ) : (
                            <>
                                {rateId > 0 && (
                                    <p
                                        role="status"
                                        className="rounded-xl border p-4"
                                    >
                                        Это предложение больше недоступно.
                                        Выберите услугу, чтобы найти другую
                                        компанию.{' '}
                                        <Link
                                            href={index.url()}
                                            className="underline"
                                        >
                                            Начать подбор
                                        </Link>
                                    </p>
                                )}
                                <FindCompanyForm
                                    key={url}
                                    services={services}
                                />
                            </>
                        )}
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
