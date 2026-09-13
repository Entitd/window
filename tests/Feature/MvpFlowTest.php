<?php

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('client vendor and admin can complete the main mvp request flow', function () {
    $this->seed();

    $service = Service::query()->firstOrFail();
    $service->update(['category_id' => ServiceCategory::factory()->create()->id]);
    $option = ServiceOption::factory()->create(['service_id' => $service->id, 'input_type' => 'selection', 'pricing_type' => 'fixed']);

    $this->post(route('register.vendor.store'), [
        'company_name' => 'Flow Test Windows',
        'contact_name' => 'Vendor Flow',
        'phone' => '+79991112233',
        'email' => 'vendor.flow@example.com',
        'city' => 'Flow City',
        'districts' => 'Flow District',
        'description' => 'Test vendor for the end-to-end MVP flow.',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => '1',
    ])->assertRedirect(route('vendor.dashboard'));

    $vendorUser = User::query()->where('email', 'vendor.flow@example.com')->firstOrFail();
    $vendor = $vendorUser->vendor()->firstOrFail();

    expect($vendor->status)->toBe('pending');

    $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.vendors.approve', $vendor), [
            'moderation_note' => 'Approved during MVP flow test.',
        ])
        ->assertRedirect();

    $vendor->refresh();
    expect($vendor->status)->toBe('approved');

    $this->actingAs($vendorUser)
        ->post(route('vendor.services.store'), [
            'service_id' => $service->id,
            'description' => 'Flow test service.',
            'warranty_months' => 24,
            'is_active' => true,
            'rates' => [['service_option_id' => $option->id, 'price' => 12345, 'is_default' => true]],
        ])
        ->assertRedirect();

    expect($vendor->services()->where('service_name', $service->name)->where('is_active', true)->exists())
        ->toBeTrue();

    $this->post(route('register.client.store'), [
        'name' => 'Client Flow',
        'phone' => '+79994445566',
        'email' => 'client.flow@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'policy' => '1',
    ])->assertRedirect(route('client.dashboard'));

    $client = User::query()->where('email', 'client.flow@example.com')->firstOrFail();

    $this->actingAs($client)
        ->post(route('catalog.store'), [
            'rate_id' => $vendor->services()->firstOrFail()->rates()->firstOrFail()->id,
            'quantity' => 1,
            'parameters' => [],
            'vendor_id' => $vendor->id,
            'service_id' => $service->id,
            'city' => 'Flow City',
            'district' => 'Flow District',
            'installation_date' => now()->addDays(5)->toDateString(),

            'additional_services' => ['Delivery'],
            'comment' => 'Created during the MVP flow test.',
        ])
        ->assertRedirect();

    $serviceRequest = ServiceRequest::query()
        ->where('client_id', $client->id)
        ->where('vendor_id', $vendor->id)
        ->latest()
        ->firstOrFail();

    expect($serviceRequest->status)->toBe('new')
        ->and((float) $serviceRequest->estimated_price)->toBe(12345.0)
        ->and($serviceRequest->statusHistories()->where('to_status', 'new')->exists())->toBeTrue();

    $this->actingAs($client)
        ->get(route('client.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/dashboard')
            ->has('requests', 1));

    $this->actingAs($vendorUser)
        ->get(route('vendor.requests'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('vendor/requests')
            ->has('requests', 1)
            ->where('requests.0.status', 'new'));

    $this->actingAs($vendorUser)
        ->patch(route('vendor.requests.accept', $serviceRequest))
        ->assertRedirect();

    expect($serviceRequest->refresh()->status)->toBe('confirmed');

    $this->actingAs($vendorUser)
        ->patch(route('vendor.requests.start', $serviceRequest))
        ->assertRedirect();

    expect($serviceRequest->refresh()->status)->toBe('in_progress');

    $this->actingAs($vendorUser)
        ->patch(route('vendor.requests.complete', $serviceRequest))
        ->assertRedirect();

    expect($serviceRequest->refresh()->status)->toBe('completed');

    $this->actingAs($client)
        ->get(route('client.requests.show', $serviceRequest->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/request-show')
            ->where('request.status', 'completed')
            ->has('request.history', 4));
});
