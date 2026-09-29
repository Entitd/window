import { Head } from '@inertiajs/react';
import {
    FaqAccordion,
    faqSections,
} from '@/components/okna-market/faq-accordion';
import { MarketShell } from '@/components/okna-market/market-shell';
import { MARKETPLACE_PATHS } from '@/lib/okna-market';

export default function FaqPage() {
    return (
        <>
            <Head title="FAQ" />

            <MarketShell
                activePage="faq"
                ctaHref={MARKETPLACE_PATHS.contacts}
                ctaLabel="Связаться с нами"
            >
                <section className="page-hero">
                    <div className="container">
                        <span className="eyebrow">FAQ</span>
                        <h1 className="page-title">
                            Частые вопросы по заявкам, ценам, компаниям и
                            модерации
                        </h1>
                        <p className="page-intro">
                            Страница помогает быстро снять базовые вопросы и для
                            клиента, и для компании по текущему MVP без длинных
                            инструкций.
                        </p>
                    </div>
                </section>

                <section className="faq-page-section">
                    <div className="faq-page-grid container">
                        <FaqAccordion sections={faqSections} />
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
