<?php

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use Inertia\Testing\AssertableInertia as Assert;

test('home catalog and results expose the same active service choices', function () {
    $service = Service::factory()->create(['description' => 'Устраним продувание окна']);
    $option = ServiceOption::factory()->create(['service_id' => $service->id, 'input_type' => 'selection', 'pricing_type' => 'fixed']);
    ServiceOption::factory()->create(['service_id' => $service->id, 'is_active' => false]);
    $hidden = Service::factory()->create(['category_id' => ServiceCategory::factory()->create(['is_active' => false])->id]);
    ServiceOption::factory()->create(['service_id' => $hidden->id]);

    foreach (['home', 'catalog.index', 'search-results'] as $route) {
        $this->get(route($route))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('services', 1)
            ->where('services.0.id', $service->id)
            ->where('services.0.description', 'Устраним продувание окна')
            ->has('services.0.options', 1)
            ->where('services.0.options.0.id', $option->id)
            ->where('services.0.options.0.input_type', 'selection'));
    }
});

test('selected variant determines matching companies estimate and booking tariff', function () {
    $default = VendorServiceRate::factory()->create(['price' => 9000]);
    $option = ServiceOption::factory()->create(['service_id' => $default->vendorService->service_id, 'input_type' => 'selection', 'pricing_type' => 'unit']);
    $selected = VendorServiceRate::factory()->create(['vendor_service_id' => $default->vendor_service_id, 'service_option_id' => $option->id, 'is_default' => false, 'price' => 500]);
    $otherOffering = VendorService::factory()->create(['service_id' => $default->vendorService->service_id]);
    VendorServiceRate::factory()->create(['vendor_service_id' => $otherOffering->id, 'service_option_id' => $default->service_option_id]);

    $this->get(route('search-results', ['service_id' => $option->service_id, 'option_id' => $option->id, 'quantity' => 3, 'city' => 'Москва']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('companies', 1)
        ->where('companies.0.catalogRateId', $selected->id)
        ->where('companies.0.sortPrice', 1500)
        ->where('companies.0.estimateBasis', $option->name));
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), [
        'rate_id' => $selected->id, 'quantity' => 3, 'city' => 'Москва', 'parameters' => [],
    ])->assertSessionHasNoErrors();
    expect(ServiceRequest::firstOrFail()->estimated_price)->toBe('1500.00');
});

test('search cannot use a foreign or archived service variant', function (bool $archived) {
    $rate = VendorServiceRate::factory()->create();
    $option = $archived ? $rate->option : ServiceOption::factory()->create();
    if ($archived) {
        $option->update(['is_active' => false]);
    }
    $this->from(route('home'))->get(route('search-results', [
        'service_id' => $rate->vendorService->service_id, 'option_id' => $option->id,
    ]))->assertRedirect(route('home'))->assertSessionHasErrors('option_id');
})->with([true, false]);

test('client can request measurement without inventing window dimensions or a price', function () {
    $rate = VendorServiceRate::factory()->create();
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), [
        'rate_id' => $rate->id, 'quantity' => 2, 'city' => 'Москва', 'width_mm' => '', 'height_mm' => '', 'parameters' => [],
    ])->assertSessionHasNoErrors();
    $order = ServiceRequest::with('items')->firstOrFail();
    expect($order->estimated_price)->toBeNull()
        ->and($order->items->first()->width_mm)->toBeNull()
        ->and($order->items->first()->height_mm)->toBeNull()
        ->and($order->items->first()->total_price)->toBeNull();
});
