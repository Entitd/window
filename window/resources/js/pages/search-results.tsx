import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { MarketShell } from '@/components/okna-market/market-shell';
import type { PriceFilterKey, SortKey } from '@/lib/okna-market';
import {
    buildEstimate,
    formatCurrency,
    getExtraWorkLabels,
    getServiceLabel,
    MARKETPLACE_PATHS,
    marketplaceCompanies,
    parseSearchState,
    priceFilterOptions,
    sortOptions,
} from '@/lib/okna-market';

export default function SearchResults() {
    const { url } = usePage();
    const request = useMemo(() => parseSearchState(url), [url]);
    const estimate = useMemo(() => buildEstimate(request), [request]);
    const [sortKey, setSortKey] = useState<SortKey>('price');
    const [priceFilter, setPriceFilter] = useState<PriceFilterKey>('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const districtOptions = useMemo(() => {
        return Array.from(
            new Set(
                marketplaceCompanies.flatMap((company) => company.districts),
            ),
        );
    }, []);

    const visibleCompanies = useMemo(() => {
        return marketplaceCompanies
            .filter((company) => company.serviceKeys.includes(request.serviceKey))
            .filter((company) => {
                const maxPrice = estimate[1] * company.priceMultiplier;

                if (
                    priceFilter !== 'all' &&
                    maxPrice > Number(priceFilter)
                ) {
                    return false;
                }

                if (
                    districtFilter !== 'all' &&
                    !company.districts.includes(districtFilter)
                ) {
                    return false;
                }

                if (ratingFilter === '47' && company.rating < 4.7) {
                    return false;
                }

                if (ratingFilter === '48' && company.rating < 4.8) {
                    return false;
                }

                if (dateFilter === 'fast' && company.nextAvailableRank > 2) {
                    return false;
                }

                if (dateFilter === 'week' && company.nextAvailableRank > 4) {
                    return false;
                }

                return true;
            })
            .sort((firstCompany, secondCompany) => {
                if (sortKey === 'rating') {
                    return secondCompany.rating - firstCompany.rating;
                }

                if (sortKey === 'date') {
                    return (
                        firstCompany.nextAvailableRank -
                        secondCompany.nextAvailableRank
                    );
                }

                return firstCompany.priceMultiplier - secondCompany.priceMultiplier;
            });
    }, [
        dateFilter,
        districtFilter,
        estimate,
        priceFilter,
        ratingFilter,
        request.serviceKey,
        sortKey,
    ]);

    const selectedExtras = getExtraWorkLabels(request.extraWorks);

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
                            Компании по вашей заявке уже отсортированы по срокам,
                            цене и рейтингу
                        </h1>
                        <p className="page-intro">
                            Пока это mock-данные фронтенда. Логика поиска и
                            подтверждения компаний подключится на backend-этапе.
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
                                    {request.width} × {request.height} см
                                </strong>
                            </div>
                            <div className="summary-item">
                                <span>Услуга</span>
                                <strong>{getServiceLabel(request.serviceKey)}</strong>
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
                                <span>Диапазон цены</span>
                                <strong>
                                    {formatCurrency(estimate[0])} -{' '}
                                    {formatCurrency(estimate[1])}
                                </strong>
                            </div>
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

                <section className="catalog-section">
                    <div className="container catalog-layout">
                        <aside className="filters-card">
                            <h3>Фильтры</h3>

                            <div className="filter-group">
                                <h4>Цена</h4>
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
                                <h4>Рейтинг</h4>
                                <label className="checkbox-row">
                                    <input
                                        checked={ratingFilter === '47'}
                                        onChange={() =>
                                            setRatingFilter(
                                                ratingFilter === '47'
                                                    ? 'all'
                                                    : '47',
                                            )
                                        }
                                        type="checkbox"
                                    />
                                    от 4.7 и выше
                                </label>
                                <label className="checkbox-row">
                                    <input
                                        checked={ratingFilter === '48'}
                                        onChange={() =>
                                            setRatingFilter(
                                                ratingFilter === '48'
                                                    ? 'all'
                                                    : '48',
                                            )
                                        }
                                        type="checkbox"
                                    />
                                    от 4.8 и выше
                                </label>
                            </div>

                            <div className="filter-group">
                                <h4>Дата</h4>
                                <label className="checkbox-row">
                                    <input
                                        checked={dateFilter === 'fast'}
                                        onChange={() =>
                                            setDateFilter(
                                                dateFilter === 'fast'
                                                    ? 'all'
                                                    : 'fast',
                                            )
                                        }
                                        type="checkbox"
                                    />
                                    сегодня или завтра
                                </label>
                                <label className="checkbox-row">
                                    <input
                                        checked={dateFilter === 'week'}
                                        onChange={() =>
                                            setDateFilter(
                                                dateFilter === 'week'
                                                    ? 'all'
                                                    : 'week',
                                            )
                                        }
                                        type="checkbox"
                                    />
                                    на этой неделе
                                </label>
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
                                            sortKey === option.key ? 'active' : ''
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

                            {visibleCompanies.map((company) => {
                                const companyMin =
                                    estimate[0] * company.priceMultiplier;
                                const companyMax =
                                    estimate[1] * company.priceMultiplier;

                                return (
                                    <article
                                        className="company-card"
                                        key={company.name}
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
                                                    ★ {company.rating.toFixed(1)}{' '}
                                                    / {company.reviews} отзывов
                                                </span>
                                                <span className="green-tag">
                                                    {company.badge}
                                                </span>
                                            </div>
                                            <ul className="company-features">
                                                <li>
                                                    Ближайшая дата:{' '}
                                                    {company.nextAvailableDate}
                                                </li>
                                                <li>
                                                    Районы:{' '}
                                                    {company.districts.join(', ')}
                                                </li>
                                                <li>
                                                    Услуги:{' '}
                                                    {company.serviceKeys.length}
                                                </li>
                                                <li>{company.feature}</li>
                                            </ul>
                                        </div>
                                        <div className="company-action">
                                            <span>Предварительно</span>
                                            <strong>
                                                {formatCurrency(companyMin)} -{' '}
                                                {formatCurrency(companyMax)}
                                            </strong>
                                            <button
                                                className="btn btn-primary"
                                                type="button"
                                            >
                                                Выбрать компанию
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
