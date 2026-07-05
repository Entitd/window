<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VendorServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $vendor = $this->vendorFor($request);

        return Inertia::render('vendor/services', [
            'services' => $vendor->services()
                ->latest()
                ->get()
                ->map(fn (VendorService $service) => $this->serializeService($service))
                ->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $vendor = $this->vendorFor($request);

        $validated = $request->validate($this->rules());

        $vendor->services()->create([
            ...$validated,
            'is_active' => true,
        ]);

        return back();
    }

    public function update(Request $request, VendorService $service): RedirectResponse
    {
        $this->authorizeServiceOwner($request, $service);

        $service->update($request->validate($this->rules()));

        return back();
    }

    public function toggle(Request $request, VendorService $service): RedirectResponse
    {
        $this->authorizeServiceOwner($request, $service);

        $service->update([
            'is_active' => ! $service->is_active,
        ]);

        return back();
    }

    public function destroy(Request $request, VendorService $service): RedirectResponse
    {
        $this->authorizeServiceOwner($request, $service);

        $service->delete();

        return back();
    }

    private function vendorFor(Request $request): Vendor
    {
        abort_unless($request->user()?->role === 'vendor', 403);

        return $request->user()->vendor()->firstOrFail();
    }

    private function authorizeServiceOwner(Request $request, VendorService $service): void
    {
        $vendor = $this->vendorFor($request);

        abort_unless($service->vendor_id === $vendor->id, 403);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'service_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'min_price' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'price_type' => ['required', 'string', Rule::in(['fixed', 'sqm'])],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeService(VendorService $service): array
    {
        return [
            'id' => $service->id,
            'name' => $service->service_name,
            'description' => $service->description ?? '',
            'minPrice' => (float) $service->min_price,
            'basePrice' => 'от '.number_format((float) $service->min_price, 0, ',', ' ').' ₽',
            'pricingType' => $service->price_type,
            'isActive' => $service->is_active,
        ];
    }
}
