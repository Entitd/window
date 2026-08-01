import { Head, Link } from '@inertiajs/react';
import { MarketShell } from '@/components/okna-market/market-shell';
import {
    MARKETPLACE_PATHS,
    vendorBenefits,
    vendorSteps,
} from '@/lib/okna-market';

export default function Vendors() {
    return (
        <>
            <Head title="Для компаний" />

            <MarketShell
                activePage="vendors"
                ctaHref={MARKETPLACE_PATHS.home}
                ctaLabel="К заявке клиента"
            >
                <section className="hero">
                    <div className="hero-inner container hero-split">
                        <div className="hero-copy">
                            <span className="eyebrow">Для компаний и монтажных бригад</span>
                            <h1>
                                Получайте релевантные заявки на окна без
                                хаотичного потока лидов
                            </h1>
                            <p className="hero-intro">
                                ОкнаМаркет помогает компаниям управлять районами
                                работы, услугами, ценами и заявками в одном
                                кабинете. Подключение проходит через модерацию,
                                чтобы клиент видел понятный и аккуратный каталог.
                            </p>
                            <div className="hero-actions">
                                <Link className="btn btn-primary" href="/register/vendor">
                                    Зарегистрировать компанию
                                </Link>
                                <span className="hero-note">
                                    Регистрация уже доступна, дальше компанию можно
                                    вести в кабинет, профиль и услуги.
                                </span>
                            </div>
                        </div>

                        <div className="hero-side-card">
                            <span className="hero-side-kicker">Что получает вендор</span>
                            <strong>Поток понятных заявок</strong>
                            <ul>
                                <li>Новые обращения по районам работы</li>
                                <li>Личный кабинет с лидами и статусами</li>
                                <li>Редактирование услуг, цен и профиля</li>
                                <li>Модерация компании и контроль качества</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="benefits-section">
                    <div className="section-copy container">
                        <span className="faq-kicker">Преимущества</span>
                        <h2>Страница объясняет выгоду без лишнего маркетингового шума</h2>
                    </div>

                    <div className="benefit-grid container benefit-grid-wide">
                        {vendorBenefits.map((benefit) => (
                            <article className="benefit-card" key={benefit}>
                                <div className="benefit-bullet">+</div>
                                <p>{benefit}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="steps-section">
                    <div className="section-copy container">
                        <span className="faq-kicker">Как подключиться</span>
                        <h2>Подключение вендора раскладывается на четыре понятных шага</h2>
                    </div>

                    <div className="steps-grid container steps-grid-wide">
                        {vendorSteps.map((step, index) => (
                            <article className="step-card" key={step.title}>
                                <span>{index + 1}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="vendor-cta-section">
                    <div className="vendor-cta container">
                        <div>
                            <span className="faq-kicker">Подключение</span>
                            <h2>Зарегистрируйте компанию и пройдите модерацию</h2>
                            <p>
                                После регистрации компания получает кабинет,
                                заполняет профиль, добавляет услуги и районы
                                работы. В публичный поиск карточка попадает
                                после подтверждения администратором.
                            </p>
                        </div>
                        <div className="vendor-cta-actions">
                            <Link className="btn btn-primary" href="/register/vendor">
                                Стать партнером
                            </Link>
                            <Link
                                className="btn btn-secondary"
                                href={MARKETPLACE_PATHS.searchResults}
                            >
                                Посмотреть клиентскую выдачу
                            </Link>
                        </div>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
