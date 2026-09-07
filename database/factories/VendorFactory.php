<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Vendor> */
class VendorFactory extends Factory
{
    public function definition(): array
    {
        return ['user_id' => User::factory()->state(['role' => 'vendor']), 'company_name' => fake()->company(), 'city' => 'Москва', 'phone' => fake()->e164PhoneNumber(), 'email' => fake()->safeEmail(), 'status' => 'approved'];
    }
}
