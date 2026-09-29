<?php

use App\Models\RequestItemValue;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use App\Services\CatalogBooking;

function recoverableOrder(): array
{
    $oldRate = VendorServiceRate::factory()->create();
    $order = app(CatalogBooking::class)->create(User::factory()->create(['role' => 'client']), [
        'rate_id' => $oldRate->id, 'city' => 'Москва', 'quantity' => 2, 'width_mm' => 1200, 'height_mm' => 1500,
        'parameters' => [], 'comment' => 'Сохранить комментарий', 'address' => 'Лесная, 10', 'contact_phone' => '+79991234567',
    ]);
    $order->update(['status' => 'rejected']);
    $offering = VendorService::factory()->create(['service_id' => $oldRate->vendorService->service_id]);
    VendorServiceRate::factory()->create(['vendor_service_id' => $offering->id, 'service_option_id' => $oldRate->service_option_id, 'price' => 2000]);

    return [$order, $offering];
}

test('replacement preserves request details and photos and recalculates the price without sharing chats', function () {
    [$order, $offering] = recoverableOrder();
    RequestItemValue::factory()->create(['request_item_id' => $order->items->first()->id, 'name' => 'Цвет', 'text_value' => 'Белый']);
    $order->update(['final_price' => '10000.00', 'work_scope' => 'Условия прежней компании']);
    $order->photos()->create(['path' => 'request-photos/private.png']);
    $order->chat->messages()->create(['sender_id' => $order->client_id, 'content' => 'Старая переписка', 'content_type' => 'text']);
    $this->actingAs($order->client)->get(route('request-recovery.show', $order))->assertOk()->assertInertia(fn ($page) => $page->has('choices', 1)->where('choices.0.price', 7200));
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertSessionHasNoErrors();
    $replacement = ServiceRequest::findOrFail($order->fresh()->replacement_request_id);
    expect($replacement->vendor_id)->toBe($offering->vendor_id)
        ->and($replacement->final_price)->toBeNull()
        ->and($replacement->work_scope)->toBeNull()
        ->and($replacement->address)->toBe('Лесная, 10')
        ->and($replacement->contact_phone)->toBe('+79991234567')
        ->and($replacement->comment)->toBe('Сохранить комментарий')
        ->and($replacement->estimated_price)->toBe('7200.00')
        ->and($replacement->items->first()->quantity)->toBe(2)
        ->and($replacement->items->first()->values->first()->text_value)->toBe('Белый')
        ->and($replacement->photos->first()->path)->toBe('request-photos/private.png')
        ->and($replacement->chat->messages)->toHaveCount(0)
        ->and($order->fresh()->status)->toBe('rejected');
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertRedirect(route('client.requests.show', $replacement));
    expect(ServiceRequest::count())->toBe(2);
    $this->actingAs($order->vendor->user)->get(route('request-photos.show', [$replacement, $replacement->photos->first()]))->assertForbidden();
});

test('recovery requires rejection or 48 hours without answer and validates the alternative', function () {
    [$order, $offering] = recoverableOrder();
    $this->actingAs($order->client);
    $order->update(['status' => 'new']);
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertSessionHasErrors('request');
    $order->forceFill(['created_at' => now()->subHours(49)])->save();
    $offering->vendor->update(['status' => 'rejected']);
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertSessionHasErrors('offering_id');
    $offering->vendor->update(['status' => 'approved', 'city' => 'Тула']);
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertSessionHasErrors('offering_id');
    $offering->vendor->update(['city' => 'Москва']);
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertSessionHasNoErrors();
    expect($order->fresh()->status)->toBe('cancelled');
});

test('admin sees unresolved requests and can help while unrelated users cannot recover them', function () {
    [$order, $offering] = recoverableOrder();
    ServiceRequest::factory()->create(['status' => 'confirmed']);
    $this->actingAs(User::factory()->create(['role' => 'client']))->get(route('request-recovery.show', $order))->assertForbidden();
    $this->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertForbidden();
    $this->actingAs(Vendor::factory()->create()->user)->post(route('request-recovery.assistance', $order))->assertForbidden();
    $this->actingAs($order->client)->post(route('request-recovery.assistance', $order))->assertSessionHasNoErrors();
    $this->patch(route('request-recovery.note', $order), ['note' => 'Подмена'])->assertForbidden();
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin)->get(route('admin.requests', ['needs_attention' => 1]))->assertInertia(fn ($page) => $page->has('requests', 1)->where('requests.0.id', (string) $order->id)->where('requests.0.assistanceRequested', true));
    $this->patch(route('request-recovery.note', $order), ['note' => 'Связались с клиентом, подбираем исполнителя.'])->assertSessionHasNoErrors();
    $this->actingAs($order->client)->get(route('client.requests.show', $order))->assertInertia(fn ($page) => $page->where('request.assistanceNote', 'Связались с клиентом, подбираем исполнителя.'));
    $this->actingAs($admin)->post(route('request-recovery.store', $order), ['offering_id' => $offering->id])->assertRedirect(route('admin.requests'));
    $this->get(route('admin.requests', ['needs_attention' => 1]))->assertInertia(fn ($page) => $page->has('requests', 0));
});
