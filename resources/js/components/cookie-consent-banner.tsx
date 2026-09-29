import { Link } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { privacy } from '@/routes';

type CookieConsent = 'all' | 'essential';

const storageKey = 'okna-market-cookie-consent-v1';

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        const savedConsent = window.localStorage.getItem(storageKey);

        return savedConsent !== 'all' && savedConsent !== 'essential';
    });

    function saveConsent(consent: CookieConsent) {
        window.localStorage.setItem(storageKey, consent);
        setIsVisible(false);
    }

    if (!isVisible) {
        return null;
    }

    return (
        <section
            aria-label="Настройки файлов cookie"
            aria-live="polite"
            className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-950/15 backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5 dark:border-slate-700 dark:bg-slate-950/95"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <Cookie className="size-5" aria-hidden="true" />
                    </span>
                    <div className="grid gap-1">
                        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                            Файлы cookie
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Необходимые cookie помогают сайту работать.
                            Остальные можно разрешить для улучшения сервиса.
                            Подробнее — в{' '}
                            <Link
                                className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                                href={privacy()}
                                prefetch
                            >
                                политике конфиденциальности
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                        onClick={() => saveConsent('essential')}
                        type="button"
                        variant="outline"
                    >
                        Только необходимые
                    </Button>
                    <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => saveConsent('all')}
                        type="button"
                    >
                        Принять
                    </Button>
                </div>
            </div>
        </section>
    );
}
