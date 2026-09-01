import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
    ExtraWorkKey,
    RequestFormState,
    ServiceKey,
} from '@/lib/okna-market';
import {
    buildEstimate,
    defaultRequestForm,
    extraWorkOptions,
    formatCurrency,
    serviceOptions,
} from '@/lib/okna-market';

type WindowTypeKey = 'single' | 'double' | 'triple' | 'balcony';
type MaterialKey = 'plastic' | 'aluminum' | 'wood';

export type CalculationLine = {
    id: number;
    serviceKey: ServiceKey;
    windowTypeKey: WindowTypeKey;
    materialKey: MaterialKey;
    width: string;
    height: string;
    quantity: string;
    extraWorks: ExtraWorkKey[];
};

type Props = {
    initialRequest: RequestFormState;
    onChange: (lines: CalculationLine[], city: string) => void;
};

const windowTypes: {
    key: WindowTypeKey;
    title: string;
    factor: number;
}[] = [
    { key: 'single', title: 'Одностворчатое', factor: 0.86 },
    { key: 'double', title: 'Двухстворчатое', factor: 1 },
    { key: 'triple', title: 'Трехстворчатое', factor: 1.18 },
    { key: 'balcony', title: 'Балконный блок', factor: 1.45 },
];

const materials: {
    key: MaterialKey;
    title: string;
    factor: number;
}[] = [
    { key: 'plastic', title: 'ПВХ', factor: 1 },
    { key: 'aluminum', title: 'Алюминий', factor: 1.35 },
    { key: 'wood', title: 'Дерево', factor: 1.25 },
];

let nextLineId = 2;

