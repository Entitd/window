<?php

use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function amendableRequest(): array
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

function amendmentPayload(array $overrides = []): array
{
    return [...[
        'city' => 'Москва',
        'district' => 'Тверской',
        'installation_date' => '2026-10-01',
        'window_width' => 100,
        'window_height' => 120,
        'additional_services' => 'Демонтаж',
        'comment' => 'Исходный комментарий',
    ], ...$overrides];
}

test('vendor applies client amendments only after confirmation', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();

    $this->actingAs($client)
        ->patch(route('client.requests.update', $serviceRequest), amendmentPayload([
            'installation_date' => '2026-10-08',
            'comment' => 'Просьба перенести дату работ.',
        ]))
        ->assertSessionHasNoErrors();

    $amendment = $serviceRequest->amendments()->firstOrFail();

    expect($amendment->status)->toBe('pending')
        ->and($amendment->proposed_by_role)->toBe('client')
        ->and($serviceRequest->fresh()->installation_date?->toDateString())->toBe('2026-10-01');

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.amendments.accept', [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();

    expect($amendment->fresh()->status)->toBe('accepted')
        ->and($serviceRequest->fresh()->installation_date?->toDateString())->toBe('2026-10-08')
        ->and($serviceRequest->fresh()->comment)->toBe('Просьба перенести дату работ.')
        ->and($serviceRequest->status)->toBe('confirmed');
});

test('client can reject vendor amendments without changing the request', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.update', $serviceRequest), amendmentPayload([
            'city' => 'Химки',
            'additional_services' => 'Демонтаж, Вывоз мусора',
        ]))
        ->assertSessionHasNoErrors();

    $amendment = $serviceRequest->amendments()->firstOrFail();

    $this->actingAs($client)
        ->patch(route('client.requests.amendments.reject', [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();

    expect($amendment->fresh()->status)->toBe('rejected')
        ->and($serviceRequest->fresh()->city)->toBe('Москва')
        ->and($serviceRequest->fresh()->additional_services)->toBe(['Демонтаж']);
});

test('catalog request keeps its tariff while parties can amend its date', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();
    $option = ServiceOption::factory()->create(['service_id' => $serviceRequest->service_id]);

    $serviceRequest->items()->create([
        'service_id' => $serviceRequest->service_id,
        'service_option_id' => $option->id,
        'service_name' => 'Монтаж окна',
        'option_name' => 'По площади',
        'pricing_type' => 'sqm',
        'quantity' => 1,
        'width_mm' => 1000,
        'height_mm' => 1200,
        'unit_price' => 1000,
        'total_price' => 1200,
    ]);

    $this->actingAs($client)
        ->patch(route('client.requests.update', $serviceRequest), amendmentPayload([
            'installation_date' => '2026-10-10',
        ]))
        ->assertSessionHasNoErrors();

    $amendment = $serviceRequest->amendments()->firstOrFail();

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.amendments.accept', [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();

    expect($serviceRequest->fresh()->installation_date?->toDateString())->toBe('2026-10-10')
        ->and($serviceRequest->items()->firstOrFail()->total_price)->toBe('1200.00');
});

test('only the other participant can decide a pending amendment', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();

    $this->actingAs($client)
        ->patch(route('client.requests.update', $serviceRequest), amendmentPayload([
            'window_width' => 150,
        ]))
        ->assertSessionHasNoErrors();

    $amendment = $serviceRequest->amendments()->firstOrFail();

    $this->actingAs($client)
        ->patch(route('client.requests.amendments.accept', [$serviceRequest, $amendment]))
        ->assertForbidden();

    $otherVendor = Vendor::factory()->create();

    $this->actingAs($otherVendor->user)
        ->patch(route('vendor.requests.amendments.accept', [$serviceRequest, $amendment]))
        ->assertForbidden();
});

test('a request cannot have more than one pending amendment', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();

    $this->actingAs($client)
        ->patch(route('client.requests.update', $serviceRequest), amendmentPayload([
            'window_width' => 150,
        ]))
        ->assertSessionHasNoErrors();

    $this->actingAs($vendor->user)
        ->patch(route('vendor.requests.update', $serviceRequest), amendmentPayload([
            'window_height' => 150,
        ]))
        ->assertSessionHasErrors('request');

    expect($serviceRequest->amendments()->count())->toBe(1);
});
