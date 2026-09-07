<?php

namespace Database\Factories;

use App\Models\ServiceOption;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VendorServiceRate> */
class VendorServiceRateFactory extends Factory
{
    public function definition(): array
    {
        return ['vendor_service_id' => VendorService::factory(), 'service_option_id' => fn (array $attributes) => ServiceOption::factory()->create(['service_id' => VendorService::findOrFail($attributes['vendor_service_id'])->service_id])->id, 'price' => '1000.00', 'is_default' => true];
    }
}
