import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';

export default function RegisterClient() {
    return (
        <>
            <Head title="Регистрация клиента" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Как к вам обращаться"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                            id="phone"
                            type="tel"
                            required
                            autoComplete="tel"
                            placeholder="+7 (___) ___-__-__"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            placeholder="Не менее 8 символов"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Повтор пароля
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            placeholder="Повторите пароль"
                        />
                    </div>

                    <label className="flex items-start gap-3 rounded-lg border border-border/70 p-4">
                        <Checkbox id="policy" />
                        <span className="text-sm leading-6 text-muted-foreground">
                            Согласен с политикой конфиденциальности и условиями
                            обработки персональных данных.
                        </span>
                    </label>

                    <Button className="mt-2 w-full" type="submit">
                        Зарегистрироваться как клиент
                    </Button>
                </div>

                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    Форма готова по фронту. Подключение сохранения клиента и
                    backend-валидации будет следующим этапом.
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <TextLink href={login()}>Войти</TextLink>
                </div>
            </form>
        </>
    );
}

RegisterClient.layout = {
    title: 'Регистрация клиента',
    description: 'Создайте аккаунт, чтобы сохранять заявки и отслеживать их статус',
};
