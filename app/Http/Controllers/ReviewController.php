<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;
use App\Models\ServiceRequest;
use Illuminate\Http\RedirectResponse;

class ReviewController extends Controller
{
    public function store(
        StoreReviewRequest $request,
        ServiceRequest $serviceRequest,
    ): RedirectResponse {
        $validated = $request->validated();

        $serviceRequest->review()->create([
            'user_id' => $request->user()->id,
            'vendor_id' => $serviceRequest->vendor_id,
            'comment' => $validated['comment'],
            'stars' => $validated['stars'],
            'tags' => $validated['tags'] ?? [],
            'is_public' => $validated['is_public'],
            'status' => Review::STATUS_PENDING,
        ]);

        return back()->with('status', 'review-created');
    }
}
