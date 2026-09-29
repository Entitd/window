<?php

use App\Models\ServiceParameter;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use App\Services\WarrantyIssuer;
use Inertia\Testing\AssertableInertia as Assert;

function multiServiceRates(): array
{
    $first = VendorServiceRate::factory()->create(['price' => 1000]);
    $secondOffering = VendorService::factory()->create(['vendor_id' => $first->vendorService->vendor_id, 'warranty_months' => 36]);
    $second = VendorServiceRate::factory()->create(['vendor_service_id' => $secondOffering->id, 'price' => 500]);
    $second->option->update(['input_type' => 'selection', 'pricing_type' => 'unit']);
    $first->vendorService->update(['warranty_months' => 12]);
    $first->vendorService->vendor->update(['warranty_description' => 'Устраняем дефекты монтажа.']);

    return [$first, $second];
}

function multiServicePayload(array $rates): array
{
    return ['city' => 'Москва', 'address' => 'Лесная, 10', 'items' => [
        ['rate_id' => $rates[0]->id, 'quantity' => 2, 'width_mm' => 1200, 'height_mm' => 1500, 'parameters' => []],
        ['rate_id' => $rates[1]->id, 'quantity' => 3, 'parameters' => []],
    ]];
}

test('multiple services create one order with separate parameters total chat and warranty terms', function () {
    $rates = multiServiceRates();
    ServiceParameter::factory()->create(['service_id' => $rates[1]->vendorService->service_id, 'key' => 'color', 'type' => 'text', 'is_required' => true]);
    $payload = multiServicePayload($rates);
    $payload['items'][1]['parameters'] = ['color' => 'Белый'];
    $client = User::factory()->create(['role' => 'client']);
    $this->actingAs($client)->post(route('catalog.store'), $payload)->assertSessionHasNoErrors();
    $order = ServiceRequest::with('items.values', 'chat')->sole();
    expect($order->estimated_price)->toBe('5100.00')->and($order->items)->toHaveCount(2)
        ->and($order->items[0]->total_price)->toBe('3600.00')
        ->and($order->items[1]->total_price)->toBe('1500.00')
        ->and($order->items[1]->values[0]->text_value)->toBe('Белый')
        ->and($order->chat->vendor_id)->toBe($rates[0]->vendorService->vendor_id)
        ->and($order->warranty_terms['months'])->toBe(12)
        ->and($order->warranty_terms['services'])->toHaveCount(2);
    $this->get(route('client.requests.show', $order))->assertInertia(fn (Assert $page) => $page->has('request.items', 2));
    $snapshot = $order->warranty_terms;
    $rates[1]->vendorService->update(['warranty_months' => 1]);
    $warranty = app(WarrantyIssuer::class)->issue($order, $order->vendor);
    expect($order->fresh()->warranty_terms)->toBe($snapshot)->and($warranty->description)->toContain('36 мес.', '12 мес.');
});

test('search returns only companies covering every selected service and totals each tariff', function () {
    [$first, $second] = multiServiceRates();
    $partial = VendorService::factory()->create(['service_id' => $first->vendorService->service_id]);
    VendorServiceRate::factory()->create(['vendor_service_id' => $partial->id, 'service_option_id' => $first->service_option_id]);
    $this->get(route('search-results', ['city' => 'Москва', 'items' => [
        ['service_id' => $first->vendorService->service_id, 'option_id' => $first->service_option_id, 'quantity' => 2, 'width' => 120, 'height' => 150],
        ['service_id' => $second->vendorService->service_id, 'option_id' => $second->service_option_id, 'quantity' => 3],
    ]]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('companies', 1)->where('companies.0.id', $first->vendorService->vendor_id)
        ->where('companies.0.sortPrice', 5100)->has('companies.0.catalogItems', 2)
        ->where('companies.0.catalogItems.1.rate_id', $second->id));
});

test('mixed companies and invalid nested parameters cannot create a partial order', function () {
    $rates = multiServiceRates();
    $rates[1]->vendorService->update(['vendor_id' => Vendor::factory()->create()->id]);
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), multiServicePayload($rates))
        ->assertSessionHasErrors('items.1.rate_id');
    expect(ServiceRequest::count())->toBe(0);
    $rates[1]->vendorService->update(['vendor_id' => $rates[0]->vendorService->vendor_id]);
    $payload = multiServicePayload($rates);
    $payload['items'][1]['parameters'] = ['unknown' => 'invalid'];
    $this->post(route('catalog.store'), $payload)->assertSessionHasErrors('items.1.parameters');
    expect(ServiceRequest::count())->toBe(0);
});

