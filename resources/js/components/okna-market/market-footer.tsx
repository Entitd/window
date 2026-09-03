import { Link } from '@inertiajs/react';
import {
    agreement,
    calculate,
    contacts,
    faq,
    home,
    privacy,
    searchResults,
    vendors,
} from '@/routes';
import { MarketBrand } from './market-brand';

const serviceLinks = [
    { label: 'Главная', href: home(), prefetch: true },
    { label: 'Рассчитать', href: calculate(), prefetch: true },
    { label: 'Для компаний', href: vendors(), prefetch: true },
];

const helpLinks = [
    { label: 'Частые вопросы', href: faq(), prefetch: true },
    { label: 'Контакты', href: contacts(), prefetch: true },
    { label: 'Результаты подбора', href: searchResults(), prefetch: true },
];

const documentLinks = [
    { label: 'Конфиденциальность', href: privacy(), prefetch: true },
    { label: 'Пользовательское соглашение', href: agreement(), prefetch: true },
];

export function MarketFooter() {
    return (
        <footer className="okna-footer">
            <div className="footer-grid container">
                <div className="footer-brand-block">
                    <MarketBrand />
                    <p>
                        Выберите компанию по услуге, району и предварительной цене в один клик.
                    </p>
                </div>

                <FooterColumn
                    ariaLabel="Разделы сайта"
                    links={serviceLinks}
                    title="Сервис"
                />
                <FooterColumn
                    ariaLabel="Помощь"
                    links={helpLinks}
                    title="Помощь"
                />
                <FooterColumn
                    ariaLabel="Документы"
                    links={documentLinks}
                    title="Документы"
                />
            </div>

            <div className="footer-bottom container">
                <span className="footer-copyright">© 2026 ОкнаМаркет</span>
                <span className="footer-credit">Created by Entitd</span>
            </div>
        </footer>
    );
}

function FooterColumn({
    ariaLabel,
    links,
    title,
}: {
    ariaLabel: string;
    links: {
        label: string;
        href: ReturnType<typeof home> | string;
        prefetch?: boolean;
    }[];
    title: string;
}) {
    return (
        <nav aria-label={ariaLabel} className="footer-column">
            <strong>{title}</strong>
            {links.map((link) => (
                <Link
                    href={link.href}
                    key={link.label}
                    prefetch={link.prefetch}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
