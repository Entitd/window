import { MessageSquareText, Paperclip, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getStatusVariant } from '@/lib/dashboard-format';
import type { RequestStatus } from '@/lib/dashboard-format';

export type RequestClientChatLead = {
    id: string;
    district: string;
    city: string;
    installationDate: string;
    width: number;
    height: number;
    service: string;
    comment: string;
    estimatedPrice: string;
    status: RequestStatus;
    clientName?: string;
    clientPhone?: string | null;
    clientEmail?: string | null;
};

type ChatMessage = {
    id: string;
    author: 'client' | 'vendor';
    text: string;
    sentAt: string;
    attachment?: string;
};

type RequestClientChatDialogProps = {
    lead: RequestClientChatLead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function getMockChatMessages(lead: RequestClientChatLead): ChatMessage[] {
    const clientName = lead.clientName ?? 'Клиент';

    return [
        {
            id: `${lead.id}-client-1`,
            author: 'client',
            text: `Здравствуйте! Нужна консультация по заявке "${lead.service}". Удобно обсудить детали сегодня?`,
            sentAt: 'Сегодня, 09:12',
        },
        {
            id: `${lead.id}-vendor-1`,
            author: 'vendor',
            text: `${clientName}, добрый день. Да, подскажите, пожалуйста, есть ли ограничения по времени для замера?`,
            sentAt: 'Сегодня, 09:18',
        },
        {
            id: `${lead.id}-client-2`,
            author: 'client',
            text: `Ориентировочный размер ${lead.width} x ${lead.height} см. Комментарий к заявке: ${lead.comment}`,
            sentAt: 'Сегодня, 09:24',
            attachment: 'photo-window.jpg',
        },
        {
            id: `${lead.id}-vendor-2`,
            author: 'vendor',
            text: `Предварительно получается ${lead.estimatedPrice}. После замера закрепим финальную смету и дату работ: ${lead.installationDate}.`,
            sentAt: 'Сегодня, 09:31',
        },
    ];
}

export function RequestClientChatDialog({
    lead,
    open,
    onOpenChange,
}: RequestClientChatDialogProps) {
    const [draft, setDraft] = useState('');
    const [messagesByLeadId, setMessagesByLeadId] = useState<
        Record<string, ChatMessage[]>
    >({});

    const messages = lead
        ? (messagesByLeadId[lead.id] ?? getMockChatMessages(lead))
        : [];

    const addAttachment = () => {
        if (!lead) {
            return;
        }

        setMessagesByLeadId((currentMessages) => {
            const leadMessages =
                currentMessages[lead.id] ?? getMockChatMessages(lead);

            return {
                ...currentMessages,
                [lead.id]: [
                    ...leadMessages,
                    {
                        id: `${lead.id}-attachment-${Date.now()}`,
                        author: 'vendor',
                        text: 'Добавлено вложение к переписке.',
                        sentAt: 'Только что',
                        attachment: `offer-${lead.id}.pdf`,
                    },
                ],
            };
        });
    };

    const sendText = () => {
        const messageText = draft.trim();

        if (!lead || messageText.length === 0) {
            return;
        }

        setMessagesByLeadId((currentMessages) => {
            const leadMessages =
                currentMessages[lead.id] ?? getMockChatMessages(lead);

            return {
                ...currentMessages,
                [lead.id]: [
                    ...leadMessages,
                    {
                        id: `${lead.id}-vendor-${Date.now()}`,
                        author: 'vendor',
                        text: messageText,
                        sentAt: 'Только что',
                    },
                ],
            };
        });
        setDraft('');
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setDraft('');
                }

                onOpenChange(isOpen);
            }}
        >
            <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                {lead && (
                    <>
                        <DialogHeader className="border-b p-5 pr-12">
                            <div className="flex flex-wrap items-center gap-2">
                                <DialogTitle>Чат с клиентом</DialogTitle>
                                <Badge variant={getStatusVariant(lead.status)}>
                                    {lead.id}
                                </Badge>
                            </div>
                            <DialogDescription>
                                {lead.clientName ?? 'Клиент'} по заявке на{' '}
                                {lead.service.toLowerCase()}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
                            <div className="grid gap-3 rounded-lg border border-sidebar-border/70 bg-muted/30 p-4 text-sm sm:grid-cols-3 dark:border-sidebar-border">
                                <div>
                                    <p className="text-muted-foreground">
                                        Локация
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {lead.city}, {lead.district} район
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Дата работ
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {lead.installationDate}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Сумма
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {lead.estimatedPrice}
                                    </p>
                                </div>
                            </div>

                            <div className="min-h-72 space-y-3 overflow-y-auto pr-1">
                                {messages.map((message) => {
                                    const isVendor =
                                        message.author === 'vendor';

                                    return (
                                        <div
                                            className={`flex ${
                                                isVendor
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                            key={message.id}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                                    isVendor
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-foreground'
                                                }`}
                                            >
                                                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs opacity-80">
                                                    <span>
                                                        {isVendor
                                                            ? 'Компания'
                                                            : (lead.clientName ??
                                                              'Клиент')}
                                                    </span>
                                                    <span>
                                                        {message.sentAt}
                                                    </span>
                                                </div>
                                                <p className="leading-relaxed">
                                                    {message.text}
                                                </p>
                                                {message.attachment && (
                                                    <div
                                                        className={`mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                                                            isVendor
                                                                ? 'bg-primary-foreground/15'
                                                                : 'bg-background'
                                                        }`}
                                                    >
                                                        <Paperclip
                                                            className="size-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="truncate">
                                                            {message.attachment}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form
                                className="grid gap-2 border-t pt-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendText();
                                }}
                            >
                                <Button
                                    className="justify-start"
                                    type="button"
                                    variant="outline"
                                    onClick={addAttachment}
                                >
                                    <Paperclip
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Вложение
                                </Button>
                                <label className="flex min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                                    <span className="sr-only">
                                        Текст сообщения
                                    </span>
                                    <textarea
                                        className="min-h-20 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
                                        placeholder="Написать клиенту..."
                                        value={draft}
                                        onChange={(event) =>
                                            setDraft(event.target.value)
                                        }
                                    />
                                </label>
                                <Button
                                    className="justify-start"
                                    type="submit"
                                    disabled={draft.trim().length === 0}
                                >
                                    <SendHorizontal
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Добавить текст
                                </Button>
                            </form>
                        </div>
                    </>
                )}

                {!lead && (
                    <div className="flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
                        <MessageSquareText
                            className="size-6"
                            aria-hidden="true"
                        />
                        Выберите заявку, чтобы открыть переписку.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
