import { Form, Head } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import {
    AuthField,
    AuthFooter,
    AuthNotice,
    authButtonClassName,
    authControlClassName,
} from '@/components/auth/auth-form';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import {
    client as registerClient,
    vendor as registerVendor,
} from '@/routes/register';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Вход" />

            <div className="grid gap-6">
                {status && <AuthNotice tone="success">{status}</AuthNotice>}

                <PasskeyVerify
                    label="Войти с ключом доступа"
                    loadingLabel="Проверяем ключ..."
                    separator="или войдите по email"
                />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="grid gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <AuthField
                                    id="email"
                                    label="Email"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="name@example.com"
                                        className={authControlClassName}
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={
                                            errors.email
                                                ? 'email-error'
                                                : undefined
                                        }
                                    />
                                </AuthField>

                                <AuthField
                                    id="password"
                                    label="Пароль"
                                    hint={
                                        canResetPassword ? (
                                            <TextLink
                                                href={request()}
                                                className="font-medium text-blue-600 no-underline hover:text-blue-700 hover:underline dark:text-blue-400"
                                                tabIndex={5}
                                            >
                                                Не помню пароль
                                            </TextLink>
                                        ) : undefined
                                    }
                                    error={errors.password}
                                >
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Введите пароль"
                                        className={authControlClassName}
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={
                                            errors.password
                                                ? 'password-error'
                                                : undefined
                                        }
                                    />
                                </AuthField>

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-300 dark:hover:border-slate-700">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <span>
                                        Запомнить меня на этом устройстве
                                    </span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className={authButtonClassName}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <LogIn
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                {processing ? 'Входим...' : 'Войти'}
                            </Button>
                        </>
                    )}
                </Form>

                <AuthFooter>
                    <p>Впервые в ОкнаМаркет?</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <TextLink
                            href={registerClient()}
                            className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-800 no-underline transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-blue-800 dark:hover:bg-blue-950/35 dark:hover:text-blue-300"
                        >
                            Я клиент
                        </TextLink>
                        <TextLink
                            href={registerVendor()}
                            className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-800 no-underline transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-blue-800 dark:hover:bg-blue-950/35 dark:hover:text-blue-300"
                        >
                            Я компания
                        </TextLink>
                    </div>
                </AuthFooter>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Войдите в личный кабинет',
    description:
        'Используйте email и пароль, указанные при регистрации клиента или компании.',
};
