<?php

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceOption;
use App\Models\VendorServiceRate;
use Inertia\Testing\AssertableInertia as Assert;

test('okna market page is the home page', function () {
    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('okna-market'));
});

test('home page exposes only services available for client search', function () {
    $category = ServiceCategory::factory()->create();
    $availableService = Service::factory()->create(['category_id' => $category->id, 'name' => 'Доступная услуга']);
    ServiceOption::factory()->create(['service_id' => $availableService->id]);

    $archivedService = Service::factory()->create(['category_id' => $category->id, 'is_active' => false]);
    ServiceOption::factory()->create(['service_id' => $archivedService->id]);

    $serviceWithoutOption = Service::factory()->create(['category_id' => $category->id]);
    ServiceOption::factory()->create(['service_id' => $serviceWithoutOption->id, 'is_active' => false]);

    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('services', [['id' => $availableService->id, 'name' => 'Доступная услуга']]));
});

test('company search filters offers by selected catalog service ID', function () {
    $matchingRate = VendorServiceRate::factory()->create();
    VendorServiceRate::factory()->create();

    $this->get(route('search-results', ['service_id' => $matchingRate->vendorService->service_id]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('companies', 1)
            ->where('companies.0.id', $matchingRate->vendorService->vendor_id));
});

test('calculate page is public', function () {
    $this->get(route('calculate'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calculate'));
});
