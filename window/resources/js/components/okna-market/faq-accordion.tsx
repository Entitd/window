import { useState } from 'react';

export type FaqItem = {
    answer: string;
    question: string;
};

export type FaqSection = {
    items: FaqItem[];
    title: string;
};

export const homepageFaqItems: FaqItem[] = [
    {
        question: 'Это бесплатно для клиента?',
        answer: 'Да, сервис бесплатный для клиента. Вы сравниваете предложения и выбираете компанию без комиссий.',
    },
    {
        question: 'Цена на сайте окончательная?',
        answer: 'Нет. До замера можно показать только предварительный диапазон. Точная цена фиксируется после замера.',
    },
    {
        question: 'Можно оставить заявку без точных размеров?',
        answer: 'Да. Достаточно примерной ширины, высоты, типа окна и фотографии, если она есть.',
    },
    {
        question: 'Что происходит после выбора компании?',
        answer: 'Компания подтверждает желаемую дату, отклоняет заявку или предлагает другое время.',
    },
    {
        question: 'Когда появляется гарантия?',
        answer: 'После выполнения заказа появляется гарантия со связанной заявкой, компанией, сроками и условиями.',
    },
    {
        question: 'Можно заказать только ремонт или регулировку?',
        answer: 'Да, ремонт или регулировка входят в услуги MVP.',
    },
    {
        question: 'Как компаниям подключиться к сервису?',
        answer: 'Компания может оставить заявку на подключение, пройти проверку и получать релевантные обращения клиентов.',
    },
];

export const faqSections: FaqSection[] = [
    {
        title: 'Для клиентов',
        items: [
            {
                question: 'Сервис бесплатный для клиента?',
                answer: 'Да. Клиент создает заявку, сравнивает предложения и выбирает компанию без отдельной комиссии со стороны сервиса.',
            },
            {
                question: 'Можно оставить заявку без точных размеров?',
                answer: 'Да. Для предварительного подбора достаточно примерных размеров, типа услуги и желаемой даты. Точная смета формируется после замера.',
            },
            {
                question: 'Что происходит после выбора компании?',
                answer: 'Заявка уходит выбранной компании. Она подтверждает дату, предлагает другое время или отклоняет обращение, если не может выполнить заказ.',
            },
            {
                question: 'Будет ли история заявок доступна клиенту?',
                answer: 'Да. В кабинете клиента заявки сохраняются вместе со статусом, примерной ценой и выбранной компанией.',
            },
            {
                question: 'Почему цена на сайте примерная?',
                answer: 'На стоимость влияют реальные размеры, состояние проема, демонтаж, фурнитура, откосы и срочность. До замера можно показать только диапазон.',
            },
            {
                question: 'Можно ли сравнить предложения между компаниями?',
                answer: 'Да. В выдаче сравниваются цена, рейтинг, ближайшая дата, районы работы и гарантия.',
            },
            {
                question: 'Когда появляется гарантия?',
                answer: 'После завершения заказа в личном кабинете появляется запись о гарантии: компания, сроки, связанная заявка и базовые условия.',
            },
            {
                question: 'Гарантия одинаковая у всех компаний?',
                answer: 'Нет. Срок и условия зависят от компании и типа работ, поэтому они показываются отдельно в карточке предложения.',
            },
        ],
    },
    {
        title: 'Для вендоров',
        items: [
            {
                question: 'Как компания попадает в каталог?',
                answer: 'Компания оставляет заявку на подключение, заполняет профиль, указывает районы работы и проходит модерацию перед публикацией.',
            },
            {
                question: 'Можно ли управлять услугами и ценами?',
                answer: 'Да. Для вендоров предусмотрен кабинет, где можно редактировать услуги, цены, доступные районы и описание компании.',
            },
            {
                question: 'Как приходят новые заявки?',
                answer: 'Новые обращения попадают в кабинет компании, где можно принять заявку, отклонить ее или предложить клиенту другое время.',
            },
            {
                question: 'Можно ли показать гарантию и специализацию?',
                answer: 'Да. В карточке компании отображаются гарантия, описание, районы работы и специализация по типам услуг.',
            },
            {
                question: 'Что происходит после модерации?',
                answer: 'После подтверждения компания становится видимой в каталоге и может получать клиентские заявки по своим услугам и районам.',
            },
        ],
    },
];

type Props =
    | {
          defaultOpenKey?: string;
          items: FaqItem[];
          sections?: never;
      }
    | {
          defaultOpenKey?: string;
          items?: never;
          sections: FaqSection[];
      };

export function FaqAccordion({
    defaultOpenKey,
    items,
    sections,
}: Props) {
    const normalizedSections: FaqSection[] = sections ?? [
        { title: '', items: items ?? [] },
    ];
    const firstKey =
        defaultOpenKey ??
        normalizedSections
            .flatMap((section, sectionIndex) =>
                section.items.map(
                    (item, itemIndex) =>
                        `${sectionIndex}:${itemIndex}:${item.question}`,
                ),
            )
            .at(0) ??
        null;

    const [openKey, setOpenKey] = useState<string | null>(firstKey);

    return (
        <>
            {normalizedSections.map((section, sectionIndex) => (
                <article
                    className={section.title ? 'faq-group-card' : undefined}
                    key={section.title || `section-${sectionIndex}`}
                >
                    {section.title ? <h2>{section.title}</h2> : null}
                    <div className="faq-list">
                        {section.items.map((item, itemIndex) => {
                            const itemKey = `${sectionIndex}:${itemIndex}:${item.question}`;

                            return (
                                <details
                                    key={itemKey}
                                    open={openKey === itemKey}
                                >
                                    <summary
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setOpenKey((currentKey) =>
                                                currentKey === itemKey
                                                    ? null
                                                    : itemKey,
                                            );
                                        }}
                                    >
                                        {item.question}
                                    </summary>
                                    <p>{item.answer}</p>
                                </details>
                            );
                        })}
                    </div>
                </article>
            ))}
        </>
    );
}
