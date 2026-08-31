import { useForm } from '@inertiajs/react';
import { MessageSquareText, SendHorizontal } from 'lucide-react';
import {
    store as storeMessage,
    storeForRequest,
} from '@/actions/App/Http/Controllers/ChatController';
import InputError from '@/components/input-error';
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

type ChatMessage = {
    id: string;
    author: 'client' | 'vendor';
    text: string;
    sentAt: string;
    isRead: boolean;
};

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
    chat?: {
        id: string;
        messages: ChatMessage[];
    } | null;
};

type RequestClientChatDialogProps = {
    lead: RequestClientChatLead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function RequestClientChatDialog({
    lead,
    open,
    onOpenChange,
}: RequestClientChatDialogProps) {
    const form = useForm({
        content: '',
        content_type: 'text',
    });
    const messages = lead?.chat?.messages ?? [];

    const sendText = () => {
        if (!lead || form.data.content.trim().length === 0) {
            return;
        }

        const action = lead.chat?.id
            ? storeMessage(Number(lead.chat.id))
            : storeForRequest(Number(lead.id));

        form.submit(action, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => form.reset('content'),
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset('content');
                    form.clearErrors();
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
                                {messages.length > 0 ? (
                                    messages.map((message) => {
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
                                                    <p className="leading-relaxed break-words whitespace-pre-wrap">
                                                        {message.text}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                        <MessageSquareText
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                        Сообщений пока нет.
                                    </div>
                                )}
                            </div>

                            <form
                                className="grid gap-2 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendText();
                                }}
                            >
                                <label className="flex min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                                    <span className="sr-only">
                                        Текст сообщения
                                    </span>
                                    <textarea
                                        className="min-h-20 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
                                        placeholder="Написать клиенту..."
                                        value={form.data.content}
                                        onChange={(event) =>
                                            form.setData(
                                                'content',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <Button
                                    className="justify-start"
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        form.data.content.trim().length === 0
                                    }
                                >
                                    <SendHorizontal
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Отправить
                                </Button>
                                <InputError
                                    className="sm:col-span-2"
                                    message={form.errors.content}
                                />
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
