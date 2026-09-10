<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\District;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestStatusHistory;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ServiceCatalogSeeder::class);

        $city = City::updateOrCreate(
            ['name' => 'Волгоград'],
            ['is_active' => true],
        );

        $districts = collect([
            'Центральный',
            'Дзержинский',
            'Ворошиловский',
            'Краснооктябрьский',
        ])->mapWithKeys(fn (string $districtName) => [
            $districtName => District::updateOrCreate(
                [
                    'city_id' => $city->id,
                    'name' => $districtName,
                ],
                ['is_active' => true],
            ),
        ]);

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Администратор MVP',
                'phone' => '+79990000001',
                'role' => 'admin',
                'password' => Hash::make('password'),
            ],
        );

        $client = User::updateOrCreate(
            ['email' => 'client@example.com'],
            [
                'name' => 'Клиент MVP',
                'phone' => '+79990000002',
                'role' => 'client',
                'password' => Hash::make('password'),
            ],
        );

        $approvedVendorUser = User::updateOrCreate(
            ['email' => 'vendor.approved@example.com'],
            [
                'name' => 'ОкнаПрофи Волгоград',
                'phone' => '+79990000003',
                'role' => 'vendor',
                'password' => Hash::make('password'),
            ],
        );

        $pendingVendorUser = User::updateOrCreate(
            ['email' => 'vendor.pending@example.com'],
            [
                'name' => 'Теплый Дом',
                'phone' => '+79990000004',
                'role' => 'vendor',
                'password' => Hash::make('password'),
            ],
        );

        $approvedVendor = Vendor::updateOrCreate(
            ['user_id' => $approvedVendorUser->id],
            [
                'company_name' => 'ОкнаПрофи Волгоград',
                'description' => 'Монтаж, замена стеклопакетов и ремонт окон в квартирах и частных домах.',
                'city' => $city->name,
                'phone' => '+7 (8442) 45-10-10',
                'email' => $approvedVendorUser->email,
                'logo' => 'ОП',
                'status' => 'approved',
                'moderation_note' => 'Профиль подтвержден для ручного MVP-теста.',
                'moderated_at' => now(),
                'moderated_by' => $admin->id,
            ],
        );

        $pendingVendor = Vendor::updateOrCreate(
            ['user_id' => $pendingVendorUser->id],
            [
                'company_name' => 'Теплый Дом',
                'description' => 'Компания ожидает модерацию и не должна появляться в поиске до подтверждения.',
                'city' => $city->name,
                'phone' => '+7 (8442) 60-20-20',
                'email' => $pendingVendorUser->email,
                'logo' => 'ТД',
                'status' => 'pending',
                'moderation_note' => 'Ожидает проверки документов и активных услуг.',
                'moderated_at' => null,
                'moderated_by' => null,
            ],
        );

        $approvedVendor->districts()->sync([
            $districts['Центральный']->id,
            $districts['Дзержинский']->id,
            $districts['Ворошиловский']->id,
        ]);

        $pendingVendor->districts()->sync([
            $districts['Краснооктябрьский']->id,
        ]);

        $this->call(VendorServiceSeeder::class);

        $glassReplacement = Service::where('name', 'Замена стеклопакета')->firstOrFail();

        $request = ServiceRequest::updateOrCreate(
            [
                'client_id' => $client->id,
                'vendor_id' => $approvedVendor->id,
                'service_id' => $glassReplacement->id,
            ],
            [
                'calculation_id' => null,
                'city' => $city->name,
                'district' => 'Центральный',
                'installation_date' => now()->addDays(3)->toDateString(),
                'window_width' => 140,
                'window_height' => 150,
                'additional_services' => [
                    'Демонтаж старого стеклопакета',
                    'Доставка и подъем',
                ],
                'comment' => 'Тестовая заявка для проверки клиентского и vendor кабинетов.',
                'estimated_price' => 18400,
                'status' => 'confirmed',
            ],
        );

        ServiceRequestStatusHistory::updateOrCreate(
            [
                'service_request_id' => $request->id,
                'to_status' => 'new',
                'label' => 'Заявка создана',
            ],
            [
                'actor_id' => $client->id,
                'actor_role' => 'client',
                'from_status' => null,
                'note' => 'Тестовая заявка создана сидером.',
            ],
        );

        ServiceRequestStatusHistory::updateOrCreate(
            [
                'service_request_id' => $request->id,
                'to_status' => 'confirmed',
                'label' => 'Заявка принята',
            ],
            [
                'actor_id' => $approvedVendorUser->id,
                'actor_role' => 'vendor',
                'from_status' => 'new',
                'note' => 'Компания приняла тестовую заявку.',
            ],
        );
    }
}
