<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VendorServiceRate;
use Inertia\Testing\AssertableInertia as Assert;

test('guest resumes the saved tariff and parameters after authentication', function (bool $register) {
    $rate = VendorServiceRate::factory()->create();
    $data = [
        'rate_id' => $rate->id, 'quantity' => '2', 'width_mm' => '1300', 'height_mm' => '1400',
        'city' => 'Москва', 'district' => '', 'installation_date' => '2030-01-01',
        'address' => 'Лесная, 10', 'contact_name' => 'Анна', 'contact_phone' => '+79991234567', 'arrival_from' => '10:00', 'arrival_until' => '12:00',
        'comment' => 'Позвонить перед выездом', 'parameters' => ['color' => 'Белый'],
    ];
    $destination = route('catalog.index', ['service_id' => $rate->vendorService->service_id, 'rate_id' => $rate->id]);
    $this->post(route('catalog.draft'), $data)
        ->assertRedirect(route('login'))->assertSessionHas('url.intended', $destination);
    expect(ServiceRequest::count())->toBe(0);

    if ($register) {
        $this->post(route('register.client.store'), [
            'name' => 'Клиент', 'phone' => '+79991112233', 'email' => 'draft@example.com',
            'password' => 'password', 'password_confirmation' => 'password', 'policy' => true,
        ])->assertSessionHasNoErrors()->assertRedirect($destination);
    } else {
        $user = User::factory()->create(['role' => 'client']);
        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
            ->assertSessionHasNoErrors()->assertRedirect($destination);
    }
    $this->get($destination)->assertInertia(fn (Assert $page) => $page
        ->where('draft.rate_id', $rate->id)
        ->where('draft.width_mm', '1300')->where('draft.height_mm', '1400')
        ->where('draft.quantity', '2')->where('draft.parameters.color', 'Белый')
        ->where('draft.comment', $data['comment']));

    $this->get(route('catalog.index', ['rate_id' => $rate->id + 1]))
        ->assertInertia(fn (Assert $page) => $page->where('draft', null));
    $this->post(route('catalog.store'), [...$data, 'parameters' => []])
        ->assertSessionHasNoErrors()->assertSessionMissing('catalog_draft');
    expect(ServiceRequest::count())->toBe(1);
    expect(ServiceRequest::first()->address)->toBe('Лесная, 10')
        ->and(ServiceRequest::first()->contact_phone)->toBe('+79991234567')
        ->and(ServiceRequest::first()->arrival_until)->toBe('12:00');
})->with([false, true]);

test('incomplete draft can be saved but does not create an order or accept external return URLs', function () {
    $rate = VendorServiceRate::factory()->create();
    $this->post(route('catalog.draft'), [
        'rate_id' => $rate->id, 'parameters' => [], 'width_mm' => '',
        'return_url' => 'https://attacker.example',
    ])->assertRedirect(route('login'))->assertSessionHas('url.intended', route('catalog.index', [
        'service_id' => $rate->vendorService->service_id, 'rate_id' => $rate->id,
    ]))->assertSessionMissing('catalog_draft.return_url');
    expect(ServiceRequest::count())->toBe(0);
});

test('failed login and failed booking retain the draft', function () {
    $rate = VendorServiceRate::factory()->create();
    $this->post(route('catalog.draft'), ['rate_id' => $rate->id, 'parameters' => []])->assertSessionHasNoErrors();
    $this->post(route('login.store'), ['email' => 'missing@example.com', 'password' => 'wrong'])
        ->assertSessionHasErrors('email')->assertSessionHas('catalog_draft');
    $this->actingAs(User::factory()->create(['role' => 'client']))
        ->post(route('catalog.store'), ['rate_id' => $rate->id, 'parameters' => []])
        ->assertSessionHasErrors()->assertSessionHas('catalog_draft');
});
