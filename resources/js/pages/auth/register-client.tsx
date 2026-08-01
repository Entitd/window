import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';

export default function RegisterClient() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        policy: false,
    });

    return (
        <>
            <Head title="Регистрация клиента" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    post('/register/client', {
                        onSuccess: () =>
                            reset('password', 'password_confirmation'),
                    });
                }}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Как к вам обращаться"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            autoComplete="tel"
                            placeholder="+7 (___) ___-__-__"
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="email@example.com"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            autoComplete="new-password"
                            placeholder="Не менее 8 символов"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Повтор пароля
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            required
                            autoComplete="new-password"
                            placeholder="Повторите пароль"
                            value={data.password_confirmation}
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <label className="flex items-start gap-3 rounded-lg border border-border/70 p-4">
                        <Checkbox
                            id="policy"
                            checked={data.policy}
                            onCheckedChange={(checked) =>
                                setData('policy', checked === true)
                            }
                        />
                        <span className="text-sm leading-6 text-muted-foreground">
                            Согласен с политикой конфиденциальности и условиями
                            обработки персональных данных.
                        </span>
                    </label>
                    <InputError message={errors.policy} />

                    <Button
                        className="mt-2 w-full"
                        type="submit"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Зарегистрироваться как клиент
                    </Button>
                </div>

                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    Форма уже пишет клиента в базу, логинит его и переводит в
                    кабинет. Следующим этапом сюда можно будет добавлять
                    автоподтяжку заявок и реальную бизнес-логику.
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Уже есть аккаунт? <TextLink href={login()}>Войти</TextLink>
                </div>
            </form>
        </>
    );
}

RegisterClient.layout = {
    title: 'Регистрация клиента',
    description: 'Создайте аккаунт, чтобы сохранять заявки и отслеживать их статус',
};
