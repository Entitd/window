<?php

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceOption;
use App\Models\ServiceParameter;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorService;
use App\Models\VendorServiceRate;
use Inertia\Testing\AssertableInertia as Assert;

function catalogPayload(ServiceCategory $category): array
{
    return [
        'name' => 'Москитная сетка', 'description' => 'Изготовление сетки',
        'category_id' => $category->id, 'sort_order' => 0, 'is_active' => true,
        'options' => [
            ['name' => 'По площади', 'input_type' => 'dimensions', 'pricing_type' => 'sqm', 'is_active' => true],
            ['name' => 'За штуку', 'input_type' => 'selection', 'pricing_type' => 'unit', 'is_active' => true],
        ],
        'parameters' => [
            ['key' => 'color', 'name' => 'Цвет', 'type' => 'select', 'unit' => null, 'is_required' => true, 'is_active' => true, 'min_value' => null, 'max_value' => null, 'choices' => ['Белый', 'Серый']],
        ],
    ];
}

function bookingPayload(VendorServiceRate $rate): array
{
    return ['rate_id' => $rate->id, 'quantity' => 2, 'width_mm' => 1200, 'height_mm' => 1500, 'city' => 'Москва', 'parameters' => [], 'comment' => 'Проверка'];
}

test('only administrators can manage categories and services', function (string $role) {
    $user = User::factory()->create(['role' => $role]);
    $category = ServiceCategory::factory()->create();
    $service = Service::factory()->create();
    $this->actingAs($user)->get(route('admin.services.index'))->assertForbidden();
    $this->post(route('admin.categories.store'), ['name' => 'test'])->assertForbidden();
    $this->patch(route('admin.categories.update', $category), ['name' => 'test'])->assertForbidden();
    $this->post(route('admin.services.store'), catalogPayload($category))->assertForbidden();
    $this->patch(route('admin.services.update', $service), catalogPayload($category))->assertForbidden();
})->with(['client', 'vendor']);

test('administrator builds a category tree and service with parameters and multiple options', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin)->post(route('admin.categories.store'), ['name' => 'Окна', 'parent_id' => null, 'sort_order' => 0, 'is_active' => true])->assertSessionHasNoErrors();
    $parent = ServiceCategory::firstOrFail();
    $this->post(route('admin.categories.store'), ['name' => 'Сетки', 'parent_id' => $parent->id, 'sort_order' => 1, 'is_active' => true])->assertSessionHasNoErrors();
    $category = ServiceCategory::where('parent_id', $parent->id)->firstOrFail();
    $this->post(route('admin.services.store'), catalogPayload($category))->assertSessionHasNoErrors();
    $service = Service::with(['options', 'parameters'])->firstOrFail();
    expect($service->category_id)->toBe($category->id)->and($service->options)->toHaveCount(2)->and($service->parameters->first()->choices)->toBe(['Белый', 'Серый']);
    $this->get(route('admin.services.index'))->assertInertia(fn (Assert $page) => $page->component('admin/services')->has('services', 1)->has('categories', 2));
});

test('category cycles and incompatible square metre input are rejected', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $parent = ServiceCategory::factory()->create();
    $child = ServiceCategory::factory()->create(['parent_id' => $parent->id]);
    $this->actingAs($admin)->patch(route('admin.categories.update', $parent), ['name' => 'Parent', 'parent_id' => $child->id, 'sort_order' => 0, 'is_active' => true])->assertSessionHasErrors('parent_id');
    $payload = catalogPayload($parent);
    $payload['options'][0]['input_type'] = 'selection';
    $this->post(route('admin.services.store'), $payload)->assertSessionHasErrors('options.0.input_type');
});

test('service edits cannot steal options or change established parameter types', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $service = Service::factory()->create();
    $foreign = ServiceOption::factory()->create();
    $payload = catalogPayload($service->category);
    $payload['options'][0]['id'] = $foreign->id;
    $this->actingAs($admin)->patch(route('admin.services.update', $service), $payload)->assertSessionHasErrors('options.0.id');
    unset($payload['options'][0]['id']);
    $parameter = ServiceParameter::factory()->create(['service_id' => $service->id]);
    $payload['parameters'][0]['id'] = $parameter->id;
    $payload['parameters'][0]['type'] = 'text';
    $this->patch(route('admin.services.update', $service), $payload)->assertSessionHasErrors('parameters.0.type');
});

