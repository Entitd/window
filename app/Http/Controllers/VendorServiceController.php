<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveVendorServiceRequest;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Services\ServiceCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorServiceController extends Controller
{
    public function __construct(private ServiceCatalog $catalog) {}

    public function index(Request $request): Response
    {
        return Inertia::render('vendor/services', [
            'services' => $this->vendorFor($request)->services()->with('rates.option')->latest()->get(),
            'catalog' => $this->catalog->availableServices(),
            'categories' => $this->catalog->categories(),
        ]);
    }

    public function store(SaveVendorServiceRequest $request): RedirectResponse
    {
        $this->catalog->saveVendorService($this->vendorFor($request), null, $request->validated());

        return back();
    }

    public function update(SaveVendorServiceRequest $request, VendorService $service): RedirectResponse
    {
        $this->catalog->saveVendorService($this->vendorFor($request), $service, $request->validated());

        return back();
    }

    public function toggle(Request $request, VendorService $service): RedirectResponse
    {
        $this->authorizeServiceOwner($request, $service);
        if (! $service->is_active) {
            $available = $this->catalog->availableServices()->firstWhere('id', $service->service_id);
            if (! $available || ! $service->rates()->where('is_default', true)->whereIn('service_option_id', $available->options->modelKeys())->exists()) {
                return back()->withErrors(['service' => 'Выберите доступную услугу и действующий тариф по умолчанию.']);
            }
        }
        $service->update(['is_active' => ! $service->is_active]);

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
        abort_unless($service->vendor_id === $this->vendorFor($request)->id, 403);
    }
}
