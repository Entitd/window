import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import '../../../css/okna-market.css';
import { MarketFooter } from './market-footer';
import { MarketHeader } from './market-header';
import { MarketThemeToggle } from './market-theme-toggle';
import type { MarketActivePage } from './market-types';

type Props = {
    activePage: MarketActivePage;
    children: ReactNode;
    ctaHref?: string;
    ctaLabel?: string;
};

export function MarketShell({ activePage, children }: Props) {
    const mainRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const main = mainRef.current;

        if (!main) {
            return;
        }

        const sections = Array.from(
            main.querySelectorAll<HTMLElement>(
                ':scope > section:not(:first-child)',
            ),
        );

        main.classList.add('is-scroll-reveal-ready');

        sections.forEach((section, index) => {
            section.classList.add('scroll-reveal');
            section.style.setProperty(
                '--reveal-delay',
                `${Math.min(index, 3) * 70}ms`,
            );
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: '0px 0px -14% 0px',
                threshold: 0.16,
            },
        );

        sections.forEach((section) => {
            observer.observe(section);
        });

        return () => {
            observer.disconnect();
            main.classList.remove('is-scroll-reveal-ready');

            sections.forEach((section) => {
                section.classList.remove('scroll-reveal', 'is-visible');
                section.style.removeProperty('--reveal-delay');
            });
        };
    }, [activePage]);

    return (
        <div className="okna-market-page">
            <MarketHeader activePage={activePage} />

            <main ref={mainRef}>{children}</main>

            <MarketFooter />
            <MarketThemeToggle />
        </div>
    );
}
