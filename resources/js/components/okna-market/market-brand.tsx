import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import { OknaMarketLogo } from './okna-market-logo';

type Props = {
    ariaLabel?: string;
    onClick?: () => void;
};

export function MarketBrand({
    ariaLabel = 'ОкнаМаркет — главная',
    onClick,
}: Props) {
    return (
        <Link
            aria-label={ariaLabel}
            className="brand"
            href={home()}
            onClick={onClick}
            prefetch
        >
            <OknaMarketLogo />
        </Link>
    );
}
