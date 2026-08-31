import { Link } from '@inertiajs/react';
import { ArrowLeft, Check, MapPin, Search, ShieldCheck } from 'lucide-react';
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
        <div className="relative min-h-svh overflow-hidden bg-[#f4f7fb] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
            <div
                className="pointer-events-none absolute -top-40 left-1/4 size-[34rem] rounded-full bg-blue-200/55 blur-3xl dark:bg-blue-950/25"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute right-0 bottom-0 size-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-orange-100/75 blur-3xl dark:bg-orange-950/15"
                aria-hidden="true"
            />

            <main className="relative mx-auto flex min-h-svh w-full max-w-[1280px] items-center justify-center p-3 sm:p-6 lg:p-8">
                <section className="grid w-full max-w-[1160px] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[0.88fr_1.12fr] dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
                    <aside className="relative hidden min-h-[760px] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col xl:p-12">
                        <div
                            className="absolute top-20 -right-24 size-72 rounded-full bg-blue-500/20 blur-3xl"
                            aria-hidden="true"
                        />
                        <div
                            className="absolute -bottom-28 -left-20 size-80 rounded-full bg-orange-400/10 blur-3xl"
                            aria-hidden="true"
                        />

                        <div className="relative z-10">
                            <Brand />
                        </div>

                        <div className="relative z-10 my-auto grid gap-9 py-12">
                            <div className="grid gap-4">
                                <span className="w-fit rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-200 uppercase">
                                    Сервис подбора компаний
                                </span>
                                <h2 className="max-w-md text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance">
                                    Окна без десятков звонков
                                </h2>
                                <p className="max-w-md text-sm leading-7 text-slate-300">
                                    Опишите задачу, сравните предложения и
                                    выберите компанию в удобном темпе.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {benefits.map((benefit) => {
                                    const Icon = benefit.icon;

                                    return (
                                        <div
                                            key={benefit.title}
                                            className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm"
                                        >
                                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                                                <Icon
                                                    className="size-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="grid gap-1">
                                                <p className="text-sm font-semibold">
                                                    {benefit.title}
                                                </p>
                                                <p className="text-xs leading-5 text-slate-400">
                                                    {benefit.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="grid gap-2">
                                        <span className="text-xs text-slate-400">
                                            Ваш запрос
                                        </span>
                                        <span className="font-semibold">
                                            Замена стеклопакета
                                        </span>
                                    </div>
                                    <span className="grid size-10 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                                        <Check
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-300">
                                    <MapPin
                                        className="size-4 text-blue-300"
                                        aria-hidden="true"
                                    />
                                    Волгоград · выбранный район
                                </div>
                            </div>
                        </div>

                        <p className="relative z-10 text-xs text-slate-500">
                            ОкнаМаркет · понятный выбор исполнителя
                        </p>
                    </aside>

                    <div className="flex min-h-[640px] flex-col bg-white px-5 py-6 sm:px-9 sm:py-9 lg:min-h-[760px] lg:px-12 lg:py-11 xl:px-16 dark:bg-slate-900">
                        <div className="mb-10 flex items-center justify-between gap-4 lg:hidden">
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

                        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
                            <header className="mb-8 grid gap-3">
                                <span className="text-xs font-semibold tracking-[0.14em] text-blue-600 uppercase dark:text-blue-400">
                                    ОкнаМаркет
                                </span>
                                <h1 className="text-3xl leading-tight font-semibold tracking-[-0.025em] text-slate-950 sm:text-[2rem] dark:text-white">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                                        {description}
                                    </p>
                                )}
                            </header>

                            {children}
                        </div>

                        <div className="mx-auto mt-8 hidden w-full max-w-xl lg:block">
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
