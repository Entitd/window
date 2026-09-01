import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ExtraWorkKey, RequestFormState } from '@/lib/okna-market';
import {
    buildEstimate,
    buildSearchParams,
    defaultRequestForm,
    extraWorkOptions,
    formatCurrency,
    MARKETPLACE_PATHS,
    serviceOptions,
} from '@/lib/okna-market';

type Props = {
    action?: string;
    compact?: boolean;
    initialForm?: RequestFormState;
    preserveScroll?: boolean;
    submitLabel?: string;
};

export function RequestForm({
    action = MARKETPLACE_PATHS.searchResults,
    compact = false,
    initialForm = defaultRequestForm,
    preserveScroll = false,
    submitLabel = 'Рассчитать стоимость',
}: Props) {
    const [form, setForm] = useState<RequestFormState>(initialForm);
    const estimate = useMemo(() => buildEstimate(form), [form]);

    const updateField = <Key extends keyof RequestFormState>(
        key: Key,
        value: RequestFormState[Key],
    ) => {
        setForm((currentForm) => ({
            ...currentForm,
            [key]: value,
        }));
    };

    const toggleExtraWork = (extraKey: ExtraWorkKey) => {
        setForm((currentForm) => ({
            ...currentForm,
            extraWorks: currentForm.extraWorks.includes(extraKey)
                ? currentForm.extraWorks.filter((item) => item !== extraKey)
                : [...currentForm.extraWorks, extraKey],
        }));
    };

    return (
        <form
            className={`request-card ${compact ? 'compact-card' : ''}`}
            onSubmit={(event) => {
                event.preventDefault();
                router.get(action, buildSearchParams(form), {
                    preserveScroll,
                });
            }}
        >
            <div className="request-heading">
                <div>
                    <h2>Быстрый расчет и подбор компаний</h2>
                    <p>
                        Предварительно: от {formatCurrency(estimate[0])} до{' '}
                        {formatCurrency(estimate[1])}
                    </p>
                </div>
                <span>Точная цена подтверждается после замера</span>
            </div>

            <div className="service-chips">
                {serviceOptions.map((service) => (
                    <button
                        className={`chip ${
                            form.serviceKey === service.key ? 'active' : ''
                        }`}
                        key={service.key}
                        onClick={() => updateField('serviceKey', service.key)}
                        type="button"
                    >
                        {service.title}
                    </button>
                ))}
            </div>

            <div className="form-grid">
                <label className="field-card field-card-wide">
                    <span className="field-icon">⌖</span>
                    <span className="field-label">Город или район</span>
                    <input
                        onChange={(event) =>
                            updateField('city', event.target.value)
                        }
                        placeholder="Например, Волгоград, Центральный район"
                        value={form.city}
                    />
                </label>

                <label className="field-card">
                    <span className="field-icon">◷</span>
                    <span className="field-label">Дата установки</span>
                    <input
                        onChange={(event) =>
                            updateField('installationDate', event.target.value)
                        }
                        type="date"
                        value={form.installationDate}
                    />
                </label>

                <label className="field-card">
                    <span className="field-icon">↔</span>
                    <span className="field-label">Ширина, см</span>
                    <input
                        min="50"
                        onChange={(event) =>
                            updateField('width', event.target.value)
                        }
                        type="number"
                        value={form.width}
                    />
                </label>

                <label className="field-card">
                    <span className="field-icon">↕</span>
                    <span className="field-label">Высота, см</span>
                    <input
                        min="50"
                        onChange={(event) =>
                            updateField('height', event.target.value)
                        }
                        type="number"
                        value={form.height}
                    />
                </label>

                <label className="field-card field-card-wide">
                    <span className="field-icon">⚙</span>
                    <span className="field-label">Дополнительные работы</span>
                    <div className="checkbox-stack">
                        {extraWorkOptions.map((option) => (
                            <label className="checkbox-row" key={option.key}>
                                <input
                                    checked={form.extraWorks.includes(
                                        option.key,
                                    )}
                                    onChange={() => toggleExtraWork(option.key)}
                                    type="checkbox"
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </label>

                <label className="field-card">
                    <span className="field-icon">☺</span>
                    <span className="field-label">Имя</span>
                    <input
                        onChange={(event) =>
                            updateField('name', event.target.value)
                        }
                        placeholder="Как к вам обращаться"
                        value={form.name}
                    />
                </label>

                <label className="field-card">
                    <span className="field-icon">☎</span>
                    <span className="field-label">Телефон</span>
                    <input
                        onChange={(event) =>
                            updateField('phone', event.target.value)
                        }
                        placeholder="+7 (___) ___-__-__"
                        value={form.phone}
                    />
                </label>

                <button className="btn btn-accent" type="submit">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
