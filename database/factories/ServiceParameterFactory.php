<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceParameter;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ServiceParameter> */
class ServiceParameterFactory extends Factory
{
    public function definition(): array
    {
        return ['service_id' => Service::factory(), 'key' => 'color', 'name' => 'Цвет', 'type' => 'select', 'choices' => ['Белый', 'Коричневый'], 'is_required' => true, 'is_active' => true];
    }
}
