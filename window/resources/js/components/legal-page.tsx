import { Link } from '@inertiajs/react';
import { agreement, home, privacy } from '@/routes';

export type LegalSection = {
    title: string;
    items: string[];
};

type Props = {
    title: string;
    eyebrow: string;
    updatedAt: string;
    intro: string;
    sections: LegalSection[];
};

const legalLinks = [
    { label: 'Политика конфиденциальности', href: privacy() },
    { label: 'Пользовательское соглашение', href: agreement() },
];

export function LegalPage({
    title,
    eyebrow,
    updatedAt,
    intro,
    sections,
}: Props) {
    return (
        <main className="min-h-screen bg-[#f6f8fb] font-sans text-[#152033]">
            <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-10 px-5 py-6 sm:px-8 lg:px-0">
                <header className="flex flex-col gap-5 border-b border-[#dbe3ee] pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        className="inline-flex items-center gap-3 font-extrabold"
                        href={home()}
                    >
                        <span className="flex size-10 items-center justify-center rounded-lg bg-[#0f766e] text-lg text-white">
                            О
                        </span>
                        <span>
                            <span className="block text-lg leading-none">
                                ОкнаМаркет
                            </span>
                            <span className="mt-1 block text-xs font-bold text-[#667085]">
                                заявка, цена, компания, гарантия
                            </span>
                        </span>
                    </Link>

                    <nav className="flex flex-wrap gap-4 text-sm font-bold text-[#475467]">
                        {legalLinks.map((link) => (
                            <Link
                                className="transition hover:text-[#0f766e]"
                                href={link.href}
                                key={link.label}
                                prefetch
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </header>

                <section className="max-w-[820px]">
                    <p className="text-sm font-bold text-[#0f766e] uppercase">
                        {eyebrow}
                    </p>
                    <h1 className="mt-4 text-[34px] leading-tight font-extrabold sm:text-[44px]">
                        {title}
                    </h1>
                    <p className="mt-5 text-lg leading-8 font-medium text-[#5d6b82]">
                        {intro}
                    </p>
                    <p className="mt-4 text-sm font-bold text-[#667085]">
                        Обновлено: {updatedAt}
                    </p>
                </section>

                <div className="grid gap-7 pb-14">
                    {sections.map((section, index) => (
                        <section
                            className="border-t border-[#dbe3ee] pt-7"
                            key={section.title}
                        >
                            <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                                <h2 className="text-xl leading-tight font-extrabold">
                                    <span className="mr-3 text-[#0f766e]">
                                        {index + 1}.
                                    </span>
                                    {section.title}
                                </h2>
                                <div className="grid gap-3">
                                    {section.items.map((item) => (
                                        <p
                                            className="text-base leading-7 font-medium text-[#344054]"
                                            key={item}
                                        >
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
