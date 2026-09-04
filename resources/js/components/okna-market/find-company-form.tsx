import { router } from '@inertiajs/react';
import { useState } from 'react';
import { searchResults } from '@/routes';

type ServiceKey =
    | 'glass_replacement'
    | 'window_installation'
    | 'balcony_block'
    | 'measurement'
    | 'repair';

type WindowTypeKey = 'single' | 'double' | 'triple' | 'balcony';

const services: Array<{ key: ServiceKey; title: string }> = [
    { key: 'glass_replacement', title: 'Замена стеклопакета' },
    { key: 'window_installation', title: 'Установка окна' },
    { key: 'balcony_block', title: 'Балконный блок' },
    { key: 'measurement', title: 'Замер' },
    { key: 'repair', title: 'Ремонт/регулировка' },
];

const windowTypes: Array<{ key: WindowTypeKey; title: string }> = [
    { key: 'single', title: 'Одностворчатое' },
    { key: 'double', title: 'Двухстворчатое' },
    { key: 'triple', title: 'Трехстворчатое' },
    { key: 'balcony', title: 'Балконный блок' },
];

export function FindCompanyForm() {
    const [serviceKey, setServiceKey] =
        useState<ServiceKey>('glass_replacement');
    const [windowTypeKey, setWindowTypeKey] = useState<WindowTypeKey>('double');
    const [width, setWidth] = useState(130);
    const [height, setHeight] = useState(140);

    function submitSearchRequest() {
        router.get(searchResults.url(), {
            city: 'Волгоград',
            width: String(width),
            height: String(height),
            serviceKey,
            extraWorks: 'dismantling',
        });
    }

    return (
        <form
            action="#"
            className="request-card hero-request-card"
            method="get"
            onSubmit={(event) => {
                event.preventDefault();
                submitSearchRequest();
            }}
        >
            <div className="request-heading">
                <div>
                    <h2>Что нужно установить?</h2>
                </div>
                <span>Точная цена после замера.</span>
            </div>

            <div aria-label="Тип услуги" className="service-chips" role="list">
                {services.map((service) => {
                    const isActive = service.key === serviceKey;

                    return (
                        <button
                            aria-pressed={isActive}
                            className={`chip ${isActive ? 'active' : ''}`}
                            key={service.key}
                            onClick={() => setServiceKey(service.key)}
                            type="button"
                        >
                            {service.title}
                        </button>
                    );
                })}
            </div>

            <div className="form-grid form-grid-mvp">
                <label className="field-card">
                    <span className="field-icon">⌖</span>
                    <span className="field-label">Город</span>
                    <input name="city" readOnly value="Волгоград" />
                </label>

                <label className="field-card">
                    <span className="field-icon">▣</span>
                    <span className="field-label">Тип окна</span>
                    <select
                        name="window_type"
                        onChange={(event) =>
                            setWindowTypeKey(
                                event.target.value as WindowTypeKey,
                            )
                        }
                        value={windowTypeKey}
                    >
                        {windowTypes.map((windowType) => (
                            <option key={windowType.key} value={windowType.key}>
                                {windowType.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="field-card">
                    <span className="field-icon">↔</span>
                    <span className="field-label">Ширина, см</span>
                    <input
                        max={320}
                        min={40}
                        name="width"
                        onChange={(event) =>
                            setWidth(Number(event.target.value))
                        }
                        type="number"
                        value={width}
                    />
                </label>

                <label className="field-card">
                    <span className="field-icon">↕</span>
                    <span className="field-label">Высота, см</span>
                    <input
                        max={260}
                        min={40}
                        name="height"
                        onChange={(event) =>
                            setHeight(Number(event.target.value))
                        }
                        type="number"
                        value={height}
                    />
                </label>

                <button
                    className="btn btn-accent btn-find-companies"
                    type="submit"
                >
                    Найти компании
                </button>
            </div>
        </form>
    );
}
