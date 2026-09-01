import type { ReactNode } from 'react';
import '../../../css/okna-market.css';
import { MarketFooter } from './market-footer';
import { MarketHeader } from './market-header';
import type { MarketActivePage } from './market-types';

type Props = {
    activePage: MarketActivePage;
    children: ReactNode;
    ctaHref?: string;
    ctaLabel?: string;
};

export function MarketShell({ activePage, children }: Props) {
    return (
        <div className="okna-market-page">
            <MarketHeader activePage={activePage} />

            <main>{children}</main>

            <MarketFooter />
        </div>
    );
}
