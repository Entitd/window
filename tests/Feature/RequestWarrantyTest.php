<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use App\Services\WarrantyIssuer;
use Inertia\Testing\AssertableInertia as Assert;

test('completed request creates a warranty visible to its client', function () {
    $client = User::factory()->create(['role' => 'client']);
    $vendor = Vendor::factory()->create([
        'warranty_description' => 'Гарантия распространяется на монтажные работы.',
    ]);
    $serviceRequest = ServiceRequest::factory()->create([
        'client_id' => $client->id,
        'vendor_id' => $vendor->id,
        'status' => 'in_progress',
    ]);
    $offering = VendorService::factory()->create([
        'vendor_id' => $vendor->id,
        'service_id' => $serviceRequest->service_id,
        'warranty_months' => 24,
    ]);

    $serviceRequest->update(['warranty_terms' => app(WarrantyIssuer::class)->snapshot($offering)]);

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.complete', $serviceRequest))
        ->assertSessionHasNoErrors();

    $warranty = $serviceRequest->warranty()->firstOrFail();

    expect($serviceRequest->fresh()->status)->toBe('completed')
        ->and($warranty->vendor_id)->toBe($vendor->id)
        ->and($warranty->company_name)->toBe($vendor->company_name)
        ->and($warranty->starts_at->toDateString())->toBe(today()->toDateString())
        ->and($warranty->expires_at->toDateString())->toBe(today()->addMonthsNoOverflow(24)->toDateString())
        ->and($warranty->description)->toBe('Гарантия распространяется на монтажные работы.');

    $this->actingAs($client)
        ->get(route('client.requests.show', $serviceRequest))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/request-show')
            ->where('request.warranty.companyName', $vendor->company_name)
            ->where('request.warranty.description', 'Гарантия распространяется на монтажные работы.'));

    $this->actingAs($client)
        ->get(route('client.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/dashboard')
            ->where('requests.0.warranty.expiresAt', today()->addMonthsNoOverflow(24)->format('d.m.Y')));
});

test('vendor cannot complete a request without warranty details', function () {
    $vendor = Vendor::factory()->create();
    $serviceRequest = ServiceRequest::factory()->create([
        'vendor_id' => $vendor->id,
        'status' => 'in_progress',
    ]);
    VendorService::factory()->create([
        'vendor_id' => $vendor->id,
        'service_id' => $serviceRequest->service_id,
        'warranty_months' => 24,
    ]);

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.complete', $serviceRequest))
        ->assertSessionHasErrors('warranty');

    expect($serviceRequest->fresh()->status)->toBe('in_progress')
        ->and($serviceRequest->warranty()->exists())->toBeFalse();
});

test('booked warranty survives changes and deletion of the company offering', function () {
    $rate = VendorServiceRate::factory()->create();
    $offering = $rate->vendorService;
    $vendor = $offering->vendor;
    $vendor->update(['warranty_description' => 'Согласованные условия']);
    $offering->update(['warranty_months' => 24]);
    $client = User::factory()->create(['role' => 'client']);
    $this->actingAs($client)->post(route('catalog.store'), [
        'rate_id' => $rate->id, 'quantity' => 1, 'width_mm' => 1200, 'height_mm' => 1500,
        'city' => $vendor->city, 'parameters' => [],
    ])->assertSessionHasNoErrors();
    $request = ServiceRequest::firstOrFail();
    expect($request->warranty_terms['months'])->toBe(24)
        ->and($request->warranty_terms['description'])->toBe('Согласованные условия');
    $originalName = $vendor->company_name;
    $originalPhone = $vendor->phone;
    $vendor->update(['warranty_description' => 'Новые условия', 'company_name' => 'Другое название', 'phone' => '+79990000000']);
    $offering->update(['warranty_months' => 1]);
    $this->actingAs($vendor->user)->delete(route('vendor.services.destroy', $offering))->assertSessionHasNoErrors();
    $this->patch(route('vendor.requests.accept', $request))->assertSessionHasNoErrors();
    $this->patch(route('vendor.requests.start', $request))->assertSessionHasNoErrors();
    $this->patch(route('vendor.requests.complete', $request))->assertSessionHasNoErrors();
    $warranty = $request->warranty()->firstOrFail();
    expect($warranty->description)->toBe('Согласованные условия')
        ->and($warranty->expires_at->toDateString())->toBe(today()->addMonthsNoOverflow(24)->toDateString())
        ->and($warranty->company_name)->toBe($originalName)
        ->and($warranty->contact_phone)->toBe($originalPhone);
});

test('migration snapshots available terms of pre-existing orders', function () {
    $rate = VendorServiceRate::factory()->create();
    $vendor = $rate->vendorService->vendor;
    $vendor->update(['warranty_description' => 'Условия на момент обновления']);
    $request = ServiceRequest::factory()->create(['vendor_id' => $vendor->id, 'service_id' => $rate->vendorService->service_id]);
    $migration = require database_path('migrations/2026_09_26_233035_add_warranty_terms_to_requests_table.php');
    $migration->down();
    $migration->up();
    expect($request->fresh()->warranty_terms['description'])->toBe('Условия на момент обновления')
        ->and($request->fresh()->warranty_terms['months'])->toBe(12);
});

test('missing warranty description can be completed without replacing the booked duration', function () {
    $rate = VendorServiceRate::factory()->create();
    $vendor = $rate->vendorService->vendor;
    $client = User::factory()->create(['role' => 'client']);
    $this->actingAs($client)->post(route('catalog.store'), [
        'rate_id' => $rate->id, 'quantity' => 1, 'width_mm' => 1200, 'height_mm' => 1500,
        'city' => $vendor->city, 'parameters' => [],
    ])->assertSessionHasNoErrors();
    $request = ServiceRequest::firstOrFail();
    $request->update(['status' => 'in_progress']);
    $this->actingAs($vendor->user)->patch(route('vendor.requests.complete', $request))
        ->assertSessionHasErrors('warranty');
    $vendor->update(['warranty_description' => 'Дополненные условия']);
    $rate->vendorService->update(['warranty_months' => 1]);
    $this->patch(route('vendor.requests.complete', $request))->assertSessionHasNoErrors();
    expect($request->fresh()->warranty_terms['months'])->toBe(12)
        ->and($request->warranty()->firstOrFail()->expires_at->toDateString())->toBe(today()->addMonthsNoOverflow(12)->toDateString());
});
