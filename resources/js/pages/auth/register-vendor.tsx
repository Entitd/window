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

export default function RegisterVendor() {
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        contact_name: '',
        phone: '',
        email: '',
        city: '',
        districts: '',
        description: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    return (
        <>
            <Head title="Регистрация компании" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    post('/register/vendor', {
                        onSuccess: () =>
                            reset('password', 'password_confirmation'),
                    });
                }}
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="company_name">Название компании</Label>
                        <Input
                            id="company_name"
                            name="company_name"
                            type="text"
                            required
                            autoFocus
                            placeholder="ООО ОкнаПрофи"
                            value={data.company_name}
                            onChange={(event) =>
                                setData('company_name', event.target.value)
                            }
                        />
                        <InputError message={errors.company_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact_name">Контактное лицо</Label>
                        <Input
                            id="contact_name"
                            name="contact_name"
                            type="text"
                            required
                            placeholder="Имя менеджера или владельца"
                            value={data.contact_name}
                            onChange={(event) =>
                                setData('contact_name', event.target.value)
                            }
                        />
                        <InputError message={errors.contact_name} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Телефон</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
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
                                placeholder="company@example.com"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="city">Город</Label>
                            <Input
                                id="city"
                                name="city"
                                type="text"
                                required
                                placeholder="Волгоград"
                                value={data.city}
                                onChange={(event) =>
                                    setData('city', event.target.value)
                                }
                            />
                            <InputError message={errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="districts">Районы работы</Label>
                            <Input
                                id="districts"
                                name="districts"
                                type="text"
                                required
                                placeholder="Центральный, Дзержинский"
                                value={data.districts}
                                onChange={(event) =>
                                    setData('districts', event.target.value)
                                }
                            />
                            <InputError message={errors.districts} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Описание компании</Label>
                        <textarea
                            id="description"
                            name="description"
                            className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            placeholder="Коротко опишите специализацию, опыт и услуги компании"
                            required
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Пароль</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
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
                    </div>

                    <label className="flex items-start gap-3 rounded-lg border border-border/70 p-4">
                        <Checkbox
                            id="terms"
                            checked={data.terms}
                            onCheckedChange={(checked) =>
                                setData('terms', checked === true)
                            }
                        />
                        <span className="text-sm leading-6 text-muted-foreground">
                            Согласен с условиями сервиса и понимаю, что профиль
                            компании может проходить модерацию перед публикацией.
                        </span>
                    </label>
                    <InputError message={errors.terms} />

                    <Button
                        className="mt-2 w-full"
                        type="submit"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Зарегистрировать компанию
                    </Button>
                </div>

                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    Форма уже создаёт аккаунт компании, сохраняет профиль
                    вендора и связывает районы работы через новые таблицы. Дальше
                    сюда можно докинуть модерацию и полноценное управление услугами.
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Уже есть аккаунт? <TextLink href={login()}>Войти</TextLink>
                </div>
            </form>
        </>
    );
}

RegisterVendor.layout = {
    title: 'Регистрация компании',
    description: 'Подключите компанию к сервису и подготовьте профиль для модерации',
};
