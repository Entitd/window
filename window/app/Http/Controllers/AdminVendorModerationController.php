<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVendorModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $vendors = Vendor::query()
            ->with([
                'user:id,name,email,phone',
                'districts:id,name',
                'moderator:id,name',
                'services:id,vendor_id,service_name,min_price,is_active',
            ])
            ->latest()
            ->get()
            ->map(fn (Vendor $vendor) => [
                'id' => $vendor->id,
                'companyName' => $vendor->company_name,
                'description' => $vendor->description,
                'city' => $vendor->city,
                'phone' => $vendor->phone,
                'email' => $vendor->email,
                'status' => $vendor->status,
                'moderationNote' => $vendor->moderation_note,
                'submittedAt' => $vendor->created_at?->format('d.m.Y H:i'),
                'moderatedAt' => $vendor->moderated_at?->format('d.m.Y H:i'),
                'moderator' => $vendor->moderator?->name,
                'contactName' => $vendor->user?->name,
                'districts' => $vendor->districts->pluck('name')->values(),
                'servicesCount' => $vendor->services->count(),
                'activeServicesCount' => $vendor->services->where('is_active', true)->count(),
                'activeServices' => $vendor->services
                    ->where('is_active', true)
                    ->map(fn ($service) => [
                        'name' => $service->service_name,
                        'price' => (float) $service->min_price,
                    ])
                    ->values(),
            ]);

        return Inertia::render('admin/vendor-moderation', [
            'vendors' => $vendors,
            'stats' => [
                'pending' => $vendors->where('status', 'pending')->count(),
                'approved' => $vendors->where('status', 'approved')->count(),
                'rejected' => $vendors->where('status', 'rejected')->count(),
                'total' => $vendors->count(),
            ],
        ]);
    }

    public function approve(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'moderation_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $vendor->update([
            'status' => 'approved',
            'moderation_note' => $validated['moderation_note'] ?? 'Компания подтверждена администратором.',
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back();
    }

    public function reject(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'moderation_note' => ['required', 'string', 'max:2000'],
        ]);

        $vendor->update([
            'status' => 'rejected',
            'moderation_note' => $validated['moderation_note'],
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back();
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }
}
