import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CalculateServiceBuilder,
    calculationLineToRequest,
} from '@/components/okna-market/calculate-service-builder';
import type { CalculationLine } from '@/components/okna-market/calculate-service-builder';
import { MarketShell } from '@/components/okna-market/market-shell';
import type {
    MarketplaceCompany,
    PriceFilterKey,
    SortKey,
} from '@/lib/okna-market';
import {
    buildSearchParams,
    getServiceLabel,
    parseSearchState,
    priceFilterOptions,
    sortOptions,
} from '@/lib/okna-market';
import { login, searchResults } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: {
        user: Auth['user'] | null;
    };
    companies: MarketplaceCompany[];
};

const fallbackLine: Omit<
    CalculationLine,
    'serviceKey' | 'width' | 'height' | 'extraWorks'
> = {
    id: 1,
    windowTypeKey: 'double',
    materialKey: 'plastic',
    quantity: '1',
};

export default function Calculate() {
    const { url, props } = usePage<PageProps>();
    const { auth, companies } = props;
    const request = useMemo(() => parseSearchState(url), [url]);
    const [calculationLines, setCalculationLines] = useState<CalculationLine[]>(
        [],
    );
    const [city, setCity] = useState(request.city);
    const [sortKey, setSortKey] = useState<SortKey>('price');
    const [priceFilter, setPriceFilter] = useState<PriceFilterKey>('all');
    const [districtFilter, setDistrictFilter] = useState('all');

    const selectedServiceKeys = useMemo(() => {
        if (calculationLines.length > 0) {
            return calculationLines.map((line) => line.serviceKey);
        }

        return [request.serviceKey];
    }, [calculationLines, request.serviceKey]);

    const primaryRequest = calculationLineToRequest(
        calculationLines[0] ?? {
            ...fallbackLine,
            serviceKey: request.serviceKey,
            width: request.width,
            height: request.height,
            extraWorks: request.extraWorks,
        },
        city,
    );

    const districtOptions = useMemo(() => {
        return Array.from(
            new Set(companies.flatMap((company) => company.districts)),
        );
    }, [companies]);

    const visibleCompanies = useMemo(() => {
        return companies
            .filter((company) => {
                if (
                    !selectedServiceKeys.some((serviceKey) =>
                        company.serviceKeys.includes(serviceKey),
                    )
                ) {
                    return false;
                }

                if (
                    priceFilter !== 'all' &&
                    (!company.sortPrice ||
                        company.sortPrice > Number(priceFilter))
                ) {
                    return false;
                }

                return (
                    districtFilter === 'all' ||
                    company.districts.includes(districtFilter)
                );
            })
            .sort((firstCompany, secondCompany) => {
                if (sortKey === 'company') {
                    return firstCompany.name.localeCompare(
                        secondCompany.name,
                        'ru',
                    );
                }

                return (
                    (firstCompany.sortPrice ?? Number.MAX_SAFE_INTEGER) -
                    (secondCompany.sortPrice ?? Number.MAX_SAFE_INTEGER)
                );
            });
    }, [companies, districtFilter, priceFilter, selectedServiceKeys, sortKey]);

    const searchResultsHref = searchResults.url({
        query: buildSearchParams(primaryRequest),
    });
    const canCreateRequest = auth.user?.role === 'client';

    return (
        <>
            <Head title="Рассчитать стоимость окон" />

            <MarketShell activePage="calculate">
                <section className="page-hero page-hero-compact">
                    <div className="container">
                        <h1 className="page-title">Посчитаем окна</h1>
                    </div>
                </section>

                <section className="summary-section">
                    <CalculateServiceBuilder
                        initialRequest={request}
                        onChange={(lines, nextCity) => {
                            setCalculationLines(lines);
                            setCity(nextCity);
                        }}
                    />
                </section>

                <section className="catalog-section">
                    <div className="catalog-layout container">
                        <aside className="filters-card">
                            <h3>Фильтры</h3>

                            <div className="filter-group">
                                <h4>Цена компании</h4>
                                <div className="stack-chips">
                                    {priceFilterOptions.map((option) => (
                                        <button
                                            className={`sort-chip ${
                                                priceFilter === option.key
                                                    ? 'active'
                                                    : ''
                                            }`}
                                            key={option.key}
                                            onClick={() =>
                                                setPriceFilter(option.key)
                                            }
                                            type="button"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4>Район</h4>
                                <select
                                    className="select-input"
                                    onChange={(event) =>
                                        setDistrictFilter(event.target.value)
                                    }
                                    value={districtFilter}
                                >
                                    <option value="all">Любой район</option>
                                    {districtOptions.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </aside>

                        <div className="catalog-content">
                            <div className="sort-panel">
                                <span>Сортировка:</span>
                                {sortOptions.map((option) => (
                                    <button
                                        className={`sort-chip ${
                                            sortKey === option.key
                                                ? 'active'
                                                : ''
                                        }`}
                                        key={option.key}
                                        onClick={() => setSortKey(option.key)}
                                        type="button"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div className="results-count">
                                Найдено компаний: {visibleCompanies.length}
                            </div>

                            {visibleCompanies.map((company) => (
                                <article
                                    className="company-card"
                                    key={company.id ?? company.name}
                                >
                                    <div
                                        className={`company-logo ${company.tone}`}
                                    >
                                        {company.initials}
                                    </div>
                                    <div className="company-info">
                                        <h3>{company.name}</h3>
                                        <p>{company.description}</p>
                                        <div className="company-tags">
                                            <span className="rating-tag">
                                                {company.reviewsLabel}
                                            </span>
                                            <span className="green-tag">
                                                {company.badge}
                                            </span>
                                        </div>
                                        <ul className="company-features">
                                            <li>
                                                Услуга:{' '}
                                                {company.matchedServiceName ||
                                                    selectedServiceKeys
                                                        .map(getServiceLabel)
                                                        .join(', ')}
                                            </li>
                                            <li>
                                                Срок:{' '}
                                                {company.availabilityLabel}
                                            </li>
                                            <li>
                                                Районы:{' '}
                                                {company.districts.length > 0
                                                    ? company.districts.join(
                                                          ', ',
                                                      )
                                                    : 'уточняются'}
                                            </li>
                                            <li>
                                                Активных услуг:{' '}
                                                {company.servicesCount}
                                            </li>
                                            <li>{company.feature}</li>
                                        </ul>
                                    </div>
                                    <div className="company-action">
                                        <span>Цена компании</span>
                                        <strong>{company.priceLabel}</strong>
                                        {canCreateRequest ? (
                                            <Link
                                                className="btn btn-primary"
                                                href={searchResultsHref}
                                            >
                                                Выбрать компанию
                                            </Link>
                                        ) : (
                                            <Link
                                                className="btn btn-secondary"
                                                href={login.url({
                                                    query: {
                                                        redirect:
                                                            searchResultsHref,
                                                    },
                                                })}
                                            >
                                                Войти для заявки
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            ))}

                            {visibleCompanies.length === 0 && (
                                <div className="request-created-card">
                                    <strong>
                                        По этим параметрам компании не найдены
                                    </strong>
                                    <p>
                                        Попробуйте изменить район, услугу или
                                        дополнительные работы. В выдачу попадают
                                        только компании с активными услугами и
                                        пройденной модерацией.
                                    </p>
                                </div>
                            )}

                            {visibleCompanies.length > 0 && (
                                <div className="summary-actions">
                                    <Link
                                        className="btn btn-secondary"
                                        href={searchResultsHref}
                                    >
                                        Открыть полную выдачу
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
