<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\District;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $vendor = $this->vendorFor($request)->load('districts:id,name');

        return Inertia::render('vendor/profile', [
            'vendorProfile' => $this->serializeProfile($vendor),
            'vendorServices' => $vendor->services()
                ->latest()
                ->get()
                ->map(fn ($service) => [
                    'id' => (string) $service->id,
                    'name' => $service->service_name,
                    'basePrice' => 'от '.number_format((float) $service->min_price, 0, ',', ' ').' ₽',
                    'pricingType' => $service->price_type,
                    'description' => $service->description ?? '',
                    'isActive' => $service->is_active,
                ])
                ->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $vendor = $this->vendorFor($request);

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'phone')->ignore($request->user()->id),
                Rule::unique('vendors', 'phone')->ignore($vendor->id),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($request->user()->id),
                Rule::unique('vendors', 'email')->ignore($vendor->id),
            ],
            'districts' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:2000'],
            'logo' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($request, $vendor, $validated) {
            $cityName = trim($validated['city']);
            $city = City::firstOrCreate(
                ['name' => $cityName],
                ['is_active' => true],
            );

            $districtIds = collect(explode(',', $validated['districts']))
                ->map(fn (string $district) => trim($district))
                ->filter()
                ->unique()
                ->map(function (string $districtName) use ($city) {
                    return District::firstOrCreate(
                        ['city_id' => $city->id, 'name' => $districtName],
                        ['is_active' => true],
                    )->id;
                })
                ->values()
                ->all();

            $profileData = [
                'company_name' => $validated['company_name'],
                'description' => $validated['description'],
                'city' => $cityName,
                'phone' => $validated['phone'],
                'email' => Str::lower($validated['email']),
                'logo' => $validated['logo'] ?: null,
            ];

            $vendor->fill($profileData);

            if ($vendor->isDirty() && $vendor->status === 'approved') {
                $vendor->status = 'pending';
                $vendor->moderation_note = 'Профиль изменен и отправлен на повторную модерацию.';
                $vendor->moderated_at = null;
                $vendor->moderated_by = null;
            }

            $vendor->save();
            $vendor->districts()->sync($districtIds);

            $request->user()->update([
                'phone' => $validated['phone'],
                'email' => Str::lower($validated['email']),
            ]);
        });

        return back();
    }

    private function vendorFor(Request $request): Vendor
    {
        abort_unless($request->user()?->role === 'vendor', 403);

        return $request->user()->vendor()->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeProfile(Vendor $vendor): array
    {
        return [
            'companyName' => $vendor->company_name,
            'description' => $vendor->description ?? '',
            'phone' => $vendor->phone,
            'email' => $vendor->email,
            'city' => $vendor->city,
            'districts' => $vendor->districts->pluck('name')->values(),
            'moderationStatus' => $vendor->status,
            'moderationNote' => $vendor->moderation_note
                ?? match ($vendor->status) {
                    'approved' => 'Профиль подтвержден, карточка может показываться клиентам.',
                    'rejected' => 'Профиль отклонен. Проверьте комментарий администратора.',
                    default => 'Профиль отправлен на модерацию и пока не показывается клиентам.',
                },
            'logo' => $vendor->logo ?? Str::substr($vendor->company_name, 0, 2),
            'gallery' => [],
        ];
    }
}
