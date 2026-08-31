import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    agreement,
    contacts,
    dashboard,
    faq,
    home,
    login,
    privacy,
    register,
    searchResults,
    vendors,
} from '@/routes';
import '../../../css/okna-market.css';

type ActivePage =
    | 'home'
    | 'search-results'
    | 'vendors'
    | 'faq'
    | 'contacts'
    | 'docs';

type Props = {
    activePage: ActivePage;
    children: ReactNode;
    ctaHref?: string;
    ctaLabel?: string;
};

const navItems = [
    { key: 'home', label: 'Главная', href: home() },
    {
        key: 'search-results',
        label: 'Найти компанию',
        href: `${home.url()}#request`,
    },
    { key: 'vendors', label: 'Для компаний', href: vendors() },
    { key: 'faq', label: 'Вопросы', href: faq() },
] as const;

export function MarketShell({ activePage, children }: Props) {
    const { auth } = usePage<{ auth: { user: unknown | null } }>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAuthenticated = Boolean(auth.user);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="okna-market-page">
            <header className="site-header">
                <div className="header-inner container">
                    <Link
                        aria-label="ОкнаМаркет — главная"
                        className="brand"
                        href={home()}
                        onClick={closeMenu}
                        prefetch
                    >
                        <span className="brand-mark">О</span>
                        <span className="brand-copy">
                            <strong>ОкнаМаркет</strong>
                            <small>подбор оконных компаний</small>
                        </span>
                    </Link>

                    <button
                        aria-controls="public-navigation"
                        aria-expanded={isMenuOpen}
                        aria-label={
                            isMenuOpen ? 'Закрыть меню' : 'Открыть меню'
                        }
                        className={`nav-toggle ${isMenuOpen ? 'is-open' : ''}`}
                        onClick={() => setIsMenuOpen((current) => !current)}
                        type="button"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <nav
                        aria-label="Основная навигация"
                        className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}
                        id="public-navigation"
                    >
                        {navItems.map((item) => (
                            <Link
                                aria-current={
                                    activePage === item.key ? 'page' : undefined
                                }
                                className={
                                    activePage === item.key ? 'active-link' : ''
                                }
                                href={item.href}
                                key={item.key}
                                onClick={closeMenu}
                                prefetch
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div
                        className={`header-actions ${isMenuOpen ? 'is-open' : ''}`}
                    >
                        <span className="city-pill">Волгоград</span>
                        {isAuthenticated ? (
                            <Link
                                className="btn btn-primary header-primary-action"
                                href={dashboard()}
                                onClick={closeMenu}
                            >
                                Личный кабинет
                            </Link>
                        ) : (
                            <>
                                <Link
                                    className="btn btn-secondary header-login-action"
                                    href={login()}
                                    onClick={closeMenu}
                                >
                                    Войти
                                </Link>
                                <Link
                                    className="btn btn-primary header-primary-action"
                                    href={register()}
                                    onClick={closeMenu}
                                >
                                    Регистрация
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="okna-footer">
                <div className="footer-grid container">
                    <div className="footer-brand-block">
                        <Link className="brand" href={home()} prefetch>
                            <span className="brand-mark">О</span>
                            <span className="brand-copy">
                                <strong>ОкнаМаркет</strong>
                                <small>подбор оконных компаний</small>
                            </span>
                        </Link>
                        <p>
                            Помогаем подобрать компанию по услуге, району и
                            предварительной цене в одной заявке.
                        </p>
                    </div>

                    <nav aria-label="Разделы сайта" className="footer-column">
                        <strong>Сервис</strong>
                        <Link href={home()} prefetch>
                            Главная
                        </Link>
                        <Link href={`${home.url()}#request`}>
                            Найти компанию
                        </Link>
                        <Link href={vendors()} prefetch>
                            Для компаний
                        </Link>
                    </nav>

                    <nav aria-label="Помощь" className="footer-column">
                        <strong>Помощь</strong>
                        <Link href={faq()} prefetch>
                            Частые вопросы
                        </Link>
                        <Link href={contacts()} prefetch>
                            Контакты
                        </Link>
                        <Link href={searchResults()} prefetch>
                            Результаты подбора
                        </Link>
                    </nav>

                    <nav aria-label="Документы" className="footer-column">
                        <strong>Документы</strong>
                        <Link href={privacy()} prefetch>
                            Конфиденциальность
                        </Link>
                        <Link href={agreement()} prefetch>
                            Пользовательское соглашение
                        </Link>
                    </nav>
                </div>

                <div className="footer-bottom container">
                    <span>© 2026 ОкнаМаркет</span>
                    <span>Сервис работает в Волгограде</span>
                </div>
            </footer>
        </div>
    );
}
