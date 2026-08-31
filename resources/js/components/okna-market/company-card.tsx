import type { MarketplaceCompany, RequestFormState } from '@/lib/okna-market';

type Props = {
    company: MarketplaceCompany;
    estimate: [number, number];
    actionLabel: string;
};

export function CompanyCard({ company, actionLabel }: Props) {
    return (
        <article className="company-card">
            <div className={`company-logo ${company.tone}`}>
                {company.initials}
            </div>
            <div className="company-info">
                <h3>{company.name}</h3>
                <p>{company.description}</p>
                <div className="company-tags">
                    <span className="rating-tag">{company.reviewsLabel}</span>
                    <span className="green-tag">{company.badge}</span>
                </div>
                <ul className="company-features">
                    <li>
                        Услуга: {company.matchedServiceName ?? 'уточняется'}
                    </li>
                    <li>Срок: {company.availabilityLabel}</li>
                    <li>Районы: {company.districts.join(', ')}</li>
                    <li>{company.feature}</li>
                </ul>
            </div>
            <div className="company-action">
                <span>Цена компании</span>
                <strong>{company.priceLabel}</strong>
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
    if (!company.sortPrice) {
        return baseEstimate;
    }

    return [Math.round(company.sortPrice), Math.round(company.sortPrice)];
}

export function matchesRequest(
    company: MarketplaceCompany,
    request: RequestFormState,
): boolean {
    return company.serviceKeys.includes(request.serviceKey);
}
