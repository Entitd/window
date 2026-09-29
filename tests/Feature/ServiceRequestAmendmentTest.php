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

test('vendor must resolve pending amendments before starting work', function (string $decision) {
    [$client, $vendor, $serviceRequest] = amendableRequest();
    $this->actingAs($client)->patch(route('client.requests.update', $serviceRequest), amendmentPayload([
        'installation_date' => '2030-01-01',
    ]))->assertSessionHasNoErrors();
    $amendment = $serviceRequest->amendments()->firstOrFail();
    $historyCount = $serviceRequest->statusHistories()->count();

    $this->actingAs($vendor->user)->patch(route('vendor.requests.start', $serviceRequest))
        ->assertSessionHasErrors('request');
    expect($serviceRequest->fresh()->status)->toBe('confirmed')
        ->and($serviceRequest->statusHistories()->count())->toBe($historyCount)
        ->and($amendment->fresh()->status)->toBe('pending');

    $this->patch(route('vendor.requests.amendments.'.$decision, [$serviceRequest, $amendment]))
        ->assertSessionHasNoErrors();
    $this->patch(route('vendor.requests.start', $serviceRequest))->assertSessionHasNoErrors();
    expect($serviceRequest->fresh()->status)->toBe('in_progress');
})->with(['accept', 'reject']);

test('completion cannot bypass an unresolved amendment', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();
    $this->actingAs($client)->patch(route('client.requests.update', $serviceRequest), amendmentPayload([
        'installation_date' => '2030-01-01',
    ]))->assertSessionHasNoErrors();
    $serviceRequest->update(['status' => 'in_progress']);
    $this->actingAs($vendor->user)->patch(route('vendor.requests.complete', $serviceRequest))
        ->assertSessionHasErrors('request');
    expect($serviceRequest->fresh()->status)->toBe('in_progress')->and($serviceRequest->warranty()->exists())->toBeFalse();
});

test('visit details are shared only with participants and applied after agreement', function () {
    [$client, $vendor, $serviceRequest] = amendableRequest();
    $details = ['address' => 'ул. Лесная, д. 10, кв. 5', 'contact_name' => 'Анна', 'contact_phone' => '+79991234567', 'arrival_from' => '10:00', 'arrival_until' => '12:00'];
    $this->actingAs($client)->patch(route('client.requests.update', $serviceRequest), amendmentPayload($details))->assertSessionHasNoErrors();
    expect($serviceRequest->fresh()->address)->toBeNull();
    $amendment = $serviceRequest->amendments()->firstOrFail();
    $this->actingAs($vendor->user)->patch(route('vendor.requests.amendments.accept', [$serviceRequest, $amendment]))->assertSessionHasNoErrors();
    expect($serviceRequest->fresh()->only(array_keys($details)))->toBe($details);
    $this->get(route('vendor.requests'))->assertInertia(fn ($page) => $page->where('requests.0.address', $details['address'])->where('requests.0.arrival_until', '12:00'));
    $this->actingAs($client)->get(route('client.requests.show', $serviceRequest))->assertInertia(fn ($page) => $page->where('request.contact_phone', $details['contact_phone']));
    $this->actingAs(User::factory()->create(['role' => 'client']))->get(route('client.requests.show', $serviceRequest))->assertNotFound();
});

test('visit time interval must be complete and chronological', function (array $details, string $error) {
    [$client, , $serviceRequest] = amendableRequest();
    $this->actingAs($client)->patch(route('client.requests.update', $serviceRequest), amendmentPayload($details))->assertSessionHasErrors($error);
    expect($serviceRequest->amendments()->count())->toBe(0);
})->with([
    [['arrival_from' => '12:00', 'arrival_until' => '10:00'], 'arrival_until'],
    [['arrival_from' => '10:00'], 'arrival_until'],
    [['arrival_from' => '10:00', 'arrival_until' => '12:00', 'installation_date' => null], 'installation_date'],
]);

