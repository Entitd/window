import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, UserRound } from 'lucide-react';
import {
    AuthField,
    AuthFooter,
    authButtonClassName,
    authControlClassName,
    authFieldsGridClassName,
    authFormClassName,
    authRoleSwitchClassName,
    authRoleSwitchIconClassName,
    authRoleSwitchLabelClassName,
    authRoleSwitchLinkClassName,
    authTextareaClassName,
} from '@/components/auth/auth-form';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { agreement, login, privacy } from '@/routes';
import { client as registerClient } from '@/routes/register';
import { store as registerVendorStore } from '@/routes/register/vendor';

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
                className={authFormClassName}
                onSubmit={(event) => {
                    event.preventDefault();
                    post(registerVendorStore.url(), {
                        onSuccess: () =>
                            reset('password', 'password_confirmation'),
                    });
                }}
            >
                <div className={authRoleSwitchClassName}>
                    <div className={authRoleSwitchLabelClassName}>
                        <span className={authRoleSwitchIconClassName}>
                            <Building2
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        </span>
                        Для компании
                    </div>
                    <Link
                        href={registerClient()}
                        className={authRoleSwitchLinkClassName}
                    >
                        <UserRound className="size-3.5" aria-hidden="true" />Я
                        клиент
                    </Link>
                </div>

                {/* <AuthSection
                    title="О компании"
                    description="Название и короткое описание."
                > */}
                    <div className={authFieldsGridClassName}>
                        <AuthField
                            id="company_name"
                            label="Название компании"
                            error={errors.company_name}
                        >
                            <Input
                                id="company_name"
                                name="company_name"
                                type="text"
                                required
                                autoFocus
                                autoComplete="organization"
                                placeholder="Например, ОкнаПрофи"
                                value={data.company_name}
                                onChange={(event) =>
                                    setData('company_name', event.target.value)
                                }
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.company_name)}
                                aria-describedby={
                                    errors.company_name
                                        ? 'company_name-error'
                                        : undefined
                                }
                            />
                        </AuthField>

                        <AuthField
                            id="contact_name"
                            label="Контактное лицо"
                            error={errors.contact_name}
                        >
                            <Input
                                id="contact_name"
                                name="contact_name"
                                type="text"
                                required
                                autoComplete="name"
                                placeholder="Имя менеджера"
                                value={data.contact_name}
                                onChange={(event) =>
                                    setData('contact_name', event.target.value)
                                }
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.contact_name)}
                                aria-describedby={
                                    errors.contact_name
                                        ? 'contact_name-error'
                                        : undefined
                                }
                            />
                        </AuthField>
                    </div>

                    <AuthField
                        id="description"
                        label="Коротко о компании"
                        hint="До 2000 символов"
                        error={errors.description}
                    >
                        <textarea
                            id="description"
                            name="description"
                            className={authTextareaClassName}
                            placeholder="Специализация, опыт и основные услуги"
                            required
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            aria-invalid={Boolean(errors.description)}
                            aria-describedby={
                                errors.description
                                    ? 'description-error'
                                    : undefined
                            }
                        />
                    </AuthField>
                {/* </AuthSection> */}

                {/* <AuthSection
                    title="Контакты и география"
                    description="Где принимаете заявки."
                > */}
                    <div className={authFieldsGridClassName}>
                        <AuthField
                            id="phone"
                            label="Телефон"
                            error={errors.phone}
                        >
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                autoComplete="tel"
                                inputMode="tel"
                                placeholder="+7 (___) ___-__-__"
                                value={data.phone}
                                onChange={(event) =>
                                    setData('phone', event.target.value)
                                }
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={
                                    errors.phone ? 'phone-error' : undefined
                                }
                            />
                        </AuthField>

                        <AuthField
                            id="email"
                            label="Email"
                            hint="Для входа"
                            error={errors.email}
                        >
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="company@example.com"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                            />
                        </AuthField>
                    </div>

                    <div className={authFieldsGridClassName}>
                        <AuthField id="city" label="Город" error={errors.city}>
                            <Input
                                id="city"
                                name="city"
                                type="text"
                                required
                                autoComplete="address-level2"
                                placeholder="Волгоград"
                                value={data.city}
                                onChange={(event) =>
                                    setData('city', event.target.value)
                                }
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.city)}
                                aria-describedby={
                                    errors.city ? 'city-error' : undefined
                                }
                            />
                        </AuthField>

                        <AuthField
                            id="districts"
                            label="Районы работы"
                            hint="Через запятую"
                            error={errors.districts}
                        >
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
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.districts)}
                                aria-describedby={
                                    errors.districts
                                        ? 'districts-error'
                                        : undefined
                                }
                            />
                        </AuthField>
                    </div>
                {/* </AuthSection> */}

                {/* <AuthSection
                    title="Доступ к кабинету"
                    description="Пароль для входа."
                > */}
                    <div className={authFieldsGridClassName}>
                        <AuthField
                            id="password"
                            label="Пароль"
                            error={errors.password}
                        >
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
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />
                        </AuthField>

                        <AuthField
                            id="password_confirmation"
                            label="Повторите пароль"
                            error={errors.password_confirmation}
                        >
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="Ещё раз"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                className={authControlClassName}
                                aria-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                                aria-describedby={
                                    errors.password_confirmation
                                        ? 'password_confirmation-error'
                                        : undefined
                                }
                            />
                        </AuthField>
                    </div>
                {/* </AuthSection> */}

                <div className="grid gap-2">
                    <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950/35">
                        <Checkbox
                            id="terms"
                            checked={data.terms}
                            onCheckedChange={(checked) =>
                                setData('terms', checked === true)
                            }
                            aria-invalid={Boolean(errors.terms)}
                            aria-describedby={
                                errors.terms ? 'terms-error' : undefined
                            }
                        />
                        <Label
                            htmlFor="terms"
                            className="text-xs leading-5 font-normal text-slate-600 dark:text-slate-400"
                        >
                            Я принимаю{' '}
                            <TextLink
                                href={agreement()}
                                className="font-medium text-slate-900 dark:text-slate-100"
                            >
                                условия сервиса
                            </TextLink>{' '}
                            и{' '}
                            <TextLink
                                href={privacy()}
                                className="font-medium text-slate-900 dark:text-slate-100"
                            >
                                политику конфиденциальности
                            </TextLink>
                            . Профиль проходит модерацию перед публикацией.
                        </Label>
                    </div>
                    {errors.terms && (
                        <p
                            id="terms-error"
                            className="text-xs text-red-600 dark:text-red-400"
                        >
                            {errors.terms}
                        </p>
                    )}
                </div>

                <Button
                    className={authButtonClassName}
                    type="submit"
                    disabled={processing}
                >
                    {processing ? (
                        <Spinner />
                    ) : (
                        <Building2 className="size-4" aria-hidden="true" />
                    )}
                    {processing
                        ? 'Создаём профиль...'
                        : 'Зарегистрировать компанию'}
                </Button>

                <AuthFooter>
                    Уже есть аккаунт?{' '}
                    <TextLink
                        href={login()}
                        className="font-semibold text-blue-600 dark:text-blue-400"
                    >
                        Войти
                    </TextLink>
                </AuthFooter>
            </form>
        </>
    );
}

RegisterVendor.layout = {
    title: 'Подключите свою компанию',
    description: 'Заполните профиль, контакты и районы работы.',
};
