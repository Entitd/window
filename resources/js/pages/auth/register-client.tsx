import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, UserRoundPlus } from 'lucide-react';
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
} from '@/components/auth/auth-form';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { agreement, login, privacy } from '@/routes';
import { vendor as registerVendor } from '@/routes/register';
import { store as registerClientStore } from '@/routes/register/client';

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
                className={authFormClassName}
                onSubmit={(event) => {
                    event.preventDefault();
                    post(registerClientStore.url(), {
                        onSuccess: () =>
                            reset('password', 'password_confirmation'),
                    });
                }}
            >
                <div className={authRoleSwitchClassName}>
                    <div className={authRoleSwitchLabelClassName}>
                        <span className={authRoleSwitchIconClassName}>
                            <UserRoundPlus
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        </span>
                        Для клиента
                    </div>
                    <Link
                        href={registerVendor()}
                        className={authRoleSwitchLinkClassName}
                    >
                        <Building2 className="size-3.5" aria-hidden="true" />Я
                        компания
                    </Link>
                </div>
{/* 
                <AuthSection
                > */}
                    <div className={authFieldsGridClassName}>
                        <AuthField id="name" label="Имя" error={errors.name}>
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
                                className={authControlClassName}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={
                                    errors.name ? 'name-error' : undefined
                                }
                            />
                        </AuthField>

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

                        <div className="sm:col-span-2">
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
                                    placeholder="name@example.com"
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
                                placeholder="От 8 символов"
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

                <div>
                    <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950/35">
                        <Checkbox
                            id="policy"
                            checked={data.policy}
                            onCheckedChange={(checked) =>
                                setData('policy', checked === true)
                            }
                            aria-invalid={Boolean(errors.policy)}
                            aria-describedby={
                                errors.policy ? 'policy-error' : undefined
                            }
                        />
                        <Label
                            htmlFor="policy"
                            className="text-xs leading-normal font-normal text-slate-600 dark:text-slate-400"
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
                            .
                        </Label>
                    </div>
                    {errors.policy && (
                        <p
                            id="policy-error"
                            className="mt-1 text-xs text-red-600 dark:text-red-400"
                        >
                            {errors.policy}
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
                        <UserRoundPlus className="size-4" aria-hidden="true" />
                    )}
                    {processing ? 'Создаём аккаунт...' : 'Создать аккаунт'}
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

RegisterClient.layout = {
    title: 'Создайте аккаунт клиента',
    description: 'Сохраняйте заявки и следите за статусами в кабинете.',
};