export function CalculateServiceBuilder({ initialRequest, onChange }: Props) {
    const [city, setCity] = useState(initialRequest.city);
    const [lines, setLines] = useState<CalculationLine[]>([
        {
            id: 1,
            serviceKey: initialRequest.serviceKey,
            windowTypeKey: 'double',
            materialKey: 'plastic',
            width: initialRequest.width,
            height: initialRequest.height,
            quantity: '1',
            extraWorks: initialRequest.extraWorks,
        },
    ]);

    const totals = useMemo(() => {
        return lines.reduce<[number, number]>(
            (total, line) => {
                const estimate = calculateLineEstimate(line);

                return [total[0] + estimate[0], total[1] + estimate[1]];
            },
            [0, 0],
        );
    }, [lines]);

    const updateCity = (value: string) => {
        setCity(value);
        onChange(lines, value);
    };

    const updateLines = (nextLines: CalculationLine[]) => {
        setLines(nextLines);
        onChange(nextLines, city);
    };

    const addLine = () => {
        updateLines([
            ...lines,
            {
                id: nextLineId++,
                serviceKey: 'window_installation',
                windowTypeKey: 'double',
                materialKey: 'plastic',
                width: defaultRequestForm.width,
                height: defaultRequestForm.height,
                quantity: '1',
                extraWorks: [],
            },
        ]);
    };

    const removeLine = (lineId: number) => {
        updateLines(lines.filter((line) => line.id !== lineId));
    };

    const updateLine = <Key extends keyof CalculationLine>(
        lineId: number,
        key: Key,
        value: CalculationLine[Key],
    ) => {
        updateLines(
            lines.map((line) =>
                line.id === lineId ? { ...line, [key]: value } : line,
            ),
        );
    };

    const toggleExtraWork = (lineId: number, extraKey: ExtraWorkKey) => {
        updateLines(
            lines.map((line) => {
                if (line.id !== lineId) {
                    return line;
                }

                return {
                    ...line,
                    extraWorks: line.extraWorks.includes(extraKey)
                        ? line.extraWorks.filter((item) => item !== extraKey)
                        : [...line.extraWorks, extraKey],
                };
            }),
        );
    };

    return (
        <section className="calculator-card container">
            <div className="calculator-toolbar">
                <label className="field-card field-card-wide">
                    <span className="field-icon">⌖</span>
                    <span className="field-label">Город или район</span>
                    <input
                        onChange={(event) => updateCity(event.target.value)}
                        placeholder="Например, Волгоград, Центральный район"
                        value={city}
                    />
                </label>

                <div className="calculator-total">
                    <span>Итого</span>
                    <strong>
                        {formatCurrency(totals[0])} -{' '}
                        {formatCurrency(totals[1])}
                    </strong>
                </div>
            </div>

            <div className="calculator-lines">
                {lines.map((line, index) => {
                    const estimate = calculateLineEstimate(line);

                    return (
                        <article className="calculator-line" key={line.id}>
                            <div className="calculator-line-header">
                                <strong>Услуга {index + 1}</strong>
                                <div className="calculator-line-actions">
                                    <span>
                                        {formatCurrency(estimate[0])} -{' '}
                                        {formatCurrency(estimate[1])}
                                    </span>
                                    {lines.length > 1 && (
                                        <button
                                            aria-label="Удалить услугу"
                                            className="icon-button"
                                            onClick={() => removeLine(line.id)}
                                            type="button"
                                        >
                                            <Trash2 aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="calculator-grid">
                                <label className="field-card field-card-wide">
                                    <span className="field-icon">▣</span>
                                    <span className="field-label">Услуга</span>
                                    <select
                                        onChange={(event) =>
                                            updateLine(
                                                line.id,
                                                'serviceKey',
                                                event.target
                                                    .value as ServiceKey,
                                            )
                                        }
                                        value={line.serviceKey}
                                    >
                                        {serviceOptions.map((service) => (
                                            <option
                                                key={service.key}
                                                value={service.key}
                                            >
                                                {service.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">□</span>
                                    <span className="field-label">
                                        Тип окна
                                    </span>
                                    <select
                                        onChange={(event) =>
                                            updateLine(
                                                line.id,
                                                'windowTypeKey',
                                                event.target
                                                    .value as WindowTypeKey,
                                            )
                                        }
                                        value={line.windowTypeKey}
                                    >
                                        {windowTypes.map((windowType) => (
                                            <option
                                                key={windowType.key}
                                                value={windowType.key}
                                            >
                                                {windowType.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">◎</span>
                                    <span className="field-label">
                                        Материал
                                    </span>
                                    <select
                                        onChange={(event) =>
                                            updateLine(
                                                line.id,
                                                'materialKey',
                                                event.target
                                                    .value as MaterialKey,
                                            )
                                        }
                                        value={line.materialKey}
                                    >
                                        {materials.map((material) => (
                                            <option
                                                key={material.key}
                                                value={material.key}
                                            >
                                                {material.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">↔</span>
                                    <span className="field-label">
                                        Ширина, см
                                    </span>
                                    <input
                                        min="50"
                                        onChange={(event) =>
                                            updateLine(
                                                line.id,
                                                'width',
                                                event.target.value,
                                            )
                                        }
                                        type="number"
                                        value={line.width}
                                    />
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">↕</span>
                                    <span className="field-label">
                                        Высота, см
                                    </span>
                                    <input
                                        min="50"
                                        onChange={(event) =>
                                            updateLine(
                                                line.id,
                                                'height',
                                                event.target.value,
                                            )
                                        }
                                        type="number"
                                        value={line.height}
                                    />
                                </label>

                                <label className="field-card">
                                    <span className="field-icon">×</span>
                                    <span className="field-label">
                                        Количество
                                    </span>
                                    <input
                                        min="1"
                                        onChange={(event) =>
                                            updateLine(
                                                line.id,
                                                'quantity',
                                                event.target.value,
                                            )
                                        }
                                        type="number"
                                        value={line.quantity}
                                    />
                                </label>

                                <div className="field-card field-card-wide calculator-extra-field">
                                    <span className="field-icon">⚙</span>
                                    <span className="field-label">
                                        Дополнительно
                                    </span>
                                    <div className="checkbox-stack">
                                        {extraWorkOptions.map((option) => (
                                            <label
                                                className="checkbox-row"
                                                key={option.key}
                                            >
                                                <input
                                                    checked={line.extraWorks.includes(
                                                        option.key,
                                                    )}
                                                    onChange={() =>
                                                        toggleExtraWork(
                                                            line.id,
                                                            option.key,
                                                        )
                                                    }
                                                    type="checkbox"
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <button
                className="btn btn-secondary calculator-add"
                onClick={addLine}
                type="button"
            >
                <Plus aria-hidden="true" />
                Добавить услугу
            </button>
        </section>
    );
}

export function calculationLineToRequest(
    line: CalculationLine,
    city: string,
): RequestFormState {
    return {
        ...defaultRequestForm,
        city,
        serviceKey: line.serviceKey,
        width: line.width,
        height: line.height,
        extraWorks: line.extraWorks,
    };
}

function calculateLineEstimate(line: CalculationLine): [number, number] {
    const baseEstimate = buildEstimate(calculationLineToRequest(line, ''));
    const windowTypeFactor =
        windowTypes.find((windowType) => windowType.key === line.windowTypeKey)
            ?.factor ?? 1;
    const materialFactor =
        materials.find((material) => material.key === line.materialKey)
            ?.factor ?? 1;
    const quantity = Math.max(Number(line.quantity) || 1, 1);

    return [
        Math.round(
            baseEstimate[0] * windowTypeFactor * materialFactor * quantity,
        ),
        Math.round(
            baseEstimate[1] * windowTypeFactor * materialFactor * quantity,
        ),
    ];
}
