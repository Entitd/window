<?php

use App\Models\ServiceRequest;
use App\Models\VendorServiceRate;

test('search exposes public approved reviews completed orders and relevant warranty only', function () {
    $rate = VendorServiceRate::factory()->create();
    $vendor = $rate->vendorService->vendor;
    $vendor->update(['warranty_description' => 'Бесплатное устранение дефектов монтажа.']);
    $rate->vendorService->update(['warranty_months' => 18]);
    foreach ([[true, 'approved', 5], [true, 'approved', 3], [false, 'approved', 1], [true, 'pending', 1], [true, 'rejected', 1]] as [$public, $status, $stars]) {
        $order = ServiceRequest::factory()->create(['vendor_id' => $vendor->id, 'status' => 'completed']);
        $order->review()->create(['vendor_id' => $vendor->id, 'user_id' => $order->client_id, 'is_public' => $public, 'status' => $status, 'stars' => $stars, 'comment' => $public && $status === 'approved' ? 'Опубликованный отзыв' : 'Скрытый отзыв']);
    }
    ServiceRequest::factory()->create(['vendor_id' => $vendor->id, 'status' => 'cancelled']);
    $this->get(route('search-results', ['service_id' => $rate->vendorService->service_id]))->assertInertia(fn ($page) => $page
        ->where('companies.0.reviewsLabel', '4,0 / 5 · Отзывов: 2')
        ->has('companies.0.reviews', 2)->where('companies.0.reviews.0.comment', 'Опубликованный отзыв')
        ->where('companies.0.completedOrders', 5)
        ->where('companies.0.warrantyMonths', 18)
        ->where('companies.0.warrantyDescription', 'Бесплатное устранение дефектов монтажа.')
        ->where('companies.0.availabilityLabel', 'После согласования'));
});
