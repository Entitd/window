<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchCompaniesRequest;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Services\ServiceCatalog;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SearchResultsController extends Controller
{
    public function __construct(private ServiceCatalog $catalog) {}

    public function index(SearchCompaniesRequest $request): Response
    {
        return $this->renderResults($request);
    }

    private function renderResults(SearchCompaniesRequest $request): Response
    {
        $catalogServices = $this->catalog->searchServices();
        $requestedServiceId = $request->integer('service_id');
        $serviceId = ! $request->has('items') && $catalogServices->contains('id', $requestedServiceId) ? $requestedServiceId : null;
        [$cityQuery, $districtQuery] = $this->locationParts($request->string('city')->toString());

        $availableIds = $catalogServices->modelKeys();
        $availableOffering = fn ($query) => $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('service_id')->orWhere(fn ($linked) => $linked
                ->whereIn('service_id', $availableIds)
                ->whereHas('rates', fn ($rates) => $rates->where('is_default', true)->whereHas('option', fn ($option) => $option->where('is_active', true)))))
            ->when(! $request->has('items') && $request->has('service_id'), fn ($q) => $q->where('service_id', $serviceId ?? 0))
            ->when(! $request->has('items') && $request->filled('option_id'), fn ($q) => $q->whereHas('rates', fn ($rates) => $rates->where('service_option_id', $request->integer('option_id'))));
        $selections = $request->validated('items', []);
        $vendors = Vendor::query()
            ->with([
                'publicReviews' => fn ($query) => $query->latest()->limit(3),
                'districts:id,name',
                'services' => fn ($query) => $availableOffering($query)->with(['rates' => fn ($rates) => $rates->whereHas('option', fn ($o) => $o->where('is_active', true))->with('option')->orderByDesc('is_default')])->orderBy('min_price'),
            ])
            ->withCount(['publicReviews', 'serviceRequests as completed_orders_count' => fn ($query) => $query->where('status', 'completed')])
            ->withAvg('publicReviews', 'stars')
            ->where('status', 'approved')
            ->whereHas('services', $availableOffering)
            ->when($cityQuery, fn ($query) => $query->where('city', 'like', "%{$cityQuery}%"))
            ->when($districtQuery, fn ($query) => $query->whereHas('districts', fn ($districts) => $districts
                ->where('name', 'like', "%{$districtQuery}%")))
            ->when($selections !== [], function ($query) use ($selections, $availableIds, $availableOffering): void {
                foreach ($selections as $selection) {
                    $query->whereHas('services', fn ($offers) => $availableOffering($offers)
                        ->where('service_id', $selection['service_id'])->whereIn('service_id', $availableIds)
                        ->whereHas('rates', fn ($rates) => $rates
                            ->when(filled($selection['option_id'] ?? null), fn ($rates) => $rates->where('service_option_id', $selection['option_id']), fn ($rates) => $rates->where('is_default', true))
                            ->whereHas('option', fn ($options) => $options->where('is_active', true)->where('service_id', $selection['service_id']))));
                }
            })
            ->latest()
            ->get();

        return Inertia::render('search-results', [
            'companies' => $vendors
                ->map(fn (Vendor $vendor) => $this->serializeVendor(
                    $vendor,
                    $vendor->services,
                    $serviceId,
                    $request,
                ))
                ->sortBy(fn (array $company) => $company['sortPrice'] ?? PHP_INT_MAX)
                ->values(),
            'bookingDefaults' => [
                'width_mm' => $request->dimensionInMillimetres('width'),
                'height_mm' => $request->dimensionInMillimetres('height'),
                'quantity' => (int) ($request->validated('quantity') ?? 1),
                'city' => $cityQuery,
                'district' => $districtQuery,
                'installation_date' => $request->validated('installationDate'),
                'comment' => $request->validated('comment'),
            ],
            'services' => $catalogServices,
        ]);
    }

    /**
     * @param  Collection<int, VendorService>  $services
     * @return array<string, mixed>
     */
    private function serializeVendor(Vendor $vendor, Collection $services, ?int $serviceId, SearchCompaniesRequest $request): array
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

        $rate = $request->filled('option_id')
            ? $matchedService?->rates->firstWhere('service_option_id', $request->integer('option_id'))
            : $matchedService?->rates->firstWhere('is_default', true);
        $estimate = $rate ? $this->catalog->estimate(
            $rate,
            (int) ($request->validated('quantity') ?? 1),
            $request->dimensionInMillimetres('width'),
            $request->dimensionInMillimetres('height'),
        ) : null;
        $priceLabel = $estimate !== null
            ? 'Предварительно '.number_format($estimate, 2, ',', ' ').' ₽'
            : 'Цена после уточнения';

        $selectedItems = $this->catalog->selectionItems($services, $request->validated('items', []));
        $selectedOfferings = $services->whereIn('service_id', array_column($selectedItems, 'service_id'));
        if ($selectedItems !== []) {
            $matchedService = $services->firstWhere('service_id', $selectedItems[0]['service_id']);
            $rate = $matchedService->rates->firstWhere('id', $selectedItems[0]['rate_id']);
            $totals = array_column($selectedItems, 'total');
            $estimate = in_array(null, $totals, true) ? null : array_sum($totals);
            $priceLabel = $estimate === null ? 'Общая стоимость после уточнения' : 'За все работы '.number_format($estimate, 2, ',', ' ').' ₽';
        }

        return [
            'catalogItems' => $selectedItems,
            'id' => $vendor->id,
            'initials' => $this->initials($vendor->company_name),
            'logoUrl' => Str::startsWith($vendor->logo ?? '', 'vendor-logos/')
                ? '/storage/'.$vendor->logo
                : null,
            'tone' => $this->tone($vendor->id),
            'name' => $vendor->company_name,
            'description' => $vendor->description ?: 'Проверенная компания в каталоге ОкнаМаркет.',
            'matchedServiceName' => $selectedOfferings->isNotEmpty() ? $selectedOfferings->pluck('service_name')->join(', ') : $matchedService?->service_name,
            'catalogServiceId' => $matchedService?->service_id,
            'catalogRateId' => $rate?->id,
            'priceLabel' => $matchedService?->service_id ? $priceLabel : $this->priceLabel($minPrice),
            'estimateBasis' => count($selectedItems) > 1 ? 'Все выбранные работы' : $rate?->option->name,
            'sortPrice' => $matchedService?->service_id ? $estimate : ($minPrice > 0 ? $minPrice : null),
            'availabilityLabel' => 'После согласования',
            'reviewsLabel' => $vendor->public_reviews_count
                ? number_format((float) $vendor->public_reviews_avg_stars, 1, ',', '').' / 5 · Отзывов: '.$vendor->public_reviews_count
                : 'Пока нет опубликованных отзывов',
            'reviews' => $vendor->publicReviews->map(fn ($review) => [
                'id' => $review->id, 'stars' => $review->stars, 'comment' => $review->comment,
            ])->values(),
            'completedOrders' => $vendor->completed_orders_count,
            'warrantyMonths' => $selectedOfferings->isNotEmpty() ? $selectedOfferings->min('warranty_months') : $matchedService?->warranty_months,
            'warrantyDescription' => $vendor->warranty_description.($selectedOfferings->count() > 1 ? ' Сроки по работам: '.$selectedOfferings->map(fn ($offering) => $offering->service_name.' — '.$offering->warranty_months.' мес.')->join('; ') : ''),
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