test('final terms require client agreement and remain in history without replacing the estimate', function () {
    [$client, $vendor, $order] = amendableRequest();
    $estimate = $order->estimated_price;
    $terms = ['final_price' => '12500.50', 'work_scope' => 'Замена стеклопакета, монтаж и вывоз мусора'];
    $this->actingAs($vendor->user)->patch(route('vendor.requests.update', $order), amendmentPayload($terms))->assertSessionHasNoErrors();
    $amendment = $order->amendments()->firstOrFail();
    expect($order->fresh()->final_price)->toBeNull();
    $this->actingAs($client)->get(route('client.requests.show', $order))->assertInertia(fn ($page) => $page
        ->where('request.pendingAmendment.changes.0.label', 'Итоговая стоимость, ₽')
        ->where('request.pendingAmendment.changes.0.value', '12500.50'));
    $this->patch(route('client.requests.amendments.accept', [$order, $amendment]))->assertSessionHasNoErrors();
    expect($order->fresh()->only(['final_price', 'work_scope']))->toBe($terms)
        ->and($order->fresh()->estimated_price)->toBe($estimate)
        ->and($order->statusHistories()->latest('id')->first()->note)->toContain('12500.50', $terms['work_scope']);
    $this->get(route('client.requests.show', $order))->assertInertia(fn ($page) => $page
        ->where('request.final_price', '12500.50')->where('request.work_scope', $terms['work_scope']));
    $this->actingAs($vendor->user)->get(route('vendor.requests'))->assertInertia(fn ($page) => $page->where('requests.0.final_price', '12500.50'));
    $this->actingAs(User::factory()->create(['role' => 'admin']))->get(route('admin.requests'))->assertInertia(fn ($page) => $page->where('requests.0.final_price', '12500.50'));
});

test('rejecting revised final terms preserves the previous agreement', function () {
    [$client, $vendor, $order] = amendableRequest();
    $order->update(['final_price' => '10000.00', 'work_scope' => 'Монтаж']);
    $this->actingAs($vendor->user)->patch(route('vendor.requests.update', $order), amendmentPayload([
        'final_price' => '12000', 'work_scope' => 'Монтаж и вывоз',
    ]))->assertSessionHasNoErrors();
    $amendment = $order->amendments()->firstOrFail();
    $this->actingAs($client)->patch(route('client.requests.amendments.reject', [$order, $amendment]))->assertSessionHasNoErrors();
    expect($order->fresh()->final_price)->toBe('10000.00')->and($order->fresh()->work_scope)->toBe('Монтаж');
});

test('only company can propose complete valid final terms', function (string $role, array $terms, string $error) {
    [$client, $vendor, $order] = amendableRequest();
    $this->actingAs($role === 'client' ? $client : $vendor->user)
        ->patch(route($role.'.requests.update', $order), amendmentPayload($terms))->assertSessionHasErrors($error);
    expect($order->amendments()->count())->toBe(0)->and($order->fresh()->final_price)->toBeNull();
})->with([
    ['client', ['final_price' => 100, 'work_scope' => 'Монтаж'], 'final_price'],
    ['vendor', ['final_price' => -1, 'work_scope' => 'Монтаж'], 'final_price'],
    ['vendor', ['final_price' => 100000000, 'work_scope' => 'Монтаж'], 'final_price'],
    ['vendor', ['final_price' => '100.001', 'work_scope' => 'Монтаж'], 'final_price'],
    ['vendor', ['final_price' => 100], 'work_scope'],
    ['vendor', ['work_scope' => 'Монтаж'], 'final_price'],
]);

test('a repeated order needs a new final agreement', function () {
    [$client, , $order] = amendableRequest();
    $order->update(['final_price' => '10000.00', 'work_scope' => 'Монтаж', 'status' => 'completed']);
    $this->actingAs($client)->post(route('client.requests.repeat', $order))->assertSessionHasNoErrors();
    $replacement = ServiceRequest::latest('id')->firstOrFail();
    expect($replacement->id)->not->toBe($order->id)->and($replacement->final_price)->toBeNull()->and($replacement->work_scope)->toBeNull();
});
