<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCatalogServiceRequest;
use App\Http\Requests\SaveServiceCategoryRequest;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\ServiceCatalog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminServiceCatalogController extends Controller
{
    public function __construct(private ServiceCatalog $catalog) {}

    public function index(): Response
    {
        return Inertia::render('admin/services', [
            'categories' => $this->catalog->categories(),
            'services' => Service::with(['options', 'parameters'])->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function storeCategory(SaveServiceCategoryRequest $request): RedirectResponse
    {
        ServiceCategory::create($request->validated());

        return back();
    }

    public function updateCategory(SaveServiceCategoryRequest $request, ServiceCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return back();
    }

    public function store(SaveCatalogServiceRequest $request): RedirectResponse
    {
        $this->catalog->saveService(null, $request->validated());

        return back();
    }

    public function update(SaveCatalogServiceRequest $request, Service $service): RedirectResponse
    {
        $this->catalog->saveService($service, $request->validated());

        return back();
    }
}
