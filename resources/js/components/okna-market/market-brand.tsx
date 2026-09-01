import { Link } from '@inertiajs/react';
import { home } from '@/routes';

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
            <span className="brand-mark">О</span>
            <span className="brand-copy">
                <strong>ОкнаМаркет</strong>
                <small>подбор оконных компаний</small>
            </span>
        </Link>
    );
}
