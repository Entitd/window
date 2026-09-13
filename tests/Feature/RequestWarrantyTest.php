<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorService;
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
    VendorService::factory()->create([
        'vendor_id' => $vendor->id,
        'service_id' => $serviceRequest->service_id,
        'warranty_months' => 24,
    ]);

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
