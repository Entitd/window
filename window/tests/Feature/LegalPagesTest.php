<?php

use Inertia\Testing\AssertableInertia as Assert;

test('legal pages are public inertia pages', function (string $routeName, string $component) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'privacy policy' => ['privacy', 'privacy-policy'],
    'user agreement' => ['agreement', 'user-agreement'],
]);
