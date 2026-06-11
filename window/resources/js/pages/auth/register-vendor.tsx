import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';

export default function RegisterVendor() {
    return (
        <>
            <Head title="Регистрация компании" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="company_name">Название компании</Label>
                        <Input
                            id="company_name"
                            type="text"
                            required
                            autoFocus
                            placeholder="ООО ОкнаПрофи"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact_name">Контактное лицо</Label>
                        <Input
                            id="contact_name"
                            type="text"
                            required
                            placeholder="Имя менеджера или владельца"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Телефон</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                placeholder="+7 (___) ___-__-__"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="company@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="city">Город</Label>
                            <Input
                                id="city"
                                type="text"
                                required
                                placeholder="Волгоград"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="districts">Районы работы</Label>
                            <Input
                                id="districts"
                                type="text"
                                required
                                placeholder="Центральный, Дзержинский"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Описание компании</Label>
                        <textarea
                            id="description"
                            className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            placeholder="Коротко опишите специализацию, опыт и услуги компании"
                            required
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                required
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
                                placeholder="Повторите пароль"
                            />
                        </div>
                    </div>

                    <label className="flex items-start gap-3 rounded-lg border border-border/70 p-4">
                        <Checkbox id="terms" />
                        <span className="text-sm leading-6 text-muted-foreground">
                            Согласен с условиями сервиса и понимаю, что профиль
                            компании может проходить модерацию перед публикацией.
                        </span>
                    </label>

                    <Button className="mt-2 w-full" type="submit">
                        Зарегистрировать компанию
                    </Button>
                </div>

                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    Это фронтенд-заготовка формы вендора. Отправка, сохранение
                    профиля компании и модерационный backend еще не подключены.
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <TextLink href={login()}>Войти</TextLink>
                </div>
            </form>
        </>
    );
}

RegisterVendor.layout = {
    title: 'Регистрация компании',
    description: 'Подключите компанию к сервису и подготовьте профиль для модерации',
};
