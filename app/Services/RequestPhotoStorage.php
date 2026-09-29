<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class RequestPhotoStorage
{
    /** @param array<int, UploadedFile> $photos */
    public function store(ServiceRequest $order, User $user, array $photos): void
    {
        $paths = [];
        try {
            DB::transaction(function () use ($order, $user, $photos, &$paths): void {
                $order = ServiceRequest::query()->lockForUpdate()->findOrFail($order->id);
                Gate::forUser($user)->authorize('uploadPhotos', $order);
                if ($order->photos()->count() + count($photos) > 5) {
                    throw ValidationException::withMessages(['photos' => 'К заявке можно прикрепить не более 5 фотографий.']);
                }
                foreach ($photos as $photo) {
                    $path = $photo->store('request-photos/'.$order->id, 'local');
                    if ($path === false) {
                        throw new RuntimeException('Не удалось сохранить фотографию.');
                    }
                    $paths[] = $path;
                    $order->photos()->create(['path' => $path]);
                }
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($paths);
            throw $exception;
        }
    }
}
