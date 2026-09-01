<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SearchResultsController extends Controller
{
    public function calculate(Request $request): Response
    {
        return $this->renderResults($request, 'calculate');
    }

    public function index(Request $request): Response
    {
        return $this->renderResults($request, 'search-results');
    }

    private function renderResults(Request $request, string $component): Response
    {
        $serviceKey = $request->string('serviceKey')->toString();
        $serviceName = $this->serviceNamesByKey()[$serviceKey] ?? null;
        [$cityQuery, $districtQuery] = $this->locationParts($request->string('city')->toString());

        $vendors = Vendor::query()
            ->with([
                'districts:id,name',
                'services' => fn ($query) => $query
                    ->where('is_active', true)
                    ->when($serviceName, fn ($query) => $query->where('service_name', $serviceName))
                    ->orderBy('min_price'),
            ])
            ->where('status', 'approved')
            ->whereHas('services', fn ($query) => $query
                ->where('is_active', true)
                ->when($serviceName, fn ($query) => $query->where('service_name', $serviceName)))
            ->when($cityQuery, fn ($query) => $query->where('city', 'like', "%{$cityQuery}%"))
            ->when($districtQuery, fn ($query) => $query->whereHas('districts', fn ($districts) => $districts
                ->where('name', 'like', "%{$districtQuery}%")))
            ->latest()
            ->get();

        return Inertia::render($component, [
            'companies' => $vendors
                ->map(fn (Vendor $vendor) => $this->serializeVendor(
                    $vendor,
                    $vendor->services,
                    $serviceName,
                ))
                ->sortBy(fn (array $company) => $company['sortPrice'] ?? PHP_INT_MAX)
                ->values(),
        ]);
    }

    /**
     * @param  Collection<int, VendorService>  $services
     * @return array<string, mixed>
     */
    private function serializeVendor(Vendor $vendor, Collection $services, ?string $serviceName): array
    {
        $serviceKeys = $services
            ->pluck('service_name')
            ->map(fn (string $serviceName) => $this->serviceKeyByName($serviceName))
            ->filter()
            ->unique()
            ->values();
        $matchedService = $serviceName
            ? $services->firstWhere('service_name', $serviceName)
            : $services->sortBy('min_price')->first();
        $minPrice = $matchedService ? (float) $matchedService->min_price : null;

        return [
            'id' => $vendor->id,
            'initials' => $this->initials($vendor->company_name),
            'tone' => $this->tone($vendor->id),
            'name' => $vendor->company_name,
            'description' => $vendor->description ?: 'Проверенная компания в каталоге ОкнаМаркет.',
            'matchedServiceName' => $matchedService?->service_name,
            'priceLabel' => $this->priceLabel($minPrice),
            'sortPrice' => $minPrice && $minPrice > 0 ? $minPrice : null,
            'availabilityLabel' => 'После согласования',
            'reviewsLabel' => 'Отзывы пока не подключены',
            'districts' => $vendor->districts->pluck('name')->values(),
            'badge' => 'Проверена администратором',
            'feature' => 'Компания прошла модерацию и может получать заявки.',
            'servicesCount' => $services->count(),
            'serviceKeys' => $serviceKeys,
        ];
    }

    private function priceLabel(?float $minPrice): string
    {
        if (! $minPrice || $minPrice <= 0) {
            return 'Цена после уточнения';
        }

        return 'от '.number_format($minPrice, 0, ',', ' ').' ₽';
    }

    private function initials(string $companyName): string
    {
        return Str::of($companyName)
            ->replaceMatches('/[^\pL\pN\s]+/u', ' ')
            ->explode(' ')
            ->filter()
            ->take(2)
            ->map(fn (string $part) => Str::upper(Str::substr($part, 0, 1)))
            ->join('') ?: 'О';
    }

    private function tone(int $vendorId): string
    {
        return ['blue', 'green', 'violet'][$vendorId % 3];
    }

    private function serviceKeyByName(string $serviceName): ?string
    {
        $normalizedServiceName = Str::lower(trim($serviceName));

        foreach ($this->serviceNamesByKey() as $key => $name) {
            if ($normalizedServiceName === Str::lower($name)) {
                return $key;
            }
        }

        return null;
    }

    /**
     * @return array{0: string|null, 1: string|null}
     */
    private function locationParts(string $location): array
    {
        $parts = collect(explode(',', $location))
            ->map(fn (string $part) => trim($part))
            ->filter()
            ->values();

        $city = $parts->first();
        $district = $parts
            ->skip(1)
            ->first(fn (string $part) => Str::contains(Str::lower($part), 'район'))
            ?? $parts->get(1);

        if ($district) {
            $district = trim((string) preg_replace('/\s*район\s*/iu', '', $district));
        }

        return [$city ?: null, $district ?: null];
    }

    /**
     * @return array<string, string>
     */
    private function serviceNamesByKey(): array
    {
        return [
            'glass_replacement' => 'Замена стеклопакета',
            'window_installation' => 'Установка окна',
            'balcony_block' => 'Балконный блок',
            'measurement' => 'Замер',
            'repair' => 'Ремонт и регулировка',
        ];
    }
}
