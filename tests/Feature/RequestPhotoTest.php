<?php

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Testing\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function requestPhotoFile(): File
{
    return UploadedFile::fake()->createWithContent('window.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mNk+M/wHwAF/gL+7l5WAAAAAElFTkSuQmCC'));
}

test('request photos are private and available to participants only', function () {
    Storage::fake('local');
    $vendor = Vendor::factory()->create();
    $order = ServiceRequest::factory()->create(['vendor_id' => $vendor->id, 'status' => 'new']);
    $this->actingAs($order->client)->post(route('request-photos.store', $order), ['photos' => [requestPhotoFile(), requestPhotoFile()]])->assertSessionHasNoErrors();
    expect($order->photos()->count())->toBe(2);
    $photo = $order->photos()->firstOrFail();
    Storage::disk('local')->assertExists($photo->path);
    $url = route('request-photos.show', [$order, $photo]);
    $this->get($url)->assertOk()->assertHeader('Cache-Control', 'no-store, private');
    $this->actingAs($vendor->user)->get($url)->assertOk();
    $this->actingAs(User::factory()->create(['role' => 'admin']))->get($url)->assertOk();
    $this->actingAs(User::factory()->create(['role' => 'client']))->get($url)->assertForbidden();
    $this->actingAs(Vendor::factory()->create()->user)->get($url)->assertForbidden();
    $other = ServiceRequest::factory()->create();
    $this->actingAs($other->client)->get(route('request-photos.show', [$other, $photo]))->assertNotFound();
    $this->post(route('request-photos.store', $order), ['photos' => [requestPhotoFile()]])->assertForbidden();
});

test('request photo size formats count and order status are enforced', function () {
    Storage::fake('local');
    $order = ServiceRequest::factory()->create(['status' => 'new']);
    $this->actingAs($order->client);
    foreach ([requestPhotoFile()->size(5121), UploadedFile::fake()->create('fake.jpg', 1, 'text/plain'), UploadedFile::fake()->create('vector.svg', 1, 'image/svg+xml')] as $file) {
        $this->post(route('request-photos.store', $order), ['photos' => [$file]])->assertSessionHasErrors('photos.0');
    }
    $files = fn (int $count) => array_map(fn () => requestPhotoFile(), range(1, $count));
    $this->post(route('request-photos.store', $order), ['photos' => $files(6)])->assertSessionHasErrors('photos');
    $this->post(route('request-photos.store', $order), ['photos' => $files(5)])->assertSessionHasNoErrors();
    $this->post(route('request-photos.store', $order), ['photos' => $files(1)])->assertSessionHasErrors('photos');
    expect($order->photos()->count())->toBe(5)->and(Storage::disk('local')->allFiles())->toHaveCount(5);
    $order->update(['status' => 'completed']);
    $this->post(route('request-photos.store', $order), ['photos' => $files(1)])->assertForbidden();
});
