import { Link } from '@inertiajs/react';
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const benefits = [
    {
        icon: Search,
        title: 'Сравнение в одном месте',
        text: 'Цена, район и условия компаний собраны в понятной выдаче.',
    },
    {
        icon: ShieldCheck,
        title: 'Контакты под контролем',
        text: 'Заявку получает только выбранная вами компания.',
    },
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Link
            href={home()}
            className="inline-flex w-fit items-center gap-3 rounded-xl focus-visible:ring-4 focus-visible:ring-blue-500/25 focus-visible:outline-none"
            aria-label="ОкнаМаркет — на главную"
        >
            <span
                className={`grid place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/20 ${compact ? 'size-10 text-base' : 'size-11 text-lg'}`}
                aria-hidden="true"
            >
                О
            </span>
            <span
                className={
                    compact ? 'text-sm font-bold' : 'text-base font-bold'
                }
            >
                ОКНА<span className="text-blue-400">МАРКЕТ</span>
            </span>
        </Link>
    );
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-svh overflow-x-hidden bg-[linear-gradient(135deg,#eaf2ff_0%,#f7fbff_42%,#fff3e8_100%)] font-sans text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#1e293b_100%)] dark:text-slate-50">
            <main className="relative mx-auto flex min-h-svh w-full max-w-[1280px] items-center justify-center p-2 sm:p-4 lg:p-5">
                <section className="grid w-full max-w-[1120px] overflow-hidden rounded-[24px] border border-white/65 bg-white/30 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:max-h-[calc(100svh-40px)] lg:grid-cols-[0.88fr_1.12fr] dark:border-white/10 dark:bg-slate-950/35 dark:shadow-black/30">
                    <aside className="relative hidden min-h-[calc(100svh-40px)] overflow-hidden rounded-l-[24px] border-r border-white/30 bg-white/10 p-8 text-slate-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-150 lg:flex lg:flex-col xl:p-10 dark:border-white/10 dark:bg-slate-900/20 dark:text-white dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                        <div
                            className="pointer-events-none absolute -inset-10 opacity-60 blur-3xl dark:opacity-40"
                            aria-hidden="true"
                        >
                            <div className="absolute top-0 left-0 size-[500px] rounded-full bg-blue-400/30 dark:bg-blue-600/20" />
                            <div className="absolute right-0 bottom-0 size-[400px] rounded-full bg-sky-300/30 dark:bg-sky-500/15" />
                        </div>

                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
                            style={{
                                backgroundImage: `radial-gradient(#2563eb 0.75px, transparent 0.75px), radial-gradient(#2563eb 0.75px, transparent 0.75px)`,
                                backgroundSize: '15px 15px',
                                backgroundPosition: '0 0, 7.5px 7.5px',
                                WebkitMaskImage:
                                    'radial-gradient(ellipse at center, black 20%, transparent 80%)',
                                maskImage:
                                    'radial-gradient(ellipse at center, black 20%, transparent 80%)',
                            }}
                            aria-hidden="true"
                        />

                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-white/5 dark:from-white/10 dark:to-transparent"
                            aria-hidden="true"
                        />

                        <div className="relative z-10">
                            <Brand />
                        </div>

                        <div className="relative z-10 my-auto grid gap-7 py-8">
                            <div className="grid gap-3">
                                <span className="w-fit rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-blue-700 uppercase shadow-[0_2px_10px_rgba(255,255,255,0.4),inset_0_1px_0_#ffffff] backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:text-blue-300">
                                    Сервис подбора компаний
                                </span>
                                <h2 className="max-w-md text-3xl leading-tight font-semibold text-balance text-slate-950 dark:text-white">
                                    Окна без десятков звонков
                                </h2>
                                <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Опишите задачу, сравните предложения и
                                    выберите компанию в удобном темпе.
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {benefits.map((benefit) => {
                                    const Icon = benefit.icon;

                                    return (
                                        <div
                                            key={benefit.title}
                                            className="flex gap-3 rounded-xl border border-white/80 bg-white/60 p-3.5 shadow-[0_8px_20px_rgba(15,23,42,0.03),inset_0_1px_1px_#ffffff] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                        >
                                            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white bg-white/80 text-blue-600 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-blue-400/10 dark:text-blue-300">
                                                <Icon
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="grid gap-1">
                                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                    {benefit.title}
                                                </p>
                                                <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                                                    {benefit.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <p className="relative z-10 text-xs text-slate-500 dark:text-slate-400">
                            ОкнаМаркет · понятный выбор исполнителя
                        </p>
                    </aside>

                    <div className="flex min-h-[calc(100svh-16px)] flex-col bg-white/95 px-5 py-5 sm:min-h-[calc(100svh-32px)] sm:px-8 sm:py-7 lg:max-h-[calc(100svh-40px)] lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-8 xl:px-12 dark:bg-slate-900/95">
                        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
                            <Brand compact />
                            <Link
                                href={home()}
                                className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                aria-label="Вернуться на главную"
                            >
                                <ArrowLeft
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>

                        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-2">
                            <header className="mb-6 grid gap-2">
                                <span className="text-xs font-semibold text-blue-600 uppercase dark:text-blue-400">
                                    ОкнаМаркет
                                </span>
                                <h1 className="text-2xl leading-tight font-semibold text-slate-950 sm:text-[1.65rem] dark:text-white">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="max-w-lg text-sm leading-5 text-slate-500 dark:text-slate-400">
                                        {description}
                                    </p>
                                )}
                            </header>

                            {children}
                        </div>

                        <div className="mx-auto mt-6 hidden w-full max-w-xl lg:block">
                            <Link
                                href={home()}
                                className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:text-slate-400 dark:hover:text-white"
                            >
                                <ArrowLeft
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Вернуться на главную
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