test('one unknown line price keeps the overall estimate unknown', function () {
    $rates = multiServiceRates();
    $payload = multiServicePayload($rates);
    unset($payload['items'][0]['width_mm'], $payload['items'][0]['height_mm']);
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), $payload)->assertSessionHasNoErrors();
    $order = ServiceRequest::with('items')->sole();
    expect($order->estimated_price)->toBeNull()->and($order->items[1]->total_price)->toBe('1500.00');
});

test('all draft items survive guest login and are used in one booking', function () {
    $rates = multiServiceRates();
    $payload = multiServicePayload($rates);
    $this->post(route('catalog.draft'), $payload)->assertRedirect(route('login'))
        ->assertSessionHas('catalog_draft.items', $payload['items']);
    $destination = session('url.intended');
    $this->actingAs(User::factory()->create(['role' => 'client']))->get($destination)
        ->assertOk()->assertInertia(fn (Assert $page) => $page->has('draft.items', 2)->where('draft.items.1.quantity', 3));
    $this->post(route('catalog.store'), $payload)->assertSessionHasNoErrors()->assertSessionMissing('catalog_draft');
    expect(ServiceRequest::sole()->items()->count())->toBe(2);
});

test('recovery preserves every service and only offers companies with all required rates', function () {
    $rates = multiServiceRates();
    $client = User::factory()->create(['role' => 'client']);
    $this->actingAs($client)->post(route('catalog.store'), multiServicePayload($rates))->assertSessionHasNoErrors();
    $order = ServiceRequest::sole();
    $order->update(['status' => 'rejected']);
    $vendor = Vendor::factory()->create();
    $firstOffering = VendorService::factory()->create(['vendor_id' => $vendor->id, 'service_id' => $rates[0]->vendorService->service_id]);
    VendorServiceRate::factory()->create(['vendor_service_id' => $firstOffering->id, 'service_option_id' => $rates[0]->service_option_id, 'price' => 2000]);
    $this->get(route('request-recovery.show', $order))->assertInertia(fn (Assert $page) => $page->has('choices', 0));
    $secondOffering = VendorService::factory()->create(['vendor_id' => $vendor->id, 'service_id' => $rates[1]->vendorService->service_id]);
    VendorServiceRate::factory()->create(['vendor_service_id' => $secondOffering->id, 'service_option_id' => $rates[1]->service_option_id, 'price' => 1000]);
    $this->get(route('request-recovery.show', $order))->assertInertia(fn (Assert $page) => $page->has('choices', 1)->where('choices.0.price', 10200));
    $this->post(route('request-recovery.store', $order), ['offering_id' => $firstOffering->id])->assertSessionHasNoErrors();
    $replacement = ServiceRequest::findOrFail($order->fresh()->replacement_request_id);
    expect($replacement->items()->count())->toBe(2)->and($replacement->estimated_price)->toBe('10200.00')
        ->and($replacement->warranty_terms['services'])->toHaveCount(2);
});

test('duplicate items and totals above storage limit are rejected atomically', function () {
    $rates = multiServiceRates();
    $payload = multiServicePayload($rates);
    $payload['items'][1] = $payload['items'][0];
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), $payload)->assertSessionHasErrors('items.1.rate_id');
    expect(ServiceRequest::count())->toBe(0);
    foreach ($rates as $rate) {
        $rate->update(['price' => 60000000]);
        $rate->option->update(['input_type' => 'selection', 'pricing_type' => 'fixed']);
    }
    $payload = multiServicePayload($rates);
    unset($payload['items'][0]['width_mm'], $payload['items'][0]['height_mm']);
    $this->post(route('catalog.store'), $payload)->assertSessionHasErrors('items');
    expect(ServiceRequest::count())->toBe(0);
});

test('archiving any selected service removes the company from a combined search', function () {
    [$first, $second] = multiServiceRates();
    $second->vendorService->catalogService->update(['is_active' => false]);
    $this->get(route('search-results', ['items' => [
        ['service_id' => $first->vendorService->service_id, 'quantity' => 1],
        ['service_id' => $second->vendorService->service_id, 'quantity' => 1],
    ]]))->assertOk()->assertInertia(fn (Assert $page) => $page->has('companies', 0));
});
