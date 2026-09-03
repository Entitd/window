import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    Inbox,
    MessageCircleMore,
    MessageSquareText,
    Search,
    SendHorizontal,
    UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { show as showChat } from '@/actions/App/Http/Controllers/ChatController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ChatListItem = {
    id: string;
    requestId: string;
    participantId?: string;
    participantRole?: 'client' | 'vendor';
    participantName: string;
    participantSubtitle: string;
    service: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    updatedAt: string;
};

/**
 * Контракт для будущего backend: передавайте сюда всех доступных собеседников,
 * в том числе тех, у кого ещё нет созданного чата.
 */
type ChatParticipant = {
    id: string;
    name: string;
    subtitle: string;
    role: 'client' | 'vendor';
    avatarUrl?: string | null;
    chatId?: string | null;
    requestId?: string | null;
    service?: string | null;
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    unreadCount?: number;
};

type Conversation = {
    id: string;
    name: string;
    subtitle: string;
    role: 'client' | 'vendor';
    avatarUrl?: string | null;
    chatId?: string;
    requestId?: string;
    service?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
};

type ChatsIndexProps = {
    chats: ChatListItem[];
    participants?: ChatParticipant[];
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

function participantLabel(role: Conversation['role']): string {
    return role === 'vendor' ? 'Компания' : 'Клиент';
}

export default function ChatsIndex({
    chats = [],
    participants = [],
}: ChatsIndexProps) {
    const [query, setQuery] = useState('');
    const [onlyUnread, setOnlyUnread] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { auth } = usePage<{
        auth: { user: { role?: string } | null };
    }>().props;
    const viewerRole = auth.user?.role;

    const conversations = useMemo<Conversation[]>(() => {
        const activeChats = chats.map((chat) => ({
            id: `chat-${chat.id}`,
            name: chat.participantName,
            subtitle: chat.participantSubtitle,
            role:
                chat.participantRole ??
                (viewerRole === 'client'
                    ? ('vendor' as const)
                    : ('client' as const)),
            chatId: chat.id,
            requestId: chat.requestId,
            service: chat.service,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt || chat.updatedAt,
            unreadCount: chat.unreadCount,
        }));

        const existingByParticipant = new Map(
            activeChats.map((chat) => [
                chats.find((item) => item.id === chat.chatId)?.participantId,
                chat,
            ]),
        );

        const people = participants.map((participant) => {
            const existingChat = existingByParticipant.get(participant.id);

            return {
                id: `participant-${participant.id}`,
                name: participant.name,
                subtitle: participant.subtitle,
                role: participant.role,
                avatarUrl: participant.avatarUrl,
                chatId: participant.chatId ?? existingChat?.chatId,
                requestId: participant.requestId ?? existingChat?.requestId,
                service: participant.service ?? existingChat?.service,
                lastMessage:
                    participant.lastMessage ?? existingChat?.lastMessage,
                lastMessageAt:
                    participant.lastMessageAt ?? existingChat?.lastMessageAt,
                unreadCount:
                    participant.unreadCount ?? existingChat?.unreadCount ?? 0,
            };
        });

        const chatsWithoutParticipant = activeChats.filter((chat) => {
            const source = chats.find((item) => item.id === chat.chatId);

            return (
                !source?.participantId ||
                !existingByParticipant.has(source.participantId)
            );
        });

        return [...people, ...chatsWithoutParticipant].sort((left, right) => {
            if (left.unreadCount !== right.unreadCount) {
                return right.unreadCount - left.unreadCount;
            }

            return (right.lastMessageAt ?? '').localeCompare(
                left.lastMessageAt ?? '',
            );
        });
    }, [chats, participants, viewerRole]);

    const filteredConversations = conversations.filter((conversation) => {
        const matchesQuery = `${conversation.name} ${conversation.subtitle}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());

        return matchesQuery && (!onlyUnread || conversation.unreadCount > 0);
    });
    const selectedConversation =
        conversations.find((conversation) => conversation.id === selectedId) ??
        conversations[0] ??
        null;
    const unreadTotal = conversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0,
    );

    return (
        <>
            <Head title="Чаты" />

            <div className="flex h-full flex-1 flex-col p-4">
                <section className="grid min-h-[680px] overflow-hidden rounded-2xl border border-sidebar-border/70 bg-background shadow-sm lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-sidebar-border">
                    <aside className="flex min-h-0 flex-col border-b border-sidebar-border/70 bg-muted/20 lg:border-r lg:border-b-0 dark:border-sidebar-border">
                        <div className="space-y-4 border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h1 className="text-xl font-semibold tracking-tight">
                                        Сообщения
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Компании и клиенты в одном списке
                                    </p>
                                </div>
                                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <UsersRound
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                            </div>

                            <div className="relative">
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
                                    placeholder="Поиск собеседника"
                                    aria-label="Поиск собеседника"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                        !onlyUnread ? 'secondary' : 'ghost'
                                    }
                                    onClick={() => setOnlyUnread(false)}
                                >
                                    Все
                                    <span className="text-muted-foreground">
                                        {conversations.length}
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

                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            {filteredConversations.length > 0 ? (
                                <div className="grid gap-1">
                                    {filteredConversations.map(
                                        (conversation) => {
                                            const isSelected =
                                                selectedConversation?.id ===
                                                conversation.id;

                                            return (
                                                <button
                                                    className={cn(
                                                        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                                                        isSelected
                                                            ? 'bg-background shadow-sm ring-1 ring-sidebar-border/70 dark:ring-sidebar-border'
                                                            : 'hover:bg-background/70',
                                                    )}
                                                    key={conversation.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedId(
                                                            conversation.id,
                                                        )
                                                    }
                                                >
                                                    <Avatar className="size-11 border border-sidebar-border/70 dark:border-sidebar-border">
                                                        {conversation.avatarUrl && (
                                                            <AvatarImage
                                                                src={
                                                                    conversation.avatarUrl
                                                                }
                                                                alt=""
                                                            />
                                                        )}
                                                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                            {initials(
                                                                conversation.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex items-center justify-between gap-3">
                                                            <span className="truncate text-sm font-semibold">
                                                                {
                                                                    conversation.name
                                                                }
                                                            </span>
                                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                                {
                                                                    conversation.lastMessageAt
                                                                }
                                                            </span>
                                                        </span>
                                                        <span className="mt-0.5 flex items-center justify-between gap-2">
                                                            <span className="truncate text-xs text-muted-foreground">
                                                                {conversation.lastMessage ??
                                                                    conversation.subtitle}
                                                            </span>
                                                            {conversation.unreadCount >
                                                                0 && (
                                                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                                                                    {
                                                                        conversation.unreadCount
                                                                    }
                                                                </span>
                                                            )}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            ) : (
                                <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 text-center">
                                    <span className="flex size-11 items-center justify-center rounded-full bg-background">
                                        <Inbox
                                            className="size-5 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">
                                            Ничего не найдено
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Попробуйте изменить запрос или
                                            фильтр.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    <main className="flex min-h-[470px] min-w-0 flex-col">
                        {selectedConversation ? (
                            <>
                                <header className="flex items-center justify-between gap-4 border-b border-sidebar-border/70 p-4 sm:px-6 dark:border-sidebar-border">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar className="size-11 border border-sidebar-border/70 dark:border-sidebar-border">
                                            {selectedConversation.avatarUrl && (
                                                <AvatarImage
                                                    src={
                                                        selectedConversation.avatarUrl
                                                    }
                                                    alt=""
                                                />
                                            )}
                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                {initials(
                                                    selectedConversation.name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate font-semibold">
                                                    {selectedConversation.name}
                                                </h2>
                                                <Badge variant="secondary">
                                                    {participantLabel(
                                                        selectedConversation.role,
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {selectedConversation.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedConversation.requestId && (
                                        <span className="hidden text-sm text-muted-foreground sm:block">
                                            Заявка #
                                            {selectedConversation.requestId}
                                        </span>
                                    )}
                                </header>

                                <div className="flex min-h-0 flex-1 flex-col bg-muted/10 p-4 sm:p-6">
                                    {selectedConversation.chatId ? (
                                        <div className="m-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
                                            <span className="flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
                                                <MessageCircleMore
                                                    className="size-6 text-primary"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">
                                                    Диалог с{' '}
                                                    {selectedConversation.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedConversation.service
                                                        ? `Переписка по услуге «${selectedConversation.service}».`
                                                        : 'Откройте переписку, чтобы увидеть всю историю сообщений.'}
                                                </p>
                                            </div>
                                            {selectedConversation.lastMessage && (
                                                <div className="w-full rounded-2xl border border-sidebar-border/70 bg-background p-4 text-left shadow-sm dark:border-sidebar-border">
                                                    <p className="text-xs text-muted-foreground">
                                                        Последнее сообщение
                                                    </p>
                                                    <p className="mt-1 text-sm">
                                                        {
                                                            selectedConversation.lastMessage
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {selectedConversation.requestId && (
                                                <Button asChild>
                                                    <Link
                                                        href={showChat(
                                                            Number(
                                                                selectedConversation.requestId,
                                                            ),
                                                        )}
                                                        prefetch
                                                    >
                                                        Открыть переписку
                                                        <ChevronRight
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="m-auto flex max-w-md flex-col items-center gap-4 text-center">
                                            <span className="flex size-14 items-center justify-center rounded-full bg-background shadow-sm">
                                                <MessageSquareText
                                                    className="size-6 text-primary"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">
                                                    Начните диалог
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    История сообщений с этим
                                                    собеседником появится здесь
                                                    после первого обращения.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-sidebar-border/70 p-4 sm:px-6 dark:border-sidebar-border">
                                    <div className="flex items-end gap-3">
                                        <textarea
                                            className="min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            placeholder="Напишите сообщение"
                                            rows={1}
                                            disabled
                                            aria-label="Сообщение"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            disabled
                                            aria-label="Отправить сообщение"
                                        >
                                            <SendHorizontal
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="m-auto flex max-w-sm flex-col items-center gap-4 px-6 text-center">
                                <span className="flex size-14 items-center justify-center rounded-full bg-muted">
                                    <MessageSquareText
                                        className="size-6 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold">
                                        Выберите собеседника
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Здесь будут доступны все компании и
                                        клиенты, с которыми можно связаться.
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
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
