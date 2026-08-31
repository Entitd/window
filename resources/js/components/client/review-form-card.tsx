import { useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    MessageSquareText,
    ShieldCheck,
    Star,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { store as storeReview } from '@/actions/App/Http/Controllers/ReviewController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ReviewFormCardProps = {
    requestId: string;
    service: string;
    company: string | null;
    existingReview?: ClientReview | null;
};

type ClientReview = {
    id: string;
    stars: number;
    comment: string;
    tags: string[];
    isPublic: boolean;
    status: string;
    createdAt: string | null;
};

type ReviewFormData = {
    stars: number;
    comment: string;
    tags: string[];
    is_public: boolean;
};

const reviewHints = ['Качество работ', 'Сроки', 'Связь', 'Аккуратность'];

export function ReviewFormCard({
    requestId,
    service,
    company,
    existingReview = null,
}: ReviewFormCardProps) {
    const form = useForm<ReviewFormData>({
        stars: 0,
        comment: '',
        tags: [],
        is_public: true,
    });
    const canSubmit =
        form.data.stars > 0 &&
        form.data.comment.trim().length >= 10 &&
        !form.processing;
    const formErrors = form.errors as typeof form.errors & {
        request?: string;
    };
    const ratingLabel =
        form.data.stars > 0 ? `${form.data.stars} из 5` : 'Выберите оценку';
    const visibleReview =
        existingReview ??
        (form.recentlySuccessful
            ? {
                  id: 'created',
                  stars: form.data.stars,
                  comment: form.data.comment,
                  tags: form.data.tags,
                  isPublic: form.data.is_public,
                  status: 'pending',
                  createdAt: null,
              }
            : null);

    function toggleHint(hint: string) {
        form.setData(
            'tags',
            form.data.tags.includes(hint)
                ? form.data.tags.filter((item) => item !== hint)
                : [...form.data.tags, hint],
        );
    }

    function submitReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSubmit) {
            return;
        }

        form.submit(storeReview(Number(requestId)), {
            preserveScroll: true,
        });
    }

    if (visibleReview) {
        return (
            <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
                <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2
                                className="size-5 text-emerald-700 dark:text-emerald-300"
                                aria-hidden="true"
                            />
                            <CardTitle>Спасибо за отзыв</CardTitle>
                        </div>
                        <CardDescription>
                            Отзыв по заявке №{requestId} отправлен на проверку.
                            После модерации он появится в карточке компании.
                        </CardDescription>
                    </div>
                    <Badge variant="outline">{visibleReview.stars} из 5</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            {visibleReview.status === 'approved'
                                ? 'Опубликован'
                                : 'На модерации'}
                        </Badge>
                        {visibleReview.createdAt && (
                            <Badge variant="outline">
                                {visibleReview.createdAt}
                            </Badge>
                        )}
                    </div>
                    <p className="rounded-xl bg-background/70 p-4 leading-6 font-medium">
                        {visibleReview.comment}
                    </p>
                    {visibleReview.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {visibleReview.tags.map((hint) => (
                                <Badge key={hint} variant="secondary">
                                    {hint}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle>Оставить отзыв</CardTitle>
                    <CardDescription>
                        Оцените услугу «{service}»
                        {company ? ` от компании ${company}` : ''}. Это поможет
                        другим клиентам выбрать исполнителя.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-sm font-medium">
                    <ShieldCheck
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    На модерацию
                </div>
            </CardHeader>
            <CardContent>
                <form className="space-y-5" onSubmit={submitReview}>
                    {formErrors.request && (
                        <InputError message={formErrors.request} />
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label>Оценка работы</Label>
                            <span className="text-sm text-muted-foreground">
                                {ratingLabel}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((starValue) => (
                                <Button
                                    key={starValue}
                                    type="button"
                                    variant={
                                        starValue <= form.data.stars
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="icon"
                                    className={cn(
                                        'size-11 rounded-lg',
                                        starValue <= form.data.stars &&
                                            'bg-amber-500 text-white hover:bg-amber-600',
                                    )}
                                    aria-label={`Оценка ${starValue} из 5`}
                                    onClick={() =>
                                        form.setData('stars', starValue)
                                    }
                                >
                                    <Star
                                        className={cn(
                                            'size-5',
                                            starValue <= form.data.stars &&
                                                'fill-current',
                                        )}
                                        aria-hidden="true"
                                    />
                                </Button>
                            ))}
                        </div>
                        <InputError message={form.errors.stars} />
                    </div>

                    <div className="space-y-3">
                        <Label>Что особенно важно</Label>
                        <div className="flex flex-wrap gap-2">
                            {reviewHints.map((hint) => {
                                const isSelected =
                                    form.data.tags.includes(hint);

                                return (
                                    <Button
                                        key={hint}
                                        type="button"
                                        variant={
                                            isSelected ? 'default' : 'outline'
                                        }
                                        className="rounded-lg"
                                        onClick={() => toggleHint(hint)}
                                    >
                                        {hint}
                                    </Button>
                                );
                            })}
                        </div>
                        <InputError message={form.errors.tags} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`review-comment-${requestId}`}>
                            Комментарий
                        </Label>
                        <textarea
                            id={`review-comment-${requestId}`}
                            className="min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={form.data.comment}
                            onChange={(event) =>
                                form.setData('comment', event.target.value)
                            }
                            placeholder="Напишите, что понравилось в работе и что можно улучшить"
                        />
                        <InputError message={form.errors.comment} />
                        <p className="text-xs text-muted-foreground">
                            Минимум 10 символов. Контакты и адрес лучше не
                            указывать в публичном тексте.
                        </p>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                        <Checkbox
                            checked={form.data.is_public}
                            onCheckedChange={(value) =>
                                form.setData('is_public', Boolean(value))
                            }
                        />
                        <span className="grid gap-1">
                            <span className="font-medium">
                                Можно показывать отзыв в карточке компании
                            </span>
                            <span className="text-muted-foreground">
                                Имя клиента будет показано сокращенно, без
                                телефона и email.
                            </span>
                        </span>
                    </label>

                    <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquareText
                                className="mt-0.5 size-4"
                                aria-hidden="true"
                            />
                            <span>
                                Отзыв относится только к заявке №{requestId} и
                                выбранной услуге.
                            </span>
                        </div>
                        <Button type="submit" disabled={!canSubmit}>
                            {form.processing
                                ? 'Отправляем...'
                                : 'Отправить отзыв'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
