<?php

namespace Database\Factories;

use App\Models\RequestItem;
use App\Models\ServiceOption;
use App\Models\ServiceRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RequestItem> */
class RequestItemFactory extends Factory
{
    public function definition(): array
    {
        return ['request_id' => ServiceRequest::factory(), 'service_id' => fn (array $attributes) => ServiceRequest::findOrFail($attributes['request_id'])->service_id, 'service_option_id' => fn (array $attributes) => ServiceOption::factory()->create(['service_id' => $attributes['service_id']])->id, 'service_name' => 'Услуга', 'option_name' => 'За м²', 'pricing_type' => 'sqm', 'quantity' => 1, 'width_mm' => 1000, 'height_mm' => 1000, 'unit_price' => 1000, 'total_price' => 1000];
    }
}
