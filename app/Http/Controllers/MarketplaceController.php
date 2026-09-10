<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Services\ServiceCatalog;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function __construct(private ServiceCatalog $catalog) {}

    public function home(): Response
    {
        return Inertia::render('okna-market', [
            'services' => $this->catalog->searchServices()
                ->map(fn (Service $service) => ['id' => $service->id, 'name' => $service->name])
                ->values(),
        ]);
    }
}
