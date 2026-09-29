<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Vendor;
use App\Models\VendorService;
use Illuminate\Database\Seeder;

class VendorServiceSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedOffers('vendor.approved@example.com', [
            [
                'service' => 'Замена стеклопакета',
                'description' => 'Замена стеклопакета с выездом и базовой диагностикой.',
                'default_option' => 'Двухкамерный стеклопакет',
                'rates' => ['Однокамерный стеклопакет' => 5400, 'Двухкамерный стеклопакет' => 6700],
            ],
            [
                'service' => 'Установка окна',
                'description' => 'Монтаж нового оконного блока после замера.',
                'default_option' => 'Стандартный монтаж',
                'rates' => ['Стандартный монтаж' => 12500, 'Тёплый монтаж' => 14900],
            ],
            [
                'service' => 'Ремонт и регулировка',
                'description' => 'Регулировка створок и замена фурнитуры.',
                'default_option' => 'Регулировка створки',
                'rates' => ['Регулировка створки' => 2500, 'Замена фурнитуры' => 4200],
            ],
            [
                'service' => 'Установка москитной сетки',
                'description' => 'Изготовление сетки по размерам окна.',
                'default_option' => 'Рамочная сетка',
                'rates' => ['Рамочная сетка' => 1900, 'Сетка «Антикошка»' => 2900],
            ],
        ]);

        $this->seedOffers('vendor.pending@example.com', [
            [
                'service' => 'Балконный блок',
                'description' => 'Монтаж балконного блока после согласования замера.',
                'default_option' => 'Стандартный балконный блок',
                'rates' => ['Стандартный балконный блок' => 18000, 'Тёплый балконный блок' => 22000],
            ],
            [
                'service' => 'Установка подоконника',
                'description' => 'Установка подоконника с герметизацией стыков.',
                'default_option' => 'ПВХ-подоконник',
                'rates' => ['ПВХ-подоконник' => 3500, 'Подоконник из искусственного камня' => 8900],
            ],
        ]);
    }

    /**
     * @param  array<int, array{service: string, description: string, default_option: string, rates: array<string, int|float|null>}>  $offers
     */
    private function seedOffers(string $email, array $offers): void
    {
        $vendor = Vendor::whereHas('user', fn ($query) => $query->where('email', $email))->firstOrFail();

        foreach ($offers as $attributes) {
            $service = Service::with('options')->where('name', $attributes['service'])->firstOrFail();
            $defaultOption = $service->options->firstWhere('name', $attributes['default_option']);

            $offering = VendorService::query()
                ->where('vendor_id', $vendor->id)
                ->where('service_id', $service->id)
                ->first()
                ?? VendorService::query()
                    ->where('vendor_id', $vendor->id)
                    ->whereNull('service_id')
                    ->where('service_name', $service->name)
                    ->first()
                ?? new VendorService(['vendor_id' => $vendor->id]);

            $offering->fill([
                'service_id' => $service->id,
                'service_name' => $service->name,
                'description' => $attributes['description'],
                'min_price' => $defaultOption->pricing_type === 'quote' ? 0 : $attributes['rates'][$defaultOption->name],
                'price_type' => $defaultOption->pricing_type,
                'is_active' => true,
            ])->save();

            foreach ($attributes['rates'] as $optionName => $price) {
                $option = $service->options->firstWhere('name', $optionName);

                $offering->rates()->updateOrCreate(
                    ['service_option_id' => $option->id],
                    ['price' => $option->pricing_type === 'quote' ? null : $price, 'is_default' => $option->id === $defaultOption->id],
                );
            }
        }
    }
}
