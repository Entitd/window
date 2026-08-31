import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import {
    AuthField,
    authButtonClassName,
    authControlClassName,
} from '@/components/auth/auth-form';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Подтверждение пароля" />

            <div className="grid gap-6">
                <PasskeyVerify
                    routes={{
                        options: confirmOptions(),
                        submit: confirmStore(),
                    }}
                    label="Подтвердить ключом доступа"
                    loadingLabel="Проверяем ключ..."
                    separator="или подтвердите паролем"
                />

                <Form {...store.form()} resetOnSuccess={['password']}>
                    {({ processing, errors }) => (
                        <div className="grid gap-6">
                            <AuthField
                                id="password"
                                label="Текущий пароль"
                                error={errors.password}
                            >
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    placeholder="Введите пароль"
                                    autoComplete="current-password"
                                    autoFocus
                                    required
                                    className={authControlClassName}
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : undefined
                                    }
                                />
                            </AuthField>

                            <Button
                                className={authButtonClassName}
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <ShieldCheck
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                {processing ? 'Проверяем...' : 'Подтвердить'}
                            </Button>
                        </div>
                    )}
                </Form>
            </div>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Подтвердите, что это вы',
    description:
        'Для защиты аккаунта нужно ещё раз подтвердить пароль перед продолжением.',
};
