<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCatalogRequest;
use App\Models\VendorService;
use App\Services\CatalogBooking;
use App\Services\ServiceCatalog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(ServiceCatalog $catalog): Response
    {
        $services = $catalog->availableServices();

        return Inertia::render('catalog', [
            'categories' => $catalog->categories()->whereIn('id', $catalog->activeCategoryIds())->values(),
            'services' => $services,
            'offerings' => VendorService::with([
                'vendor:id,company_name,city,status',
                'vendor.districts:id,name',
                'rates' => fn ($q) => $q->whereHas('option', fn ($o) => $o->where('is_active', true))->with('option')->orderByDesc('is_default'),
            ])->where('is_active', true)->whereIn('service_id', $services->modelKeys())
                ->whereHas('vendor', fn ($q) => $q->where('status', 'approved'))
                ->whereHas('rates', fn ($q) => $q->where('is_default', true)->whereHas('option', fn ($o) => $o->where('is_active', true)))->get(),
        ]);
    }

    public function store(StoreCatalogRequest $request, CatalogBooking $booking): RedirectResponse
    {
        $serviceRequest = $booking->create($request->user(), $request->validated());

        return redirect()->route('client.requests.show', $serviceRequest->id);
    }
}
