import { Link, useForm } from '@inertiajs/react';
import { show as showOrder } from '@/actions/App/Http/Controllers/ClientRequestController';
import {
    show,
    assistance,
    note,
} from '@/actions/App/Http/Controllers/RequestRecoveryController';
import { Button } from '@/components/ui/button';

export type RecoveryDetails = {
    id: string;
    needsRecovery?: boolean;
    replacementRequestId?: number | null;
    assistanceRequested?: boolean;
    assistanceNote?: string | null;
};

export function RecoveryActions({
    order,
    admin = false,
}: {
    order: RecoveryDetails;
    admin?: boolean;
}) {
    const help = useForm({ request: '' });
    const reply = useForm({ note: order.assistanceNote ?? '' });

    if (
        !order.needsRecovery &&
        !order.replacementRequestId &&
        !order.assistanceRequested &&
        !order.assistanceNote
    ) {
        return null;
    }

    return (
        <section className="grid gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            <h3 className="font-semibold">Помощь с заявкой</h3>
            {order.replacementRequestId ? (
                <p>
                    Выбран другой исполнитель.{' '}
                    {!admin ? (
                        <Link
                            className="underline"
                            href={showOrder.url(order.replacementRequestId)}
                        >
                            Новая заявка №{order.replacementRequestId}
                        </Link>
                    ) : (
                        `Новая заявка №${order.replacementRequestId}`
                    )}
                </p>
            ) : (
                order.needsRecovery && (
                    <>
                        <p>
                            Компания отказала, не ответила в течение 48 часов
                            или ещё не выбрана. Можно продолжить подбор с
                            сохранением параметров.
                        </p>
                        <Button asChild>
                            <Link href={show.url(Number(order.id))}>
                                Выбрать другого исполнителя
                            </Link>
                        </Button>
                        {!order.assistanceRequested && (
                            <Button
                                variant="outline"
                                disabled={help.processing}
                                onClick={() =>
                                    help.post(
                                        assistance.url(Number(order.id)),
                                        {
                                            preserveScroll: true,
                                        },
                                    )
                                }
                            >
                                Попросить помощь сервиса
                            </Button>
                        )}
                    </>
                )
            )}
            {order.assistanceRequested && (
                <p>Запрос помощи передан администратору.</p>
            )}
            {order.assistanceNote && (
                <p className="whitespace-pre-wrap">
                    Поддержка: {order.assistanceNote}
                </p>
            )}
            {Object.values(help.errors).map((error) => (
                <p key={error} className="text-destructive">
                    {error}
                </p>
            ))}
            {admin && (
                <form
                    className="grid gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        reply.patch(note.url(Number(order.id)), {
                            preserveScroll: true,
                        });
                    }}
                >
                    <label className="grid gap-1">
                        Результат помощи (виден клиенту)
                        <textarea
                            required
                            maxLength={2000}
                            className="rounded-md border bg-background p-2"
                            value={reply.data.note}
                            onChange={(e) =>
                                reply.setData('note', e.target.value)
                            }
                        />
                    </label>
                    {Object.values(reply.errors).map((error) => (
                        <p key={error} className="text-destructive">
                            {error}
                        </p>
                    ))}
                    <Button disabled={reply.processing}>
                        Сохранить ответ поддержки
                    </Button>
                </form>
            )}
        </section>
    );
}
