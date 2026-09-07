<?php

namespace Database\Factories;

use App\Models\RequestItem;
use App\Models\RequestItemValue;
use App\Models\ServiceParameter;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RequestItemValue> */
class RequestItemValueFactory extends Factory
{
    public function definition(): array
    {
        return ['request_item_id' => RequestItem::factory(), 'service_parameter_id' => fn (array $attributes) => ServiceParameter::factory()->create(['service_id' => RequestItem::findOrFail($attributes['request_item_id'])->service_id])->id, 'name' => 'Цвет', 'type' => 'select', 'text_value' => 'Белый'];
    }
}