test('vendor selects multiple tariffs with a single default and cannot duplicate a service', function () {
    $vendor = Vendor::factory()->create();
    $service = Service::factory()->create();
    $sqm = ServiceOption::factory()->create(['service_id' => $service->id]);
    $unit = ServiceOption::factory()->create(['service_id' => $service->id, 'input_type' => 'selection', 'pricing_type' => 'unit']);
    $payload = ['service_id' => $service->id, 'warranty_months' => 24, 'is_active' => true, 'rates' => [
        ['service_option_id' => $sqm->id, 'price' => 1000, 'is_default' => true],
        ['service_option_id' => $unit->id, 'price' => 2500, 'is_default' => false],
    ]];
    $this->actingAs($vendor->user)->post(route('vendor.services.store'), $payload)->assertSessionHasNoErrors();
    $offering = $vendor->services()->firstOrFail();
    expect($offering->rates)->toHaveCount(2)->and($offering->service_id)->toBe($service->id)->and($offering->warranty_months)->toBe(24);
    $this->post(route('vendor.services.store'), $payload)->assertSessionHasErrors('service_id');
    $payload['warranty_months'] = 0;
    $this->patch(route('vendor.services.update', $offering), $payload)->assertSessionHasErrors('warranty_months');
    $payload['warranty_months'] = 121;
    $this->patch(route('vendor.services.update', $offering), $payload)->assertSessionHasErrors('warranty_months');
    $payload['warranty_months'] = 24;
    $payload['rates'][1]['is_default'] = true;
    $this->patch(route('vendor.services.update', $offering), $payload)->assertSessionHasErrors('rates');
    $this->get(route('vendor.services'))->assertInertia(fn (Assert $p) => $p->component('vendor/services')->has('catalog', 1)->has('services.0.rates', 2)->where('services.0.warranty_months', 24));
});

test('vendor cannot select foreign options or edit another vendor offering', function () {
    $rate = VendorServiceRate::factory()->create();
    $offering = $rate->vendorService;
    $foreign = ServiceOption::factory()->create();
    $payload = ['service_id' => $offering->service_id, 'warranty_months' => 12, 'is_active' => true, 'rates' => [['service_option_id' => $foreign->id, 'price' => 500, 'is_default' => true]]];
    $this->actingAs($offering->vendor->user)->patch(route('vendor.services.update', $offering), $payload)->assertSessionHasErrors('rates.0.service_option_id');
    $other = Vendor::factory()->create();
    $this->actingAs($other->user)->patch(route('vendor.services.update', $offering), $payload)->assertForbidden();
    $this->patch(route('vendor.services.toggle', $offering))->assertForbidden();
    $this->delete(route('vendor.services.destroy', $offering))->assertForbidden();
});

test('legacy offering can be explicitly mapped without losing its identity', function () {
    $vendor = Vendor::factory()->create();
    $legacy = VendorService::factory()->create(['vendor_id' => $vendor->id, 'service_id' => null, 'service_name' => 'Произвольное старое имя']);
    $option = ServiceOption::factory()->create();
    $this->actingAs($vendor->user)->patch(route('vendor.services.update', $legacy), [
        'service_id' => $option->service_id, 'warranty_months' => 12, 'is_active' => true,
        'rates' => [['service_option_id' => $option->id, 'price' => 1234, 'is_default' => true]],
    ])->assertSessionHasNoErrors();
    expect($legacy->fresh()->service_id)->toBe($option->service_id)->and($legacy->fresh()->service_name)->toBe($option->service->name);
});

test('archived ancestor hides offers and prevents booking and vendor selection', function () {
    $rate = VendorServiceRate::factory()->create();
    $service = $rate->vendorService->catalogService;
    $ancestor = ServiceCategory::factory()->create(['is_active' => false]);
    $service->category->update(['parent_id' => $ancestor->id]);
    $this->get(route('catalog.index'))->assertInertia(fn (Assert $p) => $p->component('catalog')->has('services', 0)->has('offerings', 0));
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), bookingPayload($rate))->assertSessionHasErrors('rate_id');
    $this->actingAs($rate->vendorService->vendor->user)->patch(route('vendor.services.update', $rate->vendorService), [
        'service_id' => $service->id, 'warranty_months' => 12, 'is_active' => true, 'rates' => [['service_option_id' => $rate->service_option_id, 'price' => 100, 'is_default' => true]],
    ])->assertSessionHasErrors('service_id');
});

