<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCatalogDraftRequest;
use App\Models\VendorServiceRate;
use Illuminate\Http\RedirectResponse;

class CatalogDraftController extends Controller
{
    public function __invoke(StoreCatalogDraftRequest $request): RedirectResponse
    {
        $rate = VendorServiceRate::with('vendorService')->findOrFail($request->validated('items.0.rate_id', $request->validated('rate_id')));
        $request->session()->put('catalog_draft', $request->validated());
        $destination = [
            'service_id' => $rate->vendorService->service_id,
            'rate_id' => $rate->id,
        ];
        if ($request->has('items')) {
            $destination['items'] = array_map(fn (array $item) => ['rate_id' => $item['rate_id']], $request->validated('items'));
        }
        $request->session()->put('url.intended', route('catalog.index', $destination));

        return redirect()->route('login');
    }
}
