<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VendorServiceRate;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CatalogBooking
{
    public function __construct(private ServiceCatalog $catalog) {}

    public function create(User $client, array $data): ServiceRequest
    {
        return DB::transaction(function () use ($client, $data): ServiceRequest {
            $rate = VendorServiceRate::with(['option', 'vendorService.vendor.districts', 'vendorService.catalogService.parameters'])->lockForUpdate()->findOrFail($data['rate_id']);
            $offering = $rate->vendorService;
            $service = $offering->catalogService;
            $option = $rate->option;
            if (! $service || ! $service->is_active || ! $offering->is_active || ! $option->is_active
                || $option->service_id !== $service->id || $offering->vendor->status !== 'approved'
                || ! in_array($service->category_id, $this->catalog->activeCategoryIds(), true)) {
                throw ValidationException::withMessages(['rate_id' => 'Предложение больше недоступно. Выберите другое.']);
            }
            if (mb_strtolower(trim($data['city'])) !== mb_strtolower(trim($offering->vendor->city))) {
                throw ValidationException::withMessages(['city' => 'Компания не работает в этом городе.']);
            }
            $district = trim((string) preg_replace('/\s*район\s*/iu', '', $data['district'] ?? ''));
            if ($district !== '' && ! $offering->vendor->districts->contains(fn ($d) => mb_strtolower($d->name) === mb_strtolower($district))) {
                throw ValidationException::withMessages(['district' => 'Компания не работает в этом районе.']);
            }
            $quantity = (int) $data['quantity'];
            $width = $option->input_type === 'dimensions' ? (int) $data['width_mm'] : null;
            $height = $option->input_type === 'dimensions' ? (int) $data['height_mm'] : null;
            $price = $rate->price === null ? null : (float) $rate->price;
            $total = match ($option->pricing_type) {
                'quote' => null,
                'fixed' => $price,
                'unit' => $price * $quantity,
                'sqm' => round($price * $width * $height * $quantity / 1000000, 2),
            };
            if ($total !== null && $total > 99999999.99) {
                throw ValidationException::withMessages(['quantity' => 'Сумма заявки слишком велика. Уменьшите количество или размеры.']);
            }
            $request = ServiceRequest::create([
                'client_id' => $client->id,
                'vendor_id' => $offering->vendor_id,
                'service_id' => $service->id,
                'city' => $data['city'],
                'district' => $data['district'] ?? null,
                'installation_date' => $data['installation_date'] ?? null,
                'window_width' => $width ?? 0,
                'window_height' => $height ?? 0,
                'additional_services' => [],
                'comment' => $data['comment'] ?? null,
                'estimated_price' => $total,
                'status' => 'new',
            ]);
            $item = $request->items()->create([
                'service_id' => $service->id,
                'service_option_id' => $option->id,
                'service_name' => $service->name,
                'option_name' => $option->name,
                'pricing_type' => $option->pricing_type,
                'quantity' => $quantity,
                'width_mm' => $width,
                'height_mm' => $height,
                'unit_price' => $price,
                'total_price' => $total,
            ]);
            foreach ($service->parameters->where('is_active', true) as $parameter) {
                $value = $data['parameters'][$parameter->key] ?? null;
                if ($value === null || $value === '') {
                    continue;
                }
                $column = match ($parameter->type) {
                    'number' => 'number_value',
                    'boolean' => 'boolean_value',
                    default => 'text_value',
                };
                $item->values()->create([
                    'service_parameter_id' => $parameter->id,
                    'name' => $parameter->name,
                    'type' => $parameter->type,
                    'unit' => $parameter->unit,
                    $column => $value,
                ]);
            }
            $request->chat()->create(['client_id' => $client->id, 'vendor_id' => $offering->vendor_id]);
            $request->statusHistories()->create([
                'actor_id' => $client->id, 'actor_role' => 'client',
                'from_status' => null, 'to_status' => 'new',
                'label' => 'Заявка создана', 'note' => 'Клиент выбрал услугу и тариф компании.',
            ]);

            return $request;
        });
    }
}
