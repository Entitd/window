import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import {
    show,
    store,
} from '@/actions/App/Http/Controllers/RequestPhotoController';
import { Button } from '@/components/ui/button';

export function RequestPhotos({
    orderId,
    photos = [],
    canUpload = false,
}: {
    orderId: string;
    photos?: { id: number }[];
    canUpload?: boolean;
}) {
    const input = useRef<HTMLInputElement>(null);
    const form = useForm<{ photos: File[] }>({ photos: [] });

    if (!canUpload && photos.length === 0) {
        return null;
    }

    return (
        <section className="grid gap-3 rounded-xl border p-4">
            <h3 className="font-semibold">Фотографии к заявке</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo) => (
                    <a
                        key={photo.id}
                        href={show.url({
                            serviceRequest: Number(orderId),
                            photo: photo.id,
                        })}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            className="h-32 w-full rounded-lg object-cover"
                            loading="lazy"
                            src={show.url({
                                serviceRequest: Number(orderId),
                                photo: photo.id,
                            })}
                            alt="Фотография окна или повреждения"
                        />
                    </a>
                ))}
            </div>
            {canUpload && photos.length < 5 && (
                <form
                    className="grid gap-2 text-sm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(store.url(Number(orderId)), {
                            forceFormData: true,
                            preserveScroll: true,
                            onSuccess: () => {
                                form.reset();

                                if (input.current) {
                                    input.current.value = '';
                                }
                            },
                        });
                    }}
                >
                    <label className="grid gap-2">
                        Добавьте фото окна или повреждения
                        <input
                            ref={input}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            required
                            onChange={(e) =>
                                form.setData(
                                    'photos',
                                    Array.from(e.target.files ?? []),
                                )
                            }
                        />
                    </label>
                    <p className="text-muted-foreground">
                        До 5 фотографий по 5 МБ: JPG, PNG, WebP. Видны вам,
                        выбранной компании и администратору.
                    </p>
                    {form.progress && (
                        <p>Загрузка: {form.progress.percentage}%</p>
                    )}
                    {Object.values(form.errors).map((error) => (
                        <p className="text-destructive" key={error}>
                            {error}
                        </p>
                    ))}
                    <Button
                        disabled={
                            form.processing || form.data.photos.length === 0
                        }
                    >
                        Загрузить фотографии
                    </Button>
                </form>
            )}
        </section>
    );
}
