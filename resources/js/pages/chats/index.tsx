import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Inbox,
    MessageSquareText,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { show as showChat } from '@/actions/App/Http/Controllers/ChatController';
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

function EmptyChatsState() {
    return (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-sidebar-border/70 p-8 text-center dark:border-sidebar-border">
            <div className="rounded-full bg-muted p-3">
                <Inbox className="size-6" aria-hidden="true" />
            </div>
            <div className="max-w-md space-y-2">
                <h2 className="text-lg font-semibold">Чатов пока нет</h2>
                <p className="text-sm text-muted-foreground">
                    Откройте чат из карточки заявки, и переписка появится в этом
                    списке.
                </p>
            </div>
        </div>
    );
}

export default function ChatsIndex({ chats = [] }: ChatsIndexProps) {
    const unreadTotal = chats.reduce(
        (total, chat) => total + chat.unreadCount,
        0,
    );
    const activeChats = chats.filter((chat) =>
        ['new', 'awaiting_confirmation', 'confirmed', 'in_progress'].includes(
            chat.status,
        ),
    );

    return (
        <>
            <Head title="Чаты" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-2xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border">
                        <CardContent className="flex min-h-32 flex-col justify-between gap-5 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Всего чатов
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {chats.length}
                                    </p>
                                </div>
                                <MessageSquareText
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border">
                        <CardContent className="flex min-h-32 flex-col justify-between gap-5 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Непрочитанные
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {unreadTotal}
                                    </p>
                                </div>
                                <Search
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 py-0 shadow-none dark:border-sidebar-border">
                        <CardContent className="flex min-h-32 flex-col justify-between gap-5 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Активные заявки
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {activeChats.length}
                                    </p>
                                </div>
                                <ShieldCheck
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 shadow-none dark:border-sidebar-border">
                    <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-xl">
                                Все переписки
                            </CardTitle>
                            <CardDescription>
                                Чаты сгруппированы по заявкам, поэтому разные
                                заказы с одной компанией не смешиваются.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {chats.length > 0 ? (
                            <div className="grid gap-3">
                                {chats.map((chat) => (
                                    <article
                                        className="rounded-2xl border border-sidebar-border/70 bg-background p-4 dark:border-sidebar-border"
                                        key={chat.id}
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold">
                                                        Заявка {chat.requestId}
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
                                                    {chat.unreadCount > 0 && (
                                                        <Badge variant="secondary">
                                                            {chat.unreadCount}{' '}
                                                            новых
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-base font-semibold">
                                                        {chat.participantName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            chat.participantSubtitle
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                asChild
                                                className="w-full sm:w-auto"
                                                size="sm"
                                            >
                                                <Link
                                                    href={showChat(
                                                        Number(chat.requestId),
                                                    )}
                                                    prefetch
                                                >
                                                    Открыть
                                                    <ArrowRight
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </Link>
                                            </Button>
                                        </div>

                                        <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                                            <div className="rounded-lg bg-muted/50 p-3">
                                                <dt className="text-muted-foreground">
                                                    Услуга
                                                </dt>
                                                <dd className="mt-1 font-medium">
                                                    {chat.service}
                                                </dd>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-3">
                                                <dt className="text-muted-foreground">
                                                    Локация
                                                </dt>
                                                <dd className="mt-1 font-medium">
                                                    {chat.location ||
                                                        'Не указана'}
                                                </dd>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-3">
                                                <dt className="text-muted-foreground">
                                                    Обновлен
                                                </dt>
                                                <dd className="mt-1 font-medium">
                                                    {chat.updatedAt ||
                                                        'Пока нет'}
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="mt-4 rounded-lg border border-dashed border-sidebar-border/70 p-3 text-sm dark:border-sidebar-border">
                                            <p className="line-clamp-2 text-muted-foreground">
                                                {chat.lastMessage}
                                            </p>
                                            {chat.lastMessageAt && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {chat.lastMessageAt}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <EmptyChatsState />
                        )}
                    </CardContent>
                </Card>
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
