import { router, useForm } from '@inertiajs/react';
import {
    store,
    update,
    escalate,
} from '@/actions/App/Http/Controllers/WarrantyClaimController';
import { Button } from '@/components/ui/button';

export type WarrantyClaim = {
    id: number;
    description: string;
    status: string;
    supportRequested: boolean;
    response: string | null;
    responder: string;
    createdAt: string;
};
const statuses: Record<string, string> = {
    open: 'Открыто',
    in_progress: 'В работе',
    resolved: 'Решено',
};

function ClaimResponse({
    orderId,
    claim,
}: {
    orderId: string;
    claim: WarrantyClaim;
}) {
    const form = useForm({
        response: claim.response ?? '',
        status: 'in_progress',
    });

    return (
        <form
            className="grid gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                form.patch(
                    update.url({
                        serviceRequest: Number(orderId),
                        warrantyClaim: claim.id,
                    }),
                );
            }}
        >
            <label className="grid gap-1">
                Ответ клиенту
                <textarea
                    required
                    maxLength={5000}
                    className="rounded-md border bg-background p-2"
                    value={form.data.response}
                    onChange={(e) => form.setData('response', e.target.value)}
                />
            </label>
            <select
                aria-label="Статус обращения"
                className="rounded-md border bg-background p-2"
                value={form.data.status}
                onChange={(e) => form.setData('status', e.target.value)}
            >
                <option value="in_progress">В работе</option>
                <option value="resolved">Решено</option>
            </select>
            {Object.values(form.errors).map((error) => (
                <p key={error} className="text-destructive">
                    {error}
                </p>
            ))}
            <Button disabled={form.processing}>Отправить ответ</Button>
        </form>
    );
}

export function WarrantyClaims({
    orderId,
    claims = [],
    role,
    canCreate = false,
}: {
    orderId: string;
    claims?: WarrantyClaim[];
    role: 'client' | 'vendor' | 'admin';
    canCreate?: boolean;
}) {
    const form = useForm({ description: '', support_requested: false });
    const open = claims.some((claim) => claim.status !== 'resolved');

    if (!canCreate && claims.length === 0) {
        return null;
    }

    return (
        <section className="grid gap-4 rounded-xl border p-4 text-sm">
            <h3 className="text-lg font-semibold">Гарантийные обращения</h3>
            {claims.map((claim) => (
                <article
                    key={claim.id}
                    className="grid gap-3 rounded-lg bg-muted/40 p-3"
                >
                    <p className="font-medium">
                        {statuses[claim.status]} · {claim.createdAt}
                        {claim.supportRequested && ' · Запрошена поддержка'}
                    </p>
                    <p className="whitespace-pre-wrap">{claim.description}</p>
                    {claim.response && (
                        <p className="whitespace-pre-wrap">
                            <strong>{claim.responder}:</strong> {claim.response}
                        </p>
                    )}
                    {role === 'client' ? (
                        !claim.supportRequested && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.patch(
                                        escalate.url({
                                            serviceRequest: Number(orderId),
                                            warrantyClaim: claim.id,
                                        }),
                                    )
                                }
                            >
                                Попросить поддержку сервиса
                            </Button>
                        )
                    ) : (
                        <ClaimResponse orderId={orderId} claim={claim} />
                    )}
                </article>
            ))}
            {role === 'client' && canCreate && !open && (
                <form
                    className="grid gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(store.url(Number(orderId)), {
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <label className="grid gap-2">
                        Опишите проблему
                        <textarea
                            required
                            minLength={10}
                            maxLength={5000}
                            className="rounded-md border bg-background p-2"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                        />
                    </label>
                    <label className="flex gap-2">
                        <input
                            type="checkbox"
                            checked={form.data.support_requested}
                            onChange={(e) =>
                                form.setData(
                                    'support_requested',
                                    e.target.checked,
                                )
                            }
                        />
                        Нужна помощь поддержки сервиса
                    </label>
                    {Object.values(form.errors).map((error) => (
                        <p key={error} className="text-destructive">
                            {error}
                        </p>
                    ))}
                    <Button disabled={form.processing}>
                        Сообщить о проблеме
                    </Button>
                </form>
            )}
        </section>
    );
}
