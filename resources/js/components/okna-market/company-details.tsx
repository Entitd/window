import type { MarketplaceCompany } from '@/lib/okna-market';

export function CompanyDetails({ company }: { company: MarketplaceCompany }) {
    return (
        <div className="mt-3 grid gap-2 text-sm">
            <p>Выполнено заказов на сервисе: {company.completedOrders ?? 0}</p>
            <p>
                Гарантия:{' '}
                {company.warrantyMonths
                    ? `${company.warrantyMonths} мес.`
                    : 'Срок уточняется'}
            </p>
            <p className="whitespace-pre-wrap">
                {company.warrantyDescription ||
                    'Условия гарантии уточняются у компании'}
            </p>
            {!!company.reviews?.length && (
                <details>
                    <summary className="cursor-pointer font-medium">
                        Отзывы клиентов
                    </summary>
                    <div className="mt-2 grid gap-3">
                        {company.reviews.map((review) => (
                            <blockquote
                                key={review.id}
                                className="rounded-lg bg-muted/50 p-3"
                            >
                                <p>{review.stars} / 5</p>
                                <p className="whitespace-pre-wrap">
                                    {review.comment}
                                </p>
                            </blockquote>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}
