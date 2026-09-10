<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceOption;
use App\Models\ServiceParameter;
use Illuminate\Database\Seeder;

class ServiceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->seedCategories();

        foreach ($this->services() as $attributes) {
            $service = Service::updateOrCreate(
                ['name' => $attributes['name']],
                [
                    'category_id' => $categories[$attributes['category']]->id,
                    'description' => $attributes['description'],
                    'sort_order' => $attributes['sort_order'],
                    'is_active' => true,
                ],
            );

            $this->seedOptions($service, $attributes['options']);
            $this->seedParameters($service, $attributes['parameters']);
        }
    }

    /**
     * @return array<string, ServiceCategory>
     */
    private function seedCategories(): array
    {
        $categories = [];

        foreach ([
            ['key' => 'windows', 'name' => 'Окна и остекление', 'sort_order' => 10],
            ['key' => 'repair', 'name' => 'Ремонт и обслуживание', 'sort_order' => 20],
            ['key' => 'accessories', 'name' => 'Комплектующие и отделка', 'sort_order' => 30],
        ] as $attributes) {
            $categories[$attributes['key']] = ServiceCategory::updateOrCreate(
                ['parent_id' => null, 'name' => $attributes['name']],
                ['sort_order' => $attributes['sort_order'], 'is_active' => true],
            );
        }

        foreach ([
            ['key' => 'window-installation', 'parent' => 'windows', 'name' => 'Установка окон', 'sort_order' => 10],
            ['key' => 'balcony-glazing', 'parent' => 'windows', 'name' => 'Остекление балконов', 'sort_order' => 20],
            ['key' => 'glass-units', 'parent' => 'repair', 'name' => 'Стеклопакеты', 'sort_order' => 10],
            ['key' => 'hardware', 'parent' => 'repair', 'name' => 'Фурнитура и герметизация', 'sort_order' => 20],
            ['key' => 'screens', 'parent' => 'accessories', 'name' => 'Москитные сетки', 'sort_order' => 10],
            ['key' => 'finishing', 'parent' => 'accessories', 'name' => 'Подоконники и откосы', 'sort_order' => 20],
        ] as $attributes) {
            $categories[$attributes['key']] = ServiceCategory::updateOrCreate(
                ['parent_id' => $categories[$attributes['parent']]->id, 'name' => $attributes['name']],
                ['sort_order' => $attributes['sort_order'], 'is_active' => true],
            );
        }

        return $categories;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function services(): array
    {
        return [
            [
                'category' => 'window-installation',
                'sort_order' => 10,
                'name' => 'Установка окна',
                'description' => 'Монтаж нового оконного блока с подготовкой проёма.',
                'options' => [
                    ['name' => 'Стандартный монтаж', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                    ['name' => 'Тёплый монтаж', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                ],
                'parameters' => [
                    ['key' => 'profile', 'name' => 'Профиль', 'type' => 'select', 'choices' => ['60 мм', '70 мм', '80 мм']],
                    ['key' => 'sashes', 'name' => 'Количество створок', 'type' => 'number', 'min_value' => 1, 'max_value' => 6],
                ],
            ],
            [
                'category' => 'balcony-glazing',
                'sort_order' => 10,
                'name' => 'Балконный блок',
                'description' => 'Установка окна и двери на балкон с подготовкой проёма.',
                'options' => [
                    ['name' => 'Стандартный балконный блок', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                    ['name' => 'Тёплый балконный блок', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                ],
                'parameters' => [
                    ['key' => 'door_side', 'name' => 'Сторона открывания двери', 'type' => 'select', 'choices' => ['Левая', 'Правая']],
                ],
            ],
            [
                'category' => 'glass-units',
                'sort_order' => 10,
                'name' => 'Замена стеклопакета',
                'description' => 'Замена повреждённого или потерявшего герметичность стеклопакета.',
                'options' => [
                    ['name' => 'Однокамерный стеклопакет', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                    ['name' => 'Двухкамерный стеклопакет', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                ],
                'parameters' => [
                    ['key' => 'energy_saving', 'name' => 'Энергосберегающее стекло', 'type' => 'boolean'],
                ],
            ],
            [
                'category' => 'hardware',
                'sort_order' => 10,
                'name' => 'Ремонт и регулировка',
                'description' => 'Регулировка створок, замена фурнитуры и устранение продувания.',
                'options' => [
                    ['name' => 'Регулировка створки', 'input_type' => 'selection', 'pricing_type' => 'fixed'],
                    ['name' => 'Замена фурнитуры', 'input_type' => 'selection', 'pricing_type' => 'fixed'],
                ],
                'parameters' => [
                    ['key' => 'issue', 'name' => 'Неисправность', 'type' => 'select', 'choices' => ['Продувание', 'Тугое открывание', 'Не закрывается']],
                ],
            ],
            [
                'category' => 'screens',
                'sort_order' => 10,
                'name' => 'Установка москитной сетки',
                'description' => 'Изготовление и установка москитной сетки по размеру окна.',
                'options' => [
                    ['name' => 'Рамочная сетка', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                    ['name' => 'Сетка «Антикошка»', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                ],
                'parameters' => [
                    ['key' => 'color', 'name' => 'Цвет рамки', 'type' => 'select', 'choices' => ['Белый', 'Коричневый', 'Серый']],
                ],
            ],
            [
                'category' => 'finishing',
                'sort_order' => 10,
                'name' => 'Установка подоконника',
                'description' => 'Подбор и монтаж подоконника с герметизацией примыканий.',
                'options' => [
                    ['name' => 'ПВХ-подоконник', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                    ['name' => 'Подоконник из искусственного камня', 'input_type' => 'dimensions', 'pricing_type' => 'sqm'],
                ],
                'parameters' => [
                    ['key' => 'thickness', 'name' => 'Толщина', 'type' => 'select', 'choices' => ['18 мм', '25 мм']],
                ],
            ],
        ];
    }

    /**
     * @param  array<int, array<string, string>>  $options
     */
    private function seedOptions(Service $service, array $options): void
    {
        foreach ($options as $attributes) {
            ServiceOption::updateOrCreate(
                ['service_id' => $service->id, 'name' => $attributes['name']],
                [...$attributes, 'is_active' => true],
            );
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $parameters
     */
    private function seedParameters(Service $service, array $parameters): void
    {
        foreach ($parameters as $attributes) {
            ServiceParameter::updateOrCreate(
                ['service_id' => $service->id, 'key' => $attributes['key']],
                [
                    ...$attributes,
                    'unit' => $attributes['unit'] ?? null,
                    'is_required' => true,
                    'is_active' => true,
                ],
            );
        }
    }
}
