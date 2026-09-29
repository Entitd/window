<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ServiceRequest> */
class ServiceRequestFactory extends Factory
{
    public function definition(): array
    {
        return ['client_id' => User::factory()->state(['role' => 'client']), 'service_id' => Service::factory(), 'city' => 'Москва', 'window_width' => 100, 'window_height' => 100, 'status' => 'new'];
    }
}
