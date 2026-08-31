import { Head } from '@inertiajs/react';
import { MarketShell } from '@/components/okna-market/market-shell';
import { MARKETPLACE_PATHS } from '@/lib/okna-market';

const contacts = [
    { label: 'Email', value: 'hello@oknamarket.ru' },
    { label: 'Телефон', value: '+7 (8442) 20-10-20' },
    { label: 'Время работы', value: 'Пн–Сб, 09:00–20:00' },
];

export default function ContactsPage() {
    return (
        <>
            <Head title="Контакты" />

            <MarketShell
                activePage="contacts"
                ctaHref={MARKETPLACE_PATHS.searchResults}
                ctaLabel="Смотреть предложения"
            >
                <section className="page-hero">
                    <div className="container">
                        <span className="eyebrow">Контакты</span>
                        <h1 className="page-title">
                            Связаться с сервисом можно без квеста по сайту
                        </h1>
                        <p className="page-intro">
                            Здесь собрана базовая контактная информация и форма
                            обратной связи для клиента или компании.
                        </p>
                    </div>
                </section>

                <section className="contacts-section">
                    <div className="contacts-layout container">
                        <article className="contacts-card">
                            <h2>Контактная информация</h2>
                            <div className="contacts-list">
                                {contacts.map((item) => (
                                    <div
                                        className="contacts-item"
                                        key={item.label}
                                    >
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="map-placeholder">
                                <span>Поддержка сервиса</span>
                                <strong>Работаем с обращениями онлайн</strong>
                                <p>
                                    Напишите или позвоните — поможем с заявкой,
                                    кабинетом или подключением компании.
                                </p>
                            </div>
                        </article>

                        <article className="contacts-card">
                            <h2>Форма обратной связи</h2>
                            <form
                                className="contacts-form"
                                onSubmit={(event) => event.preventDefault()}
                            >
                                <label className="field-card field-card-wide">
                                    <span className="field-icon">☺</span>
                                    <span className="field-label">Имя</span>
                                    <input placeholder="Как к вам обращаться" />
                                </label>

                                <label className="field-card field-card-wide">
                                    <span className="field-icon">☎</span>
                                    <span className="field-label">
                                        Телефон или email
                                    </span>
                                    <input placeholder="+7 (___) ___-__-__ или email@example.com" />
                                </label>

                                <label className="field-card field-card-wide field-textarea">
                                    <span className="field-icon">✎</span>
                                    <span className="field-label">
                                        Сообщение
                                    </span>
                                    <textarea placeholder="Коротко опишите вопрос или проблему" />
                                </label>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        window.location.href =
                                            'mailto:hello@oknamarket.ru?subject=Вопрос%20по%20ОкнаМаркет';
                                    }}
                                    type="button"
                                >
                                    Написать на email
                                </button>
                            </form>

                            <p className="contacts-note">
                                Кнопка откроет новое письмо в вашем почтовом
                                приложении.
                            </p>
                        </article>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
