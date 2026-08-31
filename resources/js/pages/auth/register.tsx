import { Form, Head, Link } from '@inertiajs/react';
import { Building2, UserRoundPlus } from 'lucide-react';
import {
    AuthField,
    AuthFooter,
    AuthSection,
    authButtonClassName,
    authControlClassName,
} from '@/components/auth/auth-form';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { vendor as registerVendor } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Регистрация" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="grid gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/75 p-2 dark:border-blue-900/60 dark:bg-blue-950/30">
                            <div className="flex items-center gap-3 px-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
                                <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white">
                                    <UserRoundPlus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                Для клиента
                            </div>
                            <Link
                                href={registerVendor()}
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:bg-slate-900 dark:text-slate-200 dark:hover:text-blue-300"
                            >
                                <Building2
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Я компания
                            </Link>
                        </div>

                        <input type="hidden" name="role" value="client" />

                        <AuthSection
                            title="Ваши данные"
                            description="Email будет использоваться для входа в личный кабинет."
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <AuthField
                                    id="name"
                                    label="Имя"
                                    error={errors.name}
                                >
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Как к вам обращаться"
                                        className={authControlClassName}
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={
                                            errors.name
                                                ? 'name-error'
                                                : undefined
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
                                        type="tel"
                                        required
                                        tabIndex={2}
                                        autoComplete="tel"
                                        inputMode="tel"
                                        name="phone"
                                        placeholder="+7 (___) ___-__-__"
                                        className={authControlClassName}
                                        aria-invalid={Boolean(errors.phone)}
                                        aria-describedby={
                                            errors.phone
                                                ? 'phone-error'
                                                : undefined
                                        }
                                    />
                                </AuthField>
                            </div>

                            <AuthField
                                id="email"
                                label="Email"
                                hint="Для входа"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    className={authControlClassName}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                />
                            </AuthField>
                        </AuthSection>

                        <AuthSection
                            title="Доступ к кабинету"
                            description="Придумайте пароль и повторите его без изменений."
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <AuthField
                                    id="password"
                                    label="Пароль"
                                    error={errors.password}
                                >
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Не менее 8 символов"
                                        passwordrules={passwordRules}
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
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Ещё раз"
                                        passwordrules={passwordRules}
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
                        </AuthSection>

                        <Button
                            type="submit"
                            className={authButtonClassName}
                            tabIndex={6}
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <UserRoundPlus
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            )}
                            {processing
                                ? 'Создаём аккаунт...'
                                : 'Создать аккаунт'}
                        </Button>

                        <AuthFooter>
                            Уже есть аккаунт?{' '}
                            <TextLink
                                href={login()}
                                className="font-semibold text-blue-600 dark:text-blue-400"
                                tabIndex={7}
                            >
                                Войти
                            </TextLink>
                        </AuthFooter>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Создайте аккаунт клиента',
    description:
        'Сохраняйте заявки и следите за работой выбранной компании в одном кабинете.',
};
