import type {
    MarketplaceCompany,
    RequestFormState,
} from '@/lib/okna-market';
import { formatCurrency } from '@/lib/okna-market';

type Props = {
    company: MarketplaceCompany;
    estimate: [number, number];
    actionLabel: string;
};

export function CompanyCard({ company, estimate, actionLabel }: Props) {
    const priceMin = estimate[0] * company.priceMultiplier;
    const priceMax = estimate[1] * company.priceMultiplier;

    return (
        <article className="company-card">
            <div className={`company-logo ${company.tone}`}>{company.initials}</div>
            <div className="company-info">
                <h3>{company.name}</h3>
                <p>{company.description}</p>
                <div className="company-tags">
                    <span className="rating-tag">
                        ★ {company.rating.toFixed(1)} / {company.reviews} отзывов
                    </span>
                    <span className="green-tag">{company.badge}</span>
                </div>
                <ul className="company-features">
                    <li>Дата: {company.nextAvailableDate}</li>
                    <li>Гарантия: {company.guarantee}</li>
                    <li>Районы: {company.districts.join(', ')}</li>
                    <li>{company.feature}</li>
                </ul>
            </div>
            <div className="company-action">
                <span>Предварительно</span>
                <strong>
                    {formatCurrency(priceMin)} - {formatCurrency(priceMax)}
                </strong>
                <button className="btn btn-primary" type="button">
                    {actionLabel}
                </button>
            </div>
        </article>
    );
}

export function buildCompanyEstimate(
    baseEstimate: [number, number],
    company: MarketplaceCompany,
): [number, number] {
    return [
        Math.round(baseEstimate[0] * company.priceMultiplier),
        Math.round(baseEstimate[1] * company.priceMultiplier),
    ];
}

export function matchesRequest(
    company: MarketplaceCompany,
    request: RequestFormState,
): boolean {
    return company.serviceKeys.includes(request.serviceKey);
}
