import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import {
    AuthField,
    AuthFooter,
    AuthNotice,
    authButtonClassName,
    authControlClassName,
} from '@/components/auth/auth-form';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Восстановление пароля" />

            <div className="grid gap-6">
                {status && <AuthNotice tone="success">{status}</AuthNotice>}

                <Form {...email.form()} className="grid gap-6">
                    {({ processing, errors }) => (
                        <>
                            <AuthField
                                id="email"
                                label="Email аккаунта"
                                hint="Пришлём ссылку"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    placeholder="name@example.com"
                                    className={authControlClassName}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                />
                            </AuthField>

                            <Button
                                className={authButtonClassName}
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <Mail
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                {processing
                                    ? 'Отправляем...'
                                    : 'Получить ссылку'}
                            </Button>
                        </>
                    )}
                </Form>

                <AuthFooter>
                    Вспомнили пароль?{' '}
                    <TextLink
                        href={login()}
                        className="font-semibold text-blue-600 dark:text-blue-400"
                    >
                        Вернуться ко входу
                    </TextLink>
                </AuthFooter>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Восстановите доступ',
    description:
        'Укажите email аккаунта — мы отправим письмо со ссылкой для создания нового пароля.',
};
