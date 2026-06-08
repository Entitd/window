<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'okna-market')->name('home');
Route::inertia('privacy-policy', 'privacy-policy')->name('privacy');
Route::inertia('user-agreement', 'user-agreement')->name('agreement');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