test('booking calculates area on server and stores typed EAV snapshots and chat atomically', function () {
    $rate = VendorServiceRate::factory()->create();
    $service = $rate->vendorService->catalogService;
    ServiceParameter::factory()->create(['service_id' => $service->id]);
    ServiceParameter::factory()->create(['service_id' => $service->id, 'key' => 'count', 'name' => 'Камер', 'type' => 'number', 'min_value' => 1, 'max_value' => 5]);
    ServiceParameter::factory()->create(['service_id' => $service->id, 'key' => 'delivery', 'name' => 'Доставка', 'type' => 'boolean']);
    $payload = bookingPayload($rate);
    $payload['parameters'] = ['color' => 'Белый', 'count' => 3, 'delivery' => false];
    $payload['estimated_price'] = 1;
    $client = User::factory()->create(['role' => 'client']);
    $this->actingAs($client)->post(route('catalog.store'), $payload)->assertSessionHasNoErrors();
    $request = ServiceRequest::with('items.values')->firstOrFail();
    expect($request->estimated_price)->toBe('3600.00')->and($request->items)->toHaveCount(1)->and($request->items->first()->values)->toHaveCount(3)->and($request->chat()->exists())->toBeTrue()->and($request->statusHistories()->count())->toBe(1);
    $item = $request->items->first();
    expect($item->values->firstWhere('type', 'number')->number_value)->toBe('3.0000')->and($item->values->firstWhere('type', 'boolean')->boolean_value)->toBeFalse();
    $name = $item->service_name;
    $service->update(['name' => 'Переименовано', 'is_active' => false]);
    $rate->update(['price' => 9999]);
    $this->get(route('client.requests.show', $request))->assertInertia(fn (Assert $p) => $p->where('request.service', $name)->where('request.items.0.total_price', '3600.00')->where('request.dimensionUnit', 'мм'));
    $this->actingAs($rate->vendorService->vendor->user)->get(route('vendor.requests'))->assertInertia(fn (Assert $p) => $p->has('requests.0.items.0.values', 3));
});

test('booking validates dynamic attribute types ranges and unknown fields', function (array $parameters, string $error) {
    $rate = VendorServiceRate::factory()->create();
    ServiceParameter::factory()->create(['service_id' => $rate->vendorService->service_id]);
    ServiceParameter::factory()->create(['service_id' => $rate->vendorService->service_id, 'key' => 'number', 'type' => 'number', 'min_value' => 1, 'max_value' => 5]);
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), [...bookingPayload($rate), 'parameters' => $parameters])->assertSessionHasErrors($error);
    expect(ServiceRequest::count())->toBe(0);
})->with([
    'required' => [[], 'parameters.color'],
    'invalid choice' => [['color' => 'Зелёный', 'number' => 2], 'parameters.color'],
    'range' => [['color' => 'Белый', 'number' => 6], 'parameters.number'],
    'wrong type' => [['color' => 'Белый', 'number' => 'abc'], 'parameters.number'],
    'unknown' => [['color' => 'Белый', 'number' => 2, 'injected' => 1], 'parameters'],
]);

test('selection needs no dimensions and formulas remain independent', function (string $pricing, ?string $price, ?string $expected) {
    $rate = VendorServiceRate::factory()->create(['price' => $price]);
    $rate->option->update(['input_type' => 'selection', 'pricing_type' => $pricing]);
    $payload = bookingPayload($rate);
    $payload['width_mm'] = '';
    $payload['height_mm'] = '';
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), $payload)->assertSessionHasNoErrors();
    $request = ServiceRequest::firstOrFail();
    expect($request->estimated_price)->toBe($expected)->and($request->items->first()->width_mm)->toBeNull();
})->with([
    'fixed' => ['fixed', '500.00', '500.00'],
    'unit' => ['unit', '500.00', '1000.00'],
    'quote' => ['quote', null, null],
]);

