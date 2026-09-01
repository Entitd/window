import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    calculate,
    dashboard,
    faq,
    home,
    login,
    register,
    vendors,
} from '@/routes';
import { MarketBrand } from './market-brand';
import type { MarketActivePage } from './market-types';

type Props = {
    activePage: MarketActivePage;
};

type HeaderNavigationProps = {
    activePage: MarketActivePage;
    isMenuOpen: boolean;
    onNavigate: () => void;
};

type HeaderActionsProps = {
    isAuthenticated: boolean;
    isMenuOpen: boolean;
    onNavigate: () => void;
};

const navItems = [
    { key: 'home', label: 'Главная', href: home() },
    {
        key: 'calculate',
        label: 'Рассчитать',
        href: calculate(),
    },
    { key: 'vendors', label: 'Для компаний', href: vendors() },
    { key: 'faq', label: 'Вопросы', href: faq() },
] as const;

export function MarketHeader({ activePage }: Props) {
    const { auth } = usePage<{ auth: { user: unknown | null } }>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAuthenticated = Boolean(auth.user);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="site-header">
            <div className="header-inner container">
                <MarketBrand onClick={closeMenu} />

                <MarketMenuButton
                    isMenuOpen={isMenuOpen}
                    onClick={() => setIsMenuOpen((current) => !current)}
                />

                <MarketNavigation
                    activePage={activePage}
                    isMenuOpen={isMenuOpen}
                    onNavigate={closeMenu}
                />

                <HeaderActions
                    isAuthenticated={isAuthenticated}
                    isMenuOpen={isMenuOpen}
                    onNavigate={closeMenu}
                />
            </div>
        </header>
    );
}

function MarketMenuButton({
    isMenuOpen,
    onClick,
}: {
    isMenuOpen: boolean;
    onClick: () => void;
}) {
    return (
        <button
            aria-controls="public-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className={`nav-toggle ${isMenuOpen ? 'is-open' : ''}`}
            onClick={onClick}
            type="button"
        >
            <span />
            <span />
            <span />
        </button>
    );
}

function MarketNavigation({
    activePage,
    isMenuOpen,
    onNavigate,
}: HeaderNavigationProps) {
    return (
        <nav
            aria-label="Основная навигация"
            className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}
            id="public-navigation"
        >
            {navItems.map((item) => (
                <Link
                    aria-current={activePage === item.key ? 'page' : undefined}
                    className={activePage === item.key ? 'active-link' : ''}
                    href={item.href}
                    key={item.key}
                    onClick={onNavigate}
                    prefetch
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

function HeaderActions({
    isAuthenticated,
    isMenuOpen,
    onNavigate,
}: HeaderActionsProps) {
    return (
        <div className={`header-actions ${isMenuOpen ? 'is-open' : ''}`}>
            <span className="city-pill">Волгоград</span>
            {isAuthenticated ? (
                <Link
                    className="btn btn-primary header-primary-action"
                    href={dashboard()}
                    onClick={onNavigate}
                >
                    Личный кабинет
                </Link>
            ) : (
                <>
                    <Link
                        className="btn btn-secondary header-login-action"
                        href={login()}
                        onClick={onNavigate}
                    >
                        Войти
                    </Link>
                    <Link
                        className="btn btn-primary header-primary-action"
                        href={register()}
                        onClick={onNavigate}
                    >
                        Регистрация
                    </Link>
                </>
            )}
        </div>
    );
}
