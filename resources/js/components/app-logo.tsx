import { OknaMarketLogo } from '@/components/okna-market/okna-market-logo';

type Props = {
    responsiveCompact?: boolean;
};

export default function AppLogo({ responsiveCompact = false }: Props) {
    return <OknaMarketLogo responsiveCompact={responsiveCompact} />;
}
