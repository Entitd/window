<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Services\ServiceCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SearchResultsController extends Controller
{
    public function __construct(private ServiceCatalog $catalog) {}

    public function index(Request $request): Response
    {
        return $this->renderResults($request);
    }

    private function renderResults(Request $request): Response
    {
        $catalogServices = $this->catalog->searchServices();
        $requestedServiceId = $request->integer('service_id');
        $serviceId = $catalogServices->contains('id', $requestedServiceId) ? $requestedServiceId : null;
        [$cityQuery, $districtQuery] = $this->locationParts($request->string('city')->toString());

        $availableIds = $catalogServices->modelKeys();
        $availableOffering = fn ($query) => $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('service_id')->orWhere(fn ($linked) => $linked
                ->whereIn('service_id', $availableIds)
                ->whereHas('rates', fn ($rates) => $rates->where('is_default', true)->whereHas('option', fn ($option) => $option->where('is_active', true)))))
            ->when($request->has('service_id'), fn ($q) => $q->where('service_id', $serviceId ?? 0));
        $vendors = Vendor::query()
            ->with([
                'districts:id,name',
                'services' => fn ($query) => $availableOffering($query)->with(['rates' => fn ($rates) => $rates->whereHas('option', fn ($o) => $o->where('is_active', true))->orderByDesc('is_default')])->orderBy('min_price'),
            ])
            ->where('status', 'approved')
            ->whereHas('services', $availableOffering)
            ->when($cityQuery, fn ($query) => $query->where('city', 'like', "%{$cityQuery}%"))
            ->when($districtQuery, fn ($query) => $query->whereHas('districts', fn ($districts) => $districts
                ->where('name', 'like', "%{$districtQuery}%")))
            ->latest()
            ->get();

        return Inertia::render('search-results', [
            'companies' => $vendors
                ->map(fn (Vendor $vendor) => $this->serializeVendor(
                    $vendor,
                    $vendor->services,
                    $serviceId,
                ))
                ->sortBy(fn (array $company) => $company['sortPrice'] ?? PHP_INT_MAX)
                ->values(),
            'services' => $catalogServices
                ->map(fn (Service $service) => ['id' => $service->id, 'name' => $service->name])
                ->values(),
        ]);
    }

    /**
     * @param  Collection<int, VendorService>  $services
     * @return array<string, mixed>
     */
    private function serializeVendor(Vendor $vendor, Collection $services, ?int $serviceId): array
    {
        $serviceKeys = $services
            ->pluck('service_name')
            ->map(fn (string $serviceName) => $this->serviceKeyByName($serviceName))
            ->filter()
            ->unique()
            ->values();
        $matchedService = $serviceId
            ? $services->firstWhere('service_id', $serviceId)
            : $services->sortBy('min_price')->first();
        $minPrice = $matchedService ? (float) $matchedService->min_price : null;

        return [
            'id' => $vendor->id,
            'initials' => $this->initials($vendor->company_name),
            'logoUrl' => Str::startsWith($vendor->logo ?? '', 'vendor-logos/')
                ? '/storage/'.$vendor->logo
                : null,
            'tone' => $this->tone($vendor->id),
            'name' => $vendor->company_name,
            'description' => $vendor->description ?: 'Проверенная компания в каталоге ОкнаМаркет.',
            'matchedServiceName' => $matchedService?->service_name,
            'catalogServiceId' => $matchedService?->service_id,
            'catalogRateId' => $matchedService?->rates->first()?->id,
            'priceLabel' => $matchedService?->service_id ? 'Выберите способ расчёта' : $this->priceLabel($minPrice),
            'sortPrice' => ! $matchedService?->service_id && $minPrice && $minPrice > 0 ? $minPrice : null,
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
