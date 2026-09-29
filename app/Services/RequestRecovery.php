<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VendorService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class RequestRecovery
{
    public function __construct(private ServiceCatalog $catalog, private WarrantyIssuer $warranties) {}

    /** @return Collection<int, VendorService> */
    public function offerings(ServiceRequest $order): Collection
    {
        $order->loadMissing(['service', 'items.values', 'photos']);
        if (! $order->service?->is_active || ($order->service->category_id !== null && ! in_array($order->service_id, $this->catalog->availableServiceIds(), true))) {
            return collect();
        }

        $availableServices = $this->catalog->availableServiceIds();
        if ($order->items->contains(fn ($item) => ! in_array($item->service_id, $availableServices, true))) {
            return collect();
        }

        return VendorService::query()->with(['vendor.districts', 'rates.option', 'vendor.services.rates.option'])
            ->where('is_active', true)
            ->where(fn ($query) => $query->where('service_id', $order->service_id)
                ->when($order->items->isEmpty(), fn ($query) => $query->orWhere(fn ($legacy) => $legacy->whereNull('service_id')->where('service_name', $order->service->name))))
            ->when($order->vendor_id, fn ($query) => $query->where('vendor_id', '!=', $order->vendor_id))
            ->whereHas('vendor', fn ($query) => $query->where('status', 'approved'))
            ->get()->filter(function (VendorService $offering) use ($order): bool {
                if (mb_strtolower(trim($offering->vendor->city)) !== mb_strtolower(trim($order->city))) {
                    return false;
                }
                $district = trim((string) preg_replace('/\s*район\s*/iu', '', $order->district ?? ''));
                if ($district !== '' && ! $offering->vendor->districts->contains(fn ($area) => mb_strtolower($area->name) === mb_strtolower($district))) {
                    return false;
                }

                return $order->items->every(fn ($item) => $offering->vendor->services->contains(fn ($service) => $service->is_active && $service->service_id === $item->service_id && $service->rates->contains(fn ($rate) => $rate->service_option_id === $item->service_option_id && $rate->option?->is_active && $rate->option->service_id === $item->service_id && $rate->option->pricing_type === $item->pricing_type)));
            })->values();
    }

    /** @return array<int, array<string, mixed>> */
    public function choices(ServiceRequest $order): array
    {
        return $this->offerings($order)->map(fn (VendorService $offering) => [
            'id' => $offering->id, 'name' => $offering->vendor->company_name,
            'price' => $this->total($order, $offering),
            'warrantyMonths' => $this->selectedOfferings($order, $offering)->min('warranty_months'),
            'warrantyDescription' => $offering->vendor->warranty_description,
        ])->all();
    }

    /** @return Collection<int, VendorService> */
    private function selectedOfferings(ServiceRequest $order, VendorService $offering): Collection
    {
        return $order->items->isEmpty() ? collect([$offering]) : $offering->vendor->services->whereIn('service_id', $order->items->pluck('service_id'))->values();
    }

    private function total(ServiceRequest $order, VendorService $offering): ?float
    {
        if ($order->items->isEmpty()) {
            return $offering->min_price === null ? null : (float) $offering->min_price;
        }
        $totals = $order->items->map(function ($item) use ($offering): ?float {
            $rate = $offering->vendor->services->firstWhere('service_id', $item->service_id)->rates->firstWhere('service_option_id', $item->service_option_id);

            return $this->catalog->estimate($rate, $item->quantity, $item->width_mm, $item->height_mm);
        });

        return $totals->containsStrict(null) ? null : $totals->sum();
    }

    public function recover(ServiceRequest $order, User $actor, int $offeringId): ServiceRequest
    {
        return DB::transaction(function () use ($order, $actor, $offeringId): ServiceRequest {
            $order = ServiceRequest::query()->lockForUpdate()->findOrFail($order->id);
            Gate::forUser($actor)->authorize('recover', $order);
            if ($order->replacement_request_id) {
                return ServiceRequest::findOrFail($order->replacement_request_id);
            }
            $this->ensureRecoverable($order);
            $offering = $this->offerings($order)->firstWhere('id', $offeringId);
            if (! $offering) {
                throw ValidationException::withMessages(['offering_id' => 'Предложение недоступно для параметров этой заявки. Выберите другую компанию.']);
            }
            $total = $this->total($order, $offering);
            if ($total !== null && $total > 99999999.99) {
                throw ValidationException::withMessages(['offering_id' => 'Стоимость превышает допустимую сумму заказа.']);
            }
            $replacement = $order->replicate(['replacement_request_id', 'assistance_requested_at', 'assistance_note', 'final_price', 'work_scope']);
            $replacement->fill(['vendor_id' => $offering->vendor_id, 'status' => 'new', 'estimated_price' => $total, 'warranty_terms' => $this->warranties->snapshotMany($this->selectedOfferings($order, $offering))]);
            if ($replacement->installation_date?->isBefore(today())) {
                $replacement->fill(['installation_date' => null, 'arrival_from' => null, 'arrival_until' => null]);
            }
            $replacement->save();
            foreach ($order->items as $item) {
                $rate = $offering->vendor->services->firstWhere('service_id', $item->service_id)->rates->firstWhere('service_option_id', $item->service_option_id);
                $copy = $item->replicate();
                $copy->fill(['request_id' => $replacement->id, 'unit_price' => $rate->price, 'total_price' => $this->catalog->estimate($rate, $item->quantity, $item->width_mm, $item->height_mm)]);
                $copy->save();
                foreach ($item->values as $value) {
                    $copy->values()->save($value->replicate());
                }
            }
            foreach ($order->photos as $photo) {
                $replacement->photos()->create(['path' => $photo->path]);
            }
            $replacement->chat()->create(['client_id' => $order->client_id, 'vendor_id' => $offering->vendor_id]);
            $order->amendments()->where('status', 'pending')->update(['status' => 'rejected', 'decided_by_user_id' => $actor->id, 'decided_at' => now()]);
            $from = $order->status;
            $order->update(['replacement_request_id' => $replacement->id, 'status' => $from === 'rejected' ? 'rejected' : 'cancelled']);
            foreach ([$order, $replacement] as $record) {
                $record->statusHistories()->create([
                    'actor_id' => $actor->id, 'actor_role' => $actor->role,
                    'from_status' => $record->id === $order->id ? $from : null, 'to_status' => $record->status,
                    'label' => 'Выбран другой исполнитель', 'note' => 'Параметры сохранены в заявке №'.$replacement->id.'. Стоимость пересчитана по тарифу новой компании; дата требует подтверждения.',
                ]);
            }

            return $replacement;
        });
    }

    public function requestAssistance(ServiceRequest $order): void
    {
        $this->ensureRecoverable($order);
        $order->update(['assistance_requested_at' => now()]);
    }

    public function note(ServiceRequest $order, string $note): void
    {
        $order->update(['assistance_note' => $note]);
    }

    public function ensureRecoverable(ServiceRequest $order): void
    {
        if (! $order->needsRecovery()) {
            throw ValidationException::withMessages(['request' => 'Повторный подбор доступен после отказа или 48 часов без ответа компании.']);
        }
    }
}
