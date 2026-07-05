import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { MarketShell } from '@/components/okna-market/market-shell';
import type {
    MarketplaceCompany,
    PriceFilterKey,
    SortKey,
} from '@/lib/okna-market';
import {
    buildEstimate,
    formatCurrency,
    getExtraWorkLabels,
    getServiceLabel,
    MARKETPLACE_PATHS,
    parseSearchState,
    priceFilterOptions,
    sortOptions,
} from '@/lib/okna-market';

type CreatedRequest = {
    id: string;
    companyName: string;
    priceRange: string;
    createdAt: string;
};

type PageProps = {
    companies: MarketplaceCompany[];
};

export default function SearchResults() {
    const { url, props } = usePage<PageProps>();
    const companies = props.companies;
    const request = useMemo(() => parseSearchState(url), [url]);
    const estimate = useMemo(() => buildEstimate(request), [request]);
    const [sortKey, setSortKey] = useState<SortKey>('price');
    const [priceFilter, setPriceFilter] = useState<PriceFilterKey>('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [submittingCompanyName, setSubmittingCompanyName] = useState<
        string | null
    >(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createdRequest, setCreatedRequest] = useState<CreatedRequest | null>(
        null,
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
                    priceFilter !== 'all' &&
                    (!company.sortPrice || company.sortPrice > Number(priceFilter))
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
    }, [companies, districtFilter, priceFilter, sortKey]);

    const selectedExtras = getExtraWorkLabels(request.extraWorks);
    const requestDistrict = useMemo(
        () => extractDistrictFromLocation(request.city),
        [request.city],
    );

    const createRequest = (company: MarketplaceCompany) => {
        if (!company.id) {
            setSubmitError('Не удалось определить компанию для заявки.');
            return;
        }

        setSubmitError(null);
        setSubmittingCompanyName(company.name);

        router.post(
            '/client/requests',
            {
                service_key: request.serviceKey,
                vendor_id: company.id,
                city: request.city,
                district:
                    districtFilter === 'all' ? requestDistrict : districtFilter,
                installation_date: request.installationDate || null,
                window_width: Number(request.width),
                window_height: Number(request.height),
                additional_services: request.extraWorks,
                comment: request.comment || null,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const message = Object.values(errors).join(' ');

                    setSubmitError(
                        message ||
                            'Не удалось создать заявку. Проверьте поля и попробуйте еще раз.',
                    );
                },
                onFinish: () => {
                    setSubmittingCompanyName(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="Результаты подбора" />

            <MarketShell
                activePage="search-results"
                ctaHref={MARKETPLACE_PATHS.home}
                ctaLabel="Новая заявка"
            >
                <section className="page-hero">
                    <div className="container">
                        <span className="eyebrow">Результаты подбора</span>
                        <h1 className="page-title">
                            Проверенные компании, которые подходят по услуге и
                            району
                        </h1>
                        <p className="page-intro">
                            В выдаче только подтвержденные компании с активной
                            услугой. Цена берется из профиля компании, а сроки
                            и детали подтверждаются после заявки.
                        </p>
                    </div>
                </section>

                <section className="summary-section">
                    <div className="summary-card container">
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span>Город / район</span>
                                <strong>{request.city}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Дата</span>
                                <strong>
                                    {request.installationDate || 'Не выбрана'}
                                </strong>
                            </div>
                            <div className="summary-item">
                                <span>Размеры окна</span>
                                <strong>
                                    {request.width} x {request.height} см
                                </strong>
                            </div>
                            <div className="summary-item">
                                <span>Услуга</span>
                                <strong>
                                    {getServiceLabel(request.serviceKey)}
                                </strong>
                            </div>
                            <div className="summary-item summary-item-wide">
                                <span>Дополнительные работы</span>
                                <strong>
                                    {selectedExtras.length > 0
                                        ? selectedExtras.join(', ')
                                        : 'Без дополнительных работ'}
                                </strong>
                            </div>
                            <div className="summary-item">
                                <span>Ориентир по форме</span>
                                <strong>
                                    {formatCurrency(estimate[0])} -{' '}
                                    {formatCurrency(estimate[1])}
                                </strong>
                            </div>
                            {(request.name || request.phone) && (
                                <div className="summary-item">
                                    <span>Контакт</span>
                                    <strong>
                                        {[request.name, request.phone]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </strong>
                                </div>
                            )}
                            {request.comment && (
                                <div className="summary-item summary-item-wide">
                                    <span>Комментарий</span>
                                    <strong>{request.comment}</strong>
                                </div>
                            )}
                        </div>

                        <div className="summary-actions">
                            <Link
                                className="btn btn-primary"
                                href={MARKETPLACE_PATHS.home}
                            >
                                Изменить заявку
                            </Link>
                        </div>
                    </div>
                </section>

                {createdRequest && (
                    <section
                        className="summary-section"
                        id="request-confirmation"
                    >
                        <div className="request-created-card container">
                            <div>
                                <span className="faq-kicker">
                                    Заявка создана
                                </span>
                                <h2>
                                    {createdRequest.id} передана компании{' '}
                                    {createdRequest.companyName}
                                </h2>
                                <p>
                                    Заявка создана в базе и доступна в личном
                                    кабинете клиента. Компания сможет обработать
                                    ее после подключения очереди заявок.
                                </p>
                            </div>

                            <div className="request-created-grid">
                                <div className="request-created-item">
                                    <span>Статус</span>
                                    <strong>Ожидает подтверждения</strong>
                                </div>
                                <div className="request-created-item">
                                    <span>Создана</span>
                                    <strong>{createdRequest.createdAt}</strong>
                                </div>
                                <div className="request-created-item">
                                    <span>Цена</span>
                                    <strong>{createdRequest.priceRange}</strong>
                                </div>
                                <div className="request-created-item">
                                    <span>Следующий шаг</span>
                                    <strong>
                                        Компания принимает заявку или предлагает
                                        другое время.
                                    </strong>
                                </div>
                            </div>

                            <div className="request-created-actions">
                                <Link
                                    className="btn btn-primary"
                                    href="/client/dashboard"
                                >
                                    Открыть кабинет клиента
                                </Link>
                                <Link
                                    className="btn btn-secondary"
                                    href={MARKETPLACE_PATHS.home}
                                >
                                    Изменить заявку
                                </Link>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setCreatedRequest(null);
                                        document
                                            .getElementById('companies')
                                            ?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start',
                                            });
                                    }}
                                    type="button"
                                >
                                    Выбрать другую компанию
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                <section className="catalog-section">
                    <div className="catalog-layout container" id="companies">
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

                            {submitError && (
                                <div className="request-created-card">
                                    <strong>Не удалось создать заявку</strong>
                                    <p>{submitError}</p>
                                </div>
                            )}

                            {visibleCompanies.map((company) => (
                                <article
                                    className={`company-card ${
                                        createdRequest?.companyName ===
                                        company.name
                                            ? 'selected'
                                            : ''
                                    }`}
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
                                                    getServiceLabel(
                                                        request.serviceKey,
                                                    )}
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
                                        <button
                                            className="btn btn-primary"
                                            disabled={
                                                submittingCompanyName !== null
                                            }
                                            onClick={() =>
                                                createRequest(company)
                                            }
                                            type="button"
                                        >
                                            {createdRequest?.companyName ===
                                            company.name
                                                ? 'Открыть подтверждение'
                                                : 'Выбрать компанию'}
                                        </button>
                                    </div>
                                </article>
                            ))}

                            {visibleCompanies.length === 0 && (
                                <div className="request-created-card">
                                    <strong>
                                        Подходящих подтвержденных компаний пока
                                        нет
                                    </strong>
                                    <p>
                                        В выдачу попадают только компании,
                                        которые прошли модерацию, работают в
                                        выбранном районе и добавили активную
                                        услугу в личном кабинете.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}

function extractDistrictFromLocation(location: string): string | null {
    const district = location
        .split(',')
        .map((part) => part.trim())
        .find((part) => part.toLowerCase().includes('район'));

    return district ? district.replace(/район/i, '').trim() : null;
}
