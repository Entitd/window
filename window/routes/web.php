<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::inertia('/', 'okna-market')->name('home');
Route::get('pages', function () {
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
Route::inertia('search-results', 'search-results')->name('search-results');
Route::inertia('vendors', 'vendors')->name('vendors');
Route::inertia('faq', 'faq')->name('faq');
Route::inertia('contacts', 'contacts')->name('contacts');
Route::inertia('register/client', 'auth/register-client')->name('register.client');
Route::inertia('register/vendor', 'auth/register-vendor')->name('register.vendor');
Route::inertia('privacy-policy', 'privacy-policy')->name('privacy');
Route::inertia('user-agreement', 'user-agreement')->name('agreement');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('client/dashboard', 'client/dashboard')->name('client.dashboard');
});

require __DIR__.'/settings.php';
