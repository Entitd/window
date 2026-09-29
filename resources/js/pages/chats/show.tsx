import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCheck,
    MapPin,
    MessageSquareText,
    SendHorizontal,
} from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';
import {
    index as chatsIndex,
    show as showChat,
    store as storeMessage,
} from '@/actions/App/Http/Controllers/ChatController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getStatusLabel, getStatusVariant } from '@/lib/dashboard-format';
import type { RequestStatus } from '@/lib/dashboard-format';

type ChatMessage = {
    id: string;
    senderId: string;
    senderName: string;
    content: string | null;
    contentType: string;
    isRead: boolean;
    isMine: boolean;
    sentAt: string;
};

type ChatDetails = {
    id: string;
    requestId: string;
    participantName: string;
    participantSubtitle: string;
    service: string;
    status: RequestStatus;
    location: string;
    unreadCount: number;
    request: {
        id: string;
        service: string;
        status: RequestStatus;
        city: string;
        district: string;
        installationDate: string;
        estimatedPrice: string;
    };
    messages: ChatMessage[];
};

type ChatShowProps = {
    chat: ChatDetails;
    chats: ChatListItem[];
};

type ChatListItem = {
    id: string;
    requestId: string;
    participantName: string;
    service: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
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

export default function ChatShow({ chat, chats }: ChatShowProps) {
    const form = useForm({
        content: '',
        content_type: 'text',
    });
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const messages = messagesRef.current;

        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }, [chat.id, chat.messages.length]);

    function submitMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.submit(storeMessage(Number(chat.id)), {
            preserveScroll: true,
            onSuccess: () => form.reset('content'),
        });
    }

    function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key !== 'Enter' || event.shiftKey || form.processing) {
            return;
        }

        event.preventDefault();

        if (form.data.content.trim().length > 0) {
            event.currentTarget.form?.requestSubmit();
        }
    }

    return (
        <>
            <Head title={`Чат по заявке ${chat.requestId}`} />

            <div className="flex h-full flex-1 flex-col p-4 lg:p-6">
                <section className="grid min-h-[680px] w-full overflow-hidden rounded-2xl border border-sidebar-border/70 bg-background shadow-sm lg:grid-cols-[20rem_minmax(0,1fr)] dark:border-sidebar-border">
                    <aside className="flex min-h-0 flex-col border-b border-sidebar-border/70 bg-muted/20 lg:border-r lg:border-b-0 dark:border-sidebar-border">
                        <div className="flex items-center justify-between border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div>
                                <h2 className="font-semibold">Диалоги</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {chats.length} активных
                                </p>
                            </div>
                            <Button asChild size="sm" variant="ghost">
                                <Link href={chatsIndex()} prefetch>
                                    Все
                                </Link>
                            </Button>
                        </div>

                        <nav
                            className="min-h-0 flex-1 overflow-y-auto p-2"
                            aria-label="Список чатов"
                        >
                            <div className="grid gap-1">
                                {chats.map((listChat) => (
                                    <Link
                                        className={`flex items-center gap-3 rounded-xl p-3 transition-colors focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none ${
                                            listChat.id === chat.id
                                                ? 'bg-background shadow-sm ring-1 ring-sidebar-border/70 dark:ring-sidebar-border'
                                                : 'hover:bg-background/70'
                                        }`}
                                        href={showChat(
                                            Number(listChat.requestId),
                                        )}
                                        key={listChat.id}
                                        prefetch
                                    >
                                        <Avatar className="size-10 shrink-0 border border-sidebar-border/70 dark:border-sidebar-border">
                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                {initials(
                                                    listChat.participantName,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-semibold">
                                                    {listChat.participantName}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                                    {listChat.lastMessageAt}
                                                </span>
                                            </span>
                                            <span className="mt-1 flex items-center justify-between gap-2">
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {listChat.lastMessage ||
                                                        listChat.service}
                                                </span>
                                                {listChat.unreadCount > 0 && (
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                                                        {listChat.unreadCount}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </aside>

                    <main className="flex min-h-0 min-w-0 flex-col overflow-y-auto">
                        <Card className="rounded-none border-0 border-b border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-3">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={chatsIndex()} prefetch>
                                            <ArrowLeft
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            Все чаты
                                        </Link>
                                    </Button>

                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <CardTitle className="text-xl">
                                                {chat.participantName}
                                            </CardTitle>
                                            <Badge
                                                variant={getStatusVariant(
                                                    chat.status,
                                                )}
                                            >
                                                {getStatusLabel(chat.status)}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {chat.participantSubtitle} по заявке{' '}
                                            {chat.requestId}
                                        </CardDescription>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-muted/50 p-3 text-sm sm:min-w-64">
                                    <p className="font-medium">
                                        {chat.service}
                                    </p>
                                    <p className="mt-1 text-muted-foreground">
                                        {chat.location || 'Локация не указана'}
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>

                        <div className="grid flex-1 gap-4 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                            <Card className="min-h-[620px] border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle>Переписка</CardTitle>
                                    <CardDescription>
                                        Сообщения сохраняются в таблицу
                                        chat_messages.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex min-h-[500px] flex-col gap-4">
                                    <div
                                        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-sidebar-border/70 bg-muted/20 p-4 dark:border-sidebar-border"
                                        ref={messagesRef}
                                    >
                                        {chat.messages.length > 0 ? (
                                            chat.messages.map((message) => (
                                                <div
                                                    className={
                                                        message.isMine
                                                            ? 'flex justify-end'
                                                            : 'flex justify-start'
                                                    }
                                                    key={message.id}
                                                >
                                                    <article
                                                        className={
                                                            message.isMine
                                                                ? 'max-w-[min(34rem,85%)] rounded-2xl bg-primary px-4 py-3 text-primary-foreground'
                                                                : 'max-w-[min(34rem,85%)] rounded-2xl border border-sidebar-border/70 bg-background px-4 py-3 dark:border-sidebar-border'
                                                        }
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                                            <span className="font-medium">
                                                                {message.isMine
                                                                    ? 'Вы'
                                                                    : message.senderName}
                                                            </span>
                                                            <span
                                                                className={
                                                                    message.isMine
                                                                        ? 'text-primary-foreground/70'
                                                                        : 'text-muted-foreground'
                                                                }
                                                            >
                                                                {message.sentAt}
                                                            </span>
                                                            {message.isMine &&
                                                                message.isRead && (
                                                                    <CheckCheck
                                                                        className="size-3.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                )}
                                                        </div>
                                                        <p className="mt-2 text-sm break-words whitespace-pre-wrap">
                                                            {message.content}
                                                        </p>
                                                    </article>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
                                                <div className="rounded-full bg-background p-3">
                                                    <MessageSquareText
                                                        className="size-6 text-muted-foreground"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div className="max-w-sm space-y-2">
                                                    <h2 className="text-base font-semibold">
                                                        Сообщений пока нет
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground">
                                                        Напишите первое
                                                        сообщение, чтобы начать
                                                        переписку по заявке.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <form
                                        className="grid gap-3"
                                        onSubmit={submitMessage}
                                    >
                                        <input
                                            name="content_type"
                                            type="hidden"
                                            value={form.data.content_type}
                                        />
                                        <textarea
                                            className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                            name="content"
                                            placeholder="Напишите сообщение"
                                            value={form.data.content}
                                            onChange={(event) =>
                                                form.setData(
                                                    'content',
                                                    event.target.value,
                                                )
                                            }
                                            onKeyDown={submitOnEnter}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter — отправить, Shift + Enter —
                                            новая строка.
                                        </p>
                                        <InputError
                                            message={form.errors.content}
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    form.processing ||
                                                    form.data.content.trim()
                                                        .length === 0
                                                }
                                            >
                                                <SendHorizontal
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                Отправить
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <aside className="grid content-start gap-4">
                                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                                    <CardHeader>
                                        <CardTitle>Заявка</CardTitle>
                                        <CardDescription>
                                            Контекст, к которому привязана
                                            переписка.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 text-sm">
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-muted-foreground">
                                                Номер
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {chat.request.id}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-muted-foreground">
                                                Услуга
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {chat.request.service}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-muted-foreground">
                                                Цена
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {chat.request.estimatedPrice}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                                    <CardHeader>
                                        <CardTitle>Детали</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 text-sm">
                                        <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                                            <MapPin
                                                className="mt-0.5 size-4 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <p className="font-medium">
                                                    {chat.request.city ||
                                                        'Город не указан'}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {chat.request.district}{' '}
                                                    район
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                                            <CalendarDays
                                                className="mt-0.5 size-4 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <p className="font-medium">
                                                    {
                                                        chat.request
                                                            .installationDate
                                                    }
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Дата работ
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>
                    </main>
                </section>
            </div>
        </>
    );
}

ChatShow.layout = {
    breadcrumbs: [
        {
            title: 'Чаты',
            href: '/chats',
        },
    ],
};
