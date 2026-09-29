<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VendorServiceRate;
use Inertia\Testing\AssertableInertia as Assert;

test('search estimates and booking totals agree for the selected tariff', function (string $pricing, string $input, ?string $price, ?string $expected) {
    $rate = VendorServiceRate::factory()->create(['price' => $price]);
    $rate->option->update(['pricing_type' => $pricing, 'input_type' => $input]);
    $this->get(route('search-results', [
        'service_id' => $rate->vendorService->service_id,
        'width' => 120.5, 'height' => 150, 'quantity' => 2,
        'city' => 'Москва', 'installationDate' => '2030-01-01', 'comment' => 'Сохранить параметры',
    ]))->assertSuccessful()->assertInertia(fn (Assert $page) => $page
        ->has('companies', 1)
        ->where('companies.0.sortPrice', $expected === null ? null : (int) $expected)
        ->where('companies.0.catalogRateId', $rate->id)
        ->where('companies.0.estimateBasis', $rate->option->name)
        ->where('bookingDefaults.width_mm', 1205)
        ->where('bookingDefaults.height_mm', 1500)
        ->where('bookingDefaults.quantity', 2)
        ->where('bookingDefaults.city', 'Москва')
        ->where('bookingDefaults.installation_date', '2030-01-01')
        ->where('bookingDefaults.comment', 'Сохранить параметры'));

    $payload = ['rate_id' => $rate->id, 'quantity' => 2, 'city' => 'Москва', 'parameters' => []];
    if ($input === 'dimensions') {
        $payload += ['width_mm' => 1205, 'height_mm' => 1500];
    }
    $this->actingAs(User::factory()->create(['role' => 'client']))
        ->post(route('catalog.store'), $payload)->assertSessionHasNoErrors();
    expect(ServiceRequest::firstOrFail()->estimated_price)->toBe($expected);
})->with([
    'area' => ['sqm', 'dimensions', '1000.00', '3615.00'],
    'unit' => ['unit', 'selection', '1000.00', '2000.00'],
    'fixed' => ['fixed', 'selection', '1000.00', '1000.00'],
    'quote' => ['quote', 'selection', null, null],
    'zero' => ['unit', 'selection', '0.00', '0.00'],
]);

test('area estimate stays unknown when either dimension is missing', function (array $dimensions) {
    $rate = VendorServiceRate::factory()->create();
    $this->get(route('search-results', $dimensions))->assertInertia(fn (Assert $page) => $page
        ->where('companies.0.sortPrice', null)
        ->where('companies.0.priceLabel', 'Цена после уточнения'));
})->with([[[]], [['width' => 120]], [['height' => 150]]]);

test('search sorts comparable totals rather than unit rates and ignores non-default tariffs', function () {
    $area = VendorServiceRate::factory()->create(['price' => 1000]);
    $fixed = VendorServiceRate::factory()->create(['price' => 2000]);
    $fixed->option->update(['input_type' => 'selection', 'pricing_type' => 'fixed']);
    VendorServiceRate::factory()->create(['vendor_service_id' => $area->vendor_service_id, 'price' => 1, 'is_default' => false]);
    $quote = VendorServiceRate::factory()->create(['price' => null]);
    $quote->option->update(['input_type' => 'selection', 'pricing_type' => 'quote']);

    $this->get(route('search-results', ['width' => 200, 'height' => 150]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('companies.0.catalogRateId', $fixed->id)
            ->where('companies.0.sortPrice', 2000)
            ->where('companies.1.catalogRateId', $area->id)
            ->where('companies.1.sortPrice', 3000)
            ->where('companies.2.sortPrice', null));
});

test('search rejects invalid dimensions and quantities before calculation', function (array $query, string $field) {
    $this->from(route('home'))->get(route('search-results', $query))
        ->assertRedirect(route('home'))->assertSessionHasErrors($field);
})->with([
    [['width' => -1], 'width'],
    [['height' => 'not-a-number'], 'height'],
    [['width' => 10001], 'width'],
    [['quantity' => 1001], 'quantity'],
    [['width' => ['120']], 'width'],
]);
