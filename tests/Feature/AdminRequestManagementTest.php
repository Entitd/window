<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function adminAmendableRequest(): array
{
    $client = User::factory()->create(['role' => 'client']);
    $vendor = Vendor::factory()->create();
    $serviceRequest = ServiceRequest::factory()->create([
        'client_id' => $client->id,
        'vendor_id' => $vendor->id,
        'status' => 'confirmed',
        'city' => 'Москва',
        'district' => 'Тверской',
        'installation_date' => '2026-10-01',
        'window_width' => 100,
        'window_height' => 120,
        'additional_services' => ['Демонтаж'],
        'comment' => 'Исходный комментарий',
    ]);

    return [$client, $vendor, $serviceRequest];
}

function adminCorrectionPayload(array $overrides = []): array
{
    return [...[
        'city' => 'Москва',
        'district' => 'Тверской',
        'installation_date' => '2026-10-01',
        'window_width' => 100,
        'window_height' => 120,
        'additional_services' => 'Демонтаж',
        'comment' => 'Исходный комментарий',
        'admin_note' => 'Проверено по обращению клиента.',
    ], ...$overrides];
}

test('administrator sees requests from every client and vendor', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    adminAmendableRequest();
    adminAmendableRequest();

    $this->actingAs($admin)
        ->get(route('admin.requests'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/requests')
            ->has('requests', 2));
});

test('admin correction waits for client and vendor confirmations', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    [$client, $vendor, $serviceRequest] = adminAmendableRequest();

    $this->actingAs($admin)
        ->patch(route('admin.requests.update', $serviceRequest), adminCorrectionPayload([
            'installation_date' => '2026-10-15',
            'comment' => 'Дата согласована через поддержку.',
        ]))
        ->assertSessionHasNoErrors();

    $amendment = $serviceRequest->amendments()->firstOrFail();

    expect($amendment->proposed_by_role)->toBe('admin')
        ->and($amendment->client_accepted)->toBeNull()
        ->and($amendment->vendor_accepted)->toBeNull()
        ->and($serviceRequest->fresh()->installation_date?->toDateString())->toBe('2026-10-01');

    $this->actingAs($client)
        ->patch(route('client.requests.amendments.accept', [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();

    expect($amendment->fresh()->status)->toBe('pending')
        ->and($amendment->fresh()->client_accepted)->toBeTrue()
        ->and($serviceRequest->fresh()->installation_date?->toDateString())->toBe('2026-10-01');

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.amendments.accept', [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();

    expect($amendment->fresh()->status)->toBe('accepted')
        ->and($serviceRequest->fresh()->installation_date?->toDateString())->toBe('2026-10-15')
        ->and($serviceRequest->fresh()->comment)->toBe('Дата согласована через поддержку.');
});

test('client or vendor rejection keeps an admin correction from being applied', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    [$client, $vendor, $serviceRequest] = adminAmendableRequest();

    $this->actingAs($admin)
        ->patch(route('admin.requests.update', $serviceRequest), adminCorrectionPayload([
            'city' => 'Химки',
        ]))
        ->assertSessionHasNoErrors();

    $amendment = $serviceRequest->amendments()->firstOrFail();

    $this->actingAs($client)
        ->patch(route('client.requests.amendments.reject', [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();

    expect($amendment->fresh()->status)->toBe('rejected')
        ->and($serviceRequest->fresh()->city)->toBe('Москва');
});

test('non administrators cannot see or correct every request', function () {
    [$client, , $serviceRequest] = adminAmendableRequest();

    $this->actingAs($client)
        ->get(route('admin.requests'))
        ->assertForbidden();

    $this->patch(route('admin.requests.update', $serviceRequest), adminCorrectionPayload())
        ->assertForbidden();
});
