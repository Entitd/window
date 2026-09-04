import { Link } from '@inertiajs/react';
import { MarketShell } from '@/components/okna-market/market-shell';
import { MARKETPLACE_PATHS } from '@/lib/okna-market';
import { agreement, home, privacy } from '@/routes';

export type LegalSection = {
    title: string;
    items: string[];
};

type Props = {
    title: string;
    eyebrow: string;
    updatedAt: string;
    intro: string;
    sections: LegalSection[];
};

const legalLinks = [
    { label: 'Политика конфиденциальности', href: privacy() },
    { label: 'Пользовательское соглашение', href: agreement() },
];

export function LegalPage({
    title,
    eyebrow,
    updatedAt,
    intro,
    sections,
}: Props) {
    return (
        <MarketShell
            activePage="docs"
            ctaHref={MARKETPLACE_PATHS.home}
            ctaLabel="К заявке"
        >
            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow">{eyebrow}</span>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-intro">{intro}</p>
                </div>
            </section>

            <section className="contacts-section">
                <div className="container flex flex-col gap-6">
                    {/* <div className="contacts-card">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-3xl">
                                <h2>Документ сервиса</h2>
                                <p className="page-intro !mt-3">
                                    Обновлено: {updatedAt}
                                </p>
                            </div>

                            <nav className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--muted-strong)]">
                                <Link
                                    className="rounded-full border border-[var(--line)] px-4 py-2 transition hover:border-[var(--primary)] hover:text-[var(--primary-dark)]"
                                    href={home()}
                                    prefetch
                                >
                                    Главная
                                </Link>
                                {legalLinks.map((link) => (
                                    <Link
                                        className="rounded-full border border-[var(--line)] px-4 py-2 transition hover:border-[var(--primary)] hover:text-[var(--primary-dark)]"
                                        href={link.href}
                                        key={link.label}
                                        prefetch
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div> */}

                    {sections.map((section, index) => (
                        <section className="contacts-card" key={section.title}>
                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                <div className="md:w-[260px] md:flex-none">
                                    <span className="eyebrow">
                                        Раздел {index + 1}
                                    </span>
                                    <h2 className="mt-4 !mb-0">
                                        {section.title}
                                    </h2>
                                </div>

                                <div className="grid flex-1 gap-4">
                                    {section.items.map((item) => (
                                        <div
                                            className="rounded-2xl bg-[var(--bg)] px-5 py-4 text-[15px] leading-7 font-medium text-[var(--muted-strong)]"
                                            key={item}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </section>
        </MarketShell>
    );
}
