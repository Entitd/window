<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Vendor;
use App\Models\VendorService;
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
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function availableQuery(): Builder
    {
        return Service::where('is_active', true)
            ->whereIn('category_id', $this->activeCategoryIds())
            ->whereHas('options', fn ($query) => $query->where('is_active', true));
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
