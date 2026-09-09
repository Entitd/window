<?php

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorServiceRate;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function validLogoFile(): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        'company-logo.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mNk+M/wHwAF/gL+7l5WAAAAAElFTkSuQmCC'),
    );
}

test('vendor can replace the company logo', function () {
    Storage::fake('public');
    $vendor = Vendor::factory()->create([
        'logo' => 'vendor-logos/previous-logo.png',
        'status' => 'approved',
    ]);
    Storage::disk('public')->put('vendor-logos/previous-logo.png', 'previous logo');

    $response = $this->actingAs($vendor->user)->post(route('vendor.profile.logo.update'), [
        'logo' => validLogoFile(),
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    $vendor->refresh();

    expect($vendor->logo)->toStartWith('vendor-logos/')
        ->and($vendor->status)->toBe('approved');
    Storage::disk('public')->assertExists($vendor->logo);
    Storage::disk('public')->assertMissing('vendor-logos/previous-logo.png');

    $this->actingAs($vendor->user)
        ->get(route('vendor.profile'))
        ->assertInertia(fn (Assert $page) => $page->where('vendorProfile.logoUrl', '/storage/'.$vendor->logo));
});

test('approved vendor with a logo remains visible in search results', function () {
    $rate = VendorServiceRate::factory()->create();
    $vendor = $rate->vendorService->vendor;
    $vendor->update(['logo' => 'vendor-logos/company-logo.png']);

    $this->get(route('search-results'))->assertInertia(
        fn (Assert $page) => $page
            ->has('companies', 1)
            ->where('companies.0.id', $vendor->id)
            ->where('companies.0.logoUrl', '/storage/vendor-logos/company-logo.png'),
    );
});

test('only vendors can update a company logo', function () {
    $user = User::factory()->create(['role' => 'client']);

    $response = $this->actingAs($user)->post(route('vendor.profile.logo.update'), [
        'logo' => UploadedFile::fake()->create('company-logo.png', 100, 'image/png'),
    ]);

    $response->assertForbidden();
});

test('vendor logo must be a supported image', function () {
    $vendor = Vendor::factory()->create();

    $response = $this->actingAs($vendor->user)->post(route('vendor.profile.logo.update'), [
        'logo' => UploadedFile::fake()->create('company-logo.pdf', 100, 'application/pdf'),
    ]);

    $response->assertSessionHasErrors('logo');
});

test('vendor logo must be smaller than two megabytes', function () {
    $vendor = Vendor::factory()->create();

    $response = $this->actingAs($vendor->user)->post(route('vendor.profile.logo.update'), [
        'logo' => UploadedFile::fake()->create('company-logo.png', 2049, 'image/png'),
    ]);

    $response->assertSessionHasErrors('logo');
});
