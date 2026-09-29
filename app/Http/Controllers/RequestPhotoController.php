<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequestPhotosRequest;
use App\Models\RequestPhoto;
use App\Models\ServiceRequest;
use App\Services\RequestPhotoStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RequestPhotoController extends Controller
{
    public function store(StoreRequestPhotosRequest $request, ServiceRequest $serviceRequest, RequestPhotoStorage $photos): RedirectResponse
    {
        $photos->store($serviceRequest, $request->user(), $request->validated('photos'));

        return back();
    }

    public function show(ServiceRequest $serviceRequest, RequestPhoto $photo): StreamedResponse
    {
        Gate::authorize('view', $serviceRequest);
        abort_unless(Storage::disk('local')->exists($photo->path), 404);

        return Storage::disk('local')->response($photo->path, null, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
