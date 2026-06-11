import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { MARKETPLACE_PATHS } from '@/lib/okna-market';
import { agreement, privacy } from '@/routes';
import '../../../css/okna-market.css';

type ActivePage = 'home' | 'search-results' | 'vendors';

type Props = {
    activePage: ActivePage;
    children: ReactNode;
    ctaHref: string;
    ctaLabel: string;
};

const navItems = [
    { key: 'home', label: 'Главная', href: MARKETPLACE_PATHS.home },
    {
        key: 'search-results',
        label: 'Результаты',
        href: MARKETPLACE_PATHS.searchResults,
    },
    { key: 'vendors', label: 'Для компаний', href: MARKETPLACE_PATHS.vendors },
] as const;

export function MarketShell({
    activePage,
    children,
    ctaHref,
    ctaLabel,
}: Props) {
    return (
        <div className="okna-market-page">
            <header className="site-header">
                <div className="header-inner container">
                    <Link className="brand" href={MARKETPLACE_PATHS.home}>
                        <span className="brand-mark">О</span>
                        <span className="brand-name">ОКНА</span>
                    </Link>

                    <nav aria-label="Основная навигация" className="main-nav">
                        {navItems.map((item) => (
                            <Link
                                className={
                                    activePage === item.key ? 'active-link' : ''
                                }
                                href={item.href}
                                key={item.key}
                                prefetch
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <span className="city-pill">Волгоград</span>
                        <Link className="btn btn-primary" href={ctaHref}>
                            {ctaLabel}
                        </Link>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="okna-footer">
                <div className="footer-inner container">
                    <span>ОкнаМаркет, 2026</span>
                    <div>
                        <Link href={privacy()} prefetch>
                            Политика конфиденциальности
                        </Link>
                        <Link href={agreement()} prefetch>
                            Пользовательское соглашение
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
