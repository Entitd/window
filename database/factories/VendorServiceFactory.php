<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Vendor;
use App\Models\VendorService;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VendorService> */
class VendorServiceFactory extends Factory
{
    public function definition(): array
    {
        return ['vendor_id' => Vendor::factory(), 'service_id' => Service::factory(), 'service_name' => 'Услуга', 'min_price' => 1000, 'price_type' => 'sqm', 'warranty_months' => 12, 'is_active' => true];
    }
}
