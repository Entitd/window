<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

test('client filters their requests by status', function () {
    $client = User::factory()->create(['role' => 'client']);
    $otherClient = User::factory()->create(['role' => 'client']);
    $completedRequest = ServiceRequest::factory()->create([
        'client_id' => $client->id,
        'status' => 'completed',
    ]);
    ServiceRequest::factory()->create([
        'client_id' => $client->id,
        'status' => 'new',
    ]);
    ServiceRequest::factory()->create([
        'client_id' => $otherClient->id,
        'status' => 'completed',
    ]);

    $this->actingAs($client)
        ->get(route('client.dashboard', ['status' => 'completed']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/dashboard')
            ->where('selectedStatus', 'completed')
            ->has('requests', 1)
            ->where('requests.0.id', (string) $completedRequest->id)
            ->where('requests.0.status', 'completed'));
});

test('vendor filters only their requests by status', function () {
    $vendor = Vendor::factory()->create();
    $completedRequest = ServiceRequest::factory()->create([
        'vendor_id' => $vendor->id,
        'status' => 'completed',
    ]);
    ServiceRequest::factory()->create([
        'vendor_id' => $vendor->id,
        'status' => 'new',
    ]);
    $otherVendor = Vendor::factory()->create();
    ServiceRequest::factory()->create([
        'vendor_id' => $otherVendor->id,
        'status' => 'completed',
    ]);

    $this->actingAs($vendor->user)
        ->get(route('vendor.requests', ['status' => 'completed']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('vendor/requests')
            ->where('selectedStatus', 'completed')
            ->has('requests', 1)
            ->where('requests.0.id', (string) $completedRequest->id)
            ->where('requests.0.status', 'completed'));
});

test('request dashboard rejects an unknown status filter', function () {
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)
        ->get(route('client.dashboard', ['status' => 'unknown']))
        ->assertRedirect()
        ->assertSessionHasErrors('status');
});
