import { Head, useForm } from '@inertiajs/react';
import {
    store,
    assistance,
} from '@/actions/App/Http/Controllers/RequestRecoveryController';
import { Button } from '@/components/ui/button';

export default function RequestRecovery({
    orderId,
    choices,
}: {
    orderId: string;
    choices: {
        id: number;
        name: string;
        price: number | null;
        warrantyMonths: number | null;
        warrantyDescription: string | null;
    }[];
}) {
    const form = useForm({ offering_id: 0 });
    const help = useForm({ request: '' });

    return (
        <main className="mx-auto grid w-full max-w-3xl gap-5 p-6">
            <Head title="Выбрать другого исполнителя" />
            <h1 className="text-2xl font-semibold">
                Другой исполнитель для заявки №{orderId}
            </h1>
            <p>
                Параметры, адрес, контакт и фотографии сохранятся в новой
                заявке. Цена будет пересчитана по тарифу выбранной компании.
                Дату и время нужно подтвердить заново; прошедшая дата будет
                сброшена.
            </p>
            {choices.length ? (
                <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(store.url(Number(orderId)));
                    }}
                >
                    {choices.map((choice) => (
                        <label
                            key={choice.id}
                            className="flex gap-3 rounded-xl border p-4"
                        >
                            <input
                                type="radio"
                                name="offering"
                                required
                                value={choice.id}
                                checked={form.data.offering_id === choice.id}
                                onChange={() =>
                                    form.setData('offering_id', choice.id)
                                }
                            />
                            <span className="grid gap-2">
                                <strong>{choice.name}</strong>
                                <span>
                                    {choice.price === null
                                        ? 'Цена после уточнения'
                                        : `Примерно ${choice.price.toLocaleString('ru-RU')} ₽`}
                                </span>
                                <span>
                                    Гарантия:{' '}
                                    {choice.warrantyMonths
                                        ? `${choice.warrantyMonths} мес.`
                                        : 'Срок уточняется'}
                                </span>
                                <span>
                                    {choice.warrantyDescription ||
                                        'Условия уточняются'}
                                </span>
                            </span>
                        </label>
                    ))}
                    {Object.values(form.errors).map((error) => (
                        <p key={error} className="text-destructive">
                            {error}
                        </p>
                    ))}
                    <Button disabled={form.processing}>
                        Отправить заявку выбранной компании
                    </Button>
                </form>
            ) : (
                <p>
                    Других компаний для этих параметров пока нет. Поддержка
                    поможет найти решение.
                </p>
            )}
            <Button
                variant="outline"
                disabled={help.processing || help.wasSuccessful}
                onClick={() => help.post(assistance.url(Number(orderId)))}
            >
                {help.wasSuccessful
                    ? 'Поддержка получила запрос'
                    : 'Попросить помощь сервиса'}
            </Button>
            {Object.values(help.errors).map((error) => (
                <p key={error} className="text-destructive">
                    {error}
                </p>
            ))}
        </main>
    );
}
