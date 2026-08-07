import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCheck,
    MapPin,
    MessageSquareText,
    SendHorizontal,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    getStatusLabel,
    getStatusVariant,
    type RequestStatus,
} from '@/lib/dashboard-format';
import {
    index as chatsIndex,
    store as storeMessage,
} from '@/actions/App/Http/Controllers/ChatController';

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
};

export default function ChatShow({ chat }: ChatShowProps) {
    const form = useForm({
        content: '',
        content_type: 'text',
    });

    function submitMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.submit(storeMessage(Number(chat.id)), {
            preserveScroll: true,
            onSuccess: () => form.reset('content'),
        });
    }

    return (
        <>
            <Head title={`Чат по заявке ${chat.requestId}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
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
                                        variant={getStatusVariant(chat.status)}
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
                            <p className="font-medium">{chat.service}</p>
                            <p className="mt-1 text-muted-foreground">
                                {chat.location || 'Локация не указана'}
                            </p>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <Card className="min-h-[620px] border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Переписка</CardTitle>
                            <CardDescription>
                                Сообщения сохраняются в таблицу chat_messages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex min-h-[500px] flex-col gap-4">
                            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-sidebar-border/70 bg-muted/20 p-4 dark:border-sidebar-border">
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
                                                        ? 'max-w-[min(34rem,85%)] rounded-xl bg-primary px-4 py-3 text-primary-foreground'
                                                        : 'max-w-[min(34rem,85%)] rounded-xl border border-sidebar-border/70 bg-background px-4 py-3 dark:border-sidebar-border'
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
                                                Напишите первое сообщение, чтобы
                                                начать переписку по заявке.
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
                                />
                                <InputError message={form.errors.content} />
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={
                                            form.processing ||
                                            form.data.content.trim().length ===
                                                0
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
                                    Контекст, к которому привязана переписка.
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
                                            {chat.request.district} район
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
                                            {chat.request.installationDate}
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
