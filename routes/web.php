<?php

use App\Http\Controllers\Auth\RegisterClientController;
use App\Http\Controllers\Auth\RegisterVendorController;
use App\Http\Controllers\AdminVendorModerationController;
use App\Http\Controllers\ClientRequestController;
use App\Http\Controllers\SearchResultsController;
use App\Http\Controllers\VendorDashboardController;
use App\Http\Controllers\VendorProfileController;
use App\Http\Controllers\VendorRequestController;
use App\Http\Controllers\VendorServiceController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::inertia('/', 'okna-market')->name('home');
Route::get('pages', function () {
    abort_unless(app()->environment(['local', 'testing']), 404);

    $pages = collect(Route::getRoutes())
        ->filter(function ($route) {
            $methods = $route->methods();
            $hasOnlyGetAndHead = count(array_diff($methods, ['GET', 'HEAD'])) === 0;
            $isNamed = filled($route->getName());
            $isInternal = Str::startsWith($route->uri(), ['_boost/', 'storage/', 'up']);

            return $hasOnlyGetAndHead && $isNamed && ! $isInternal;
        })
        ->map(function ($route) {
            $component = $route->defaults['component'] ?? null;
            $action = $route->getActionName();
            $uri = $route->uri();
            $href = $uri === '/' ? '/' : '/'.ltrim($uri, '/');
            $requiresAuth = collect($route->middleware())->contains(fn ($middleware) => Str::startsWith($middleware, 'auth'));
            $status = $component === 'dashboard'
                ? 'placeholder'
                : ($component ? 'ready' : 'controller');

            return [
                'title' => $component
                    ? Str::of($component)
                        ->afterLast('/')
                        ->replace(['-', '_'], ' ')
                        ->title()
                        ->value()
                    : Str::of($route->getName())
                        ->replace(['.', '-'], ' ')
                        ->title()
                        ->value(),
                'href' => $href,
                'uri' => $uri,
                'routeName' => $route->getName(),
                'component' => $component,
                'action' => $action,
                'access' => $requiresAuth ? 'auth' : 'public',
                'status' => $status,
                'middleware' => array_values($route->middleware()),
            ];
        })
        ->sortBy(['access', 'uri'])
        ->values();

    return Inertia::render('pages-index', [
        'pages' => $pages,
    ]);
})->name('pages.index');
Route::get('search-results', [SearchResultsController::class, 'index'])->name('search-results');
Route::inertia('vendors', 'vendors')->name('vendors');
Route::inertia('faq', 'faq')->name('faq');
Route::inertia('contacts', 'contacts')->name('contacts');
Route::inertia('register/client', 'auth/register-client')->name('register.client');
Route::inertia('register/vendor', 'auth/register-vendor')->name('register.vendor');
Route::post('register/client', RegisterClientController::class)->name('register.client.store');
Route::post('register/vendor', RegisterVendorController::class)->name('register.vendor.store');
Route::inertia('privacy-policy', 'privacy-policy')->name('privacy');
Route::inertia('user-agreement', 'user-agreement')->name('agreement');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return match (auth()->user()?->role) {
            'admin' => redirect()->route('admin.vendors.moderation'),
            'vendor' => redirect()->route('vendor.dashboard'),
            'client' => redirect()->route('client.dashboard'),
            default => Inertia::render('dashboard'),
        };
    })->name('dashboard');

    Route::middleware('role:admin')->group(function () {
        Route::get('admin/vendors/moderation', [AdminVendorModerationController::class, 'index'])
            ->name('admin.vendors.moderation');
        Route::patch('admin/vendors/{vendor}/approve', [AdminVendorModerationController::class, 'approve'])
            ->name('admin.vendors.approve');
        Route::patch('admin/vendors/{vendor}/reject', [AdminVendorModerationController::class, 'reject'])
            ->name('admin.vendors.reject');
    });

    Route::middleware('role:client')->group(function () {
        Route::get('client/dashboard', [ClientRequestController::class, 'index'])->name('client.dashboard');
        Route::post('client/requests', [ClientRequestController::class, 'store'])->name('client.requests.store');
        Route::get('client/requests/{requestId}', [ClientRequestController::class, 'show'])->name('client.requests.show');
        Route::patch('client/requests/{serviceRequest}', [ClientRequestController::class, 'update'])
            ->name('client.requests.update');
        Route::post('client/requests/{serviceRequest}/repeat', [ClientRequestController::class, 'repeat'])
            ->name('client.requests.repeat');
        Route::patch('client/requests/{serviceRequest}/cancel', [ClientRequestController::class, 'cancel'])
            ->name('client.requests.cancel');
    });

    Route::middleware('role:vendor')->group(function () {
        Route::get('vendor/dashboard', [VendorDashboardController::class, 'index'])->name('vendor.dashboard');
        Route::get('vendor/profile', [VendorProfileController::class, 'edit'])->name('vendor.profile');
        Route::patch('vendor/profile', [VendorProfileController::class, 'update'])
            ->name('vendor.profile.update');
        Route::get('vendor/services', [VendorServiceController::class, 'index'])->name('vendor.services');
        Route::post('vendor/services', [VendorServiceController::class, 'store'])->name('vendor.services.store');
        Route::patch('vendor/services/{service}', [VendorServiceController::class, 'update'])->name('vendor.services.update');
        Route::patch('vendor/services/{service}/toggle', [VendorServiceController::class, 'toggle'])->name('vendor.services.toggle');
        Route::delete('vendor/services/{service}', [VendorServiceController::class, 'destroy'])->name('vendor.services.destroy');
        Route::get('vendor/requests', [VendorRequestController::class, 'index'])->name('vendor.requests');
        Route::patch('vendor/requests/{serviceRequest}/accept', [VendorRequestController::class, 'accept'])
            ->name('vendor.requests.accept');
        Route::patch('vendor/requests/{serviceRequest}/reject', [VendorRequestController::class, 'reject'])
            ->name('vendor.requests.reject');
        Route::patch('vendor/requests/{serviceRequest}/start', [VendorRequestController::class, 'start'])
            ->name('vendor.requests.start');
        Route::patch('vendor/requests/{serviceRequest}/complete', [VendorRequestController::class, 'complete'])
            ->name('vendor.requests.complete');
    });
});

require __DIR__.'/settings.php';
