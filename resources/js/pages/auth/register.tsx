import { Form, Head, Link } from '@inertiajs/react';
import { Building2, UserRoundPlus } from 'lucide-react';
import {
    AuthField,
    AuthFooter,
    AuthSection,
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
                className={authFormClassName}
            >
                {({ processing, errors }) => (
                    <>
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
                                <Building2
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                Я компания
                            </Link>
                        </div>

                        <input type="hidden" name="role" value="client" />

                        <AuthSection
                            title="Ваши данные"
                            description="Email нужен для входа."
                        >
                            <div className={authFieldsGridClassName}>
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
                            description="Придумайте пароль."
                        >
                            <div className={authFieldsGridClassName}>
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
    description: 'Сохраняйте заявки и следите за статусами в кабинете.',
};
