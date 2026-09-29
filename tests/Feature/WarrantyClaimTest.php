<?php

use App\Models\ServiceRequest;
use App\Models\ServiceRequestWarranty;
use App\Models\User;
use App\Models\Vendor;

test('client opens a warranty claim and company or support can respond', function () {
    $vendor = Vendor::factory()->create();
    $order = ServiceRequest::factory()->create(['vendor_id' => $vendor->id, 'status' => 'completed']);
    ServiceRequestWarranty::factory()->create(['service_request_id' => $order->id, 'vendor_id' => $vendor->id]);
    $this->actingAs($order->client)->post(route('warranty-claims.store', $order), ['description' => 'После ремонта снова продувает окно.'])->assertSessionHasNoErrors();
    $claim = $order->warrantyClaims()->firstOrFail();
    $this->post(route('warranty-claims.store', $order), ['description' => 'Повторное обращение по той же проблеме.'])->assertSessionHasErrors('description');
    $this->actingAs($vendor->user)->patch(route('warranty-claims.update', [$order, $claim]), ['response' => 'Приедем и проверим.', 'status' => 'in_progress'])->assertSessionHasNoErrors();
    $this->actingAs($order->client)->get(route('client.requests.show', $order))->assertInertia(fn ($page) => $page->where('request.warrantyClaims.0.response', 'Приедем и проверим.'));
    $this->patch(route('warranty-claims.escalate', [$order, $claim]))->assertSessionHasNoErrors();
    expect($claim->fresh()->support_requested)->toBeTrue();
    $this->actingAs(User::factory()->create(['role' => 'admin']))->patch(route('warranty-claims.update', [$order, $claim]), ['response' => 'Проблема устранена.', 'status' => 'resolved'])->assertSessionHasNoErrors();
    expect($claim->fresh()->status)->toBe('resolved');
});

test('warranty claims reject unrelated users invalid states and mismatched orders', function () {
    $order = ServiceRequest::factory()->create(['status' => 'new']);
    $this->actingAs($order->client)->post(route('warranty-claims.store', $order), ['description' => 'Проблема с выполненным заказом.'])->assertSessionHasErrors('description');
    $claim = $order->warrantyClaims()->create(['description' => 'Проблема', 'status' => 'open']);
    $other = ServiceRequest::factory()->create();
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('warranty-claims.store', $order), ['description' => 'Чужое обращение'])->assertForbidden();
    $this->patch(route('warranty-claims.escalate', [$order, $claim]))->assertForbidden();
    $this->actingAs(Vendor::factory()->create()->user)->patch(route('warranty-claims.update', [$order, $claim]), ['response' => 'Ответ', 'status' => 'resolved'])->assertForbidden();
    $this->actingAs(User::factory()->create(['role' => 'admin']))->patch(route('warranty-claims.update', [$other, $claim]), ['response' => 'Ответ', 'status' => 'resolved'])->assertNotFound();
    $this->patch(route('warranty-claims.update', [$order, $claim]), ['response' => '', 'status' => 'invalid'])->assertSessionHasErrors(['response', 'status']);
});
