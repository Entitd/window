<?php

namespace Database\Factories;

use App\Models\ServiceRequest;
use App\Models\ServiceRequestWarranty;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceRequestWarranty>
 */
class ServiceRequestWarrantyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_request_id' => ServiceRequest::factory(),
            'vendor_id' => Vendor::factory(),
            'company_name' => fake()->company(),
            'contact_phone' => fake()->e164PhoneNumber(),
            'contact_email' => fake()->companyEmail(),
            'starts_at' => today(),
            'expires_at' => today()->addYear(),
            'description' => fake()->sentence(),
        ];
    }
}
