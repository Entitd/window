import { cn } from '@/lib/utils';
import fullLogo from '../../../images/logo.svg';
import shortLogo from '../../../images/logo_short.svg';

type Props = {
    className?: string;
    compact?: boolean;
    responsiveCompact?: boolean;
};

export function OknaMarketLogo({
    className,
    compact = false,
    responsiveCompact = false,
}: Props) {
    const imageClassName = cn(
        'block h-9 w-auto object-contain',
        compact && 'h-9',
    );

    if (responsiveCompact) {
        return (
            <span className={cn('inline-flex items-center', className)}>
                <img
                    alt="ОкнаМаркет"
                    className={cn(
                        imageClassName,
                        'group-data-[collapsible=icon]:hidden',
                    )}
                    src={fullLogo}
                />
                <img
                    alt="ОкнаМаркет"
                    className={cn(
                        imageClassName,
                        'hidden group-data-[collapsible=icon]:block',
                    )}
                    src={shortLogo}
                />
            </span>
        );
    }

    return (
        <img
            alt="ОкнаМаркет"
            className={cn(imageClassName, className)}
            src={compact ? shortLogo : fullLogo}
        />
    );
}
