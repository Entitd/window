import { Head, Link } from '@inertiajs/react';
import { MarketShell } from '@/components/okna-market/market-shell';
import { MARKETPLACE_PATHS } from '@/lib/okna-market';

type PageItem = {
    title: string;
    href: string;
    uri: string;
    routeName: string;
    component: string | null;
    action: string;
    access: 'public' | 'auth';
    status: 'ready' | 'placeholder' | 'controller';
    middleware: string[];
};

const statusLabels = {
    ready: 'готово',
    placeholder: 'заглушка',
    controller: 'controller',
} as const;

const accessLabels = {
    public: 'public',
    auth: 'auth',
} as const;

type Props = {
    pages: PageItem[];
};

export default function PagesIndex({ pages }: Props) {
    const publicPages = pages.filter((page) => page.access === 'public');
    const authPages = pages.filter((page) => page.access === 'auth');

    return (
        <>
            <Head title="Список страниц" />

            <MarketShell
                activePage="home"
                ctaHref={MARKETPLACE_PATHS.home}
                ctaLabel="К главной"
            >
                <section className="page-hero">
                    <div className="container">
                        <span className="eyebrow">Навигация по проекту</span>
                        <h1 className="page-title">
                            Все реализованные страницы в одном месте
                        </h1>
                        <p className="page-intro">
                            Список строится из реальных маршрутов проекта, а не
                            из ручного списка. Если страница попала в `web.php`,
                            она появляется здесь сама.
                        </p>
                    </div>
                </section>

                <section className="contacts-section">
                    <div className="container flex flex-col gap-10">
                        <div className="contacts-card">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2>Публичные страницы</h2>
                                    <p className="page-intro !mt-3">
                                        Страницы, которые можно открыть без
                                        авторизации.
                                    </p>
                                </div>
                                <strong>{publicPages.length} шт.</strong>
                            </div>

                            <div className="mt-8 grid gap-4">
                                {publicPages.map((page) => (
                                    <article
                                        className="rounded-2xl border border-black/12 bg-black/6 p-6"
                                        key={page.href}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="max-w-3xl">
                                                <h3 className="text-xl font-semibold text-black">
                                                    {page.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-6 text-black/68">
                                                    {page.component
                                                        ? `Inertia page: ${page.component}`
                                                        : `Controller page: ${page.action}`}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs tracking-[0.18em] text-black/72 uppercase">
                                                <span className="rounded-full border border-black/12 px-3 py-2">
                                                    {statusLabels[page.status]}
                                                </span>
                                                <span className="rounded-full border border-black/12 px-3 py-2">
                                                    {accessLabels[page.access]}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-2 text-sm text-black/62">
                                            <div>
                                                <span className="text-black/40">
                                                    route:
                                                </span>{' '}
                                                {page.routeName}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    component:
                                                </span>{' '}
                                                {page.component ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    action:
                                                </span>{' '}
                                                {page.action}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    path:
                                                </span>{' '}
                                                /{page.uri}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    middleware:
                                                </span>{' '}
                                                {page.middleware.join(', ')}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <Link
                                                className="btn btn-primary"
                                                href={page.href}
                                                prefetch
                                            >
                                                Открыть страницу
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="contacts-card">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2>Защищённые страницы</h2>
                                    <p className="page-intro !mt-3">
                                        Страницы, которые требуют авторизации.
                                    </p>
                                </div>
                                <strong>{authPages.length} шт.</strong>
                            </div>

                            <div className="mt-8 grid gap-4">
                                {authPages.map((page) => (
                                    <article
                                        className="rounded-2xl border border-black/12 bg-black/6 p-6"
                                        key={page.href}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="max-w-3xl">
                                                <h3 className="text-xl font-semibold text-black">
                                                    {page.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-6 text-black/68">
                                                    {page.component
                                                        ? `Inertia page: ${page.component}`
                                                        : `Controller page: ${page.action}`}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs tracking-[0.18em] text-black/72 uppercase">
                                                <span className="rounded-full border border-black/12 px-3 py-2">
                                                    {statusLabels[page.status]}
                                                </span>
                                                <span className="rounded-full border border-black/12 px-3 py-2">
                                                    {accessLabels[page.access]}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-2 text-sm text-black/62">
                                            <div>
                                                <span className="text-black/40">
                                                    route:
                                                </span>{' '}
                                                {page.routeName}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    component:
                                                </span>{' '}
                                                {page.component ?? '—'}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    action:
                                                </span>{' '}
                                                {page.action}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    path:
                                                </span>{' '}
                                                /{page.uri}
                                            </div>
                                            <div>
                                                <span className="text-black/40">
                                                    middleware:
                                                </span>{' '}
                                                {page.middleware.join(', ')}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <Link
                                                className="btn btn-secondary"
                                                href={page.href}
                                            >
                                                Перейти
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </MarketShell>
        </>
    );
}