test('archived option cannot be booked or changed after vendor selection', function () {
    $rate = VendorServiceRate::factory()->create();
    $service = $rate->vendorService->catalogService;
    $payload = catalogPayload($service->category);
    $payload['options'][0]['id'] = $rate->service_option_id;
    $payload['options'][0]['pricing_type'] = 'fixed';
    $this->actingAs(User::factory()->create(['role' => 'admin']))->patch(route('admin.services.update', $service), $payload)->assertSessionHasErrors('options.0.pricing_type');
    $rate->option->update(['is_active' => false]);
    $this->actingAs(User::factory()->create(['role' => 'client']))->post(route('catalog.store'), bookingPayload($rate))->assertSessionHasErrors('rate_id');
    expect(ServiceRequest::count())->toBe(0);
});

test('service editing preserves option identities and archives omitted definitions', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = ServiceCategory::factory()->create();
    $payload = catalogPayload($category);
    $this->actingAs($admin)->post(route('admin.services.store'), $payload)->assertSessionHasNoErrors();
    $service = Service::with(['options', 'parameters'])->firstOrFail();
    $keep = $service->options->first();
    $removed = $service->options->last();
    $payload['options'] = [[...$payload['options'][0], 'id' => $keep->id, 'name' => 'Новое имя варианта']];
    $payload['parameters'] = [];
    $this->patch(route('admin.services.update', $service), $payload)->assertSessionHasNoErrors();
    $this->patch(route('admin.services.update', $service), $payload)->assertSessionHasNoErrors();
    expect($service->options()->count())->toBe(2)->and($keep->fresh()->name)->toBe('Новое имя варианта')->and($removed->fresh()->is_active)->toBeFalse()->and($service->parameters()->first()->is_active)->toBeFalse();
});

test('legacy search links catalog offers by ID and excludes archived services', function () {
    $rate = VendorServiceRate::factory()->create();
    $service = $rate->vendorService->catalogService;
    $this->get(route('search-results'))->assertInertia(fn (Assert $p) => $p->has('companies', 1)->where('companies.0.catalogServiceId', $service->id)->where('companies.0.catalogRateId', $rate->id));
    $service->category->update(['is_active' => false]);
    $this->get(route('search-results'))->assertInertia(fn (Assert $p) => $p->has('companies', 0));
});

test('dimensions and company availability are validated before booking', function () {
    $rate = VendorServiceRate::factory()->create();
    $client = User::factory()->create(['role' => 'client']);
    $payload = bookingPayload($rate);
    unset($payload['width_mm']);
    $this->actingAs($client)->post(route('catalog.store'), $payload)->assertSessionHasErrors('width_mm');
    $this->post(route('catalog.store'), [...bookingPayload($rate), 'city' => 'Другой город'])->assertSessionHasErrors('city');
    $rate->vendorService->vendor->update(['status' => 'pending']);
    $this->post(route('catalog.store'), bookingPayload($rate))->assertSessionHasErrors('rate_id');
    expect(ServiceRequest::count())->toBe(0);
});

test('catalog request cannot be repriced through the legacy edit or repeat endpoints', function () {
    $rate = VendorServiceRate::factory()->create();
    $client = User::factory()->create(['role' => 'client']);
    $this->actingAs($client)->post(route('catalog.store'), bookingPayload($rate))->assertSessionHasNoErrors();
    $request = ServiceRequest::firstOrFail();
    $this->patch(route('client.requests.update', $request), ['window_width' => 1, 'estimated_price' => 1])->assertSessionHasErrors('request');
    $this->post(route('client.requests.repeat', $request))->assertRedirect(route('catalog.index', ['service_id' => $request->service_id]));
    expect($request->fresh()->estimated_price)->toBe('3600.00')->and(ServiceRequest::count())->toBe(1);
});

test('a quote tariff clears price and a priced option requires a price', function () {
    $vendor = Vendor::factory()->create();
    $option = ServiceOption::factory()->create(['pricing_type' => 'quote', 'input_type' => 'selection']);
    $payload = ['service_id' => $option->service_id, 'warranty_months' => 12, 'is_active' => true, 'rates' => [['service_option_id' => $option->id, 'price' => 1234, 'is_default' => true]]];
    $this->actingAs($vendor->user)->post(route('vendor.services.store'), $payload)->assertSessionHasNoErrors();
    $offering = $vendor->services()->firstOrFail();
    expect($offering->rates->first()->price)->toBeNull();
    $priced = ServiceOption::factory()->create(['service_id' => $option->service_id]);
    $payload['rates'] = [['service_option_id' => $priced->id, 'price' => null, 'is_default' => true]];
    $this->patch(route('vendor.services.update', $offering), $payload)->assertSessionHasErrors('rates.0.price');
});
