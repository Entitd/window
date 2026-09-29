<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterVendorController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50', Rule::unique(User::class, 'phone')],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class, 'email')],
            'city' => ['required', 'string', 'max:255'],
            'districts' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:2000'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'terms' => ['accepted'],
        ]);

        $vendor = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['contact_name'],
                'phone' => $validated['phone'],
                'email' => Str::lower($validated['email']),
                'role' => 'vendor',
                'password' => $validated['password'],
            ]);

            $cityName = trim($validated['city']);

            $city = City::firstOrCreate(
                ['name' => $cityName],
                ['is_active' => true],
            );

            $vendor = Vendor::create([
                'user_id' => $user->id,
                'company_name' => $validated['company_name'],
                'description' => $validated['description'],
                'city' => $cityName,
                'phone' => $validated['phone'],
                'email' => Str::lower($validated['email']),
                'status' => 'pending',
            ]);

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
                ->all();

            $vendor->districts()->sync($districtIds);

            return $vendor->load('user');
        });

        Auth::login($vendor->user);
        $request->session()->regenerate();

        return to_route('vendor.dashboard');
    }
}
