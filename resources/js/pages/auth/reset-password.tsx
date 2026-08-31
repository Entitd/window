import { Form, Head } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import {
    AuthField,
    AuthNotice,
    authButtonClassName,
    authControlClassName,
} from '@/components/auth/auth-form';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Новый пароль" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <AuthNotice>
                            Ссылка уже подтверждена. Осталось придумать новый
                            пароль для аккаунта.
                        </AuthNotice>

                        <AuthField
                            id="email"
                            label="Email аккаунта"
                            error={errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                className={`${authControlClassName} cursor-default bg-slate-100 text-slate-600 dark:bg-slate-950/80 dark:text-slate-300`}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                            />
                        </AuthField>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <AuthField
                                id="password"
                                label="Новый пароль"
                                error={errors.password}
                            >
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    autoFocus
                                    required
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
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    required
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

                        <Button
                            type="submit"
                            className={authButtonClassName}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <KeyRound
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            )}
                            {processing ? 'Сохраняем...' : 'Сохранить пароль'}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Придумайте новый пароль',
    description:
        'После сохранения используйте новый пароль для входа в личный кабинет.',
};
