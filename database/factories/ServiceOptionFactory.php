<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ServiceOption> */
class ServiceOptionFactory extends Factory
{
    public function definition(): array
    {
        return ['service_id' => Service::factory(), 'name' => 'За м²', 'input_type' => 'dimensions', 'pricing_type' => 'sqm', 'is_active' => true];
    }
}
