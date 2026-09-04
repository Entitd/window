import { Head, Link } from '@inertiajs/react';
import {
    Inbox,
    MessageSquareText,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { show as showChat } from '@/actions/App/Http/Controllers/ChatController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStatusLabel, getStatusVariant } from '@/lib/dashboard-format';
import type { RequestStatus } from '@/lib/dashboard-format';

type ChatListItem = {
    id: string;
    requestId: string;
    participantName: string;
    participantSubtitle: string;
    service: string;
    status: RequestStatus;
    location: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    updatedAt: string;
};

type ChatsIndexProps = {
    chats: ChatListItem[];
};

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function ChatsIndex({ chats = [] }: ChatsIndexProps) {
    const [query, setQuery] = useState('');
    const [onlyUnread, setOnlyUnread] = useState(false);
    const filteredChats = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return chats.filter((chat) => {
            const matchesQuery =
                `${chat.participantName} ${chat.participantSubtitle} ${chat.service} ${chat.location}`
                    .toLowerCase()
                    .includes(normalizedQuery);

            return matchesQuery && (!onlyUnread || chat.unreadCount > 0);
        });
    }, [chats, onlyUnread, query]);
    const unreadTotal = chats.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0,
    );

    return (
        <>
            <Head title="Чаты" />

            <div className="flex h-full flex-1 flex-col p-4 lg:p-6">
                <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl border border-sidebar-border/70 bg-background shadow-sm dark:border-sidebar-border">
                    <header className="flex flex-col gap-4 border-b border-sidebar-border/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-sidebar-border">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <MessageSquareText
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">
                                    Сообщения
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Переписка по вашим заявкам
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <SlidersHorizontal
                                className="size-4"
                                aria-hidden="true"
                            />
                            {chats.length}{' '}
                            {chats.length === 1 ? 'диалог' : 'диалогов'}
                        </div>
                    </header>

                    <div className="flex flex-col gap-3 border-b border-sidebar-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-sidebar-border">
                        <div className="relative w-full sm:max-w-sm">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                className="pl-9"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Поиск по имени или услуге"
                                aria-label="Поиск по чатам"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={!onlyUnread ? 'secondary' : 'ghost'}
                                onClick={() => setOnlyUnread(false)}
                            >
                                Все{' '}
                                <span className="text-muted-foreground">
                                    {chats.length}
                                </span>
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={onlyUnread ? 'secondary' : 'ghost'}
                                onClick={() => setOnlyUnread(true)}
                            >
                                Непрочитанные
                                {unreadTotal > 0 && (
                                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                                        {unreadTotal}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 p-3 sm:p-4">
                        {filteredChats.length > 0 ? (
                            <div className="grid gap-2">
                                {filteredChats.map((chat) => (
                                    <Link
                                        className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-sidebar-border/70 hover:bg-muted/45 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none sm:gap-4 sm:p-4 dark:hover:border-sidebar-border"
                                        href={showChat(Number(chat.requestId))}
                                        key={chat.id}
                                        prefetch
                                    >
                                        <Avatar className="size-11 shrink-0 border border-sidebar-border/70 dark:border-sidebar-border">
                                            <AvatarImage alt="" />
                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                {initials(chat.participantName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="min-w-0">
                                                    <span className="flex flex-wrap items-center gap-2">
                                                        <span className="truncate font-semibold">
                                                            {
                                                                chat.participantName
                                                            }
                                                        </span>
                                                        <Badge
                                                            variant={getStatusVariant(
                                                                chat.status,
                                                            )}
                                                        >
                                                            {getStatusLabel(
                                                                chat.status,
                                                            )}
                                                        </Badge>
                                                    </span>
                                                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                                                        {chat.service} · Заявка
                                                        #{chat.requestId}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {chat.lastMessageAt ||
                                                        chat.updatedAt}
                                                </span>
                                            </span>
                                            <span className="mt-2 flex items-center justify-between gap-3">
                                                <span className="truncate text-sm text-muted-foreground">
                                                    {chat.lastMessage ||
                                                        'Сообщений пока нет'}
                                                </span>
                                                {chat.unreadCount > 0 && (
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center">
                                <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <Inbox
                                        className="size-5 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {chats.length === 0
                                            ? 'Диалогов пока нет'
                                            : 'Ничего не найдено'}
                                    </p>
                                    <p className="max-w-sm text-sm text-muted-foreground">
                                        {chats.length === 0
                                            ? 'Чат появится после первого сообщения по заявке.'
                                            : 'Измените поисковый запрос или выключите фильтр непрочитанных.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

ChatsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Чаты',
            href: '/chats',
        },
    ],
};
