<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Service> */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return ['category_id' => ServiceCategory::factory(), 'name' => fake()->unique()->sentence(3), 'description' => null, 'is_active' => true, 'sort_order' => 0];
    }
}
