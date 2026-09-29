<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ServiceCatalog
{
    public function categories(): Collection
    {
        return ServiceCategory::orderBy('sort_order')->orderBy('name')->get();
    }

    public function activeCategoryIds(): array
    {
        $categories = $this->categories()->keyBy('id');

        return $categories->filter(function (ServiceCategory $category) use ($categories): bool {
            $visited = [];
            while ($category) {
                if (! $category->is_active || isset($visited[$category->id])) {
                    return false;
                }
                $visited[$category->id] = true;
                $category = $category->parent_id ? $categories->get($category->parent_id) : null;
            }

            return true;
        })->keys()->all();
    }

    public function availableServices(): Collection
    {
        return $this->availableQuery()->with([
            'options' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
            'parameters' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
        ])->orderBy('sort_order')->orderBy('name')->get();
    }

    public function availableServiceIds(): array
    {
        return $this->availableQuery()->pluck('id')->all();
    }

    public function searchServices(): Collection
    {
        return $this->availableQuery()
            ->with(['options' => fn ($query) => $query->where('is_active', true)->orderBy('id')->select(['id', 'service_id', 'name', 'input_type'])])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'description']);
    }

    private function availableQuery(): Builder
    {
        return Service::where('is_active', true)
            ->whereIn('category_id', $this->activeCategoryIds())
            ->whereHas('options', fn ($query) => $query->where('is_active', true));
    }

    /**
     * @param  Collection<int, VendorService>  $offerings
     * @param  array<int, array<string, mixed>>  $selections
     * @return array<int, array<string, mixed>>
     */
    public function selectionItems(Collection $offerings, array $selections): array
    {
        $selectedItems = [];
        foreach ($selections as $selection) {
            $selectedOffering = $offerings->firstWhere('service_id', (int) $selection['service_id']);
            $selectedRate = filled($selection['option_id'] ?? null)
                ? $selectedOffering->rates->firstWhere('service_option_id', (int) $selection['option_id'])
                : $selectedOffering->rates->firstWhere('is_default', true);
            $width = filled($selection['width'] ?? null) ? (int) round((float) $selection['width'] * 10) : null;
            $height = filled($selection['height'] ?? null) ? (int) round((float) $selection['height'] * 10) : null;
            $selectedItems[] = [
                'rate_id' => $selectedRate->id, 'service_id' => $selectedOffering->service_id,
                'service_name' => $selectedOffering->service_name, 'option_id' => $selectedRate->service_option_id,
                'quantity' => (int) $selection['quantity'],
                'width_mm' => $selectedRate->option->input_type === 'dimensions' ? $width : null,
                'height_mm' => $selectedRate->option->input_type === 'dimensions' ? $height : null,
                'total' => $this->estimate($selectedRate, (int) $selection['quantity'], $width, $height),
            ];
        }

        return $selectedItems;
    }

    public function estimate(VendorServiceRate $rate, int $quantity, ?int $width, ?int $height): ?float
    {
        if ($rate->price === null || ($rate->option->input_type === 'dimensions' && (! $width || ! $height))) {
            return null;
        }

        $price = (float) $rate->price;

        return match ($rate->option->pricing_type) {
            'fixed' => $price,
            'unit' => round($price * $quantity, 2),
            'sqm' => round($price * $width * $height * $quantity / 1000000, 2),
            default => null,
        };
    }

    public function saveService(?Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data): Service {
            $service ??= new Service;
            $service->fill(collect($data)->except(['options', 'parameters'])->all())->save();
            foreach (['options', 'parameters'] as $relation) {
                $ids = [];
                foreach ($data[$relation] as $attributes) {
                    $id = $attributes['id'] ?? null;
                    unset($attributes['id']);
                    $record = $id ? $service->{$relation}()->findOrFail($id) : $service->{$relation}()->make();
                    $record->fill($attributes)->save();
                    $ids[] = $record->id;
                }
                $service->{$relation}()->whereNotIn('id', $ids)->update(['is_active' => false]);
            }
            VendorService::where('service_id', $service->id)->update(['service_name' => $service->name]);

            return $service;
        });
    }

    public function saveVendorService(Vendor $vendor, ?VendorService $offering, array $data): VendorService
    {
        return DB::transaction(function () use ($vendor, $offering, $data): VendorService {
            $service = Service::with('options')->findOrFail($data['service_id']);
            $default = collect($data['rates'])->firstWhere('is_default', true);
            $option = $service->options->firstWhere('id', (int) $default['service_option_id']);
            $offering ??= $vendor->services()->make();
            $offering->fill([
                'service_id' => $service->id,
                'service_name' => $service->name,
                'description' => $data['description'] ?? null,
                'min_price' => $option->pricing_type === 'quote' ? 0 : $default['price'],
                'price_type' => $option->pricing_type,
                'warranty_months' => $data['warranty_months'],
                'is_active' => $data['is_active'],
            ])->save();
            $ids = [];
            foreach ($data['rates'] as $rate) {
                $option = $service->options->firstWhere('id', (int) $rate['service_option_id']);
                $offering->rates()->updateOrCreate(['service_option_id' => $option->id], [
                    'price' => $option->pricing_type === 'quote' ? null : $rate['price'],
                    'is_default' => $rate['is_default'],
                ]);
                $ids[] = $option->id;
            }
            $offering->rates()->whereNotIn('service_option_id', $ids)->delete();

            return $offering;
        });
    }
}
