import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    AuthField,
    authButtonClassName,
    authControlClassName,
    authFormClassName,
} from '@/components/auth/auth-form';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Введите резервный код',
                description: 'Используйте сохранённый резервный код.',
                toggleText: 'Ввести код из приложения',
            };
        }

        return {
            title: 'Двухфакторная защита',
            description: 'Введите шестизначный код из приложения.',
            toggleText: 'Использовать резервный код',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Двухфакторная аутентификация" />

            <Form
                {...store.form()}
                className={authFormClassName}
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <AuthField
                                id="recovery_code"
                                label="Резервный код"
                                error={errors.recovery_code}
                            >
                                <Input
                                    id="recovery_code"
                                    name="recovery_code"
                                    type="text"
                                    placeholder="Введите резервный код"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    required
                                    className={authControlClassName}
                                    aria-invalid={Boolean(errors.recovery_code)}
                                    aria-describedby={
                                        errors.recovery_code
                                            ? 'recovery_code-error'
                                            : undefined
                                    }
                                />
                            </AuthField>
                        ) : (
                            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center dark:border-slate-800 dark:bg-slate-950/35">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Код подтверждения
                                </p>
                                <div className="flex w-full items-center justify-center overflow-x-auto py-1">
                                    <InputOTP
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        disabled={processing}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoComplete="one-time-code"
                                        autoFocus
                                        aria-label="Шестизначный код подтверждения"
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {Array.from(
                                                { length: OTP_MAX_LENGTH },
                                                (_, index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        className="size-10 rounded-lg border border-slate-200 bg-white text-sm shadow-none first:rounded-lg last:rounded-lg dark:border-slate-700 dark:bg-slate-900"
                                                    />
                                                ),
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <InputError message={errors.code} />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={authButtonClassName}
                            disabled={processing}
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <ShieldCheck
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            )}
                            {processing ? 'Проверяем...' : 'Продолжить'}
                        </Button>

                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Не получается войти?{' '}
                            <button
                                type="button"
                                className="cursor-pointer rounded font-semibold text-blue-600 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-700 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:outline-none dark:text-blue-400 dark:decoration-blue-800 dark:hover:text-blue-300"
                                onClick={() => toggleRecoveryMode(clearErrors)}
                            >
                                {authConfigContent.toggleText}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
