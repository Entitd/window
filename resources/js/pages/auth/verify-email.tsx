import { Form, Head } from '@inertiajs/react';
import { LogOut, MailCheck } from 'lucide-react';
import {
    AuthFooter,
    AuthNotice,
    authButtonClassName,
    authFormClassName,
} from '@/components/auth/auth-form';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Подтверждение email" />

            <div className={authFormClassName}>
                {status === 'verification-link-sent' && (
                    <AuthNotice tone="success">
                        Новая ссылка отправлена на email, указанный при
                        регистрации.
                    </AuthNotice>
                )}

                <div className="grid place-items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-5 py-6 text-center dark:border-slate-800 dark:bg-slate-950/35">
                    <span className="grid size-12 place-items-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <MailCheck className="size-5" aria-hidden="true" />
                    </span>
                    <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
                        Откройте письмо от ОкнаМаркет и нажмите кнопку
                        подтверждения. Если письма нет, проверьте папку «Спам»
                        или запросите новое.
                    </p>
                </div>

                <Form {...send.form()}>
                    {({ processing }) => (
                        <Button
                            disabled={processing}
                            className={authButtonClassName}
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <MailCheck
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            )}
                            {processing
                                ? 'Отправляем...'
                                : 'Отправить письмо ещё раз'}
                        </Button>
                    )}
                </Form>

                <AuthFooter>
                    <TextLink
                        href={logout()}
                        as="button"
                        type="button"
                        className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300"
                    >
                        <LogOut className="size-4" aria-hidden="true" />
                        Выйти из аккаунта
                    </TextLink>
                </AuthFooter>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Подтвердите email',
    description: 'Перейдите по ссылке из письма или запросите новое.',
};
